<script lang="ts">
	import Mark from './Mark.svelte';

	let { class: klass = '', tagline = true }: { class?: string; tagline?: boolean } = $props();
</script>

<span class="inline-flex items-center gap-2.5 {klass}">
	<Mark class="h-[1.9em] w-auto shrink-0" />
	<span class="flex flex-col leading-none">
		<span class="font-display text-[1.05em] font-semibold tracking-[-0.02em] whitespace-nowrap">
			Novus Link Socio
		</span>
		{#if tagline}
			<span
				class="mt-[0.3em] text-[0.62em] font-medium tracking-[0.02em] whitespace-nowrap opacity-75"
			>
				Your Digital Identity
			</span>
		{/if}
	</span>
</span>
