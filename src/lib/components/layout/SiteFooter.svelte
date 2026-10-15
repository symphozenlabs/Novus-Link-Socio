<script lang="ts">
	import Mark from '#lib/components/brand/Mark.svelte';
	import type { SiteSettings } from '#lib/content/types.ts';

	let { settings }: { settings: SiteSettings } = $props();
	const year = new Date().getFullYear();
</script>

<footer class="relative overflow-hidden pt-12 pb-10">
	<div class="container-x">
		<div
			class="glass lens grid gap-12 rounded-[2.5rem] p-8 sm:p-10 md:grid-cols-[1.4fr_1fr_1fr] md:p-14"
		>
			<div>
				<div class="flex items-center gap-3 text-ink">
					<Mark class="h-12 w-auto" />
					<div>
						<p class="font-display text-2xl font-semibold tracking-[-0.03em]">Novus Link Socio</p>
						<p class="text-sm text-ink-muted">Your Digital Identity</p>
					</div>
				</div>
				<p class="mt-6 max-w-sm text-sm leading-relaxed text-ink-muted">
					{settings.footerTagline}
				</p>
			</div>

			<nav aria-label="Footer">
				<p class="eyebrow">Explore</p>
				<ul class="mt-4 space-y-1 text-sm">
					{#each settings.footerLinks as l (l.href)}
						<li>
							<a
								class="inline-flex min-h-10 items-center text-ink-muted hover:text-ink"
								href={l.href}>{l.label}</a
							>
						</li>
					{/each}
				</ul>
			</nav>

			<div>
				<p class="eyebrow">Talk to us</p>
				<ul class="mt-4 space-y-1 text-sm">
					<li>
						<a
							class="inline-flex min-h-10 items-center text-ink hover:text-violet-300"
							href="tel:{settings.phone}">{settings.phoneDisplay}</a
						>
					</li>
					{#if settings.whatsapp}
						<li>
							<a
								class="inline-flex min-h-10 items-center text-ink-muted hover:text-ink"
								href="https://wa.me/{settings.whatsapp}"
								rel="noopener"
								target="_blank">WhatsApp</a
							>
						</li>
					{/if}
					{#if settings.email}
						<li>
							<a
								class="inline-flex min-h-10 items-center text-ink-muted hover:text-ink"
								href="mailto:{settings.email}">{settings.email}</a
							>
						</li>
					{/if}
					{#if settings.instagram}
						<li>
							<a
								class="inline-flex min-h-10 items-center text-ink-muted hover:text-ink"
								href="https://www.instagram.com/{settings.instagram}/"
								rel="noopener"
								target="_blank"
							>
								Instagram · @{settings.instagram}
							</a>
						</li>
					{/if}
				</ul>
			</div>
		</div>

		<div class="mt-8 flex flex-col justify-between gap-4 px-2 text-xs text-ink-subtle sm:flex-row">
			<p>© {year} Novus Link Socio. All rights reserved.</p>
			<p>From <span class="font-semibold text-ink-muted">{settings.parentBrand}</span></p>
		</div>
	</div>
</footer>
