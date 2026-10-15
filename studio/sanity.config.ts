import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes, singletons } from './schemaTypes';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

const singletonTypes = new Set(singletons.map((s) => s.type));

export default defineConfig({
	name: 'novus-link-socio',
	title: 'Novus Link Socio',
	projectId,
	dataset,
	plugins: [
		structureTool({
			structure: (S) => {
				const page = (type: string) => {
					const { title } = singletons.find((s) => s.type === type)!;
					return S.listItem()
						.title(title)
						.id(type)
						.child(S.document().schemaType(type).documentId(type).title(title));
				};
				return S.list()
					.title('Novus Link Socio')
					.items([
						page('siteSettings'),
						S.divider(),
						S.documentTypeListItem('product').title('Plans & prices'),
						S.documentTypeListItem('cardTemplate').title('Card templates'),
						S.documentTypeListItem('experience').title('Enhanced experiences'),
						S.documentTypeListItem('faq').title('FAQs'),
						S.divider(),
						S.listItem()
							.title('Page copy')
							.child(
								S.list()
									.title('Page copy')
									.items([
										page('homePage'),
										page('sharedSections'),
										page('plansPage'),
										page('templatesPage'),
										page('contactPage')
									])
							),
						S.divider(),
						S.documentTypeListItem('enquiry').title('Enquiries')
					]);
			}
		}),
		visionTool()
	],
	schema: {
		types: schemaTypes,
		// Singletons can't be created from the "new document" menu.
		templates: (prev) => prev.filter((t) => !singletonTypes.has(t.schemaType))
	},
	document: {
		actions: (prev, ctx) =>
			singletonTypes.has(ctx.schemaType)
				? prev.filter((a) => !['duplicate', 'delete', 'unpublish'].includes(a.action ?? ''))
				: prev
	}
});
