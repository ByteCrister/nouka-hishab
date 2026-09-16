import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { sandTrips, sandTripExpenses } from "@/db/sand";
import { boats } from "@/db/boat";
import { users } from "@/db/app";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { createSandTripExpenseSchema } from "@/utils/zod/sand-trips.schema";

interface RouteContext {
  params: { publicId: string };
}

export const POST = withErrorHandler<{ success: boolean; publicId: string }, [NextRequest, RouteContext]>(
  async (req, { params }): Promise<HandlerResult<{ success: boolean; publicId: string }>> => {
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

    return {
      data: { success: true, publicId: newExpense.publicId },
      status: 201,
    };
  }
);
