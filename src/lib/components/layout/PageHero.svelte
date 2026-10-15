<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		eyebrow,
		title,
		lead,
		children
	}: { eyebrow: string; title: Snippet; lead?: string; children?: Snippet } = $props();
</script>

<section
	class="relative overflow-hidden pt-[calc(var(--header-h)+4rem)] pb-14 md:pt-[calc(var(--header-h)+6rem)] md:pb-20"
>
	<div class="glow" aria-hidden="true"></div>
	<div class="container-x relative">
		<p class="eyebrow animate-rise">{eyebrow}</p>
		<h1 class="mt-5 max-w-5xl animate-rise text-[clamp(2.8rem,8vw,7rem)] [animation-delay:100ms]">
			{@render title()}
		</h1>
		{#if lead}
			<p class="mt-6 max-w-xl animate-rise text-lg text-ink-muted [animation-delay:200ms]">
				{lead}
			</p>
		{/if}
		{#if children}
			<div class="mt-8 animate-rise [animation-delay:300ms]">{@render children()}</div>
		{/if}
	</div>
</section>

<style>
	.glow {
		position: absolute;
		inset: -20% -10% auto auto;
		width: min(70vw, 900px);
		aspect-ratio: 1;
		background: radial-gradient(closest-side, rgb(74 0 149 / 0.6), transparent);
	}
</style>
