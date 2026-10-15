/**
 * Built-in content used when Sanity is not configured (or unreachable).
 * Every product, price and feature here is transcribed from the official
 * "Product Range" brochure linked from novuslinksocio.com. Prices are the
 * brochure prices; no strike/MRP prices are invented — add those in Sanity.
 */
import type { Experience, Faq, Product, SiteSettings } from './types';

export const fallbackSettings: SiteSettings = {
	phone: '+918190020805',
	phoneDisplay: '+91 81900 20805',
	whatsapp: null, // not confirmed — set in Sanity › Site settings to show WhatsApp links
	email: null, // not published anywhere yet
	instagram: 'novuslinksocio',
	announcement: null,
	priceNote: null,
	orderingNote:
		'Send us your enquiry and our team will call you back to confirm your plan, card design and profile details.',
	nav: [
		{ label: 'Plans', href: '/plans' },
		{ label: 'Card designs', href: '/templates' },
		{ label: 'Experiences', href: '/#experiences' },
		{ label: 'Contact', href: '/contact' }
	],
	headerCta: 'Order your card',
	footerTagline:
		'NFC and QR business cards with a microsite you can edit anytime. Tap. Share. Impress.',
	footerLinks: [
		{ label: 'Plans & prices', href: '/plans' },
		{ label: 'Card designs', href: '/templates' },
		{ label: 'Enhanced experiences', href: '/#experiences' },
		{ label: 'Order / enquire', href: '/contact' }
	],
	footerWordmark: 'Tap. Share.',
	parentBrand: 'SymphoZen Labs'
};

