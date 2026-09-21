import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { reports, reportAttachments } from "@/db/app";
import { files, assets } from "@/db/media";
import { eq, and } from "drizzle-orm";
import { requireAuthUserId } from "@/lib/auth/utils";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { ReportDetailResponse, ReportDetail, ReportAttachment } from "@/types/reports.types";
import { updateReportSchema } from "@/utils/zod/reports.schema";
import { REPORT_CATEGORIES, REPORT_STATUSES } from "@/constants/db/app.const";

export const GET = withErrorHandler<ReportDetailResponse, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    const userId = await requireAuthUserId();
    const resolvedParams = await params;
    const { publicId } = resolvedParams;

    const [reportRow] = await db
        .select()
        .from(reports)
        .where(
            and(
                eq(reports.publicId, publicId),
                eq(reports.userId, userId)
            )
        )
        .limit(1);

    if (!reportRow) {
        throw new ApiError("Report not found", 404);
    }

    const attachmentsRows = await db
        .select({
            fileId: reportAttachments.fileId,
            reportId: reportAttachments.reportId,
            url: assets.cloudinaryUrl,
            createdAt: reportAttachments.createdAt,
        })
        .from(reportAttachments)
        .innerJoin(files, eq(reportAttachments.fileId, files.id))
        .innerJoin(assets, eq(files.assetId, assets.id))
        .where(eq(reportAttachments.reportId, reportRow.id));

    const attachments: ReportAttachment[] = attachmentsRows.map(row => ({
        fileId: row.fileId,
        reportId: row.reportId,
        url: row.url || '',
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    }));

    const reportDetail: ReportDetail = {
        id: reportRow.id,
        publicId: reportRow.publicId,
        category: reportRow.category as typeof REPORT_CATEGORIES[keyof typeof REPORT_CATEGORIES],
        title: reportRow.title,
        description: reportRow.description,
        status: reportRow.status as typeof REPORT_STATUSES[keyof typeof REPORT_STATUSES],
        adminReply: reportRow.adminReply,
        resolvedAt: reportRow.resolvedAt ? new Date(reportRow.resolvedAt).toISOString() : null,
        createdAt: reportRow.createdAt ? new Date(reportRow.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: reportRow.updatedAt ? new Date(reportRow.updatedAt).toISOString() : new Date().toISOString(),
        attachments,
    };

    return {
        data: {
            report: reportDetail
        }
    };
});

export const PATCH = withErrorHandler<unknown, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    const userId = await requireAuthUserId();
    const resolvedParams = await params;
    const { publicId } = resolvedParams;

    const [existing] = await db
        .select({ id: reports.id })
        .from(reports)
        .where(
            and(
                eq(reports.publicId, publicId),
                eq(reports.userId, userId)
            )
        )
        .limit(1);

    if (!existing) {
        throw new ApiError("Report not found", 404);
    }

    const body = await req.json();
    const payload = updateReportSchema.parse(body);

    const updateData: {
        status?: typeof REPORT_STATUSES[keyof typeof REPORT_STATUSES];
        resolvedAt?: Date;
        adminReply?: string | null;
    } = {};
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.status === REPORT_STATUSES.RESOLVED) updateData.resolvedAt = new Date();
    if (payload.adminReply !== undefined) updateData.adminReply = payload.adminReply;

    const [updated] = await db
        .update(reports)
        .set({
            ...updateData,
            updatedAt: new Date()
        })
        .where(eq(reports.id, existing.id))
        .returning();

    return {
        data: updated
    };
});

export const DELETE = withErrorHandler<unknown, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    const userId = await requireAuthUserId();
    const resolvedParams = await params;
    const { publicId } = resolvedParams;

    const [existing] = await db
        .select({ id: reports.id })
        .from(reports)
        .where(
            and(
                eq(reports.publicId, publicId),
                eq(reports.userId, userId)
            )
        )
        .limit(1);

    if (!existing) {
        throw new ApiError("Report not found", 404);
    }

    await db.delete(reports).where(eq(reports.id, existing.id));

    return {
        data: { success: true }
    };
});
