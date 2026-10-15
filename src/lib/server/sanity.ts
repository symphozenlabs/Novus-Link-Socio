import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { PUBLIC_SANITY_DATASET, PUBLIC_SANITY_PROJECT_ID } from '$app/env/public';
import { SANITY_API_READ_TOKEN, SANITY_API_WRITE_TOKEN } from '$app/env/private';

const apiVersion = '2025-02-19';

function config() {
	return {
		projectId: PUBLIC_SANITY_PROJECT_ID,
		dataset: PUBLIC_SANITY_DATASET
	};
}

/** True when a Sanity project is configured; otherwise the site uses built-in content. */
export function sanityEnabled(): boolean {
	return Boolean(config().projectId);
}

let readClient: SanityClient | null = null;
export function sanityRead(): SanityClient | null {
	if (!sanityEnabled()) return null;
	readClient ??= createClient({
		...config(),
		apiVersion,
		useCdn: !SANITY_API_READ_TOKEN,
		token: SANITY_API_READ_TOKEN || undefined,
		perspective: 'published'
	});
	return readClient;
}

/** Client with write access — only used by the enquiry form action. */
export function sanityWrite(): SanityClient | null {
	if (!sanityEnabled() || !SANITY_API_WRITE_TOKEN) return null;
	return createClient({ ...config(), apiVersion, useCdn: false, token: SANITY_API_WRITE_TOKEN });
}

export function imageUrl(source: unknown, width: number): string | null {
	if (!sanityEnabled() || !source) return null;
	const { projectId, dataset } = config();
	return createImageUrlBuilder({ projectId: projectId!, dataset })
		.image(source as SanityImageSource)
		.width(width)
		.auto('format')
		.quality(82)
		.url();
}
