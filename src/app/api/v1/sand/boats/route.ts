import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boats, boatImages } from "@/db/boat";
import { sectors } from "@/db/app";
import { files, assets } from "@/db/media";
import { sandTrips } from "@/db/sand";
import { eq, and, or, ilike, isNull, desc, asc, sql, count, sum } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import {
    BoatListResponse,
    BoatListItem,
    BoatListKpis
} from "@/types/sand/boats.types";
import { BOAT_STATUSES, BOAT_CAPACITY_UNITS } from "@/constants/db/boats.const";
import { getPaginationMeta } from "@/lib/helpers/pagination.helper";

const getBoatsSchema = z.object({
    search: z.string().optional().default(""),
    status: z.enum([BOAT_STATUSES.ACTIVE, BOAT_STATUSES.MAINTENANCE, BOAT_STATUSES.INACTIVE, "all"]).optional().default("all"),
    sectorId: z.coerce.number().nullable().optional().default(null),
    sortBy: z.enum(["name", "createdAt", "capacityValue", "status"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
});

const createBoatSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    sectorId: z.number().int().positive(),
    capacityValue: z.number().positive().nullable().optional(),
    capacityUnit: z.enum([BOAT_CAPACITY_UNITS.CUBIC_FT, BOAT_CAPACITY_UNITS.TON]).nullable().optional(),
    status: z.enum([BOAT_STATUSES.ACTIVE, BOAT_STATUSES.MAINTENANCE, BOAT_STATUSES.INACTIVE]).optional(),
    notes: z.string().nullable().optional(),
});

export const GET = withErrorHandler<BoatListResponse, [NextRequest]>(async (req) => {
    await requireAuthPublicId();

    const { searchParams } = new URL(req.url);
    const query = getBoatsSchema.parse(Object.fromEntries(searchParams));

    const offset = (query.page - 1) * query.limit;

    const baseConditions = [
        isNull(boats.deletedAt),
        eq(sectors.slug, 'sand')
    ];

    if (query.search) {
        baseConditions.push(
            or(
                ilike(boats.name, `%${query.search}%`),
                ilike(boats.registrationNumber, `%${query.search}%`)
            )!
        );
    }

    if (query.status && query.status !== 'all') {
        const boatStatus = query.status as typeof BOAT_STATUSES[keyof typeof BOAT_STATUSES];
        baseConditions.push(eq(boats.status, boatStatus));
    }

    if (query.sectorId) {
        baseConditions.push(eq(boats.sectorId, query.sectorId));
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
            .innerJoin(sectors, eq(boats.sectorId, sectors.id))
            .where(whereClause),

        db
            .select({ count: count() })
            .from(boats)
            .innerJoin(sectors, eq(boats.sectorId, sectors.id))
            .where(whereClause),

        db
            .select({
                id: boats.id,
                publicId: boats.publicId,
                name: boats.name,
                sectorId: boats.sectorId,
                sectorName: sectors.nameEn,
                capacityValue: boats.capacityValue,
                capacityUnit: boats.capacityUnit,
                status: boats.status,
                primaryImageUrl: assets.cloudinaryUrl,
                totalTrips: sql<number>`(SELECT COUNT(*)::int FROM ${sandTrips} WHERE ${sandTrips.boatId} = ${boats.id} AND ${sandTrips.deletedAt} IS NULL)`,
                lastTripAt: sql<string | null>`(SELECT MAX(${sandTrips.departureTime}) FROM ${sandTrips} WHERE ${sandTrips.boatId} = ${boats.id} AND ${sandTrips.deletedAt} IS NULL)`
            })
            .from(boats)
            .innerJoin(sectors, eq(boats.sectorId, sectors.id))
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
        name: item.name,
        sectorId: item.sectorId,
        sectorName: item.sectorName || null,
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
    await requireAuthPublicId();

    const body = await req.json();
    const payload = createBoatSchema.parse(body);

    const [newBoat] = await db
        .insert(boats)
        .values({
            name: payload.name,
            sectorId: payload.sectorId,
            capacityValue: payload.capacityValue ? String(payload.capacityValue) : null,
            capacityUnit: payload.capacityUnit || undefined,
            status: payload.status || BOAT_STATUSES.ACTIVE,
            notes: payload.notes || null,
        })
        .returning();

    return {
        data: newBoat,
        status: 201
    };
});
