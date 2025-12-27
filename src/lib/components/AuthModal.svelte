<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { auth, discordProvider } from "$lib/firebase";
    import { signInWithPopup } from "firebase/auth";

    export let show = false;

    const dispatch = createEventDispatcher();

    let error = "";
    let loading = false;

    async function loginWithDiscord() {
        if (!auth || !discordProvider) {
            error = "Error de configuración: Firebase no inicializado.";
            return;
        }

        error = "";
        loading = true;

        try {
            await signInWithPopup(auth, discordProvider);
            dispatch("close");
        } catch (e: any) {
            console.error(e);
            if (e.code === "auth/popup-closed-by-user") {
                // Usuario cerró la ventana, no es error crítico
                return;
            }
            error = "Error al conectar con Discord. Inténtalo de nuevo.";
        } finally {
            loading = false;
        }
    }

    function close() {
        dispatch("close");
    }
</script>

{#if show}
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop (Accessible) -->
        <button
            class="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm cursor-default focus:outline-none"
            on:click={close}
            aria-label="Cerrar modal"
        ></button>

        <!-- Modal -->
        <div
            class="relative w-full max-w-sm bg-[#1a1a1a]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel p-8 text-white pointer-events-auto z-10 flex flex-col items-center text-center"
        >
            <!-- Close Button -->
            <button
                on:click={close}
                class="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1"
                aria-label="Cerrar">✕</button
            >

            <div
                class="w-16 h-16 bg-[#5865F2]/20 rounded-full flex items-center justify-center mb-6 text-3xl"
            >
                👾
            </div>

            <h2 class="text-2xl font-bold font-poppins mb-2">Únete al Club</h2>
            <p class="text-white/60 text-sm mb-8 leading-relaxed">
                Conecta tu cuenta de Discord para guardar tu progreso,
                desbloquear ambientes y sincronizar tus partidas.
            </p>

            {#if error}
                <div
                    class="w-full bg-red-500/10 border border-red-500/20 text-red-200 text-xs px-4 py-2 rounded-lg mb-4 text-left"
                >
                    {error}
                </div>
            {/if}

            <button
                on:click={loginWithDiscord}
                disabled={loading}
                class="w-full py-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#5865F2]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                {#if loading}
                    <span
                        class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></span>
                    <span>Conectando...</span>
                {:else}
                    <!-- Discord Icon SVG -->
                    <svg
                        class="w-6 h-6 fill-current"
                        viewBox="0 0 127.14 96.36"
                    >
                        <path
                            d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c1.24-23.28-5.83-47.5-22.11-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
                        />
                    </svg>
                    <span>Continuar con Discord</span>
                {/if}
            </button>

            <p class="mt-6 text-xs text-white/30">
                Al continuar, aceptas nuestros términos de servicio.
            </p>
        </div>
    </div>
{/if}

<style>
    .glass-panel {
        background: rgba(20, 20, 20, 0.9);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
    }
</style>
