<div class="auth-page">
	<div class="auth-card">
		<div class="icon">&#x2709;</div>
		<h1>Check your email</h1>
		<p class="message">
			We sent you a magic link to sign in. Click the link in your email to continue.
		</p>
		<p class="hint">The link expires in 15 minutes. Check your spam folder if you don't see it.</p>
		<a href="/auth" class="back-link">Use a different email</a>
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

	h1 {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		color: #2d2d2d;
	}

	.message {
		color: #5a5a5a;
		margin: 0 0 1rem;
		line-height: 1.5;
	}

	.hint {
		color: #888;
		font-size: 0.875rem;
		margin: 0 0 1.5rem;
	}

	.back-link {
		color: #2d2d2d;
		font-size: 0.9rem;
	}
</style>
