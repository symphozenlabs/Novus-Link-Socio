<script lang="ts">
	import type { Product, ProductLine, SharedSections } from '#lib/content/types.ts';
	import PlanCard from '#lib/components/product/PlanCard.svelte';
	import Headline from '#lib/components/content/Headline.svelte';
	import { reveal } from '#lib/actions/reveal.ts';
	import { fill, listJoin } from '#lib/content/text.ts';

	let {
		products,
		copy,
		finishes,
		priceNote = null,
		id = 'plans',
		heading = true
	}: {
		products: Product[];
		copy: SharedSections['plans'];
		finishes: string[];
		priceNote?: string | null;
		id?: string;
		heading?: boolean;
	} = $props();

	let lines = $derived<{ id: ProductLine; label: string; blurb: string }[]>([
		{ id: 'everyday', label: 'Everyday', blurb: copy.everydayBlurb },
		{ id: 'metal', label: 'Metal', blurb: fill(copy.metalBlurb, { finishes: listJoin(finishes) }) }
	]);

	let tab: ProductLine = $state('everyday');
	let shown = $derived(products.filter((p) => p.line === tab));
	let nameOf = $derived(Object.fromEntries(products.map((p) => [p.slug, p.name])));
	let tabs: HTMLButtonElement[] = $state([]);

	function onKey(e: KeyboardEvent, i: number) {
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
		e.preventDefault();
		const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + lines.length) % lines.length;
		tab = lines[n].id;
		tabs[n]?.focus();
	}
</script>

<section
	{id}
	class="relative pb-24 md:pb-32 {heading ? 'pt-24 md:pt-32' : 'pt-0'}"
	aria-labelledby="{id}-title"
	use:reveal
>
	<div class="container-x">
		<div class="flex flex-col justify-between gap-8 md:flex-row md:items-end">
			<div class="max-w-2xl">
				{#if heading}
					<p class="eyebrow" data-reveal>{copy.eyebrow}</p>
					<h2
						id="{id}-title"
						class="mt-4 text-[clamp(2.4rem,6vw,5rem)]"
						data-reveal
						style="--reveal-i:1"
					>
						<Headline value={copy.title} />
					</h2>
				{:else}
					<h2 id="{id}-title" class="sr-only">All plans</h2>
				{/if}
				<p class="mt-5 max-w-md text-ink-muted" data-reveal style="--reveal-i:2">
					{lines.find((l) => l.id === tab)?.blurb}
				</p>
			</div>

			<div
				role="tablist"
				aria-label="Collections"
				class="inline-flex self-start rounded-full border border-line p-1 md:self-auto"
				data-reveal
				style="--reveal-i:2"
			>
				{#each lines as l, i (l.id)}
					<button
						bind:this={tabs[i]}
						role="tab"
						type="button"
						id="{id}-tab-{l.id}"
						aria-selected={tab === l.id}
						aria-controls="{id}-panel"
						tabindex={tab === l.id ? 0 : -1}
						class="relative min-h-11 rounded-full px-6 text-sm font-semibold transition-colors {tab ===
						l.id
							? 'bg-ink text-abyss'
							: 'text-ink-muted hover:text-ink'}"
						onclick={() => (tab = l.id)}
						onkeydown={(e) => onKey(e, i)}
					>
						{l.label}
						<span class="ml-1 tabular-nums opacity-60"
							>{products.filter((p) => p.line === l.id).length}</span
						>
					</button>
				{/each}
			</div>
		</div>

		<div
			id="{id}-panel"
			role="tabpanel"
			aria-labelledby="{id}-tab-{tab}"
			class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6 {tab === 'everyday'
				? 'xl:grid-cols-4'
				: ''}"
		>
			{#each shown as p (p.slug)}
				<PlanCard
					product={p}
					includesName={p.includesPlan ? nameOf[p.includesPlan] : null}
					{priceNote}
				/>
			{:else}
				<p
					class="col-span-full rounded-2xl border border-dashed border-line p-10 text-center text-ink-muted"
				>
					No plans in this collection right now. <a
						class="text-violet-300 underline"
						href="/contact">Ask us what's available.</a
					>
				</p>
			{/each}
		</div>
	</div>
</section>
