import { describe, expect, it } from 'vitest';
import { parseEnquiry } from './enquiry';

const fd = (o: Record<string, string>) => {
	const f = new FormData();
	for (const [k, v] of Object.entries(o)) f.set(k, v);
	return f;
};

describe('parseEnquiry', () => {
	it('accepts a minimal valid enquiry', () => {
		const r = parseEnquiry(fd({ name: 'Asha', phone: '+91 81900 20805' }), ['pulse']);
		expect(r.valid).toBe(true);
		expect(r.values.quantity).toBe(1);
	});

	it('flags missing name, bad phone and bad email', () => {
		const r = parseEnquiry(fd({ name: 'A', phone: '123', email: 'nope' }), []);
		expect(Object.keys(r.errors).sort()).toEqual(['email', 'name', 'phone']);
	});

	it('rejects unknown plans but allows "not sure"', () => {
		expect(
			parseEnquiry(fd({ name: 'Ravi', phone: '9876543210', plan: 'gold' }), ['pulse']).errors.plan
		).toBeTruthy();
		expect(
			parseEnquiry(fd({ name: 'Ravi', phone: '9876543210', plan: 'not-sure' }), ['pulse']).valid
		).toBe(true);
	});

	it('normalises template codes and bounds quantity', () => {
		const r = parseEnquiry(
			fd({ name: 'Ravi', phone: '9876543210', template: 'nlst-22', quantity: '900' }),
			[]
		);
		expect(r.values.template).toBe('NLST-22');
		expect(r.errors.quantity).toBeTruthy();
	});
});
