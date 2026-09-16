import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { sandTrips, sandTripAttachments } from "@/db/sand";
import { boats } from "@/db/boat";
import { files } from "@/db/media";
import { users } from "@/db/app";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { createSandTripAttachmentSchema } from "@/utils/zod/sand-trips.schema";

interface RouteContext {
  params: Promise<{ publicId: string }>;
}

export const POST = withErrorHandler<{ success: boolean }, [NextRequest, RouteContext]>(
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

    const body = await req.json();
    const data = createSandTripAttachmentSchema.parse(body);

    const [fileRecord] = await db
      .select({ id: files.id })
      .from(files)
      .where(eq(files.id, data.fileId));

    if (!fileRecord) throw new ApiError("File not found", 404);

    // Upsert or just insert
    // Since it's a composite primary key, we handle conflicts gracefully
    await db.insert(sandTripAttachments).values({
      sandTripId: existingTrip.id,
      fileId: fileRecord.id,
      description: data.description ?? null,
      deletedAt: null, // ensure it's not marked as deleted if recreating
    }).onConflictDoUpdate({
      target: [sandTripAttachments.sandTripId, sandTripAttachments.fileId],
      set: {
        description: data.description ?? null,
        deletedAt: null, // restore
      }
    });

    return {
      data: { success: true },
      status: 201,
    };
  }
);
