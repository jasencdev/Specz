<script lang="ts">
	import { goto } from '$app/navigation';

	let specContent = $state('');
	let isAnalyzing = $state(false);
	let dragOver = $state(false);

	async function handleAnalyze() {
		if (!specContent.trim() || isAnalyzing) return;

		isAnalyzing = true;

		try {
			// Create a new spec with the uploaded content as context
			const createRes = await fetch('/api/specs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mode: 'speczcheck' })
			});

			const { id } = await createRes.json();

			// Set up initial conversation with the spec to analyze
			const initialMessages = [
				{
					role: 'user',
					content: `Please analyze this specification and provide your questions and feedback:\n\n${specContent}`
				}
			];

			// Save the initial message
			await fetch(`/api/specs/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ conversation: initialMessages })
			});

			// Now get the AI's analysis
			const chatRes = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: initialMessages, mode: 'speczcheck', specId: id })
			});

			// Read the stream and collect the response
			const reader = chatRes.body?.getReader();
			const decoder = new TextDecoder();
			let assistantContent = '';

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
						} catch {
							// Skip non-JSON lines
						}
					}
				}
			}

			// Save the full conversation with the AI's analysis
			const fullConversation = [
				...initialMessages,
				{ role: 'assistant', content: assistantContent }
			];

			await fetch(`/api/specs/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					conversation: fullConversation,
					title: 'Spec Analysis'
				})
			});

			// Navigate to the spec page to continue the conversation
			goto(`/specs/${id}`);
		} catch (error) {
			console.error('Analysis failed:', error);
			isAnalyzing = false;
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;

		const file = e.dataTransfer?.files[0];
		if (file && (file.type === 'text/markdown' || file.name.endsWith('.md') || file.type === 'text/plain')) {
			const reader = new FileReader();
			reader.onload = (event) => {
				specContent = event.target?.result as string;
			};
			reader.readAsText(file);
		}
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				specContent = event.target?.result as string;
			};
			reader.readAsText(file);
		}
	}
</script>

<div class="check-page">
	<h1>SpeczCheck</h1>
	<p class="description">
		Paste or upload an existing specification. I'll analyze it for gaps, unclear requirements, and
		missing edge cases, then ask clarifying questions.
	</p>

	<div
		class="upload-area"
		class:drag-over={dragOver}
		ondragover={(e) => {
			e.preventDefault();
			dragOver = true;
		}}
		ondragleave={() => (dragOver = false)}
		ondrop={handleDrop}
	>
		<textarea
			bind:value={specContent}
			placeholder="Paste your specification here, or drag and drop a .md file..."
			rows="15"
		></textarea>

		<div class="upload-actions">
			<label class="upload-btn">
				<input type="file" accept=".md,.txt,text/markdown,text/plain" onchange={handleFileSelect} />
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" y1="3" x2="12" y2="15" />
				</svg>
				Upload file
			</label>
		</div>
	</div>

	<button class="analyze-btn" onclick={handleAnalyze} disabled={!specContent.trim() || isAnalyzing}>
		{#if isAnalyzing}
			<span class="spinner"></span>
			Analyzing...
		{:else}
			Analyze Spec
		{/if}
	</button>
</div>

<style>
	.check-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		color: #2d2d2d;
	}

	.description {
		color: #5a5a5a;
		margin: 0 0 2rem;
		line-height: 1.5;
	}

	.upload-area {
		border: 2px dashed #e5e5e3;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		background: #fff;
		transition: border-color 0.2s, background 0.2s;
	}

	.upload-area.drag-over {
		border-color: #2d2d2d;
		background: #f5f5f3;
	}

	textarea {
		width: 100%;
		border: none;
		outline: none;
		resize: vertical;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		background: transparent;
		color: #2d2d2d;
	}

	textarea::placeholder {
		color: #8a8a8a;
	}

	.upload-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e5e3;
	}

	.upload-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #f0efed;
		border: 1px solid #e5e5e3;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		color: #2d2d2d;
		transition: background 0.2s;
	}

	.upload-btn:hover {
		background: #e5e5e3;
	}

	.upload-btn input {
		display: none;
	}

	.upload-btn svg {
		width: 16px;
		height: 16px;
	}

	.analyze-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 1rem;
		background: #2d2d2d;
		color: #f5f5f4;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.analyze-btn:hover:not(:disabled) {
		background: #404040;
	}

	.analyze-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid transparent;
		border-top-color: #f5f5f4;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
