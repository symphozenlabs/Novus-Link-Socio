import { getFaqs, getPlansPage, getProducts } from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const [page, products, faqs] = await Promise.all([getPlansPage(), getProducts(), getFaqs()]);
	setHeaders({ 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' });
	return { page, products, faqs };
};
