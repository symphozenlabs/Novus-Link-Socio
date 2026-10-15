/**
 * SIGNAL — the world of the Novus story. Units: 1 = 1 cm.
 *
 *   hero      the violet PVC card; "scans" in and out along a laser line
 *   rolodex   the old way: a card file of paper cards, audited by a laser
 *   field     ~16k particles that morph vortex → card → globe on the GPU
 *   floor     an endless holographic grid that ripples when the card taps
 *   phone     wakes on the tap; shockwave rings + profile tiles burst out
 *   carousel  four metal cards on a slow revolving stage
 *   arcs      the network: pulses travelling between points on the globe
 *
 * Everything the script animates lives in `fx` (plain numbers) or on real
 * Object3D transforms, so GSAP can scrub it and every frame is derived.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
	brushedRoughness,
	fontsReady,
	glowSprite,
	metalFront,
	paperCard,
	phoneScreen,
	profileTile,
	pvcBack,
	pvcFront,
	setTextureDetail,
	type Finish,
	type TileIcon
} from './textures.ts';
import { createPost } from './post.ts';

export const FLOOR_Y = -7;
export const CARD = { w: 8.56, h: 5.4, t: 0.08, r: 0.32 };
const PHONE_SCALE = 0.62;
export const GLOBE_R = 13;
export const FINISHES: Finish[] = ['black', 'silver', 'gold', 'rose'];

/** Points of interest on the hero card (card-local), for the HUD callouts. */
export const CARD_ANCHORS = {
	chip: new THREE.Vector3(3.48, 1.9, 0.05),
	brand: new THREE.Vector3(-2.3, -1.75, 0.05),
	corner: new THREE.Vector3(-4.2, 2.62, 0)
};

/** Rolodex size (wheel-local, before its scale) and the HUD tags' anchors on its frame. */
const ROLO = { w: 4.2, h: 2.45, r0: 1.3, scale: 1.12 };
const ROLO_OUT = ROLO.r0 + ROLO.h;
export const ROLO_ANCHORS = {
	runs: new THREE.Vector3(-(ROLO.w / 2 + 0.35), 2.7, 2.6),
	dated: new THREE.Vector3(ROLO.w / 2 + 0.35, 3.1, 1.2),
	lost: new THREE.Vector3(ROLO.w / 2 + 0.35, -2.4, 2.6)
};

const TILES: [TileIcon, string, string][] = [
	['call', 'Call', '+91 ·· ···· ····'],
	['chat', 'WhatsApp', 'Message me'],
	['mail', 'Email', 'you@company.com'],
	['web', 'Website', 'yourcompany.com'],
	['social', 'Social', '@yourhandle'],
	['save', 'Save contact', 'Add to phone']
];

/** Every animatable scalar in the film. */
export interface Fx {
	/** Laser scan of the hero card, 0 (gone) → 1 (whole). */
	reveal: number;
	/** Particle shape: 0 vortex · 1 card · 2 globe. */
	shape: number;
	particles: number;
	/** Rolodex turn, shared by the paper and the particles so one can become the other. */
	spin: number;
	paperIn: number;
	paperLife: number;
	/** The audit: a scan sweeps the file and stale cards flag, 0 → 1. */
	stale: number;
	/** Holds the hero card's idle wobble still (during the tap, where it sits close to the phone). */
	hold: number;
	floor: number;
	ripple: number;
	rings: number;
	screen: number;
	tiles: number;
	orbit: number;
	arcs: number;
	globe: number;
	glow: number;
	flash: number;
	glitch: number;
	warm: number;
	env: number;
}

const defaults: Fx = {
	reveal: 1,
	shape: 1,
	particles: 0,
	spin: 0,
	paperIn: 0,
	paperLife: 1,
	stale: 0,
	hold: 0,
	floor: 0.55,
	ripple: 0,
	rings: 0,
	screen: 0,
	tiles: 0,
	orbit: 0,
	arcs: 0,
	globe: 0,
	glow: 0,
	flash: 0,
	glitch: 0,
	warm: 0,
	env: 0
};

/* ───────────────────────────── helpers ───────────────────────────── */

function roundedRect(w: number, h: number, r: number) {
	const s = new THREE.Shape();
	const x = -w / 2;
	const y = -h / 2;
	s.moveTo(x + r, y);
	s.lineTo(x + w - r, y);
	s.quadraticCurveTo(x + w, y, x + w, y + r);
	s.lineTo(x + w, y + h - r);
	s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	s.lineTo(x + r, y + h);
	s.quadraticCurveTo(x, y + h, x, y + h - r);
	s.lineTo(x, y + r);
	s.quadraticCurveTo(x, y, x + r, y);
	return s;
}

/** Card body with a real bevelled edge, plus separately-textured front/back faces. */
function cardMesh(body: THREE.Material, front: THREE.Material, back: THREE.Material) {
	const d = CARD;
	const bevel = Math.min(d.t * 0.35, 0.02);
	const geo = new THREE.ExtrudeGeometry(
		roundedRect(d.w - bevel * 2, d.h - bevel * 2, d.r - bevel),
		{
			depth: d.t - bevel * 2,
			bevelEnabled: true,
			bevelThickness: bevel,
			bevelSize: bevel,
			bevelSegments: 3,
			curveSegments: 18
		}
	);
	geo.translate(0, 0, -(d.t - bevel * 2) / 2);
	const faceGeo = new THREE.ShapeGeometry(roundedRect(d.w, d.h, d.r), 18);
	const uv = faceGeo.attributes.uv;
	const pos = faceGeo.attributes.position;
	for (let i = 0; i < uv.count; i++)
		uv.setXY(i, (pos.getX(i) + d.w / 2) / d.w, (pos.getY(i) + d.h / 2) / d.h);
	const group = new THREE.Group();
	const f = new THREE.Mesh(faceGeo, front);
	f.position.z = d.t / 2 + 0.0015;
	const b = new THREE.Mesh(faceGeo, back);
	b.rotation.y = Math.PI;
	b.position.z = -d.t / 2 - 0.0015;
	group.add(new THREE.Mesh(geo, body), f, b);
	return group;
}

function tex(c: HTMLCanvasElement, renderer: THREE.WebGLRenderer, srgb = true) {
	const t = new THREE.CanvasTexture(c);
	t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
	// Full anisotropic filtering keeps card print and the phone screen crisp at angles.
	t.anisotropy = renderer.capabilities.getMaxAnisotropy();
	return t;
}

