import { cardTemplate, enquiry, experience, faq, siteSettings } from './content';
import {
	contactPage,
	headline,
	homePage,
	link,
	pageHero,
	plansPage,
	seo,
	sharedSections,
	storyChapter,
	templatesPage,
	titledText
} from './pages';
import { pricing } from './pricing';
import { product } from './product';

export const schemaTypes = [
	// building blocks
	pricing,
	headline,
	link,
	titledText,
	seo,
	pageHero,
	storyChapter,
	// pages (singletons)
	homePage,
	sharedSections,
	plansPage,
	templatesPage,
	contactPage,
	// collections
	product,
	cardTemplate,
	experience,
	faq,
	siteSettings,
	enquiry
];

/** One document each, with a fixed id: they can't be created, duplicated or deleted. */
export const singletons = [
	{ type: 'siteSettings', title: 'Site settings' },
	{ type: 'homePage', title: 'Home page' },
	{ type: 'sharedSections', title: 'Shared sections' },
	{ type: 'plansPage', title: 'Plans page' },
	{ type: 'templatesPage', title: 'Card designs page' },
	{ type: 'contactPage', title: 'Contact page' }
];
