<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { TIERS } from "$lib/subscription/tiers";

    export let show = false;
    export let blockedFeature: "vibe" | "games" = "vibe";

    const dispatch = createEventDispatcher();

    function close() {
        dispatch("close");
    }

    function upgradeToPro() {
        window.location.href = "/pricing";
    }

    $: featureText =
        blockedFeature === "vibe"
            ? "Este ambiente es exclusivo para usuarios Pro"
            : "Has alcanzado el límite de partidas diarias";
</script>

{#if show}
    <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
        <!-- Backdrop -->
        <button
            class="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-sm cursor-default"
            on:click={close}
            aria-label="Cerrar"
        ></button>

        <!-- Modal -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            class="relative w-full max-w-md bg-[#0B1120]/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/10 z-10 my-auto"
            on:click|stopPropagation
            on:keydown={(e) => e.key === "Escape" && close()}
        >
            <!-- Close Button -->
            <button
                on:click={close}
                class="absolute top-3 right-3 z-20 text-white/70 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 bg-black/30 backdrop-blur-sm shadow-lg"
                aria-label="Cerrar"
            >
                ✕
            </button>

            <!-- Header -->
            <div class="text-center pt-8 pb-4 px-4 sm:px-6">
                <div
                    class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 shadow-lg shadow-blue-500/30"
                >
                    🔒
                </div>
                <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">
                    Contenido Premium
                </h2>
                <p class="text-slate-400 text-xs sm:text-sm">
                    {featureText}
                </p>
            </div>

            <!-- Pro Plan Card -->
            <div class="px-4 pb-4 sm:px-6 sm:pb-6">
                <div class="max-w-md mx-auto">
                    <!-- Single Pro Card -->
                    <div class="relative group">
                        <!-- Recommended Badge -->
                        <div
                            class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] sm:text-xs font-bold px-3 py-0.5 sm:py-1 rounded-full shadow-lg z-10"
                        >
                            ⚡ PLAN ANUAL
                        </div>

                        <div
                            class="bg-[#1e293b]/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-blue-500/50 hover:border-blue-400 transition-all hover:shadow-2xl hover:shadow-blue-500/20 mt-2"
                        >
                            <div class="text-center mb-3 sm:mb-4">
                                <h3
                                    class="text-base sm:text-lg font-bold text-white mb-2"
                                >
                                    ChillChess Pro
                                </h3>
                                <div
                                    class="flex items-baseline justify-center gap-1.5 sm:gap-2 mb-1"
                                >
                                    <span
                                        class="text-3xl sm:text-4xl font-bold text-white"
                                        >€19.99</span
                                    >
                                    <span
                                        class="text-slate-400 text-sm sm:text-base"
                                        >/año</span
                                    >
                                </div>
                                <p
                                    class="text-xs sm:text-sm text-blue-400 font-medium"
                                >
                                    Solo €1.66/mes
                                </p>
                            </div>

                            <ul
                                class="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 max-h-48 sm:max-h-64 overflow-y-auto"
                            >
                                {#each TIERS.pro.features as feature}
                                    <li
                                        class="flex items-start gap-2 text-xs sm:text-sm text-slate-300"
                                    >
                                        <span
                                            class="text-blue-400 text-sm sm:text-base shrink-0 mt-0.5"
                                            >✓</span
                                        >
                                        <span class="leading-snug"
                                            >{feature}</span
                                        >
                                    </li>
                                {/each}
                            </ul>

                            <button
                                on:click={upgradeToPro}
                                class="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg sm:rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30 text-sm sm:text-base"
                            >
                                Suscribirse Ahora
                            </button>

                            <p
                                class="text-[10px] sm:text-xs text-center text-slate-500 mt-2 sm:mt-3"
                            >
                                Cancela cuando quieras. Sin compromisos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="px-4 pb-4 sm:px-6 sm:pb-5 text-center">
                <p class="text-[10px] sm:text-xs text-slate-500">
                    ¿Preguntas? <a
                        href="https://discord.gg/G7SrFtJHnr"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-400 hover:text-blue-300 underline"
                        >Únete a nuestro Discord</a
                    >
                </p>
            </div>
        </div>
    </div>
{/if}
