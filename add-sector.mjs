import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("Adding sector column to boats...");
  await db.execute(`ALTER TABLE boats ADD COLUMN IF NOT EXISTS sector varchar(50) DEFAULT 'sand';`);
  
  console.log("Adding sector column to subscription_plans...");
  await db.execute(`ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS sector varchar(50) DEFAULT 'sand';`);
  
  console.log("Done!");
}

main().catch(console.error);
