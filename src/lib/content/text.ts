/**
 * Placeholders in editor-written copy, e.g. "Choose from {count} designs".
 * Unknown placeholders are left exactly as typed, so a typo shows up on the
 * page (and in review) instead of silently disappearing.
 */
export type Vars = Record<string, string | number>;

const TOKEN = /\{(\w+)\}/g;

export function fill(text: string, vars: Vars): string {
	return text.replace(TOKEN, (whole, name: string) => (name in vars ? String(vars[name]) : whole));
}

export type Part = { text: string } | { token: string };

/** Splits text around the placeholders in `tokens`, for markup a string can't hold (e.g. a struck price). */
export function parts(text: string, tokens: string[]): Part[] {
	const out: Part[] = [];
	let last = 0;
	for (const m of text.matchAll(TOKEN)) {
		if (!tokens.includes(m[1])) continue;
		if (m.index > last) out.push({ text: text.slice(last, m.index) });
		out.push({ token: m[1] });
		last = m.index + m[0].length;
	}
	if (last < text.length) out.push({ text: text.slice(last) });
	return out;
}

/** "Black, Silver, Gold and Rose Gold". */
export function listJoin(items: readonly string[]): string {
	if (items.length < 2) return items.join('');
	return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
