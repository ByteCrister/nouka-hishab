// src/config/db.ts
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@/db';
import { env } from './env';

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema, casing: 'snake_case' });

export type DB = typeof db;
export { schema };