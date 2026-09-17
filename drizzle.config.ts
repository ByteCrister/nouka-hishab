// drizzle.config.ts
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/index.ts',   // barrel file exporting all tables
  out: './drizzle',                     // migration output folder
  dialect: 'postgresql',                // Neon is Postgres
  dbCredentials: {
    url: process.env.DATABASE_URL!,     // ← Neon connection string
  },
  schemaFilter: ['public'],             // Drizzle uses Postgres schemas, not TS filenames
  verbose: true,
  strict: true,
});