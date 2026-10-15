import type { Action } from 'svelte/action';

/**
 * Adds `.is-in` to every `[data-reveal]` descendant (or the node itself) when it
 * scrolls into view. Pure CSS handles the transition — see layout.css.
 * Content is visible by default; hidden state only applies once JS has loaded.
 */
export const reveal: Action<HTMLElement> = (node) => {
	const targets = node.hasAttribute('data-reveal')
		? [node]
		: Array.from(node.querySelectorAll<HTMLElement>('[data-reveal]'));

	if (!('IntersectionObserver' in window)) {
		targets.forEach((t) => t.classList.add('is-in'));
		return;
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					e.target.classList.add('is-in');
					io.unobserve(e.target);
				}
			}
		},
		{ rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
	);
	targets.forEach((t) => io.observe(t));
	return { destroy: () => io.disconnect() };
};
