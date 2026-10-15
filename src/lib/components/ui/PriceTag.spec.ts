import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import PriceTag from './PriceTag.svelte';

describe('PriceTag', () => {
	it('renders a struck-through MRP, the offer price, the % chip and the offer label', () => {
		const { body } = render(PriceTag, {
			props: { pricing: { offerPrice: 1999, compareAtPrice: 2499, offerLabel: 'Launch offer' } }
		});
		expect(body).toContain('₹1,999');
		expect(body).toMatch(/<s[^>]*>.*₹2,499.*<\/s>/s);
		expect(body).toContain('−20%');
		expect(body).toContain('Launch offer');
		expect(body).toContain('Regular price');
	});

	it('states the saving on the large price', () => {
		const { body } = render(PriceTag, {
			props: { pricing: { offerPrice: 1999, compareAtPrice: 2499 }, size: 'lg' }
		});
		expect(body).toContain('You save ₹500');
		const small = render(PriceTag, {
			props: { pricing: { offerPrice: 1999, compareAtPrice: 2499 } }
		});
		expect(small.body).not.toContain('You save');
	});

	it('renders just the price when there is no offer', () => {
		const { body } = render(PriceTag, { props: { pricing: { offerPrice: 499 } } });
		expect(body).toContain('₹499');
		expect(body).not.toMatch(/<s[\s>]/);
	});
});
