<!--
  Illustrative microsite on a phone — what someone sees after a tap or scan.
  Uses placeholder identity ("Your Name"); the rows are decorative, not links.
-->
<script lang="ts">
	import Mark from '#lib/components/brand/Mark.svelte';
	let { class: klass = '', style = '' }: { class?: string; style?: string } = $props();

	const rows = [
		{ k: 'Call', v: '+91 ·· ···· ····' },
		{ k: 'Email', v: 'you@company.com' },
		{ k: 'Website', v: 'yourwebsite.com' },
		{ k: 'Location', v: 'Your city' }
	];
</script>

<div class="phone {klass}" {style} aria-hidden="true">
	<div class="screen">
		<div
			class="flex items-center justify-between px-[7%] pt-[6%] text-[0.62em] font-semibold text-white/70"
		>
			<span>11:11</span>
			<span class="h-[0.9em] w-[28%] rounded-full bg-black"></span>
			<span>●●●</span>
		</div>
		<div class="cover"></div>
		<div class="-mt-[17%] flex flex-col items-center px-[8%] text-center">
			<div class="avatar" data-phone-item>YN</div>
			<div
				class="mt-[4%] font-display text-[1.25em] font-semibold tracking-[-0.02em] text-white"
				data-phone-item
			>
				Your Name
			</div>
			<div class="text-[0.7em] text-violet-200/80" data-phone-item>Founder · Your Company</div>
			<div class="mt-[6%] grid w-full grid-cols-2 gap-[4%]" data-phone-item>
				<span class="pill bg-signal text-abyss">Save contact</span>
				<span class="pill border border-white/20 text-white">Share</span>
			</div>
			<ul class="mt-[6%] w-full space-y-[3%] text-left">
				{#each rows as r (r.k)}
					<li class="row" data-phone-item>
						<span class="text-[0.6em] tracking-[0.12em] text-violet-300 uppercase">{r.k}</span>
						<span class="text-[0.72em] text-white/85">{r.v}</span>
					</li>
				{/each}
			</ul>
			<div
				class="mt-[7%] flex items-center gap-[0.4em] text-[0.55em] text-white/45"
				data-phone-item
			>
				<Mark class="h-[1.4em] w-auto" /> Novus Link Socio
			</div>
		</div>
	</div>
</div>

<style>
	.phone {
		aspect-ratio: 9 / 19;
		border-radius: 14% / 6.6%;
		padding: 3.2%;
		background: linear-gradient(160deg, #3b3346, #120e18 60%, #2a2333);
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.12),
			0 40px 80px -30px rgb(0 0 0 / 0.9),
			0 0 120px -40px var(--color-violet-500);
		container-type: inline-size;
	}
	.screen {
		height: 100%;
		border-radius: 11.5% / 5.4%;
		overflow: hidden;
		background: linear-gradient(180deg, #2a0754 0%, var(--color-abyss) 55%);
		font-size: 6.4cqw;
	}
	.cover {
		margin-top: 6%;
		height: 22%;
		background:
			radial-gradient(80% 120% at 20% 0%, var(--color-violet-500), transparent 60%),
			radial-gradient(60% 100% at 90% 30%, var(--color-signal), transparent 60%),
			var(--color-violet-800);
		opacity: 0.85;
	}
	.avatar {
		width: 30%;
		aspect-ratio: 1;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1.1em;
		color: var(--color-abyss);
		background: linear-gradient(140deg, var(--color-violet-200), var(--color-violet-400));
		box-shadow: 0 0 0 0.25em var(--color-abyss);
	}
	.pill {
		border-radius: 999px;
		padding: 0.55em 0;
		font-size: 0.62em;
		font-weight: 700;
	}
	.row {
		display: flex;
		flex-direction: column;
		gap: 0.1em;
		padding: 0.5em 0.7em;
		border-radius: 0.6em;
		background: rgb(255 255 255 / 0.05);
		border: 1px solid rgb(255 255 255 / 0.07);
	}
</style>
