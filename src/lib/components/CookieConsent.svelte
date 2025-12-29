<script lang="ts">
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    let showBanner = false;

    onMount(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            // Delay showing slightly for better UX
            setTimeout(() => (showBanner = true), 1000);
        }
    });

    function accept() {
        localStorage.setItem("cookie_consent", "true");
        showBanner = false;
    }
</script>

{#if showBanner}
    <div
        transition:fly={{ y: 50, duration: 500 }}
        class="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
    >
        <div
            class="max-w-4xl mx-auto bg-midnight-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 md:flex items-center justify-between gap-6"
        >
            <div class="mb-4 md:mb-0">
                <h3 class="font-bold text-white text-lg mb-2">
                    🍪 Usamos cookies (las justas)
                </h3>
                <p class="text-slate-300 text-sm leading-relaxed">
                    Utilizamos cookies esenciales para gestionar tu sesión,
                    procesar pagos y guardar tu configuración de música. Sin
                    rastreadores publicitarios externos.
                    <a
                        href="/legal/cookies"
                        class="text-primary-400 hover:text-primary-300 underline ml-1"
                        >Leer política.</a
                    >
                </p>
            </div>

            <button
                on:click={accept}
                class="w-full md:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-900/30 whitespace-nowrap"
            >
                Aceptar y Continuar
            </button>
        </div>
    </div>
{/if}
