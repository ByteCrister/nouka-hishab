// src/config/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db';
import { env } from './env';

const sql = neon(env.DATABASE_URL);        // ← Neon HTTP driver
export const db = drizzle(sql, { schema, casing: 'snake_case' });

export type DB = typeof db;
export { schema };