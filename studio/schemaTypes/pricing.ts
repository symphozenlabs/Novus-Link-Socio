import { defineField, defineType } from 'sanity';

/**
 * Pricing for a plan. The site shows:
 *   ~~₹compareAtPrice~~  ₹offerPrice  [−x%]  [offerLabel]
 * The strike price is only shown when it is higher than the offer price, and
 * it disappears automatically once `offerEndsAt` has passed (the compare-at
 * price is then charged), so an expired promotion never keeps advertising.
 */
export const pricing = defineType({
	name: 'pricing',
	title: 'Pricing',
	type: 'object',
	options: { collapsible: false },
	fields: [
		defineField({
			name: 'offerPrice',
			title: 'Offer price (₹)',
			description: 'What the customer pays. Whole rupees.',
			type: 'number',
			validation: (r) => r.required().integer().positive()
		}),
		defineField({
			name: 'compareAtPrice',
			title: 'Striked price / MRP (₹)',
			description:
				'Optional. Shown struck-through next to the offer price. Must be higher than the offer price. Only use a genuine previous or regular price.',
			type: 'number',
			validation: (r) =>
				r
					.integer()
					.positive()
					.custom((value, ctx) => {
						const offer = (ctx.parent as { offerPrice?: number } | undefined)?.offerPrice;
						if (value == null || offer == null) return true;
						return value > offer || 'The striked price must be higher than the offer price.';
					})
		}),
		defineField({
			name: 'offerLabel',
			title: 'Offer label',
			description: 'Short tag shown with the price, e.g. "Launch offer" or "Diwali price".',
			type: 'string',
			validation: (r) => r.max(28)
		}),
		defineField({
			name: 'offerEndsAt',
			title: 'Offer ends at',
			description: 'Optional. After this moment the striked price becomes the price again.',
			type: 'datetime'
		}),
		defineField({
			name: 'showDiscountPercent',
			title: 'Show “% off” chip',
			type: 'boolean',
			initialValue: true
		})
	]
});
