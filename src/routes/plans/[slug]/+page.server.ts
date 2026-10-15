import { error } from '@sveltejs/kit';
import { getProducts, getTemplates } from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const [products, templates] = await Promise.all([getProducts(), getTemplates()]);
	const index = products.findIndex((p) => p.slug === params.slug);
	if (index === -1) error(404, 'We couldn’t find that plan.');

	const product = products[index];
	const includes = product.includesPlan
		? (products.find((p) => p.slug === product.includesPlan) ?? null)
		: null;
	const sameLine = products.filter((p) => p.line === product.line);
	const i = sameLine.findIndex((p) => p.slug === product.slug);

	setHeaders({ 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' });
	return {
		product,
		includes,
		prev: sameLine[i - 1] ?? null,
		next: sameLine[i + 1] ?? null,
		templates: product.templateFamily
			? templates.filter((t) => t.family === product.templateFamily)
			: []
	};
};
