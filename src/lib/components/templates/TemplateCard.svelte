<!--
  A catalogue template with a real flip to its back side (button-driven, so it
  works for keyboard and touch; hover adds a preview on fine pointers).
-->
<script lang="ts">
	import type { CardTemplate } from '#lib/content/types.ts';

	let { template, planSlug }: { template: CardTemplate; planSlug: string } = $props();
	let flipped = $state(false);
</script>

<article id={template.code.toLowerCase()} class="tc group scroll-mt-32" class:flipped>
	<div class="card-3d">
		<div class="side front">
			<img
				src={template.front}
				alt="{template.alt} — front"
				width="598"
				height="382"
				loading="lazy"
				decoding="async"
			/>
		</div>
		{#if template.back}
			<div class="side back">
				<img
					src={template.back}
					alt="{template.alt} — back"
					width="598"
					height="382"
					loading="lazy"
					decoding="async"
				/>
			</div>
		{/if}
	</div>

	<div class="mt-3 flex items-center justify-between gap-3">
		<div>
			<h3 class="font-sans text-sm font-bold tracking-[0.06em] text-paper-ink">{template.code}</h3>
			<p class="text-xs text-paper-muted">{template.planLabel}</p>
		</div>
		<div class="flex items-center gap-1">
			{#if template.back}
				<button
					type="button"
					class="grid size-11 place-items-center rounded-full text-paper-muted transition-colors hover:bg-violet-100 hover:text-violet-700"
					aria-pressed={flipped}
					onclick={() => (flipped = !flipped)}
				>
					<span class="sr-only">Show {flipped ? 'front' : 'back'} of {template.code}</span>
					<svg
						viewBox="0 0 24 24"
						class="size-5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						aria-hidden="true"
						><path
							d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5"
						/></svg
					>
				</button>
			{/if}
			<a
				href="/contact?plan={planSlug}&template={template.code}"
				class="inline-flex min-h-11 items-center rounded-full bg-violet-700 px-4 text-xs font-bold text-white transition-colors hover:bg-violet-600"
			>
				Choose<span class="sr-only"> {template.code}</span>
			</a>
		</div>
	</div>
</article>

<style>
	.card-3d {
		position: relative;
		aspect-ratio: 598 / 382;
		transform-style: preserve-3d;
		transition: transform 0.8s var(--ease-out-expo);
	}
	.tc {
		perspective: 1000px;
	}
	.flipped .card-3d {
		transform: rotateY(180deg);
	}
	@media (hover: hover) and (pointer: fine) {
		.tc:not(.flipped):hover .card-3d {
			transform: rotateY(-8deg) rotateX(4deg) translateY(-4px);
		}
	}
	.side {
		position: absolute;
		inset: 0;
		border-radius: 0.9rem;
		overflow: hidden;
		background: #fff;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		box-shadow:
			0 1px 0 rgb(31 16 48 / 0.06),
			0 22px 40px -26px rgb(38 0 74 / 0.55);
	}
	.back {
		transform: rotateY(180deg);
	}
	.side img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		scale: 1.035;
	}
</style>
