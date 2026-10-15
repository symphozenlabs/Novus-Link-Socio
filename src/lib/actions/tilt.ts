import type { Action } from 'svelte/action';

/**
 * Pointer-driven 3D tilt with a moving specular highlight.
 * Writes --rx / --ry / --mx / --my custom properties; styling decides how to use them.
 * Disabled for touch and reduced-motion users.
 */
export const tilt: Action<HTMLElement, { max?: number } | undefined> = (node, opts) => {
	let max = opts?.max ?? 8;
	let frame = 0;
	const ok = () =>
		matchMedia('(pointer: fine)').matches &&
		!matchMedia('(prefers-reduced-motion: reduce)').matches;

	function move(e: PointerEvent) {
		if (!ok()) return;
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			const r = node.getBoundingClientRect();
			const px = (e.clientX - r.left) / r.width;
			const py = (e.clientY - r.top) / r.height;
			node.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
			node.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
			node.style.setProperty('--mx', `${px * 100}%`);
			node.style.setProperty('--my', `${py * 100}%`);
		});
	}
	function leave() {
		cancelAnimationFrame(frame);
		node.style.setProperty('--rx', '0deg');
		node.style.setProperty('--ry', '0deg');
	}

	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);
	return {
		update(o) {
			max = o?.max ?? 8;
		},
		destroy() {
			cancelAnimationFrame(frame);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		}
	};
};
