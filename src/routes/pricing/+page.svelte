<script lang="ts">
    import { TIERS } from "$lib/subscription/tiers";
    import { userStore } from "$lib/auth/userStore";
    import AuthModal from "$lib/components/AuthModal.svelte";

    let billingCycle: "monthly" | "yearly" = "yearly";
    let showAuthModal = false;

    // Calcular precio mensual si se paga anual (descuento visual)
    $: isYearly = billingCycle === "yearly";
</script>

<AuthModal show={showAuthModal} on:close={() => (showAuthModal = false)} />

<div
    class="min-h-screen bg-midnight-900 text-white font-poppins pt-24 pb-20 px-4"
>
    <!-- Header -->
    <div class="max-w-4xl mx-auto text-center mb-16 space-y-4">
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
            Invierte en tu <span class="text-primary-500">Calma</span>
        </h1>
        <p class="text-slate-400 text-lg max-w-2xl mx-auto">
            Elige el plan perfecto para potenciar tu concentración.
            <br class="hidden md:block" />
            Sin compromisos. Cancela cuando quieras.
        </p>

        <!-- Billing Toggle -->
        <div class="flex items-center justify-center gap-4 mt-8">
            <span
                class="{!isYearly
                    ? 'text-white font-bold'
                    : 'text-slate-500'} transition-colors">Mensual</span
            >
            <button
                class="w-14 h-8 bg-white/10 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                on:click={() =>
                    (billingCycle = isYearly ? "monthly" : "yearly")}
            >
                <div
                    class="absolute top-1 left-1 w-6 h-6 bg-primary-500 rounded-full shadow-lg transition-transform duration-300"
                    style="transform: translateX({isYearly ? '24px' : '0'});"
                ></div>
            </button>
            <span
                class="{isYearly
                    ? 'text-white font-bold'
                    : 'text-slate-500'} transition-colors"
            >
                Anual <span class="text-primary-400 text-xs ml-1 font-normal"
                    >-20%</span
                >
            </span>
        </div>
    </div>

    <!-- Pricing Grid -->
    <div
        class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start"
    >
        <!-- FREE TIER -->
        <div
            class="bg-midnight-800/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all"
        >
            <h3 class="text-xl font-bold text-slate-300 mb-2">
                {TIERS.free.name}
            </h3>
            <div class="mb-6">
                <span class="text-4xl font-bold text-white">€0</span>
                <span class="text-slate-500">/mes</span>
            </div>
            <p class="text-slate-400 text-sm mb-8 min-h-[40px]">
                Para explorar y empezar a enfocarte.
            </p>

            <button
                on:click={() => (showAuthModal = true)}
                class="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all mb-8"
            >
                Comenzar Gratis
            </button>

            <ul class="space-y-4 text-sm text-slate-300">
                {#each TIERS.free.features as feature}
                    <li class="flex items-start gap-3">
                        <span class="text-slate-500 mt-0.5">✓</span>
                        <span>{feature}</span>
                    </li>
                {/each}
            </ul>
        </div>

        <!-- PRO TIER (Featured) -->
        <div
            class="relative bg-midnight-700/80 backdrop-blur-xl border border-primary-500/30 rounded-3xl p-8 shadow-2xl shadow-primary-900/20 transform md:-translate-y-4"
        >
            <div
                class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg"
            >
                Más Popular
            </div>

            <h3 class="text-xl font-bold text-primary-400 mb-2">
                {TIERS.pro.name}
            </h3>
            <div class="mb-6">
                <span class="text-5xl font-bold text-white">
                    {isYearly ? "€3.99" : "€4.99"}
                </span>
                <span class="text-slate-400">/mes</span>
                {#if isYearly}
                    <div class="text-xs text-primary-400 mt-1">
                        Facturado €47.88 anualmente
                    </div>
                {/if}
            </div>
            <p class="text-slate-300 text-sm mb-8 min-h-[40px]">
                La experiencia completa sin límites.
            </p>

            <button
                on:click={() => (showAuthModal = true)}
                class="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:to-primary-500 text-white font-bold shadow-lg shadow-primary-900/30 hover:shadow-primary-900/50 hover:scale-[1.02] transition-all mb-8"
            >
                Obtener Pro
            </button>

            <ul class="space-y-4 text-sm text-white">
                {#each TIERS.pro.features as feature}
                    <li class="flex items-start gap-3">
                        <span class="text-primary-400 mt-0.5 font-bold">✓</span>
                        <span>{feature}</span>
                    </li>
                {/each}
            </ul>
        </div>

        <!-- LIFETIME / PREMIUM -->
        <div
            class="bg-midnight-800/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all"
        >
            <h3 class="text-xl font-bold text-slate-300 mb-2">Lifetime</h3>
            <div class="mb-6">
                <span class="text-4xl font-bold text-white">€149</span>
                <span class="text-slate-500">/una vez</span>
            </div>
            <p class="text-slate-400 text-sm mb-8 min-h-[40px]">
                Paga una vez, disfrútalo para siempre.
            </p>

            <button
                class="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all mb-8"
            >
                Contactar Ventas
            </button>

            <ul class="space-y-4 text-sm text-slate-300">
                <li class="flex items-start gap-3">
                    <span class="text-slate-500 mt-0.5">✓</span>
                    <span>Todo lo incluido en Pro</span>
                </li>
                <li class="flex items-start gap-3">
                    <span class="text-slate-500 mt-0.5">✓</span>
                    <span>Acceso de por vida</span>
                </li>
                <li class="flex items-start gap-3">
                    <span class="text-slate-500 mt-0.5">✓</span>
                    <span>Badge "Fundador"</span>
                </li>
            </ul>
        </div>
    </div>

    <!-- FAQ Section -->
    <div class="max-w-3xl mx-auto mt-24">
        <h2 class="text-2xl font-bold text-center mb-12">
            Preguntas Frecuentes
        </h2>
        <div class="space-y-6">
            <details class="bg-white/5 p-6 rounded-2xl cursor-pointer group">
                <summary
                    class="font-bold list-none flex justify-between items-center text-slate-200"
                >
                    ¿Puedo cancelar cuando quiera?
                    <span
                        class="text-primary-500 group-open:rotate-180 transition-transform"
                        >▼</span
                    >
                </summary>
                <p class="mt-4 text-slate-400 leading-relaxed">
                    Sí, absolutamente. Si cancelas, seguirás teniendo acceso Pro
                    hasta que termine tu periodo de facturación actual.
                </p>
            </details>
            <details class="bg-white/5 p-6 rounded-2xl cursor-pointer group">
                <summary
                    class="font-bold list-none flex justify-between items-center text-slate-200"
                >
                    ¿Qué incluye la personalización?
                    <span
                        class="text-primary-500 group-open:rotate-180 transition-transform"
                        >▼</span
                    >
                </summary>
                <p class="mt-4 text-slate-400 leading-relaxed">
                    Podrás cambiar los fondos dinámicos (Vibes), el estilo del
                    reloj y ocultar la interfaz para una experiencia minimalista
                    total.
                </p>
            </details>
        </div>
    </div>
</div>
