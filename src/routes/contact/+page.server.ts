import { fail } from '@sveltejs/kit';
import { getContactPage, getProducts, getSettings } from '#lib/server/content.ts';
import { parseEnquiry } from '#lib/server/enquiry.ts';
import { sanityWrite } from '#lib/server/sanity.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [page, products] = await Promise.all([getContactPage(), getProducts()]);
	return {
		page,
		plans: products
			.filter((p) => p.available)
			.map((p) => ({ slug: p.slug, name: p.name, line: p.line, pricing: p.pricing }))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();

		// Honeypot: real visitors never see or fill this field.
		if (String(form.get('website') ?? '').trim()) return { success: true as const, name: '' };

		const products = await getProducts();
		const { values, errors, valid } = parseEnquiry(
			form,
			products.map((p) => p.slug)
		);
		if (!valid) return fail(400, { values, errors });

		const client = sanityWrite();
		if (!client) {
			const settings = await getSettings();
			return fail(503, {
				values,
				errors: {},
				offline: true,
				phone: settings.phone,
				phoneDisplay: settings.phoneDisplay
			});
		}

		try {
			await client.create({
				_type: 'enquiry',
				...values,
				plan: products.find((p) => p.slug === values.plan)?.name ?? values.plan,
				status: 'new',
				submittedAt: new Date().toISOString()
			});
		} catch (err) {
			console.error('[enquiry] could not save:', (err as Error).message);
			return fail(500, { values, errors: {}, saveFailed: true });
		}

		return { success: true as const, name: values.name.split(' ')[0] };
	}
};
