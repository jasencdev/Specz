import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import * as schema from '../lib/server/db/schema';

// Create in-memory test database
const client = new Database(':memory:');
export const testDb = drizzle(client, { schema });

// Initialize tables
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

export function generateId() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	return encodeBase64url(bytes);
}

export async function createTestUser(email = `test-${generateId()}@example.com`) {
	const userId = generateId();
	const now = new Date();

	await testDb.insert(schema.user).values({
		id: userId,
		email,
		createdAt: now,
		updatedAt: now
	});

	return { userId, email };
}

export async function createTestSession(userId: string) {
	const token = generateSessionToken();
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	await testDb.insert(schema.session).values({
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
	});

	return { token, sessionId };
}

export async function createTestMagicLink(email: string, expiresInMs = 1000 * 60 * 15) {
	const token = generateSessionToken();
	const tokenHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	await testDb.insert(schema.magicLink).values({
		id: tokenHash,
		email,
		expiresAt: new Date(Date.now() + expiresInMs),
		createdAt: new Date()
	});

	return { token, tokenHash };
}

export async function createTestSpec(userId: string, overrides: Partial<schema.Spec> = {}) {
	const id = generateId();
	const now = new Date();

	await testDb.insert(schema.spec).values({
		id,
		userId,
		title: overrides.title ?? 'Test Spec',
		mode: overrides.mode ?? 'specz',
		status: overrides.status ?? 'draft',
		conversation: overrides.conversation ?? [],
		output: overrides.output ?? null,
		createdAt: now,
		updatedAt: now
	});

	return id;
}

export async function clearTables() {
	await testDb.delete(schema.spec);
	await testDb.delete(schema.session);
	await testDb.delete(schema.magicLink);
	await testDb.delete(schema.user);
}

export { schema };
