/** Shared content model. Mirrors the Sanity schemas in /studio/schemaTypes. */

export type ProductLine = 'everyday' | 'metal';

/** How a product is drawn when no photo has been uploaded in Sanity. */
export type ProductVisual =
	| 'qr-card'
	| 'keychain'
	| 'keychain-card'
	| 'nfc-card'
	| 'nfc-card-profile'
	| 'nfc-card-profiles-2'
	| 'nfc-card-profiles-3'
	| 'metal-silver'
	| 'metal-rose'
	| 'metal-gold';

export type TemplateFamily = 'lite' | 'pulse' | 'pro' | 'elite' | 'pinnacle' | 'metal';

export interface Pricing {
	/** What the customer pays today, in rupees. */
	offerPrice: number;
	/** Optional "MRP" shown struck-through next to the offer price. */
	compareAtPrice?: number | null;
	/** Short label for the offer, e.g. "Launch offer". */
	offerLabel?: string | null;
	/** ISO date-time. After this the offer is over and compareAtPrice becomes the price. */
	offerEndsAt?: string | null;
	/** Show "−20%" chip next to the price. */
	showDiscountPercent?: boolean;
}

export interface Product {
	slug: string;
	name: string;
	line: ProductLine;
	order: number;
	tagline: string;
	/** Lead sentence. `highlight` is appended in brand violet. */
	summary: string;
	highlight?: string | null;
	audience?: string | null;
	/** Slug of the plan whose features are all included ("Everything from Pulse"). */
	includesPlan?: string | null;
	features: string[];
	pricing: Pricing;
	visual: ProductVisual;
	/** Product photo uploaded in Sanity (already resolved to a URL). Falls back to `visual`. */
	imageSrc?: string | null;
	imageAlt?: string | null;
	templateFamily?: TemplateFamily | null;
	badge?: string | null;
	available: boolean;
}

export interface CardTemplate {
	code: string;
	family: TemplateFamily;
	/** Plans this design is offered with (catalogue section). */
	planLabel: string;
	front: string;
	back?: string | null;
	alt: string;
}

export interface Experience {
	title: string;
	points: string[];
	icon: 'invite' | 'resume' | 'feedback' | 'menu';
}

export interface SiteSettings {
	phone: string;
	phoneDisplay: string;
	/** Header navigation. */
	nav: Link[];
	/** Header button label (links to the enquiry form). */
	headerCta: string;
	footerTagline: string;
	footerLinks: Link[];
	/** The large outlined words at the foot of every page. */
	footerWordmark: string;
	/** "From …" credit in the footer. */
	parentBrand: string;
	/** Digits only incl. country code, e.g. 918190020805. Hidden when empty. */
	whatsapp?: string | null;
	email?: string | null;
	instagram?: string | null;
	announcement?: string | null;
	/** Shown under prices, e.g. "Inclusive of GST. Shipping extra." Hidden when empty. */
	priceNote?: string | null;
	orderingNote?: string | null;
}

export interface Faq {
	question: string;
	answer: string;
}

/* ───────────── Page copy (every word an editor can change in Sanity) ─────────────
   Text fields may contain placeholders, filled in from live data:
     {plans}      number of plans available       {count}  number of card designs
     {fromPrice}  the lowest plan price (with its striked MRP where the page can show it)
     {finishes}   the metal finishes, e.g. "Black, Silver, Gold and Rose Gold"
     {phone}      the phone number for display */

/** A headline whose last phrase is set in the italic serif accent. */
export interface Headline {
	text: string;
	accent?: string | null;
	/** Optional words after the accent. */
	after?: string | null;
}

export interface Link {
	label: string;
	href: string;
}

export interface TitledText {
	title: string;
	detail: string;
}

export interface PageSeo {
	title: string;
	description: string;
}

export interface PageHeroCopy {
	eyebrow: string;
	title: Headline;
	lead?: string | null;
}

export interface StoryChapter {
	/** Short name in the chapter bar, e.g. "Paper". */
	label: string;
	/** Name in the HUD readout, e.g. "THE ROLODEX". */
	code: string;
	heading: string;
	body: string;
}

export interface StoryCopy {
	heroLabel: string;
	heroCode: string;
	eyebrow: string;
	/** Headline lines before the accent, e.g. ["You don't need", "your business cards"]. */
	titleLines: string[];
	titleAccent: string;
	intro: string;
	primaryCta: string;
	secondaryCta: string;
	/** Chapters 02–06, in order. */
	chapters: StoryChapter[];
	/** The three audit tags on the Rolodex (chapter 02). */
	auditTags: TitledText[];
	/** The three callouts on the card (chapter 03): NFC chip, brand, size. */
	cardCallouts: TitledText[];
	closingCta: string;
}

export interface HomePage {
	seo: PageSeo;
	story: StoryCopy;
}

/** Sections that appear on more than one page. */
export interface SharedSections {
	plans: { eyebrow: string; title: Headline; everydayBlurb: string; metalBlurb: string };
	designs: {
		eyebrow: string;
		title: Headline;
		body: string;
		primaryCta: string;
		secondaryCta: string;
	};
	experiences: {
		eyebrow: string;
		title: Headline;
		body: string;
		linkLabel: string;
		partnerEyebrow: string;
		partnerTitle: Headline;
		services: TitledText[];
	};
	faq: { eyebrow: string; title: Headline };
	finalCta: { eyebrow: string; title: Headline; body: string; primaryCta: string };
	metalFinishes: string[];
}

export interface PlansPage {
	seo: PageSeo;
	hero: PageHeroCopy;
}

export interface TemplatesPage {
	seo: PageSeo;
	hero: PageHeroCopy;
	customTitle: string;
	customBody: string;
	customCta: string;
}

export interface ContactPage {
	seo: PageSeo;
	/** `lead` falls back to Site settings › How ordering works. */
	hero: PageHeroCopy;
	formTitle: string;
	privacyNote: string;
	successTitle: string;
	successBody: string;
	callEyebrow: string;
	callBody: string;
	followEyebrow: string;
}
