import { getSections, getSettings } from '#lib/server/content.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const [settings, sections] = await Promise.all([getSettings(), getSections()]);
	return { settings, sections };
};
