<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import PageHero from '#lib/components/layout/PageHero.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Headline from '#lib/components/content/Headline.svelte';
	import { fill } from '#lib/content/text.ts';
	import { priceText } from '#lib/pricing.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	type Values = {
		name: string;
		phone: string;
		email: string;
		plan: string;
		template: string;
		quantity: number;
		message: string;
		topic: string;
	};
	type Errors = Partial<Record<keyof Values, string>>;

	let pending = $state(false);
	let statusEl: HTMLElement | undefined = $state();

	let values = $derived<Partial<Values>>(form && 'values' in form ? (form.values as Values) : {});
	let errors = $derived<Errors>(form && 'errors' in form ? (form.errors as Errors) : {});
	let offline = $derived(!!(form && 'offline' in form && form.offline));
	let saveFailed = $derived(!!(form && 'saveFailed' in form && form.saveFailed));
	let success = $derived(!!(form && 'success' in form && form.success));

	const q = page.url.searchParams;
	const topic = q.get('topic') ?? '';
	const initialPlan = q.get('plan') ?? '';
	const initialTemplate = q.get('template') ?? '';
	const initialMessage =
		topic === 'custom'
			? "I'd like a custom card theme. Here's my idea: "
			: topic === 'experiences'
				? "I'm interested in an enhanced experience (invitations / resume card / feedback cards / smart menu): "
				: '';

	const everyday = $derived(data.plans.filter((p) => p.line === 'everyday'));
	const metal = $derived(data.plans.filter((p) => p.line === 'metal'));
	// An <option> can't show a strike, so a live offer reads "₹199 (was ₹249)".
	const label = (p: (typeof data.plans)[number]) => `${p.name} — ${priceText(p.pricing)}`;
	let vars = $derived({ phone: data.settings.phoneDisplay });

	const field =
		'glass-input mt-2 block w-full min-h-12 rounded-2xl border px-4 py-3 text-ink placeholder:text-ink-subtle transition-[border-color,background-color,box-shadow] focus:border-violet-400 focus:bg-white/[0.07] focus:outline-none';
	const ok = 'border-white/10';
	const bad = 'border-error';
</script>

<svelte:head>
	<title>{fill(data.page.seo.title, vars)}</title>
	<meta name="description" content={fill(data.page.seo.description, vars)} />
	<meta property="og:title" content={fill(data.page.seo.title, vars)} />
</svelte:head>

<PageHero
	eyebrow={data.page.hero.eyebrow}
	lead={(data.page.hero.lead ?? data.settings.orderingNote) || undefined}
