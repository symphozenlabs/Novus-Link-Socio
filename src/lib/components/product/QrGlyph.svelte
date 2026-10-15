<!--
  Decorative QR-style pattern (deterministic, NOT scannable). Purely visual.
-->
<script lang="ts">
	let { seed = 7, class: klass = '' }: { seed?: number; class?: string } = $props();

	const N = 21;
	function cells(s: number) {
		let x = s * 9301 + 49297;
		const rnd = () => ((x = (x * 9301 + 49297) % 233280), x / 233280);
		const out: [number, number][] = [];
		const finder = (r: number, c: number) =>
			(r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
		for (let r = 0; r < N; r++)
			for (let c = 0; c < N; c++) if (!finder(r, c) && rnd() > 0.52) out.push([r, c]);
		return out;
	}
	let pts = $derived(cells(seed));
	const finders = [
		[0, 0],
		[0, N - 7],
		[N - 7, 0]
	];
</script>

<svg viewBox="0 0 {N} {N}" class={klass} aria-hidden="true" shape-rendering="crispEdges">
	{#each finders as [r, c] (`${r}-${c}`)}
		<rect
			x={c + 0.5}
			y={r + 0.5}
			width="6"
			height="6"
			fill="none"
			stroke="currentColor"
			stroke-width="1"
		/>
		<rect x={c + 2} y={r + 2} width="3" height="3" fill="currentColor" />
	{/each}
	{#each pts as [r, c] (`${r}:${c}`)}
		<rect x={c} y={r} width="1" height="1" fill="currentColor" />
	{/each}
</svg>
