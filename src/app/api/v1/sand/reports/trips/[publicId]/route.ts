import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { sandTrips, sandTripExpenses } from "@/db/sand";
import { boats } from "@/db/boat";
import { users } from "@/db/app";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { SingleSandTripReportDTO, SandTripReportRow } from "@/types/sand-report.types";

interface RouteContext {
  params: Promise<{ publicId: string }>;
}

export const GET = withErrorHandler<SingleSandTripReportDTO, [NextRequest, RouteContext]>(
  async (_req, context): Promise<HandlerResult<SingleSandTripReportDTO>> => {
    const params = await context.params;
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
    if (!userRecord) throw new Error("User not found");

    const [trip] = await db
      .select({
        id: sandTrips.id,
        publicId: sandTrips.publicId,
        departureTime: sandTrips.departureTime,
        arrivalTime: sandTrips.arrivalTime,
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
        operatingCostTk: sandTrips.operatingCostTk,
        operatingCostRatePerUnitTk: sandTrips.operatingCostRatePerUnitTk,
        boatName: boats.name,
        boatPublicId: boats.publicId,
      })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .where(
        and(
          eq(sandTrips.publicId, params.publicId),
          isNull(sandTrips.deletedAt),
          eq(boats.createdBy, userRecord.id)
        )
      );

    if (!trip) {
      throw new ApiError("Trip not found", 404);
    }

    const expensesData = await db
      .select({
        category: sandTripExpenses.category,
        description: sandTripExpenses.description,
        amountTk: sandTripExpenses.amountTk,
      })
      .from(sandTripExpenses)
      .where(
        and(
          eq(sandTripExpenses.sandTripId, trip.id),
          isNull(sandTripExpenses.deletedAt)
        )
      );

    const tripExpenses = expensesData.map(e => ({
      category: e.category,
      description: e.description,
      amountTk: e.amountTk ? parseFloat(e.amountTk) : 0,
    }));

    const row: SandTripReportRow = {
      serial: 1,
      publicId: trip.publicId,
      date: trip.departureTime.toISOString(),
      source: trip.source,
      destination: trip.destination,
      cargoValue: trip.cargoValue ? parseFloat(trip.cargoValue) : null,
      cargoUnit: trip.cargoUnit,
      saleAmountTk: trip.saleAmountTk ? parseFloat(trip.saleAmountTk) : null,
      purchaseCostTk: trip.purchaseCostTk ? parseFloat(trip.purchaseCostTk) : null,
      govtRoyaltyTk: trip.govtRoyaltyTk ? parseFloat(trip.govtRoyaltyTk) : null,
      localTollTk: trip.localTollTk ? parseFloat(trip.localTollTk) : null,
      totalOperatingCostTk: trip.totalOperatingCostTk ? parseFloat(trip.totalOperatingCostTk) : null,
      netProfitTk: trip.netProfitTk ? parseFloat(trip.netProfitTk) : null,
      status: trip.status,
      buyerName: trip.buyerName,
      buyerPhone: trip.buyerPhone,
      purchaseRatePerUnitTk: trip.purchaseRatePerUnitTk ? parseFloat(trip.purchaseRatePerUnitTk) : null,
      govtRoyaltyRateTk: trip.govtRoyaltyRateTk ? parseFloat(trip.govtRoyaltyRateTk) : null,
      localTollRateTk: trip.localTollRateTk ? parseFloat(trip.localTollRateTk) : null,
      operatingCostTk: trip.operatingCostTk ? parseFloat(trip.operatingCostTk) : null,
      operatingCostRatePerUnitTk: trip.operatingCostRatePerUnitTk ? parseFloat(trip.operatingCostRatePerUnitTk) : null,
      expenses: tripExpenses,
    };

    const meta = {
      boatName: trip.boatName,
      boatPublicId: trip.boatPublicId,
      tripPublicId: trip.publicId,
      departureTime: trip.departureTime.toISOString(),
      arrivalTime: trip.arrivalTime ? trip.arrivalTime.toISOString() : null,
      generatedAt: new Date().toISOString(),
      totalTrips: 1,
      totalSaleAmountTk: trip.saleAmountTk ? parseFloat(trip.saleAmountTk) : 0,
      totalPurchaseCostTk: trip.purchaseCostTk ? parseFloat(trip.purchaseCostTk) : 0,
      totalGovtRoyaltyTk: trip.govtRoyaltyTk ? parseFloat(trip.govtRoyaltyTk) : 0,
      totalLocalTollTk: trip.localTollTk ? parseFloat(trip.localTollTk) : 0,
      totalOperatingCostTk: trip.totalOperatingCostTk ? parseFloat(trip.totalOperatingCostTk) : 0,
      totalNetProfitTk: trip.netProfitTk ? parseFloat(trip.netProfitTk) : 0,
    };

    return { data: { meta, row } };
  }
);
