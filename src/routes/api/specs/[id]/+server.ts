import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const [spec] = await db
		.select()
		.from(table.spec)
		.where(and(eq(table.spec.id, params.id), eq(table.spec.userId, locals.user.id)));

	if (!spec) {
		return new Response('Spec not found', { status: 404 });
	}

	return json(spec);
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const body = await request.json();
	const updates: Partial<{
		title: string;
		conversation: Array<{ role: string; content: string }>;
		output: string;
		status: string;
	}> = {};

	if (body.title !== undefined) updates.title = body.title;
	if (body.conversation !== undefined) updates.conversation = body.conversation;
	if (body.output !== undefined) updates.output = body.output;
	if (body.status !== undefined) updates.status = body.status;

	const result = await db
		.update(table.spec)
		.set({ ...updates, updatedAt: new Date() })
		.where(and(eq(table.spec.id, params.id), eq(table.spec.userId, locals.user.id)));

	if (result.changes === 0) {
		return new Response('Spec not found', { status: 404 });
	}

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const result = await db
		.delete(table.spec)
		.where(and(eq(table.spec.id, params.id), eq(table.spec.userId, locals.user.id)));

	if (result.changes === 0) {
		return new Response('Spec not found', { status: 404 });
	}

	return json({ success: true });
};
