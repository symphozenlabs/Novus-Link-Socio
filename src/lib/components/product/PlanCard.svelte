<script lang="ts">
	import type { Product } from '#lib/content/types.ts';
	import { tilt } from '#lib/actions/tilt.ts';
	import PriceTag from '#lib/components/ui/PriceTag.svelte';
	import ProductVisual from './ProductVisual.svelte';

	let {
		product,
		includesName = null,
		priceNote = null,
		headingLevel = 3
	}: {
		product: Product;
		includesName?: string | null;
		priceNote?: string | null;
		headingLevel?: 2 | 3;
	} = $props();

	let metal = $derived(product.line === 'metal');
</script>

<article class="plan group relative" class:metal use:tilt={{ max: 6 }}>
	<div class="plan-inner glass lens flex h-full flex-col rounded-[1.75rem] p-5 sm:p-6">
		<div
			class="relative mb-6 grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-black/20 px-[10%]"
		>
			<div class="glow" aria-hidden="true"></div>
			<ProductVisual
				{product}
				class="w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
			/>
			{#if product.badge}
				<span
					class="absolute top-3 left-3 rounded-full bg-signal px-2.5 py-1 text-[11px] font-bold tracking-wide text-abyss uppercase"
				>
					{product.badge}
				</span>
			{/if}
		</div>

		<div class="flex items-start justify-between gap-4">
			<div>
				<svelte:element this={`h${headingLevel}`} class="text-3xl">
					<a href="/plans/{product.slug}" class="plan-link outline-none">{product.name}</a>
				</svelte:element>
				<p class="mt-2 text-sm text-ink-muted">{product.tagline}</p>
			</div>
		</div>

		<PriceTag pricing={product.pricing} class="mt-5" />
		{#if priceNote}<p class="mt-1 text-xs text-ink-subtle">{priceNote}</p>{/if}

		<ul class="mt-5 space-y-2 border-t border-line pt-5 text-sm text-ink-muted">
			{#if includesName}
				<li class="flex gap-2.5 text-ink">
					<span class="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true"
					></span>
					Everything in {includesName}
				</li>
			{/if}
			{#each product.features as f (f)}
				<li class="flex gap-2.5">
					<span class="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-violet-400" aria-hidden="true"
					></span>
					{f}
				</li>
			{/each}
		</ul>

		<div class="relative z-10 mt-auto flex items-center justify-between gap-3 pt-6">
			<span
				class="text-sm font-semibold text-violet-300 transition-colors group-hover:text-ink"
				aria-hidden="true">View plan →</span
			>
			{#if product.available}
				<a
					href="/contact?plan={product.slug}"
					class="glass inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-ink transition-colors hover:bg-signal hover:text-abyss"
				>
					Order<span class="sr-only"> {product.name}</span>
				</a>
			{:else}
				<span class="text-sm text-ink-subtle">Currently unavailable</span>
			{/if}
		</div>
	</div>
</article>

<style>
	.plan {
		perspective: 1200px;
		--rx: 0deg;
		--ry: 0deg;
	}
	.plan-inner {
		transform: rotateX(var(--rx)) rotateY(var(--ry));
		transition:
			transform 0.5s var(--ease-out-expo),
			box-shadow 0.4s,
			background-color 0.4s;
	}
	/* Glass supplies the surface; these only shift its tint. */
	.plan:hover .plan-inner,
	.plan:focus-within .plan-inner {
		background-color: rgb(143 59 227 / 0.12);
	}
	.metal .plan-inner {
		background-color: rgb(29 0 48 / 0.35);
	}
	.glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			60% 60% at var(--mx, 50%) var(--my, 40%),
			rgb(143 59 227 / 0.35),
			transparent 70%
		);
		transition: opacity 0.4s;
	}
	/* Stretch the title link over the whole card. */
	.plan-link::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 1.75rem;
	}
	.plan-link:focus-visible::after {
		outline: 2px solid var(--color-violet-400);
		outline-offset: 3px;
	}
</style>
