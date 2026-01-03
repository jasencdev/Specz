import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

const DATABASE_URL = process.env.DATABASE_URL || './data/specz.db';

// Ensure directory exists
const dir = dirname(DATABASE_URL);
if (dir && dir !== '.' && !existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

const client = new Database(DATABASE_URL);
export const db = drizzle(client, { schema });
