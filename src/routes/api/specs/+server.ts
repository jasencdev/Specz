import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import type { RequestHandler } from './$types';

function generateId() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const specs = await db
		.select()
		.from(table.spec)
		.where(eq(table.spec.userId, locals.user.id))
		.orderBy(desc(table.spec.updatedAt));

	return json(specs);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const body = await request.json().catch(() => ({}));
	const mode = body.mode === 'speczcheck' ? 'speczcheck' : 'specz';

	const id = generateId();
	const now = new Date();

	await db.insert(table.spec).values({
		id,
		userId: locals.user.id,
		mode,
		createdAt: now,
		updatedAt: now
	});

	return json({ id });
};
