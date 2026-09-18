// src/config/db.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@/db';
import { env } from './env';

// Use Node.js built-in WebSocket (Node 18+) to prevent cold-start ErrorEvent
// failures that occur when the Pool driver has no WS constructor in Node.js.
neonConfig.webSocketConstructor = globalThis.WebSocket;

// Create a connection pool instead of HTTP client to support true transactions
const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool, { schema, casing: 'snake_case' });

export type DB = typeof db;
export { schema };

