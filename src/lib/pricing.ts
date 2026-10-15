import type { Pricing } from '#lib/content/types.ts';

export interface ResolvedPrice {
	/** Amount charged now. */
	current: number;
	/** Struck-through amount, only when a valid, live offer exists. */
	original: number | null;
	/** Whole-number percentage saved, when it should be displayed. */
	percentOff: number | null;
	label: string | null;
	endsAt: Date | null;
}

/**
 * Turns the CMS pricing fields into what the UI should show.
 * - A strike price only appears when it is higher than the offer price.
 * - Once `offerEndsAt` passes, the offer is dropped and the compare-at price is charged,
 *   so an expired promotion can never keep advertising a discount.
 */
export function resolvePrice(p: Pricing, now: Date = new Date()): ResolvedPrice {
	const offer = p.offerPrice;
	const compare = p.compareAtPrice ?? null;
	const endsAt = p.offerEndsAt ? new Date(p.offerEndsAt) : null;
	const validEnd = endsAt && !Number.isNaN(endsAt.getTime()) ? endsAt : null;
	const hasDiscount = compare !== null && compare > offer;

	if (hasDiscount && validEnd && validEnd.getTime() <= now.getTime()) {
		return { current: compare, original: null, percentOff: null, label: null, endsAt: null };
	}

	if (!hasDiscount) {
		return {
			current: offer,
			original: null,
			percentOff: null,
			label: p.offerLabel ?? null,
			endsAt: null
		};
	}

	const pct = Math.floor(((compare - offer) / compare) * 100);
	return {
		current: offer,
		original: compare,
		percentOff: p.showDiscountPercent !== false && pct >= 1 ? pct : null,
		label: p.offerLabel ?? null,
		endsAt: validEnd
	};
}

const inr = new Intl.NumberFormat('en-IN', {
	style: 'currency',
	currency: 'INR',
	maximumFractionDigits: 0
});

export function formatINR(amount: number): string {
	return inr.format(amount);
}

/** The available plan with the lowest current price — the "from ₹…" plan. */
export function cheapestPlan<T extends { available: boolean; pricing: Pricing }>(
	plans: T[],
	now: Date = new Date()
): T | null {
	let best: T | null = null;
	let bestPrice = Infinity;
	for (const p of plans) {
		if (!p.available) continue;
		const price = resolvePrice(p.pricing, now).current;
		if (price < bestPrice) [best, bestPrice] = [p, price];
	}
	return best;
}

/** Plain-text price for places that can't show a strike (titles, meta tags, <option>s). */
export function priceText(p: Pricing, now: Date = new Date()): string {
	const r = resolvePrice(p, now);
	return r.original
		? `${formatINR(r.current)} (was ${formatINR(r.original)})`
		: formatINR(r.current);
}
