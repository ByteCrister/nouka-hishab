import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/config/db";
import { boats, boatImages, boatMaintenanceLogs } from "@/db/boat";
import { sectors } from "@/db/app";
import { files, assets } from "@/db/media";
import { sandTrips } from "@/db/sand";
import { eq, and, isNull, sql, max, sum, count } from "drizzle-orm";
import { requireAuthPublicId } from "@/lib/auth/utils";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { BoatDetailResponse, BoatDetail, BoatImage, BoatDetailKpis } from "@/types/sand/boats.types";
import { BOAT_STATUSES, BOAT_CAPACITY_UNITS } from "@/constants/db/boats.const";
import { SAND_TRIP_STATUSES } from "@/constants/db/sand.const";

const updateBoatSchema = z.object({
    name: z.string().min(1, "Name is required").max(255).optional(),
    sectorId: z.number().int().positive().optional(),
    capacityValue: z.number().positive().nullable().optional(),
    capacityUnit: z.enum([BOAT_CAPACITY_UNITS.CUBIC_FT, BOAT_CAPACITY_UNITS.TON]).nullable().optional(),
    status: z.enum([BOAT_STATUSES.ACTIVE, BOAT_STATUSES.MAINTENANCE, BOAT_STATUSES.INACTIVE]).optional(),
    notes: z.string().nullable().optional(),
});

export const GET = withErrorHandler<BoatDetailResponse, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    await requireAuthPublicId();

    const { publicId } = await params;

    const [boatResult] = await db
        .select({
            id: boats.id,
            publicId: boats.publicId,
            name: boats.name,
            sectorId: boats.sectorId,
            sectorName: sectors.nameEn,
            capacityValue: boats.capacityValue,
            capacityUnit: boats.capacityUnit,
            boatValueTk: boats.boatValueTk,
            status: boats.status,
            notes: boats.notes,
            primaryImageUrl: assets.cloudinaryUrl,
            createdAt: boats.createdAt,
            updatedAt: boats.updatedAt,
            // KPIs
            totalTrips: sql<number>`(SELECT COUNT(*)::int FROM ${sandTrips} WHERE ${sandTrips.boatId} = ${boats.id} AND ${sandTrips.deletedAt} IS NULL)`,
            totalVolume: sql<number>`(SELECT COALESCE(SUM(${sandTrips.cargoValue})::float, 0) FROM ${sandTrips} WHERE ${sandTrips.boatId} = ${boats.id} AND ${sandTrips.deletedAt} IS NULL)`,
            totalRevenueTk: sql<number>`(SELECT COALESCE(SUM(${sandTrips.saleAmountTk})::float, 0) FROM ${sandTrips} WHERE ${sandTrips.boatId} = ${boats.id} AND ${sandTrips.deletedAt} IS NULL)`,
            lastTripAt: sql<string | null>`(SELECT MAX(${sandTrips.departureTime}) FROM ${sandTrips} WHERE ${sandTrips.boatId} = ${boats.id} AND ${sandTrips.deletedAt} IS NULL)`
        })
        .from(boats)
        .innerJoin(sectors, eq(boats.sectorId, sectors.id))
        .leftJoin(boatImages, and(
            eq(boatImages.boatId, boats.id),
            eq(boatImages.isPrimary, true),
            isNull(boatImages.deletedAt)
        ))
        .leftJoin(files, eq(boatImages.fileId, files.id))
        .leftJoin(assets, eq(files.assetId, assets.id))
        .where(and(eq(boats.publicId, publicId), isNull(boats.deletedAt)))
        .limit(1);

    if (!boatResult) {
        throw new ApiError("Boat not found", 404);
    }

    const imagesResult = await db
        .select({
            fileId: boatImages.fileId,
            url: assets.cloudinaryUrl,
            isPrimary: boatImages.isPrimary,
            sortOrder: boatImages.sortOrder
        })
        .from(boatImages)
        .innerJoin(files, eq(boatImages.fileId, files.id))
        .innerJoin(assets, eq(files.assetId, assets.id))
        .where(and(
            eq(boatImages.boatId, boatResult.id),
            isNull(boatImages.deletedAt)
        ))
        .orderBy(boatImages.sortOrder);

    const images: BoatImage[] = imagesResult.map(img => ({
        fileId: img.fileId,
        url: img.url,
        isPrimary: img.isPrimary || false,
        sortOrder: img.sortOrder || 0
    }));

    const detail: BoatDetail = {
        id: boatResult.id,
        publicId: boatResult.publicId,
        name: boatResult.name,
        sectorId: boatResult.sectorId,
        sectorName: boatResult.sectorName || null,
        capacityValue: boatResult.capacityValue ? Number(boatResult.capacityValue) : null,
        capacityUnit: boatResult.capacityUnit,
        status: boatResult.status,
        notes: boatResult.notes,
        primaryImageUrl: boatResult.primaryImageUrl || null,
        totalTrips: boatResult.totalTrips || 0,
        lastTripAt: boatResult.lastTripAt ? new Date(boatResult.lastTripAt).toISOString() : null,
        images,
        updatedAt: boatResult.updatedAt ? new Date(boatResult.updatedAt).toISOString() : new Date().toISOString(),
    };

    // Calculate KPIs in parallel
    const [tripsKpis, maintenanceKpis] = await Promise.all([
        db
            .select({
                totalTrips: count(),
                completedTrips: sum(sql`CASE WHEN ${sandTrips.status} = ${SAND_TRIP_STATUSES.COMPLETED} THEN 1 ELSE 0 END`).mapWith(Number),
                ongoingTrips: sum(sql`CASE WHEN ${sandTrips.status} IN (${SAND_TRIP_STATUSES.LOADING}, ${SAND_TRIP_STATUSES.IN_TRANSIT}) THEN 1 ELSE 0 END`).mapWith(Number),
                totalCargoMoved: sum(sandTrips.cargoValue).mapWith(Number),
                totalRevenueTk: sum(sandTrips.saleAmountTk).mapWith(Number),
                totalOperatingCostTk: sum(sandTrips.totalOperatingCostTk).mapWith(Number),
                netProfitTk: sum(sandTrips.netProfitTk).mapWith(Number),
                lastTripAt: max(sandTrips.departureTime),
            })
            .from(sandTrips)
            .where(and(
                eq(sandTrips.boatId, boatResult.id),
                isNull(sandTrips.deletedAt)
            )),

        db
            .select({
                totalMaintenanceCostTk: sum(boatMaintenanceLogs.costTk).mapWith(Number)
            })
            .from(boatMaintenanceLogs)
            .where(and(
                eq(boatMaintenanceLogs.boatId, boatResult.id),
                isNull(boatMaintenanceLogs.deletedAt)
            ))
    ]);

    const tKpis = tripsKpis[0];
    const mKpis = maintenanceKpis[0];

    const totalTrips = tKpis?.totalTrips || 0;
    const netProfitTk = tKpis?.netProfitTk || 0;
    const avgProfitPerTripTk = totalTrips > 0 ? (netProfitTk / totalTrips) : 0;

    const kpis: BoatDetailKpis = {
        totalTrips,
        completedTrips: tKpis?.completedTrips || 0,
        ongoingTrips: tKpis?.ongoingTrips || 0,
        totalCargoMoved: tKpis?.totalCargoMoved || 0,
        totalRevenueTk: tKpis?.totalRevenueTk || 0,
        totalOperatingCostTk: tKpis?.totalOperatingCostTk || 0,
        netProfitTk,
        avgProfitPerTripTk,
        totalMaintenanceCostTk: mKpis?.totalMaintenanceCostTk || 0,
        lastTripAt: tKpis?.lastTripAt ? tKpis.lastTripAt.toISOString() : null,
    };

    return {
        data: {
            boat: detail,
            kpis,
        }
    };
});

