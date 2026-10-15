import { describe, expect, it } from 'vitest';
import { fill, listJoin, parts } from './text';

describe('fill', () => {
	it('replaces known placeholders and keeps unknown ones visible', () => {
		expect(fill('{plans} plans from {fromPrice}', { plans: 10, fromPrice: '₹199' })).toBe(
			'10 plans from ₹199'
		);
		expect(fill('Hello {nmae}', { name: 'x' })).toBe('Hello {nmae}');
	});
});

describe('parts', () => {
	it('splits only around the requested placeholders', () => {
		expect(parts('{plans} plans, from a {fromPrice} card', ['fromPrice'])).toEqual([
			{ text: '{plans} plans, from a ' },
			{ token: 'fromPrice' },
			{ text: ' card' }
		]);
	});

	it('returns the whole text when no placeholder matches', () => {
		expect(parts('No tokens here', ['fromPrice'])).toEqual([{ text: 'No tokens here' }]);
	});
});

describe('listJoin', () => {
	it('joins with commas and a final "and"', () => {
		expect(listJoin(['Black', 'Silver', 'Gold', 'Rose Gold'])).toBe(
			'Black, Silver, Gold and Rose Gold'
		);
		expect(listJoin(['Gold'])).toBe('Gold');
		expect(listJoin([])).toBe('');
	});
});
