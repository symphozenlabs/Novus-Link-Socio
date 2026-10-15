<!--
  Picks the right rendering for a plan: the Sanity photo when one exists,
  otherwise a CSS composition of the physical product(s) in that plan.
-->
<script lang="ts">
	import type { Product } from '#lib/content/types.ts';
	import IdentityCard from './IdentityCard.svelte';
	import Keychain from './Keychain.svelte';
	import PhoneProfile from './PhoneProfile.svelte';

	let { product, class: klass = '' }: { product: Product; class?: string } = $props();
	let v = $derived(product.visual);
</script>

<div class="visual relative grid place-items-center {klass}">
	{#if product.imageSrc}
		<img
			src={product.imageSrc}
			alt={product.imageAlt ?? `${product.name} by Novus Link Socio`}
			class="max-h-full w-auto object-contain"
			loading="lazy"
			decoding="async"
		/>
	{:else if v === 'keychain'}
		<div class="flex w-full items-end justify-center gap-[6%]">
			<Keychain class="w-[30%] -rotate-12" />
			<Keychain class="w-[24%] translate-y-[8%] rotate-[18deg] opacity-80" />
		</div>
	{:else if v === 'keychain-card'}
		<div class="relative w-full">
			<IdentityCard class="w-[78%] -rotate-[8deg]" face="back" />
			<Keychain class="absolute right-[2%] -bottom-[6%] w-[30%] rotate-12" />
		</div>
	{:else if v === 'qr-card'}
		<div class="relative w-full">
			<IdentityCard
				class="absolute top-[6%] left-[16%] w-[76%] rotate-[6deg] opacity-70"
				finish="paper"
			/>
			<IdentityCard class="relative w-[76%] -rotate-[5deg]" face="back" />
		</div>
	{:else if v === 'nfc-card'}
		<div class="relative w-full">
			<IdentityCard class="absolute top-[4%] left-[18%] w-[74%] rotate-[7deg]" face="back" />
			<IdentityCard class="relative w-[74%] -rotate-[6deg]" />
		</div>
	{:else if v === 'nfc-card-profile' || v === 'nfc-card-profiles-2' || v === 'nfc-card-profiles-3'}
		{@const phones = v === 'nfc-card-profiles-3' ? 3 : v === 'nfc-card-profiles-2' ? 2 : 1}
		<div class="relative flex w-full items-center">
			<IdentityCard class="w-[66%] -rotate-[10deg]" />
			{#each { length: phones }, i (i)}
				<PhoneProfile
					class="absolute w-[28%]"
					style="right:{4 + (phones - 1 - i) * 9}%; rotate:{6 -
						(phones - 1 - i) * 7}deg; translate:0 {(phones - 1 - i) * -4}%; opacity:{1 -
						(phones - 1 - i) * 0.25}"
				/>
			{/each}
		</div>
	{:else}
		{@const finish = v === 'metal-gold' ? 'gold' : v === 'metal-rose' ? 'rose' : 'silver'}
		<div class="relative w-full">
			<IdentityCard
				class="absolute top-[3%] left-[20%] w-[72%] rotate-[8deg]"
				finish="black"
				face="back"
			/>
			<IdentityCard class="relative w-[72%] -rotate-[7deg]" {finish} />
		</div>
	{/if}
</div>
