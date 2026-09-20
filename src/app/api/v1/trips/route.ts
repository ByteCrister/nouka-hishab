import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boats } from "@/db/boat";
import { sandTrips } from "@/db/sand";
import { eq, and, isNull, desc, asc, sql, count, gte, lte, ilike, or } from "drizzle-orm";
import { buildFuzzySearchPattern } from "@/lib/helpers/sanitize";
import { users } from "@/db/app";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { TripListResponse, TripListItem } from "@/types/trips.types";
import {  SandTripStatus } from "@/constants/db/sand.const";
import { getPaginationMeta } from "@/lib/helpers/pagination.helper";
import { createSandTripSchema } from "@/utils/zod/sand-trips.schema";
import { SECTORS } from "@/constants/db/app.const";

const getTripsSchema = z.object({
  sector: z.enum([SECTORS.SAND, 'all']).optional().default(SECTORS.SAND).transform(v => v === 'all' ? SECTORS.SAND : v),
  search: z.string().optional().default(""),
  status: z.string().optional().default("all"),
  boatPublicId: z.string().optional().nullable(),
  fromDate: z.string().optional().nullable(),
  toDate: z.string().optional().nullable(),
  sortBy: z.enum(["departureTime", "createdAt", "netProfitTk", "saleAmountTk"]).optional().default("departureTime"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const GET = withErrorHandler<TripListResponse, [NextRequest]>(async (req): Promise<HandlerResult<TripListResponse>> => {
  const userPublicId = await requireAuthPublicId();

  const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
  if (!userRecord) throw new Error("User not found");

  const { searchParams } = new URL(req.url);
  const query = getTripsSchema.parse(Object.fromEntries(searchParams));

  const offset = (query.page - 1) * query.limit;

  // In the future, this endpoint will union multiple tables (sand_trips, brick_trips)
  // For now, it only queries sand_trips if sector is 'all' or 'sand'
  if (query.sector !== SECTORS.SAND) {
    return {
      data: {
        items: [],
        meta: getPaginationMeta(0, query.page, query.limit),
        kpis: { totalTrips: 0, totalProfitTk: 0, totalCostTk: 0 }
      }
    };
  }

  const baseConditions = [
    isNull(sandTrips.deletedAt),
    eq(boats.createdBy, userRecord.id)
  ];

  if (query.status && query.status !== 'all') {
    baseConditions.push(eq(sandTrips.status, query.status as SandTripStatus));
  }

  if (query.search) {
    const fuzzySearch = buildFuzzySearchPattern(query.search);
    baseConditions.push(
      or(
        ilike(sandTrips.source, fuzzySearch),
        ilike(sandTrips.destination, fuzzySearch),
        ilike(boats.name, fuzzySearch),
        ilike(sandTrips.buyerName, fuzzySearch),
        ilike(sandTrips.buyerPhone, fuzzySearch),
        ilike(sandTrips.notes, fuzzySearch)
      )!
    );
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

  const [countResult, itemsResult] = await Promise.all([
    db
      .select({
        count: count(),
        totalProfitTk: sql<string>`sum(${sandTrips.netProfitTk})`,
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
        source: sandTrips.source,
        destination: sandTrips.destination,
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
      .where(whereClause)
      .limit(query.limit)
      .offset(offset)
      .orderBy(orderByClause)
  ]);

  const totalItems = countResult[0].count;
  const totalProfitTk = parseFloat(countResult[0].totalProfitTk || '0');
  const totalCostTk = parseFloat(countResult[0].totalOperatingCostTk || '0');

  const items: TripListItem[] = itemsResult.map(item => ({
    ...item,
    cargoValue: item.cargoValue ? parseFloat(item.cargoValue) : null,
    saleAmountTk: item.saleAmountTk ? parseFloat(item.saleAmountTk) : null,
    netProfitTk: item.netProfitTk ? parseFloat(item.netProfitTk) : null,
    sector: 'sand' as const
  }));

  return {
    data: {
      items: items,
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

  const [newTrip] = await db.insert(sandTrips).values({
    boatId: boat.id,
    source: data.source ?? null,
    destination: data.destination ?? null,
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
    operatingCostTk: data.operatingCostTk != null ? String(data.operatingCostTk) : null,
    netProfitTk: String(
      (data.saleAmountTk || 0) - (
        (data.purchaseCostTk || 0) +
        (data.govtRoyaltyTk || 0) +
        (data.localTollTk || 0) +
        (data.operatingCostTk || 0)
      )
    ),
    status: data.status,
    notes: data.notes ?? null,
  }).returning({ publicId: sandTrips.publicId });

  return {
    data: { success: true, publicId: newTrip.publicId },
    status: 201,
  };
});


