<!--
  SIGNAL — the Novus story.
  A real-time WebGL film (three.js) scrubbed by native scroll through one GSAP
  timeline: paper chaos → light → one card → tap → metal → a network.
  See ./scene/script.ts for the shot list and ./scene/world.ts for the set.

  Fallbacks: no JS, reduced motion, or no WebGL → a still render
  (static/story/poster*.webp) with the chapters as readable text. If the GPU
  drops the context mid-film, the still fades back in and the captions carry on.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import RichText from '#lib/components/content/RichText.svelte';
	import type { Pricing, StoryCopy } from '#lib/content/types.ts';
	import { fill, listJoin } from '#lib/content/text.ts';

	let {
		copy,
		planCount,
		fromPrice,
		finishes
	}: {
		/** All the words of the film, from Sanity › Home page. */
		copy: StoryCopy;
		planCount: number;
		/** Pricing of the cheapest plan, for `{fromPrice}` (shown with its striked MRP). */
		fromPrice: Pricing | null;
		finishes: string[];
	} = $props();

	let vars = $derived({ plans: planCount, finishes: listJoin(finishes) });
	let chapters = $derived([
		{ k: '01', code: copy.heroCode, label: copy.heroLabel },
		...copy.chapters.map((c, i) => ({ k: `0${i + 2}`, code: c.code, label: c.label }))
	]);

	// The finishes of the four metal cards in the film, in the order they are modelled.
	const metalNames = ['Black', 'Silver', 'Gold', 'Rose Gold'];
	const words = (s: string) => s.split(' ');

	let section: HTMLElement;
	let canvas: HTMLCanvasElement;
	let active = $state(0);
	let ready = $state(false);
	let jumpTo: ((i: number) => void) | null = $state(null);

	/** Decodes text in like a terminal: random glyphs settle into the real string. */
	function scramble(el: HTMLElement | null, text: string) {
		if (!el) return;
		const glyphs = '!<>-_\\/[]{}—=+*^?#ABCDEFGHJKLMNOPRSTUVWXYZ0123456789';
		const start = performance.now();
		const dur = 520;
		const id = String(start);
		el.dataset.scramble = id;
		const step = (now: number) => {
			if (el.dataset.scramble !== id) return;
			const t = Math.min(1, (now - start) / dur);
			let out = '';
			for (let i = 0; i < text.length; i++) {
				const settle = i / text.length;
				out +=
					text[i] === ' ' || t > settle * 0.7 + 0.3
						? text[i]
						: glyphs[Math.floor(Math.random() * glyphs.length)];
			}
			el.textContent = out;
			if (t < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
	}

	onMount(() => {
		const html = document.documentElement;
		if (!html.classList.contains('motion')) return;

		let cancelled = false;
		let cleanup = () => {};

		(async () => {
			const probe = document.createElement('canvas');
			if (!probe.getContext('webgl2')) {
				html.classList.replace('motion', 'no-webgl');
				return;
			}
			try {
				const [{ gsap }, { ScrollTrigger }, { Vector3 }, world, script] = await Promise.all([
					import('gsap'),
					import('gsap/ScrollTrigger'),
					import('three'),
					import('./scene/world.ts'),
					import('./scene/script.ts')
				]);
				if (cancelled) return;
				const { createWorld, CARD_ANCHORS, ROLO_ANCHORS } = world;
				const { buildTimeline, CHAPTER_AT, CALLOUTS, STORY_LENGTH } = script;
				gsap.registerPlugin(ScrollTrigger);
				ScrollTrigger.config({ ignoreMobileResize: true });

				const lowPower =
					matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency ?? 8) <= 2;
				const w = await createWorld(canvas, lowPower ? 'low' : 'high');
				if (cancelled) return w.dispose();

				const q = <T extends Element = HTMLElement>(sel: string) =>
					Array.from(section.querySelectorAll<T & HTMLElement>(sel));
				const caps = q('[data-chapter]');
				const hint = section.querySelector<HTMLElement>('[data-hint]');
				const frameEl = section.querySelector<HTMLElement>('[data-frame]');
				const bar = section.querySelector<HTMLElement>('[data-bar]');
				const cardCallouts = q('[data-co]');
				const metalWrap = section.querySelector<HTMLElement>('[data-metal-labels]');
				const metalLabels = q('[data-metal]');
				const legacyCallouts = q('[data-legacy]');
				const legacyAnchors = legacyCallouts.map(
					(el) => ROLO_ANCHORS[el.dataset.legacy as keyof typeof ROLO_ANCHORS]
				);
				const anchors = cardCallouts.map(
					(el) => CARD_ANCHORS[el.dataset.co as keyof typeof CARD_ANCHORS]
				);

				let portrait = w.resize(canvas.clientWidth, canvas.clientHeight).portrait;
				let tl!: ReturnType<typeof buildTimeline>;
				let st: ReturnType<typeof ScrollTrigger.create>;

				/** Choreography + captions for the current orientation, bound to scroll. */
				function bind(progress = 0) {
					tl = buildTimeline(gsap, w, portrait);

					// Captions: words rise out of a mask, the rest focuses in; they leave upward.
					caps.forEach((c, i) => {
						const ws = Array.from(c.querySelectorAll('.wi'));
						const rest = Array.from(c.querySelectorAll('[data-fade]'));
						const at = CHAPTER_AT[i];
						const next = CHAPTER_AT[i + 1];
						if (i > 0) {
							gsap.set(c, { autoAlpha: 1 });
							tl.fromTo(
								ws,
								{ yPercent: 115, rotate: 3 },
								{ yPercent: 0, rotate: 0, duration: 0.5, ease: 'power3.out', stagger: 0.035 },
								at
							);
							tl.fromTo(
								rest,
								{ autoAlpha: 0, y: 18 },
								{
									autoAlpha: 1,
									y: 0,
									duration: 0.5,
									ease: 'power2.out',
									stagger: 0.08
								},
								at + 0.15
							);
						}
						if (next !== undefined) {
							if (i === 0) {
								tl.to(c, { autoAlpha: 0, y: -40, duration: 0.4, ease: 'power2.in' }, 0.3);
							} else {
								tl.to(
									ws,
									{ yPercent: -115, duration: 0.32, ease: 'power2.in', stagger: 0.02 },
									next - 0.42
								);
								tl.to(
									rest,
									{ autoAlpha: 0, y: -12, duration: 0.3, ease: 'power2.in' },
									next - 0.42
								);
							}
						}
					});

					// HUD callouts: lines draw out from the anchor, then the label.
					const [lIn, lOut] = CALLOUTS.legacy;
					tl.fromTo(
						legacyCallouts,
						{ autoAlpha: 0, '--draw': 0 },
						{ autoAlpha: 1, '--draw': 1, duration: 0.3, ease: 'power2.out', stagger: 0.14 },
						lIn
					);
					tl.to(legacyCallouts, { autoAlpha: 0, duration: 0.2, ease: 'power1.in' }, lOut);
					const [cIn, cOut] = CALLOUTS.card;
					tl.fromTo(
						cardCallouts,
						{ autoAlpha: 0, '--draw': 0 },
						{ autoAlpha: 1, '--draw': 1, duration: 0.35, ease: 'power2.out', stagger: 0.1 },
						cIn
					);
					tl.to(cardCallouts, { autoAlpha: 0, duration: 0.2, ease: 'power1.in' }, cOut);
					const [mIn, mOut] = CALLOUTS.metal;
					if (metalWrap) {
						tl.fromTo(metalWrap, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, mIn);
						tl.to(metalWrap, { autoAlpha: 0, duration: 0.25 }, mOut);
					}
					if (hint) tl.to(hint, { autoAlpha: 0, duration: 0.2 }, 0.05);

					tl.eventCallback('onUpdate', () => {
						const t = tl.time() + 0.25;
						let idx = 0;
						CHAPTER_AT.forEach((at, i) => t >= at && (idx = i));
						if (idx !== active) active = idx;
						const p = tl.progress();
						if (bar) bar.style.transform = `scaleX(${p})`;
						if (frameEl) frameEl.textContent = String(Math.round(p * 2880)).padStart(4, '0');
					});
					tl.progress(progress);
					st = ScrollTrigger.create({
						trigger: section,
						start: 'top top',
						end: 'bottom bottom',
						scrub: 1,
						animation: tl
					});
				}
				bind();

				// Render only while the story is on screen.
				let visible = true;
				// While the film is on screen, drop page effects it already provides (grain) or
				// that would re-blur the live canvas every frame (the header's backdrop blur).
				const io = new IntersectionObserver(([e]) => {
					visible = e.isIntersecting;
					html.classList.toggle('story-live', visible);
				});
				io.observe(section);

				let alive = true;
				const front = new Vector3(0, 0, 1);
				const LABEL_AT = new Vector3(0, 3.5, 0);
				const placeCallouts = () => {
					const t = tl.time();
					if (t > CALLOUTS.legacy[0] - 0.2 && t < CALLOUTS.legacy[1] + 0.4) {
						legacyCallouts.forEach((el, i) => {
							const p = w.project(w.wheel, legacyAnchors[i]);
							el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
						});
					}
					if (t > CALLOUTS.card[0] - 0.2 && t < CALLOUTS.card[1] + 0.4) {
						cardCallouts.forEach((el, i) => {
							const p = w.project(w.heroCard, anchors[i], front);
							el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
						});
					}
					if (t > CALLOUTS.metal[0] - 0.2 && t < CALLOUTS.metal[1] + 0.4) {
						metalLabels.forEach((el, i) => {
							const p = w.project(w.metals[i].children[0], LABEL_AT, front);
							el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
							el.style.opacity = String(Math.pow(p.facing, 3));
						});
					}
				};
				// At rest (no scroll, no pointer, timeline settled) only the slow idle drift
				// moves, so draw every other frame: it looks the same, and the GPU stays cool
				// enough to hold full speed when scrolling resumes (phones throttle when hot).
				let lastT = -1;
				let lastPointer = 0;
				let stillSince = 0;
				let frame = 0;
				const tick = (time: number) => {
					if (!alive || !visible || document.hidden) return;
					w.motion.velocity = st.getVelocity();
					const t = tl.time();
					const moving =
						t !== lastT ||
						Math.abs(w.motion.velocity) > 1 ||
						w.intro.t < 1 ||
						time - lastPointer < 1;
					lastT = t;
					if (moving) stillSince = time;
					const resting = time - stillSince > 0.6;
					if (resting && frame++ % 2) return;
					try {
						w.render(time, resting);
						placeCallouts();
					} catch (err) {
						console.error('[story] render failed, showing still image instead.', err);
						alive = false;
						ready = false;
					}
				};
				gsap.ticker.add(tick);

				const lost = (e: Event) => {
					e.preventDefault();
					alive = false;
					ready = false;
				};
				canvas.addEventListener('webglcontextlost', lost);

				const fine = matchMedia('(pointer: fine)').matches;
				const onPointer = (e: PointerEvent) => {
					lastPointer = gsap.ticker.time;
					w.pointer.x = (e.clientX / innerWidth - 0.5) * 2;
					w.pointer.y = (e.clientY / innerHeight - 0.5) * 2;
				};
				if (fine) addEventListener('pointermove', onPointer, { passive: true });

				const ro = new ResizeObserver(() => {
					const next = w.resize(canvas.clientWidth, canvas.clientHeight).portrait;
					if (next !== portrait) {
						portrait = next;
						const progress = tl.progress();
						st.kill();
						tl.kill();
						bind(progress);
					}
				});
				ro.observe(canvas);

				jumpTo = (i: number) => {
					const t = i === 0 ? 0 : CHAPTER_AT[i] + 0.55;
					window.scrollTo({
						top: st.start + (t / STORY_LENGTH) * (st.end - st.start),
						behavior: 'smooth'
					});
				};

				// Boot: particles gather into the card and a laser draws it — only from the top.
				let intro: ReturnType<typeof gsap.to> | null = null;
				if (tl.progress() < 0.02) {
					w.intro.t = 0;
					intro = gsap.to(w.intro, { t: 1, duration: 3.4, ease: 'power2.inOut', delay: 0.15 });
				}
				w.render(0);
				ready = true;
				// The opening is ready; get every later act ready in the background.
				w.prewarm().catch((err) => console.warn('[story] background warm-up skipped', err));

				cleanup = () => {
					gsap.ticker.remove(tick);
					intro?.kill();
					io.disconnect();
					html.classList.remove('story-live');
					ro.disconnect();
					canvas.removeEventListener('webglcontextlost', lost);
					removeEventListener('pointermove', onPointer);
					st.kill();
					tl.kill();
					const all = [
						caps,
						legacyCallouts,
						cardCallouts,
						metalLabels,
						q('.wi'),
						q('[data-fade]')
					].flat();
					gsap.set(all, { clearProps: 'all' });
					if (metalWrap) gsap.set(metalWrap, { clearProps: 'all' });
					w.dispose();
				};
			} catch (err) {
				console.error('[story] WebGL scene failed, showing still image instead.', err);
				html.classList.replace('motion', 'no-webgl');
			}
		})();

		return () => {
			cancelled = true;
			cleanup();
		};
	});

	let actNameEl: HTMLElement | undefined = $state();
	$effect(() => {
		scramble(actNameEl ?? null, chapters[active].code);
	});
</script>

<section bind:this={section} class="story relative" aria-labelledby="story-title">
	<a
		href="#plans"
		class="sr-only-focusable absolute top-24 left-4 z-40 rounded-full bg-signal px-4 py-2 font-semibold text-abyss"
	>
		Skip the story
	</a>

	<div class="story-sticky">
		<div class="story-bg" aria-hidden="true"></div>

		<div class="stage" aria-hidden="true">
			<picture class="poster" class:hide={ready}>
				<source media="(max-aspect-ratio: 1/1)" srcset="/story/poster-portrait.webp" />
				<img src="/story/poster.webp" alt="" width="1600" height="1000" fetchpriority="high" />
			</picture>
			<canvas bind:this={canvas} class="gl" class:show={ready}></canvas>
		</div>
		<div class="vignette" aria-hidden="true"></div>

		<!-- HUD: viewfinder chrome, live act readout, frame counter -->
		<div class="hud" aria-hidden="true">
			<i class="corner c-tl"></i><i class="corner c-tr"></i><i class="corner c-bl"></i><i
				class="corner c-br"
			></i>
			<div class="hud-top">
				<span class="rec"><i></i>Live</span>
				<span class="hud-sep"></span>
				<span>Act <b>{chapters[active].k}</b>/06</span>
				<span class="hud-sep"></span>
				<b class="act-name" bind:this={actNameEl}>{chapters[0].code}</b>
			</div>
			<div class="hud-side">
				<span>NLS · SIGNAL</span>
				<span>FRM <b data-frame>0000</b></span>
				<span>NFC 13.56 MHz</span>
			</div>
		</div>

		<!-- 3D-anchored callouts (positioned every frame from the scene) -->
		<div class="callouts" aria-hidden="true">
			<div class="co co-warn" data-legacy="runs" style="--sx: -1; --sy: 1">
				<i class="co-dot"></i>
				<span class="co-arm"><i class="co-l1"></i><i class="co-l2"></i></span>
				<span class="co-tag"><b>{copy.auditTags[0].title}</b>{copy.auditTags[0].detail}</span>
			</div>
			<div class="co co-warn" data-legacy="dated" style="--sx: 1; --sy: 1">
				<i class="co-dot"></i>
				<span class="co-arm"><i class="co-l1"></i><i class="co-l2"></i></span>
				<span class="co-tag"><b>{copy.auditTags[1].title}</b>{copy.auditTags[1].detail}</span>
			</div>
			<div class="co co-warn" data-legacy="lost" style="--sx: 1; --sy: -1">
				<i class="co-dot"></i>
				<span class="co-arm"><i class="co-l1"></i><i class="co-l2"></i></span>
				<span class="co-tag"><b>{copy.auditTags[2].title}</b>{copy.auditTags[2].detail}</span>
			</div>
			<div class="co" data-co="chip" style="--sx: -1; --sy: 1">
				<i class="co-dot"></i>
				<span class="co-arm"><i class="co-l1"></i><i class="co-l2"></i></span>
				<span class="co-tag"><b>{copy.cardCallouts[0].title}</b>{copy.cardCallouts[0].detail}</span>
			</div>
			<div class="co" data-co="brand" style="--sx: -1; --sy: -1">
				<i class="co-dot"></i>
				<span class="co-arm"><i class="co-l1"></i><i class="co-l2"></i></span>
				<span class="co-tag"><b>{copy.cardCallouts[1].title}</b>{copy.cardCallouts[1].detail}</span>
			</div>
			<div class="co" data-co="corner" style="--sx: -1; --sy: 1">
				<i class="co-dot"></i>
				<span class="co-arm"><i class="co-l1"></i><i class="co-l2"></i></span>
				<span class="co-tag"><b>{copy.cardCallouts[2].title}</b>{copy.cardCallouts[2].detail}</span>
			</div>
			<div class="metal-labels" data-metal-labels>
				{#each metalNames as name, i (name)}
					<div class="ml" data-metal={i}>
						<span class="ml-k">0{i + 1}</span>
						<span class="ml-name">{name}</span>
					</div>
				{/each}
			</div>
		</div>

		<ol class="chapters container-x">
			<li data-chapter class="chapter chapter-open">
				<p class="eyebrow animate-rise">
					<span class="eyebrow-dot"></span>{copy.eyebrow}
				</p>
				<h1 id="story-title" class="mt-5 text-[clamp(2.6rem,6.6vw,6rem)]">
					{#each copy.titleLines as line, i (i)}
						<span class="block animate-rise" style:animation-delay="{120 + i * 80}ms">{line}</span>
					{/each}
					<span
						class="text-gradient-violet block animate-rise"
						style:animation-delay="{120 + copy.titleLines.length * 80}ms"
					>
						<span class="serif-accent pr-[0.08em]">{copy.titleAccent}</span>
					</span>
				</h1>
				<p
					class="mt-6 max-w-md animate-rise text-base text-ink-muted [animation-delay:380ms] md:text-lg"
				>
					<RichText text={copy.intro} {vars} {fromPrice} />
				</p>
				<div class="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:480ms]">
					<Button href="#plans" size="lg">{copy.primaryCta}</Button>
					<Button href="/templates" size="lg" variant="outline">{copy.secondaryCta}</Button>
				</div>
			</li>
			{#each copy.chapters as c, i (i)}
				<li data-chapter class="chapter">
					<p class="chapter-k" data-fade>
						<span class="chapter-n">{chapters[i + 1].k}</span><i></i>{chapters[i + 1].label}
					</p>
					<h2>
						{#each words(fill(c.heading, vars)) as word, j (j)}<span class="w"
								><span class="wi">{word}</span></span
							><wbr />{/each}
					</h2>
					<p class="chapter-p" data-fade><RichText text={c.body} {vars} {fromPrice} /></p>
					{#if i === copy.chapters.length - 1}
						<div class="mt-7" data-fade>
							<Button href="#plans" size="lg">{copy.closingCta}</Button>
						</div>
					{/if}
				</li>
			{/each}
		</ol>

		<div class="hint" data-hint aria-hidden="true">
			<span class="mouse"><i></i></span><span>Scroll to begin</span>
		</div>

		{#if jumpTo}
			<nav class="scrub" aria-label="Story chapters">
				<div class="scrub-track" aria-hidden="true"><i data-bar></i></div>
				{#each chapters as c, i (c.k)}
					<button
						type="button"
						class="scrub-btn"
						aria-current={active === i ? 'step' : undefined}
						onclick={() => jumpTo?.(i)}
					>
						<span class="scrub-k">{c.k}</span>
						<span class="scrub-label">{c.label}</span>
					</button>
				{/each}
			</nav>
		{/if}
	</div>
</section>

<style>
	.story-bg {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(75% 70% at 64% 48%, rgb(74 0 149 / 0.4), transparent 70%),
			linear-gradient(180deg, #120026 0%, var(--color-abyss) 55%, #0e001a 100%);
	}
	.vignette {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(120% 90% at 60% 45%, transparent 55%, rgb(8 0 16 / 0.5) 100%);
	}
	.stage {
		position: absolute;
		inset: 0;
	}
	.gl,
	.poster,
	.poster img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.poster img {
		object-fit: cover;
	}
	.gl {
		opacity: 0;
		transition: opacity 1.2s var(--ease-out-expo);
	}
	.gl.show {
		opacity: 1;
	}
	.poster {
		transition: opacity 1.2s var(--ease-out-expo);
	}
	.poster.hide {
		opacity: 0;
	}

	/* ───────── Captions ───────── */
	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
	}
	.eyebrow-dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: var(--color-signal);
		box-shadow: 0 0 12px var(--color-signal);
	}
	.chapter h2 {
		margin-top: 1rem;
		font-size: clamp(2.1rem, 4.4vw, 3.9rem);
		line-height: 1.02;
	}
	/* Words are spaced by margin (a <wbr> between them keeps lines breaking). */
	.w {
		display: inline-block;
		margin-right: 0.24em;
		overflow: hidden;
		vertical-align: top;
		padding-bottom: 0.12em;
		margin-bottom: -0.12em;
	}
	.wi {
		display: inline-block;
		transform-origin: 0 100%;
	}
	.chapter-p {
		margin-top: 1.1rem;
		max-width: 27rem;
		color: var(--color-ink-muted);
	}
	.chapter-k {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--color-violet-300);
	}
	.chapter-k i {
		width: 2.5rem;
		height: 1px;
		background: linear-gradient(90deg, var(--color-signal), transparent);
	}
	.chapter-n {
		color: var(--color-ink);
	}

	:global(html.story-live .grain::after) {
		display: none;
	}
	:global(html.story-live header.fixed),
	:global(html.story-live header .bar.glass) {
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}
	/* No backdrop blur over the live film (it would re-blur the canvas every frame):
	   the header capsule keeps its glass rim and sheen on a deeper tint instead.
	   (The mobile menu keeps its blur — it is open only briefly and must hide the copy.) */
	:global(html.story-live header .bar.glass) {
		background-color: rgb(25 0 48 / 0.55);
	}

	/* ───────── Cinematic mode ───────── */
	:global(html.motion) .story {
		height: 720svh;
	}
	:global(html.motion) .story-sticky {
		position: sticky;
		top: 0;
		height: 100svh;
		overflow: hidden;
	}
	:global(html.motion) .chapters {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	:global(html.motion) .chapter {
		position: absolute;
		left: var(--gutter);
		bottom: clamp(5.5rem, 15vh, 9rem);
		max-width: min(36rem, 42vw);
		pointer-events: auto;
	}
	:global(html.motion) .chapter:not(.chapter-open) {
		opacity: 0;
		visibility: hidden;
	}
	/* Everything the timeline moves gets its own compositor layer, rasterised once at
	   load: otherwise big type is re-rasterised on every frame it moves (and the first
	   move stalls the GPU), which on 3× phone screens is the costliest part of a frame. */
	:global(html.motion) .chapter-open,
	:global(html.motion) .wi,
	:global(html.motion) [data-fade] {
		will-change: transform, opacity;
	}
	/* Centred in the band between the HUD readout and the scrubber, never over them;
	   the headline also scales with viewport height so short screens still fit. */
	:global(html.motion) .chapter-open {
		top: calc(var(--header-h) + 3rem);
		bottom: 5rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		max-width: min(44rem, 50vw);
	}
	:global(html.motion) .chapter-open h1 {
		font-size: clamp(2.4rem, min(6.6vw, 9.5svh), 6rem);
	}
	@media (max-width: 1023.98px) {
		:global(html.motion) .story {
			height: 640svh;
		}
		:global(html.motion) .chapter,
		:global(html.motion) .chapter-open {
			top: auto;
			translate: none;
			bottom: max(4.25rem, calc(env(safe-area-inset-bottom) + 3.5rem));
			right: var(--gutter);
			max-width: 40rem;
		}
		:global(html.motion) .chapter-open h1 {
			font-size: clamp(2.1rem, min(10vw, 5.2svh), 4.4rem);
			margin-top: 0;
		}
		/* Keep the opening copy short so the card above it never sits behind it: the
		   brand line is already in the header, and the two buttons share one row. */
		:global(html.motion) .chapter-open .eyebrow {
			display: none;
		}
		:global(html.motion) .chapter-open p {
			margin-top: 1rem;
		}
		:global(html.motion) .chapter-open .mt-8 {
			margin-top: 1.25rem;
			flex-wrap: nowrap;
			gap: 0.6rem;
		}
		:global(html.motion) .chapter-open .mt-8 > :global(a) {
			min-height: 3rem;
			padding-inline: 1.15rem;
			font-size: 0.9rem;
			white-space: nowrap;
		}
		:global(html.motion) .chapter h2 {
			font-size: clamp(1.8rem, 7.5vw, 3rem);
		}
		/* Darken behind captions so they stay legible over the film. */
		:global(html.motion) .vignette {
			background: linear-gradient(180deg, transparent 42%, rgb(12 0 22 / 0.88) 80%);
		}
	}

	/* ───────── Static mode: no JS, reduced motion, or no WebGL ───────── */
	:global(html:not(.motion)) .story-sticky {
		position: relative;
		display: flex;
		flex-direction: column;
		padding-top: var(--header-h);
		padding-bottom: 4rem;
	}
	/* z-index: flex `order` also changes paint order. */
	:global(html:not(.motion)) .stage {
		position: relative;
		z-index: 1;
		inset: auto;
		order: -1;
		aspect-ratio: 16 / 10;
		max-height: 70vh;
		width: 100%;
	}
	:global(html:not(.motion)) .gl,
	:global(html:not(.motion)) .hint,
	:global(html:not(.motion)) .hud,
	:global(html:not(.motion)) .callouts {
		display: none;
	}
	:global(html:not(.motion)) .chapters {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 2.5rem;
	}
	:global(html:not(.motion)) .chapter:not(.chapter-open) h2 {
		font-size: clamp(1.5rem, 2.6vw, 2.1rem);
	}
	:global(html:not(.motion)) .animate-rise {
		animation: none;
	}
	@media (min-width: 900px) {
		:global(html:not(.motion)) .chapters {
			grid-template-columns: repeat(5, 1fr);
		}
		:global(html:not(.motion)) .chapter-open {
			grid-column: 1 / -1;
			max-width: 46rem;
		}
	}

	/* ───────── HUD ───────── */
	.hud {
		position: absolute;
		inset: 0;
		pointer-events: none;
		font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;
		font-size: 0.66rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-ink-subtle);
	}
	.hud b {
		font-weight: 600;
		color: var(--color-ink);
	}
	.corner {
		position: absolute;
		width: 1.1rem;
		height: 1.1rem;
		border: 0 solid rgb(255 255 255 / 0.32);
	}
	.c-tl {
		top: calc(var(--header-h) + 0.75rem);
		left: 1rem;
		border-top-width: 1px;
		border-left-width: 1px;
	}
	.c-tr {
		top: calc(var(--header-h) + 0.75rem);
		right: 1rem;
		border-top-width: 1px;
		border-right-width: 1px;
	}
	.c-bl {
		bottom: 1rem;
		left: 1rem;
		border-bottom-width: 1px;
		border-left-width: 1px;
	}
	.c-br {
		bottom: 1rem;
		right: 1rem;
		border-bottom-width: 1px;
		border-right-width: 1px;
	}
	.hud-top {
		position: absolute;
		top: calc(var(--header-h) + 1.1rem);
		left: var(--gutter);
		display: flex;
		align-items: center;
		gap: 0.85rem;
		white-space: nowrap;
	}
	.hud-sep {
		width: 1.5rem;
		height: 1px;
		background: rgb(255 255 255 / 0.2);
	}
	.act-name {
		min-width: 12ch;
		color: var(--color-violet-300) !important;
	}
	.rec {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--color-ink);
	}
	.rec i {
		width: 0.42rem;
		height: 0.42rem;
		border-radius: 50%;
		background: var(--color-signal);
		box-shadow: 0 0 10px var(--color-signal);
		animation: blink 1.6s steps(2, jump-none) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0.25;
		}
	}
	.hud-side {
		position: absolute;
		right: var(--gutter);
		top: calc(var(--header-h) + 1.1rem);
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
		font-variant-numeric: tabular-nums;
	}
	@media (max-width: 1023.98px) {
		.hud-side,
		.hud-top .hud-sep:last-of-type,
		.act-name {
			display: none;
		}
	}

	/* ───────── Callouts ───────── */
	.callouts {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.co {
		--draw: 0;
		position: absolute;
		left: 0;
		top: 0;
		visibility: hidden;
		opacity: 0;
		will-change: transform;
	}
	.co-dot {
		position: absolute;
		left: -5px;
		top: -5px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-ink);
		box-shadow:
			0 0 0 4px rgb(179 113 243 / 0.35),
			0 0 18px var(--color-violet-400);
	}
	.co-dot::after {
		content: '';
		position: absolute;
		inset: -10px;
		border-radius: 50%;
		border: 1px solid var(--color-violet-300);
		animation: ping 1.8s var(--ease-out-expo) infinite;
	}
	@keyframes ping {
		from {
			scale: 0.4;
			opacity: 1;
		}
		to {
			scale: 1.8;
			opacity: 0;
		}
	}
	/* Audit tags (act 02) flag problems: signal pink instead of violet. */
	.co-warn .co-dot {
		background: var(--color-signal);
		box-shadow:
			0 0 0 4px rgb(255 73 134 / 0.3),
			0 0 18px var(--color-signal);
	}
	.co-warn .co-dot::after {
		border-color: var(--color-signal);
	}
	.co-warn .co-l1,
	.co-warn .co-l2 {
		background: rgb(255 140 180 / 0.8);
	}
	.co-warn .co-tag {
		border-color: rgb(255 73 134 / 0.35);
	}
	.co-warn .co-tag b {
		color: var(--color-signal-hover);
	}
	/* The arm is drawn in the up-right quadrant and flipped into place. */
	.co-arm {
		position: absolute;
		left: 0;
		top: 0;
		transform: scale(var(--sx), var(--sy));
	}
	.co-l1,
	.co-l2 {
		position: absolute;
		height: 1px;
		background: rgb(230 205 254 / 0.75);
		transform-origin: 0 50%;
	}
	.co-l1 {
		left: 0;
		top: 0;
		width: 45px;
		transform: rotate(-45deg) scaleX(min(1, calc(var(--draw) * 2)));
	}
	.co-l2 {
		left: 32px;
		top: -32px;
		width: 56px;
		transform: scaleX(max(0, calc(var(--draw) * 2 - 1)));
	}
	.co-tag {
		position: absolute;
		left: calc(var(--sx) * 96px);
		top: calc(var(--sy) * -32px);
		transform: translate(calc((var(--sx) - 1) * 50%), -50%);
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.5rem 0.75rem;
		white-space: nowrap;
		border: 1px solid rgb(255 255 255 / 0.14);
		border-radius: 0.6rem;
		background: rgb(25 0 48 / 0.82);
		font-size: 0.78rem;
		color: var(--color-ink-muted);
		opacity: calc(var(--draw) * 3 - 2);
	}
	.co-tag b {
		font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-ink);
	}
	@media (max-width: 767.98px) {
		.co {
			display: none;
		}
	}
	.metal-labels {
		position: absolute;
		inset: 0;
		visibility: hidden;
		opacity: 0;
	}
	.ml {
		position: absolute;
		left: 0;
		top: 0;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		translate: -50% -100%;
		padding: 0.4rem 0.8rem;
		border: 1px solid rgb(255 255 255 / 0.16);
		border-radius: 999px;
		background: rgb(25 0 48 / 0.78);
		white-space: nowrap;
		will-change: transform, opacity;
	}
	.ml-k {
		font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;
		font-size: 0.62rem;
		letter-spacing: 0.16em;
		color: var(--color-violet-300);
	}
	.ml-name {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--color-ink);
	}

	/* ───────── Scroll hint ───────── */
	.hint {
		position: absolute;
		left: 50%;
		bottom: 5.5rem;
		translate: -50% 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
		font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;
		font-size: 0.64rem;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--color-ink-subtle);
	}
	.mouse {
		width: 1.35rem;
		height: 2.1rem;
		border: 1px solid rgb(255 255 255 / 0.35);
		border-radius: 1rem;
		display: grid;
		justify-items: center;
		padding-top: 0.35rem;
	}
	.mouse i {
		width: 2px;
		height: 0.45rem;
		border-radius: 1px;
		background: var(--color-violet-300);
		animation: wheel 1.8s var(--ease-in-out-quint) infinite;
	}
	@keyframes wheel {
		0% {
			translate: 0 0;
			opacity: 0;
		}
		30% {
			opacity: 1;
		}
		100% {
			translate: 0 0.7rem;
			opacity: 0;
		}
	}
	@media (max-width: 1023.98px) {
		.hint {
			display: none;
		}
	}

	/* ───────── Chapter scrubber ───────── */
	.scrub {
		position: absolute;
		left: var(--gutter);
		right: var(--gutter);
		bottom: 1.4rem;
		z-index: 5;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
	}
	.scrub-track {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 1px;
		background: rgb(255 255 255 / 0.14);
	}
	.scrub-track i {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, var(--color-violet-400), var(--color-signal));
		box-shadow: 0 0 10px var(--color-signal);
		transform-origin: 0 50%;
		transform: scaleX(0);
		will-change: transform;
	}
	.scrub-btn {
		position: relative;
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		min-height: 2.75rem;
		padding-top: 0.8rem;
		text-align: left;
		font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;
		font-size: 0.66rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-ink-subtle);
		transition: color 0.4s;
	}
	.scrub-btn::before {
		content: '';
		position: absolute;
		left: 0;
		top: -3px;
		width: 1px;
		height: 7px;
		background: rgb(255 255 255 / 0.4);
	}
	.scrub-btn:hover,
	.scrub-btn:focus-visible,
	.scrub-btn[aria-current] {
		color: var(--color-ink);
	}
	.scrub-btn[aria-current] .scrub-k {
		color: var(--color-signal);
	}
	@media (max-width: 1023.98px) {
		.scrub {
			bottom: max(0.5rem, env(safe-area-inset-bottom));
		}
		.scrub-label {
			display: none;
		}
		.scrub-btn {
			justify-content: center;
		}
		.scrub-btn::before {
			left: 50%;
		}
		.c-bl,
		.c-br {
			display: none;
		}
	}
</style>
