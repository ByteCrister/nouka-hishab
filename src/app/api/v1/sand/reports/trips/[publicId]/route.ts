// src/app/api/v1/sand/reports/trips/[publicId]/route.ts
// ─── Single-Trip Report API ───────────────────────────────────────────────────
// GET /api/v1/sand/reports/trips/:publicId
//
// Returns a SingleSandTripReportDTO for a specific trip.
// Used by the sand/trips/[publicId] detail page export button.

import { NextRequest } from 'next/server';
import { db } from '@/config/db';
import { boats } from '@/db/boat';
import { sandTrips, sandTripExpenses } from '@/db/sand';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { users } from '@/db/app';
import { requireAuthPublicId } from '@/lib/auth/utils';
import { withErrorHandler, HandlerResult, ApiError } from '@/lib/helpers/withErrorHandler';
import type {
  SingleSandTripReportDTO,
  SandTripReportRow,
  SandTripExpenseReportRow,
} from '@/types/sand/sand-report.types';

interface RouteContext {
  params: Promise<{ publicId: string }>;
}

export const GET = withErrorHandler<SingleSandTripReportDTO, [NextRequest, RouteContext]>(
  async (_req, context): Promise<HandlerResult<SingleSandTripReportDTO>> => {
    const { publicId } = await context.params;
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.publicId, userPublicId));
    if (!userRecord) throw new ApiError('User not found', 404);

    // ── Fetch trip + ownership check ───────────────────────────────────────
    const [tripData] = await db
      .select({
        id: sandTrips.id,
        publicId: sandTrips.publicId,
        boatName: boats.name,
        boatPublicId: boats.publicId,
        departureTime: sql<string>`${sandTrips.departureTime}::text`,
        arrivalTime: sql<string>`${sandTrips.arrivalTime}::text`,
        source: sandTrips.source,
        destination: sandTrips.destination,
        cargoValue: sandTrips.cargoValue,
        cargoUnit: sandTrips.cargoUnit,
        saleAmountTk: sandTrips.saleAmountTk,
        purchaseCostTk: sandTrips.purchaseCostTk,
        govtRoyaltyTk: sandTrips.govtRoyaltyTk,
        localTollTk: sandTrips.localTollTk,
        totalOperatingCostTk: sandTrips.totalOperatingCostTk,
        netProfitTk: sandTrips.netProfitTk,
        status: sandTrips.status,
        buyerName: sandTrips.buyerName,
        buyerPhone: sandTrips.buyerPhone,
        purchaseRatePerUnitTk: sandTrips.purchaseRatePerUnitTk,
        govtRoyaltyRateTk: sandTrips.govtRoyaltyRateTk,
        localTollRateTk: sandTrips.localTollRateTk,
      })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .where(
        and(
          eq(sandTrips.publicId, publicId),
          isNull(sandTrips.deletedAt),
          eq(boats.createdBy, userRecord.id) // ownership guard
        )
      )
      .limit(1);

    if (!tripData) throw new ApiError('Trip not found', 404);

    // ── Fetch expenses ─────────────────────────────────────────────────────
    const expensesData = await db
      .select({
        category: sandTripExpenses.category,
        description: sandTripExpenses.description,
        amountTk: sql<number>`${sandTripExpenses.amountTk}::float`,
      })
      .from(sandTripExpenses)
      .where(
        and(
          eq(sandTripExpenses.sandTripId, tripData.id),
          isNull(sandTripExpenses.deletedAt)
        )
      )
      .orderBy(sandTripExpenses.createdAt);

    const expenses: SandTripExpenseReportRow[] = expensesData.map((e) => ({
      category: e.category,
      description: e.description,
      amountTk: e.amountTk,
    }));

    // ── Build report DTO ───────────────────────────────────────────────────
    const toNum = (v: unknown): number | null =>
      v != null ? parseFloat(String(v)) : null;

    const row: SandTripReportRow = {
      serial: 1,
      publicId: tripData.publicId,
      date: tripData.departureTime,
      source: tripData.source,
      destination: tripData.destination,
      cargoValue: toNum(tripData.cargoValue),
      cargoUnit: tripData.cargoUnit ?? null,
      saleAmountTk: toNum(tripData.saleAmountTk),
      purchaseCostTk: toNum(tripData.purchaseCostTk),
      govtRoyaltyTk: toNum(tripData.govtRoyaltyTk),
      localTollTk: toNum(tripData.localTollTk),
      totalOperatingCostTk: toNum(tripData.totalOperatingCostTk),
      netProfitTk: toNum(tripData.netProfitTk),
      status: tripData.status,
      buyerName: tripData.buyerName,
      buyerPhone: tripData.buyerPhone,
      purchaseRatePerUnitTk: toNum(tripData.purchaseRatePerUnitTk),
      govtRoyaltyRateTk: toNum(tripData.govtRoyaltyRateTk),
      localTollRateTk: toNum(tripData.localTollRateTk),
      expenses,
    };

    // Compute totals for the single-trip meta
    const totalSaleAmountTk = row.saleAmountTk ?? 0;
    const totalPurchaseCostTk = row.purchaseCostTk ?? 0;
    const totalGovtRoyaltyTk = row.govtRoyaltyTk ?? 0;
    const totalLocalTollTk = row.localTollTk ?? 0;
    const totalOperatingCostTk = row.totalOperatingCostTk ?? 0;
    const totalNetProfitTk = row.netProfitTk ?? 0;

    const dto: SingleSandTripReportDTO = {
      meta: {
        boatName: tripData.boatName,
        boatPublicId: tripData.boatPublicId,
        tripPublicId: tripData.publicId,
        departureTime: tripData.departureTime,
        arrivalTime: tripData.arrivalTime,
        generatedAt: new Date().toISOString(),
        totalTrips: 1,
        totalSaleAmountTk,
        totalPurchaseCostTk,
        totalGovtRoyaltyTk,
        totalLocalTollTk,
        totalOperatingCostTk,
        totalNetProfitTk,
      },
      row,
    };

    return { data: dto };
  }
);
