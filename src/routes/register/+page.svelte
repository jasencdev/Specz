<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="auth-page">
	<div class="auth-card">
		<h1>Create account</h1>

		<form method="POST" use:enhance>
			<label>
				Email
				<input type="email" name="email" autocomplete="email" required />
			</label>

			<label>
				Password
				<input type="password" name="password" autocomplete="new-password" required minlength="6" />
			</label>

			{#if form?.message}
				<p class="error">{form.message}</p>
			{/if}

			<button type="submit">Create account</button>
		</form>

		<p class="switch">
			Already have an account? <a href="/login">Log in</a>
		</p>
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
		margin: 0 0 1.5rem;
		font-size: 1.75rem;
		text-align: center;
		color: #2d2d2d;
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

	button:hover {
		background: #404040;
	}

	.error {
		color: #dc2626;
		font-size: 0.9rem;
		margin: 0;
		padding: 0.5rem;
		background: #fef2f2;
		border-radius: 6px;
	}

	.switch {
		margin: 1.5rem 0 0;
		text-align: center;
		font-size: 0.9rem;
		color: #5a5a5a;
	}

	.switch a {
		color: #2d2d2d;
		font-weight: 500;
	}
</style>
