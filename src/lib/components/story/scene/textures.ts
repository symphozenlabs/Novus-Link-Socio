/**
 * Procedural textures for the story scene, drawn with Canvas 2D at runtime
 * (no image downloads). Everything is generated at "print" resolution so the
 * cards hold up in close-up shots.
 */
import qrcode from 'qrcode-generator';
import { markPaths, MARK_VIEWBOX } from '#lib/components/brand/mark-paths.ts';

export const CARD_W = 1600; // px for an 85.6 × 54 mm card
export const CARD_H = Math.round((CARD_W * 54) / 85.6);

const DISPLAY = '"Bricolage Grotesque Variable", "Manrope Variable", system-ui, sans-serif';
const SANS = '"Manrope Variable", system-ui, sans-serif';

/**
 * Supersampling for the close-up hero textures (the PVC card faces and the phone
 * screen): drawn at `detail`× while every drawing call keeps the same coordinates.
 * Set by createWorld — 1 on low-power devices to save GPU memory.
 */
let detail = 1;
export function setTextureDetail(k: number) {
	detail = k;
}

function canvas(w: number, h: number, k = 1) {
	const c = document.createElement('canvas');
	c.width = Math.round(w * k);
	c.height = Math.round(h * k);
	const ctx = c.getContext('2d')!;
	ctx.scale(k, k);
	return [c, ctx] as const;
}

export async function fontsReady() {
	try {
		await Promise.all([
			document.fonts.load(`600 80px ${DISPLAY}`),
			document.fonts.load(`500 40px ${SANS}`),
			document.fonts.load(`700 40px ${SANS}`)
		]);
	} catch {
		/* fall back to system fonts */
	}
}

function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, color: string) {
	const s = h / MARK_VIEWBOX.h;
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(s, s);
	ctx.fillStyle = color;
	for (const p of markPaths) {
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.fill(new Path2D(p.d), 'evenodd');
		ctx.restore();
	}
	ctx.restore();
	return MARK_VIEWBOX.w * s;
}

function lockup(
	ctx: CanvasRenderingContext2D,
	x: number,
	baseline: number,
	color: string,
	scale = 1
) {
	const mh = 118 * scale;
	const mw = drawMark(ctx, x, baseline - mh, mh, color);
	ctx.fillStyle = color;
	ctx.textBaseline = 'alphabetic';
	ctx.font = `600 ${62 * scale}px ${DISPLAY}`;
	ctx.fillText('Novus Link Socio', x + mw + 26 * scale, baseline - 52 * scale);
	ctx.globalAlpha *= 0.72;
	ctx.font = `500 ${32 * scale}px ${SANS}`;
	ctx.fillText('Your Digital Identity', x + mw + 28 * scale, baseline - 6 * scale);
	ctx.globalAlpha /= 0.72;
}

function nfcGlyph(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.lineWidth = r * 0.12;
	ctx.lineCap = 'round';
	for (let i = 1; i <= 3; i++) {
		ctx.beginPath();
		ctx.arc(x, y, r * 0.33 * i, -Math.PI / 4, Math.PI / 4);
		ctx.stroke();
	}
	ctx.restore();
}

function grain(ctx: CanvasRenderingContext2D, amount: number) {
	// Image data is in device pixels (ignores the supersampling scale), so use the full canvas.
	const img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	const d = img.data;
	for (let i = 0; i < d.length; i += 4) {
		const n = (Math.random() - 0.5) * amount;
		d[i] += n;
		d[i + 1] += n;
		d[i + 2] += n;
	}
	ctx.putImageData(img, 0, 0);
}

function qr(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	size: number,
	fg: string
) {
	const q = qrcode(0, 'M');
	q.addData(text);
	q.make();
	const n = q.getModuleCount();
	const m = size / n;
	ctx.fillStyle = fg;
	for (let r = 0; r < n; r++)
		for (let c = 0; c < n; c++)
			if (q.isDark(r, c)) ctx.fillRect(x + c * m, y + r * m, Math.ceil(m), Math.ceil(m));
}

