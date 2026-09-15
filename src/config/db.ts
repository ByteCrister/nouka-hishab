// src/config/db.ts
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db';
import { env } from './env';

// Use Node.js built-in WebSocket (Node 18+) to prevent cold-start ErrorEvent
// failures that occur when the Pool driver has no WS constructor in Node.js.
neonConfig.webSocketConstructor = globalThis.WebSocket;

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema, casing: 'snake_case' });

export type DB = typeof db;
export { schema };