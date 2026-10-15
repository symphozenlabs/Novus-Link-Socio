import { describe, expect, it } from 'vitest';
import { cheapestPlan, formatINR, priceText, resolvePrice } from './pricing';

const now = new Date('2026-10-14T12:00:00Z');

describe('resolvePrice', () => {
	it('shows only the offer price when no compare-at price is set', () => {
		expect(resolvePrice({ offerPrice: 499 }, now)).toMatchObject({
			current: 499,
			original: null,
			percentOff: null
		});
	});

	it('shows a strike price and rounded-down discount when compare-at is higher', () => {
		const r = resolvePrice(
			{ offerPrice: 1999, compareAtPrice: 2899, offerLabel: 'Launch offer' },
			now
		);
		expect(r).toMatchObject({
			current: 1999,
			original: 2899,
			percentOff: 31,
			label: 'Launch offer'
		});
	});

	it('ignores a compare-at price that is not higher than the offer', () => {
		expect(resolvePrice({ offerPrice: 799, compareAtPrice: 799 }, now).original).toBeNull();
		expect(resolvePrice({ offerPrice: 799, compareAtPrice: 500 }, now).original).toBeNull();
	});

	it('reverts to the compare-at price once the offer has ended', () => {
		const r = resolvePrice(
			{ offerPrice: 999, compareAtPrice: 1299, offerEndsAt: '2026-10-01T00:00:00Z' },
			now
		);
		expect(r).toMatchObject({ current: 1299, original: null, percentOff: null, label: null });
	});

	it('keeps a running offer and exposes its end date', () => {
		const r = resolvePrice(
			{ offerPrice: 999, compareAtPrice: 1299, offerEndsAt: '2026-12-31T00:00:00Z' },
			now
		);
		expect(r.current).toBe(999);
		expect(r.endsAt?.toISOString()).toBe('2026-12-31T00:00:00.000Z');
	});

	it('can hide the percentage chip', () => {
		const r = resolvePrice(
			{ offerPrice: 900, compareAtPrice: 1000, showDiscountPercent: false },
			now
		);
		expect(r.original).toBe(1000);
		expect(r.percentOff).toBeNull();
	});
});

describe('formatINR', () => {
	it('uses the rupee sign and Indian digit grouping', () => {
		expect(formatINR(1299)).toBe('₹1,299');
		expect(formatINR(125000)).toBe('₹1,25,000');
	});
});

describe('cheapestPlan', () => {
	it('picks the lowest price charged today among available plans', () => {
		const plans = [
			{ slug: 'a', available: true, pricing: { offerPrice: 349 } },
			{ slug: 'b', available: false, pricing: { offerPrice: 99 } },
			{ slug: 'c', available: true, pricing: { offerPrice: 199, compareAtPrice: 249 } }
		];
		expect(cheapestPlan(plans, now)?.slug).toBe('c');
		expect(cheapestPlan([], now)).toBeNull();
	});
});

describe('priceText', () => {
	it('mentions the striked price when an offer is live', () => {
		expect(priceText({ offerPrice: 199, compareAtPrice: 249 }, now)).toBe('₹199 (was ₹249)');
		expect(priceText({ offerPrice: 199 }, now)).toBe('₹199');
	});
});
