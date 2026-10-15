import { describe, expect, it } from 'vitest';
import { merge, pad } from './merge';

describe('merge', () => {
	const fallback = {
		title: { text: 'Pick the card that', accent: 'speaks first.' },
		lead: null as string | null,
		lines: ['a', 'b'],
		tags: [
			{ title: 'One', detail: 'first' },
			{ title: 'Two', detail: 'second' }
		]
	};

	it('keeps the built-in value where the CMS field is empty', () => {
		const out = merge(fallback, {
			_type: 'page',
			title: { _type: 'headline', text: '', accent: 'shines.' },
			lead: '',
			lines: [],
			tags: null
		});
		expect(out).toEqual({ ...fallback, title: { text: 'Pick the card that', accent: 'shines.' } });
	});

	it('takes CMS values, including fields and list items the built-in copy lacks', () => {
		const out = merge(fallback, {
			title: { text: 'New', after: 'today' },
			lead: 'Hello',
			lines: ['only one'],
			tags: [
				{ _key: 'k1', title: 'Uno' },
				{ _key: 'k2', title: 'Dos' },
				{ title: 'Tres', detail: 'x' }
			]
		});
		expect(out.title).toEqual({ text: 'New', accent: 'speaks first.', after: 'today' });
		expect(out.lead).toBe('Hello');
		expect(out.lines).toEqual(['only one']);
		expect(out.tags).toEqual([
			{ title: 'Uno', detail: 'first' },
			{ title: 'Dos', detail: 'second' },
			{ title: 'Tres', detail: 'x' }
		]);
	});

	it('returns the built-in copy when there is no document', () => {
		expect(merge(fallback, null)).toBe(fallback);
	});
});

describe('pad', () => {
	it('fills a fixed-length list from the built-in one', () => {
		expect(pad([1], [7, 8, 9])).toEqual([1, 8, 9]);
		expect(pad([1, 2, 3, 4], [7, 8, 9])).toEqual([1, 2, 3]);
	});
});
