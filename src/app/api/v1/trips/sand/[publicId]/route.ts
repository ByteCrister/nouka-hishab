import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { sandTrips } from "@/db/sand";
import { tripExpenses, tripAttachments } from "@/db/trips";
import { files, assets } from "@/db/media";
import { boats } from "@/db/boat";
import { eq, and, isNull, sql } from "drizzle-orm";
import { users } from "@/db/app";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { SandTripDetail } from "@/types/trips.types";
import { SandTripStatus, SandCargoUnit } from "@/constants/db/sand.const";
import { SECTORS } from "@/constants/db/app.const";
// import type { UpdateSandTripPayload } from "@/types/trips.types";
import { updateSandTripSchema } from "@/utils/zod/sand-trips.schema";
import { recalculateTripFinancials } from "../../../../../../lib/helpers/trip-financials.helper";

interface RouteContext {
  params: Promise<{ publicId: string }>;
}

type UpdateFields = {
  boatId?: number;
  departureTime?: Date;
  arrivalTime?: Date | null;
  cargoValue?: string | null;
  saleAmountTk?: string | null;
  purchaseRatePerUnitTk?: string | null;
  purchaseCostTk?: string | null;
  govtRoyaltyRateTk?: string | null;
  govtRoyaltyTk?: string | null;
  localTollRateTk?: string | null;
  localTollTk?: string | null;
  cargoUnit?: SandCargoUnit | null;
  buyerName?: string | null;
  buyerPhone?: string | null;
  source?: string | null;
  destination?: string | null;
  saleRatePerUnitTk?: string | null;
  operatingCostRatePerUnitTk?: string | null;
  operatingCostTk?: string | null;
  status?: SandTripStatus;
  notes?: string | null;
  updatedAt?: Date;
};

export const GET = withErrorHandler<SandTripDetail, [NextRequest, RouteContext]>(
  async (_req, context): Promise<HandlerResult<SandTripDetail>> => {
    const params = await context.params;
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
    if (!userRecord) throw new Error("User not found");



    const [trip] = await db
      .select({
        id: sandTrips.id,
        publicId: sandTrips.publicId,
        boatName: boats.name,
        boatPublicId: boats.publicId,
        source: sandTrips.source,
        destination: sandTrips.destination,
        departureTime: sql<string>`${sandTrips.departureTime}::text`,
        arrivalTime: sql<string>`${sandTrips.arrivalTime}::text`,
        cargoValue: sandTrips.cargoValue,
        cargoUnit: sandTrips.cargoUnit,
        saleRatePerUnitTk: sandTrips.saleRatePerUnitTk,
        saleAmountTk: sandTrips.saleAmountTk,
        netProfitTk: sandTrips.netProfitTk,
        status: sandTrips.status,
        createdAt: sql<string>`${sandTrips.createdAt}::text`,
        buyerName: sandTrips.buyerName,
        buyerPhone: sandTrips.buyerPhone,
        purchaseRatePerUnitTk: sandTrips.purchaseRatePerUnitTk,
        purchaseCostTk: sandTrips.purchaseCostTk,
        govtRoyaltyRateTk: sandTrips.govtRoyaltyRateTk,
        govtRoyaltyTk: sandTrips.govtRoyaltyTk,
        localTollRateTk: sandTrips.localTollRateTk,
        localTollTk: sandTrips.localTollTk,
        operatingCostRatePerUnitTk: sandTrips.operatingCostRatePerUnitTk,
        operatingCostTk: sandTrips.operatingCostTk,
        totalOperatingCostTk: sandTrips.totalOperatingCostTk,
        notes: sandTrips.notes,
        updatedAt: sql<string>`${sandTrips.updatedAt}::text`,
      })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .where(
        and(
          eq(sandTrips.publicId, params.publicId),
          isNull(sandTrips.deletedAt),
          eq(boats.createdBy, userRecord.id)
        )
      )
      .limit(1);

    if (!trip) {
      throw new ApiError("Trip not found", 404);
    }

    const { id, ...rest } = trip;

    const expensesData = await db
      .select({
        publicId: tripExpenses.publicId,
        category: tripExpenses.category,
        description: tripExpenses.description,
        amountTk: sql<number>`${tripExpenses.amountTk}::float`,
        expenseDate: sql<string>`${tripExpenses.expenseDate}::text`,
        createdAt: sql<string>`${tripExpenses.createdAt}::text`,
      })
      .from(tripExpenses)
      .where(
        and(
          eq(tripExpenses.sandTripId, id),
          isNull(tripExpenses.deletedAt)
        )
      )
      .orderBy(tripExpenses.createdAt);

    const attachmentsData = await db
      .select({
        id: tripAttachments.id,
        fileId: tripAttachments.fileId,
        description: tripAttachments.description,
        createdAt: sql<string>`${tripAttachments.createdAt}::text`,
        url: assets.cloudinaryUrl,
        originalFileName: files.originalFileName,
      })
      .from(tripAttachments)
      .innerJoin(files, eq(tripAttachments.fileId, files.id))
      .innerJoin(assets, eq(files.assetId, assets.id))
      .where(
        and(
          eq(tripAttachments.sandTripId, id),
          isNull(tripAttachments.deletedAt)
        )
      );

    const mappedTrip = {
      ...rest,
      expenses: expensesData,
      attachments: attachmentsData,
      sector: SECTORS.SAND,
    };

    return { data: mappedTrip as SandTripDetail };
  }
);