/** Deterministic pseudo-random in [0, 1). */
const rand = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

const smooth = (a: number, b: number, x: number) => {
	const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
	return t * t * (3 - 2 * t);
};

/**
 * A product-photography studio rendered into a PMREM environment map:
 * overhead softbox, two strip lights, a violet rim panel and a front softbox.
 */
function studioEnvironment(pmrem: THREE.PMREMGenerator, front: number, strips = 1) {
	const env = new THREE.Scene();
	env.add(
		new THREE.Mesh(
			new THREE.SphereGeometry(60, 32, 16),
			new THREE.MeshBasicMaterial({ color: 0x050407, side: THREE.BackSide })
		)
	);
	const panel = (w: number, h: number, rgb: number[], k: number, p: [number, number, number]) => {
		const m = new THREE.Mesh(
			new THREE.PlaneGeometry(w, h),
			new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
		);
		(m.material as THREE.MeshBasicMaterial).color.setRGB(rgb[0] * k, rgb[1] * k, rgb[2] * k);
		m.position.set(...p);
		m.lookAt(0, 0, 0);
		env.add(m);
	};
	panel(34, 16, [1, 0.97, 0.94], 3.0, [0, 26, 4]);
	panel(5, 36, [1, 0.98, 0.96], 7.0 * strips, [-26, 4, 8]);
	panel(3, 30, [0.94, 0.95, 1], 3.6 * strips, [24, 2, 2]);
	panel(30, 10, [0.62, 0.4, 1], 1.6, [0, 6, -28]);
	panel(4, 30, [1, 0.45, 0.65], 1.2, [18, 0, -20]);
	panel(56, 20, [1, 0.99, 0.97], front, [0, 9, 30]);
	// No extra blur (sigma 0): the panels are soft already, and it would compile a
	// second filter shader.
	const out = pmrem.fromScene(env, 0).texture;
	env.traverse((o) => {
		const m = o as THREE.Mesh;
		m.geometry?.dispose();
		(m.material as THREE.Material | undefined)?.dispose();
	});
	return out;
}

/* ───────────────────────────── shaders ───────────────────────────── */

const FIELD_VERT = /* glsl */ `
	uniform float uTime, uShape, uSpread, uGlobe, uSize, uScale, uAlpha;
	uniform mat4 uCard, uWheel;
	attribute vec3 aA;
	attribute vec3 aB;
	attribute vec3 aC;
	attribute vec4 aR;
	varying float vAlpha;
	varying vec3 vColor;

	vec3 rotY(vec3 p, float a) {
		float c = cos(a), s = sin(a);
		return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
	}

	void main() {
		// A: on the Rolodex's cards (they turn with it); spread out wide for the boot.
		vec3 A = (uWheel * vec4(aA * uSpread, 1.0)).xyz;
		A += vec3(0.0, sin(uTime * 0.7 + aR.z * 6.2831), cos(uTime * 0.6 + aR.y * 6.2831)) * 0.08 * uSpread;
		vec3 B = (uCard * vec4(aB, 1.0)).xyz;
		vec3 C = rotY(aC, uGlobe);

		// Each particle leaves on its own beat and bows out on the way.
		float d = aR.x * 0.4;
		float t1 = smoothstep(d, d + 0.6, clamp(uShape, 0.0, 1.0));
		float t2 = smoothstep(d, d + 0.6, clamp(uShape - 1.0, 0.0, 1.0));
		vec3 bow = normalize(vec3(aR.y - 0.5, aR.z - 0.5, aR.w - 0.5) + 1e-4);
		vec3 p = mix(A, B, t1) + bow * sin(t1 * 3.14159) * 3.0;
		p = mix(p, C, t2) + bow * sin(t2 * 3.14159) * 5.0;
		// Shimmer while they hold the card's shape.
		p += bow * 0.04 * sin(uTime * 3.0 + aR.y * 40.0) * (1.0 - abs(uShape - 1.0));

		vec4 mv = modelViewMatrix * vec4(p, 1.0);
		gl_Position = projectionMatrix * mv;
		float size = uSize * (0.35 + aR.y * aR.y * 1.4);
		gl_PointSize = clamp(size * uScale / -mv.z, 0.0, 32.0);

		float twinkle = 0.65 + 0.35 * sin(uTime * (1.5 + aR.w * 3.0) + aR.z * 30.0);
		vAlpha = uAlpha * twinkle * (0.45 + 0.55 * aR.w);
		vec3 violet = vec3(0.62, 0.32, 1.0);
		vec3 pink = vec3(1.0, 0.29, 0.53);
		vec3 white = vec3(1.0, 0.95, 1.0);
		vColor = (aR.z > 0.86 ? pink : mix(violet, white, aR.y * aR.y)) * 1.6;
	}`;

const SPRITE_FRAG = /* glsl */ `
	varying float vAlpha;
	varying vec3 vColor;
	void main() {
		float d = length(gl_PointCoord - 0.5);
		float a = smoothstep(0.5, 0.0, d);
		gl_FragColor = vec4(vColor, a * a * vAlpha);
	}`;

const DUST_VERT = /* glsl */ `
	uniform float uTime, uScale, uAlpha;
	attribute vec4 aR;
	varying float vAlpha;
	varying vec3 vColor;
	void main() {
		vec3 p = position;
		p.y += mod(uTime * (0.15 + aR.x * 0.3) + aR.y * 40.0, 40.0) - 20.0;
		p.x += sin(uTime * 0.2 + aR.z * 6.28) * 1.5;
		vec4 mv = modelViewMatrix * vec4(p, 1.0);
		gl_Position = projectionMatrix * mv;
		gl_PointSize = clamp((0.05 + aR.w * 0.12) * uScale / -mv.z, 0.0, 24.0);
		vAlpha = uAlpha * (0.25 + 0.5 * aR.w);
		vColor = mix(vec3(0.7, 0.5, 1.0), vec3(1.0), aR.x) * 1.2;
	}`;

const FLOOR_VERT = /* glsl */ `
	varying vec3 vW;
	void main() {
		vec4 w = modelMatrix * vec4(position, 1.0);
		vW = w.xyz;
		gl_Position = projectionMatrix * viewMatrix * w;
	}`;

