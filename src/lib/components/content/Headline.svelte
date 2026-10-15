<!-- An editor's headline: plain text, then the accent phrase in the italic serif. -->
<script lang="ts">
	import type { Headline } from '#lib/content/types.ts';
	import { fill, type Vars } from '#lib/content/text.ts';

	let {
		value,
		vars = {},
		accentClass = 'text-gradient-violet'
	}: { value: Headline; vars?: Vars; accentClass?: string } = $props();
</script>

{fill(value.text, vars) + (value.accent ? ' ' : '')}{#if value.accent}<span
		class="serif-accent {accentClass}">{fill(value.accent, vars)}</span
	>{/if}{#if value.after}{' ' + fill(value.after, vars)}{/if}
