import { db } from "@/config/db";
import { sandTrips, sandTripExpenses } from "@/db/sand";
import { eq, sql, and, isNull } from "drizzle-orm";

/**
 * Recalculates and persists `totalOperatingCostTk` and `netProfitTk` for a trip.
 *
 * totalOperatingCostTk = purchaseCostTk + govtRoyaltyTk + localTollTk
 *                        + operatingCostTk (upfront boat operating cost)
 *                        + SUM(sandTripExpenses.amountTk)  (additional logged expenses)
 *
 * netProfitTk = saleAmountTk - totalOperatingCostTk
 */
export async function recalculateTripFinancials(tripId: number) {
  // 1. Sum all logged expense entries for this trip
  const [expenseAgg] = await db
    .select({ total: sql<string>`COALESCE(SUM(${sandTripExpenses.amountTk}), 0)` })
    .from(sandTripExpenses)
    .where(and(eq(sandTripExpenses.sandTripId, tripId), isNull(sandTripExpenses.deletedAt)));

  const expensesTotal = Number(expenseAgg?.total ?? 0);

  // 2. Fetch the trip's own cost columns + sale amount
  const [trip] = await db
    .select({
      saleAmountTk:      sandTrips.saleAmountTk,
      purchaseCostTk:    sandTrips.purchaseCostTk,
      govtRoyaltyTk:     sandTrips.govtRoyaltyTk,
      localTollTk:       sandTrips.localTollTk,
      operatingCostTk:   sandTrips.operatingCostTk,   // upfront boat operating cost
    })
    .from(sandTrips)
    .where(eq(sandTrips.id, tripId));

  if (!trip) return;

  const sale      = Number(trip.saleAmountTk    ?? 0);
  const purchase  = Number(trip.purchaseCostTk  ?? 0);
  const royalty   = Number(trip.govtRoyaltyTk   ?? 0);
  const toll      = Number(trip.localTollTk     ?? 0);
  const operating = Number(trip.operatingCostTk ?? 0);

  // 3. Total operating cost = every cost category combined
  const totalOperatingCostTk = purchase + royalty + toll + operating + expensesTotal;

  // 4. Net profit = sale minus all costs
  const netProfitTk = sale - totalOperatingCostTk;

  // 5. Persist both derived values
  await db
    .update(sandTrips)
    .set({
      totalOperatingCostTk: String(totalOperatingCostTk),
      netProfitTk:          String(netProfitTk),
    })
    .where(eq(sandTrips.id, tripId));
}
