import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boats, boatMaintenanceLogs } from "@/db/boat";
import { eq, and, or, ilike, isNull, desc, asc, sql, count, sum, gte, lte } from "drizzle-orm";
import { requireAuthUserId } from "@/lib/auth/utils";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import {
    MaintenanceListResponse,
    MaintenanceListItem,
    MaintenanceKpis,
} from "@/types/maintenance.types";
import { getPaginationMeta } from "@/lib/helpers/pagination.helper";
import { sanitizeSearchString } from "@/lib/helpers/sanitize";
import { createMaintenanceSchema } from "@/utils/zod/maintenance.schema";

const getMaintenanceSchema = z.object({
    search: z.string().optional().default(""),
    boatId: z.string().optional().default("all"),
    fromDate: z.string().optional().nullable(),
    toDate: z.string().optional().nullable(),
    sortBy: z.enum(["maintenanceDate", "costTk", "createdAt"]).optional().default("maintenanceDate"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const GET = withErrorHandler<MaintenanceListResponse, [NextRequest]>(async (req) => {
    const userId = await requireAuthUserId();

    const { searchParams } = new URL(req.url);
    const query = getMaintenanceSchema.parse(Object.fromEntries(searchParams));

    const offset = (query.page - 1) * query.limit;

    const baseConditions = [
        isNull(boatMaintenanceLogs.deletedAt),
        eq(boatMaintenanceLogs.createdBy, userId),
    ];

    if (query.boatId && query.boatId !== 'all') {
        baseConditions.push(eq(boatMaintenanceLogs.boatId, parseInt(query.boatId, 10)));
    }

    if (query.search) {
        const sanitizedSearch = sanitizeSearchString(query.search);
        const searchCondition = or(
            ilike(boatMaintenanceLogs.description, `%${sanitizedSearch}%`),
            ilike(boatMaintenanceLogs.vendorName, `%${sanitizedSearch}%`),
            ilike(boats.name, `%${sanitizedSearch}%`)
        );
        if (searchCondition) {
            baseConditions.push(searchCondition);
        }
    }

    if (query.fromDate && query.toDate) {
        baseConditions.push(
            gte(boatMaintenanceLogs.maintenanceDate, query.fromDate),
            lte(boatMaintenanceLogs.maintenanceDate, query.toDate)
        );
    } else if (query.fromDate) {
        baseConditions.push(eq(boatMaintenanceLogs.maintenanceDate, query.fromDate));
    } else if (query.toDate) {
        baseConditions.push(eq(boatMaintenanceLogs.maintenanceDate, query.toDate));
    }

    const whereClause = and(...baseConditions);

    const sortColumn = {
        maintenanceDate: boatMaintenanceLogs.maintenanceDate,
        costTk: boatMaintenanceLogs.costTk,
        createdAt: boatMaintenanceLogs.createdAt,
    }[query.sortBy] || boatMaintenanceLogs.maintenanceDate;

    const orderByClause = query.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Current month start
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const kpiConditions = [
        isNull(boatMaintenanceLogs.deletedAt),
        eq(boatMaintenanceLogs.createdBy, userId),
    ];
    if (query.boatId && query.boatId !== 'all') {
        kpiConditions.push(eq(boatMaintenanceLogs.boatId, parseInt(query.boatId, 10)));
    }
    if (query.fromDate && query.toDate) {
        kpiConditions.push(
            gte(boatMaintenanceLogs.maintenanceDate, query.fromDate),
            lte(boatMaintenanceLogs.maintenanceDate, query.toDate)
        );
    } else if (query.fromDate) {
        kpiConditions.push(eq(boatMaintenanceLogs.maintenanceDate, query.fromDate));
    } else if (query.toDate) {
        kpiConditions.push(eq(boatMaintenanceLogs.maintenanceDate, query.toDate));
    }

    const [
        totalCountResult,
        itemsResult,
        kpiResult
    ] = await Promise.all([
        db
            .select({ count: count() })
            .from(boatMaintenanceLogs)
            .innerJoin(boats, eq(boatMaintenanceLogs.boatId, boats.id))
            .where(whereClause),
            
        db
            .select({
                id: boatMaintenanceLogs.id,
                maintenanceDate: boatMaintenanceLogs.maintenanceDate,
                description: boatMaintenanceLogs.description,
                costTk: boatMaintenanceLogs.costTk,
                vendorName: boatMaintenanceLogs.vendorName,
                notes: boatMaintenanceLogs.notes,
                boatId: boatMaintenanceLogs.boatId,
                boatName: boats.name,
            })
            .from(boatMaintenanceLogs)
            .innerJoin(boats, eq(boatMaintenanceLogs.boatId, boats.id))
            .where(whereClause)
            .orderBy(orderByClause)
            .limit(query.limit)
            .offset(offset),

        db
            .select({
                totalRecords: count(),
                totalCostTk: sum(boatMaintenanceLogs.costTk),
                currentMonthCostTk: sum(
                    sql`CASE WHEN ${boatMaintenanceLogs.maintenanceDate} >= ${startOfMonth} THEN ${boatMaintenanceLogs.costTk} ELSE 0 END`
                ),
            })
            .from(boatMaintenanceLogs)
            .where(and(...kpiConditions))
    ]);

    const totalCount = totalCountResult[0]?.count || 0;

    const kpis: MaintenanceKpis = {
        totalRecords: kpiResult[0]?.totalRecords || 0,
        totalCostTk: kpiResult[0]?.totalCostTk ? Number(kpiResult[0].totalCostTk) : 0,
        currentMonthCostTk: kpiResult[0]?.currentMonthCostTk ? Number(kpiResult[0].currentMonthCostTk) : 0,
    };

    const items: MaintenanceListItem[] = itemsResult.map(item => ({
        ...item,
        costTk: item.costTk ? Number(item.costTk) : null,
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
    const payload = createMaintenanceSchema.parse(body);

    let newMaintenanceId: number | null = null;

    await withTransaction(async (tx) => {
        // Verify boat exists and belongs to user
        const existingBoat = await tx.query.boats.findFirst({
            where: (t, { eq, and, isNull }) => and(
                eq(t.id, payload.boatId),
                eq(t.createdBy, userId),
                isNull(t.deletedAt)
            )
        });

        if (!existingBoat) {
            throw new Error('Boat not found or access denied');
        }

        const [newRecord] = await tx
            .insert(boatMaintenanceLogs)
            .values({
                boatId: payload.boatId,
                maintenanceDate: payload.maintenanceDate,
                description: payload.description,
                costTk: payload.costTk !== null && payload.costTk !== undefined ? String(payload.costTk) : null,
                vendorName: payload.vendorName ?? null,
                notes: payload.notes ?? null,
                createdBy: userId,
            })
            .returning({ id: boatMaintenanceLogs.id });
            
        newMaintenanceId = newRecord.id;
    });

    return {
        data: {
            id: newMaintenanceId
        }
    };
});
