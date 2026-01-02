import { Mistral } from '@mistralai/mistralai';
import { MISTRAL_API_KEY } from '$env/static/private';
import { speczPrompt } from '$lib/prompts/specz';
import { checkPrompt } from '$lib/prompts/check';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

const mistral = new Mistral({ apiKey: MISTRAL_API_KEY });

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { messages, mode, specId } = await request.json();

	const systemPrompt = mode === 'speczcheck' ? checkPrompt : speczPrompt;

	const stream = await mistral.chat.stream({
		model: 'devstral-small-latest',
		messages: [{ role: 'system', content: systemPrompt }, ...messages]
	});

	// Save conversation to database
	if (specId) {
		await db
			.update(table.spec)
			.set({
				conversation: messages,
				updatedAt: new Date()
			})
			.where(eq(table.spec.id, specId));
	}

	// Convert Mistral stream to SSE format
	const encoder = new TextEncoder();
	const readable = new ReadableStream({
		async start(controller) {
			try {
				for await (const event of stream) {
					const data = JSON.stringify(event.data);
					controller.enqueue(encoder.encode(`data: ${data}\n\n`));
				}
				controller.enqueue(encoder.encode('data: [DONE]\n\n'));
				controller.close();
			} catch (error) {
				controller.error(error);
			}
		}
	});

	return new Response(readable, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
