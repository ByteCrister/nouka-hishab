// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env';

export default defineConfig({
  schema: './src/db/index.ts',   // barrel file exporting all tables
  out: './drizzle',                     // migration output folder
  dialect: 'postgresql',                // Neon is Postgres
  dbCredentials: {
    url: env.DATABASE_URL,     // ← Neon connection string
  },
  schemaFilter: ['app', 'media'],       // only manage these two schemas
  verbose: true,
  strict: true,
});