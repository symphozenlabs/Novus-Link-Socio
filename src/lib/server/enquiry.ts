export interface EnquiryInput {
	name: string;
	phone: string;
	email: string;
	plan: string;
	template: string;
	quantity: number;
	message: string;
	topic: string;
}

export type EnquiryErrors = Partial<Record<keyof EnquiryInput, string>>;

const str = (v: FormDataEntryValue | null, max: number) =>
	String(v ?? '')
		.trim()
		.slice(0, max);

export function parseEnquiry(form: FormData, planSlugs: string[]) {
	const values: EnquiryInput = {
		name: str(form.get('name'), 80),
		phone: str(form.get('phone'), 20),
		email: str(form.get('email'), 120),
		plan: str(form.get('plan'), 40),
		template: str(form.get('template'), 20).toUpperCase(),
		quantity: Number.parseInt(str(form.get('quantity'), 4) || '1', 10),
		message: str(form.get('message'), 1000),
		topic: str(form.get('topic'), 20)
	};

	const errors: EnquiryErrors = {};
	if (values.name.length < 2) errors.name = 'Please tell us your name.';
	const digits = values.phone.replace(/[\s\-()+]/g, '');
	if (!/^\d{10,13}$/.test(digits))
		errors.phone = 'Enter a 10-digit mobile number (country code optional).';
	if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
		errors.email = 'That email address looks incomplete.';
	if (values.plan && values.plan !== 'not-sure' && !planSlugs.includes(values.plan))
		errors.plan = 'Please choose a plan from the list.';
	if (!Number.isInteger(values.quantity) || values.quantity < 1 || values.quantity > 500)
		errors.quantity = 'Quantity must be between 1 and 500.';
	if (values.template && !/^[A-Z0-9-]{2,20}$/.test(values.template))
		errors.template = 'Use the code shown under the design, e.g. NLST-22.';

	return { values, errors, valid: Object.keys(errors).length === 0 };
}
