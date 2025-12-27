<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { auth, googleProvider } from "$lib/firebase";
    import { signInWithPopup } from "firebase/auth";

    export let show = false;

    const dispatch = createEventDispatcher();

    let error = "";
    let loading = false;

    async function loginWithGoogle() {
        if (!auth || !googleProvider) {
            error = "Error de configuración: Firebase no inicializado.";
            return;
        }

        error = "";
        loading = true;

        try {
            await signInWithPopup(auth, googleProvider);
            dispatch("close");
        } catch (e: any) {
            console.error(e);
            if (e.code === "auth/popup-closed-by-user") {
                // Usuario cerró la ventana, no es error crítico
                return;
            }
            error = "Error al conectar con Google. Inténtalo de nuevo.";
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
                class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 text-3xl shadow-lg"
            >
                🎮
            </div>

            <h2 class="text-2xl font-bold font-poppins mb-2">Únete al Club</h2>
            <p class="text-white/60 text-sm mb-8 leading-relaxed">
                Conecta tu cuenta de Google para guardar tu progreso,
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
                on:click={loginWithGoogle}
                disabled={loading}
                class="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                {#if loading}
                    <span
                        class="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"
                    ></span>
                    <span>Conectando...</span>
                {:else}
                    <!-- Google Icon SVG -->
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    <span>Continuar con Google</span>
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