const FLOOR_FRAG = /* glsl */ `
	uniform float uAlpha, uRipple, uTime;
	uniform vec2 uRippleAt;
	varying vec3 vW;

	float grid(vec2 p, float size, float width) {
		vec2 q = p / size;
		vec2 g = abs(fract(q - 0.5) - 0.5) / (fwidth(q) * width);
		return 1.0 - min(min(g.x, g.y), 1.0);
	}

	void main() {
		vec2 p = vW.xz;
		float minor = grid(p, 2.0, 1.0);
		float major = grid(p, 10.0, 1.6);
		float dist = length(p);
		float fade = exp(-dist * 0.028) * smoothstep(0.0, 6.0, dist + 4.0);
		float rd = length(p - uRippleAt);
		float front = uRipple * 70.0;
		float ring = exp(-pow((rd - front) * 0.3, 2.0)) * (1.0 - uRipple);
		float trail = smoothstep(front, 0.0, rd) * (1.0 - uRipple) * 0.25 * step(0.001, uRipple);
		// A slow scan line sweeping toward the viewer.
		float scan = exp(-pow(mod(p.y - uTime * 6.0, 60.0) - 30.0, 2.0) * 0.02) * 0.35;
		float lines = minor * 0.22 + major * 0.5;
		float a = (lines * (1.0 + scan + ring * 4.0 + trail * 2.0) + ring * 0.35) * fade * uAlpha;
		vec3 col = mix(vec3(0.5, 0.22, 1.0), vec3(1.0, 0.4, 0.7), ring);
		gl_FragColor = vec4(col * 1.4, a);
	}`;

const ARC_VERT = /* glsl */ `
	attribute float aT;
	attribute float aSeed;
	varying float vT;
	varying float vSeed;
	void main() {
		vT = aT;
		vSeed = aSeed;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}`;

const ARC_FRAG = /* glsl */ `
	uniform float uTime, uAlpha;
	varying float vT;
	varying float vSeed;
	void main() {
		float head = fract(uTime * (0.22 + vSeed * 0.25) + vSeed * 7.0) * 1.4 - 0.2;
		float pulse = exp(-pow((vT - head) * 9.0, 2.0));
		float tail = smoothstep(head - 0.35, head, vT) * step(vT, head) * 0.5;
		float a = (0.1 + pulse * 1.6 + tail) * uAlpha;
		vec3 col = mix(vec3(0.6, 0.35, 1.0), vec3(1.0, 0.45, 0.7), pulse);
		gl_FragColor = vec4(col * 1.5, a);
	}`;

const additive = {
	transparent: true,
	depthWrite: false,
	blending: THREE.AdditiveBlending
} as const;

/* ───────────────────────────── the world ───────────────────────────── */

export interface Projected {
	x: number;
	y: number;
	/** How squarely the surface faces the camera, 0 (edge-on/away) → 1. */
	facing: number;
}

export type StoryWorld = Awaited<ReturnType<typeof createWorld>>;

