<script lang="ts">
	import Mark from '#lib/components/brand/Mark.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { reveal } from '#lib/actions/reveal.ts';
	import Headline from '#lib/components/content/Headline.svelte';
	import type { SharedSections, SiteSettings } from '#lib/content/types.ts';

	let { settings, copy }: { settings: SiteSettings; copy: SharedSections['finalCta'] } = $props();
</script>

<section
	class="relative isolate overflow-hidden py-28 md:py-40"
	aria-labelledby="cta-title"
	use:reveal
>
	<div class="absolute inset-0 -z-10" aria-hidden="true">
		<div class="glow"></div>
		<Mark
			class="cta-mark absolute top-1/2 left-1/2 w-[min(120vw,1100px)] -translate-x-1/2 -translate-y-1/2 text-violet-700/25"
		/>
	</div>
	<div class="container-x text-center">
		<p class="eyebrow" data-reveal>{copy.eyebrow}</p>
		<h2
			id="cta-title"
			class="mx-auto mt-5 max-w-5xl text-[clamp(3rem,9vw,8.5rem)]"
			data-reveal
			style="--reveal-i:1"
		>
			<Headline value={copy.title} />
		</h2>
		<p class="mx-auto mt-6 max-w-md text-ink-muted" data-reveal style="--reveal-i:2">
			{copy.body}
		</p>
		<div
			class="mt-10 flex flex-wrap items-center justify-center gap-4"
			data-reveal
			style="--reveal-i:3"
		>
			<Button href="/contact" size="lg" magnet>{copy.primaryCta}</Button>
			<Button href="tel:{settings.phone}" size="lg" variant="outline"
				>Call {settings.phoneDisplay}</Button
			>
		</div>
	</div>
</section>

<style>
	.glow {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(45% 55% at 50% 55%, rgb(74 0 149 / 0.75), transparent 70%),
			radial-gradient(25% 30% at 50% 60%, rgb(255 73 134 / 0.18), transparent 70%);
	}
	:global(.cta-mark) {
		animation: spin 120s linear infinite;
	}
	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}
</style>
