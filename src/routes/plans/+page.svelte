<script lang="ts">
	import PageHero from '#lib/components/layout/PageHero.svelte';
	import PlansShowcase from '#lib/components/sections/PlansShowcase.svelte';
	import FaqList from '#lib/components/sections/FaqList.svelte';
	import FinalCta from '#lib/components/sections/FinalCta.svelte';
	import Headline from '#lib/components/content/Headline.svelte';
	import { fill } from '#lib/content/text.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let vars = $derived({ plans: data.products.length });
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

<PlansShowcase
	products={data.products}
	priceNote={data.settings.priceNote}
	copy={data.sections.plans}
	finishes={data.sections.metalFinishes}
	id="all-plans"
	heading={false}
/>
<FaqList faqs={data.faqs} copy={data.sections.faq} />
<FinalCta settings={data.settings} copy={data.sections.finalCta} />
