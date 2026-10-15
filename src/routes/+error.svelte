<script lang="ts">
	import { page } from '$app/state';
	import Button from '#lib/components/ui/Button.svelte';
	import IdentityCard from '#lib/components/product/IdentityCard.svelte';

	let notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Page not found' : 'Something went wrong'} — Novus Link Socio</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section
	class="relative grid min-h-[90svh] place-items-center overflow-hidden pt-[var(--header-h)]"
>
	<div class="container-x grid items-center gap-12 py-20 md:grid-cols-2">
		<div>
			<p class="eyebrow">Error {page.status}</p>
			<h1 class="mt-4 text-[clamp(3rem,8vw,6.5rem)]">
				{#if notFound}This card <span class="serif-accent text-gradient-violet">didn't tap.</span
					>{:else}Something <span class="serif-accent text-gradient-violet">slipped.</span>{/if}
			</h1>
			<p class="mt-5 max-w-md text-ink-muted">
				{notFound
					? "The page you're looking for doesn't exist or has moved."
					: (page.error?.message ?? 'Please try again in a moment.')}
			</p>
			<div class="mt-8 flex flex-wrap gap-3">
				<Button href="/" size="lg">Go home</Button>
				<Button href="/plans" size="lg" variant="outline">See plans</Button>
			</div>
		</div>
		<div class="mx-auto w-full max-w-md -rotate-6 opacity-80" aria-hidden="true">
			<IdentityCard face="back" />
		</div>
	</div>
</section>
