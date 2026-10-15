<script lang="ts">
	import type { Faq, SharedSections } from '#lib/content/types.ts';
	import Headline from '#lib/components/content/Headline.svelte';
	import { reveal } from '#lib/actions/reveal.ts';

	let { faqs, copy }: { faqs: Faq[]; copy: SharedSections['faq'] } = $props();
</script>

{#if faqs.length}
	<section class="py-24 md:py-32" aria-labelledby="faq-title" use:reveal>
		<div class="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
			<div>
				<p class="eyebrow" data-reveal>{copy.eyebrow}</p>
				<h2
					id="faq-title"
					class="mt-4 text-[clamp(2.2rem,5vw,4rem)]"
					data-reveal
					style="--reveal-i:1"
				>
					<Headline value={copy.title} accentClass="" />
				</h2>
			</div>
			<div class="space-y-3">
				{#each faqs as f, i (f.question)}
					<div class="glass rounded-3xl px-6 md:px-8" data-reveal style="--reveal-i:{i}">
						<details class="faq group">
							<summary
								class="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold md:text-xl"
							>
								{f.question}
								<span
									class="glass grid size-9 shrink-0 place-items-center rounded-full transition-transform duration-500 group-open:rotate-45"
									aria-hidden="true">+</span
								>
							</summary>
							<p class="max-w-2xl pb-6 text-ink-muted">{f.answer}</p>
						</details>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	.faq summary::-webkit-details-marker {
		display: none;
	}
	@media (prefers-reduced-motion: no-preference) {
		.faq::details-content {
			block-size: 0;
			overflow: hidden;
			transition:
				block-size 0.5s var(--ease-out-expo),
				content-visibility 0.5s allow-discrete;
		}
		.faq[open]::details-content {
			block-size: auto;
		}
		:global(:root) {
			interpolate-size: allow-keywords;
		}
	}
</style>
