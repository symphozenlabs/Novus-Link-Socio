import {
	fallbackExperiences,
	fallbackFaqs,
	fallbackProducts,
	fallbackSettings
} from '#lib/content/fallback.ts';
import {
	fallbackContactPage,
	fallbackHome,
	fallbackPlansPage,
	fallbackSections,
	fallbackTemplatesPage
} from '#lib/content/copy.ts';
import { fallbackTemplates } from '#lib/content/templates.ts';
import type {
	CardTemplate,
	ContactPage,
	Experience,
	Faq,
	HomePage,
	PlansPage,
	Product,
	SharedSections,
	SiteSettings,
	TemplatesPage
} from '#lib/content/types.ts';
import { merge, pad } from '#lib/content/merge.ts';
import { imageUrl, sanityRead } from './sanity';

/**
 * Every getter returns Sanity content when it is configured and non-empty,
 * and the brochure-derived fallback otherwise — so the site never renders blank.
 */
async function fromSanity<T>(query: string, fallback: T, map?: (raw: unknown) => T): Promise<T> {
	const client = sanityRead();
	if (!client) return fallback;
	try {
		const raw = await client.fetch(query);
		if (raw == null || (Array.isArray(raw) && raw.length === 0)) return fallback;
		return map ? map(raw) : (raw as T);
	} catch (err) {
		console.error('[sanity] query failed, using fallback content:', (err as Error).message);
		return fallback;
	}
}

const productProjection = `{
	"slug": slug.current,
	name, line, order, tagline, summary, highlight, audience,
	"includesPlan": includesPlan->slug.current,
	"features": coalesce(features, []),
	"pricing": {
		"offerPrice": pricing.offerPrice,
		"compareAtPrice": pricing.compareAtPrice,
		"offerLabel": pricing.offerLabel,
		"offerEndsAt": pricing.offerEndsAt,
		"showDiscountPercent": coalesce(pricing.showDiscountPercent, true)
	},
	visual, image, "imageAlt": image.alt, templateFamily, badge,
	"available": coalesce(available, true)
}`;

type RawProduct = Product & { image?: unknown };

function mapProducts(raw: unknown): Product[] {
	return (raw as RawProduct[]).map(({ image, ...p }) => ({
		...p,
		imageSrc: imageUrl(image, 900)
	}));
}

export function getProducts(): Promise<Product[]> {
	return fromSanity(
		`*[_type == "product" && defined(slug.current)] | order(order asc) ${productProjection}`,
		fallbackProducts,
		mapProducts
	);
}

export function getSettings(): Promise<SiteSettings> {
	return fromSanity(`*[_type == "siteSettings"][0]`, fallbackSettings, (raw) =>
		merge(fallbackSettings, raw)
	);
}

/* ── Page copy: one Sanity document each, overlaid on the built-in copy ── */

function singleton<T>(type: string, fallback: T, finish?: (merged: T) => T): Promise<T> {
	return fromSanity(`*[_type == "${type}"][0]`, fallback, (raw) => {
		const merged = merge(fallback, raw);
		return finish ? finish(merged) : merged;
	});
}

export function getHome(): Promise<HomePage> {
	return singleton('homePage', fallbackHome, (home) => ({
		...home,
		story: {
			...home.story,
			// The film has exactly five chapters after the opening, and three tags/callouts.
			chapters: pad(home.story.chapters, fallbackHome.story.chapters),
			auditTags: pad(home.story.auditTags, fallbackHome.story.auditTags),
			cardCallouts: pad(home.story.cardCallouts, fallbackHome.story.cardCallouts)
		}
	}));
}

export function getSections(): Promise<SharedSections> {
	return singleton('sharedSections', fallbackSections);
}

export function getPlansPage(): Promise<PlansPage> {
	return singleton('plansPage', fallbackPlansPage);
}

export function getTemplatesPage(): Promise<TemplatesPage> {
	return singleton('templatesPage', fallbackTemplatesPage);
}

export function getContactPage(): Promise<ContactPage> {
	return singleton('contactPage', fallbackContactPage);
}

export function getTemplates(): Promise<CardTemplate[]> {
	return fromSanity(
		`*[_type == "cardTemplate"] | order(order asc, code asc){ code, family, planLabel, front, back, "alt": coalesce(front.alt, "Card template " + code) }`,
		fallbackTemplates,
		(raw) =>
			(raw as (Omit<CardTemplate, 'front' | 'back'> & { front: unknown; back: unknown })[]).map(
				(t) => ({
					...t,
					front: imageUrl(t.front, 640) ?? '',
					back: imageUrl(t.back, 640)
				})
			)
	);
}

export function getExperiences(): Promise<Experience[]> {
	return fromSanity(
		`*[_type == "experience"] | order(order asc){ title, points, icon }`,
		fallbackExperiences
	);
}

export function getFaqs(): Promise<Faq[]> {
	return fromSanity(`*[_type == "faq"] | order(order asc){ question, answer }`, fallbackFaqs);
}
