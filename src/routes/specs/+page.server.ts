import { redirect } from '@sveltejs/kit';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

function generateId() {
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}

export const load: PageServerLoad = async ({ locals }) => {
	const specs = await db
		.select()
		.from(table.spec)
		.where(eq(table.spec.userId, locals.user!.id))
		.orderBy(desc(table.spec.updatedAt));

	return { specs };
};

export const actions: Actions = {
	new: async ({ locals }) => {
		const id = generateId();
		const now = new Date();

		await db.insert(table.spec).values({
			id,
			userId: locals.user!.id,
			mode: 'specz',
			createdAt: now,
			updatedAt: now
		});

		throw redirect(302, `/specs/${id}`);
	}
};
