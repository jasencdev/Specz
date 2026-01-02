import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [spec] = await db
		.select()
		.from(table.spec)
		.where(and(eq(table.spec.id, params.id), eq(table.spec.userId, locals.user!.id)));

	if (!spec) {
		throw error(404, 'Spec not found');
	}

	return { spec };
};

export const actions: Actions = {
	rename: async ({ params, request, locals }) => {
		const formData = await request.formData();
		const title = formData.get('title');

		if (typeof title !== 'string' || !title.trim()) {
			return { success: false };
		}

		await db
			.update(table.spec)
			.set({ title: title.trim(), updatedAt: new Date() })
			.where(and(eq(table.spec.id, params.id), eq(table.spec.userId, locals.user!.id)));

		return { success: true };
	},

	delete: async ({ params, locals }) => {
		await db
			.delete(table.spec)
			.where(and(eq(table.spec.id, params.id), eq(table.spec.userId, locals.user!.id)));

		throw redirect(302, '/specs');
	}
};
