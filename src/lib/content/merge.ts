/**
 * Overlays CMS content on the built-in copy. An empty field (null, "", or an
 * empty list) keeps the built-in value, so the site never shows a blank where
 * an editor cleared something. Sanity's own keys (`_type`, `_key`…) are dropped.
 */
export function merge<T>(fallback: T, raw: unknown): T {
	if (raw == null || raw === '') return fallback;
	if (Array.isArray(fallback) || Array.isArray(raw)) {
		if (!Array.isArray(raw)) return fallback;
		const items = raw.filter((v) => v != null && v !== '');
		if (!items.length) return fallback;
		const base = Array.isArray(fallback) ? fallback : [];
		return items.map((item, i) => (i < base.length ? merge(base[i], item) : clean(item))) as T;
	}
	if (typeof raw === 'object') {
		const base = (fallback && typeof fallback === 'object' ? fallback : {}) as Record<
			string,
			unknown
		>;
		const out: Record<string, unknown> = { ...base };
		for (const [k, v] of Object.entries(raw)) {
			if (k.startsWith('_')) continue;
			out[k] = k in base ? merge(base[k], v) : clean(v);
		}
		return out as T;
	}
	return raw as T;
}

function clean(v: unknown): unknown {
	return merge(Array.isArray(v) ? [] : typeof v === 'object' ? {} : null, v);
}

/** Fills a fixed-length list from the built-in one where the CMS has fewer items. */
export function pad<T>(items: T[], fallback: T[]): T[] {
	return fallback.map((f, i) => items[i] ?? f);
}