export async function createWorld(canvas: HTMLCanvasElement, quality: 'high' | 'low') {
	await fontsReady();
	const high = quality === 'high';
	setTextureDetail(high ? 1.5 : 1);

	const renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: false,
		alpha: true,
		powerPreference: 'high-performance'
	});
	// Fill rate is the cost here (glow, particles, grid), so cap the pixels drawn per
	// frame rather than trusting devicePixelRatio: a 3× phone or a 4K laptop would
	// otherwise draw several times what a 1080p screen does.
	const dpr = window.devicePixelRatio || 1;
	const maxRatio = high ? 2 : 1.5;
	const pixelBudget = high ? 4.2e6 : 2.2e6;
	// Clarity comes first: however slow the GPU, the adaptive governor never renders
	// below the screen's own pixel density (lower than that, edges visibly turn to
	// pixels). A slow machine gives up some frame rate instead.
	const minRatio = high ? Math.min(dpr, 1) : Math.min(dpr, 0.85);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.NeutralToneMapping;
	renderer.toneMappingExposure = 1.05;
	renderer.localClippingEnabled = true;
	// Checking shader errors forces a synchronous GPU round-trip per program (and
	// echoes harmless D3D compiler notes on Windows). Every shader here is fixed,
	// so check in development only.
	renderer.debug.checkShaderErrors = import.meta.env.DEV;
	renderer.setClearColor(0x000000, 0);

	const scene = new THREE.Scene();
	// One generator for both bakes: its GGX prefilter is very slow to compile on
	// Windows (D3D unrolls its 256-sample loop), and disposing a generator frees the
	// compiled program, so a second generator would compile it all over again. Its
	// checks are off for the bake: the shader trips a harmless D3D compiler note.
	const check = renderer.debug.checkShaderErrors;
	renderer.debug.checkShaderErrors = false;
	const pmrem = new THREE.PMREMGenerator(renderer);
	const envTex = studioEnvironment(pmrem, 0.8);
	const metalEnv = studioEnvironment(pmrem, 1.4, 0.45);
	pmrem.dispose();
	renderer.debug.checkShaderErrors = check;
	scene.environment = envTex;
	scene.environmentIntensity = 0.9;

	const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
	const look = new THREE.Vector3();

	const key = new THREE.DirectionalLight(0xfff4ea, 2.2);
	key.position.set(-10, 14, 12);
	const rim = new THREE.DirectionalLight(0x9b4dff, 2.4);
	rim.position.set(10, 6, -14);
	const fill = new THREE.DirectionalLight(0x8fa2ff, 0.45);
	fill.position.set(12, -4, 10);
	scene.add(key, rim, fill);

	const fx: Fx = { ...defaults };
	const textures: THREE.Texture[] = [];
	const T = (c: HTMLCanvasElement, srgb = true) => {
		const t = tex(c, renderer, srgb);
		textures.push(t);
		return t;
	};
	const glowTex = T(glowSprite());

	/* ── holographic floor ─────────────────────────────────────────── */
	const floorMat = new THREE.ShaderMaterial({
		...additive,
		side: THREE.DoubleSide,
		uniforms: {
			uAlpha: { value: 0 },
			uRipple: { value: 0 },
			uTime: { value: 0 },
			uRippleAt: { value: new THREE.Vector2() }
		},
		vertexShader: FLOOR_VERT,
		fragmentShader: FLOOR_FRAG
	});
	const floor = new THREE.Mesh(new THREE.PlaneGeometry(320, 320), floorMat);
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = FLOOR_Y;
	floor.renderOrder = -1;
	scene.add(floor);

	/* ── hero card (laser-scanned in and out with a clipping plane) ── */
	const clip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 100);
	const soft = {
		roughness: 0.55,
		clearcoat: 0.45,
		clearcoatRoughness: 0.28,
		sheen: 0.3,
		sheenRoughness: 0.55,
		sheenColor: new THREE.Color(0x8f3be3),
		clippingPlanes: [clip],
		side: THREE.DoubleSide
	};
	const hero = new THREE.Group();
	const heroFloat = new THREE.Group();
	heroFloat.add(
		cardMesh(
			new THREE.MeshPhysicalMaterial({
				color: 0x1f0038,
				roughness: 0.45,
				clearcoat: 0.3,
				clippingPlanes: [clip]
			}),
			new THREE.MeshPhysicalMaterial({ map: T(pvcFront()), ...soft }),
			new THREE.MeshPhysicalMaterial({ map: T(pvcBack()), ...soft })
		)
	);
	// The laser: a hot core line and a wide soft halo riding the clip edge.
	const laser = new THREE.Group();
	const laserCore = new THREE.Mesh(
		new THREE.PlaneGeometry(0.06, CARD.h * 1.3),
		new THREE.MeshBasicMaterial({
			color: new THREE.Color(2.4, 1.6, 3.2),
			...additive,
			side: THREE.DoubleSide,
			depthTest: false
		})
	);
	const laserHalo = new THREE.Mesh(
		new THREE.PlaneGeometry(2.4, CARD.h * 1.6),
		new THREE.MeshBasicMaterial({
			map: glowTex,
			color: new THREE.Color(1.2, 0.35, 1.6),
			...additive,
			side: THREE.DoubleSide,
			depthTest: false
		})
	);
	laser.add(laserHalo, laserCore);
	laser.renderOrder = 10;
	heroFloat.add(laser);
	hero.add(heroFloat);
	scene.add(hero);

	/* ── the Rolodex ───────────────────────────────────────────────── */
	// wheel: placement and HUD anchors · spinner: turns · cards: instanced, four designs.
	const wheel = new THREE.Group();
	wheel.position.set(0, 0.4, 0);
	wheel.rotation.y = -0.42;
	wheel.scale.setScalar(ROLO.scale);
	const spinner = new THREE.Group();
	wheel.add(spinner);
	wheel.visible = false;
	scene.add(wheel);

	const PAPER_N = high ? 48 : 40;
	const paperGeo = new THREE.PlaneGeometry(ROLO.w, ROLO.h);
	const paperMeshes = [0, 1, 2, 3].map((v) => {
		const m = new THREE.InstancedMesh(
			paperGeo,
			new THREE.MeshStandardMaterial({
				map: T(paperCard(v)),
				color: 0xa49fab,
				roughness: 0.92,
				side: THREE.DoubleSide,
				envMapIntensity: 0.4
			}),
			PAPER_N / 4
		);
		m.frustumCulled = false;
		m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		for (let k = 0; k < PAPER_N / 4; k++) m.setColorAt(k, new THREE.Color(1, 1, 1));
		spinner.add(m);
		return m;
	});
	const paper = Array.from({ length: PAPER_N }, (_, k) => ({
		a: (k / PAPER_N) * Math.PI * 2,
		order: k / PAPER_N,
		life: rand(k + 7000) * 0.85,
		// Roughly a third of the file is stale; the audit flags those.
		stale: rand(k + 900) > 0.64 ? 0.15 + rand(k + 300) * 0.55 : -1
	}));
	const dummy = new THREE.Object3D();
	const cardTint = new THREE.Color();
	const staleTint = new THREE.Color(1.45, 0.5, 0.78);

	// The frame: a dark axle, metal hubs and two holographic rails.
	const frameMats: THREE.Material[] = [];
	const axle = new THREE.Mesh(
		new THREE.CylinderGeometry(0.62, 0.62, ROLO.w + 0.9, 40),
		// Standard, not physical: a clearcoat shader variant costs seconds to compile on
		// Windows (D3D), and the axle is a supporting prop.
		new THREE.MeshStandardMaterial({
			color: 0x1c1924,
			metalness: 0.9,
			roughness: 0.3,
			transparent: true
		})
	);
	axle.rotation.z = Math.PI / 2;
	frameMats.push(axle.material as THREE.Material);
	wheel.add(axle);
	for (const side of [-1, 1]) {
		const x = side * (ROLO.w / 2 + 0.35);
		const rail = new THREE.Mesh(
			new THREE.TorusGeometry(ROLO_OUT + 0.18, 0.022, 8, 160),
			new THREE.MeshBasicMaterial({ color: new THREE.Color(0.85, 0.42, 1.5), ...additive })
		);
		const inner = new THREE.Mesh(
			new THREE.TorusGeometry(ROLO.r0 - 0.05, 0.03, 8, 80),
			new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 0.38, 1.4), ...additive })
		);
		const hub = new THREE.Mesh(
			new THREE.CylinderGeometry(0.95, 0.95, 0.16, 40),
			new THREE.MeshStandardMaterial({
				color: 0x2a2633,
				metalness: 1,
				roughness: 0.22,
				transparent: true
			})
		);
		for (const m of [rail, inner]) {
			m.rotation.y = Math.PI / 2;
			m.position.x = x;
		}
		hub.rotation.z = Math.PI / 2;
		hub.position.x = side * (ROLO.w / 2 + 0.5);
		frameMats.push(rail.material, inner.material, hub.material as THREE.Material);
		wheel.add(rail, inner, hub);
	}
	// The audit: a sheet of laser light that sweeps along the axle.
	const scanSheet = new THREE.Mesh(
		new THREE.PlaneGeometry((ROLO_OUT + 0.6) * 2, (ROLO_OUT + 0.6) * 2),
		new THREE.MeshBasicMaterial({
			map: glowTex,
			color: new THREE.Color(1.4, 0.4, 0.9),
			...additive,
			side: THREE.DoubleSide,
			opacity: 0.6
		})
	);
	const scanRing = new THREE.Mesh(
		new THREE.TorusGeometry(ROLO_OUT + 0.25, 0.03, 8, 160),
		new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 0.9, 1.6), ...additive })
	);
	const scan = new THREE.Group();
	for (const m of [scanSheet, scanRing]) m.rotation.y = Math.PI / 2;
	scan.add(scanSheet, scanRing);
	scan.visible = false;
	wheel.add(scan);

	/* ── particle field ────────────────────────────────────────────── */
	const N = high ? 12000 : 6000;
	const aA = new Float32Array(N * 3);
	const aB = new Float32Array(N * 3);
	const aC = new Float32Array(N * 3);
	const aR = new Float32Array(N * 4);
	const golden = Math.PI * (3 - Math.sqrt(5));
	for (let i = 0; i < N; i++) {
		// A: on the Rolodex's cards (spinner-local), so the paper can turn into light.
		const th = (Math.floor(Math.random() * PAPER_N) / PAPER_N) * Math.PI * 2;
		const rr = ROLO.r0 + Math.random() * ROLO.h;
		aA.set([(Math.random() - 0.5) * ROLO.w, Math.cos(th) * rr, Math.sin(th) * rr], i * 3);
		// B: the card — its face, with a denser outline.
		if (Math.random() < 0.72) {
			aB.set(
				[
					(Math.random() - 0.5) * CARD.w,
					(Math.random() - 0.5) * CARD.h,
					(Math.random() - 0.5) * 0.12
				],
				i * 3
			);
		} else {
			const per = 2 * (CARD.w + CARD.h);
			let u = Math.random() * per;
			let x: number;
			let y: number;
			if (u < CARD.w) [x, y] = [u - CARD.w / 2, -CARD.h / 2];
			else if ((u -= CARD.w) < CARD.h) [x, y] = [CARD.w / 2, u - CARD.h / 2];
			else if ((u -= CARD.h) < CARD.w) [x, y] = [CARD.w / 2 - u, CARD.h / 2];
			else [x, y] = [-CARD.w / 2, CARD.h / 2 - (u - CARD.w)];
			aB.set([x, y, (Math.random() - 0.5) * 0.06], i * 3);
		}
		// C: the globe (fibonacci sphere), with a thin orbital ring.
		if (Math.random() < 0.8) {
			const y = 1 - (i / (N - 1)) * 2;
			const rad = Math.sqrt(1 - y * y);
			const th = golden * i;
			const k = GLOBE_R * (1 + (Math.random() - 0.5) * 0.015);
			aC.set([Math.cos(th) * rad * k, y * k, Math.sin(th) * rad * k], i * 3);
		} else {
			const th = Math.random() * Math.PI * 2;
			const k = GLOBE_R * (1.42 + Math.random() * 0.18);
			const tilt = 0.38;
			const x = Math.cos(th) * k;
			const z = Math.sin(th) * k;
			aC.set([x, z * Math.sin(tilt) + (Math.random() - 0.5) * 0.3, z * Math.cos(tilt)], i * 3);
		}
		aR.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
	}
	const fieldGeo = new THREE.BufferGeometry();
	fieldGeo.setAttribute('position', new THREE.BufferAttribute(aB.slice(), 3));
	fieldGeo.setAttribute('aA', new THREE.BufferAttribute(aA, 3));
	fieldGeo.setAttribute('aB', new THREE.BufferAttribute(aB, 3));
	fieldGeo.setAttribute('aC', new THREE.BufferAttribute(aC, 3));
	fieldGeo.setAttribute('aR', new THREE.BufferAttribute(aR, 4));
	const fieldMat = new THREE.ShaderMaterial({
		...additive,
		uniforms: {
			uTime: { value: 0 },
			uShape: { value: 1 },
			uSpread: { value: 1 },
			uWheel: { value: new THREE.Matrix4() },
			uGlobe: { value: 0 },
			uSize: { value: high ? 0.09 : 0.12 },
			uScale: { value: 1 },
			uAlpha: { value: 0 },
			uCard: { value: new THREE.Matrix4() }
		},
		vertexShader: FIELD_VERT,
		fragmentShader: SPRITE_FRAG
	});
	const field = new THREE.Points(fieldGeo, fieldMat);
	field.frustumCulled = false;
	scene.add(field);

	/* ── ambient dust ──────────────────────────────────────────────── */
	const DUST_N = high ? 1400 : 600;
	const dustPos = new Float32Array(DUST_N * 3);
	const dustR = new Float32Array(DUST_N * 4);
	for (let i = 0; i < DUST_N; i++) {
		dustPos.set(
			[(Math.random() - 0.5) * 90, (Math.random() - 0.5) * 10, -40 + Math.random() * 60],
			i * 3
		);
		dustR.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
	}
	const dustGeo = new THREE.BufferGeometry();
	dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
	dustGeo.setAttribute('aR', new THREE.BufferAttribute(dustR, 4));
	const dustMat = new THREE.ShaderMaterial({
		...additive,
		uniforms: { uTime: { value: 0 }, uScale: { value: 1 }, uAlpha: { value: 0.8 } },
		vertexShader: DUST_VERT,
		fragmentShader: SPRITE_FRAG
	});
	const dust = new THREE.Points(dustGeo, dustMat);
	dust.frustumCulled = false;
	scene.add(dust);

	/* ── phone ─────────────────────────────────────────────────────── */
	const phone = new THREE.Group();
	const frame = new THREE.Mesh(
		new RoundedBoxGeometry(7.15, 14.7, 0.8, 8, 0.95),
		new THREE.MeshPhysicalMaterial({
			color: 0x24222b,
			metalness: 0.9,
			roughness: 0.28,
			clearcoat: 0.5
		})
	);
	const screen = new THREE.MeshPhysicalMaterial({
		color: 0x050208,
		roughness: 0.05,
		clearcoat: 0.4,
		clearcoatRoughness: 0.02,
		emissive: 0xffffff,
		emissiveMap: T(phoneScreen()),
		emissiveIntensity: 0
	});
	const glassGeo = new THREE.ShapeGeometry(roundedRect(6.8, 14.35, 0.8), 20);
	const ga = glassGeo.attributes;
	for (let i = 0; i < ga.uv.count; i++)
		ga.uv.setXY(i, (ga.position.getX(i) + 3.4) / 6.8, (ga.position.getY(i) + 7.175) / 14.35);
	const glass = new THREE.Mesh(glassGeo, screen);
	glass.position.z = 0.405;
	// Shockwave: rings that leave the phone when the card touches it.
	const rings = [0, 1, 2].map(() => {
		const m = new THREE.Mesh(
			new THREE.RingGeometry(0.985, 1, 128),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(1.3, 0.6, 2.0),
				...additive,
				side: THREE.DoubleSide,
				opacity: 0
			})
		);
		m.position.z = -0.6;
		m.visible = false;
		phone.add(m);
		return m;
	});
	phone.add(frame, glass);
	phone.scale.setScalar(PHONE_SCALE);
	phone.visible = false;
	scene.add(phone);

	/* ── profile tiles ─────────────────────────────────────────────── */
	const tileGeo = new THREE.PlaneGeometry(3.4, 3.4 * (212 / 680));
	const tiles = TILES.map(([icon, label, sub]) => {
		const m = new THREE.Mesh(
			tileGeo,
			new THREE.MeshBasicMaterial({
				map: T(profileTile(icon, label, sub)),
				transparent: true,
				depthWrite: false,
				toneMapped: false,
				opacity: 0
			})
		);
		m.visible = false;
		m.renderOrder = 5;
		scene.add(m);
		return m;
	});
	let tileLayout: THREE.Vector3[] = [];

	/* ── metal carousel ────────────────────────────────────────────── */
	const tint = { black: 0x2a2a30, silver: 0xd2d6dc, gold: 0xe0bf72, rose: 0xe8ad97 };
	const metalMats: THREE.MeshPhysicalMaterial[] = [];
	const carousel = new THREE.Group();
	const metals = FINISHES.map((f, k) => {
		const body = new THREE.MeshPhysicalMaterial({
			color: tint[f],
			metalness: 1,
			roughness: 0.3,
			envMap: metalEnv,
			envMapIntensity: 1.1
		});
		const face = new THREE.MeshPhysicalMaterial({
			envMap: metalEnv,
			map: T(metalFront(f)),
			roughnessMap: T(brushedRoughness(f), false),
			metalness: f === 'black' ? 0.75 : 1,
			roughness: 1,
			anisotropy: 0.6,
			envMapIntensity: 1.15
		});
		metalMats.push(face, body);
		const slot = new THREE.Group(); // position on the stage
		const bob = new THREE.Group(); // idle float
		bob.add(cardMesh(body, face, body));
		slot.add(bob);
		slot.rotation.y = (k * Math.PI) / 2;
		carousel.add(slot);
		return slot;
	});
	carousel.visible = false;
	scene.add(carousel);
	let carouselR = 7;

	/* ── network arcs ──────────────────────────────────────────────── */
	const ARCS = high ? 56 : 32;
	const SEG = 48;
	const arcPos: number[] = [];
	const arcT: number[] = [];
	const arcSeed: number[] = [];
	const va = new THREE.Vector3();
	const vb = new THREE.Vector3();
	const vp = new THREE.Vector3();
	for (let k = 0; k < ARCS; k++) {
		let tries = 0;
		do {
			va.randomDirection();
			vb.randomDirection();
		} while ((va.angleTo(vb) < 0.45 || va.angleTo(vb) > 1.9) && ++tries < 50);
		const ang = va.angleTo(vb);
		const seed = Math.random();
		let prev: THREE.Vector3 | null = null;
		for (let s = 0; s <= SEG; s++) {
			const t = s / SEG;
			// slerp on the sphere, lifted off it in a bow
			const sa = Math.sin((1 - t) * ang) / Math.sin(ang);
			const sb = Math.sin(t * ang) / Math.sin(ang);
			vp.copy(va)
				.multiplyScalar(sa)
				.addScaledVector(vb, sb)
				.multiplyScalar(GLOBE_R * (1 + Math.sin(t * Math.PI) * ang * 0.22));
			if (prev) {
				arcPos.push(prev.x, prev.y, prev.z, vp.x, vp.y, vp.z);
				arcT.push((s - 1) / SEG, t);
				arcSeed.push(seed, seed);
			}
			prev = vp.clone();
		}
	}
	const arcGeo = new THREE.BufferGeometry();
	arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(arcPos, 3));
	arcGeo.setAttribute('aT', new THREE.Float32BufferAttribute(arcT, 1));
	arcGeo.setAttribute('aSeed', new THREE.Float32BufferAttribute(arcSeed, 1));
	const arcMat = new THREE.ShaderMaterial({
		...additive,
		uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 } },
		vertexShader: ARC_VERT,
		fragmentShader: ARC_FRAG
	});
	const arcs = new THREE.LineSegments(arcGeo, arcMat);
	arcs.visible = false;
	scene.add(arcs);

	/* ── camera body ───────────────────────────────────────────────── */
	const post = createPost(renderer, scene, camera, high ? 4 : 0, high ? 0.75 : 0.5);
	const intro = { t: 1 };
	const motion = { velocity: 0 };
	const pointer = { x: 0, y: 0 };
	const pSmooth = { x: 0, y: 0 };
	let lean = 0;
	let lastTime = 0;
	let W = 1;
	let H = 1;
	let portrait = false;

	function layoutTiles() {
		tileLayout = TILES.map((_, k) => {
			const a = Math.PI / 6 + (k * Math.PI) / 3; // 30°, 90°, … around the phone
			return portrait
				? new THREE.Vector3(Math.cos(a) * 3.3, Math.sin(a) * 5.7, 1.6)
				: new THREE.Vector3(Math.cos(a) * 5.4, Math.sin(a) * 4.9, 1.6);
		});
		carouselR = portrait ? 6 : 8.5;
		metals.forEach((m, k) => {
			const a = (k * Math.PI) / 2;
			m.position.set(Math.sin(a) * carouselR, 0, Math.cos(a) * carouselR);
		});
	}

	/**
	 * Adaptive resolution: every ~45 frames, compare the average frame time to the
	 * target and step the render scale down (quickly) or back up (slowly, after a
	 * calm spell) — so a slow GPU trades sharpness for a steady frame rate.
	 */
	// A resize reallocates every render target (a visible hitch), so changes are
	// decided continuously but applied rarely: only while the scroll is at rest,
	// unless the frame rate is genuinely poor.
	let scale = 1;
	let wanted = 1;
	let frameSum = 0;
	let frameCount = 0;
	let lastChange = -Infinity;
	let firstTime = -1;
	let avg = 1 / 60;
	function govern(time: number, dt: number) {
		if (firstTime < 0) firstTime = time;
		if (time - firstTime < 1.5 || dt <= 0 || dt > 0.25) return; // warm-up, or a resumed tab
		frameSum += dt;
		if (++frameCount >= 45) {
			avg = frameSum / frameCount;
			frameSum = frameCount = 0;
			if (avg > 1 / 48) wanted = Math.max(0.8, scale * (avg > 1 / 30 ? 0.75 : 0.87));
			else if (avg < 1 / 57 && time - lastChange > 8) wanted = Math.min(1, scale * 1.1);
		}
		const resting = Math.abs(motion.velocity) < 40;
		const urgent = avg > 1 / 26 && time - lastChange > 2;
		if (Math.abs(wanted - scale) > 0.01 && time - lastChange > 3 && (resting || urgent)) {
			scale = wanted;
			lastChange = time;
			resize(W, H);
		}
	}

	function resize(w: number, h: number) {
		W = Math.max(1, w);
		H = Math.max(1, h);
		const fit = Math.sqrt(pixelBudget / (W * H));
		renderer.setPixelRatio(
			THREE.MathUtils.clamp(Math.min(dpr, maxRatio, fit) * scale, minRatio, 2)
		);
		renderer.setSize(W, H, false);
		const aspect = W / H;
		camera.aspect = aspect;
		portrait = aspect < 1.05;
		// Subject sits right of the copy on landscape screens, above it on portrait ones.
		camera.zoom = portrait ? Math.min(1, aspect / 0.75) : 1;
		if (portrait) camera.setViewOffset(W, H, 0, H * 0.17, W, H);
		else camera.setViewOffset(W, H, -W * 0.17, 0, W, H);
		camera.updateProjectionMatrix();
		post.setSize(W, H);
		const pointScale =
			(H * renderer.getPixelRatio() * camera.zoom) / (2 * Math.tan(THREE.MathUtils.degToRad(15)));
		fieldMat.uniforms.uScale.value = pointScale;
		dustMat.uniforms.uScale.value = pointScale;
		layoutTiles();
		return { portrait };
	}

	const local = new THREE.Plane();
	const tmp = new THREE.Vector3();
	const tmp2 = new THREE.Vector3();
	const camDir = new THREE.Vector3();
	const camQ = new THREE.Quaternion();

	/** Wraps an angle to (-π, π]. */
	const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

	function updateRolodex(time: number) {
		// Always turn (the particles ride the same frame), and refresh now: the scene
		// graph was updated before this ran.
		const turn = -fx.spin * 1.6 - time * 0.12;
		spinner.rotation.x = turn;
		spinner.updateMatrixWorld();
		const on = fx.paperIn > 0.001 && fx.paperLife > 0.001;
		wheel.visible = on;
		if (!on) return;
		const frame = smooth(0, 0.25, fx.paperIn) * smooth(0, 0.35, fx.paperLife);
		for (const m of frameMats) m.opacity = frame;
		// The audit sheet travels the length of the axle.
		scan.visible = fx.stale > 0.001 && fx.stale < 0.999;
		scan.position.x = (fx.stale - 0.5) * (ROLO.w + 1.4);
		paper.forEach((p, k) => {
			// Cards are dealt into their slots one after another…
			const inT = smooth(p.order * 0.7, p.order * 0.7 + 0.3, fx.paperIn);
			const lifeT = smooth(p.life, p.life + 0.15, fx.paperLife);
			// …and flick forward as they pass over the top, like a real Rolodex.
			const flick = 0.42 * Math.exp(-Math.pow(wrap(p.a + turn - 0.35), 2) / 0.06);
			const r = ROLO.r0 + ROLO.h / 2 + (1 - inT) * 7;
			dummy.position.set((1 - inT) * 2.5, Math.cos(p.a) * r, Math.sin(p.a) * r);
			dummy.rotation.set(p.a + flick + (1 - inT) * 0.8, 0, (1 - inT) * 0.5);
			dummy.scale.setScalar(Math.max(inT * lifeT, 1e-4));
			dummy.updateMatrix();
			const mesh = paperMeshes[k % 4];
			const slot = Math.floor(k / 4);
			mesh.setMatrixAt(slot, dummy.matrix);
			let tint = 0;
			if (p.stale >= 0) {
				const lt = smooth(p.stale, p.stale + 0.12, fx.stale);
				const flicker = lt > 0 && lt < 1 ? (Math.sin(time * 50 + k) > 0 ? 1 : 0.35) : 1;
				tint = lt * flicker;
			}
			mesh.setColorAt(slot, cardTint.setRGB(1, 1, 1).lerp(staleTint, tint));
		});
		for (const m of paperMeshes) {
			m.instanceMatrix.needsUpdate = true;
			if (m.instanceColor) m.instanceColor.needsUpdate = true;
		}
	}

	function updateTiles(time: number) {
		const on = fx.tiles > 0.001 && phone.visible;
		camera.getWorldQuaternion(camQ);
		tiles.forEach((m, k) => {
			const lt = THREE.MathUtils.clamp(fx.tiles * 1.6 - k * 0.12, 0, 1);
			m.visible = on && lt > 0;
			if (!m.visible) return;
			// back-out ease: overshoot, then settle
			const c = 1.7;
			const e = 1 + (c + 1) * Math.pow(lt - 1, 3) + c * Math.pow(lt - 1, 2);
			const target = tileLayout[k];
			m.position
				.copy(phone.position)
				.addScaledVector(target, e)
				.add(tmp.set(0, Math.sin(time * 1.2 + k) * 0.12, 0));
			m.quaternion.copy(camQ);
			m.scale.setScalar(Math.max(0.001, e));
			(m.material as THREE.MeshBasicMaterial).opacity = Math.min(1, lt * 2.2);
		});
	}

	/** `resting`: the film is idle and drawn at a reduced rate — not a sign of a slow GPU. */
	function render(time: number, resting = false) {
		const dt = time - lastTime;
		lastTime = time;
		if (!resting) govern(time, dt);

		const v = THREE.MathUtils.clamp(motion.velocity / 2600, -1, 1);
		lean += (v - lean) * 0.06;
		pSmooth.x += (pointer.x - pSmooth.x) * 0.05;
		pSmooth.y += (pointer.y - pSmooth.y) * 0.05;

		// Intro (on load): particles gather into the card, then the laser draws it.
		const it = intro.t;
		const introShape = smooth(0, 0.6, it);
		const introReveal = smooth(0.5, 0.92, it);
		const introParticles = it < 1 ? 1 - smooth(0.82, 1, it) : 0;
		const shape = it < 1 ? Math.min(fx.shape, introShape) : fx.shape;
		const reveal = fx.reveal * introReveal;

		// hero idle + scan
		const wobble = 1 - fx.hold;
		heroFloat.rotation.set(
			(lean * 0.25 + pSmooth.y * 0.06) * wobble,
			(Math.sin(time * 0.35) * 0.05 + pSmooth.x * 0.1) * wobble,
			0
		);
		heroFloat.position.set(0, (Math.sin(time * 0.6) * 0.1 - lean * 0.4) * wobble, 0);
		heroFloat.visible = reveal > 0.001;
		scene.updateMatrixWorld();
		const edge = -CARD.w / 2 - 0.15 + reveal * (CARD.w + 0.3);
		local.set(tmp.set(-1, 0, 0), reveal >= 0.999 ? 1e4 : edge);
		clip.copy(local).applyMatrix4(heroFloat.matrixWorld);
		laser.visible = reveal > 0.001 && reveal < 0.999;
		laser.position.x = edge;
		laser.scale.y = 0.8 + Math.sin(reveal * Math.PI) * 0.4;

		updateRolodex(time);

		const fu = fieldMat.uniforms;
		fu.uTime.value = time;
		fu.uShape.value = shape;
		// Boot: the light gathers from a wide cloud round the (hidden) file.
		fu.uSpread.value = it < 1 ? 1 + (1 - introShape) * 3.5 : 1;
		fu.uWheel.value.copy(spinner.matrixWorld);
		fu.uGlobe.value = fx.globe + time * 0.05;
		fu.uAlpha.value = Math.max(fx.particles, introParticles);
		fu.uCard.value.copy(heroFloat.matrixWorld);
		field.visible = fu.uAlpha.value > 0.002;
		dustMat.uniforms.uTime.value = time;

		floorMat.uniforms.uAlpha.value = fx.floor * smooth(0, 0.7, it);
		floorMat.uniforms.uRipple.value = fx.ripple;
		floorMat.uniforms.uTime.value = time;
		floorMat.uniforms.uRippleAt.value.set(phone.position.x, phone.position.z);
		floor.visible = fx.floor > 0.002;

		screen.emissiveIntensity = fx.screen * 1.5;
		rings.forEach((m, k) => {
			const lt = THREE.MathUtils.clamp(fx.rings * 1.5 - k * 0.22, 0, 1);
			m.visible = lt > 0 && lt < 1;
			m.scale.setScalar(1 + Math.pow(lt, 0.6) * 16);
			(m.material as THREE.MeshBasicMaterial).opacity = Math.pow(1 - lt, 2) * 0.8;
		});

		if (carousel.visible) {
			carousel.rotation.y = fx.orbit + time * 0.04;
			metals.forEach((m, k) => {
				const bob = m.children[0];
				bob.position.y = Math.sin(time * 0.6 + k * 1.3) * 0.25;
				bob.rotation.x = -0.06 + lean * 0.2 + Math.sin(time * 0.5 + k) * 0.02;
			});
		}

		arcs.visible = fx.arcs > 0.002;
		arcs.rotation.y = fu.uGlobe.value;
		arcMat.uniforms.uTime.value = time;
		arcMat.uniforms.uAlpha.value = fx.arcs;

		scene.environmentRotation.y = fx.env;
		for (const m of metalMats) m.envMapRotation.y = fx.env * 0.6 - 1.2;

		camera.lookAt(look);
		// Handheld drift, a nudge toward the pointer, and a bank into fast scrolls.
		camera.rotateY(Math.sin(time * 0.41 + 1.7) * 0.0013 - pSmooth.x * 0.018);
		camera.rotateX(Math.sin(time * 0.53) * 0.0011 + pSmooth.y * 0.012);
		camera.rotateZ(Math.sin(time * 0.29) * 0.0016 - lean * 0.012);
		camera.updateMatrixWorld();
		updateTiles(time);

		renderer.toneMappingExposure = 1.05 * (0.25 + 0.75 * smooth(0, 0.5, it));
		post.render(time, {
			glow: fx.glow + (it < 1 ? (1 - smooth(0.85, 1, it)) * smooth(0.45, 0.6, it) * 0.6 : 0),
			flash: fx.flash,
			glitch: fx.glitch,
			warm: fx.warm
		});
	}

	/** Screen position (CSS px) of a point given in an object's local space. */
	function project(obj: THREE.Object3D, point: THREE.Vector3, normal?: THREE.Vector3): Projected {
		tmp.copy(point);
		obj.localToWorld(tmp);
		let facing = 1;
		if (normal) {
			tmp2.copy(normal).transformDirection(obj.matrixWorld);
			camDir.subVectors(camera.position, tmp).normalize();
			facing = Math.max(0, tmp2.dot(camDir));
		}
		tmp.project(camera);
		if (tmp.z > 1) facing = 0;
		return { x: (tmp.x * 0.5 + 0.5) * W, y: (-tmp.y * 0.5 + 0.5) * H, facing };
	}

	/**
	 * Gets every later act ready in the background, after the opening is on screen,
	 * so none of them stalls the first time it appears (the paper, the phone, the
	 * metal…) — exactly while someone scrolls. Shaders compile in parallel without
	 * blocking (KHR_parallel_shader_compile), textures upload one per frame, then a
	 * single off-screen draw uploads geometry and finishes each program.
	 */
	let disposed = false;
	const nextFrame = () => new Promise((r) => requestAnimationFrame(r));
	/** Runs `fn` with everything visible and nothing culled, drawing into the scene's target. */
	function exposed<T>(fn: () => T): T {
		const hidden: THREE.Object3D[] = [];
		const culled: THREE.Object3D[] = [];
		scene.traverse((o) => {
			if (!o.visible) {
				hidden.push(o);
				o.visible = true;
			}
			if (o.frustumCulled) {
				culled.push(o);
				o.frustumCulled = false;
			}
		});
		const prev = renderer.getRenderTarget();
		// Variants depend on the target (tone mapping, colour space): use the one the scene draws into.
		renderer.setRenderTarget(post.target);
		try {
			return fn();
		} finally {
			renderer.setRenderTarget(prev);
			for (const o of hidden) o.visible = false;
			for (const o of culled) o.frustumCulled = true;
		}
	}
	async function prewarm() {
		// Starts compiling synchronously (so the objects can be hidden again at once),
		// then waits without blocking the film.
		await exposed(() => renderer.compileAsync(scene, camera));
		for (const t of textures) {
			if (disposed) return;
			await nextFrame();
			renderer.initTexture(t);
		}
		await nextFrame();
		if (!disposed) exposed(() => renderer.render(scene, camera));
	}

	function dispose() {
		disposed = true;
		scene.traverse((o) => {
			const m = o as THREE.Mesh;
			m.geometry?.dispose();
			const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
			for (const mat of mats) mat.dispose();
		});
		for (const t of textures) t.dispose();
		envTex.dispose();
		metalEnv.dispose();
		post.dispose();
		renderer.dispose();
	}

	return {
		renderer,
		camera,
		look,
		hero,
		heroCard: heroFloat,
		wheel,
		phone,
		carousel,
		metals,
		fx,
		defaults,
		intro,
		motion,
		pointer,
		resize,
		render,
		prewarm,
		project,
		dispose
	};
}
