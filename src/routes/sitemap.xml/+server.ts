import { getProducts } from '#lib/server/content.ts';
import type { RequestHandler } from './$types';

const site = 'https://www.novuslinksocio.com';

export const GET: RequestHandler = async () => {
	const products = await getProducts();
	const paths = [
		'/',
		'/plans',
		'/templates',
		'/contact',
		...products.map((p) => `/plans/${p.slug}`)
	];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `\t<url><loc>${site}${p}</loc></url>`).join('\n')}
</urlset>`;
	return new Response(body, {
		headers: { 'content-type': 'application/xml', 'cache-control': 'public, max-age=3600' }
	});
};
