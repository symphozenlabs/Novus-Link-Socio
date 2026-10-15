<!--
  A Novus card rendered in CSS — the hero object of the site.
  finish: night (PVC, brand violet) · paper (plain white business card) · silver · rose · gold · black (metal)
-->
<script lang="ts">
	import Mark from '#lib/components/brand/Mark.svelte';
	import NfcWaves from './NfcWaves.svelte';
	import QrGlyph from './QrGlyph.svelte';

	type Finish = 'night' | 'paper' | 'silver' | 'rose' | 'gold' | 'black';
	let {
		finish = 'night',
		face = 'front',
		edge,
		class: klass = ''
	}: { finish?: Finish; face?: 'front' | 'back'; edge?: string; class?: string } = $props();

	let metal = $derived(
		finish === 'silver' || finish === 'rose' || finish === 'gold' || finish === 'black'
	);
</script>

<div
	class="id-card {klass}"
	data-finish={finish}
	class:is-metal={metal}
	style:--edge={edge}
	aria-hidden="true"
>
	{#if finish === 'paper'}
		<div class="absolute inset-x-[9%] top-[30%] space-y-[6%]">
			<div class="h-[0.5em] w-[55%] rounded-full bg-black/12"></div>
			<div class="h-[0.35em] w-[35%] rounded-full bg-black/8"></div>
			<div class="mt-[18%] h-[0.3em] w-[48%] rounded-full bg-black/8"></div>
			<div class="h-[0.3em] w-[40%] rounded-full bg-black/8"></div>
		</div>
	{:else if face === 'front'}
		<div class="absolute top-[11%] right-[8%] opacity-80">
			<NfcWaves class="h-[1.6em] w-[1.6em]" />
		</div>
		<div class="absolute bottom-[11%] left-[8%] flex items-end gap-[0.55em]">
			<Mark class="h-[2.3em] w-auto" />
			<div class="leading-none">
				<div class="font-display text-[1.02em] font-semibold tracking-[-0.02em] whitespace-nowrap">
					Novus Link Socio
				</div>
				<div class="mt-[0.3em] text-[0.58em] font-medium whitespace-nowrap opacity-80">
					Your Digital Identity
				</div>
			</div>
		</div>
	{:else}
		<div
			class="qr-plate absolute top-1/2 right-[9%] w-[34%] -translate-y-1/2 rounded-[0.45em] p-[0.45em]"
		>
			<QrGlyph class="h-auto w-full" seed={finish.length * 3} />
		</div>
		<div class="absolute top-1/2 left-[9%] -translate-y-1/2 leading-tight">
			<div class="font-display text-[1.15em] font-semibold tracking-[-0.02em]">Your Name</div>
			<div class="mt-[0.25em] text-[0.62em] opacity-75">Designation · Company</div>
			<div class="mt-[1.1em] flex items-center gap-[0.35em] text-[0.55em] opacity-75">
				<NfcWaves class="h-[1.4em] w-[1.4em]" /> Tap or scan
			</div>
		</div>
	{/if}
	<div class="sheen"></div>
</div>

<style>
	.id-card {
		position: relative;
		aspect-ratio: 85.6 / 54;
		border-radius: 6.5% / 10.3%;
		overflow: hidden;
		/* Keep blend modes inside the card so ancestors can stay preserve-3d. */
		isolation: isolate;
		container-type: inline-size;
		color: #fff;
		background: linear-gradient(
			140deg,
			#3a0a6e 0%,
			var(--color-night) 45%,
			var(--color-abyss) 100%
		);
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.09),
			0 30px 60px -25px rgb(0 0 0 / 0.75),
			0 0 80px -30px var(--color-violet-600);
	}
	/* Type scales with the card's own width (the card is the query container). */
	.id-card > div {
		font-size: 4.1cqw;
	}
	.id-card[data-finish='paper'] {
		background: #fbfbfa;
		color: #222;
		box-shadow:
			inset 0 0 0 1px rgb(0 0 0 / 0.06),
			0 -3px 0 0 var(--edge, #e3e3e3) inset,
			0 20px 40px -22px rgb(0 0 0 / 0.6);
	}
	.is-metal {
		color: rgb(0 0 0 / 0.62);
		background-blend-mode: overlay, normal;
	}
	.is-metal::before {
		content: '';
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			90deg,
			rgb(255 255 255 / 0.07) 0 1px,
			rgb(0 0 0 / 0.04) 1px 2px,
			transparent 2px 4px
		);
		mix-blend-mode: overlay;
	}
	.id-card[data-finish='silver'] {
		background: linear-gradient(115deg, #a9afb8 0%, #eef0f3 38%, #b9bec6 62%, #e3e6ea 100%);
	}
	.id-card[data-finish='rose'] {
		background: linear-gradient(115deg, #c98d78 0%, #f6d3c5 38%, #d49c87 62%, #f0c6b6 100%);
	}
	.id-card[data-finish='gold'] {
		background: linear-gradient(115deg, #b39a4c 0%, #f1e2a4 38%, #c5ab5d 62%, #e9d892 100%);
	}
	.id-card[data-finish='black'] {
		background: linear-gradient(115deg, #121014 0%, #2b2830 40%, #141217 65%, #26232b 100%);
		color: rgb(255 255 255 / 0.78);
	}
	.is-metal :global(svg) {
		filter: drop-shadow(0 1px 0 rgb(255 255 255 / 0.35));
	}
	.qr-plate {
		background: #fff;
		color: var(--color-abyss);
	}
	.is-metal .qr-plate {
		background: transparent;
		color: inherit;
	}
	.sheen {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			120% 80% at var(--mx, 30%) var(--my, 0%),
			rgb(255 255 255 / 0.22),
			transparent 55%
		);
		mix-blend-mode: soft-light;
	}
</style>
