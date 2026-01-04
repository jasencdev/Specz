<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { marked } from 'marked';

	// Configure marked for safe rendering
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	interface Props {
		specId: string;
		mode?: 'specz' | 'speczcheck';
		initialMessages?: Array<{ role: string; content: string }>;
		onGenerate?: () => void;
		onMessagesChange?: (messages: Array<{ role: string; content: string }>) => void;
		disabled?: boolean;
	}

	let {
		specId,
		mode = 'specz',
		initialMessages = [],
		onGenerate,
		onMessagesChange,
		disabled = false
	}: Props = $props();

	let messages = $state<Array<{ role: string; content: string }>>(initialMessages);
	let input = $state('');
	let isLoading = $state(false);
	let messagesContainer: HTMLDivElement;
	let inputElement: HTMLInputElement;

	$effect(() => {
		onMessagesChange?.(messages);
	});

	async function scrollToBottom() {
		await tick();
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	$effect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	});

	onMount(() => {
		if (messages.length === 0 && mode === 'specz') {
			messages = [
				{
					role: 'assistant',
					content: "Hey! I'm Specz. Tell me about what you want to build."
				}
			];
		}
		inputElement?.focus();
	});

	async function send() {
		if (!input.trim() || isLoading) return;

		const userMessage = { role: 'user', content: input };
		messages = [...messages, userMessage];
		input = '';
		isLoading = true;

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				body: JSON.stringify({ messages, mode, specId }),
				headers: { 'Content-Type': 'application/json' }
			});

			if (!res.ok) {
				throw new Error('Failed to send message');
			}

			const reader = res.body?.getReader();
			const decoder = new TextDecoder();
			let assistantContent = '';
			messages = [...messages, { role: 'assistant', content: '' }];

			while (reader) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');

				for (const line of lines) {
					if (line.startsWith('data: ')) {
						const data = line.slice(6);
						if (data === '[DONE]') continue;
						try {
							const parsed = JSON.parse(data);
							const content = parsed.choices?.[0]?.delta?.content || '';
							assistantContent += content;
							messages = [
								...messages.slice(0, -1),
								{ role: 'assistant', content: assistantContent }
							];
						} catch {
							// Skip non-JSON lines
						}
					}
				}
			}

			if (assistantContent.includes('READY_TO_GENERATE')) {
				onGenerate?.();
			}
		} catch (error) {
			console.error('Chat error:', error);
			messages = [
				...messages,
				{ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
			];
		} finally {
			isLoading = false;
			await tick();
			inputElement?.focus();
		}
	}

	function renderMarkdown(text: string): string {
		return marked.parse(text) as string;
	}

	let showGenerateButton = $derived(messages.length >= 4 && !isLoading);
</script>

