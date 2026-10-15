<script lang="ts">
	import type { Experience, SharedSections } from '#lib/content/types.ts';
	import Headline from '#lib/components/content/Headline.svelte';
	import { reveal } from '#lib/actions/reveal.ts';

	let { experiences, copy }: { experiences: Experience[]; copy: SharedSections['experiences'] } =
		$props();
</script>

<section
	id="experiences"
	class="ambient relative z-20 -mt-10 rounded-t-[2.5rem] bg-abyss py-24 md:-mt-16 md:rounded-t-[4rem] md:py-32"
	aria-labelledby="exp-title"
	use:reveal
>
	<div class="container-x grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
		<div class="lg:sticky lg:top-28 lg:self-start">
			<p class="eyebrow" data-reveal>{copy.eyebrow}</p>
			<h2
				id="exp-title"
				class="mt-4 text-[clamp(2.4rem,5.5vw,4.6rem)]"
				data-reveal
				style="--reveal-i:1"
			>
				<Headline value={copy.title} />
			</h2>
			<p class="mt-6 max-w-md text-ink-muted" data-reveal style="--reveal-i:2">
				{copy.body}
			</p>
			<a
				href="/contact?topic=experiences"
				class="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-violet-300 hover:text-ink"
				data-reveal
				style="--reveal-i:3"
			>
				{copy.linkLabel} <span aria-hidden="true">→</span>
			</a>
		</div>

		<ol class="divide-y divide-line border-y border-line">
			{#each experiences as e, i (e.title)}
				<li
					class="exp group grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 py-8 sm:grid-cols-[3rem_auto_1fr] sm:items-start"
					data-reveal
					style="--reveal-i:{i}"
				>
					<span
						class="hidden pt-2 text-xs font-bold tracking-[0.15em] text-ink-subtle tabular-nums sm:block"
						>0{i + 1}</span
					>
					<span
						class="icon glass grid size-14 place-items-center rounded-2xl text-violet-300 transition-colors group-hover:bg-violet-700/30"
						aria-hidden="true"
					>
						{#if e.icon === 'invite'}
							<svg
								viewBox="0 0 24 24"
								class="size-6"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linejoin="round"
								><path d="M3 8.5 12 14l9-5.5" /><rect
									x="3"
									y="5"
									width="18"
									height="14"
									rx="2.5"
								/><path d="M12 3v2M8.5 3.8l.8 1.4M15.5 3.8l-.8 1.4" stroke-linecap="round" /></svg
							>
						{:else if e.icon === 'resume'}
							<svg
								viewBox="0 0 24 24"
								class="size-6"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
								><rect x="5" y="3" width="14" height="18" rx="2.5" /><circle
									cx="12"
									cy="9"
									r="2.2"
								/><path d="M8.5 15.5c.8-1.6 2-2.3 3.5-2.3s2.7.7 3.5 2.3M9 18.3h6" /></svg
							>
						{:else if e.icon === 'feedback'}
							<svg
								viewBox="0 0 24 24"
								class="size-6"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linejoin="round"
								><path
									d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5"
								/><path d="m12 6.8.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2L9.1 9l2-.3z" /></svg
							>
						{:else}
							<svg
								viewBox="0 0 24 24"
								class="size-6"
								fill="none"
								stroke="currentColor"
								stroke-width="1.6"
								stroke-linecap="round"
								><path
									d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.2 1.2-3.3 3.5-3.3 7 0 1.4.9 2.5 2.3 2.5h1"
								/></svg
							>
						{/if}
					</span>
					<div class="col-start-2 sm:col-start-3">
						<h3 class="text-2xl md:text-3xl">{e.title}</h3>
						<ul class="mt-3 space-y-1 text-ink-muted">
							{#each e.points as pt (pt)}<li>{pt}</li>{/each}
						</ul>
					</div>
				</li>
			{/each}
		</ol>
	</div>

	<div class="container-x mt-24">
		<div class="glass lens rounded-[2rem] bg-violet-900/30 p-8 md:p-12" data-reveal>
			<div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
				<div>
					<p class="eyebrow">{copy.partnerEyebrow}</p>
					<h3 class="mt-3 text-3xl md:text-4xl">
						<Headline value={copy.partnerTitle} accentClass="text-violet-300" />
					</h3>
				</div>
			</div>
			<ul class="mt-10 grid gap-8 md:grid-cols-3">
				{#each copy.services as s, i (i)}
					<li>
						<h4 class="text-xl">{s.title}</h4>
						<p class="mt-2 text-sm leading-relaxed text-ink-muted">{s.detail}</p>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
