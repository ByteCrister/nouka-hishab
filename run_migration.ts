import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const queries = [
      `ALTER TABLE "trip_attachments" DROP CONSTRAINT IF EXISTS "sand_trip_attachments_sand_trip_id_file_id_pk";`,
      `ALTER TABLE "trip_attachments" ADD COLUMN IF NOT EXISTS "id" serial PRIMARY KEY;`,
      `ALTER TABLE "trip_expenses" ALTER COLUMN "sand_trip_id" DROP NOT NULL;`,
      `ALTER TABLE "trip_attachments" ALTER COLUMN "sand_trip_id" DROP NOT NULL;`
    ];

    for (const q of queries) {
      try {
        await sql.query(q);
        console.log("Success:", q);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.log("Error:", err.message);
        }
      }
    }


  } catch (err) {
    console.error("Migration error:", err);
  }
}
main();
