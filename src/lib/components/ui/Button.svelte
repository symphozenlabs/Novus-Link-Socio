<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { magnetic } from '#lib/actions/magnetic.ts';

	type Variant = 'signal' | 'ghost' | 'outline' | 'violet';
	type Size = 'md' | 'lg';

	type Props = {
		variant?: Variant;
		size?: Size;
		href?: string;
		magnet?: boolean;
		class?: string;
		children: Snippet;
		icon?: Snippet;
	} & Omit<HTMLAnchorAttributes & HTMLButtonAttributes, 'class' | 'children'>;

	let {
		variant = 'signal',
		size = 'md',
		href,
		magnet = false,
		class: klass = '',
		children,
		icon,
		...rest
	}: Props = $props();

	const base =
		'group/btn relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition-[background-color,color,border-color,box-shadow,transform,scale] duration-300 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50';
	const sizes: Record<Size, string> = {
		md: 'min-h-11 px-5 text-sm',
		lg: 'min-h-14 px-7 text-base'
	};
	const variants: Record<Variant, string> = {
		// Abyss ink on pink: 6.0:1. White on pink would fail AA.
		signal: 'liquid-pill bg-signal text-abyss hover:bg-signal-hover active:bg-signal-press',
		violet:
			'liquid-pill bg-violet-700 text-white [--pill-glow:var(--color-violet-500)] hover:bg-violet-600',
		outline: 'glass text-ink hover:bg-white/[0.07]',
		ghost: 'text-ink-muted hover:text-ink'
	};
	let cls = $derived(`${base} ${sizes[size]} ${variants[variant]} ${klass}`);
</script>

{#if href}
	<a {href} class={cls} use:magnetic={magnet} {...rest as HTMLAnchorAttributes}>
		<span class="relative z-10 inline-flex items-center gap-2">{@render children()}</span>
		{#if icon}<span
				class="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-0.5"
				>{@render icon()}</span
			>{/if}
	</a>
{:else}
	<button class={cls} use:magnetic={magnet} {...rest as HTMLButtonAttributes}>
		<span class="relative z-10 inline-flex items-center gap-2">{@render children()}</span>
		{#if icon}<span
				class="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-0.5"
				>{@render icon()}</span
			>{/if}
	</button>
{/if}
