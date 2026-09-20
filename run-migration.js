import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  const sql = neon(process.env.DATABASE_URL);
  const query = fs.readFileSync('drizzle/0003_add_per_unit_rates.sql', 'utf8');
  
  const statements = query.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('-- Custom SQL migration'));
  
  for (let statement of statements) {
    if (statement.startsWith('-- Update')) {
        statement = statement.replace('-- Update existing records with calculated per unit rates', '').trim();
    }
    if (!statement) continue;
    console.log(`Executing: ${statement.substring(0, 50)}...`);
    try {
        await sql.query(statement);
    } catch (e) {
        console.error("Error executing:", statement);
        console.error(e);
    }
  }
  
  console.log("Migration complete!");
}

run().catch(console.error);
