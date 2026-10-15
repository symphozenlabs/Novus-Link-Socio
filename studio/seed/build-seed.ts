/**
 * Builds seed/seed.ndjson from the website's built-in (brochure) content so a
 * fresh Sanity dataset starts with every plan, price, template, FAQ and every
 * page's copy — exactly the words the site shows without Sanity.
 *
 *   pnpm --dir studio seed:build
 *   pnpm --dir studio seed:import      # needs `sanity login` first
 *
 * Template images are attached with `_sanityAsset`, which the Sanity CLI
 * uploads during import.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
	fallbackExperiences,
	fallbackFaqs,
	fallbackProducts,
	fallbackSettings
} from '../../src/lib/content/fallback.ts';
import { fallbackTemplates } from '../../src/lib/content/templates.ts';
import {
	fallbackContactPage,
	fallbackHome,
	fallbackPlansPage,
	fallbackSections,
	fallbackTemplatesPage
} from '../../src/lib/content/copy.ts';

const here = dirname(fileURLToPath(import.meta.url));
const staticDir = resolve(here, '../../static');
const asset = (publicPath: string) => ({
	_type: 'image',
	_sanityAsset: `image@${pathToFileURL(resolve(staticDir, publicPath.replace(/^\//, ''))).href}`
});

/** Array items that are objects need a `_key` (and their member `_type`) in Sanity. */
const keyed = <T extends object>(items: T[], type: string) =>
	items.map((item, i) => ({ _key: `${type}-${i}`, _type: type, ...item }));

/** Drops nulls: an unset field is simply absent in Sanity. */
const strip = <T>(v: T): T =>
	(Array.isArray(v)
		? v.map(strip)
		: v && typeof v === 'object'
			? Object.fromEntries(
					Object.entries(v)
						.filter(([, x]) => x != null)
						.map(([k, x]) => [k, strip(x)])
				)
			: v) as T;

const docs: Record<string, unknown>[] = [];

docs.push(
	strip({
		_id: 'siteSettings',
		_type: 'siteSettings',
		...fallbackSettings,
		nav: keyed(fallbackSettings.nav, 'link'),
		footerLinks: keyed(fallbackSettings.footerLinks, 'link')
	})
);

// ── Page copy (singletons: the document id is the type name) ──
const { story } = fallbackHome;
docs.push(
	strip({
		_id: 'homePage',
		_type: 'homePage',
		seo: fallbackHome.seo,
		story: {
			...story,
			chapters: keyed(story.chapters, 'storyChapter'),
			auditTags: keyed(story.auditTags, 'titledText'),
			cardCallouts: keyed(story.cardCallouts, 'titledText')
		}
	}),
	strip({
		_id: 'sharedSections',
		_type: 'sharedSections',
		...fallbackSections,
		experiences: {
			...fallbackSections.experiences,
			services: keyed(fallbackSections.experiences.services, 'titledText')
		}
	}),
	strip({ _id: 'plansPage', _type: 'plansPage', ...fallbackPlansPage }),
	strip({ _id: 'templatesPage', _type: 'templatesPage', ...fallbackTemplatesPage }),
	strip({ _id: 'contactPage', _type: 'contactPage', ...fallbackContactPage })
);

for (const p of fallbackProducts) {
	docs.push({
		_id: `product-${p.slug}`,
		_type: 'product',
		name: p.name,
		slug: { _type: 'slug', current: p.slug },
		line: p.line,
		order: p.order,
		tagline: p.tagline,
		summary: p.summary,
		highlight: p.highlight ?? undefined,
		audience: p.audience ?? undefined,
		includesPlan: p.includesPlan
			? { _type: 'reference', _ref: `product-${p.includesPlan}` }
			: undefined,
		features: p.features,
		pricing: { _type: 'pricing', ...p.pricing, showDiscountPercent: true },
		visual: p.visual,
		templateFamily: p.templateFamily ?? undefined,
		available: p.available
	});
}

fallbackTemplates.forEach((t, i) => {
	docs.push({
		_id: `template-${t.code.toLowerCase()}`,
		_type: 'cardTemplate',
		code: t.code,
		family: t.family,
		planLabel: t.planLabel,
		order: i,
		front: { ...asset(t.front), alt: t.alt },
		back: t.back ? asset(t.back) : undefined
	});
});

fallbackExperiences.forEach((e, i) =>
	docs.push({ _id: `experience-${i}`, _type: 'experience', ...e, order: i })
);
fallbackFaqs.forEach((f, i) => docs.push({ _id: `faq-${i}`, _type: 'faq', ...f, order: i }));

const out = resolve(here, 'seed.ndjson');
writeFileSync(out, docs.map((d) => JSON.stringify(d)).join('\n') + '\n');
console.log(`Wrote ${docs.length} documents to ${out}`);
