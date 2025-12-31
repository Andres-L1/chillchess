<script lang="ts">
    /**
     * Error Boundary Component
     *
     * Catches errors in child components and displays a fallback UI
     * instead of crashing the entire app.
     *
     * Usage:
     * ```svelte
     * <ErrorBoundary>
     *   <YourComponent />
     * </ErrorBoundary>
     * ```
     */

    import { onMount, onDestroy } from "svelte";
    import { logger } from "$lib/utils/logger";

    export let fallbackMessage: string = "Ha ocurrido un error inesperado";
    export let showDetails: boolean = false;
    export let onError: ((error: Error) => void) | undefined = undefined;

    let hasError = false;
    let error: Error | null = null;
    let errorInfo: string = "";

    // Error handler for window-level errors
    function handleError(event: ErrorEvent) {
        hasError = true;
        error = event.error;
        errorInfo = event.error?.stack || event.message;

        logger.error("Error caught by boundary", event.error, {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        });

        if (onError) {
            onError(event.error);
        }

        // Prevent default error handling
        event.preventDefault();
    }

    // Handler for unhandled promise rejections
    function handleUnhandledRejection(event: PromiseRejectionEvent) {
        hasError = true;
        error = new Error(
            event.reason?.message || "Unhandled Promise Rejection",
        );
        errorInfo = event.reason?.stack || String(event.reason);

        logger.error("Unhandled promise rejection", event.reason, {
            promise: event.promise,
        });

        if (onError && event.reason instanceof Error) {
            onError(event.reason);
        }

        event.preventDefault();
    }

    onMount(() => {
        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleUnhandledRejection);
    });

    onDestroy(() => {
        window.removeEventListener("error", handleError);
        window.removeEventListener(
            "unhandledrejection",
            handleUnhandledRejection,
        );
    });

    function resetError() {
        hasError = false;
        error = null;
        errorInfo = "";
    }
</script>

{#if hasError}
    <div class="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
        <div
            class="max-w-2xl w-full bg-[#131b2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
        >
            <!-- Error Icon -->
            <div
                class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
                <svg
                    class="w-10 h-10 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>

            <!-- Error Message -->
            <h2 class="text-2xl font-bold text-white mb-4">Algo salió mal</h2>
            <p class="text-slate-400 mb-6">
                {fallbackMessage}
            </p>

            <!-- Error Details (Collapsible) -->
            {#if showDetails && error}
                <details class="bg-black/20 rounded-xl p-4 mb-6 text-left">
                    <summary
                        class="cursor-pointer text-slate-300 font-medium hover:text-white transition-colors"
                    >
                        Detalles del error
                    </summary>
                    <div class="mt-4 space-y-2">
                        <div>
                            <span class="text-slate-500 text-sm">Mensaje:</span>
                            <p class="text-red-400 font-mono text-sm mt-1">
                                {error.message}
                            </p>
                        </div>
                        {#if errorInfo}
                            <div>
                                <span class="text-slate-500 text-sm"
                                    >Stack Trace:</span
                                >
                                <pre
                                    class="text-slate-300 font-mono text-xs mt-1 overflow-x-auto">{errorInfo}</pre>
                            </div>
                        {/if}
                    </div>
                </details>
            {/if}

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    on:click={resetError}
                    class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
                >
                    Intentar de nuevo
                </button>
                <a
                    href="/"
                    class="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/10"
                >
                    Volver al inicio
                </a>
            </div>

            <!-- Support Link -->
            <p class="text-slate-500 text-sm mt-6">
                Si el problema persiste, <a
                    href="/bugs"
                    class="text-primary-400 hover:underline">reporta el bug</a
                >
            </p>
        </div>
    </div>
{:else}
    <slot />
{/if}
