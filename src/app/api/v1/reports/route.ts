import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { reports, reportAttachments } from "@/db/app";
import { eq, and, or, ilike, desc, asc, sql, count, sum } from "drizzle-orm";
import { requireAuthUserId } from "@/lib/auth/utils";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import {
    ReportListResponse,
    ReportListItem,
    ReportListKpis
} from "@/types/reports.types";
import { REPORT_CATEGORIES, REPORT_STATUSES } from "@/constants/db/app.const";
import { getPaginationMeta } from "@/lib/helpers/pagination.helper";
import { buildFuzzySearchPattern } from "@/lib/helpers/sanitize";
import { createReportSchema } from "@/utils/zod/reports.schema";

const getReportsSchema = z.object({
    search: z.string().optional().default(""),
    category: z.string().optional().default("all"),
    status: z.string().optional().default("all"),
    sortBy: z.enum(["createdAt", "status", "category"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const GET = withErrorHandler<ReportListResponse, [NextRequest]>(async (req) => {
    const userId = await requireAuthUserId();
    const { searchParams } = new URL(req.url);
    const query = getReportsSchema.parse(Object.fromEntries(searchParams));
    const offset = (query.page - 1) * query.limit;

    // Normal users only see their own reports.
    const baseConditions = [
        eq(reports.userId, userId),
    ];

    if (query.search) {
        const fuzzySearch = buildFuzzySearchPattern(query.search);
        baseConditions.push(
            or(
                ilike(reports.title, fuzzySearch),
                ilike(reports.publicId, fuzzySearch)
            )!
        );
    }

    if (query.category && query.category !== 'all') {
        const cat = query.category as typeof REPORT_CATEGORIES[keyof typeof REPORT_CATEGORIES];
        baseConditions.push(eq(reports.category, cat));
    }

    if (query.status && query.status !== 'all') {
        const stat = query.status as typeof REPORT_STATUSES[keyof typeof REPORT_STATUSES];
        baseConditions.push(eq(reports.status, stat));
    }

    const whereClause = and(...baseConditions);

    const sortColumn = query.sortBy === 'category' ? reports.category :
                       query.sortBy === 'status' ? reports.status : 
                       reports.createdAt;
    const orderByClause = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const [kpiResult, countResult, itemsResult] = await Promise.all([
        db
            .select({
                totalReports: count(),
                openReports: sum(sql`CASE WHEN ${reports.status} = ${REPORT_STATUSES.OPEN} THEN 1 ELSE 0 END`).mapWith(Number),
                inReviewReports: sum(sql`CASE WHEN ${reports.status} = ${REPORT_STATUSES.IN_REVIEW} THEN 1 ELSE 0 END`).mapWith(Number),
                resolvedReports: sum(sql`CASE WHEN ${reports.status} = ${REPORT_STATUSES.RESOLVED} THEN 1 ELSE 0 END`).mapWith(Number),
            })
            .from(reports)
            .where(whereClause),

        db
            .select({ count: count() })
            .from(reports)
            .where(whereClause),

        db
            .select({
                id: reports.id,
                publicId: reports.publicId,
                category: reports.category,
                title: reports.title,
                status: reports.status,
                createdAt: reports.createdAt,
            })
            .from(reports)
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(query.limit)
            .offset(offset)
    ]);

    const totalCount = countResult[0]?.count || 0;
    const kpis: ReportListKpis = {
        totalReports: kpiResult[0]?.totalReports || 0,
        openReports: kpiResult[0]?.openReports || 0,
        inReviewReports: kpiResult[0]?.inReviewReports || 0,
        resolvedReports: kpiResult[0]?.resolvedReports || 0,
    };

    const items: ReportListItem[] = itemsResult.map(item => ({
        id: item.id,
        publicId: item.publicId,
        category: item.category as typeof REPORT_CATEGORIES[keyof typeof REPORT_CATEGORIES],
        title: item.title,
        status: item.status as typeof REPORT_STATUSES[keyof typeof REPORT_STATUSES],
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    }));

    return {
        data: {
            items,
            meta: getPaginationMeta(totalCount, query.page, query.limit),
            kpis,
        }
    };
});

export const POST = withErrorHandler<unknown, [NextRequest]>(async (req) => {
    const userId = await requireAuthUserId();

    const body = await req.json();
    const payload = createReportSchema.parse(body);

    const newReport = await db.transaction(async (tx) => {
        const [report] = await tx
            .insert(reports)
            .values({
                userId,
                title: payload.title,
                category: payload.category,
                description: payload.description || null,
                status: REPORT_STATUSES.OPEN,
            })
            .returning();

        if (payload.attachmentIds && payload.attachmentIds.length > 0) {
            const attachmentRecords = payload.attachmentIds.map(fileId => ({
                reportId: report.id,
                fileId,
            }));
            await tx.insert(reportAttachments).values(attachmentRecords);
        }

        return report;
    });

    return {
        data: newReport,
        status: 201
    };
});