export const fallbackProducts: Product[] = [
	{
		slug: 'lite',
		name: 'Lite',
		line: 'everyday',
		order: 10,
		tagline: 'Ignite Your Digital Identity',
		summary: 'Your entry into the future of professional networking.',
		highlight: 'No complexity, just pure connection.',
		features: ['Co-branded digital QR card', 'Edit your details anytime'],
		pricing: { offerPrice: 199 },
		visual: 'qr-card',
		templateFamily: 'lite',
		available: true
	},
	{
		slug: 'spark',
		name: 'Spark',
		line: 'everyday',
		order: 20,
		tagline: 'Tap. Share. Impress.',
		summary: 'Your effortless gateway to instant sharing;',
		highlight: 'Just tap and connect.',
		features: ['Sleek NFC keychain with tap-to-share', 'Edit your details anytime'],
		pricing: { offerPrice: 249 },
		visual: 'keychain',
		templateFamily: null,
		available: true
	},
	{
		slug: 'spark-plus',
		name: 'Spark Plus',
		line: 'everyday',
		order: 30,
		tagline: 'Your Entire Identity — One Tap. One Scan.',
		summary: 'A comprehensive identity solution designed for modern professionals —',
		highlight: 'Tap, scan and explore.',
		features: [
			'NFC keychain with tap-to-share',
			'PVC QR card with microsite',
			'Edit your details anytime'
		],
		pricing: { offerPrice: 349 },
		visual: 'keychain-card',
		templateFamily: 'lite',
		available: true
	},
	{
		slug: 'pulse',
		name: 'Pulse',
		line: 'everyday',
		order: 40,
		tagline: 'Where Your Network Comes Alive',
		summary: 'Perfect for growing professionals & entrepreneurs.',
		audience: 'Growing professionals & entrepreneurs',
		features: [
			'NFC card with tap-to-share',
			'Select from a range of card design templates',
			'Microsite with a customisable profile'
		],
		pricing: { offerPrice: 499 },
		visual: 'nfc-card',
		templateFamily: 'pulse',
		available: true
	},
	{
		slug: 'pro',
		name: 'Pro',
		line: 'everyday',
		order: 50,
		tagline: 'Built for Those Who Lead the Conversation',
		summary: 'Perfect for growing professionals & entrepreneurs.',
		audience: 'Growing professionals & entrepreneurs',
		includesPlan: 'pulse',
		features: ['Add multiple details to your profile', 'Share your profile as a PDF'],
		pricing: { offerPrice: 799 },
		visual: 'nfc-card-profile',
		templateFamily: 'pro',
		available: true
	},
	{
		slug: 'elite',
		name: 'Elite',
		line: 'everyday',
		order: 60,
		tagline: 'Where distinction becomes your identity',
		summary: 'Perfect for serial entrepreneurs & multi-role professionals.',
		audience: 'Serial entrepreneurs & multi-role professionals',
		includesPlan: 'pro',
		features: [
			'Completely customisable microsite',
			'Create up to 2 digital profiles and showcase 1',
			'Share all your profiles as a PDF'
		],
		pricing: { offerPrice: 999 },
		visual: 'nfc-card-profiles-2',
		templateFamily: 'elite',
		available: true
	},
	{
		slug: 'pinnacle',
		name: 'Pinnacle',
		line: 'everyday',
		order: 70,
		tagline: 'Maximum impact. Minimal effort.',
		summary: 'The pinnacle of digital identity —',
		highlight: 'Tap and share.',
		includesPlan: 'elite',
		features: [
			'Create up to 3 digital profiles and showcase 1',
			'Share all your profiles as a PDF'
		],
		pricing: { offerPrice: 1299 },
		visual: 'nfc-card-profiles-3',
		templateFamily: 'pinnacle',
		available: true
	},
	{
		slug: 'metal-signature',
		name: 'Metal Signature',
		line: 'metal',
		order: 110,
		tagline: 'A Signature That Never Fades',
		summary: 'A stunning metal card with a sophisticated default design.',
		features: [
			'Stunning metal card with sophisticated default design',
			'Create up to 5 digital profiles and showcase 2',
			'Switch based on occasion or preference',
			'Full business details per profile'
		],
		pricing: { offerPrice: 1499 },
		visual: 'metal-silver',
		templateFamily: 'metal',
		available: true
	},
	{
		slug: 'metal-unlimited',
		name: 'Metal Unlimited',
		line: 'metal',
		order: 120,
		tagline: 'Your Unmatched Digital Presence',
		summary: 'Every venture, fully represented.',
		includesPlan: 'metal-signature',
		features: [
			'Create and showcase up to 5 digital profiles',
			'Curate and customise your primary profile',
			'Full profile customisation for each venture'
		],
		pricing: { offerPrice: 1999 },
		visual: 'metal-rose',
		templateFamily: 'metal',
		available: true
	},
	{
		slug: 'metal-sovereign',
		name: 'Metal Sovereign',
		line: 'metal',
		order: 130,
		tagline: 'Rule Every Room You Walk Into',
		summary: 'Your own domain, your own digital ecosystem.',
		includesPlan: 'metal-unlimited',
		features: ['Personal domain microsite', 'Create your digital ecosystem'],
		pricing: { offerPrice: 2499 },
		visual: 'metal-gold',
		templateFamily: 'metal',
		available: true
	}
];

export const fallbackExperiences: Experience[] = [
	{
		title: 'Digital Invitations',
		icon: 'invite',
		points: ['Animated digital invites with RSVP capture', 'Tap or scan to add to calendar']
	},
	{
		title: 'Digital Resume Card',
		icon: 'resume',
		points: ['One-tap resume share', 'Portfolio + video intro integration']
	},
	{
		title: 'Feedback Cards',
		icon: 'feedback',
		points: ['Scan or tap to submit feedback instantly', 'Customisable rating system']
	},
	{
		title: 'Smart Menu Card',
		icon: 'menu',
		points: ['Ideal for cafés & restaurants', 'Real-time menu updates']
	}
];

/** Only answers that the brochures state directly. Extend in Sanity. */
export const fallbackFaqs: Faq[] = [
	{
		question: 'Can I change my details after the card is printed?',
		answer:
			'Yes. Every plan lets you edit your details anytime — the card stays the same, your profile updates.'
	},
	{
		question: 'Can my card match my brand colours or carry my logo?',
		answer:
			'Co-branded QR cards can be customised for colour on request, every template is available in multiple colours, and you can add your logo — just reach out to us.'
	},
	{
		question: 'Which finishes do metal cards come in?',
		answer: 'Metal cards are available in Black, Silver, Gold and Rose Gold.'
	},
	{
		question: 'I want something nobody else has.',
		answer:
			'We can create a custom theme tailored for you, or match a card theme to your profession. Send us an enquiry and tell us what you have in mind.'
	}
];
