/**
 * SIGNAL — the shot list, as one GSAP timeline the page scrubs with scroll.
 * Times are "story seconds" (total 12).
 *
 * 01 0.0   Boot      the card, drawn by a laser over a holographic grid
 * 02 1.6   Rolodex   the old way: a card file is dealt in, turns, and fails its audit
 * 03 3.6   One card  the paper turns into light that streams back into one card
 * 04 5.6   Tap       a phone arrives; the tap sends a shockwave, the profile bursts out
 * 05 8.4   Metal     a glitch cut to four metal cards on a revolving stage
 * 06 10.3  Choose    the card becomes a living network of connections
 */
import type { gsap as GSAP } from 'gsap';
import type { StoryWorld } from './world.ts';

export const CHAPTER_AT = [0, 1.6, 3.6, 5.6, 8.4, 10.3];
export const STORY_LENGTH = 12;
/**
 * The frame each act rests on — its caption and callouts fully shown. Scroll holds
 * the film still here for a while and snaps back here when it stops, so a quick
 * flick never skips past an act's content.
 */
export const REST_AT = [0, 2.62, 5.21, 7.97, 9.5, STORY_LENGTH];
/** How long each rest lasts, in story seconds of scroll. */
export const REST_HOLD = 0.9;
/** When the HUD callouts hold (story seconds). */
export const CALLOUTS = {
	legacy: [2.0, 2.7],
	card: [4.65, 5.3],
	metal: [8.95, 10.0]
} as const;

