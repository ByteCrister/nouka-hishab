import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { sandTrips, sandTripExpenses, sandTripAttachments } from "@/db/sand";
import { files, assets } from "@/db/media";
import { boats } from "@/db/boat";
import { eq, and, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { locations, users } from "@/db/app";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { SandTripDetail, SandTripDetailResponse } from "@/types/sand/trips.types";
import { SandTripStatus, SandCargoUnit } from "@/constants/db/sand.const";
import { updateSandTripSchema } from "@/utils/zod/sand-trips.schema";

interface RouteContext {
  params: { publicId: string };
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
  sourceLocationId?: number | null;
  destLocationId?: number | null;
  status?: SandTripStatus;
  notes?: string | null;
  updatedAt?: Date;
};

export const GET = withErrorHandler<SandTripDetailResponse, [NextRequest, RouteContext]>(
  async (_req, { params }): Promise<HandlerResult<SandTripDetailResponse>> => {
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
    if (!userRecord) throw new Error("User not found");

    const sourceLocations = alias(locations, 'sourceLocations');
    const destLocations = alias(locations, 'destLocations');

    const [trip] = await db
      .select({
        id: sandTrips.id,
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
        buyerName: sandTrips.buyerName,
        buyerPhone: sandTrips.buyerPhone,
        purchaseRatePerUnitTk: sandTrips.purchaseRatePerUnitTk,
        purchaseCostTk: sandTrips.purchaseCostTk,
        govtRoyaltyRateTk: sandTrips.govtRoyaltyRateTk,
        govtRoyaltyTk: sandTrips.govtRoyaltyTk,
        localTollRateTk: sandTrips.localTollRateTk,
        localTollTk: sandTrips.localTollTk,
        totalOperatingCostTk: sandTrips.totalOperatingCostTk,
        notes: sandTrips.notes,
        updatedAt: sql<string>`${sandTrips.updatedAt}::text`,
      })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .leftJoin(sourceLocations, eq(sandTrips.sourceLocationId, sourceLocations.id))
      .leftJoin(destLocations, eq(sandTrips.destLocationId, destLocations.id))
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

    const {
      id,
      sourceLocationName,
      sourceLocationLat,
      sourceLocationLng,
      destLocationName,
      destLocationLat,
      destLocationLng,
      ...rest
    } = trip;

    const expensesData = await db
      .select({
        publicId: sandTripExpenses.publicId,
        category: sandTripExpenses.category,
        description: sandTripExpenses.description,
        amountTk: sql<number>`${sandTripExpenses.amountTk}::float`,
        expenseDate: sql<string>`${sandTripExpenses.expenseDate}::text`,
        createdAt: sql<string>`${sandTripExpenses.createdAt}::text`,
      })
      .from(sandTripExpenses)
      .where(
        and(
          eq(sandTripExpenses.sandTripId, id),
          isNull(sandTripExpenses.deletedAt)
        )
      )
      .orderBy(sandTripExpenses.createdAt);

    const attachmentsData = await db
      .select({
        fileId: sandTripAttachments.fileId,
        description: sandTripAttachments.description,
        createdAt: sql<string>`${sandTripAttachments.createdAt}::text`,
        url: assets.cloudinaryUrl,
        originalFileName: files.originalFileName,
      })
      .from(sandTripAttachments)
      .innerJoin(files, eq(sandTripAttachments.fileId, files.id))
      .innerJoin(assets, eq(files.assetId, assets.id))
      .where(
        and(
          eq(sandTripAttachments.sandTripId, id),
          isNull(sandTripAttachments.deletedAt)
        )
      );

    const mappedTrip = {
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
      expenses: expensesData,
      attachments: attachmentsData,
    };

    return { data: { trip: mappedTrip as SandTripDetail } };
  }
);

export const PATCH = withErrorHandler<{ success: boolean; publicId: string }, [NextRequest, RouteContext]>(
  async (req, { params }): Promise<HandlerResult<{ success: boolean; publicId: string }>> => {
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

    if (data.sourceLocation !== undefined) {
      if (data.sourceLocation === null) {
        updateData.sourceLocationId = null;
      } else {
        const [inserted] = await db.insert(locations).values({
          name: data.sourceLocation.name,
          lat: data.sourceLocation.lat !== undefined && data.sourceLocation.lat !== null ? String(data.sourceLocation.lat) : null,
          lng: data.sourceLocation.lng !== undefined && data.sourceLocation.lng !== null ? String(data.sourceLocation.lng) : null,
        }).returning({ id: locations.id });
        updateData.sourceLocationId = inserted.id;
      }
    }

    if (data.destLocation !== undefined) {
      if (data.destLocation === null) {
        updateData.destLocationId = null;
      } else {
        const [inserted] = await db.insert(locations).values({
          name: data.destLocation.name,
          lat: data.destLocation.lat !== undefined && data.destLocation.lat !== null ? String(data.destLocation.lat) : null,
          lng: data.destLocation.lng !== undefined && data.destLocation.lng !== null ? String(data.destLocation.lng) : null,
        }).returning({ id: locations.id });
        updateData.destLocationId = inserted.id;
      }
    }
    if (data.departureTime) updateData.departureTime = new Date(data.departureTime);
    if (data.arrivalTime !== undefined) updateData.arrivalTime = data.arrivalTime ? new Date(data.arrivalTime) : null;
    if (data.cargoValue !== undefined) updateData.cargoValue = data.cargoValue != null ? String(data.cargoValue) : null;
    if (data.cargoUnit !== undefined) updateData.cargoUnit = data.cargoUnit;
    if (data.saleAmountTk !== undefined) updateData.saleAmountTk = data.saleAmountTk != null ? String(data.saleAmountTk) : null;
    if (data.buyerName !== undefined) updateData.buyerName = data.buyerName;
    if (data.buyerPhone !== undefined) updateData.buyerPhone = data.buyerPhone;
    if (data.purchaseRatePerUnitTk !== undefined) updateData.purchaseRatePerUnitTk = data.purchaseRatePerUnitTk != null ? String(data.purchaseRatePerUnitTk) : null;
    if (data.purchaseCostTk !== undefined) updateData.purchaseCostTk = data.purchaseCostTk != null ? String(data.purchaseCostTk) : null;
    if (data.govtRoyaltyRateTk !== undefined) updateData.govtRoyaltyRateTk = data.govtRoyaltyRateTk != null ? String(data.govtRoyaltyRateTk) : null;
    if (data.govtRoyaltyTk !== undefined) updateData.govtRoyaltyTk = data.govtRoyaltyTk != null ? String(data.govtRoyaltyTk) : null;
    if (data.localTollRateTk !== undefined) updateData.localTollRateTk = data.localTollRateTk != null ? String(data.localTollRateTk) : null;
    if (data.localTollTk !== undefined) updateData.localTollTk = data.localTollTk != null ? String(data.localTollTk) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    updateData.updatedAt = new Date();

    const [updatedTrip] = await db
      .update(sandTrips)
      .set(updateData)
      .where(eq(sandTrips.publicId, params.publicId))
      .returning({ publicId: sandTrips.publicId });

    if (!updatedTrip) {
      throw new ApiError("Trip not found", 404);
    }

    return { data: { success: true, publicId: updatedTrip.publicId } };
  }
);

export const DELETE = withErrorHandler<{ success: boolean }, [NextRequest, RouteContext]>(
  async (_req, { params }): Promise<HandlerResult<{ success: boolean }>> => {
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

