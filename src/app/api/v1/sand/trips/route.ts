import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boats } from "@/db/boat";
import { sandTrips } from "@/db/sand";
import { eq, and, isNull, desc, asc, sql, count, gte, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { locations, users } from "@/db/app";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { SandTripListResponse } from "@/types/sand/trips.types";
import { SAND_TRIP_STATUSES } from "@/constants/db/sand.const";
import { getPaginationMeta } from "@/lib/helpers/pagination.helper";
import { createSandTripSchema } from "@/utils/zod/sand-trips.schema";

const getSandTripsSchema = z.object({
  search: z.string().optional().default(""),
  status: z.enum([
    SAND_TRIP_STATUSES.SCHEDULED,
    SAND_TRIP_STATUSES.LOADING,
    SAND_TRIP_STATUSES.IN_TRANSIT,
    SAND_TRIP_STATUSES.COMPLETED,
    SAND_TRIP_STATUSES.CANCELLED,
    "all"
  ]).optional().default("all"),
  boatPublicId: z.string().optional().nullable(),
  fromDate: z.string().optional().nullable(),
  toDate: z.string().optional().nullable(),
  sortBy: z.enum(["departureTime", "createdAt", "netProfitTk", "saleAmountTk"]).optional().default("departureTime"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const GET = withErrorHandler<SandTripListResponse, [NextRequest]>(async (req): Promise<HandlerResult<SandTripListResponse>> => {
  const userPublicId = await requireAuthPublicId();
  
  const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
  if (!userRecord) throw new Error("User not found");

  const { searchParams } = new URL(req.url);
  const query = getSandTripsSchema.parse(Object.fromEntries(searchParams));

  const offset = (query.page - 1) * query.limit;

  const baseConditions = [
    isNull(sandTrips.deletedAt),
    eq(boats.createdBy, userRecord.id)
  ];

  if (query.status && query.status !== 'all') {
    const tripStatus = query.status as typeof SAND_TRIP_STATUSES[keyof typeof SAND_TRIP_STATUSES];
    baseConditions.push(eq(sandTrips.status, tripStatus));
  }

  if (query.boatPublicId) {
    baseConditions.push(eq(boats.publicId, query.boatPublicId));
  }

  if (query.fromDate) {
    baseConditions.push(gte(sandTrips.departureTime, new Date(query.fromDate)));
  }

  if (query.toDate) {
    baseConditions.push(lte(sandTrips.departureTime, new Date(query.toDate)));
  }

  const whereClause = and(...baseConditions);

  const sortColumn = query.sortBy === 'netProfitTk' ? sandTrips.netProfitTk :
                     query.sortBy === 'saleAmountTk' ? sandTrips.saleAmountTk :
                     query.sortBy === 'createdAt' ? sandTrips.createdAt :
                     sandTrips.departureTime;
  const orderByClause = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

  const sourceLocations = alias(locations, 'sourceLocations');
  const destLocations = alias(locations, 'destLocations');

  const [countResult, itemsResult] = await Promise.all([
    db
      .select({ 
        count: count(),
        totalProfitTk: sql<string>`sum(${sandTrips.netProfitTk})`,
        totalPurchaseCostTk: sql<string>`sum(${sandTrips.purchaseCostTk})`,
        totalGovtRoyaltyTk: sql<string>`sum(${sandTrips.govtRoyaltyTk})`,
        totalLocalTollTk: sql<string>`sum(${sandTrips.localTollTk})`,
        totalOperatingCostTk: sql<string>`sum(${sandTrips.totalOperatingCostTk})`,
      })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .where(whereClause),

    db
      .select({
        publicId: sandTrips.publicId,
        boatName: boats.name,
        boatPublicId: boats.publicId,
        sourceLocationName: sourceLocations.name,
        sourceLocationLat: sourceLocations.lat,
        sourceLocationLng: sourceLocations.lng,
        destLocationName: destLocations.name,
        destLocationLat: destLocations.lat,
        destLocationLng: destLocations.lng,
        departureTime: sql<string>`${sandTrips.departureTime}::text`,
        arrivalTime: sql<string>`${sandTrips.arrivalTime}::text`,
        cargoValue: sandTrips.cargoValue,
        cargoUnit: sandTrips.cargoUnit,
        saleAmountTk: sandTrips.saleAmountTk,
        netProfitTk: sandTrips.netProfitTk,
        status: sandTrips.status,
        createdAt: sql<string>`${sandTrips.createdAt}::text`,
      })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .leftJoin(sourceLocations, eq(sandTrips.sourceLocationId, sourceLocations.id))
      .leftJoin(destLocations, eq(sandTrips.destLocationId, destLocations.id))
      .where(whereClause)
      .limit(query.limit)
      .offset(offset)
      .orderBy(orderByClause)
  ]);

  const totalItems = countResult[0].count;
  const totalProfitTk = parseFloat(countResult[0].totalProfitTk || '0');
  const totalCostTk = 
    parseFloat(countResult[0].totalPurchaseCostTk || '0') + 
    parseFloat(countResult[0].totalGovtRoyaltyTk || '0') + 
    parseFloat(countResult[0].totalLocalTollTk || '0') + 
    parseFloat(countResult[0].totalOperatingCostTk || '0');

  const items = itemsResult.map((item) => {
    const {
      sourceLocationName,
      sourceLocationLat,
      sourceLocationLng,
      destLocationName,
      destLocationLat,
      destLocationLng,
      ...rest
    } = item;

    return {
      ...rest,
      sourceLocation: sourceLocationName ? {
        name: sourceLocationName,
        lat: sourceLocationLat ? Number(sourceLocationLat) : null,
        lng: sourceLocationLng ? Number(sourceLocationLng) : null,
      } : null,
      destLocation: destLocationName ? {
        name: destLocationName,
        lat: destLocationLat ? Number(destLocationLat) : null,
        lng: destLocationLng ? Number(destLocationLng) : null,
      } : null,
    };
  });

  return {
    data: {
      items: items as SandTripListResponse['items'],
      meta: getPaginationMeta(totalItems, query.page, query.limit),
      kpis: {
        totalTrips: totalItems,
        totalProfitTk,
        totalCostTk,
      }
    }
  };
});

export const POST = withErrorHandler<{ success: boolean; publicId: string }, [NextRequest]>(async (req): Promise<HandlerResult<{ success: boolean; publicId: string }>> => {
  const userPublicId = await requireAuthPublicId();
  
  const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
  if (!userRecord) throw new Error("User not found");

  const body = await req.json();
  const data = createSandTripSchema.parse(body);

  const [boat] = await db.select({ id: boats.id })
    .from(boats)
    .where(and(eq(boats.publicId, data.boatPublicId), eq(boats.createdBy, userRecord.id)));
  if (!boat) throw new Error("Boat not found or unauthorized");

  let sourceLocId = null;
  if (data.sourceLocation) {
    const [inserted] = await db.insert(locations).values({
      name: data.sourceLocation.name,
      lat: data.sourceLocation.lat !== undefined && data.sourceLocation.lat !== null ? String(data.sourceLocation.lat) : null,
      lng: data.sourceLocation.lng !== undefined && data.sourceLocation.lng !== null ? String(data.sourceLocation.lng) : null,
    }).returning({ id: locations.id });
    sourceLocId = inserted.id;
  }

  let destLocId = null;
  if (data.destLocation) {
    const [inserted] = await db.insert(locations).values({
      name: data.destLocation.name,
      lat: data.destLocation.lat !== undefined && data.destLocation.lat !== null ? String(data.destLocation.lat) : null,
      lng: data.destLocation.lng !== undefined && data.destLocation.lng !== null ? String(data.destLocation.lng) : null,
    }).returning({ id: locations.id });
    destLocId = inserted.id;
  }

  const [newTrip] = await db.insert(sandTrips).values({
    boatId: boat.id,
    sourceLocationId: sourceLocId,
    destLocationId: destLocId,
    departureTime: new Date(data.departureTime),
    arrivalTime: data.arrivalTime ? new Date(data.arrivalTime) : null,
    cargoValue: data.cargoValue != null ? String(data.cargoValue) : null,
    cargoUnit: data.cargoUnit ?? null,
    saleAmountTk: data.saleAmountTk != null ? String(data.saleAmountTk) : null,
    buyerName: data.buyerName ?? null,
    buyerPhone: data.buyerPhone ?? null,
    purchaseRatePerUnitTk: data.purchaseRatePerUnitTk != null ? String(data.purchaseRatePerUnitTk) : null,
    purchaseCostTk: data.purchaseCostTk != null ? String(data.purchaseCostTk) : null,
    govtRoyaltyRateTk: data.govtRoyaltyRateTk != null ? String(data.govtRoyaltyRateTk) : null,
    govtRoyaltyTk: data.govtRoyaltyTk != null ? String(data.govtRoyaltyTk) : null,
    localTollRateTk: data.localTollRateTk != null ? String(data.localTollRateTk) : null,
    localTollTk: data.localTollTk != null ? String(data.localTollTk) : null,
    status: data.status,
    notes: data.notes ?? null,
  }).returning({ publicId: sandTrips.publicId });

  return {
    data: { success: true, publicId: newTrip.publicId },
    status: 201,
  };
});
