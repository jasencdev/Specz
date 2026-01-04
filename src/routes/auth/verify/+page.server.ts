import { redirect } from '@sveltejs/kit';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { validateMagicLink } from '$lib/server/magic-link';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const token = event.url.searchParams.get('token');

	if (!token) {
		return { error: 'missing' };
	}

	const result = await validateMagicLink(token);

	if (!result) {
		return { error: 'expired' };
	}

	const { email } = result;

	// Find or create user
	let [user] = await db.select().from(table.user).where(eq(table.user.email, email));

	if (!user) {
		const userId = generateUserId();
		const now = new Date();

		await db.insert(table.user).values({
			id: userId,
			email,
			createdAt: now,
			updatedAt: now
		});

		user = { id: userId, email, createdAt: now, updatedAt: now };
	}

	// Create session
	const sessionToken = auth.generateSessionToken();
	const session = await auth.createSession(sessionToken, user.id);
	auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

	throw redirect(302, '/specs');
};

function generateUserId(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}
