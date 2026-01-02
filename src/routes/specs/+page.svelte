<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	function formatDate(date: Date) {
		const now = new Date();
		const diff = now.getTime() - new Date(date).getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(hours / 24);

		if (hours < 1) return 'Just now';
		if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
		if (days === 1) return 'Yesterday';
		return `${days} days ago`;
	}
</script>

<div class="specs-page">
	<div class="header">
		<h1>Your Specs</h1>
		<div class="actions">
			<form method="POST" action="?/new" use:enhance>
				<button type="submit" class="btn primary">+ New Spec</button>
			</form>
			<a href="/specs/check" class="btn">Check a Spec</a>
		</div>
	</div>

	{#if data.specs.length === 0}
		<div class="empty">
			<p>You haven't created any specs yet.</p>
			<form method="POST" action="?/new" use:enhance>
				<button type="submit" class="btn primary">Create your first spec</button>
			</form>
		</div>
	{:else}
		<div class="specs-list">
			{#each data.specs as spec}
				<a href="/specs/{spec.id}" class="spec-card">
					<div class="spec-info">
						<h3>{spec.title}</h3>
						<p class="meta">
							<span class="mode">{spec.mode === 'speczcheck' ? 'SpeczCheck' : 'Specz'}</span>
							<span class="dot">·</span>
							<span>Updated {formatDate(spec.updatedAt)}</span>
						</p>
					</div>
					<span class="status" class:complete={spec.status === 'complete'}>
						{spec.status === 'complete' ? 'Complete' : 'Draft'}
					</span>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.specs-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h1 {
		margin: 0;
		font-size: 1.75rem;
		color: #2d2d2d;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
	}

	.btn {
		display: inline-block;
		padding: 0.625rem 1rem;
		text-decoration: none;
		border-radius: 6px;
		font-size: 0.9rem;
		border: 1px solid #e5e5e3;
		color: #5a5a5a;
		background: #fff;
	}

	.btn:hover {
		background: #f0efed;
		color: #2d2d2d;
	}

	.btn.primary {
		background: #2d2d2d;
		color: #f5f5f4;
		border-color: #2d2d2d;
	}

	.btn.primary:hover {
		background: #404040;
	}

	.empty {
		text-align: center;
		padding: 4rem 2rem;
		border: 1px dashed #e5e5e3;
		border-radius: 12px;
		background: #fff;
	}

	.empty p {
		color: #5a5a5a;
		margin: 0 0 1.5rem;
	}

	.specs-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.spec-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.25rem;
		background: #fff;
		border: 1px solid #e5e5e3;
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.spec-card:hover {
		border-color: #2d2d2d;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.spec-info h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		color: #2d2d2d;
	}

	.meta {
		margin: 0;
		font-size: 0.85rem;
		color: #5a5a5a;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mode {
		background: #f0efed;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		color: #2d2d2d;
	}

	.dot {
		color: #c0c0be;
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
</style>
