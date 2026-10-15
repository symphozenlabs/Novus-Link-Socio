<script lang="ts">
	import StoryHero from '#lib/components/story/StoryHero.svelte';
	import PlansShowcase from '#lib/components/sections/PlansShowcase.svelte';
	import TemplateWall from '#lib/components/sections/TemplateWall.svelte';
	import Experiences from '#lib/components/sections/Experiences.svelte';
	import FaqList from '#lib/components/sections/FaqList.svelte';
	import FinalCta from '#lib/components/sections/FinalCta.svelte';
	import { fill } from '#lib/content/text.ts';
	import { cheapestPlan, formatINR, resolvePrice } from '#lib/pricing.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let available = $derived(data.products.filter((p) => p.available));
	let cheapest = $derived(cheapestPlan(data.products));
	let seo = $derived({
		title: data.home.seo.title,
		// Meta tags can't show a strike; they carry the price charged today.
		description: fill(data.home.seo.description, {
			fromPrice: cheapest ? formatINR(resolvePrice(cheapest.pricing).current) : '',
			plans: available.length
		})
	});
</script>

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
</svelte:head>

<StoryHero
	copy={data.home.story}
	planCount={available.length}
	fromPrice={cheapest?.pricing ?? null}
	finishes={data.sections.metalFinishes}
/>
<PlansShowcase
	products={data.products}
	priceNote={data.settings.priceNote}
	copy={data.sections.plans}
	finishes={data.sections.metalFinishes}
/>
<TemplateWall templates={data.templates} copy={data.sections.designs} />
<Experiences experiences={data.experiences} copy={data.sections.experiences} />
<FaqList faqs={data.faqs} copy={data.sections.faq} />
<FinalCta settings={data.settings} copy={data.sections.finalCta} />
