<script lang="ts">
	let { data } = $props();
</script>

<div class="auth-page">
	<div class="auth-card">
		{#if data.error === 'expired'}
			<div class="icon error-icon">&#x26A0;</div>
			<h1>Link expired</h1>
			<p class="message">This magic link has expired or has already been used.</p>
			<a href="/auth" class="button">Request new link</a>
		{:else if data.error === 'missing'}
			<div class="icon error-icon">&#x26A0;</div>
			<h1>Invalid link</h1>
			<p class="message">This magic link is invalid.</p>
			<a href="/auth" class="button">Request new link</a>
		{:else}
			<div class="icon">&#x23F3;</div>
			<h1>Signing you in...</h1>
			<p class="message">Please wait while we verify your magic link.</p>
		{/if}
	</div>
</div>

<style>
	.auth-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 100px);
		padding: 2rem;
	}

	.auth-card {
		width: 100%;
		max-width: 400px;
		padding: 2rem;
		background: #fff;
		border: 1px solid #e5e5e3;
		border-radius: 12px;
		text-align: center;
	}

	.icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.error-icon {
		color: #dc2626;
	}

	h1 {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		color: #2d2d2d;
	}

	.message {
		color: #5a5a5a;
		margin: 0 0 1.5rem;
		line-height: 1.5;
	}

	.button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #2d2d2d;
		color: #f5f5f4;
		text-decoration: none;
		border-radius: 6px;
		font-size: 1rem;
	}

	.button:hover {
		background: #404040;
	}
</style>
