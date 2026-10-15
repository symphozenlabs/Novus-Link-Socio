import type { Action } from 'svelte/action';

/** Gently pulls an element toward the pointer. Fine pointers + full motion only. */
export const magnetic: Action<HTMLElement, boolean | undefined> = (node, enabled) => {
	let on = enabled ?? false;
	const fine = () =>
		matchMedia('(pointer: fine)').matches &&
		!matchMedia('(prefers-reduced-motion: reduce)').matches;

	function move(e: PointerEvent) {
		if (!on || !fine()) return;
		const r = node.getBoundingClientRect();
		const x = e.clientX - (r.left + r.width / 2);
		const y = e.clientY - (r.top + r.height / 2);
		node.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
	}
	function leave() {
		node.style.transform = '';
	}

	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);
	return {
		update(v) {
			on = v ?? false;
			if (!on) leave();
		},
		destroy() {
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		}
	};
};
