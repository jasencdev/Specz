<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import Chat from '$lib/components/Chat.svelte';
	import SpecView from '$lib/components/SpecView.svelte';

	let { data } = $props();

	let isGenerating = $state(false);
	let showRename = $state(false);
	let renameValue = $state(data.spec.title);

	async function handleGenerate() {
		isGenerating = true;

		try {
			const res = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ specId: data.spec.id })
			});

			if (res.ok) {
				await invalidateAll();
			}
		} catch (error) {
			console.error('Generation failed:', error);
		} finally {
			isGenerating = false;
		}
	}

	async function handleContinueConversation() {
		// Change status back to draft so user can continue chatting
		await fetch(`/api/specs/${data.spec.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'draft' })
		});
		await invalidateAll();
	}

	async function handleMessagesChange(messages: Array<{ role: string; content: string }>) {
		// Save messages to spec
		await fetch(`/api/specs/${data.spec.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ conversation: messages })
		});
	}
</script>

<div class="spec-page">
	<div class="spec-header">
		<div class="title-row">
			{#if showRename}
				<form
					method="POST"
					action="?/rename"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								showRename = false;
								await invalidateAll();
							}
						};
					}}
				>
					<input
						type="text"
						name="title"
						bind:value={renameValue}
						class="rename-input"
						autofocus
					/>
					<button type="submit" class="save-btn">Save</button>
					<button type="button" class="cancel-btn" onclick={() => (showRename = false)}>
						Cancel
					</button>
				</form>
			{:else}
				<h1>{data.spec.title}</h1>
				<button class="edit-btn" onclick={() => (showRename = true)}>Edit</button>
			{/if}
		</div>

		<div class="meta">
			<span class="mode">{data.spec.mode === 'speczcheck' ? 'SpeczCheck' : 'Specz'}</span>
			<span class="status" class:complete={data.spec.status === 'complete'}>
				{data.spec.status === 'complete' ? 'Complete' : 'Draft'}
			</span>
		</div>

		<div class="actions">
			{#if data.spec.status === 'draft'}
				<button class="btn primary" onclick={handleGenerate} disabled={isGenerating}>
					{isGenerating ? 'Generating...' : 'Generate Spec'}
				</button>
			{/if}
			<form method="POST" action="?/delete" use:enhance>
				<button type="submit" class="btn danger">Delete</button>
			</form>
		</div>
	</div>

	<div class="spec-content">
		{#if data.spec.status === 'complete' && data.spec.output}
			<SpecView content={data.spec.output} title={data.spec.title} />
			<div class="continue-section">
				<button class="continue-btn" onclick={handleContinueConversation}>
					Continue Conversation
				</button>
			</div>
		{:else}
			<Chat
				specId={data.spec.id}
				mode={data.spec.mode as 'specz' | 'speczcheck'}
				initialMessages={data.spec.conversation}
				onGenerate={handleGenerate}
				onMessagesChange={handleMessagesChange}
				disabled={isGenerating}
			/>
		{/if}
	</div>
</div>

<style>
	.spec-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		min-height: calc(100vh - 100px);
	}

	.spec-header {
		margin-bottom: 1.5rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #e5e5e3;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
		color: #2d2d2d;
	}

	.rename-input {
		font-size: 1.5rem;
		font-weight: 700;
		padding: 0.25rem 0.5rem;
		border: 1px solid #e5e5e3;
		border-radius: 4px;
		color: #2d2d2d;
	}

	.edit-btn,
	.save-btn,
	.cancel-btn {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
		background: none;
		border: 1px solid #e5e5e3;
		border-radius: 4px;
		cursor: pointer;
		color: #5a5a5a;
	}

	.edit-btn:hover,
	.save-btn:hover {
		background: #f0efed;
		color: #2d2d2d;
	}

	.cancel-btn {
		border: none;
		color: #5a5a5a;
	}

	.meta {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.mode {
		background: #f0efed;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.8rem;
		color: #2d2d2d;
	}

	.status {
		font-size: 0.8rem;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		background: #f0efed;
		color: #5a5a5a;
	}

	.status.complete {
		background: #dcfce7;
		color: #166534;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		border-radius: 6px;
		cursor: pointer;
		border: 1px solid #e5e5e3;
		background: #fff;
		color: #5a5a5a;
	}

	.btn:hover:not(:disabled) {
		background: #f0efed;
		color: #2d2d2d;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn.primary {
		background: #2d2d2d;
		color: #f5f5f4;
		border-color: #2d2d2d;
	}

	.btn.primary:hover:not(:disabled) {
		background: #404040;
	}

	.btn.danger {
		color: #dc2626;
		border-color: #fecaca;
	}

	.btn.danger:hover {
		background: #fef2f2;
	}

	.spec-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.continue-section {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e5e3;
	}

	.continue-btn {
		width: 100%;
		padding: 1rem;
		background: #fff;
		border: 1px solid #2d2d2d;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		color: #2d2d2d;
		transition: background 0.2s;
	}

	.continue-btn:hover {
		background: #f0efed;
	}
</style>
