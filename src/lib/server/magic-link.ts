import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

const MAGIC_LINK_EXPIRY_MS = 1000 * 60 * 15; // 15 minutes

export function generateMagicLinkToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	return encodeBase64url(bytes);
}

function hashToken(token: string): string {
	return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export async function createMagicLink(email: string): Promise<string> {
	const token = generateMagicLinkToken();
	const tokenHash = hashToken(token);

	// Delete any existing magic links for this email
	await db.delete(table.magicLink).where(eq(table.magicLink.email, email));

	// Create new magic link
	await db.insert(table.magicLink).values({
		id: tokenHash,
		email,
		expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY_MS),
		createdAt: new Date()
	});

	return token;
}

export async function validateMagicLink(token: string): Promise<{ email: string } | null> {
	const tokenHash = hashToken(token);

	const [result] = await db
		.select()
		.from(table.magicLink)
		.where(and(eq(table.magicLink.id, tokenHash), gt(table.magicLink.expiresAt, new Date())));

	if (!result) {
		return null;
	}

	// Delete the magic link (single use)
	await db.delete(table.magicLink).where(eq(table.magicLink.id, tokenHash));

	return { email: result.email };
}
