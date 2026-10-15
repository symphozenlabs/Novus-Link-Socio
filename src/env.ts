import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => (value ? value : undefined);

/**
 * All variables are optional: without a Sanity project the site serves the
 * built-in brochure content and the enquiry form explains how to reach the team.
 */
export const variables = defineEnvVars({
	PUBLIC_SANITY_PROJECT_ID: {
		public: true,
		schema: optional,
		description: 'Sanity project id. Leave empty to use the built-in content.'
	},
	PUBLIC_SANITY_DATASET: {
		public: true,
		schema: (v) => v || 'production',
		description: 'Sanity dataset name.'
	},
	SANITY_API_READ_TOKEN: {
		schema: optional,
		description: 'Optional viewer token (only needed for a private dataset).'
	},
	SANITY_API_WRITE_TOKEN: {
		schema: optional,
		description: 'Editor token used to save enquiries as documents in Sanity.'
	}
});
