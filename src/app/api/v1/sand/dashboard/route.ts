import { requireAuthUserId } from "@/lib/auth/utils";
import { db } from "@/config/db";
import { sandTrips } from "@/db/sand";
import { boats, boatMaintenanceLogs } from "@/db/boat";
import { eq, isNull, and, sql, sum, count, desc } from "drizzle-orm";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { SandDashboardMetrics } from "@/types/sand/sand-dashboard.types";
import { BOAT_STATUSES } from "@/constants/db/boats.const";
import { SAND_TRIP_STATUSES } from "@/constants/db/sand.const";

export const GET = withErrorHandler<SandDashboardMetrics, [Request]>(async () => {
  const userId = await requireAuthUserId();

  // Run all independent queries in parallel, all scoped to the authenticated user
  const [
    tripStatsResult,
    boatStatsResult,
    maintenanceStatsResult,
    recentTripsResult,
    recentMaintenanceResult
  ] = await Promise.all([
    db
      .select({
        totalTrips: count(),
        completedTrips: sum(
          sql`CASE WHEN ${sandTrips.status} = ${SAND_TRIP_STATUSES.COMPLETED} THEN 1 ELSE 0 END`
        ).mapWith(Number),
        ongoingTrips: sum(
          sql`CASE WHEN ${sandTrips.status} IN (${SAND_TRIP_STATUSES.LOADING}, ${SAND_TRIP_STATUSES.IN_TRANSIT}) THEN 1 ELSE 0 END`
        ).mapWith(Number),
        totalRevenue: sum(sandTrips.saleAmountTk).mapWith(Number),
        currentMonthRevenue: sum(
          sql`CASE WHEN date_trunc('month', ${sandTrips.departureTime}) = date_trunc('month', CURRENT_DATE) THEN ${sandTrips.saleAmountTk} ELSE 0 END`
        ).mapWith(Number),
      })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .where(and(isNull(sandTrips.deletedAt), eq(boats.createdBy, userId))),

    db
      .select({
        totalBoats: count(),
        activeBoats: sum(
          sql`CASE WHEN ${boats.status} = ${BOAT_STATUSES.ACTIVE} THEN 1 ELSE 0 END`
        ).mapWith(Number),
      })
      .from(boats)
      .where(and(isNull(boats.deletedAt), eq(boats.sector, 'sand'), eq(boats.createdBy, userId))),

    db
      .select({
        totalCost: sum(boatMaintenanceLogs.costTk).mapWith(Number)
      })
      .from(boatMaintenanceLogs)
      .innerJoin(boats, eq(boatMaintenanceLogs.boatId, boats.id))
      .where(and(isNull(boatMaintenanceLogs.deletedAt), eq(boats.sector, 'sand'), eq(boats.createdBy, userId))),

    db
      .select({
        id: sandTrips.id,
        publicId: sandTrips.publicId,
        boatName: boats.name,
        status: sandTrips.status,
        amount: sandTrips.saleAmountTk,
        date: sandTrips.departureTime,
      })
      .from(sandTrips)
      .innerJoin(boats, eq(sandTrips.boatId, boats.id))
      .where(and(isNull(sandTrips.deletedAt), eq(boats.createdBy, userId)))
      .orderBy(desc(sandTrips.departureTime))
      .limit(5),

    db
      .select({
        id: boatMaintenanceLogs.id,
        boatName: boats.name,
        description: boatMaintenanceLogs.description,
        cost: boatMaintenanceLogs.costTk,
        date: boatMaintenanceLogs.maintenanceDate,
      })
      .from(boatMaintenanceLogs)
      .innerJoin(boats, eq(boatMaintenanceLogs.boatId, boats.id))
      .where(and(isNull(boatMaintenanceLogs.deletedAt), eq(boats.createdBy, userId)))
      .orderBy(desc(boatMaintenanceLogs.maintenanceDate))
      .limit(5),
  ]);

  const tripStats = tripStatsResult[0] || {
    totalTrips: 0,
    completedTrips: 0,
    ongoingTrips: 0,
    totalRevenue: 0,
    currentMonthRevenue: 0,
  };

  const boatStats = boatStatsResult[0] || {
    totalBoats: 0,
    activeBoats: 0,
  };

  const maintenanceStats = maintenanceStatsResult[0] || {
    totalCost: 0,
  };

  return {
    data: {
      revenue: {
        total: Number(tripStats.totalRevenue) || 0,
        currentMonth: Number(tripStats.currentMonthRevenue) || 0,
      },
      boats: {
        total: Number(boatStats.totalBoats) || 0,
        active: Number(boatStats.activeBoats) || 0,
        maintenanceCostTotal: Number(maintenanceStats.totalCost) || 0,
      },
      trips: {
        total: Number(tripStats.totalTrips) || 0,
        completed: Number(tripStats.completedTrips) || 0,
        ongoing: Number(tripStats.ongoingTrips) || 0,
      },
      recentTrips: (recentTripsResult || []).map(trip => ({
        ...trip,
        boatName: trip.boatName || 'Unknown',
        amount: Number(trip.amount) || 0,
      })),
      recentMaintenance: (recentMaintenanceResult || []).map(item => ({
        ...item,
        boatName: item.boatName || 'Unknown',
        cost: Number(item.cost) || 0,
        date: item.date ? new Date(item.date) : null,
      })),
    },
  };
});

