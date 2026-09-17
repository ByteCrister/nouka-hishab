// src/app/api/v1/sand/reports/trips/route.ts
// ─── Sand Trips Report API ────────────────────────────────────────────────────
// GET /api/v1/sand/reports/trips?boatPublicId=&fromDate=&toDate=
//
// Returns a SandTripReportDTO (NOT raw DB records).
// The client uses this DTO to generate PDFs via the report engine.
//
// Security:
//   - Auth required via requireAuthPublicId()
//   - Ownership verified: boats.createdBy === current user's id
//   - All query params validated with Zod

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/config/db';
import { boats } from '@/db/boat';
import { sandTrips, sandTripExpenses } from '@/db/sand';
import { eq, and, isNull, gte, lte, asc, inArray, sql } from 'drizzle-orm';
import { users } from '@/db/app';
import { requireAuthPublicId } from '@/lib/auth/utils';
import { withErrorHandler, HandlerResult, ApiError } from '@/lib/helpers/withErrorHandler';
import type {
  SandTripReportDTO,
  SandTripReportRow,
  SandTripReportMeta,
  SandTripExpenseReportRow,
} from '@/types/sand/sand-report.types';

// ─── Zod schema ───────────────────────────────────────────────────────────────

const sandTripsReportSchema = z.object({
  boatPublicId: z.string().min(1, 'boatPublicId is required'),
  fromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'fromDate must be YYYY-MM-DD'),
  toDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'toDate must be YYYY-MM-DD'),
});

// ─── Handler ──────────────────────────────────────────────────────────────────

