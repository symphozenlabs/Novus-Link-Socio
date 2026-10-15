<script lang="ts">
	import NfcWaves from './NfcWaves.svelte';
	let { class: klass = '' }: { class?: string } = $props();
</script>

<div class="keychain {klass}" aria-hidden="true">
	<div class="ring"></div>
	<div class="disc">
		<NfcWaves class="h-[38%] w-[38%] text-black/25" />
	</div>
</div>

<style>
	.keychain {
		position: relative;
		aspect-ratio: 1 / 1.25;
	}
	.ring {
		position: absolute;
		top: 0;
		left: 50%;
		width: 42%;
		aspect-ratio: 1;
		translate: -50% 0;
		border-radius: 50%;
		border: 0.32em solid #cfd3d9;
		box-shadow:
			inset 0 1px 1px rgb(255 255 255 / 0.7),
			0 2px 6px rgb(0 0 0 / 0.35);
		font-size: clamp(4px, 1.6vw, 9px);
	}
	.disc {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		aspect-ratio: 1;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 32% 28%, #ffffff 0%, transparent 42%),
			radial-gradient(circle at 50% 50%, #e9ebee 0%, #b7bcc4 70%, #8e949d 100%);
		box-shadow:
			inset 0 0 0 0.35em #c5c9cf,
			inset 0 0 0 0.5em #eef0f2,
			inset 0 -6px 14px rgb(0 0 0 / 0.18),
			0 24px 40px -18px rgb(0 0 0 / 0.8);
		font-size: clamp(4px, 1.4vw, 10px);
	}
</style>
