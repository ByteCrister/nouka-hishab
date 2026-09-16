import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boats } from "@/db/boat";
import { sandTrips } from "@/db/sand";
import { locations } from "@/db/app";
import { eq, and, or, ilike, isNull, desc, asc, count, gte, lte } from "drizzle-orm";
import { requireAuthUserId } from "@/lib/auth/utils";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import {
    BoatTripsResponse,
    BoatTripListItem
} from "@/types/boats.types";
import { SAND_TRIP_STATUSES } from "@/constants/db/sand.const";
import { getPaginationMeta } from "@/lib/helpers/pagination.helper";
import { alias } from "drizzle-orm/pg-core";

const getTripsSchema = z.object({
    status: z.enum([SAND_TRIP_STATUSES.SCHEDULED, SAND_TRIP_STATUSES.LOADING, SAND_TRIP_STATUSES.IN_TRANSIT, SAND_TRIP_STATUSES.COMPLETED, "all"]).optional().default("all"),
    search: z.string().optional().default(""),
    fromDate: z.string().nullable().optional().default(null),
    toDate: z.string().nullable().optional().default(null),
    sortBy: z.enum(["departureTime", "netProfitTk", "saleAmountTk"]).optional().default("departureTime"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const GET = withErrorHandler<BoatTripsResponse, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    const userId = await requireAuthUserId();

    const { publicId } = await params;

    const { searchParams } = new URL(req.url);
    const query = getTripsSchema.parse(Object.fromEntries(searchParams));

    const offset = (query.page - 1) * query.limit;

    // Find the boat and verify ownership in one step
    const boatResult = await db
        .select({ id: boats.id })
        .from(boats)
        .where(and(eq(boats.publicId, publicId), isNull(boats.deletedAt), eq(boats.createdBy, userId)))
        .limit(1);

    if (!boatResult.length) {
        throw new ApiError("Boat not found", 404);
    }
    const boatId = boatResult[0].id;

    const sourceLocations = alias(locations, 'sourceLocations');
    const destLocations = alias(locations, 'destLocations');

    const baseConditions = [
        eq(sandTrips.boatId, boatId),
        isNull(sandTrips.deletedAt)
    ];

    if (query.status && query.status !== 'all') {
        const tripStatus = query.status as typeof SAND_TRIP_STATUSES[keyof typeof SAND_TRIP_STATUSES];
        baseConditions.push(eq(sandTrips.status, tripStatus));
    }

    if (query.search) {
        baseConditions.push(
            or(
                ilike(sourceLocations.name, `%${query.search}%`),
                ilike(destLocations.name, `%${query.search}%`)
            )!
        );
    }

    if (query.fromDate) {
        baseConditions.push(gte(sandTrips.departureTime, new Date(query.fromDate)));
    }

    if (query.toDate) {
        // toDate is inclusive of the end of the day, assuming query.toDate is yyyy-mm-dd
        const toDateObj = new Date(query.toDate);
        toDateObj.setHours(23, 59, 59, 999);
        baseConditions.push(lte(sandTrips.departureTime, toDateObj));
    }

    const whereClause = and(...baseConditions);

    const sortColumn = query.sortBy === 'netProfitTk' ? sandTrips.netProfitTk :
                       query.sortBy === 'saleAmountTk' ? sandTrips.saleAmountTk :
                       sandTrips.departureTime;
    const orderByClause = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const [countResult, itemsResult] = await Promise.all([
        db
            .select({ count: count() })
            .from(sandTrips)
            .leftJoin(sourceLocations, eq(sandTrips.sourceLocationId, sourceLocations.id))
            .leftJoin(destLocations, eq(sandTrips.destLocationId, destLocations.id))
            .where(whereClause),

        db
            .select({
                id: sandTrips.id,
                publicId: sandTrips.publicId,
                boatId: sandTrips.boatId,
                sourceLocationName: sourceLocations.name,
                destLocationName: destLocations.name,
                departureTime: sandTrips.departureTime,
                arrivalTime: sandTrips.arrivalTime,
                cargoValue: sandTrips.cargoValue,
                cargoUnit: sandTrips.cargoUnit,
                saleAmountTk: sandTrips.saleAmountTk,
                netProfitTk: sandTrips.netProfitTk,
                status: sandTrips.status,
            })
            .from(sandTrips)
            .leftJoin(sourceLocations, eq(sandTrips.sourceLocationId, sourceLocations.id))
            .leftJoin(destLocations, eq(sandTrips.destLocationId, destLocations.id))
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(query.limit)
            .offset(offset)
    ]);

    const totalCount = countResult[0]?.count || 0;

    const items: BoatTripListItem[] = itemsResult.map(item => ({
        id: item.id,
        publicId: item.publicId,
        boatId: item.boatId,
        sourceLocationName: item.sourceLocationName || null,
        destLocationName: item.destLocationName || null,
        departureTime: item.departureTime.toISOString(),
        arrivalTime: item.arrivalTime ? item.arrivalTime.toISOString() : null,
        cargoValue: item.cargoValue ? Number(item.cargoValue) : null,
        cargoUnit: item.cargoUnit,
        saleAmountTk: item.saleAmountTk ? Number(item.saleAmountTk) : null,
        netProfitTk: item.netProfitTk ? Number(item.netProfitTk) : null,
        status: item.status,
    }));

    return {
        data: {
            items,
            meta: getPaginationMeta(totalCount, query.page, query.limit),
        }
    };
});
