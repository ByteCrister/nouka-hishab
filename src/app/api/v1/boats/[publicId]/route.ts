import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { boats, boatImages, boatMaintenanceLogs, boatDocuments } from "@/db/boat";
import { files, assets } from "@/db/media";
import { sandTrips } from "@/db/sand";
import { eq, and, isNull, sql, max, sum, count } from "drizzle-orm";
import { requireAuthUserId } from "@/lib/auth/utils";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { BoatDetailResponse, BoatDetail, BoatImage, BoatDetailKpis, BoatDocument } from "@/types/boats.types";
import { SAND_TRIP_STATUSES } from "@/constants/db/sand.const";
import { SECTORS } from "@/constants/db/app.const";
import { updateBoatSchema } from "@/utils/zod/boats.schema";

export const GET = withErrorHandler<BoatDetailResponse, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    const userId = await requireAuthUserId();

    const { publicId } = await params;

    const [boatResult] = await db
        .select({
            id: boats.id,
            publicId: boats.publicId,
            name: boats.name,
            registrationNumber: boats.registrationNumber,
            lengthM: boats.lengthM,
            widthM: boats.widthM,
            draftM: boats.draftM,
            engineMake: boats.engineMake,
            engineHp: boats.engineHp,
            engineNotes: boats.engineNotes,
            boatValueTk: boats.boatValueTk,
            capacityValue: boats.capacityValue,
            capacityUnit: boats.capacityUnit,
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
        .leftJoin(boatImages, and(
            eq(boatImages.boatId, boats.id),
            eq(boatImages.isPrimary, true),
            isNull(boatImages.deletedAt)
        ))
        .leftJoin(files, eq(boatImages.fileId, files.id))
        .leftJoin(assets, eq(files.assetId, assets.id))
        .where(and(eq(boats.publicId, publicId), isNull(boats.deletedAt), eq(boats.createdBy, userId)))
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

    const documentsResult = await db
        .select({
            id: boatDocuments.id,
            fileId: boatDocuments.fileId,
            documentType: boatDocuments.documentType,
            description: boatDocuments.description,
            expiryDate: boatDocuments.expiryDate,
            url: assets.cloudinaryUrl,
            format: assets.cloudinaryFormat,
            createdAt: boatDocuments.createdAt,
            updatedAt: boatDocuments.updatedAt,
        })
        .from(boatDocuments)
        .innerJoin(files, eq(boatDocuments.fileId, files.id))
        .innerJoin(assets, eq(files.assetId, assets.id))
        .where(and(
            eq(boatDocuments.boatId, boatResult.id),
            isNull(boatDocuments.deletedAt)
        ));

    const documents: BoatDocument[] = documentsResult.map(doc => ({
        id: doc.id,
        fileId: doc.fileId,
        documentType: doc.documentType,
        description: doc.description,
        expiryDate: doc.expiryDate,
        url: doc.url,
        format: doc.format,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    }));

    const detail: BoatDetail = {
        id: boatResult.id,
        publicId: boatResult.publicId,
        name: boatResult.name,
        registrationNumber: boatResult.registrationNumber,
        lengthM: boatResult.lengthM ? Number(boatResult.lengthM) : null,
        widthM: boatResult.widthM ? Number(boatResult.widthM) : null,
        draftM: boatResult.draftM ? Number(boatResult.draftM) : null,
        engineMake: boatResult.engineMake,
        engineHp: boatResult.engineHp ? Number(boatResult.engineHp) : null,
        engineNotes: boatResult.engineNotes,
        boatValueTk: boatResult.boatValueTk ? Number(boatResult.boatValueTk) : null,
        capacityValue: boatResult.capacityValue ? Number(boatResult.capacityValue) : null,
        capacityUnit: boatResult.capacityUnit,
        status: boatResult.status,
        notes: boatResult.notes,
        primaryImageUrl: boatResult.primaryImageUrl || null,
        totalTrips: boatResult.totalTrips || 0,
        lastTripAt: boatResult.lastTripAt ? new Date(boatResult.lastTripAt).toISOString() : null,
        sector: SECTORS.SAND,
        images,
        documents,
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
    const userId = await requireAuthUserId();

    const { publicId } = await params;
    const body = await req.json();
    const payload = updateBoatSchema.parse(body);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.registrationNumber !== undefined) updateData.registrationNumber = payload.registrationNumber ? payload.registrationNumber : null;
    if (payload.capacityValue !== undefined) updateData.capacityValue = payload.capacityValue ? String(payload.capacityValue) : null;
    if (payload.capacityUnit !== undefined) updateData.capacityUnit = payload.capacityUnit ? payload.capacityUnit : null;
    if (payload.lengthM !== undefined) updateData.lengthM = payload.lengthM ? String(payload.lengthM) : null;
    if (payload.widthM !== undefined) updateData.widthM = payload.widthM ? String(payload.widthM) : null;
    if (payload.draftM !== undefined) updateData.draftM = payload.draftM ? String(payload.draftM) : null;
    if (payload.engineMake !== undefined) updateData.engineMake = payload.engineMake ? payload.engineMake : null;
    if (payload.engineHp !== undefined) updateData.engineHp = payload.engineHp ? String(payload.engineHp) : null;
    if (payload.engineNotes !== undefined) updateData.engineNotes = payload.engineNotes ? payload.engineNotes : null;
    if (payload.boatValueTk !== undefined) updateData.boatValueTk = payload.boatValueTk ? String(payload.boatValueTk) : null;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.notes !== undefined) updateData.notes = payload.notes ? payload.notes : null;

    const [updatedBoat] = await db
        .update(boats)
        .set(updateData)
        .where(and(eq(boats.publicId, publicId), isNull(boats.deletedAt), eq(boats.createdBy, userId)))
        .returning();

    if (!updatedBoat) {
        throw new ApiError("Boat not found", 404);
    }

    return {
        data: updatedBoat
    };
});

export const DELETE = withErrorHandler<boolean, [NextRequest, { params: Promise<{ publicId: string }> }]>(async (req, { params }) => {
    const userId = await requireAuthUserId();

    const { publicId } = await params;

    const [deletedBoat] = await db
        .update(boats)
        .set({ deletedAt: new Date() })
        .where(and(eq(boats.publicId, publicId), isNull(boats.deletedAt), eq(boats.createdBy, userId)))
        .returning();

    if (!deletedBoat) {
        throw new ApiError("Boat not found", 404);
    }

    // Soft delete associated images
    await db
        .update(boatImages)
        .set({ deletedAt: new Date() })
        .where(and(eq(boatImages.boatId, deletedBoat.id), isNull(boatImages.deletedAt)));

    // Soft delete associated documents
    await db
        .update(boatDocuments)
        .set({ deletedAt: new Date() })
        .where(and(eq(boatDocuments.boatId, deletedBoat.id), isNull(boatDocuments.deletedAt)));

    return {
        data: true
    };
});
