<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let loading = $state(false);
</script>

<div class="auth-page">
	<div class="auth-card">
		<h1>Sign in to Specz</h1>
		<p class="subtitle">Enter your email and we'll send you a magic link.</p>

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
		>
			<label>
				Email
				<input
					type="email"
					name="email"
					autocomplete="email"
					required
					placeholder="you@example.com"
					disabled={loading}
				/>
			</label>

			{#if form?.message}
				<p class="error">{form.message}</p>
			{/if}

			<button type="submit" disabled={loading}>
				{loading ? 'Sending...' : 'Send magic link'}
			</button>
		</form>
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
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.75rem;
		text-align: center;
		color: #2d2d2d;
	}

	.subtitle {
		margin: 0 0 1.5rem;
		text-align: center;
		color: #5a5a5a;
		font-size: 0.95rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #5a5a5a;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #e5e5e3;
		border-radius: 6px;
		font-size: 1rem;
		color: #2d2d2d;
	}

	input:focus {
		outline: none;
		border-color: #2d2d2d;
	}

	input:disabled {
		background: #f5f5f4;
		cursor: not-allowed;
	}

	button {
		padding: 0.75rem;
		background: #2d2d2d;
		color: #f5f5f4;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	button:hover:not(:disabled) {
		background: #404040;
	}

	button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.error {
		color: #dc2626;
		font-size: 0.9rem;
		margin: 0;
		padding: 0.5rem;
		background: #fef2f2;
		border-radius: 6px;
	}
</style>
