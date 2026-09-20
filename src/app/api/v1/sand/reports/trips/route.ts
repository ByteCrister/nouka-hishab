import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { sandTrips, sandTripExpenses } from "@/db/sand";
import { boats } from "@/db/boat";
import { users } from "@/db/app";
import { eq, and, isNull, gte, lte, asc, inArray } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { SandTripReportDTO, SandTripReportRow, SandTripReportMeta } from "@/types/sand-report.types";

export const GET = withErrorHandler<SandTripReportDTO, [NextRequest]>(
  async (req): Promise<HandlerResult<SandTripReportDTO>> => {
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
    if (!userRecord) throw new Error("User not found");

    const { searchParams } = new URL(req.url);
    const boatPublicId = searchParams.get("boatPublicId");
    const fromDateStr = searchParams.get("fromDate");
    const toDateStr = searchParams.get("toDate");

    if (!boatPublicId) throw new ApiError("boatPublicId is required", 400);

    const [boat] = await db
      .select({ id: boats.id, name: boats.name, publicId: boats.publicId })
      .from(boats)
      .where(and(eq(boats.publicId, boatPublicId), eq(boats.createdBy, userRecord.id)));

    if (!boat) throw new ApiError("Boat not found or unauthorized", 404);

    const conditions = [
      eq(sandTrips.boatId, boat.id),
      isNull(sandTrips.deletedAt),
    ];

    if (fromDateStr) {
      conditions.push(gte(sandTrips.departureTime, new Date(fromDateStr)));
    }
    if (toDateStr) {
      conditions.push(lte(sandTrips.departureTime, new Date(toDateStr)));
    }

    const trips = await db
      .select({
        id: sandTrips.id,
        publicId: sandTrips.publicId,
        departureTime: sandTrips.departureTime,
        source: sandTrips.source,
        destination: sandTrips.destination,
        cargoValue: sandTrips.cargoValue,
        cargoUnit: sandTrips.cargoUnit,
        saleAmountTk: sandTrips.saleAmountTk,
        purchaseCostTk: sandTrips.purchaseCostTk,
        govtRoyaltyTk: sandTrips.govtRoyaltyTk,
        localTollTk: sandTrips.localTollTk,
        operatingCostTk: sandTrips.operatingCostTk,
        operatingCostRatePerUnitTk: sandTrips.operatingCostRatePerUnitTk,
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
      .where(and(...conditions))
      .orderBy(asc(sandTrips.departureTime));

    const tripIds = trips.map(t => t.id);

    let allExpenses: {
      sandTripId: number;
      category: string;
      description: string | null;
      amountTk: string;
    }[] = [];
    if (tripIds.length > 0) {
      allExpenses = await db
        .select({
          sandTripId: sandTripExpenses.sandTripId,
          category: sandTripExpenses.category,
          description: sandTripExpenses.description,
          amountTk: sandTripExpenses.amountTk,
        })
        .from(sandTripExpenses)
        .where(
          and(
            inArray(sandTripExpenses.sandTripId, tripIds),
            isNull(sandTripExpenses.deletedAt)
          )
        );
    }

    let totalSaleAmountTk = 0;
    let totalPurchaseCostTk = 0;
    let totalGovtRoyaltyTk = 0;
    let totalLocalTollTk = 0;
    let totalOperatingCostTk = 0;
    let totalNetProfitTk = 0;

    const rows: SandTripReportRow[] = trips.map((t, idx) => {
      totalSaleAmountTk += t.saleAmountTk ? parseFloat(t.saleAmountTk) : 0;
      totalPurchaseCostTk += t.purchaseCostTk ? parseFloat(t.purchaseCostTk) : 0;
      totalGovtRoyaltyTk += t.govtRoyaltyTk ? parseFloat(t.govtRoyaltyTk) : 0;
      totalLocalTollTk += t.localTollTk ? parseFloat(t.localTollTk) : 0;
      totalOperatingCostTk += t.totalOperatingCostTk ? parseFloat(t.totalOperatingCostTk) : 0;
      totalNetProfitTk += t.netProfitTk ? parseFloat(t.netProfitTk) : 0;

      const tripExpenses = allExpenses.filter(e => e.sandTripId === t.id).map(e => ({
        category: e.category,
        description: e.description,
        amountTk: e.amountTk ? parseFloat(e.amountTk) : 0,
      }));

      return {
        serial: idx + 1,
        publicId: t.publicId,
        date: t.departureTime.toISOString(),
        source: t.source,
        destination: t.destination,
        cargoValue: t.cargoValue ? parseFloat(t.cargoValue) : null,
        cargoUnit: t.cargoUnit,
        saleAmountTk: t.saleAmountTk ? parseFloat(t.saleAmountTk) : null,
        purchaseCostTk: t.purchaseCostTk ? parseFloat(t.purchaseCostTk) : null,
        govtRoyaltyTk: t.govtRoyaltyTk ? parseFloat(t.govtRoyaltyTk) : null,
        localTollTk: t.localTollTk ? parseFloat(t.localTollTk) : null,
        totalOperatingCostTk: t.totalOperatingCostTk ? parseFloat(t.totalOperatingCostTk) : null,
        netProfitTk: t.netProfitTk ? parseFloat(t.netProfitTk) : null,
        status: t.status,
        buyerName: t.buyerName,
        buyerPhone: t.buyerPhone,
        purchaseRatePerUnitTk: t.purchaseRatePerUnitTk ? parseFloat(t.purchaseRatePerUnitTk) : null,
        govtRoyaltyRateTk: t.govtRoyaltyRateTk ? parseFloat(t.govtRoyaltyRateTk) : null,
        localTollRateTk: t.localTollRateTk ? parseFloat(t.localTollRateTk) : null,
        operatingCostTk: t.operatingCostTk ? parseFloat(t.operatingCostTk) : null,
        operatingCostRatePerUnitTk: t.operatingCostRatePerUnitTk ? parseFloat(t.operatingCostRatePerUnitTk) : null,
        expenses: tripExpenses,
      };
    });

    const meta: SandTripReportMeta = {
      boatName: boat.name,
      boatPublicId: boat.publicId,
      fromDate: fromDateStr || "",
      toDate: toDateStr || "",
      generatedAt: new Date().toISOString(),
      totalTrips: trips.length,
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
