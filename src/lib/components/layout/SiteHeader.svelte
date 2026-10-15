<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { tick } from 'svelte';
	import Logo from '#lib/components/brand/Logo.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import type { SiteSettings } from '#lib/content/types.ts';

	let { settings }: { settings: SiteSettings } = $props();

	let links = $derived(settings.nav);

	let scrolled = $state(false);
	let open = $state(false);
	let menuBtn: HTMLButtonElement | undefined = $state();
	let panel: HTMLElement | undefined = $state();

	const isActive = (href: string) =>
		!href.includes('#') && (page.url.pathname === href || page.url.pathname.startsWith(href + '/'));

	/** True while the bar sits over a light (`.on-paper`) section: it then turns to
	 *  light glass with dark text, so nothing in it vanishes into the white. */
	let onLight = $state(false);
	let bar: HTMLElement | undefined = $state();

	function measure() {
		scrolled = window.scrollY > 24;
		if (!bar) return;
		const r = bar.getBoundingClientRect();
		const y = r.top + r.height / 2;
		onLight = Array.from(document.querySelectorAll('.on-paper')).some((el) => {
			const s = el.getBoundingClientRect();
			return s.top <= y && s.bottom >= y;
		});
	}

	$effect(() => {
		measure();
	});

	afterNavigate(() => {
		open = false;
		requestAnimationFrame(measure);
	});

	async function toggle() {
		open = !open;
		if (open) {
			await tick();
			panel?.querySelector<HTMLElement>('a')?.focus();
		}
	}

	function onKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			open = false;
			menuBtn?.focus();
		}
		// keep focus inside the open menu
		if (e.key === 'Tab' && panel) {
			const items = [menuBtn!, ...panel.querySelectorAll<HTMLElement>('a')];
			const i = items.indexOf(document.activeElement as HTMLElement);
			if (e.shiftKey && i <= 0) {
				e.preventDefault();
				items.at(-1)?.focus();
			} else if (!e.shiftKey && i === items.length - 1) {
				e.preventDefault();
				items[0].focus();
			}
		}
	}
</script>

<svelte:window onscroll={measure} onresize={measure} onkeydown={onKey} />

<a
	href="#main"
	class="sr-only-focusable fixed top-3 left-3 z-[70] rounded-full bg-signal px-4 py-2 font-semibold text-abyss"
>
	Skip to content
</a>

{#if settings.announcement}
	<div class="relative z-50 bg-violet-700 px-4 py-2 text-center text-xs font-semibold text-white">
		{settings.announcement}
	</div>
{/if}

<header
	class="fixed inset-x-0 top-0 z-50"
	style:top={settings.announcement && !scrolled ? '2rem' : '0'}
>
	<!-- Scrolled: the bar lifts into a floating liquid-glass capsule. -->
	<div class="container-x flex h-[var(--header-h)] items-center">
		<div
			bind:this={bar}
			class="bar flex h-14 w-full items-center justify-between gap-6 rounded-full {scrolled || open
				? 'glass lens bg-abyss/35 pr-2 pl-5'
				: ''}"
			class:light={onLight && !open}
		>
			<a href="/" class="relative z-10 text-[15px] text-ink" aria-label="Novus Link Socio — home">
				<Logo />
			</a>

			<nav aria-label="Main" class="hidden md:block">
				<ul class="flex items-center gap-1">
					{#each links as l (l.href)}
						<li>
							<a
								href={l.href}
								aria-current={isActive(l.href) ? 'page' : undefined}
								class="relative inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-ink-muted transition-colors hover:text-ink aria-[current=page]:text-ink"
							>
								{l.label}
								{#if isActive(l.href)}<span class="absolute inset-x-4 bottom-2 h-px bg-signal"
									></span>{/if}
							</a>
						</li>
					{/each}
				</ul>
			</nav>

			<div class="flex items-center gap-2">
				<div class="hidden sm:block"><Button href="/contact">{settings.headerCta}</Button></div>
				<button
					bind:this={menuBtn}
					type="button"
					class="relative z-10 grid size-11 place-items-center rounded-full border border-line-strong md:hidden"
					aria-expanded={open}
					aria-controls="mobile-menu"
					onclick={toggle}
				>
					<span class="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
					<span class="relative block h-3 w-5" aria-hidden="true">
						<span
							class="absolute left-0 h-[1.5px] w-full bg-ink transition-transform duration-300 {open
								? 'top-1.5 rotate-45'
								: 'top-0'}"
						></span>
						<span
							class="absolute left-0 h-[1.5px] w-full bg-ink transition-transform duration-300 {open
								? 'top-1.5 -rotate-45'
								: 'top-3'}"
						></span>
					</span>
				</button>
			</div>
		</div>
	</div>

	{#if open}
		<div
			bind:this={panel}
			id="mobile-menu"
			class="mobile-panel glass fixed inset-x-3 top-[calc(var(--header-h)+0.25rem)] bottom-3 overflow-y-auto rounded-[2rem] bg-abyss/90 md:hidden"
		>
			<nav aria-label="Mobile" class="container-x flex min-h-full flex-col justify-between py-8">
				<ul class="space-y-1">
					{#each links as l, i (l.href)}
						<li style:--i={i}>
							<a
								href={l.href}
								class="flex min-h-14 items-center justify-between border-b border-line font-display text-4xl font-semibold tracking-[-0.03em]"
								aria-current={isActive(l.href) ? 'page' : undefined}
							>
								{l.label}<span class="text-xl text-violet-400" aria-hidden="true">→</span>
							</a>
						</li>
					{/each}
				</ul>
				<div class="mt-10 space-y-4">
					<Button href="/contact" size="lg" class="w-full">{settings.headerCta}</Button>
					<a
						href="tel:{settings.phone}"
						class="flex min-h-11 items-center justify-center text-ink-muted"
					>
						Call {settings.phoneDisplay}
					</a>
				</div>
			</nav>
		</div>
	{/if}
</header>

<style>
	.bar {
		transition:
			padding 0.5s var(--ease-out-expo),
			background-color 0.5s,
			box-shadow 0.5s;
	}
	/* Over light paper: swap the text tokens for their paper equivalents (everything in
	   the bar reads them), and frost the glass white instead of violet. */
	.bar.light {
		--color-ink: var(--color-paper-ink);
		--color-ink-muted: var(--color-paper-muted);
		--color-line-strong: rgb(31 16 48 / 0.25);
		--color-violet-400: var(--color-violet-700);
	}
	.bar.light:global(.glass) {
		background-color: rgb(255 255 255 / 0.62);
		box-shadow:
			inset 0 1px 0.5px rgb(255 255 255 / 0.9),
			inset 0 -1px 0.5px rgb(31 16 48 / 0.06),
			0 1px 2px rgb(31 16 48 / 0.08),
			0 18px 40px -22px rgb(38 0 74 / 0.45);
	}
	.mobile-panel li {
		animation: rise 0.6s var(--ease-out-expo) both;
		animation-delay: calc(var(--i) * 60ms);
	}
</style>
