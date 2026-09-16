import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { sandTrips, sandTripAttachments } from "@/db/sand";
import { boats } from "@/db/boat";
import { users } from "@/db/app";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";

interface RouteContext {
  params: Promise<{ publicId: string; fileId: string }>;
}

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

    const fileIdNum = parseInt(params.fileId, 10);
    if (isNaN(fileIdNum)) throw new ApiError("Invalid file ID", 400);

    const [deletedAttachment] = await db
      .update(sandTripAttachments)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(sandTripAttachments.sandTripId, existingTrip.id),
          eq(sandTripAttachments.fileId, fileIdNum),
          isNull(sandTripAttachments.deletedAt)
        )
      )
      .returning({ fileId: sandTripAttachments.fileId });

    if (!deletedAttachment) throw new ApiError("Attachment not found", 404);

    return { data: { success: true } };
  }
);
