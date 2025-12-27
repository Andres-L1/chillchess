<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { SUBSCRIPTION_TIERS } from "$lib/subscription/tiers";

    export let show = false;
    export let blockedFeature: "vibe" | "games" = "vibe";

    const dispatch = createEventDispatcher();

    const proTier = SUBSCRIPTION_TIERS.pro;
    const premiumTier = SUBSCRIPTION_TIERS.premium;

    function close() {
        dispatch("close");
    }

    function upgradeTo(tier: "pro" | "premium") {
        // TODO: Redirect to Stripe Checkout
        console.log("Upgrading to:", tier);
        close();
    }
</script>

{#if show}
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <button
            class="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-md cursor-default focus:outline-none"
            on:click={close}
            aria-label="Cerrar modal"
        ></button>

        <!-- Modal -->
        <div
            class="relative w-full max-w-3xl bg-[#0B1120]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden glass-panel p-8 md:p-12 text-white pointer-events-auto z-10"
        >
            <!-- Close Button -->
            <button
                on:click={close}
                class="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                aria-label="Cerrar"
            >
                ✕
            </button>

            <!-- Header -->
            <div class="text-center mb-10">
                <div
                    class="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20"
                >
                    <span class="text-4xl">🔓</span>
                </div>

                <h2 class="text-3xl md:text-4xl font-bold font-poppins mb-3">
                    {#if blockedFeature === "vibe"}
                        Desbloquea Todos los Ambientes
                    {:else}
                        Juega Sin Límites
                    {/if}
                </h2>

                <p
                    class="text-slate-400 text-base md:text-lg max-w-lg mx-auto leading-relaxed"
                >
                    {#if blockedFeature === "vibe"}
                        Este ambiente es exclusivo para miembros Pro y Premium.
                        Mejora tu plan para acceder a todos los espacios de
                        concentración.
                    {:else}
                        Has alcanzado el límite de 5 partidas diarias. Con Pro,
                        juega todas las partidas que quieras.
                    {/if}
                </p>
            </div>

            <!-- Pricing Cards -->
            <div class="grid md:grid-cols-2 gap-6 mb-8">
                <!-- Pro Plan -->
                <div
                    class="relative bg-gradient-to-br from-orange-500/10 to-pink-500/10 border-2 border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/50 transition-all group"
                >
                    <div
                        class="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase"
                    >
                        Popular
                    </div>

                    <h3 class="text-2xl font-bold text-white mb-2">
                        {proTier.name}
                    </h3>
                    <div class="flex items-baseline gap-2 mb-6">
                        <span class="text-4xl font-bold text-orange-400"
                            >€{proTier.price}</span
                        >
                        <span class="text-slate-400 text-sm">/mes</span>
                    </div>

                    <ul class="space-y-3 mb-8">
                        <li class="flex items-start gap-3 text-sm">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span class="text-slate-300"
                                >Todos los ambientes actuales</span
                            >
                        </li>
                        <li class="flex items-start gap-3 text-sm">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span class="text-slate-300"
                                >Partidas ilimitadas</span
                            >
                        </li>
                        <li class="flex items-start gap-3 text-sm">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span class="text-slate-300">Modo sin conexión</span
                            >
                        </li>
                    </ul>

                    <button
                        on:click={() => upgradeTo("pro")}
                        class="w-full py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Suscribirse a Pro
                    </button>
                </div>

                <!-- Premium Plan -->
                <div
                    class="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all group"
                >
                    <div
                        class="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase"
                    >
                        Completo
                    </div>

                    <h3 class="text-2xl font-bold text-white mb-2">
                        {premiumTier.name}
                    </h3>
                    <div class="flex items-baseline gap-2 mb-6">
                        <span class="text-4xl font-bold text-purple-400"
                            >€{premiumTier.price}</span
                        >
                        <span class="text-slate-400 text-sm">/mes</span>
                    </div>

                    <ul class="space-y-3 mb-8">
                        <li class="flex items-start gap-3 text-sm">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span class="text-slate-300">Todo de Pro +</span>
                        </li>
                        <li class="flex items-start gap-3 text-sm">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span class="text-slate-300"
                                >Análisis con IA (Stockfish)</span
                            >
                        </li>
                        <li class="flex items-start gap-3 text-sm">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span class="text-slate-300"
                                >Temas de tablero exclusivos</span
                            >
                        </li>
                        <li class="flex items-start gap-3 text-sm">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span class="text-slate-300"
                                >Ambientes futuros incluidos</span
                            >
                        </li>
                    </ul>

                    <button
                        on:click={() => upgradeTo("premium")}
                        class="w-full py-3.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Suscribirse a Premium
                    </button>
                </div>
            </div>

            <!-- Footer Note -->
            <p class="text-center text-xs text-slate-500">
                Cancela cuando quieras. Sin compromisos.
            </p>
        </div>
    </div>
{/if}

<style>
    .glass-panel {
        background: rgba(11, 17, 32, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
    }
</style>
