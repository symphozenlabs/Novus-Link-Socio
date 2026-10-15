/**
 * Page copy — every word on the site an editor can change.
 *
 * Each page is a singleton. Any field left empty shows the built-in text
 * (src/lib/content/copy.ts), so clearing a field can never leave a gap.
 */
import { defineArrayMember, defineField, defineType } from 'sanity';

const EMPTY = 'Leave empty to use the built-in text.';
const tokens = (...names: string[]) =>
	`Placeholders: ${names.map((n) => `{${n}}`).join(', ')}. ${EMPTY}`;

/* ───────────── building blocks ───────────── */

export const headline = defineType({
	name: 'headline',
	title: 'Headline',
	type: 'object',
	description: 'The accent is set in the italic serif, e.g. "Pick the card that" + "speaks first."',
	options: { columns: 3 },
	fields: [
		defineField({ name: 'text', type: 'string' }),
		defineField({ name: 'accent', title: 'Accent (italic)', type: 'string' }),
		defineField({ name: 'after', title: 'After the accent', type: 'string' })
	],
	preview: {
		select: { text: 'text', accent: 'accent', after: 'after' },
		prepare: ({ text, accent, after }) => ({
			title: [text, accent, after].filter(Boolean).join(' ') || '(built-in)'
		})
	}
});

