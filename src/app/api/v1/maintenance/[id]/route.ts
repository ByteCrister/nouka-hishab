import { NextRequest } from "next/server";
import { boatMaintenanceLogs } from "@/db/boat";
import { eq } from "drizzle-orm";
import { requireAuthUserId } from "@/lib/auth/utils";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { updateMaintenanceSchema } from "@/utils/zod/maintenance.schema";

export const PUT = withErrorHandler<unknown, [NextRequest, { params: Promise<{ id: string }> }]>(
    async (req, { params }) => {
        const userId = await requireAuthUserId();
        const { id } = await params;
        const maintenanceId = parseInt(id, 10);

        if (isNaN(maintenanceId)) {
            throw new Error("Invalid maintenance ID");
        }

        const body = await req.json();
        const payload = updateMaintenanceSchema.parse(body);

        await withTransaction(async (tx) => {
            // Verify record exists and belongs to user
            const existingRecord = await tx.query.boatMaintenanceLogs.findFirst({
                where: (t, { eq, and, isNull }) => and(
                    eq(t.id, maintenanceId),
                    eq(t.createdBy, userId),
                    isNull(t.deletedAt)
                )
            });

            if (!existingRecord) {
                throw new Error("Maintenance record not found or access denied");
            }

            if (payload.boatId) {
                const existingBoat = await tx.query.boats.findFirst({
                    where: (t, { eq, and, isNull }) => and(
                        eq(t.id, payload.boatId!),
                        eq(t.createdBy, userId),
                        isNull(t.deletedAt)
                    )
                });
                
                if (!existingBoat) {
                    throw new Error("Target boat not found or access denied");
                }
            }

            await tx
                .update(boatMaintenanceLogs)
                .set({
                    boatId: payload.boatId !== undefined ? payload.boatId : existingRecord.boatId,
                    maintenanceDate: payload.maintenanceDate !== undefined ? payload.maintenanceDate : existingRecord.maintenanceDate,
                    description: payload.description !== undefined ? payload.description : existingRecord.description,
                    costTk: payload.costTk !== undefined ? (payload.costTk !== null ? String(payload.costTk) : null) : existingRecord.costTk,
                    vendorName: payload.vendorName !== undefined ? payload.vendorName : existingRecord.vendorName,
                    notes: payload.notes !== undefined ? payload.notes : existingRecord.notes,
                })
                .where(eq(boatMaintenanceLogs.id, maintenanceId));
        });

        return {
            data: { success: true }
        };
    }
);

export const DELETE = withErrorHandler<unknown, [NextRequest, { params: Promise<{ id: string }> }]>(
    async (req, { params }) => {
        const userId = await requireAuthUserId();
        const { id } = await params;
        const maintenanceId = parseInt(id, 10);

        if (isNaN(maintenanceId)) {
            throw new Error("Invalid maintenance ID");
        }

        await withTransaction(async (tx) => {
            // Verify record exists and belongs to user
            const existingRecord = await tx.query.boatMaintenanceLogs.findFirst({
                where: (t, { eq, and, isNull }) => and(
                    eq(t.id, maintenanceId),
                    eq(t.createdBy, userId),
                    isNull(t.deletedAt)
                )
            });

            if (!existingRecord) {
                throw new Error("Maintenance record not found or access denied");
            }

            // Soft delete
            await tx
                .update(boatMaintenanceLogs)
                .set({
                    deletedAt: new Date(),
                })
                .where(eq(boatMaintenanceLogs.id, maintenanceId));
        });

        return {
            data: { success: true }
        };
    }
);
