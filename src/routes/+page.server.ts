import {
	getExperiences,
	getFaqs,
	getHome,
	getProducts,
	getTemplates
} from '#lib/server/content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const [home, products, templates, experiences, faqs] = await Promise.all([
		getHome(),
		getProducts(),
		getTemplates(),
		getExperiences(),
		getFaqs()
	]);
	setHeaders({ 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' });
	return { home, products, templates, experiences, faqs };
};
