<!--
  Editor copy with placeholders filled in. `{fromPrice}` becomes a real price
  element (striked MRP + offer price), which a plain string can't hold.
-->
<script lang="ts">
	import type { Pricing } from '#lib/content/types.ts';
	import { fill, parts, type Vars } from '#lib/content/text.ts';
	import PriceInline from './PriceInline.svelte';

	let {
		text,
		vars = {},
		fromPrice = null
	}: { text: string; vars?: Vars; fromPrice?: Pricing | null } = $props();

	let segments = $derived(parts(fill(text, vars), fromPrice ? ['fromPrice'] : []));
</script>

{#each segments as s, i (i)}{#if 'token' in s && fromPrice}<PriceInline
			pricing={fromPrice}
		/>{:else if 'text' in s}{s.text}{/if}{/each}
