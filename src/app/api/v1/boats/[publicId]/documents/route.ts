import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { boats, boatDocuments } from "@/db/boat";
import { files } from "@/db/media";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { uploadBoatDocumentSchema } from "@/utils/zod/boats.schema";

export const POST = withErrorHandler<boolean, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    await requireAuthPublicId();

    const { publicId } = await params;
    const body = await req.json();
    const payload = uploadBoatDocumentSchema.parse(body);

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

    // Insert the new document linking record
    await db
        .insert(boatDocuments)
        .values({
            boatId,
            fileId: payload.fileId,
            documentType: payload.documentType,
            description: payload.description || null,
            expiryDate: payload.expiryDate || null,
        });

    return {
        data: true,
        status: 201
    };
});