/** Soft-touch PVC card in Novus Night — front: lockup + NFC glyph. */
export function pvcFront() {
	const [c, ctx] = canvas(CARD_W, CARD_H, detail);
	const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
	g.addColorStop(0, '#3a0a6c');
	g.addColorStop(0.55, '#2a004f');
	g.addColorStop(1, '#1d0036');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, CARD_W, CARD_H);
	grain(ctx, 10);
	lockup(ctx, 110, CARD_H - 110, '#f4ecff');
	nfcGlyph(ctx, CARD_W - 150, 150, 70, 'rgba(244,236,255,0.75)');
	return c;
}

/** PVC back: a real, scannable QR to the website + placeholder identity. */
export function pvcBack() {
	const [c, ctx] = canvas(CARD_W, CARD_H, detail);
	ctx.fillStyle = '#24003f';
	ctx.fillRect(0, 0, CARD_W, CARD_H);
	grain(ctx, 8);
	const s = 520;
	const qx = CARD_W - s - 140;
	const qy = (CARD_H - s) / 2;
	ctx.fillStyle = '#ffffff';
	ctx.beginPath();
	ctx.roundRect(qx - 36, qy - 36, s + 72, s + 72, 34);
	ctx.fill();
	qr(ctx, 'https://www.novuslinksocio.com', qx, qy, s, '#1d0036');
	ctx.fillStyle = '#f4ecff';
	ctx.font = `600 78px ${DISPLAY}`;
	ctx.fillText('Your Name', 130, CARD_H / 2 - 30);
	ctx.globalAlpha = 0.7;
	ctx.font = `500 38px ${SANS}`;
	ctx.fillText('Founder · Your Company', 132, CARD_H / 2 + 40);
	ctx.globalAlpha = 0.55;
	nfcGlyph(ctx, 160, CARD_H / 2 + 160, 46, '#f4ecff');
	ctx.font = `600 30px ${SANS}`;
	ctx.fillText('TAP OR SCAN', 210, CARD_H / 2 + 172);
	ctx.globalAlpha = 1;
	return c;
}

export type Finish = 'black' | 'silver' | 'gold' | 'rose';

/** Laser-engraved artwork for metal cards (colour map). Engraving reads lighter on black, darker on bright metals. */
export function metalFront(finish: Finish) {
	const [c, ctx] = canvas(CARD_W, CARD_H);
	const base = { black: '#1d1d21', silver: '#c8ccd2', gold: '#d6b56b', rose: '#e0a690' }[finish];
	ctx.fillStyle = base;
	ctx.fillRect(0, 0, CARD_W, CARD_H);
	const ink = finish === 'black' ? 'rgba(210,210,214,0.85)' : 'rgba(40,30,30,0.55)';
	lockup(ctx, 110, CARD_H - 110, ink);
	nfcGlyph(ctx, CARD_W - 150, 150, 70, ink);
	return c;
}

/** Roughness map for metal: brushed streaks + smoother engraving recesses. */
export function brushedRoughness(finish: Finish) {
	const [c, ctx] = canvas(CARD_W, CARD_H);
	const base = finish === 'black' ? 120 : 92;
	ctx.fillStyle = `rgb(${base},${base},${base})`;
	ctx.fillRect(0, 0, CARD_W, CARD_H);
	// fine, low-contrast satin brushing (coarse streaks read as wood grain)
	for (let i = 0; i < 7000; i++) {
		const y = Math.random() * CARD_H;
		const v = base + (Math.random() - 0.5) * 34;
		ctx.strokeStyle = `rgba(${v},${v},${v},${0.25 + Math.random() * 0.35})`;
		ctx.lineWidth = Math.random() * 0.8 + 0.3;
		ctx.beginPath();
		const x = Math.random() * CARD_W;
		ctx.moveTo(x - 400, y);
		ctx.lineTo(x + 400 + Math.random() * 600, y);
		ctx.stroke();
	}
	// engraving is rougher (laser-etched)
	ctx.globalAlpha = 0.9;
	lockup(ctx, 110, CARD_H - 110, 'rgb(235,235,235)');
	nfcGlyph(ctx, CARD_W - 150, 150, 70, 'rgb(235,235,235)');
	return c;
}

