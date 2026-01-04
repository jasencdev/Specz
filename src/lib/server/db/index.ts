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

// Create tables if they don't exist
client.exec(`
	CREATE TABLE IF NOT EXISTS user (
		id TEXT PRIMARY KEY,
		email TEXT NOT NULL UNIQUE,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
	CREATE TABLE IF NOT EXISTS session (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES user(id),
		expires_at INTEGER NOT NULL
	);
	CREATE TABLE IF NOT EXISTS magic_link (
		id TEXT PRIMARY KEY,
		email TEXT NOT NULL,
		expires_at INTEGER NOT NULL,
		created_at INTEGER NOT NULL
	);
	CREATE TABLE IF NOT EXISTS spec (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL REFERENCES user(id),
		title TEXT NOT NULL DEFAULT 'Untitled Spec',
		mode TEXT NOT NULL DEFAULT 'specz',
		status TEXT NOT NULL DEFAULT 'draft',
		conversation TEXT NOT NULL DEFAULT '[]',
		output TEXT,
		created_at INTEGER NOT NULL,
		updated_at INTEGER NOT NULL
	);
`);

export const db = drizzle(client, { schema });
