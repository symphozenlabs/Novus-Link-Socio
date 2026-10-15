<script lang="ts">
	import Button from '#lib/components/ui/Button.svelte';
	import PriceTag from '#lib/components/ui/PriceTag.svelte';
	import ProductVisual from '#lib/components/product/ProductVisual.svelte';
	import { tilt } from '#lib/actions/tilt.ts';
	import { reveal } from '#lib/actions/reveal.ts';
	import { formatINR, resolvePrice } from '#lib/pricing.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let p = $derived(data.product);
	let price = $derived(resolvePrice(p.pricing));
</script>

<svelte:head>
	<title>{p.name} — {formatINR(price.current)} · Novus Link Socio</title>
	<meta name="description" content="{p.name}: {p.tagline}. {p.features.join('. ')}." />
	<meta property="og:title" content="{p.name} — Novus Link Socio" />
</svelte:head>

<section class="relative overflow-hidden pt-[calc(var(--header-h)+2.5rem)] pb-20">
	<div class="glow" aria-hidden="true"></div>
	<div class="container-x relative">
		<nav aria-label="Breadcrumb" class="text-sm text-ink-subtle">
			<ol class="flex items-center gap-2">
				<li><a href="/plans" class="inline-flex min-h-11 items-center hover:text-ink">Plans</a></li>
				<li aria-hidden="true">/</li>
				<li aria-current="page" class="text-ink-muted">{p.name}</li>
			</ol>
		</nav>

		<div class="mt-6 grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
			<div class="stage order-last lg:order-first" use:tilt={{ max: 10 }}>
				<div
					class="stage-inner glass lens grid aspect-square place-items-center rounded-[2.5rem] p-[10%]"
				>
					<ProductVisual product={p} class="w-full" />
				</div>
			</div>

			<div>
				<p class="eyebrow animate-rise">
					{p.line === 'metal' ? 'Metal collection' : 'Everyday collection'}
				</p>
				<h1 class="mt-4 animate-rise text-[clamp(3.2rem,9vw,7.5rem)] [animation-delay:80ms]">
					{p.name}
				</h1>
				<p
					class="mt-3 animate-rise font-serif text-2xl text-violet-200 italic [animation-delay:140ms] md:text-3xl"
				>
					{p.tagline}
				</p>
				<p class="mt-6 max-w-lg animate-rise text-lg text-ink-muted [animation-delay:200ms]">
					{p.summary}
					{#if p.highlight}<span class="text-violet-300">{p.highlight}</span>{/if}
				</p>

				<div class="glass mt-8 animate-rise rounded-3xl p-6 [animation-delay:260ms]">
					<PriceTag pricing={p.pricing} size="lg" />
					{#if data.settings.priceNote}<p class="mt-2 text-xs text-ink-subtle">
							{data.settings.priceNote}
						</p>{/if}
					<div class="mt-6 flex flex-wrap gap-3">
						{#if p.available}
							<Button href="/contact?plan={p.slug}" size="lg" magnet>Order {p.name}</Button>
						{:else}
							<p class="text-ink-muted">This plan is currently unavailable.</p>
						{/if}
						<Button href="tel:{data.settings.phone}" size="lg" variant="outline">Call us</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="pb-24" use:reveal aria-labelledby="included-title">
	<div class="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
		<div>
			<p class="eyebrow" data-reveal>What's included</p>
			<h2 id="included-title" class="mt-4 text-4xl md:text-5xl" data-reveal style="--reveal-i:1">
				Inside {p.name}
			</h2>
			{#if p.audience}<p class="mt-4 text-ink-muted" data-reveal style="--reveal-i:2">
					Perfect for {p.audience.toLowerCase()}.
				</p>{/if}
		</div>
		<ul class="divide-y divide-line border-y border-line">
			{#if data.includes}
				<li class="flex items-center justify-between gap-4 py-5" data-reveal>
					<span class="text-lg"
						>Everything in <a
							href="/plans/{data.includes.slug}"
							class="text-violet-300 underline decoration-violet-500/50 underline-offset-4 hover:text-ink"
							>{data.includes.name}</a
						></span
					>
				</li>
			{/if}
			{#each p.features as f, i (f)}
				<li class="flex items-start gap-4 py-5 text-lg" data-reveal style="--reveal-i:{i + 1}">
					<span class="mt-2 size-2 shrink-0 rounded-full bg-signal" aria-hidden="true"></span>{f}
				</li>
			{/each}
			{#if p.line === 'metal'}
				<li class="py-5 text-ink-muted" data-reveal>
					Finishes available: {data.sections.metalFinishes.join(' · ')}
				</li>
			{/if}
		</ul>
	</div>
</section>

{#if data.templates.length}
	<section
		class="on-paper rounded-t-[2.5rem] bg-paper py-20 text-paper-ink md:rounded-t-[4rem]"
		aria-labelledby="tpl-title"
		use:reveal
	>
		<div class="container-x">
			<div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
				<div>
					<p class="eyebrow" data-reveal>Card designs</p>
					<h2 id="tpl-title" class="mt-4 text-4xl md:text-5xl" data-reveal style="--reveal-i:1">
						Designs offered with {p.name}
					</h2>
				</div>
				<a
					href="/templates?plan={data.templates[0].family}"
					class="inline-flex min-h-11 items-center font-semibold text-violet-700 hover:underline"
					data-reveal
				>
					See all {data.templates.length} designs →
				</a>
			</div>
			<ul class="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
				{#each data.templates.slice(0, 8) as t, i (t.code)}
					<li data-reveal style="--reveal-i:{i}">
						<a
							href="/contact?plan={p.slug}&template={t.code}"
							class="tpl block overflow-hidden rounded-xl bg-white shadow-[0_18px_36px_-24px_rgb(38_0_74/0.5)] transition-transform duration-500 hover:-translate-y-1"
						>
							<img
								src={t.front}
								alt={t.alt}
								width="598"
								height="382"
								loading="lazy"
								decoding="async"
								class="aspect-[598/382] w-full scale-[1.035] object-cover"
							/>
						</a>
						<p class="mt-2 text-xs font-bold tracking-wide text-paper-muted">{t.code}</p>
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<nav aria-label="More plans" class="border-t border-line bg-abyss">
	<div class="container-x grid grid-cols-2 gap-4 py-10">
		<div>
			{#if data.prev}
				<a href="/plans/{data.prev.slug}" class="group block min-h-11">
					<span class="text-xs tracking-[0.15em] text-ink-subtle uppercase">← Previous</span>
					<span
						class="mt-1 block font-display text-2xl font-semibold group-hover:text-violet-300 md:text-4xl"
						>{data.prev.name}</span
					>
				</a>
			{/if}
		</div>
		<div class="text-right">
			{#if data.next}
				<a href="/plans/{data.next.slug}" class="group block min-h-11">
					<span class="text-xs tracking-[0.15em] text-ink-subtle uppercase">Next →</span>
					<span
						class="mt-1 block font-display text-2xl font-semibold group-hover:text-violet-300 md:text-4xl"
						>{data.next.name}</span
					>
				</a>
			{/if}
		</div>
	</div>
</nav>

<style>
	.glow {
		position: absolute;
		inset: -30% auto auto -20%;
		width: min(90vw, 1100px);
		aspect-ratio: 1;
		background: radial-gradient(closest-side, rgb(74 0 149 / 0.55), transparent);
	}
	.stage {
		perspective: 1200px;
		--rx: 0deg;
		--ry: 0deg;
	}
	.stage-inner {
		transform: rotateX(var(--rx)) rotateY(var(--ry));
		transition: transform 0.6s var(--ease-out-expo);
		/* Pointer glow over the glass sheen (same gradient as .glass). */
		background-image:
			radial-gradient(
				60% 60% at var(--mx, 50%) var(--my, 40%),
				rgb(143 59 227 / 0.3),
				transparent 70%
			),
			linear-gradient(
				155deg,
				rgb(255 255 255 / 0.13),
				rgb(255 255 255 / 0.03) 40%,
				rgb(209 168 250 / 0.09)
			);
	}
</style>
