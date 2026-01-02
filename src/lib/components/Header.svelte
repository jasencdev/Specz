<script lang="ts">
	interface Props {
		user: { id: string; email: string } | null;
	}

	let { user }: Props = $props();
</script>

<header>
	<div class="header-content">
		<a href="/" class="logo">Specz</a>

		<nav>
			{#if user}
				<a href="/specs" class="nav-link">My Specs</a>
				<span class="user-email">{user.email}</span>
				<form action="/logout?/logout" method="POST">
					<button type="submit" class="logout-btn">Log out</button>
				</form>
			{:else}
				<a href="/login" class="nav-link">Log in</a>
				<a href="/register" class="nav-link primary">Get Started</a>
			{/if}
		</nav>
	</div>
</header>

<style>
	header {
		border-bottom: 1px solid #e5e5e3;
		background: #fff;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 700;
		text-decoration: none;
		color: #2d2d2d;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.nav-link {
		text-decoration: none;
		color: #5a5a5a;
		font-size: 0.9rem;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		transition: background 0.2s;
	}

	.nav-link:hover {
		background: #f0efed;
		color: #2d2d2d;
	}

	.nav-link.primary {
		background: #2d2d2d;
		color: #f5f5f4;
	}

	.nav-link.primary:hover {
		background: #404040;
	}

	.user-email {
		color: #5a5a5a;
		font-size: 0.875rem;
	}

	.logout-btn {
		background: none;
		border: 1px solid #e5e5e3;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		color: #5a5a5a;
	}

	.logout-btn:hover {
		background: #f0efed;
		color: #2d2d2d;
	}
</style>
