import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { building } from '$app/environment';

let db: ReturnType<typeof drizzle<typeof schema>>;

if (!building) {
	const DATABASE_URL = process.env.DATABASE_URL;

	if (!DATABASE_URL) {
		throw new Error('DATABASE_URL is not set');
	}

	// Ensure directory exists
	const dir = dirname(DATABASE_URL);
	if (dir && dir !== '.' && !existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	const client = new Database(DATABASE_URL);
	db = drizzle(client, { schema });
}

export { db };