export function buildTimeline(gsap: typeof GSAP, w: StoryWorld, portrait: boolean) {
	const { camera, look, hero, phone, carousel, fx } = w;
	const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, paused: true });
	const P = Math.PI;
	const far = (z: number) => (portrait ? z * 1.15 : z);

	// ── Initial pose (rebuild-safe) ────────────────────────────────────
	Object.assign(fx, w.defaults);
	camera.position.set(0, 1.2, far(31));
	look.set(0, 0, 0);
	hero.visible = true;
	hero.position.set(0, 0, 0);
	hero.rotation.set(-0.12, -0.42, 0.05);
	hero.scale.setScalar(1);
	phone.visible = false;
	phone.position.set(12, 0, -20);
	phone.rotation.set(0, 0, 0);
	carousel.visible = false;
	carousel.position.set(0, 0, 0);
	carousel.scale.setScalar(1);

	// ── 01 → 02: the card lifts away; the old way is dealt in ──────────
	tl.to(hero.position, { x: 3, y: 8, z: -5, duration: 1.0, ease: 'power2.in' }, 0.3);
	tl.to(hero.rotation, { x: -0.7, y: -0.9, z: 0.3, duration: 1.0, ease: 'power2.in' }, 0.3);
	tl.to(fx, { reveal: 0, duration: 0.5, ease: 'power1.in' }, 0.7);
	tl.to(fx, { paperIn: 1, duration: 1.3, ease: 'power1.inOut' }, 0.4);
	tl.to(fx, { spin: 2.8, duration: 3.6, ease: 'none' }, 0.15);
	tl.to(camera.position, { x: -8, y: 6.5, z: far(31), duration: 1.4 }, 0.2);
	tl.to(look, { y: 0.2, duration: 1.4 }, 0.2);
	tl.to(fx, { floor: 0.75, duration: 1.2 }, 0.2);
	// A slow arc round the file while the caption reads; the audit sweeps through it.
	tl.to(camera.position, { x: 6, y: 4, z: far(29), duration: 1.4, ease: 'sine.inOut' }, 1.6);
	tl.to(fx, { stale: 1, duration: 0.8, ease: 'power1.inOut' }, 1.85);

	// ── 02 → 03: the paper turns into light; the light becomes one card ─
	tl.set(hero.position, { x: 0, y: 0, z: 0 }, 2.7);
	tl.set(hero.rotation, { x: -0.06, y: -0.3, z: 0.02 }, 2.7);
	tl.set(fx, { shape: 0 }, 2.7);
	tl.to(fx, { paperLife: 0, duration: 0.85, ease: 'power1.in' }, 2.8);
	tl.to(fx, { particles: 1, duration: 0.5, ease: 'power1.out' }, 2.8);
	tl.to(fx, { shape: 1, duration: 1.05, ease: 'power2.inOut' }, 3.15);
	tl.to(camera.position, { x: 0, y: 0.8, z: far(24), duration: 1.25 }, 3.0);
	tl.to(look, { x: 0, y: 0, z: 0, duration: 1.25 }, 3.0);
	tl.to(fx, { floor: 0.55, duration: 1 }, 3.0);
	tl.to(
		fx,
		{
			keyframes: [
				{ glow: 0.9, duration: 0.2, ease: 'power2.in' },
				{ glow: 0.05, duration: 0.6, ease: 'power2.out' }
			]
		},
		3.95
	);
	tl.to(fx, { reveal: 1, duration: 0.6, ease: 'power2.inOut' }, 3.95);
	tl.to(fx, { particles: 0, duration: 0.5, ease: 'power1.in' }, 4.35);

	// ── 03: beauty pass — light sweeps the card, callouts lock on ──────
	tl.to(hero.rotation, { x: -0.14, y: 0.22, z: -0.02, duration: 1.1, ease: 'sine.inOut' }, 4.3);
	tl.to(fx, { env: 0.9, duration: 1.3, ease: 'sine.inOut' }, 4.1);
	tl.to(
		camera.position,
		{ x: portrait ? 0 : -1.6, y: 0.5, z: far(23), duration: 1.1, ease: 'power2.inOut' },
		4.3
	);

	// ── 04: the tap ────────────────────────────────────────────────────
	const L = portrait ? -0.9 : -3.6;
	const R = portrait ? 1.4 : 4.2;
	const phoneY = portrait ? 1.9 : 0.3;
	const heroY = portrait ? -4.4 : -0.2;
	tl.to(hero.rotation, { x: -0.04, y: P - 0.3, z: 0, duration: 1.0, ease: 'power3.inOut' }, 5.4);
	// Portrait stacks the card under the phone: wait further forward so its turned
	// edge stays well clear of the phone's face.
	tl.to(hero.position, { x: L, y: heroY, z: portrait ? 2.2 : 1.2, duration: 1.0 }, 5.4);
	tl.to(
		hero.scale,
		{ x: portrait ? 0.8 : 1, y: portrait ? 0.8 : 1, z: portrait ? 0.8 : 1, duration: 1 },
		5.4
	);
	tl.set(phone, { visible: true }, 5.55);
	tl.fromTo(
		phone.position,
		{ x: R + 7, y: phoneY - 2, z: -22 },
		{ x: R, y: phoneY, z: 0, duration: 1.05, ease: 'power3.out' },
		5.6
	);
	// The phone's pose for the tap; the card is placed relative to it.
	const PH = { x: 0.02, y: -0.16 };
	tl.fromTo(
		phone.rotation,
		{ x: 0.12, y: -0.95, z: 0.06 },
		{ ...PH, z: 0, duration: 1.05, ease: 'power3.out' },
		5.6
	);
	tl.to(camera.position, { x: 0, y: 0.8, z: far(28), duration: 1.1 }, 5.4);
	tl.to(look, { x: (L + R) / 4, y: portrait ? 1.9 : 0.1, z: 0, duration: 1.1 }, 5.4);
	tl.to(fx, { env: 0.6, duration: 1.4 }, 5.5);
	// The tap, like a real one: the card never passes through the phone. It steps
	// back clear of the phone's outline, slides in behind it parallel to its back,
	// and stops a hair short (NFC needs no contact). Its idle wobble is held still
	// meanwhile — a few hundredths of a radian swing a card edge further than the gap.
	const behind = (dx: number, dy: number, dz: number) => {
		// Phone-local offset → world (Euler XYZ: rotate by Y, then X).
		const cy = Math.cos(PH.y);
		const sy = Math.sin(PH.y);
		const x = cy * dx + sy * dz;
		const z1 = -sy * dx + cy * dz;
		const cx = Math.cos(PH.x);
		const sx = Math.sin(PH.x);
		return { x: R + x, y: phoneY + cx * dy - sx * z1, z: sx * dy + cx * z1 };
	};
	// Phone back is 0.25 behind its centre, the card 0.04 thick: 0.45 leaves a clear gap.
	const touch = behind(portrait ? -1.5 : -1.9, portrait ? 2.0 : 2.2, -0.45);
	const away = behind(portrait ? -1.5 : -1.9, portrait ? 2.0 : 2.2, -2.9);
	const parallel = { x: PH.x, y: P + PH.y };
	tl.to(fx, { hold: 1, duration: 0.2 }, 6.2);
	// Step back: first sideways until clear of the phone's outline, only then in depth.
	const half = (portrait ? 0.8 : 1) * 4.28;
	const clearX = Math.min(L, R - 2.2 - half - 0.3);
	tl.to(hero.position, { x: clearX, y: heroY - 0.5, duration: 0.15, ease: 'power2.out' }, 6.4);
	tl.to(hero.position, { z: -1.8, duration: 0.3, ease: 'power2.in' }, 6.4);
	tl.to(hero.rotation, { ...parallel, z: 0, duration: 0.3, ease: 'power2.inOut' }, 6.4);
	tl.to(hero.position, { ...touch, duration: 0.3, ease: 'power2.inOut' }, 6.7);
	tl.to(hero.rotation, { z: -0.18, duration: 0.3, ease: 'power2.inOut' }, 6.7);
	// …contact: the phone gives a little, the shockwave leaves, the floor answers.
	tl.to(
		phone.position,
		{
			keyframes: [
				{ z: 0.28, duration: 0.07, ease: 'power1.out' },
				{ z: 0, duration: 0.3, ease: 'power2.out' }
			]
		},
		7.0
	);
	tl.to(fx, { rings: 1, duration: 1.0, ease: 'power1.out' }, 7.0);
	tl.to(fx, { ripple: 1, duration: 1.4, ease: 'power1.out' }, 7.0);
	tl.to(fx, { screen: 1, duration: 0.3, ease: 'power1.out' }, 7.0);
	tl.to(
		fx,
		{
			keyframes: [
				{ glow: 0.85, duration: 0.12, ease: 'power2.in' },
				{ glow: 0.12, duration: 0.55, ease: 'power2.out' }
			]
		},
		7.0
	);
	tl.to(
		fx,
		{
			keyframes: [
				{ glitch: 0.35, duration: 0.06 },
				{ glitch: 0, duration: 0.25 }
			]
		},
		7.0
	);
	// The card backs straight off, then steps aside; the phone turns to the camera
	// only once the card is clear; the profile bursts out.
	tl.to(hero.position, { ...away, duration: 0.2, ease: 'power2.out' }, 7.1);
	tl.to(
		hero.position,
		{ x: L - (portrait ? 4 : 6), y: heroY - 0.6, z: -3.5, duration: 0.65, ease: 'power2.inOut' },
		7.3
	);
	tl.to(hero.rotation, { y: P - 0.6, z: 0.05, duration: 0.65 }, 7.3);
	tl.to(fx, { hold: 0, duration: 0.4 }, 7.4);
	tl.to(camera.position, { x: R * 0.85, y: phoneY + 0.4, z: far(31), duration: 0.85 }, 7.2);
	tl.to(look, { x: R, y: phoneY, z: 0, duration: 1.0 }, 7.2);
	tl.to(phone.rotation, { y: 0, x: 0, duration: 0.9 }, 7.3);
	tl.to(fx, { tiles: 1, duration: 0.7, ease: 'none' }, 7.3);

	// ── 04 → 05: into the screen, a glitch cut, out onto metal ─────────
	tl.to(fx, { tiles: 0, duration: 0.3, ease: 'power2.in' }, 8.05);
	tl.to(camera.position, { x: R, y: phoneY, z: 9, duration: 0.35, ease: 'power3.in' }, 8.05);
	tl.to(fx, { screen: 1.6, duration: 0.3, ease: 'power2.in' }, 8.1);
	tl.to(
		fx,
		{
			keyframes: [
				{ glitch: 1, flash: 0.55, duration: 0.25, ease: 'power2.in' },
				{ glitch: 0, flash: 0, duration: 0.45, ease: 'power2.out' }
			]
		},
		8.15
	);
	tl.set(hero, { visible: false }, 8.4);
	tl.set(phone, { visible: false }, 8.4);
	tl.set(carousel, { visible: true }, 8.4);
	tl.set(fx, { ripple: 0, rings: 0, screen: 0 }, 8.4);
	tl.set(camera.position, { x: 0, y: 7, z: far(13) }, 8.4);
	tl.set(look, { x: 0, y: -0.5, z: 0 }, 8.4);
	tl.to(camera.position, { x: 0, y: 6.5, z: far(37), duration: 1.4, ease: 'power3.out' }, 8.4);
	tl.fromTo(
		fx,
		{ orbit: 1.2 },
		{ orbit: -P * 1.5 - 0.25, duration: 2.1, ease: 'power1.inOut' },
		8.4
	);
	tl.to(fx, { env: 3.4, warm: 0.6, duration: 1.9, ease: 'sine.inOut' }, 8.4);

	// ── 06: the network ────────────────────────────────────────────────
	tl.set(hero, { visible: true }, 10.0);
	tl.set(hero.position, { x: 0, y: 0, z: 0 }, 10.0);
	tl.set(hero.rotation, { x: -0.1, y: -0.3, z: 0 }, 10.0);
	tl.set(hero.scale, { x: 1, y: 1, z: 1 }, 10.0);
	tl.set(fx, { reveal: 0, shape: 1 }, 10.0);
	tl.to(fx, { particles: 1, duration: 0.4, ease: 'power1.out' }, 10.05);
	tl.to(fx, { shape: 2, duration: 1.3, ease: 'power2.inOut' }, 10.1);
	tl.to(carousel.scale, { x: 0.72, y: 0.72, z: 0.72, duration: 1.3 }, 10.2);
	tl.to(fx, { orbit: -P * 2.2, duration: 1.8, ease: 'power1.out' }, 10.5);
	tl.to(fx, { arcs: 1, duration: 0.9, ease: 'power1.out' }, 10.8);
	tl.to(fx, { globe: 1.2, duration: 1.7, ease: 'none' }, 10.3);
	tl.to(fx, { floor: 0.3, warm: 0, duration: 1.2 }, 10.3);
	tl.to(
		camera.position,
		{ x: 0, y: 9, z: portrait ? 86 : 60, duration: 1.6, ease: 'power2.inOut' },
		10.2
	);
	tl.to(fx, { env: 4.4, duration: 1.7, ease: 'none' }, 10.3);
	tl.to({}, { duration: 0.1 }, STORY_LENGTH - 0.1);

	return tl;
}