export const PATCH = withErrorHandler<{ success: boolean; publicId: string }, [NextRequest, RouteContext]>(
  async (req, context): Promise<HandlerResult<{ success: boolean; publicId: string }>> => {
    const params = await context.params;
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
    if (!userRecord) throw new Error("User not found");

    const [existingTrip] = await db
      .select({ id: sandTrips.id })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .where(
        and(
          eq(sandTrips.publicId, params.publicId),
          isNull(sandTrips.deletedAt),
          eq(boats.createdBy, userRecord.id)
        )
      );

    if (!existingTrip) throw new ApiError("Trip not found", 404);

    const body = await req.json();
    const data = updateSandTripSchema.parse(body);

    const updateData: UpdateFields = {};

    if (data.boatPublicId) {
      const [boat] = await db.select({ id: boats.id })
        .from(boats)
        .where(and(eq(boats.publicId, data.boatPublicId), eq(boats.createdBy, userRecord.id)));
      if (!boat) throw new ApiError("Boat not found or unauthorized", 404);
      updateData.boatId = boat.id;
    }

    if (data.source !== undefined) updateData.source = data.source ?? null;
    if (data.destination !== undefined) updateData.destination = data.destination ?? null;
    if (data.departureTime) updateData.departureTime = new Date(data.departureTime);
    if (data.arrivalTime !== undefined) updateData.arrivalTime = data.arrivalTime ? new Date(data.arrivalTime) : null;
    if (data.cargoValue !== undefined) updateData.cargoValue = data.cargoValue != null ? String(data.cargoValue) : null;
    if (data.cargoUnit !== undefined) updateData.cargoUnit = data.cargoUnit;
    if (data.saleAmountTk !== undefined) updateData.saleAmountTk = data.saleAmountTk != null ? String(data.saleAmountTk) : null;
    if (data.saleRatePerUnitTk !== undefined) updateData.saleRatePerUnitTk = data.saleRatePerUnitTk != null ? String(data.saleRatePerUnitTk) : null;
    if (data.buyerName !== undefined) updateData.buyerName = data.buyerName;
    if (data.buyerPhone !== undefined) updateData.buyerPhone = data.buyerPhone;
    if (data.purchaseRatePerUnitTk !== undefined) updateData.purchaseRatePerUnitTk = data.purchaseRatePerUnitTk != null ? String(data.purchaseRatePerUnitTk) : null;
    if (data.purchaseCostTk !== undefined) updateData.purchaseCostTk = data.purchaseCostTk != null ? String(data.purchaseCostTk) : null;
    if (data.govtRoyaltyRateTk !== undefined) updateData.govtRoyaltyRateTk = data.govtRoyaltyRateTk != null ? String(data.govtRoyaltyRateTk) : null;
    if (data.govtRoyaltyTk !== undefined) updateData.govtRoyaltyTk = data.govtRoyaltyTk != null ? String(data.govtRoyaltyTk) : null;
    if (data.localTollRateTk !== undefined) updateData.localTollRateTk = data.localTollRateTk != null ? String(data.localTollRateTk) : null;
    if (data.localTollTk !== undefined) updateData.localTollTk = data.localTollTk != null ? String(data.localTollTk) : null;
    if (data.operatingCostRatePerUnitTk !== undefined) updateData.operatingCostRatePerUnitTk = data.operatingCostRatePerUnitTk != null ? String(data.operatingCostRatePerUnitTk) : null;
    if (data.operatingCostTk !== undefined) updateData.operatingCostTk = data.operatingCostTk != null ? String(data.operatingCostTk) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    updateData.updatedAt = new Date();

    const [updatedTrip] = await db
      .update(sandTrips)
      .set(updateData)
      .where(eq(sandTrips.publicId, params.publicId))
      .returning({ id: sandTrips.id, publicId: sandTrips.publicId });

    if (!updatedTrip) {
      throw new ApiError("Trip not found", 404);
    }

    await recalculateTripFinancials(updatedTrip.id);

    return { data: { success: true, publicId: updatedTrip.publicId } };
  }
);

export const DELETE = withErrorHandler<{ success: boolean }, [NextRequest, RouteContext]>(
  async (_req, context): Promise<HandlerResult<{ success: boolean }>> => {
    const params = await context.params;
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
    if (!userRecord) throw new Error("User not found");

    const [existingTrip] = await db
      .select({ id: sandTrips.id })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .where(
        and(
          eq(sandTrips.publicId, params.publicId),
          isNull(sandTrips.deletedAt),
          eq(boats.createdBy, userRecord.id)
        )
      );

    if (!existingTrip) throw new ApiError("Trip not found", 404);

    const [deletedTrip] = await db
      .update(sandTrips)
      .set({ deletedAt: new Date() })
      .where(eq(sandTrips.publicId, params.publicId))
      .returning({ publicId: sandTrips.publicId });

    if (!deletedTrip) {
      throw new ApiError("Trip not found", 404);
    }

    return { data: { success: true } };
  }
);

