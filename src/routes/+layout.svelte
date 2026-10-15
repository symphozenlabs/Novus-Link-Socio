<script lang="ts">
	import '@fontsource-variable/bricolage-grotesque/standard.css';
	import '@fontsource-variable/manrope';
	import '@fontsource/instrument-serif/latin-400-italic.css';
	import './layout.css';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	// Soft cross-fade between pages where the browser supports View Transitions.
	onNavigate((navigation) => {
		if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches)
			return;
		if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	const siteUrl = 'https://www.novuslinksocio.com';

	// Liquid glass: the specular light follows the pointer over any .glass surface.
	$effect(() => {
		if (!matchMedia('(pointer: fine)').matches) return;
		const onMove = (e: PointerEvent) => {
			const el = (e.target as Element | null)?.closest?.<HTMLElement>('.glass');
			if (!el) return;
			const r = el.getBoundingClientRect();
			el.style.setProperty('--lx', `${e.clientX - r.left}px`);
			el.style.setProperty('--ly', `${e.clientY - r.top}px`);
		};
		addEventListener('pointermove', onMove, { passive: true });
		return () => removeEventListener('pointermove', onMove);
	});
</script>

<svelte:head>
	<meta property="og:site_name" content="Novus Link Socio" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{siteUrl}{page.url.pathname}" />
	<meta property="og:image" content="{siteUrl}/og.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href="{siteUrl}{page.url.pathname}" />
</svelte:head>

<div class="grain">
	<div class="ambient-fixed" aria-hidden="true"><i></i><i></i><i></i></div>
	<SiteHeader settings={data.settings} />
	<main id="main" tabindex="-1" class="outline-none">
		{@render children()}
	</main>
	<SiteFooter settings={data.settings} />
</div>
