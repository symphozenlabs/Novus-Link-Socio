import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import RichText from './RichText.svelte';
import Headline from './Headline.svelte';

describe('RichText', () => {
	it('renders {fromPrice} as a struck MRP and the offer price', () => {
		const { body } = render(RichText, {
			props: {
				text: '{plans} plans, from a {fromPrice} QR card.',
				vars: { plans: 10 },
				fromPrice: { offerPrice: 199, compareAtPrice: 249 }
			}
		});
		expect(body).toContain('10 plans, from a ');
		expect(body).toMatch(/<s[^>]*>.*₹249.*<\/s>/s);
		expect(body).toContain('₹199');
		expect(body).toContain(' QR card.');
	});

	it('renders just the price when there is no offer', () => {
		const { body } = render(RichText, {
			props: { text: 'From {fromPrice}', fromPrice: { offerPrice: 199 } }
		});
		expect(body).toContain('₹199');
		expect(body).not.toMatch(/<s[\s>]/);
	});
});

describe('Headline', () => {
	it('sets the accent in the serif and fills placeholders', () => {
		const { body } = render(Headline, {
			props: {
				value: { text: 'One identity.', accent: '{plans} ways', after: 'to carry it.' },
				vars: { plans: 10 }
			}
		});
		// Ignore Svelte's hydration markers.
		const html = body.replace(/<!--.*?-->/g, '');
		expect(html).toMatch(
			/One identity\. <span class="serif-accent[^"]*">10 ways<\/span> to carry it\./
		);
	});
});
