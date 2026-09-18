import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { sandTrips, sandTripExpenses } from "@/db/sand";
import { boats } from "@/db/boat";
import { users } from "@/db/app";
import { eq, and, isNull, count } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { createSandTripExpenseSchema } from "@/utils/zod/sand-trips.schema";
import { recalculateTripFinancials } from "../../../../../../../lib/helpers/trip-financials.helper";

interface RouteContext {
  params: Promise<{ publicId: string }>;
}

export const POST = withErrorHandler<{ success: boolean; publicId: string }, [NextRequest, RouteContext]>(
  async (req, context): Promise<HandlerResult<{ success: boolean; publicId: string }>> => {
    const params = await context.params;
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
    if (!userRecord) throw new Error("User not found");

    // Verify trip ownership
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

    // Limit expenses to 50 per trip to prevent abuse
    const [{ expenseCount }] = await db
      .select({ expenseCount: count() })
      .from(sandTripExpenses)
      .where(
        and(
          eq(sandTripExpenses.sandTripId, existingTrip.id),
          isNull(sandTripExpenses.deletedAt)
        )
      );

    if (expenseCount >= 50) {
      throw new ApiError("Maximum limit of 50 expenses per trip reached.", 400);
    }

    const body = await req.json();
    const data = createSandTripExpenseSchema.parse(body);

    const [newExpense] = await db.insert(sandTripExpenses).values({
      sandTripId: existingTrip.id,
      category: data.category,
      description: data.description ?? null,
      amountTk: String(data.amountTk),
      expenseDate: data.expenseDate ?? null,
      createdBy: userRecord.id,
    }).returning({ publicId: sandTripExpenses.publicId });

    await recalculateTripFinancials(existingTrip.id);

    return {
      data: { success: true, publicId: newExpense.publicId },
      status: 201,
    };
  }
);
