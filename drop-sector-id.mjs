import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("Dropping sector_id column from boats...");
  try {
    await db.execute(`ALTER TABLE boats DROP COLUMN IF EXISTS sector_id;`);
    console.log("Dropped sector_id from boats.");
  } catch (err) {
    console.error("Error dropping sector_id from boats:", err);
  }
  
  console.log("Dropping sector_id column from subscription_plans...");
  try {
    await db.execute(`ALTER TABLE subscription_plans DROP COLUMN IF EXISTS sector_id;`);
    console.log("Dropped sector_id from subscription_plans.");
  } catch (err) {
    console.error("Error dropping sector_id from subscription_plans:", err);
  }
  
  console.log("Done!");
}

main().catch(console.error);
