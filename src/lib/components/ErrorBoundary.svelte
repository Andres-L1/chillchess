<script lang="ts">
    import { onMount } from 'svelte';
    import { devLogger } from '$lib/utils/devLogger';

    export let error: Error | null = null;
    export let resetError: (() => void) | null = null;

    let showDetails = false;

    onMount(() => {
        if (error) {
            devLogger.error('Error boundary caught error', { error });
        }
    });

    function handleReset() {
        if (resetError) {
            resetError();
        } else {
            // Fallback: reload page
            window.location.reload();
        }
    }
</script>

{#if error}
    <div
        class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4"
        role="alert"
        aria-live="assertive"
    >
        <div
            class="max-w-lg w-full bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
        >
            <!-- Error Icon -->
            <div class="flex justify-center mb-6">
                <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg
                        class="w-8 h-8 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
            </div>

            <!-- Error Message -->
            <h2 class="text-2xl font-bold text-white text-center mb-2">Algo salió mal</h2>
            <p class="text-slate-300 text-center mb-6">
                Lo sentimos, ha ocurrido un error inesperado. Estamos trabajando para solucionarlo.
            </p>

            <!-- Error Details (Collapsible) -->
            {#if import.meta.env.DEV}
                <button
                    on:click={() => (showDetails = !showDetails)}
                    class="w-full text-left text-sm text-slate-400 hover:text-white transition-colors mb-4 flex items-center justify-between"
                    aria-expanded={showDetails}
                >
                    <span>Detalles técnicos</span>
                    <svg
                        class="w-4 h-4 transition-transform {showDetails ? 'rotate-180' : ''}"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {#if showDetails}
                    <div class="bg-black/30 rounded-lg p-4 mb-6 overflow-auto max-h-48">
                        <p class="text-xs font-mono text-red-300 break-all">
                            {error.message}
                        </p>
                        {#if error.stack}
                            <pre
                                class="text-xs font-mono text-slate-400 mt-2 whitespace-pre-wrap break-all">{error.stack}</pre>
                        {/if}
                    </div>
                {/if}
            {/if}

            <!-- Actions -->
            <div class="flex gap-3">
                <button
                    on:click={handleReset}
                    class="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                >
                    Reintentar
                </button>
                <a
                    href="/"
                    class="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors text-center"
                >
                    Ir al Inicio
                </a>
            </div>

            <!-- Support Link -->
            <p class="text-center text-sm text-slate-400 mt-6">
                ¿Necesitas ayuda?
                <a href="/support" class="text-primary-400 hover:text-primary-300 underline">
                    Contacta soporte
                </a>
            </p>
        </div>
    </div>
{:else}
    <slot />
{/if}