export const GET = withErrorHandler<SandTripReportDTO, [NextRequest]>(
  async (req): Promise<HandlerResult<SandTripReportDTO>> => {
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.publicId, userPublicId));
    if (!userRecord) throw new ApiError('User not found', 404);

    // ── Parse & validate query params ──────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const parsed = sandTripsReportSchema.safeParse(
      Object.fromEntries(searchParams)
    );
    if (!parsed.success) {
      throw new ApiError(
        parsed.error.issues.map((e: z.ZodIssue) => e.message).join('; '),
        400
      );
    }
    const query = parsed.data;

    // ── Verify boat ownership ──────────────────────────────────────────────
    const [boat] = await db
      .select({ id: boats.id, name: boats.name })
      .from(boats)
      .where(
        and(
          eq(boats.publicId, query.boatPublicId),
          eq(boats.createdBy, userRecord.id),
          isNull(boats.deletedAt)
        )
      );
    if (!boat) throw new ApiError('Boat not found or unauthorized', 404);

    // ── Date range boundaries ──────────────────────────────────────────────
    // fromDate: start of day in UTC
    // toDate: end of day in UTC (23:59:59.999)
    const fromDateTime = new Date(`${query.fromDate}T00:00:00.000Z`);
    const toDateTime = new Date(`${query.toDate}T23:59:59.999Z`);

    if (fromDateTime > toDateTime) {
      throw new ApiError('fromDate must be before or equal to toDate', 400);
    }

    // ── Fetch all matching trips (no LIMIT — report needs full dataset) ─────
    const tripsData = await db
      .select({
        id: sandTrips.id,
        publicId: sandTrips.publicId,
        departureTime: sql<string>`${sandTrips.departureTime}::text`,
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
      })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .where(
        and(
          eq(sandTrips.boatId, boat.id),
          isNull(sandTrips.deletedAt),
          gte(sandTrips.departureTime, fromDateTime),
          lte(sandTrips.departureTime, toDateTime)
        )
      )
      .orderBy(asc(sandTrips.departureTime));

    if (tripsData.length === 0) {
      // Return an empty report DTO — the client handles the "no data" state
      const emptyMeta: SandTripReportMeta = {
        boatName: boat.name,
        boatPublicId: query.boatPublicId,
        fromDate: query.fromDate,
        toDate: query.toDate,
        generatedAt: new Date().toISOString(),
        totalTrips: 0,
        totalSaleAmountTk: 0,
        totalPurchaseCostTk: 0,
        totalGovtRoyaltyTk: 0,
        totalLocalTollTk: 0,
        totalOperatingCostTk: 0,
        totalNetProfitTk: 0,
      };
      return { data: { meta: emptyMeta, rows: [] } };
    }

    // ── Fetch all expenses for these trips in one query ────────────────────
    const tripIds = tripsData.map((t) => t.id);
    const expensesData = await db
      .select({
        sandTripId: sandTripExpenses.sandTripId,
        category: sandTripExpenses.category,
        description: sandTripExpenses.description,
        amountTk: sql<number>`${sandTripExpenses.amountTk}::float`,
      })
      .from(sandTripExpenses)
      .where(
        and(
          inArray(sandTripExpenses.sandTripId, tripIds),
          isNull(sandTripExpenses.deletedAt)
        )
      )
      .orderBy(sandTripExpenses.createdAt);

    // Group expenses by trip id for O(1) lookup
    const expensesByTripId = new Map<number, SandTripExpenseReportRow[]>();
    for (const exp of expensesData) {
      if (!expensesByTripId.has(exp.sandTripId)) {
        expensesByTripId.set(exp.sandTripId, []);
      }
      expensesByTripId.get(exp.sandTripId)!.push({
        category: exp.category,
        description: exp.description,
        amountTk: exp.amountTk,
      });
    }

    // ── Build report rows ──────────────────────────────────────────────────
    const rows: SandTripReportRow[] = tripsData.map((trip, idx) => ({
      serial: idx + 1,
      publicId: trip.publicId,
      date: trip.departureTime,
      source: trip.source,
      destination: trip.destination,
      cargoValue: trip.cargoValue != null ? parseFloat(String(trip.cargoValue)) : null,
      cargoUnit: trip.cargoUnit ?? null,
      saleAmountTk: trip.saleAmountTk != null ? parseFloat(String(trip.saleAmountTk)) : null,
      purchaseCostTk: trip.purchaseCostTk != null ? parseFloat(String(trip.purchaseCostTk)) : null,
      govtRoyaltyTk: trip.govtRoyaltyTk != null ? parseFloat(String(trip.govtRoyaltyTk)) : null,
      localTollTk: trip.localTollTk != null ? parseFloat(String(trip.localTollTk)) : null,
      totalOperatingCostTk:
        trip.totalOperatingCostTk != null ? parseFloat(String(trip.totalOperatingCostTk)) : null,
      netProfitTk: trip.netProfitTk != null ? parseFloat(String(trip.netProfitTk)) : null,
      status: trip.status,
      expenses: expensesByTripId.get(trip.id) ?? [],
    }));

    // ── Aggregate totals ───────────────────────────────────────────────────
    const totalSaleAmountTk = rows.reduce((s, r) => s + (r.saleAmountTk ?? 0), 0);
    const totalPurchaseCostTk = rows.reduce((s, r) => s + (r.purchaseCostTk ?? 0), 0);
    const totalGovtRoyaltyTk = rows.reduce((s, r) => s + (r.govtRoyaltyTk ?? 0), 0);
    const totalLocalTollTk = rows.reduce((s, r) => s + (r.localTollTk ?? 0), 0);
    const totalOperatingCostTk = rows.reduce((s, r) => s + (r.totalOperatingCostTk ?? 0), 0);
    const totalNetProfitTk = rows.reduce((s, r) => s + (r.netProfitTk ?? 0), 0);

    const meta: SandTripReportMeta = {
      boatName: boat.name,
      boatPublicId: query.boatPublicId,
      fromDate: query.fromDate,
      toDate: query.toDate,
      generatedAt: new Date().toISOString(),
      totalTrips: rows.length,
      totalSaleAmountTk,
      totalPurchaseCostTk,
      totalGovtRoyaltyTk,
      totalLocalTollTk,
      totalOperatingCostTk,
      totalNetProfitTk,
    };

    return { data: { meta, rows } };
  }
);
