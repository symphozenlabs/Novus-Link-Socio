<script lang="ts">
	let { class: klass = '' }: { class?: string } = $props();
</script>

<svg
	viewBox="0 0 24 24"
	class={klass}
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	aria-hidden="true"
>
	<path d="M7.5 7.5a6.4 6.4 0 0 1 0 9" />
	<path d="M11 5a10 10 0 0 1 0 14" />
	<path d="M14.5 2.8a13.4 13.4 0 0 1 0 18.4" />
	<circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
</svg>
