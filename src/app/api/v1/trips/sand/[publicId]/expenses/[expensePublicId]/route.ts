import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { sandTrips } from "@/db/sand";
import { tripExpenses } from "@/db/trips";
import { boats } from "@/db/boat";
import { users } from "@/db/app";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { updateTripExpenseSchema } from "@/utils/zod/sand-trips.schema";
import { TripExpenseCategory } from "@/constants/db/trips.const";
import { recalculateTripFinancials } from "../../../../../../../../lib/helpers/trip-financials.helper";

interface RouteContext {
  params: Promise<{ publicId: string; expensePublicId: string }>;
}

export const PATCH = withErrorHandler<{ success: boolean }, [NextRequest, RouteContext]>(
  async (req, context): Promise<HandlerResult<{ success: boolean }>> => {
    const params = await context.params;
    const userPublicId = await requireAuthPublicId();

    const [userRecord] = await db.select({ id: users.id }).from(users).where(eq(users.publicId, userPublicId));
    if (!userRecord) throw new Error("User not found");

    // Verify trip ownership
    const [existingTrip] = await db
      .select({ id: sandTrips.id, boatId: sandTrips.boatId })
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

    const [existingExpense] = await db
      .select({ id: tripExpenses.id })
      .from(tripExpenses)
      .where(
        and(
          eq(tripExpenses.publicId, params.expensePublicId),
          eq(tripExpenses.sandTripId, existingTrip.id),
          isNull(tripExpenses.deletedAt)
        )
      );

    if (!existingExpense) throw new ApiError("Expense not found", 404);

    const body = await req.json();
    const data = updateTripExpenseSchema.parse({ ...body, boatPublicId: "placeholder" });

    const updateData: {
      category?: TripExpenseCategory;
      description?: string | null;
      amountTk?: string;
      expenseDate?: string | null;
    } = {};
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amountTk !== undefined) updateData.amountTk = String(data.amountTk);
    if (data.expenseDate !== undefined) updateData.expenseDate = data.expenseDate;

    if (Object.keys(updateData).length > 0) {
      await db.update(tripExpenses).set(updateData).where(eq(tripExpenses.id, existingExpense.id));
      await recalculateTripFinancials(existingTrip.id);
    }

    return { data: { success: true } };
  }
);

export const DELETE = withErrorHandler<{ success: boolean }, [NextRequest, RouteContext]>(
  async (_req, context): Promise<HandlerResult<{ success: boolean }>> => {
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

    const [deletedExpense] = await db
      .update(tripExpenses)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(tripExpenses.publicId, params.expensePublicId),
          eq(tripExpenses.sandTripId, existingTrip.id),
          isNull(tripExpenses.deletedAt)
        )
      )
      .returning({ id: tripExpenses.id });

    if (!deletedExpense) throw new ApiError("Expense not found", 404);

    await recalculateTripFinancials(existingTrip.id);

    return { data: { success: true } };
  }
);
