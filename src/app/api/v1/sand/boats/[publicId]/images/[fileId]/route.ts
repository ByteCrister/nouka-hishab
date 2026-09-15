import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { boats, boatImages } from "@/db/boat";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

export const DELETE = withErrorHandler<boolean, [NextRequest, { params: Promise<{ publicId: string, fileId: string }> }]>(async (req, { params }) => {
    await requireAuthPublicId();

    const { publicId, fileId: fileIdStr } = await params;
    const fileId = parseInt(fileIdStr, 10);

    if (isNaN(fileId)) {
        throw new ApiError("Invalid file ID", 400);
    }

    const boatResult = await db
        .select({ id: boats.id })
        .from(boats)
        .where(and(eq(boats.publicId, publicId), isNull(boats.deletedAt)))
        .limit(1);

    if (!boatResult.length) {
        throw new ApiError("Boat not found", 404);
    }
    const boatId = boatResult[0].id;

    // Soft delete the image link
    const [deletedImage] = await db
        .update(boatImages)
        .set({ deletedAt: new Date() })
        .where(and(
            eq(boatImages.boatId, boatId),
            eq(boatImages.fileId, fileId),
            isNull(boatImages.deletedAt)
        ))
        .returning();

    if (!deletedImage) {
        throw new ApiError("Image not found on this boat", 404);
    }

    return {
        data: true
    };
});
