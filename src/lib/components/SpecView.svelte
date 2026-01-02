<script lang="ts">
	import { marked } from 'marked';

	marked.setOptions({
		breaks: true,
		gfm: true
	});

	interface Props {
		content: string;
		title?: string;
	}

	let { content, title = 'specification' }: Props = $props();
	let copied = $state(false);

	async function copyToClipboard() {
		await navigator.clipboard.writeText(content);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function downloadMarkdown() {
		const blob = new Blob([content], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function renderMarkdown(text: string): string {
		return marked.parse(text) as string;
	}
</script>

<div class="spec-view">
	<div class="actions">
		<button onclick={copyToClipboard} class="action-btn">
			{#if copied}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M20 6L9 17l-5-5" />
				</svg>
				Copied!
			{:else}
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
					<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
				</svg>
				Copy
			{/if}
		</button>
		<button onclick={downloadMarkdown} class="action-btn">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</svg>
			Download .md
		</button>
	</div>

	<div class="content markdown-content">
		{@html renderMarkdown(content)}
	</div>
</div>

<style>
	.spec-view {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e5e3;
		margin-bottom: 1rem;
	}

	.action-btn {
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

	.action-btn:hover {
		background: #e5e5e3;
	}

	.action-btn svg {
		width: 16px;
		height: 16px;
	}

	.content {
		flex: 1;
		overflow-y: auto;
		line-height: 1.7;
	}

	/* Markdown content styles */
	.markdown-content {
		overflow-wrap: break-word;
	}

	.markdown-content :global(p) {
		margin: 0 0 1rem;
	}

	.markdown-content :global(h1) {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 1.5rem 0 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e5e5e3;
		color: #2d2d2d;
	}

	.markdown-content :global(h1:first-child) {
		margin-top: 0;
	}

	.markdown-content :global(h2) {
		font-size: 1.4rem;
		font-weight: 600;
		margin: 1.5rem 0 0.75rem;
	}

	.markdown-content :global(h3) {
		font-size: 1.15rem;
		font-weight: 600;
		margin: 1.25rem 0 0.5rem;
	}

	.markdown-content :global(h4),
	.markdown-content :global(h5),
	.markdown-content :global(h6) {
		font-size: 1rem;
		font-weight: 600;
		margin: 1rem 0 0.5rem;
	}

	.markdown-content :global(pre) {
		background: #1a1a1a;
		color: #e0e0e0;
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		font-size: 0.875rem;
		margin: 1rem 0;
	}

	.markdown-content :global(code) {
		background: #f0efed;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-size: 0.875em;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		color: #2d2d2d;
	}

	.markdown-content :global(pre code) {
		background: none;
		padding: 0;
		font-size: inherit;
	}

	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		margin: 0.75rem 0;
		padding-left: 1.5rem;
	}

	.markdown-content :global(li) {
		margin: 0.35rem 0;
	}

	.markdown-content :global(li > ul),
	.markdown-content :global(li > ol) {
		margin: 0.25rem 0;
	}

	.markdown-content :global(blockquote) {
		border-left: 4px solid #d0d0ce;
		margin: 1rem 0;
		padding: 0.5rem 0 0.5rem 1rem;
		color: #5a5a5a;
		background: #f5f5f3;
		border-radius: 0 4px 4px 0;
	}

	.markdown-content :global(blockquote p) {
		margin: 0;
	}

	.markdown-content :global(hr) {
		border: none;
		border-top: 1px solid #e5e5e3;
		margin: 1.5rem 0;
	}

	.markdown-content :global(table) {
		border-collapse: collapse;
		width: 100%;
		margin: 1rem 0;
		font-size: 0.9rem;
	}

	.markdown-content :global(th),
	.markdown-content :global(td) {
		border: 1px solid #e5e5e3;
		padding: 0.6rem 0.75rem;
		text-align: left;
	}

	.markdown-content :global(th) {
		background: #f0efed;
		font-weight: 600;
		color: #2d2d2d;
	}

	.markdown-content :global(tr:nth-child(even)) {
		background: #f9f9f8;
	}

	.markdown-content :global(a) {
		color: #2d2d2d;
		text-decoration: underline;
	}

	.markdown-content :global(a:hover) {
		color: #5a5a5a;
	}

	.markdown-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
		margin: 0.5rem 0;
	}

	.markdown-content :global(strong) {
		font-weight: 600;
	}

	.markdown-content :global(em) {
		font-style: italic;
	}
</style>
