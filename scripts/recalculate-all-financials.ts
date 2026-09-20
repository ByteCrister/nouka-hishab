import { db } from "../src/config/db";
import { sandTrips } from "../src/db/sand";
import { recalculateTripFinancials } from "../src/lib/helpers/trip-financials.helper";
import { isNull } from "drizzle-orm";

async function run() {
  const trips = await db.select({ id: sandTrips.id }).from(sandTrips).where(isNull(sandTrips.deletedAt));
  console.log(`Found ${trips.length} trips to recalculate.`);
  for (const trip of trips) {
    await recalculateTripFinancials(trip.id);
  }
  console.log('Recalculation complete.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
