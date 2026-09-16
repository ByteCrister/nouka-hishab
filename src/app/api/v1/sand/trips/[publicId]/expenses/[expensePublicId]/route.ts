import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { sandTrips, sandTripExpenses } from "@/db/sand";
import { boats } from "@/db/boat";
import { users } from "@/db/app";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { updateSandTripExpenseSchema } from "@/utils/zod/sand-trips.schema";
import { SandTripExpenseCategory } from "@/constants/db/sand.const";

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

    const [existingExpense] = await db
      .select({ id: sandTripExpenses.id })
      .from(sandTripExpenses)
      .where(
        and(
          eq(sandTripExpenses.publicId, params.expensePublicId),
          eq(sandTripExpenses.sandTripId, existingTrip.id),
          isNull(sandTripExpenses.deletedAt)
        )
      );

    if (!existingExpense) throw new ApiError("Expense not found", 404);

    const body = await req.json();
    const data = updateSandTripExpenseSchema.parse(body);

    const updateData: {
      category?: SandTripExpenseCategory;
      description?: string | null;
      amountTk?: string;
      expenseDate?: string | null;
    } = {};
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amountTk !== undefined) updateData.amountTk = String(data.amountTk);
    if (data.expenseDate !== undefined) updateData.expenseDate = data.expenseDate;

    if (Object.keys(updateData).length > 0) {
      await db.update(sandTripExpenses).set(updateData).where(eq(sandTripExpenses.id, existingExpense.id));
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
      .update(sandTripExpenses)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(sandTripExpenses.publicId, params.expensePublicId),
          eq(sandTripExpenses.sandTripId, existingTrip.id),
          isNull(sandTripExpenses.deletedAt)
        )
      )
      .returning({ id: sandTripExpenses.id });

    if (!deletedExpense) throw new ApiError("Expense not found", 404);

    return { data: { success: true } };
  }
);
