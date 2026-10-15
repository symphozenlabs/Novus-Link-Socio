<script lang="ts">
	import type { Pricing } from '#lib/content/types.ts';
	import { formatINR, resolvePrice } from '#lib/pricing.ts';

	let {
		pricing,
		size = 'md',
		tone = 'dark',
		class: klass = ''
	}: { pricing: Pricing; size?: 'md' | 'lg'; tone?: 'dark' | 'paper'; class?: string } = $props();

	let price = $derived(resolvePrice(pricing));
	const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });
</script>

<div class="flex flex-col gap-1.5 {klass}">
	<div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
		<span
			class="font-display font-semibold tracking-[-0.03em] tabular-nums {size === 'lg'
				? 'text-5xl md:text-6xl'
				: 'text-3xl'}"
		>
			<span class="sr-only">{price.original ? 'Offer price ' : 'Price '}</span>{formatINR(
				price.current
			)}
		</span>
		{#if price.original}
			<s
				class="font-medium tabular-nums decoration-signal decoration-2 {size === 'lg'
					? 'text-xl'
					: 'text-base'} {tone === 'paper' ? 'text-paper-muted' : 'text-ink-subtle'}"
			>
				<span class="sr-only">Regular price </span>{formatINR(price.original)}
			</s>
		{/if}
		{#if price.percentOff}
			<span class="rounded-full bg-signal px-2 py-0.5 text-xs font-bold text-abyss tabular-nums">
				−{price.percentOff}%
			</span>
		{/if}
	</div>
	{#if price.original && size === 'lg'}
		<p class="text-sm font-semibold {tone === 'paper' ? 'text-success-ink' : 'text-success'}">
			You save {formatINR(price.original - price.current)}
		</p>
	{/if}
	{#if price.label || price.endsAt}
		<p class="text-xs font-semibold {tone === 'paper' ? 'text-violet-700' : 'text-violet-300'}">
			{price.label ?? 'Offer'}{#if price.endsAt}
				· ends {dateFmt.format(price.endsAt)}{/if}
		</p>
	{/if}
</div>
