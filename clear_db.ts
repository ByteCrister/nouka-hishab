import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  try {
    
    console.log("Fetching tables...");
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    const tables = result.rows.map((r: any) => r.tablename);
    console.log("Found tables:", tables);
    
    const tableNames = tables
      .filter((t: string) => !t.includes('drizzle')) // don't wipe migration history
      .map((t: string) => `"${t}"`);
    
    if (tableNames.length > 0) {
       const query = `TRUNCATE TABLE ${tableNames.join(', ')} CASCADE;`;
       console.log("Executing:", query);
       await pool.query(query);
       console.log("All tables truncated successfully.");
    } else {
       console.log("No tables found to truncate.");
    }
  } catch (err) {
    console.error("Error clearing db:", err);
  } finally {
    await pool.end();
  }
}

main();
