import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boats } from "@/db/boat";
import { sandTrips } from "@/db/sand";
import { eq, and, isNull, desc, asc, sql, count, gte, lte } from "drizzle-orm";
import { users } from "@/db/app";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { TripListResponse } from "@/types/trips.types";
import { SAND_TRIP_STATUSES } from "@/constants/db/sand.const";
import { getPaginationMeta } from "@/lib/helpers/pagination.helper";
import { createSandTripSchema } from "@/utils/zod/sand-trips.schema";



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


