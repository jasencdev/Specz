<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
</script>

<div class="landing">
	<div class="hero">
		<div class="icon">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
			</svg>
		</div>
		<h1>Specz</h1>
		<p class="tagline">AI interviews you.<br />Then writes the spec.</p>
		<p class="description">
			Stop prompting AI to write code from vague ideas. Describe what you want, answer a few
			questions, and get a detailed specification you can hand to any developer or AI tool.
		</p>

		{#if data.user}
			<form method="POST" action="/specs?/new" use:enhance>
				<button type="submit" class="cta">Begin Interview</button>
			</form>
		{:else}
			<a href="/auth" class="cta">Begin Interview</a>
		{/if}
	</div>

	<div class="features">
		{#if data.user}
			<form method="POST" action="/specs?/new" use:enhance class="feature-form">
				<button type="submit" class="feature">
					<div class="feature-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
						</svg>
					</div>
					<h3>Specz Mode</h3>
					<p>Answer questions about your product idea. Get a complete specification with user stories, data models, and API endpoints.</p>
					<span class="feature-cta">Start interview</span>
				</button>
			</form>
		{:else}
			<a href="/auth" class="feature">
				<div class="feature-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
					</svg>
				</div>
				<h3>Specz Mode</h3>
				<p>Answer questions about your product idea. Get a complete specification with user stories, data models, and API endpoints.</p>
				<span class="feature-cta">Start interview</span>
			</a>
		{/if}
		<a href={data.user ? '/specs/check' : '/auth'} class="feature">
			<div class="feature-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M9 11l3 3L22 4" />
					<path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
				</svg>
			</div>
			<h3>SpeczCheck Mode</h3>
			<p>Already have a spec? Paste it in and get feedback on gaps, unclear requirements, and missing edge cases.</p>
			<span class="feature-cta">Analyze spec</span>
		</a>
	</div>
</div>

<style>
	.landing {
		max-width: 800px;
		margin: 0 auto;
		padding: 4rem 1.5rem;
	}

	.hero {
		text-align: center;
		margin-bottom: 4rem;
	}

	.icon {
		margin-bottom: 1.5rem;
	}

	.icon svg {
		width: 56px;
		height: 56px;
		color: #2d2d2d;
	}

	h1 {
		font-size: 4rem;
		font-weight: 700;
		margin: 0 0 1rem;
		color: #2d2d2d;
	}

	.tagline {
		font-size: 1.5rem;
		color: #5a5a5a;
		margin: 0 0 1.5rem;
		line-height: 1.4;
	}

	.description {
		font-size: 1.1rem;
		color: #6a6a6a;
		max-width: 500px;
		margin: 0 auto 2rem;
		line-height: 1.6;
	}

	.cta {
		display: inline-block;
		padding: 1rem 2rem;
		background: #2d2d2d;
		color: #fafaf9;
		text-decoration: none;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.cta:hover {
		background: #404040;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}

	.feature-form {
		display: contents;
	}

	.feature {
		display: flex;
		flex-direction: column;
		padding: 2rem;
		background: #fff;
		border: 1px solid #e5e5e3;
		border-radius: 12px;
		text-decoration: none;
		color: inherit;
		text-align: left;
		font: inherit;
		cursor: pointer;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.feature:hover {
		border-color: #2d2d2d;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.feature-icon {
		margin-bottom: 1rem;
	}

	.feature-icon svg {
		width: 32px;
		height: 32px;
		color: #2d2d2d;
	}

	.feature h3 {
		margin: 0 0 0.75rem;
		font-size: 1.25rem;
		color: #2d2d2d;
	}

	.feature p {
		margin: 0 0 1rem;
		color: #5a5a5a;
		line-height: 1.5;
		flex: 1;
	}

	.feature-cta {
		display: inline-block;
		color: #2d2d2d;
		font-weight: 500;
		font-size: 0.95rem;
	}

	.feature:hover .feature-cta {
		text-decoration: underline;
	}
</style>
