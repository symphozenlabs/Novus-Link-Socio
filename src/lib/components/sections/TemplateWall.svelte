<script lang="ts">
	import type { CardTemplate, SharedSections } from '#lib/content/types.ts';
	import Headline from '#lib/components/content/Headline.svelte';
	import { fill } from '#lib/content/text.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import { reveal } from '#lib/actions/reveal.ts';

	let { templates, copy }: { templates: CardTemplate[]; copy: SharedSections['designs'] } =
		$props();

	let rows = $derived.by(() => {
		const a = templates.filter((_, i) => i % 2 === 0).slice(0, 12);
		const b = templates.filter((_, i) => i % 2 === 1).slice(0, 12);
		return [a, b];
	});
</script>

<section
	class="on-paper relative z-10 -mt-10 overflow-hidden rounded-t-[2.5rem] bg-paper py-24 text-paper-ink md:-mt-16 md:rounded-t-[4rem] md:py-32"
	aria-labelledby="designs-title"
	use:reveal
>
	<div class="container-x grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
		<div>
			<p class="eyebrow" data-reveal>{copy.eyebrow}</p>
			<h2
				id="designs-title"
				class="mt-4 text-[clamp(2.4rem,6vw,5rem)] text-paper-ink"
				data-reveal
				style="--reveal-i:1"
			>
				<Headline value={copy.title} accentClass="text-violet-700" />
			</h2>
		</div>
		<div data-reveal style="--reveal-i:2">
			<p class="max-w-md text-paper-muted">
				{fill(copy.body, { count: templates.length })}
			</p>
			<div class="mt-6 flex flex-wrap gap-3">
				<Button href="/templates" variant="violet" size="lg">{copy.primaryCta}</Button>
				<a
					href="/contact?topic=custom"
					class="inline-flex min-h-14 items-center rounded-full border border-paper-line px-7 font-semibold text-paper-ink transition-colors hover:border-violet-700 hover:bg-white"
				>
					{copy.secondaryCta}
				</a>
			</div>
		</div>
	</div>

	<div class="wall mt-16 space-y-5" aria-label="A selection of card designs" role="group">
		{#each rows as row, r (r)}
			<div class="marquee" class:reverse={r === 1}>
				<ul class="track">
					{#each [...row, ...row] as t, i (`${t.code}-${i}`)}
						<li aria-hidden={i >= row.length ? 'true' : undefined}>
							<a
								href="/templates#{t.code.toLowerCase()}"
								tabindex={i >= row.length ? -1 : undefined}
								class="tpl block"
							>
								<img
									src={t.front}
									alt={t.alt}
									width="598"
									height="382"
									loading="lazy"
									decoding="async"
								/>
								<span class="tpl-code">{t.code}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>

<style>
	.marquee {
		overflow: hidden;
		mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
	}
	.track {
		display: flex;
		gap: 1.25rem;
		width: max-content;
		animation: marquee 70s linear infinite;
	}
	.reverse .track {
		animation-direction: reverse;
		animation-duration: 80s;
	}
	.marquee:hover .track,
	.marquee:focus-within .track {
		animation-play-state: paused;
	}
	@keyframes marquee {
		to {
			transform: translateX(-50%);
		}
	}
	.tpl {
		position: relative;
		width: clamp(220px, 26vw, 340px);
		aspect-ratio: 598 / 382;
		border-radius: 1rem;
		overflow: hidden;
		background: #fff;
		box-shadow:
			0 1px 0 rgb(31 16 48 / 0.06),
			0 20px 40px -24px rgb(38 0 74 / 0.45);
		transition:
			transform 0.5s var(--ease-out-expo),
			box-shadow 0.5s;
	}
	.tpl img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		scale: 1.035;
	}
	.tpl:hover,
	.tpl:focus-visible {
		transform: translateY(-6px) rotate(-1deg);
		box-shadow: 0 30px 50px -24px rgb(74 0 149 / 0.55);
	}
	.tpl-code {
		position: absolute;
		left: 0.6rem;
		bottom: 0.6rem;
		border-radius: 999px;
		padding: 0.15rem 0.55rem;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: #fff;
		background: rgb(25 0 48 / 0.78);
	}
	@media (prefers-reduced-motion: reduce) {
		.track {
			animation: none;
		}
		.marquee {
			overflow-x: auto;
			mask-image: none;
		}
	}
</style>
