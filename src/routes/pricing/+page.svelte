<script lang="ts">
    import { TIERS } from "$lib/subscription/tiers";
    import { userStore } from "$lib/auth/userStore";
    import { userSubscription } from "$lib/subscription/userSubscription";
    import AuthModal from "$lib/components/AuthModal.svelte";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import SettingsIcon from "$lib/components/icons/SettingsIcon.svelte";

    let showAuthModal = false;
    let loading = false;
    let successMessage = "";
    let errorMessage = "";

    onMount(() => {
        // Check for success/cancel params
        const params = new URLSearchParams(window.location.search);
        if (params.get("success")) {
            successMessage = "¡Pago exitoso! Tu suscripción está activa.";
            setTimeout(() => goto("/app"), 3000);
        } else if (params.get("canceled")) {
            errorMessage =
                "Pago cancelado. Puedes intentarlo de nuevo cuando quieras.";
        }
    });

    async function handleSubscribe(
        plan: "pro",
        interval: "monthly" | "yearly",
    ) {
        if (!$userStore.user) {
            showAuthModal = true;
            return;
        }

        loading = true;
        errorMessage = "";

        try {
            const response = await fetch("/api/stripe/create-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan,
                    interval,
                    userId: $userStore.user.uid,
                    userEmail: $userStore.user.email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Error creating checkout session",
                );
            }

            // Redirect to Stripe checkout
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            console.error("Error:", error);
            errorMessage =
                error.message ||
                "Error al procesar el pago. Inténtalo de nuevo.";
        } finally {
            loading = false;
        }
    }

    async function handleManageBilling() {
        if (!$userStore.user) return;

        const customerId = $userSubscription.stripeCustomerId;
        if (!customerId) {
            errorMessage = "No tienes una suscripción activa para gestionar.";
            return;
        }

        loading = true;
        try {
            const response = await fetch("/api/stripe/create-portal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ customerId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error accessing portal");
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            console.error("Error:", error);
            errorMessage = error.message || "Error al acceder al portal.";
        } finally {
            loading = false;
        }
    }
</script>

<AuthModal show={showAuthModal} on:close={() => (showAuthModal = false)} />

<div
    class="min-h-screen bg-midnight-900 text-white font-poppins pt-24 pb-20 px-4"
>
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-16 space-y-4">
        <!-- Back Button -->
        <div class="mb-8">
            <a
                href="/"
                class="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
                <svg
                    class="w-5 h-5 transition-transform group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                <span class="font-medium">Volver</span>
            </a>
        </div>

        <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-center">
            Invierte en tu <span class="text-primary-500">Calma</span>
        </h1>
        <p class="text-slate-400 text-lg max-w-2xl mx-auto text-center">
            Un único plan simple. Todo incluido.
            <br class="hidden md:block" />
            Sin complicaciones.
        </p>
    </div>

    <!-- Success/Error Messages -->
    {#if successMessage}
        <div
            class="max-w-2xl mx-auto mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-center"
        >
            {successMessage}
        </div>
    {/if}

    {#if errorMessage}
        <div
            class="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center"
        >
            {errorMessage}
        </div>
    {/if}

    <!-- Manage Billing Button for Existing Subscribers -->
    {#if $userStore.user && $userSubscription.tier !== "free"}
        <div class="max-w-2xl mx-auto mb-8 text-center">
            <button
                on:click={handleManageBilling}
                disabled={loading}
                class="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium transition-all disabled:opacity-50"
            >
                {#if loading}
                    <span>Cargando...</span>
                {:else}
                    <div class="flex items-center gap-2">
                        <SettingsIcon size="sm" gradient={false} />
                        <span>Gestionar Suscripción</span>
                    </div>
                {/if}
            </button>
        </div>
    {/if}

    <!-- Pricing Grid (Centered 2 Columns) -->
    <div
        class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
    >
        <!-- FREE TIER -->
        <div
            class="bg-midnight-800/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all"
        >
            <h3 class="text-xl font-bold text-slate-300 mb-2">Plan Gratuito</h3>
            <div class="mb-6">
                <span class="text-4xl font-bold text-slate-100">€0</span>
                <span class="text-slate-500">/siempre</span>
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
            class="relative bg-midnight-700/80 backdrop-blur-xl border border-primary-500/30 rounded-3xl p-8 shadow-2xl shadow-primary-900/20"
        >
            <div
                class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg"
            >
                Oferta Única
            </div>

            <h3 class="text-xl font-bold text-primary-400 mb-2">Pro Anual</h3>
            <div class="mb-6">
                <span class="text-5xl font-bold text-white">€19.99</span>
                <span class="text-slate-400">/año</span>
                <div class="text-xs text-primary-400 mt-1">
                    Menos de €1.70 al mes
                </div>
            </div>
            <p class="text-slate-300 text-sm mb-8 min-h-[40px]">
                Todo el catálogo desbloqueado y apoyo directo al creador.
            </p>

            <button
                on:click={() => handleSubscribe("pro", "yearly")}
                disabled={loading}
                class="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:to-primary-500 text-white font-bold shadow-lg shadow-primary-900/30 hover:shadow-primary-900/50 hover:scale-[1.02] transition-all mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Procesando..." : "Obtener Anualidad"}
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
                    Sí, absolutamente. Puedes gestionar tu suscripción desde el
                    portal de Stripe y cancelar en cualquier momento. Seguirás
                    teniendo acceso Pro hasta que termine tu periodo de
                    facturación actual.
                </p>
            </details>
            <details class="bg-white/5 p-6 rounded-2xl cursor-pointer group">
                <summary
                    class="font-bold list-none flex justify-between items-center text-slate-200"
                >
                    ¿Cómo funciona el pago?
                    <span
                        class="text-primary-500 group-open:rotate-180 transition-transform"
                        >▼</span
                    >
                </summary>
                <p class="mt-4 text-slate-400 leading-relaxed">
                    Usamos Stripe para procesar los pagos de forma segura. Tus
                    datos de tarjeta nunca pasan por nuestros servidores. El
                    pago anual se renueva automáticamente cada año, pero puedes
                    cancelar cuando quieras.
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
