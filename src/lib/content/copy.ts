/**
 * Built-in page copy, used when Sanity is not configured (or a field is left
 * empty there). It is also what `studio/seed` loads into a fresh dataset, so
 * the Studio starts out with exactly the words the site shows today.
 */
import type { ContactPage, HomePage, PlansPage, SharedSections, TemplatesPage } from './types';

export const fallbackHome: HomePage = {
	seo: {
		title: 'Novus Link Socio — NFC & QR digital business cards',
		description:
			'Your digital identity in one tap. NFC and QR business cards, keychains and metal cards with a microsite you can edit anytime. Plans from {fromPrice}.'
	},
	story: {
		heroLabel: 'Identity',
		heroCode: 'BOOT SEQUENCE',
		eyebrow: 'Novus Link Socio · Your Digital Identity',
		titleLines: ["You don't need", 'your business cards'],
		titleAccent: 'anymore.',
		intro: 'One card. One tap or scan shares everything about you — and you can edit it anytime.',
		primaryCta: 'Explore plans',
		secondaryCta: 'See card designs',
		chapters: [
			{
				label: 'Paper',
				code: 'THE ROLODEX',
				heading: 'Ever felt clumsy carrying so many paper cards?',
				body: 'They run out, go out of date, and end up forgotten in a drawer.'
			},
			{
				label: 'One card',
				code: 'ONE CARD',
				heading: 'One card. It never runs out.',
				body: 'Your details live online, so one card is all you carry — and you can edit them anytime.'
			},
			{
				label: 'Tap',
				code: 'TAP',
				heading: 'One tap opens your whole profile.',
				body: 'Tap the NFC chip or scan the QR code and your microsite opens — contacts, links and work in one place.'
			},
			{
				label: 'Metal',
				code: 'METAL',
				heading: 'A signature that never fades.',
				body: 'Metal cards in {finishes} — with up to five digital profiles.'
			},
			{
				label: 'Choose',
				code: 'NETWORK',
				heading: 'Choose your identity.',
				body: '{plans} plans, from a {fromPrice} QR card to a metal card on your own domain.'
			}
		],
		auditTags: [
			{ title: 'Runs out', detail: 'Reprint, reorder, wait' },
			{ title: 'Out of date', detail: 'New number, new box' },
			{ title: 'Forgotten', detail: 'Lost in a drawer' }
		],
		cardCallouts: [
			{ title: 'NFC chip', detail: 'Tap any phone to share' },
			{ title: 'Your brand', detail: 'Printed or engraved' },
			{ title: '85.6 × 54 mm', detail: 'Fits every wallet' }
		],
		closingCta: 'Explore plans'
	}
};

export const fallbackSections: SharedSections = {
	plans: {
		eyebrow: 'Plans & prices',
		title: { text: 'Pick the card that', accent: 'speaks first.' },
		everydayBlurb: 'QR cards, NFC keychains and NFC cards with your own microsite.',
		metalBlurb: 'Brushed metal cards in {finishes}.'
	},
	designs: {
		eyebrow: 'Card designs',
		title: { text: 'Your profession,', accent: 'your theme.' },
		body: 'Choose from {count} ready-made designs. Every theme comes in multiple colours, you can add your logo — or we can create a custom theme tailored for you.',
		primaryCta: 'Browse all designs',
		secondaryCta: 'Request a custom theme'
	},
	experiences: {
		eyebrow: 'Enhanced digital experiences',
		title: { text: "The possibilities don't", accent: 'end at cards.' },
		body: "The same tap-and-scan technology powers invitations, resumes, feedback and menus. Tell us what you need — we'll build it.",
		linkLabel: 'Connect with us to discover more',
		partnerEyebrow: 'From SymphoZen Labs',
		partnerTitle: {
			text: 'Your business has more potential.',
			accent: 'We build the tools to unlock it.'
		},
		services: [
			{
				title: 'Digital Experience Design',
				detail:
					'Intuitive, elegant UI/UX for web and mobile products — creativity with functional design thinking.'
			},
			{
				title: 'Digital Enablement',
				detail:
					'Websites, e-commerce, CRM systems and automated workflows that help local and growing businesses reach further.'
			},
			{
				title: 'Brand & Creative Engineering',
				detail:
					'Visual identity through design systems, digital branding and content-driven experiences.'
			}
		]
	},
	faq: { eyebrow: 'Questions', title: { text: 'Good to', accent: 'know.' } },
	finalCta: {
		eyebrow: 'Go digital',
		title: { text: 'Leave paper', accent: 'behind.' },
		body: "Tell us the plan and design you like. We'll set up your card and microsite with you.",
		primaryCta: 'Order your card'
	},
	metalFinishes: ['Black', 'Silver', 'Gold', 'Rose Gold']
};

export const fallbackPlansPage: PlansPage = {
	seo: {
		title: 'Plans & prices — Novus Link Socio',
		description:
			'Compare Novus Link Socio plans: QR cards, NFC keychains, NFC cards with microsites, and metal cards with multiple digital profiles.'
	},
	hero: {
		eyebrow: 'Plans & prices',
		title: { text: 'One identity.', accent: '{plans} ways', after: 'to carry it.' },
		lead: 'Every plan lets you edit your details anytime. Start with a QR card, or go all the way to a metal card on your own domain.'
	}
};

export const fallbackTemplatesPage: TemplatesPage = {
	seo: {
		title: 'Card designs — Novus Link Socio',
		description:
			'Browse {count} Novus Link Socio card designs. Every theme comes in multiple colours, and you can add your logo or ask for a custom theme.'
	},
	hero: {
		eyebrow: 'Card designs',
		title: { text: 'Your profession,', accent: 'your theme.' },
		lead: 'Every theme is available in multiple colours. Want to add your logo, or match a theme to your profession? Just reach out.'
	},
	customTitle: 'Looking for something unique?',
	customBody:
		'We can create a custom theme tailored for you. Co-branded QR cards can also be customised for colour on request.',
	customCta: 'Request a custom theme'
};

export const fallbackContactPage: ContactPage = {
	seo: {
		title: 'Order or enquire — Novus Link Socio',
		description:
			'Order your Novus Link Socio card or ask us anything. Call {phone} or send an enquiry.'
	},
	hero: {
		eyebrow: 'Order / enquire',
		title: { text: "Let's make your", accent: 'first tap.' },
		lead: null
	},
	formTitle: 'Your enquiry',
	privacyNote: "We'll only use your details to respond to this enquiry.",
	successTitle: 'Thank you',
	successBody:
		"We've received your enquiry and will call you soon to confirm your plan, design and details.",
	callEyebrow: 'Prefer to talk?',
	callBody: 'Call us to order or to ask anything about plans and designs.',
	followEyebrow: 'Follow along'
};
