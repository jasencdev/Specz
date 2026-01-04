import { describe, it, expect, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { testDb, schema, clearTables } from '../../tests/helpers';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';

function generateMagicLinkToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	return encodeBase64url(bytes);
}

function hashToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

async function createMagicLink(email: string): Promise<string> {
	const token = generateMagicLinkToken();
	const tokenHash = hashToken(token);

	await testDb.delete(schema.magicLink).where(eq(schema.magicLink.email, email));

	await testDb.insert(schema.magicLink).values({
		id: tokenHash,
		email,
		expiresAt: new Date(Date.now() + 1000 * 60 * 15),
		createdAt: new Date()
	});

	return token;
}

async function validateMagicLink(token: string): Promise<{ email: string } | null> {
	const tokenHash = hashToken(token);

	const [result] = await testDb
		.select()
		.from(schema.magicLink)
		.where(eq(schema.magicLink.id, tokenHash));

	if (!result || result.expiresAt.getTime() < Date.now()) {
		return null;
	}

	await testDb.delete(schema.magicLink).where(eq(schema.magicLink.id, tokenHash));

	return { email: result.email };
}

describe('magic-link', () => {
	beforeEach(async () => {
		await clearTables();
	});

	it('should create a magic link token', async () => {
		const email = 'test@example.com';
		const token = await createMagicLink(email);

		expect(token).toBeDefined();
		expect(token.length).toBeGreaterThan(0);
	});

	it('should store hashed token in database', async () => {
		const email = 'test@example.com';
		const token = await createMagicLink(email);
		const tokenHash = hashToken(token);

		const [result] = await testDb
			.select()
			.from(schema.magicLink)
			.where(eq(schema.magicLink.id, tokenHash));

		expect(result).toBeDefined();
		expect(result.email).toBe(email);
	});

	it('should validate a valid token', async () => {
		const email = 'test@example.com';
		const token = await createMagicLink(email);

		const result = await validateMagicLink(token);

		expect(result).not.toBeNull();
		expect(result?.email).toBe(email);
	});

	it('should delete token after validation (single use)', async () => {
		const email = 'test@example.com';
		const token = await createMagicLink(email);

		await validateMagicLink(token);
		const secondAttempt = await validateMagicLink(token);

		expect(secondAttempt).toBeNull();
	});

	it('should reject invalid token', async () => {
		const result = await validateMagicLink('invalid-token');
		expect(result).toBeNull();
	});

	it('should replace existing magic link for same email', async () => {
		const email = 'test@example.com';
		await createMagicLink(email);
		const secondToken = await createMagicLink(email);

		const links = await testDb
			.select()
			.from(schema.magicLink)
			.where(eq(schema.magicLink.email, email));

		expect(links).toHaveLength(1);
		expect(links[0].id).toBe(hashToken(secondToken));
	});
});
