<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PageHero from '#lib/components/layout/PageHero.svelte';
	import TemplateCard from '#lib/components/templates/TemplateCard.svelte';
	import Headline from '#lib/components/content/Headline.svelte';
	import { fill } from '#lib/content/text.ts';
	import type { TemplateFamily } from '#lib/content/types.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let vars = $derived({ count: data.templates.length });

	const familyLabels: Record<TemplateFamily, string> = {
		lite: 'Lite · Spark Plus',
		pulse: 'Pulse',
		pro: 'Pro',
		elite: 'Elite',
		pinnacle: 'Pinnacle',
		metal: 'Metal'
	};

	let families = $derived(
		(Object.keys(familyLabels) as TemplateFamily[]).filter((f) =>
			data.templates.some((t) => t.family === f)
		)
	);
	// Local state drives the filter; the URL is kept in sync (shallowly) so it can be shared.
	let active = $state<TemplateFamily | 'all'>(
		(page.url.searchParams.get('plan') as TemplateFamily | null) ?? 'all'
	);
	let shown = $derived(
		active === 'all' ? data.templates : data.templates.filter((t) => t.family === active)
	);

	function select(f: TemplateFamily | 'all') {
		active = f;
		const search = f === 'all' ? '' : `?plan=${f}`;
		// The path is resolved; the rule can't see through the appended query string.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`${resolve('/templates')}${search}`, { replace: true, shallow: true });
	}
</script>

<svelte:head>
	<title>{fill(data.page.seo.title, vars)}</title>
	<meta name="description" content={fill(data.page.seo.description, vars)} />
	<meta property="og:title" content={fill(data.page.seo.title, vars)} />
</svelte:head>

<PageHero
	eyebrow={data.page.hero.eyebrow}
	lead={data.page.hero.lead ? fill(data.page.hero.lead, vars) : undefined}
>
	{#snippet title()}
		<Headline value={data.page.hero.title} {vars} />
	{/snippet}
</PageHero>

<section
	class="on-paper min-h-[60vh] rounded-t-[2.5rem] bg-paper pt-12 pb-24 text-paper-ink md:rounded-t-[4rem] md:pt-16"
	aria-labelledby="gallery-title"
>
	<div class="container-x">
		<h2 id="gallery-title" class="sr-only">Template gallery</h2>
		<div class="sticky top-[calc(var(--header-h)+0.5rem)] z-20 -mx-2 overflow-x-auto px-2 py-2">
			<div
				role="group"
				aria-label="Filter by plan"
				class="inline-flex gap-2 rounded-full bg-white/80 p-1.5 shadow-[0_8px_30px_-16px_rgb(38_0_74/0.4)] backdrop-blur"
			>
				{#each [{ id: 'all', label: 'All' }, ...families.map( (f) => ({ id: f, label: familyLabels[f] }) )] as f (f.id)}
					<button
						type="button"
						aria-pressed={active === f.id}
						class="min-h-11 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors {active ===
						f.id
							? 'bg-violet-700 text-white'
							: 'text-paper-muted hover:bg-violet-100 hover:text-violet-700'}"
						onclick={() => select(f.id as TemplateFamily | 'all')}
					>
						{f.label}
					</button>
				{/each}
			</div>
		</div>

		<p class="mt-6 text-sm text-paper-muted" aria-live="polite">
			Showing {shown.length} design{shown.length === 1 ? '' : 's'}{active !== 'all'
				? ` for ${familyLabels[active as TemplateFamily] ?? active}`
				: ''}.
		</p>

		{#if shown.length}
			<div class="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each shown as t (t.code)}
					<TemplateCard template={t} planSlug={data.planForFamily[t.family] ?? ''} />
				{/each}
			</div>
		{:else}
			<div class="mt-10 rounded-3xl border border-dashed border-paper-line p-12 text-center">
				<p class="text-lg font-semibold">No designs in this group yet.</p>
				<p class="mt-2 text-paper-muted">
					We can create a custom theme for you. <a
						href="/contact?topic=custom"
						class="font-semibold text-violet-700 underline">Tell us your idea</a
					>
					or
					<button
						type="button"
						class="font-semibold text-violet-700 underline"
						onclick={() => select('all')}>see all designs</button
					>.
				</p>
			</div>
		{/if}

		<aside
			class="glass glass-deep mt-20 grid gap-6 rounded-[2rem] p-8 text-ink md:grid-cols-[1fr_auto] md:items-center md:p-12"
		>
			<div>
				<h2 class="text-3xl md:text-4xl">{data.page.customTitle}</h2>
				<p class="mt-3 max-w-xl text-ink-muted">{data.page.customBody}</p>
			</div>
			<a
				href="/contact?topic=custom"
				class="inline-flex min-h-14 items-center justify-center rounded-full bg-signal px-7 font-semibold text-abyss hover:bg-signal-hover"
			>
				{data.page.customCta}
			</a>
		</aside>
	</div>
</section>
