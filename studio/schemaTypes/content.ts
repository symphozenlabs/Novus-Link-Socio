import { defineArrayMember, defineField, defineType } from 'sanity';
import { templateFamilies } from './product';

export const cardTemplate = defineType({
	name: 'cardTemplate',
	title: 'Card template',
	type: 'document',
	fields: [
		defineField({
			name: 'code',
			description: 'Catalogue code, e.g. NLST-22.',
			type: 'string',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'family',
			title: 'Catalogue section',
			type: 'string',
			options: { list: templateFamilies },
			validation: (r) => r.required()
		}),
		defineField({
			name: 'planLabel',
			title: 'Plan label',
			description: 'Shown on the card, e.g. "Pulse" or "Lite · Spark Plus".',
			type: 'string',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'front',
			type: 'image',
			validation: (r) => r.required(),
			fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })]
		}),
		defineField({ name: 'back', type: 'image' }),
		defineField({ name: 'order', type: 'number' })
	],
	preview: {
		select: { title: 'code', subtitle: 'planLabel', media: 'front' }
	}
});

export const experience = defineType({
	name: 'experience',
	title: 'Enhanced experience',
	type: 'document',
	fields: [
		defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
		defineField({
			name: 'icon',
			type: 'string',
			options: {
				list: [
					{ title: 'Invitation', value: 'invite' },
					{ title: 'Resume', value: 'resume' },
					{ title: 'Feedback', value: 'feedback' },
					{ title: 'Menu', value: 'menu' }
				]
			},
			validation: (r) => r.required()
		}),
		defineField({
			name: 'points',
			type: 'array',
			of: [defineArrayMember({ type: 'string' })],
			validation: (r) => r.required().min(1).max(3)
		}),
		defineField({ name: 'order', type: 'number' })
	]
});

export const faq = defineType({
	name: 'faq',
	title: 'FAQ',
	type: 'document',
	fields: [
		defineField({ name: 'question', type: 'string', validation: (r) => r.required() }),
		defineField({ name: 'answer', type: 'text', rows: 4, validation: (r) => r.required() }),
		defineField({ name: 'order', type: 'number' })
	]
});

export const siteSettings = defineType({
	name: 'siteSettings',
	title: 'Site settings',
	type: 'document',
	groups: [
		{ name: 'contact', title: 'Contact & prices', default: true },
		{ name: 'chrome', title: 'Header & footer' }
	],
	fields: [
		defineField({
			name: 'nav',
			title: 'Header menu',
			description: 'Leave empty to use the built-in menu.',
			type: 'array',
			group: 'chrome',
			of: [defineArrayMember({ type: 'link' })]
		}),
		defineField({
			name: 'headerCta',
			title: 'Header button',
			description: 'Opens the enquiry form. Leave empty for "Order your card".',
			type: 'string',
			group: 'chrome'
		}),
		defineField({
			name: 'footerTagline',
			title: 'Footer text',
			type: 'text',
			rows: 2,
			group: 'chrome'
		}),
		defineField({
			name: 'footerLinks',
			title: 'Footer links',
			type: 'array',
			group: 'chrome',
			of: [defineArrayMember({ type: 'link' })]
		}),
		defineField({
			name: 'footerWordmark',
			title: 'Footer big words',
			description: 'The large outlined words at the foot of every page.',
			type: 'string',
			group: 'chrome'
		}),
		defineField({
			name: 'parentBrand',
			title: 'Footer "From …" credit',
			type: 'string',
			group: 'chrome'
		}),
		defineField({
			name: 'phone',
			group: 'contact',
			description: 'E.164 format, used for tel: links. e.g. +918190020805',
			type: 'string',
			validation: (r) => r.required().regex(/^\+\d{8,15}$/, { name: 'E.164 phone' })
		}),
		defineField({
			name: 'phoneDisplay',
			group: 'contact',
			title: 'Phone (display)',
			type: 'string',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'whatsapp',
			group: 'contact',
			title: 'WhatsApp number',
			description:
				'Digits only with country code, e.g. 918190020805. Leave empty to hide WhatsApp links.',
			type: 'string',
			validation: (r) => r.regex(/^\d{8,15}$/, { name: 'digits' })
		}),
		defineField({ name: 'email', group: 'contact', type: 'string', validation: (r) => r.email() }),
		defineField({ name: 'instagram', group: 'contact', title: 'Instagram handle', type: 'string' }),
		defineField({
			name: 'announcement',
			group: 'contact',
			description: 'Optional one-line banner across the top of every page.',
			type: 'string',
			validation: (r) => r.max(90)
		}),
		defineField({
			name: 'priceNote',
			group: 'contact',
			title: 'Price note',
			description: 'Shown under prices, e.g. "Inclusive of GST. Shipping extra."',
			type: 'string'
		}),
		defineField({
			name: 'orderingNote',
			group: 'contact',
			title: 'How ordering works',
			description: 'Shown above the enquiry form.',
			type: 'text',
			rows: 3
		})
	],
	preview: { prepare: () => ({ title: 'Site settings' }) }
});

export const enquiry = defineType({
	name: 'enquiry',
	title: 'Enquiry',
	type: 'document',
	readOnly: true,
	fields: [
		defineField({ name: 'name', type: 'string' }),
		defineField({ name: 'phone', type: 'string' }),
		defineField({ name: 'email', type: 'string' }),
		defineField({ name: 'plan', type: 'string' }),
		defineField({ name: 'template', type: 'string' }),
		defineField({ name: 'quantity', type: 'number' }),
		defineField({ name: 'message', type: 'text' }),
		defineField({
			name: 'status',
			type: 'string',
			readOnly: false,
			options: { list: ['new', 'contacted', 'ordered', 'closed'] },
			initialValue: 'new'
		}),
		defineField({ name: 'submittedAt', type: 'datetime' })
	],
	orderings: [
		{ title: 'Newest', name: 'newest', by: [{ field: 'submittedAt', direction: 'desc' }] }
	],
	preview: {
		select: { title: 'name', plan: 'plan', status: 'status', phone: 'phone' },
		prepare: ({ title, plan, status, phone }) => ({
			title: title || 'Unnamed',
			subtitle: [status, plan, phone].filter(Boolean).join(' · ')
		})
	}
});