/** The microsite on the phone screen — a clean, realistic profile page. */
export function phoneScreen() {
	const W = 780;
	const H = 1690;
	const [c, ctx] = canvas(W, H, detail);
	const bg = ctx.createLinearGradient(0, 0, 0, H);
	bg.addColorStop(0, '#2a0656');
	bg.addColorStop(0.45, '#170029');
	bg.addColorStop(1, '#12001f');
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, W, H);

	// status bar
	ctx.fillStyle = 'rgba(255,255,255,0.9)';
	ctx.font = `600 30px ${SANS}`;
	ctx.fillText('9:41', 64, 74);
	ctx.fillRect(W - 140, 52, 56, 24);
	ctx.fillStyle = '#000';
	ctx.beginPath();
	ctx.roundRect(W / 2 - 100, 30, 200, 58, 29);
	ctx.fill();

	// cover
	const cov = ctx.createLinearGradient(0, 120, W, 520);
	cov.addColorStop(0, '#6b15c1');
	cov.addColorStop(0.6, '#4a0095');
	cov.addColorStop(1, '#ff4986');
	ctx.fillStyle = cov;
	ctx.globalAlpha = 0.85;
	ctx.beginPath();
	ctx.roundRect(36, 130, W - 72, 360, 36);
	ctx.fill();
	ctx.globalAlpha = 1;

	// avatar
	ctx.fillStyle = '#170029';
	ctx.beginPath();
	ctx.arc(W / 2, 500, 118, 0, Math.PI * 2);
	ctx.fill();
	const av = ctx.createLinearGradient(W / 2 - 100, 400, W / 2 + 100, 600);
	av.addColorStop(0, '#e6cdfe');
	av.addColorStop(1, '#b371f3');
	ctx.fillStyle = av;
	ctx.beginPath();
	ctx.arc(W / 2, 500, 104, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = '#26004a';
	ctx.font = `600 84px ${DISPLAY}`;
	ctx.textAlign = 'center';
	ctx.fillText('YN', W / 2, 530);

	ctx.fillStyle = '#ffffff';
	ctx.font = `600 64px ${DISPLAY}`;
	ctx.fillText('Your Name', W / 2, 700);
	ctx.fillStyle = 'rgba(230,205,254,0.8)';
	ctx.font = `500 32px ${SANS}`;
	ctx.fillText('Founder · Your Company', W / 2, 752);

	// buttons
	ctx.fillStyle = '#ff4986';
	ctx.beginPath();
	ctx.roundRect(64, 810, (W - 152) / 2, 96, 48);
	ctx.fill();
	ctx.strokeStyle = 'rgba(255,255,255,0.3)';
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.roundRect(W / 2 + 12, 810, (W - 152) / 2, 96, 48);
	ctx.stroke();
	ctx.font = `700 30px ${SANS}`;
	ctx.fillStyle = '#190030';
	ctx.fillText('Save contact', 64 + (W - 152) / 4, 868);
	ctx.fillStyle = '#ffffff';
	ctx.fillText('Share', W / 2 + 12 + (W - 152) / 4, 868);

	// rows
	ctx.textAlign = 'left';
	const rows = [
		['CALL', '+91 ·· ···· ····'],
		['EMAIL', 'you@company.com'],
		['WEBSITE', 'yourcompany.com'],
		['LOCATION', 'Your city']
	];
	rows.forEach(([k, v], i) => {
		const y = 960 + i * 150;
		ctx.fillStyle = 'rgba(255,255,255,0.06)';
		ctx.beginPath();
		ctx.roundRect(48, y, W - 96, 126, 28);
		ctx.fill();
		ctx.fillStyle = 'rgba(179,113,243,0.25)';
		ctx.beginPath();
		ctx.arc(120, y + 63, 34, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillStyle = '#d1a8fa';
		ctx.font = `700 22px ${SANS}`;
		ctx.fillText(k, 180, y + 52);
		ctx.fillStyle = '#ffffff';
		ctx.font = `500 32px ${SANS}`;
		ctx.fillText(v, 180, y + 94);
	});

	ctx.globalAlpha = 0.5;
	drawMark(ctx, W / 2 - 150, H - 110, 40, '#ffffff');
	ctx.fillStyle = '#ffffff';
	ctx.font = `600 26px ${SANS}`;
	ctx.fillText('Novus Link Socio', W / 2 - 100, H - 80);
	ctx.globalAlpha = 1;
	return c;
}

/**
 * A generic paper business card — the "before" in the story. Four layouts so a
 * storm of them never looks copy-pasted; the copy is greeked (bars, not words).
 */
export function paperCard(variant: number) {
	const W = 512;
	const H = 296;
	const [c, ctx] = canvas(W, H);
	const paper = ['#f3efe8', '#ebe7df', '#f6f4f0', '#e9e4da'][variant % 4];
	const ink = ['#2b2b33', '#3a2f2a', '#1f2a3a', '#33302b'][variant % 4];
	const accent = ['#b03a2e', '#2e6db0', '#2e8b57', '#b08a2e'][variant % 4];
	ctx.fillStyle = paper;
	ctx.fillRect(0, 0, W, H);
	grain(ctx, 14);
	const bar = (x: number, y: number, w: number, h: number, color = ink, a = 1) => {
		ctx.globalAlpha = a;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.roundRect(x, y, w, h, h / 2);
		ctx.fill();
		ctx.globalAlpha = 1;
	};
	switch (variant % 4) {
		case 0: // centred logo + name
			ctx.fillStyle = accent;
			ctx.beginPath();
			ctx.arc(W / 2, 92, 38, 0, Math.PI * 2);
			ctx.fill();
			bar(W / 2 - 110, 160, 220, 22);
			bar(W / 2 - 80, 196, 160, 12, ink, 0.5);
			bar(W / 2 - 130, 240, 260, 9, ink, 0.35);
			break;
		case 1: // left aligned with a colour band
			ctx.fillStyle = accent;
			ctx.fillRect(0, 0, 26, H);
			bar(64, 60, 230, 24);
			bar(64, 98, 150, 12, ink, 0.55);
			for (let i = 0; i < 3; i++) bar(64, 170 + i * 28, 200 - i * 30, 10, ink, 0.4);
			ctx.strokeStyle = accent;
			ctx.lineWidth = 8;
			ctx.strokeRect(W - 120, 56, 64, 64);
			break;
		case 2: // corporate: logo top-left, details bottom-right
			ctx.fillStyle = accent;
			ctx.fillRect(48, 44, 56, 56);
			bar(120, 58, 140, 16, ink, 0.8);
			bar(W - 268, 180, 220, 18);
			for (let i = 0; i < 2; i++) bar(W - 228 + i * 30, 214 + i * 24, 180 - i * 30, 10, ink, 0.4);
			break;
		default: // minimal, with a rule
			bar(56, 110, 260, 26);
			ctx.fillStyle = accent;
			ctx.fillRect(56, 156, 90, 4);
			bar(56, 184, 180, 11, ink, 0.5);
			bar(56, 210, 220, 11, ink, 0.35);
			ctx.globalAlpha = 0.18;
			ctx.fillStyle = accent;
			ctx.beginPath();
			ctx.arc(W - 70, 70, 110, 0, Math.PI * 2);
			ctx.fill();
			ctx.globalAlpha = 1;
	}
	return c;
}

export type TileIcon = 'call' | 'chat' | 'mail' | 'web' | 'social' | 'save';

function tileIcon(ctx: CanvasRenderingContext2D, kind: TileIcon, x: number, y: number, s: number) {
	ctx.save();
	ctx.translate(x, y);
	ctx.strokeStyle = '#f4ecff';
	ctx.fillStyle = '#f4ecff';
	ctx.lineWidth = s * 0.09;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	const r = s / 2;
	ctx.beginPath();
	switch (kind) {
		case 'call':
			ctx.arc(0, 0, r * 0.62, Math.PI * 0.62, Math.PI * 1.38);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(r * 0.05, 0, r * 0.95, -Math.PI * 0.18, Math.PI * 0.18);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(r * 0.05, 0, r * 1.25, -Math.PI * 0.14, Math.PI * 0.14);
			ctx.stroke();
			break;
		case 'chat':
			ctx.roundRect(-r * 0.8, -r * 0.62, r * 1.6, r * 1.1, r * 0.3);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(-r * 0.4, r * 0.48);
			ctx.lineTo(-r * 0.62, r * 0.85);
			ctx.lineTo(-r * 0.05, r * 0.48);
			ctx.stroke();
			break;
		case 'mail':
			ctx.roundRect(-r * 0.82, -r * 0.56, r * 1.64, r * 1.12, r * 0.14);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(-r * 0.7, -r * 0.4);
			ctx.lineTo(0, r * 0.12);
			ctx.lineTo(r * 0.7, -r * 0.4);
			ctx.stroke();
			break;
		case 'web':
			ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.ellipse(0, 0, r * 0.34, r * 0.78, 0, 0, Math.PI * 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(-r * 0.78, 0);
			ctx.lineTo(r * 0.78, 0);
			ctx.stroke();
			break;
		case 'social':
			ctx.roundRect(-r * 0.74, -r * 0.74, r * 1.48, r * 1.48, r * 0.42);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(r * 0.42, -r * 0.42, r * 0.07, 0, Math.PI * 2);
			ctx.fill();
			break;
		case 'save':
			ctx.arc(0, -r * 0.3, r * 0.34, 0, Math.PI * 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(0, r * 0.82, r * 0.7, Math.PI * 1.15, Math.PI * 1.85);
			ctx.stroke();
			break;
	}
	ctx.restore();
}

/** A holographic profile tile that bursts out of the phone: glass, icon, label. */
export function profileTile(kind: TileIcon, label: string, sub: string) {
	const W = 680;
	const H = 212;
	const [c, ctx] = canvas(W, H);
	const pad = 6;
	const g = ctx.createLinearGradient(0, 0, W, H);
	g.addColorStop(0, 'rgba(120, 60, 210, 0.55)');
	g.addColorStop(1, 'rgba(40, 0, 80, 0.45)');
	ctx.fillStyle = g;
	ctx.beginPath();
	ctx.roundRect(pad, pad, W - pad * 2, H - pad * 2, 40);
	ctx.fill();
	const edge = ctx.createLinearGradient(0, 0, W, 0);
	edge.addColorStop(0, 'rgba(230, 205, 254, 0.95)');
	edge.addColorStop(0.5, 'rgba(179, 113, 243, 0.45)');
	edge.addColorStop(1, 'rgba(255, 73, 134, 0.85)');
	ctx.strokeStyle = edge;
	ctx.lineWidth = 4;
	ctx.stroke();
	// icon well
	const ix = 112;
	const iy = H / 2;
	const well = ctx.createRadialGradient(ix, iy, 10, ix, iy, 70);
	well.addColorStop(0, 'rgba(255, 73, 134, 0.95)');
	well.addColorStop(1, 'rgba(143, 59, 227, 0.9)');
	ctx.fillStyle = well;
	ctx.beginPath();
	ctx.arc(ix, iy, 64, 0, Math.PI * 2);
	ctx.fill();
	tileIcon(ctx, kind, ix, iy, 64);
	ctx.fillStyle = '#ffffff';
	ctx.textBaseline = 'alphabetic';
	ctx.font = `600 58px ${DISPLAY}`;
	ctx.fillText(label, 212, 100);
	ctx.fillStyle = 'rgba(230, 205, 254, 0.82)';
	ctx.font = `500 34px ${SANS}`;
	ctx.fillText(sub, 214, 152);
	// chevron
	ctx.strokeStyle = 'rgba(244, 236, 255, 0.6)';
	ctx.lineWidth = 6;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(W - 78, H / 2 - 20);
	ctx.lineTo(W - 58, H / 2);
	ctx.lineTo(W - 78, H / 2 + 20);
	ctx.stroke();
	return c;
}

/** Soft radial sprite, for glows. */
export function glowSprite(size = 128) {
	const [c, ctx] = canvas(size, size);
	const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
	g.addColorStop(0, 'rgba(255,255,255,1)');
	g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, size, size);
	return c;
}
