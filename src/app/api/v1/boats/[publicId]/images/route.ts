import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boats, boatImages } from "@/db/boat";
import { files } from "@/db/media";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";

const addBoatImageSchema = z.object({
    fileId: z.number().int().positive(),
    isPrimary: z.boolean().optional().default(false),
});

export const POST = withErrorHandler<boolean, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    await requireAuthPublicId();

    const { publicId } = await params;
    const body = await req.json();
    const payload = addBoatImageSchema.parse(body);

    const boatResult = await db
        .select({ id: boats.id })
        .from(boats)
        .where(and(eq(boats.publicId, publicId), isNull(boats.deletedAt)))
        .limit(1);

    if (!boatResult.length) {
        throw new ApiError("Boat not found", 404);
    }
    const boatId = boatResult[0].id;

    // Verify the file exists
    const fileResult = await db
        .select({ id: files.id })
        .from(files)
        .where(and(eq(files.id, payload.fileId), isNull(files.deletedAt)))
        .limit(1);

    if (!fileResult.length) {
        throw new ApiError("File not found", 404);
    }

    await withTransaction(async (tx) => {
        if (payload.isPrimary) {
            // Unset any existing primary image
            await tx
                .update(boatImages)
                .set({ isPrimary: false })
                .where(and(eq(boatImages.boatId, boatId), isNull(boatImages.deletedAt)));
        }

        // Insert the new image linking record
        await tx
            .insert(boatImages)
            .values({
                boatId,
                fileId: payload.fileId,
                isPrimary: payload.isPrimary,
                sortOrder: 0,
            });
    });

    return {
        data: true,
        status: 201
    };
});
