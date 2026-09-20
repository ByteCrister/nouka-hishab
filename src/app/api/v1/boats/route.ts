import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boats, boatImages } from "@/db/boat";
import { files, assets } from "@/db/media";
import { sandTrips } from "@/db/sand";
import { eq, and, or, ilike, isNull, desc, asc, sql, count, sum } from "drizzle-orm";
import { requireAuthUserId } from "@/lib/auth/utils";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import {
    BoatListResponse,
    BoatListItem,
    BoatListKpis
} from "@/types/boats.types";
import { BOAT_STATUSES } from "@/constants/boats.const";
import { SECTORS } from "@/constants/db/app.const";
import { getPaginationMeta } from "@/lib/helpers/pagination.helper";
import { buildFuzzySearchPattern } from "@/lib/helpers/sanitize";
import { createBoatSchema } from "@/utils/zod/boats.schema";

const getBoatsSchema = z.object({
    search: z.string().optional().default(""),
    sector: z.enum([SECTORS.SAND]).optional().default(SECTORS.SAND),
    status: z.enum([BOAT_STATUSES.ACTIVE, BOAT_STATUSES.MAINTENANCE, BOAT_STATUSES.INACTIVE, "all"]).optional().default("all"),
    sortBy: z.enum(["name", "createdAt", "capacityValue", "status"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
});



export const GET = withErrorHandler<BoatListResponse, [NextRequest]>(async (req) => {
    const userId = await requireAuthUserId();

    const { searchParams } = new URL(req.url);
    const query = getBoatsSchema.parse(Object.fromEntries(searchParams));

    const offset = (query.page - 1) * query.limit;

    const baseConditions = [
        isNull(boats.deletedAt),
        eq(boats.createdBy, userId),
    ];

    if (query.sector !== SECTORS.SAND) {
        baseConditions.push(eq(boats.sector, query.sector));
    }

    if (query.search) {
        const fuzzySearch = buildFuzzySearchPattern(query.search);
        baseConditions.push(
            or(
                ilike(boats.name, fuzzySearch),
                ilike(boats.registrationNumber, fuzzySearch),
                ilike(boats.notes, fuzzySearch)
            )!
        );
    }

    if (query.status && query.status !== 'all') {
        const boatStatus = query.status as typeof BOAT_STATUSES[keyof typeof BOAT_STATUSES];
        baseConditions.push(eq(boats.status, boatStatus));
    }



    const whereClause = and(...baseConditions);

    const sortColumn = query.sortBy === 'name' ? boats.name :
                       query.sortBy === 'capacityValue' ? boats.capacityValue :
                       query.sortBy === 'status' ? boats.status : 
                       boats.createdAt;
    const orderByClause = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Run queries in parallel
    const [kpiResult, countResult, itemsResult] = await Promise.all([
        db
            .select({
                totalBoats: count(),
                activeBoats: sum(sql`CASE WHEN ${boats.status} = ${BOAT_STATUSES.ACTIVE} THEN 1 ELSE 0 END`).mapWith(Number),
                maintenanceBoats: sum(sql`CASE WHEN ${boats.status} = ${BOAT_STATUSES.MAINTENANCE} THEN 1 ELSE 0 END`).mapWith(Number),
                inactiveBoats: sum(sql`CASE WHEN ${boats.status} = ${BOAT_STATUSES.INACTIVE} THEN 1 ELSE 0 END`).mapWith(Number),
                totalFleetCapacity: sum(boats.capacityValue).mapWith(Number),
                totalFleetValueTk: sum(boats.boatValueTk).mapWith(Number),
            })
            .from(boats)
            .where(whereClause),

        db
            .select({ count: count() })
            .from(boats)
            .where(whereClause),

        db
            .select({
                id: boats.id,
                publicId: boats.publicId,
                sector: boats.sector,
                name: boats.name,
                capacityValue: boats.capacityValue,
                capacityUnit: boats.capacityUnit,
                status: boats.status,
                primaryImageUrl: assets.cloudinaryUrl,
                totalTrips: sql<number>`(SELECT COUNT(*)::int FROM ${sandTrips} WHERE ${sandTrips.boatId} = ${boats.id} AND ${sandTrips.deletedAt} IS NULL)`,
                lastTripAt: sql<string | null>`(SELECT MAX(${sandTrips.departureTime}) FROM ${sandTrips} WHERE ${sandTrips.boatId} = ${boats.id} AND ${sandTrips.deletedAt} IS NULL)`
            })
            .from(boats)
            .leftJoin(boatImages, and(
                eq(boatImages.boatId, boats.id),
                eq(boatImages.isPrimary, true),
                isNull(boatImages.deletedAt)
            ))
            .leftJoin(files, eq(boatImages.fileId, files.id))
            .leftJoin(assets, eq(files.assetId, assets.id))
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(query.limit)
            .offset(offset)
    ]);

    const totalCount = countResult[0]?.count || 0;
    const kpis: BoatListKpis = {
        totalBoats: kpiResult[0]?.totalBoats || 0,
        activeBoats: kpiResult[0]?.activeBoats || 0,
        maintenanceBoats: kpiResult[0]?.maintenanceBoats || 0,
        inactiveBoats: kpiResult[0]?.inactiveBoats || 0,
        totalFleetCapacity: kpiResult[0]?.totalFleetCapacity || 0,
        totalFleetValueTk: kpiResult[0]?.totalFleetValueTk || 0,
    };

    const items: BoatListItem[] = itemsResult.map(item => ({
        id: item.id,
        publicId: item.publicId,
        sector: item.sector as typeof SECTORS[keyof typeof SECTORS],
        name: item.name,
        capacityValue: item.capacityValue ? Number(item.capacityValue) : null,
        capacityUnit: item.capacityUnit,
        status: item.status,
        primaryImageUrl: item.primaryImageUrl || null,
        totalTrips: item.totalTrips || 0,
        lastTripAt: item.lastTripAt ? new Date(item.lastTripAt).toISOString() : null,
    }));

    return {
        data: {
            items,
            meta: getPaginationMeta(totalCount, query.page, query.limit),
            kpis,
        }
    };
});

export const POST = withErrorHandler<unknown, [NextRequest]>(async (req) => {
    const userId = await requireAuthUserId();

    const body = await req.json();
    const payload = createBoatSchema.parse(body);

    const [newBoat] = await db
        .insert(boats)
        .values({
            name: payload.name,
            sector: payload.sector,
            capacityValue: payload.capacityValue ? String(payload.capacityValue) : null,
            capacityUnit: payload.capacityUnit || undefined,
            status: payload.status || BOAT_STATUSES.ACTIVE,
            notes: payload.notes || null,
            createdBy: userId,
        })
        .returning();

    return {
        data: newBoat,
        status: 201
    };
});