export const link = defineType({
	name: 'link',
	title: 'Link',
	type: 'object',
	options: { columns: 2 },
	fields: [
		defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
		defineField({
			name: 'href',
			title: 'Link to',
			description: 'A page on this site, e.g. /plans or /#experiences.',
			type: 'string',
			validation: (r) =>
				r
					.required()
					.custom(
						(v) =>
							!v ||
							/^(\/|#|https?:\/\/|tel:|mailto:)/.test(v) ||
							'Start with /, #, https://, tel: or mailto:'
					)
		})
	],
	preview: { select: { title: 'label', subtitle: 'href' } }
});

export const titledText = defineType({
	name: 'titledText',
	title: 'Title + detail',
	type: 'object',
	options: { columns: 2 },
	fields: [
		defineField({ name: 'title', type: 'string' }),
		defineField({ name: 'detail', type: 'text', rows: 2 })
	],
	preview: { select: { title: 'title', subtitle: 'detail' } }
});

export const seo = defineType({
	name: 'seo',
	title: 'Search & sharing',
	type: 'object',
	options: { collapsible: true, collapsed: true },
	fields: [
		defineField({
			name: 'title',
			title: 'Page title',
			type: 'string',
			validation: (r) => r.max(70).warning('Search engines show about 60 characters.')
		}),
		defineField({
			name: 'description',
			type: 'text',
			rows: 3,
			validation: (r) => r.max(170).warning('Search engines show about 155 characters.')
		})
	]
});

export const pageHero = defineType({
	name: 'pageHero',
	title: 'Page header',
	type: 'object',
	fields: [
		defineField({ name: 'eyebrow', title: 'Small heading above', type: 'string' }),
		defineField({ name: 'title', type: 'headline' }),
		defineField({ name: 'lead', title: 'Intro text', type: 'text', rows: 3 })
	]
});

export const storyChapter = defineType({
	name: 'storyChapter',
	title: 'Chapter',
	type: 'object',
	fields: [
		defineField({ name: 'label', title: 'Chapter bar label', type: 'string' }),
		defineField({
			name: 'code',
			title: 'HUD name',
			description: 'Shown in capitals in the corner readout, e.g. THE ROLODEX.',
			type: 'string'
		}),
		defineField({ name: 'heading', type: 'string' }),
		defineField({
			name: 'body',
			type: 'text',
			rows: 3,
			description:
				tokens('plans', 'fromPrice', 'finishes') +
				' {fromPrice} shows the cheapest plan with its striked price when an offer is live.'
		})
	],
	preview: { select: { title: 'heading', subtitle: 'label' } }
});

/* ───────────── pages ───────────── */

const singleton = (title: string) => ({ prepare: () => ({ title }) });

export const homePage = defineType({
	name: 'homePage',
	title: 'Home page',
	type: 'document',
	groups: [
		{ name: 'story', title: 'Scroll story', default: true },
		{ name: 'seo', title: 'Search & sharing' }
	],
	fields: [
		defineField({
			name: 'seo',
			type: 'seo',
			group: 'seo',
			description: tokens('fromPrice', 'plans')
		}),
		defineField({
			name: 'story',
			title: 'Scroll story',
			type: 'object',
			group: 'story',
			fields: [
				defineField({
					name: 'eyebrow',
					title: 'Small heading above',
					type: 'string'
				}),
				defineField({
					name: 'titleLines',
					title: 'Headline lines',
					description: 'Each line on its own row, before the accent.',
					type: 'array',
					of: [defineArrayMember({ type: 'string' })],
					validation: (r) => r.max(3)
				}),
				defineField({ name: 'titleAccent', title: 'Headline accent (italic)', type: 'string' }),
				defineField({ name: 'intro', title: 'Intro text', type: 'text', rows: 2 }),
				defineField({ name: 'primaryCta', title: 'Main button', type: 'string' }),
				defineField({ name: 'secondaryCta', title: 'Second button', type: 'string' }),
				defineField({ name: 'heroLabel', title: 'Opening — chapter bar label', type: 'string' }),
				defineField({ name: 'heroCode', title: 'Opening — HUD name', type: 'string' }),
				defineField({
					name: 'chapters',
					title: 'Chapters 02–06',
					description: 'Exactly five, in order: paper, one card, tap, metal, choose.',
					type: 'array',
					of: [defineArrayMember({ type: 'storyChapter' })],
					validation: (r) => r.length(5).warning('The film has five chapters after the opening.')
				}),
				defineField({
					name: 'auditTags',
					title: 'Chapter 02 — tags on the Rolodex',
					description: 'Three: runs out, out of date, forgotten.',
					type: 'array',
					of: [defineArrayMember({ type: 'titledText' })],
					validation: (r) => r.length(3).warning('The Rolodex has three tags.')
				}),
				defineField({
					name: 'cardCallouts',
					title: 'Chapter 03 — callouts on the card',
					description: 'Three: the NFC chip, the brand, the size.',
					type: 'array',
					of: [defineArrayMember({ type: 'titledText' })],
					validation: (r) => r.length(3).warning('The card has three callouts.')
				}),
				defineField({ name: 'closingCta', title: 'Final chapter button', type: 'string' })
			]
		})
	],
	preview: singleton('Home page')
});

export const sharedSections = defineType({
	name: 'sharedSections',
	title: 'Shared sections',
	type: 'document',
	groups: [
		{ name: 'plans', title: 'Plans', default: true },
		{ name: 'designs', title: 'Card designs' },
		{ name: 'experiences', title: 'Experiences' },
		{ name: 'faq', title: 'FAQ' },
		{ name: 'cta', title: 'Closing call to action' }
	],
	fields: [
		defineField({
			name: 'plans',
			title: 'Plans section',
			type: 'object',
			group: 'plans',
			fields: [
				defineField({ name: 'eyebrow', title: 'Small heading above', type: 'string' }),
				defineField({ name: 'title', type: 'headline' }),
				defineField({ name: 'everydayBlurb', title: 'Everyday tab text', type: 'text', rows: 2 }),
				defineField({
					name: 'metalBlurb',
					title: 'Metal tab text',
					type: 'text',
					rows: 2,
					description: tokens('finishes')
				})
			]
		}),
		defineField({
			name: 'metalFinishes',
			title: 'Metal finishes',
			description: 'Listed on metal plans and in {finishes}.',
			type: 'array',
			group: 'plans',
			of: [defineArrayMember({ type: 'string' })]
		}),
		defineField({
			name: 'designs',
			title: 'Card designs section',
			type: 'object',
			group: 'designs',
			fields: [
				defineField({ name: 'eyebrow', title: 'Small heading above', type: 'string' }),
				defineField({ name: 'title', type: 'headline' }),
				defineField({ name: 'body', type: 'text', rows: 3, description: tokens('count') }),
				defineField({ name: 'primaryCta', title: 'Main button', type: 'string' }),
				defineField({ name: 'secondaryCta', title: 'Second button', type: 'string' })
			]
		}),
		defineField({
			name: 'experiences',
			title: 'Experiences section',
			type: 'object',
			group: 'experiences',
			fields: [
				defineField({ name: 'eyebrow', title: 'Small heading above', type: 'string' }),
				defineField({ name: 'title', type: 'headline' }),
				defineField({ name: 'body', type: 'text', rows: 3 }),
				defineField({ name: 'linkLabel', title: 'Link text', type: 'string' }),
				defineField({ name: 'partnerEyebrow', title: 'Services — small heading', type: 'string' }),
				defineField({ name: 'partnerTitle', title: 'Services — headline', type: 'headline' }),
				defineField({
					name: 'services',
					type: 'array',
					of: [defineArrayMember({ type: 'titledText' })]
				})
			]
		}),
		defineField({
			name: 'faq',
			title: 'FAQ section',
			type: 'object',
			group: 'faq',
			description: 'The questions themselves are under FAQs.',
			fields: [
				defineField({ name: 'eyebrow', title: 'Small heading above', type: 'string' }),
				defineField({ name: 'title', type: 'headline' })
			]
		}),
		defineField({
			name: 'finalCta',
			title: 'Closing call to action',
			type: 'object',
			group: 'cta',
			fields: [
				defineField({ name: 'eyebrow', title: 'Small heading above', type: 'string' }),
				defineField({ name: 'title', type: 'headline' }),
				defineField({ name: 'body', type: 'text', rows: 2 }),
				defineField({ name: 'primaryCta', title: 'Main button', type: 'string' })
			]
		})
	],
	preview: singleton('Shared sections')
});

export const plansPage = defineType({
	name: 'plansPage',
	title: 'Plans page',
	type: 'document',
	fields: [
		defineField({ name: 'hero', type: 'pageHero', description: tokens('plans') }),
		defineField({ name: 'seo', type: 'seo', description: tokens('plans') })
	],
	preview: singleton('Plans page')
});

export const templatesPage = defineType({
	name: 'templatesPage',
	title: 'Card designs page',
	type: 'document',
	fields: [
		defineField({ name: 'hero', type: 'pageHero', description: tokens('count') }),
		defineField({ name: 'customTitle', title: 'Custom theme — heading', type: 'string' }),
		defineField({ name: 'customBody', title: 'Custom theme — text', type: 'text', rows: 3 }),
		defineField({ name: 'customCta', title: 'Custom theme — button', type: 'string' }),
		defineField({ name: 'seo', type: 'seo', description: tokens('count') })
	],
	preview: singleton('Card designs page')
});

export const contactPage = defineType({
	name: 'contactPage',
	title: 'Contact page',
	type: 'document',
	fields: [
		defineField({
			name: 'hero',
			type: 'pageHero',
			description: 'Intro text falls back to Site settings › How ordering works.'
		}),
		defineField({ name: 'formTitle', title: 'Form heading', type: 'string' }),
		defineField({ name: 'privacyNote', title: 'Note beside the send button', type: 'string' }),
		defineField({
			name: 'successTitle',
			title: 'After sending — heading',
			description: 'The visitor’s first name is added after it, e.g. "Thank you, Priya."',
			type: 'string'
		}),
		defineField({ name: 'successBody', title: 'After sending — text', type: 'text', rows: 2 }),
		defineField({ name: 'callEyebrow', title: 'Call box — small heading', type: 'string' }),
		defineField({ name: 'callBody', title: 'Call box — text', type: 'text', rows: 2 }),
		defineField({ name: 'followEyebrow', title: 'Instagram box — small heading', type: 'string' }),
		defineField({ name: 'seo', type: 'seo', description: tokens('phone') })
	],
	preview: singleton('Contact page')
});
