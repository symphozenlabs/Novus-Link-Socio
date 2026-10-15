<!--
  Novus Link Socio mark — extracted verbatim from the official logo SVG on
  novuslinksocio.com ("NLS SL.svg"). Inherits `currentColor`.
-->
<script lang="ts">
	import { markPaths } from './mark-paths.ts';

	let { class: klass = '', title = '' }: { class?: string; title?: string } = $props();
</script>

<svg
	viewBox="0 0 110 109"
	class={klass}
	fill="currentColor"
	fill-rule="evenodd"
	role={title ? 'img' : undefined}
	aria-hidden={title ? undefined : 'true'}
	aria-label={title || undefined}
>
	{#each markPaths as p, i (i)}
		<path transform={p.x || p.y ? `translate(${p.x},${p.y})` : undefined} d={p.d} />
	{/each}
</svg>