<div class="chat">
	<div class="messages" bind:this={messagesContainer}>
		{#each messages as msg}
			<div class="message {msg.role}">
				<div class="markdown-content">
					{@html renderMarkdown(msg.content)}
				</div>
			</div>
		{/each}
		{#if isLoading && messages[messages.length - 1]?.role !== 'assistant'}
			<div class="message assistant loading">
				<span class="dot"></span>
				<span class="dot"></span>
				<span class="dot"></span>
			</div>
		{/if}
	</div>

	<div class="input-section">
		<div class="input-row">
			<input
				bind:this={inputElement}
				bind:value={input}
				onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
				placeholder={mode === 'speczcheck' ? 'Ask about the analysis...' : 'Describe what you want to build...'}
				disabled={isLoading || disabled}
			/>
			<button class="send" onclick={send} aria-label="Send message" disabled={isLoading || disabled}>
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
				</svg>
			</button>
		</div>

		{#if showGenerateButton}
			<button class="generate-btn" onclick={() => onGenerate?.()} disabled={disabled}>
				{#if disabled}
					<span class="btn-loading">
						<span class="btn-dot"></span>
						<span class="btn-dot"></span>
						<span class="btn-dot"></span>
					</span>
					Generating...
				{:else}
					Generate Spec
				{/if}
			</button>
		{/if}
	</div>
</div>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 0;
	}

	.message {
		padding: 0.875rem 1.25rem;
		margin: 0.5rem 0;
		border-radius: 20px;
		line-height: 1.6;
	}

	.message.user {
		background: #f0efed;
		margin-left: 2rem;
		border-bottom-right-radius: 6px;
	}

	.message.assistant {
		background: #2d2d2d;
		color: #f5f5f4;
		margin-right: 2rem;
		border-bottom-left-radius: 6px;
	}

	/* Markdown content styles */
	.markdown-content {
		overflow-wrap: break-word;
	}

	.markdown-content :global(p) {
		margin: 0 0 0.75rem;
	}

	.markdown-content :global(p:last-child) {
		margin-bottom: 0;
	}

	.markdown-content :global(h1) {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 1rem 0 0.75rem;
	}

	.markdown-content :global(h2) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 1rem 0 0.5rem;
	}

	.markdown-content :global(h3) {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0.75rem 0 0.5rem;
	}

	.markdown-content :global(h4),
	.markdown-content :global(h5),
	.markdown-content :global(h6) {
		font-size: 1rem;
		font-weight: 600;
		margin: 0.5rem 0 0.25rem;
	}

	.markdown-content :global(pre) {
		background: #1a1a1a;
		color: #e0e0e0;
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		font-size: 0.875rem;
		margin: 0.75rem 0;
	}

	.markdown-content :global(code) {
		background: rgba(0, 0, 0, 0.08);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-size: 0.9em;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	}

	.message.assistant .markdown-content :global(code) {
		background: rgba(255, 255, 255, 0.15);
	}

	.markdown-content :global(pre code) {
		background: none;
		padding: 0;
		font-size: inherit;
	}

	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.markdown-content :global(li) {
		margin: 0.25rem 0;
	}

	.markdown-content :global(li > ul),
	.markdown-content :global(li > ol) {
		margin: 0.25rem 0;
	}

	.markdown-content :global(blockquote) {
		border-left: 3px solid #ccc;
		margin: 0.75rem 0;
		padding-left: 1rem;
		color: #5a5a5a;
	}

	.message.assistant .markdown-content :global(blockquote) {
		border-left-color: rgba(255, 255, 255, 0.3);
		color: #d0d0d0;
	}

	.markdown-content :global(hr) {
		border: none;
		border-top: 1px solid #ddd;
		margin: 1rem 0;
	}

	.markdown-content :global(table) {
		border-collapse: collapse;
		width: 100%;
		margin: 0.75rem 0;
		font-size: 0.9rem;
	}

	.markdown-content :global(th),
	.markdown-content :global(td) {
		border: 1px solid #ddd;
		padding: 0.5rem;
		text-align: left;
	}

	.markdown-content :global(th) {
		background: rgba(0, 0, 0, 0.05);
		font-weight: 600;
	}

	.markdown-content :global(a) {
		color: #2d2d2d;
		text-decoration: underline;
	}

	.message.assistant .markdown-content :global(a) {
		color: #a5d6ff;
	}

	.markdown-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
	}

	.message.loading {
		display: flex;
		gap: 0.25rem;
		padding: 1rem 1.25rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		background: #f5f5f4;
		border-radius: 50%;
		animation: bounce 1.4s infinite ease-in-out both;
	}

	.dot:nth-child(1) {
		animation-delay: -0.32s;
	}
	.dot:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes bounce {
		0%,
		80%,
		100% {
			transform: scale(0);
		}
		40% {
			transform: scale(1);
		}
	}

	.input-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.generate-btn {
		width: 100%;
		padding: 0.75rem;
		background: #2d2d2d;
		color: #f5f5f4;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.generate-btn:hover:not(:disabled) {
		background: #404040;
	}

	.generate-btn:disabled {
		cursor: not-allowed;
	}

	.btn-loading {
		display: inline-flex;
		gap: 0.2rem;
		margin-right: 0.5rem;
	}

	.btn-dot {
		width: 6px;
		height: 6px;
		background: #f5f5f4;
		border-radius: 50%;
		animation: bounce 1.4s infinite ease-in-out both;
	}

	.btn-dot:nth-child(1) {
		animation-delay: -0.32s;
	}

	.btn-dot:nth-child(2) {
		animation-delay: -0.16s;
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border: 1px solid #e5e5e3;
		border-radius: 50px;
		background: #fff;
	}

	input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 1rem;
		background: transparent;
	}

	input::placeholder {
		color: #8a8a8a;
	}

	input:disabled {
		opacity: 0.6;
	}

	.send {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		color: #5a5a5a;
	}

	.send:hover:not(:disabled) {
		color: #2d2d2d;
	}

	.send:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.send svg {
		width: 20px;
		height: 20px;
	}
</style>