export const PATCH = withErrorHandler<unknown, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    await requireAuthPublicId();

    const { publicId } = await params;
    const body = await req.json();
    const payload = updateBoatSchema.parse(body);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.sectorId !== undefined) updateData.sectorId = payload.sectorId;
    if (payload.capacityValue !== undefined) updateData.capacityValue = payload.capacityValue ? String(payload.capacityValue) : null;
    if (payload.capacityUnit !== undefined) updateData.capacityUnit = payload.capacityUnit;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.notes !== undefined) updateData.notes = payload.notes;

    const [updatedBoat] = await db
        .update(boats)
        .set(updateData)
        .where(and(eq(boats.publicId, publicId), isNull(boats.deletedAt)))
        .returning();

    if (!updatedBoat) {
        throw new ApiError("Boat not found", 404);
    }

    return {
        data: updatedBoat
    };
});

export const DELETE = withErrorHandler<boolean, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    await requireAuthPublicId();
    
    const { publicId } = await params;

    const [deletedBoat] = await db
        .update(boats)
        .set({ deletedAt: new Date() })
        .where(and(eq(boats.publicId, publicId), isNull(boats.deletedAt)))
        .returning();

    if (!deletedBoat) {
        throw new ApiError("Boat not found", 404);
    }

    // Soft delete associated images
    await db
        .update(boatImages)
        .set({ deletedAt: new Date() })
        .where(and(eq(boatImages.boatId, deletedBoat.id), isNull(boatImages.deletedAt)));

    return {
        data: true
    };
});