>
	{#snippet title()}
		<Headline value={data.page.hero.title} {vars} />
	{/snippet}
</PageHero>

<section class="pb-28" aria-label="Enquiry">
	<div class="container-x grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
		<div class="glass lens rounded-[2rem] p-6 sm:p-10">
			{#if success}
				<div
					bind:this={statusEl}
					tabindex="-1"
					role="status"
					class="py-10 text-center outline-none"
				>
					<div
						class="mx-auto grid size-16 place-items-center rounded-full bg-success/15 text-success"
						aria-hidden="true"
					>
						<svg
							viewBox="0 0 24 24"
							class="size-8"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg
						>
					</div>
					<h2 class="mt-6 text-4xl">
						{data.page.successTitle}{form && 'name' in form && form.name ? `, ${form.name}` : ''}.
					</h2>
					<p class="mx-auto mt-3 max-w-md text-ink-muted">
						{data.page.successBody}
					</p>
					<div class="mt-8 flex flex-wrap justify-center gap-3">
						<Button href="/templates" variant="outline">Browse more designs</Button>
						<Button href="/">Back to home</Button>
					</div>
				</div>
			{:else}
				<form
					method="POST"
					novalidate
					use:enhance={() => {
						pending = true;
						return async ({ update }) => {
							await update({ reset: false });
							pending = false;
							await tick();
							(statusEl ?? document.querySelector<HTMLElement>('[aria-invalid="true"]'))?.focus();
						};
					}}
				>
					<h2 class="text-3xl md:text-4xl">{data.page.formTitle}</h2>
					<p class="mt-2 text-sm text-ink-muted">
						Fields marked <span aria-hidden="true">*</span><span class="sr-only"
							>with an asterisk</span
						> are required.
					</p>

					{#if offline}
						<div
							bind:this={statusEl}
							tabindex="-1"
							role="alert"
							class="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-5 outline-none"
						>
							<p class="font-semibold text-warning">Online enquiries aren't switched on yet.</p>
							<p class="mt-1 text-sm text-ink-muted">
								Your details are still filled in below. Please call us and we'll take your order
								directly.
							</p>
							<a
								href="tel:{data.settings.phone}"
								class="mt-3 inline-flex min-h-11 items-center rounded-full bg-signal px-5 font-semibold text-abyss"
							>
								Call {data.settings.phoneDisplay}
							</a>
						</div>
					{:else if saveFailed}
						<div
							bind:this={statusEl}
							tabindex="-1"
							role="alert"
							class="mt-6 rounded-2xl border border-error/40 bg-error/10 p-5 outline-none"
						>
							<p class="font-semibold text-error">Something went wrong sending your enquiry.</p>
							<p class="mt-1 text-sm text-ink-muted">
								Please try again, or call <a class="underline" href="tel:{data.settings.phone}"
									>{data.settings.phoneDisplay}</a
								>.
							</p>
						</div>
					{:else if Object.keys(errors).length}
						<div
							bind:this={statusEl}
							tabindex="-1"
							role="alert"
							class="mt-6 rounded-2xl border border-error/40 bg-error/10 p-4 text-sm text-error outline-none"
						>
							Please fix {Object.keys(errors).length === 1
								? 'the highlighted field'
								: `the ${Object.keys(errors).length} highlighted fields`}.
						</div>
					{/if}

					<input type="hidden" name="topic" value={values.topic ?? topic} />
					<div class="hidden" aria-hidden="true">
						<label>Website <input name="website" tabindex="-1" autocomplete="off" /></label>
					</div>

					<div class="mt-8 grid gap-6 sm:grid-cols-2">
						<div>
							<label for="name" class="text-sm font-semibold"
								>Name <span aria-hidden="true" class="text-signal">*</span></label
							>
							<input
								id="name"
								name="name"
								autocomplete="name"
								required
								value={values.name ?? ''}
								class="{field} {errors.name ? bad : ok}"
								aria-invalid={errors.name ? 'true' : undefined}
								aria-describedby={errors.name ? 'name-err' : undefined}
							/>
							{#if errors.name}<p id="name-err" class="mt-2 text-sm text-error">
									{errors.name}
								</p>{/if}
						</div>
						<div>
							<label for="phone" class="text-sm font-semibold"
								>Mobile number <span aria-hidden="true" class="text-signal">*</span></label
							>
							<input
								id="phone"
								name="phone"
								type="tel"
								inputmode="tel"
								autocomplete="tel"
								required
								placeholder="+91 98765 43210"
								value={values.phone ?? ''}
								class="{field} {errors.phone ? bad : ok}"
								aria-invalid={errors.phone ? 'true' : undefined}
								aria-describedby={errors.phone ? 'phone-err' : undefined}
							/>
							{#if errors.phone}<p id="phone-err" class="mt-2 text-sm text-error">
									{errors.phone}
								</p>{/if}
						</div>
						<div class="sm:col-span-2">
							<label for="email" class="text-sm font-semibold"
								>Email <span class="font-normal text-ink-subtle">(optional)</span></label
							>
							<input
								id="email"
								name="email"
								type="email"
								autocomplete="email"
								value={values.email ?? ''}
								class="{field} {errors.email ? bad : ok}"
								aria-invalid={errors.email ? 'true' : undefined}
								aria-describedby={errors.email ? 'email-err' : undefined}
							/>
							{#if errors.email}<p id="email-err" class="mt-2 text-sm text-error">
									{errors.email}
								</p>{/if}
						</div>
						<div>
							<label for="plan" class="text-sm font-semibold">Plan</label>
							<select
								id="plan"
								name="plan"
								class="{field} {errors.plan ? bad : ok} appearance-none pr-10"
								aria-invalid={errors.plan ? 'true' : undefined}
								aria-describedby={errors.plan ? 'plan-err' : undefined}
							>
								<option
									value="not-sure"
									selected={(values.plan ?? initialPlan) === '' ||
										(values.plan ?? initialPlan) === 'not-sure'}
									>Not sure yet — help me choose</option
								>
								<optgroup label="Everyday">
									{#each everyday as p (p.slug)}<option
											value={p.slug}
											selected={(values.plan ?? initialPlan) === p.slug}>{label(p)}</option
										>{/each}
								</optgroup>
								{#if metal.length}
									<optgroup label="Metal">
										{#each metal as p (p.slug)}<option
												value={p.slug}
												selected={(values.plan ?? initialPlan) === p.slug}>{label(p)}</option
											>{/each}
									</optgroup>
								{/if}
							</select>
							{#if errors.plan}<p id="plan-err" class="mt-2 text-sm text-error">
									{errors.plan}
								</p>{/if}
						</div>
						<div class="grid grid-cols-[1fr_6.5rem] gap-4">
							<div>
								<label for="template" class="text-sm font-semibold"
									>Design code <span class="font-normal text-ink-subtle">(optional)</span></label
								>
								<input
									id="template"
									name="template"
									placeholder="e.g. NLST-22"
									value={values.template ?? initialTemplate}
									class="{field} {errors.template ? bad : ok} uppercase"
									aria-invalid={errors.template ? 'true' : undefined}
									aria-describedby="template-hint{errors.template ? ' template-err' : ''}"
								/>
							</div>
							<div>
								<label for="quantity" class="text-sm font-semibold">Qty</label>
								<input
									id="quantity"
									name="quantity"
									type="number"
									inputmode="numeric"
									min="1"
									max="500"
									value={values.quantity ?? 1}
									class="{field} {errors.quantity ? bad : ok}"
									aria-invalid={errors.quantity ? 'true' : undefined}
									aria-describedby={errors.quantity ? 'quantity-err' : undefined}
								/>
							</div>
							<p id="template-hint" class="col-span-2 -mt-2 text-xs text-ink-subtle">
								Find codes on <a href="/templates" class="text-violet-300 underline">card designs</a
								>.
							</p>
							{#if errors.template}<p id="template-err" class="col-span-2 text-sm text-error">
									{errors.template}
								</p>{/if}
							{#if errors.quantity}<p id="quantity-err" class="col-span-2 text-sm text-error">
									{errors.quantity}
								</p>{/if}
						</div>
						<div class="sm:col-span-2">
							<label for="message" class="text-sm font-semibold"
								>Anything else? <span class="font-normal text-ink-subtle">(optional)</span></label
							>
							<textarea
								id="message"
								name="message"
								rows="4"
								maxlength="1000"
								class="{field} {ok} resize-y"
								placeholder="Colours, logo, number of team members, delivery city…"
								>{values.message ?? initialMessage}</textarea
							>
						</div>
					</div>

					<div
						class="mt-8 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<p class="text-xs text-ink-subtle">
							{data.page.privacyNote}
						</p>
						<Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
							{#if pending}
								<span
									class="size-4 animate-spin rounded-full border-2 border-abyss/30 border-t-abyss"
									aria-hidden="true"
								></span>
								Sending…
							{:else}
								Send enquiry
							{/if}
						</Button>
					</div>
				</form>
			{/if}
		</div>

		<aside class="space-y-6 lg:pt-4" aria-label="Other ways to reach us">
			<div class="glass rounded-[2rem] p-8">
				<p class="eyebrow">{data.page.callEyebrow}</p>
				<a
					href="tel:{data.settings.phone}"
					class="mt-4 block font-display text-3xl font-semibold tracking-[-0.03em] hover:text-violet-300"
					>{data.settings.phoneDisplay}</a
				>
				<p class="mt-2 text-sm text-ink-muted">
					{data.page.callBody}
				</p>
				<div class="mt-6 flex flex-wrap gap-3">
					<Button href="tel:{data.settings.phone}">Call now</Button>
					{#if data.settings.whatsapp}
						<Button
							href="https://wa.me/{data.settings.whatsapp}"
							variant="outline"
							target="_blank"
							rel="noopener">WhatsApp</Button
						>
					{/if}
				</div>
			</div>
			{#if data.settings.instagram}
				<a
					href="https://www.instagram.com/{data.settings.instagram}/"
					target="_blank"
					rel="noopener"
					class="group glass flex items-center justify-between rounded-[2rem] p-8 hover:bg-violet-700/15"
				>
					<div>
						<p class="eyebrow">{data.page.followEyebrow}</p>
						<p class="mt-2 text-xl font-semibold">@{data.settings.instagram}</p>
					</div>
					<span
						class="text-2xl text-violet-300 transition-transform group-hover:translate-x-1"
						aria-hidden="true">→</span
					>
				</a>
			{/if}
		</aside>
	</div>
</section>
