import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boatDocuments } from "@/db/boat";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";

const updateDocumentSchema = z.object({
    documentType: z.string().min(1).max(50).optional(),
    description: z.string().max(500).nullable().optional(),
    expiryDate: z.string().nullable().optional(),
});

export const PATCH = withErrorHandler<boolean, [NextRequest, { params: Promise<{ publicId: string; documentId: string }> }]>(async (req, { params }) => {
    await requireAuthPublicId();

    const { documentId } = await params;
    const body = await req.json();
    const payload = updateDocumentSchema.parse(body);

    const id = parseInt(documentId, 10);
    if (isNaN(id)) throw new ApiError("Invalid document ID", 400);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (payload.documentType !== undefined) updateData.documentType = payload.documentType;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.expiryDate !== undefined) updateData.expiryDate = payload.expiryDate;

    const [updated] = await db
        .update(boatDocuments)
        .set(updateData)
        .where(and(eq(boatDocuments.id, id), isNull(boatDocuments.deletedAt)))
        .returning();

    if (!updated) {
        throw new ApiError("Document not found", 404);
    }

    return {
        data: true
    };
});

export const DELETE = withErrorHandler<boolean, [NextRequest, { params: Promise<{ publicId: string; documentId: string }> }]>(async (req, { params }) => {
    await requireAuthPublicId();

    const { documentId } = await params;
    const id = parseInt(documentId, 10);
    if (isNaN(id)) throw new ApiError("Invalid document ID", 400);

    const [deleted] = await db
        .update(boatDocuments)
        .set({ deletedAt: new Date() })
        .where(and(eq(boatDocuments.id, id), isNull(boatDocuments.deletedAt)))
        .returning();

    if (!deleted) {
        throw new ApiError("Document not found", 404);
    }

    return {
        data: true
    };
});
