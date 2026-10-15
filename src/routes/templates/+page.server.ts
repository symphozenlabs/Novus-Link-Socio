import { getProducts, getTemplates, getTemplatesPage } from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const [page, templates, products] = await Promise.all([
		getTemplatesPage(),
		getTemplates(),
		getProducts()
	]);
	setHeaders({ 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' });

	// Which plan to pre-select when someone picks a design from a family.
	const planForFamily: Record<string, string> = {};
	for (const p of products) {
		if (p.templateFamily && !planForFamily[p.templateFamily])
			planForFamily[p.templateFamily] = p.slug;
	}
	return { page, templates, planForFamily };
};
