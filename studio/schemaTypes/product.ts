import { defineArrayMember, defineField, defineType } from 'sanity';

const visuals = [
	{ title: 'QR card', value: 'qr-card' },
	{ title: 'NFC keychain', value: 'keychain' },
	{ title: 'NFC keychain + QR card', value: 'keychain-card' },
	{ title: 'NFC card', value: 'nfc-card' },
	{ title: 'NFC card + microsite profile', value: 'nfc-card-profile' },
	{ title: 'NFC card + 2 profiles', value: 'nfc-card-profiles-2' },
	{ title: 'NFC card + 3 profiles', value: 'nfc-card-profiles-3' },
	{ title: 'Metal — silver', value: 'metal-silver' },
	{ title: 'Metal — rose gold', value: 'metal-rose' },
	{ title: 'Metal — gold', value: 'metal-gold' }
];

export const templateFamilies = [
	{ title: 'Lite · Spark Plus', value: 'lite' },
	{ title: 'Pulse', value: 'pulse' },
	{ title: 'Pro', value: 'pro' },
	{ title: 'Elite', value: 'elite' },
	{ title: 'Pinnacle', value: 'pinnacle' },
	{ title: 'Metal', value: 'metal' }
];

export const product = defineType({
	name: 'product',
	title: 'Plan / product',
	type: 'document',
	groups: [
		{ name: 'main', title: 'Plan', default: true },
		{ name: 'price', title: 'Price & offer' },
		{ name: 'media', title: 'Visual' }
	],
	fields: [
		defineField({ name: 'name', type: 'string', group: 'main', validation: (r) => r.required() }),
		defineField({
			name: 'slug',
			type: 'slug',
			group: 'main',
			options: { source: 'name', maxLength: 48 },
			validation: (r) => r.required()
		}),
		defineField({
			name: 'line',
			title: 'Collection',
			type: 'string',
			group: 'main',
			options: {
				list: [
					{ title: 'Everyday (PVC / NFC)', value: 'everyday' },
					{ title: 'Metal', value: 'metal' }
				],
				layout: 'radio'
			},
			initialValue: 'everyday',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'order',
			title: 'Sort order',
			type: 'number',
			group: 'main',
			description: 'Lower numbers appear first.',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'tagline',
			type: 'string',
			group: 'main',
			validation: (r) => r.required().max(60)
		}),
		defineField({
			name: 'summary',
			type: 'text',
			rows: 2,
			group: 'main',
			validation: (r) => r.required().max(160)
		}),
		defineField({
			name: 'highlight',
			title: 'Highlighted phrase',
			description: 'Appended to the summary in brand violet, e.g. "Just tap and connect."',
			type: 'string',
			group: 'main'
		}),
		defineField({ name: 'audience', title: 'Perfect for', type: 'string', group: 'main' }),
		defineField({
			name: 'includesPlan',
			title: 'Includes everything from',
			type: 'reference',
			to: [{ type: 'product' }],
			group: 'main'
		}),
		defineField({
			name: 'features',
			type: 'array',
			group: 'main',
			of: [defineArrayMember({ type: 'string' })],
			validation: (r) => r.required().min(1)
		}),
		defineField({
			name: 'pricing',
			type: 'pricing',
			group: 'price',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'badge',
			description: 'Optional ribbon, e.g. "New". Leave empty unless it is true.',
			type: 'string',
			group: 'price',
			validation: (r) => r.max(20)
		}),
		defineField({
			name: 'available',
			title: 'Available to order',
			type: 'boolean',
			group: 'price',
			initialValue: true
		}),
		defineField({
			name: 'visual',
			title: 'Illustration',
			description: 'Drawn by the website when no photo is uploaded.',
			type: 'string',
			group: 'media',
			options: { list: visuals },
			validation: (r) => r.required()
		}),
		defineField({
			name: 'image',
			title: 'Product photo (optional)',
			description: 'Transparent PNG/WebP works best on the dark site.',
			type: 'image',
			group: 'media',
			options: { hotspot: true },
			fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })]
		}),
		defineField({
			name: 'templateFamily',
			title: 'Card templates offered',
			type: 'string',
			group: 'media',
			options: { list: templateFamilies }
		})
	],
	orderings: [{ title: 'Sort order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
	preview: {
		select: {
			title: 'name',
			offer: 'pricing.offerPrice',
			compare: 'pricing.compareAtPrice',
			line: 'line',
			media: 'image'
		},
		prepare: ({ title, offer, compare, line, media }) => ({
			title,
			subtitle: `${line === 'metal' ? 'Metal' : 'Everyday'} · ₹${offer ?? '—'}${compare ? ` (was ₹${compare})` : ''}`,
			media
		})
	}
});
