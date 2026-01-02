import { Mistral } from '@mistralai/mistralai';
import { MISTRAL_API_KEY } from '$env/static/private';
import { generatePrompt } from '$lib/prompts/generate';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const mistral = new Mistral({ apiKey: MISTRAL_API_KEY });

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { specId } = await request.json();

	// Get the spec and verify ownership
	const [spec] = await db
		.select()
		.from(table.spec)
		.where(and(eq(table.spec.id, specId), eq(table.spec.userId, locals.user.id)));

	if (!spec) {
		return new Response('Spec not found', { status: 404 });
	}

	// Format conversation for generation
	const conversationText = spec.conversation
		.map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
		.join('\n\n');

	const result = await mistral.chat.complete({
		model: 'devstral-small-latest',
		messages: [
			{ role: 'system', content: generatePrompt },
			{ role: 'user', content: conversationText }
		]
	});

	const rawOutput = result.choices?.[0]?.message?.content;
	const output = typeof rawOutput === 'string' ? rawOutput : '';

	// Extract title from first heading
	const titleMatch = output.match(/^#\s+(.+?)(?:\s*—.*)?$/m);
	const title = titleMatch ? titleMatch[1].trim() : 'Untitled Spec';

	// Update spec with output
	await db
		.update(table.spec)
		.set({
			title,
			status: 'complete',
			output,
			updatedAt: new Date()
		})
		.where(eq(table.spec.id, specId));

	return json({ success: true, output, title });
};
