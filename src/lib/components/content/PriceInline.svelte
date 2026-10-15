<!-- A price inside running text: the striked MRP (when an offer is live), then the offer price. -->
<script lang="ts">
	import type { Pricing } from '#lib/content/types.ts';
	import { formatINR, resolvePrice } from '#lib/pricing.ts';

	let { pricing }: { pricing: Pricing } = $props();
	let r = $derived(resolvePrice(pricing));
</script>

<span class="whitespace-nowrap"
	>{#if r.original}<s class="mr-1.5 decoration-signal decoration-2 opacity-70"
			><span class="sr-only">Regular price </span>{formatINR(r.original)}</s
		><span class="sr-only">offer price </span>{/if}<span class="font-semibold text-ink"
		>{formatINR(r.current)}</span
	></span
>
