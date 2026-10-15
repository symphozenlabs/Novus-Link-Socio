/**
 * The "signal" look: HDR bloom, then one final pass that composites the scene
 * over the night backdrop and adds lens character — edge chromatic aberration,
 * falloff, film grain, a light flash, and a digital glitch used on cuts.
 *
 * The scene renders with a transparent clear, so the backdrop (kept identical
 * to `.story-bg`) sits under everything, glow and grain included.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAPass } from 'three/examples/jsm/postprocessing/FXAAPass.js';

const SignalShader = {
	uniforms: {
		tDiffuse: { value: null as THREE.Texture | null },
		time: { value: 0 },
		flash: { value: 0 },
		glitch: { value: 0 },
		aspect: { value: 1 },
		warm: { value: 0 }
	},
	vertexShader: /* glsl */ `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader: /* glsl */ `
		uniform sampler2D tDiffuse;
		uniform float time, flash, glitch, aspect, warm;
		varying vec2 vUv;

		float hash(vec2 p) {
			p = fract(p * vec2(443.897, 441.423));
			p += dot(p, p.yx + 19.19);
			return fract((p.x + p.y) * p.x);
		}

		// Same as .story-bg (sRGB): a violet bloom of light right of centre on the night gradient.
		vec3 backdrop(vec2 uv) {
			float y = 1.0 - uv.y;
			vec3 top = vec3(0.071, 0.0, 0.149);
			vec3 mid = vec3(0.098, 0.0, 0.188);
			vec3 bot = vec3(0.055, 0.0, 0.102);
			vec3 c = y < 0.55 ? mix(top, mid, y / 0.55) : mix(mid, bot, (y - 0.55) / 0.45);
			float r = length((vec2(uv.x, y) - vec2(0.64, 0.48)) * vec2(aspect, 1.0) / vec2(0.75 * aspect, 0.7));
			vec3 glowCol = mix(vec3(0.29, 0.0, 0.584), vec3(0.42, 0.22, 0.30), warm);
			return mix(c, glowCol, 0.4 * smoothstep(0.85, 0.0, r));
		}

		void main() {
			vec2 uv = vUv;
			// Glitch: horizontal slices jump sideways for a few frames.
			if (glitch > 0.001) {
				float rows = 18.0 + 30.0 * hash(vec2(floor(time * 24.0), 3.1));
				float row = floor(uv.y * rows);
				float h = hash(vec2(row, floor(time * 30.0)));
				uv.x += (h - 0.5) * 0.12 * glitch * step(1.0 - glitch * 0.7, hash(vec2(row, 7.7)));
			}
			vec2 d = uv - 0.5;
			float edge = dot(d, d);
			// Colour fringing stays faint at rest so edges and card print read sharp.
			vec2 off = d * (0.0005 + glitch * 0.03) * (0.4 + edge * 4.0) + vec2(glitch * 0.008, 0.0);
			vec4 c = texture2D(tDiffuse, uv);
			float r = texture2D(tDiffuse, uv + off).r;
			float b = texture2D(tDiffuse, uv - off).b;
			vec3 col = vec3(r, c.g, b) + backdrop(vUv) * (1.0 - clamp(c.a, 0.0, 1.0));

			col += flash * vec3(0.66, 0.46, 1.0);
			// Scanlines only show while the signal is breaking up.
			col *= 1.0 - glitch * 0.18 * step(0.5, fract(gl_FragCoord.y * 0.5));
			col *= 1.0 - 0.26 * smoothstep(0.1, 0.55, length(d * vec2(aspect, 1.0)) / max(aspect, 1.0));
			float lum = dot(col, vec3(0.299, 0.587, 0.114));
			float n = hash(gl_FragCoord.xy + fract(time * 7.13) * 512.0) - 0.5;
			// Kept faint: per-pixel grain reads as pixelation on large flat surfaces.
			col += n * 0.02 * (1.0 - 0.7 * lum);
			gl_FragColor = vec4(col, 1.0);
		}`
};

export interface PostState {
	glow: number;
	flash: number;
	glitch: number;
	warm: number;
}

export function createPost(
	renderer: THREE.WebGLRenderer,
	scene: THREE.Scene,
	camera: THREE.Camera,
	/** MSAA samples for the scene (0 = none). Real multisampling keeps card, phone and
	 *  grid edges clean; FXAA only smears them, so it is the low-power fallback. */
	msaa: number,
	/** Bloom resolution relative to CSS pixels — it is a blur, so it never needs the full density. */
	bloomScale: number
) {
	const samples = Math.min(msaa, renderer.capabilities.maxSamples);
	const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples });
	const composer = new EffectComposer(renderer, target);
	composer.addPass(new RenderPass(scene, camera, null, new THREE.Color(0x000000), 0));
	const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.55, 0.9);
	composer.addPass(bloom);
	composer.addPass(new OutputPass());
	if (!samples) composer.addPass(new FXAAPass());
	const signal = new ShaderPass(SignalShader);
	composer.addPass(signal);

	return {
		/** Where the scene itself is drawn — shaders must be compiled against it. */
		target: composer.renderTarget1,
		setSize(w: number, h: number) {
			composer.setPixelRatio(renderer.getPixelRatio());
			composer.setSize(w, h);
			bloom.setSize(Math.round(w * bloomScale), Math.round(h * bloomScale));
			signal.uniforms.aspect.value = w / h;
		},
		render(time: number, s: PostState) {
			bloom.strength = 0.5 + s.glow;
			signal.uniforms.time.value = time;
			signal.uniforms.flash.value = s.flash;
			signal.uniforms.glitch.value = s.glitch;
			signal.uniforms.warm.value = s.warm;
			composer.render();
		},
		dispose() {
			composer.dispose();
			target.dispose();
			bloom.dispose();
		}
	};
}
