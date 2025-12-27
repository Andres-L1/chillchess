<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { auth } from "$lib/firebase";
    import {
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
    } from "firebase/auth";

    export let show = false;

    const dispatch = createEventDispatcher();

    let isRegister = false;
    let email = "";
    let password = "";
    let error = "";
    let loading = false;

    async function handleSubmit() {
        error = "";
        loading = true;

        try {
            if (isRegister) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            dispatch("close");
        } catch (e: any) {
            console.error(e);
            switch (e.code) {
                case "auth/invalid-email":
                    error = "Email inválido.";
                    break;
                case "auth/user-disabled":
                    error = "Usuario deshabilitado.";
                    break;
                case "auth/user-not-found":
                    error = "Usuario no encontrado.";
                    break;
                case "auth/wrong-password":
                    error = "Contraseña incorrecta.";
                    break;
                case "auth/email-already-in-use":
                    error = "Email ya registrado.";
                    break;
                case "auth/weak-password":
                    error = "Contraseña muy débil (min 6 caracteres).";
                    break;
                default:
                    error = "Error de autenticación: " + e.message;
            }
        } finally {
            loading = false;
        }
    }

    function toggleMode() {
        isRegister = !isRegister;
        error = "";
    }

    function close() {
        dispatch("close");
    }
</script>

{#if show}
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div
            class="absolute inset-0 bg-black/60 backdrop-blur-sm"
            on:click={close}
        ></div>

        <!-- Modal -->
        <div
            class="relative w-full max-w-md bg-[#1a1a1a]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel p-8 text-white"
        >
            <!-- Close Button -->
            <button
                on:click={close}
                class="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                >✕</button
            >

            <h2 class="text-2xl font-bold font-poppins mb-2 text-center">
                {isRegister ? "Crear Cuenta" : "Bienvenido"}
            </h2>
            <p class="text-white/60 text-sm text-center mb-6">
                {isRegister
                    ? "Únete al santuario de ajedrez."
                    : "Continúa tu viaje de maestría."}
            </p>

            <form on:submit|preventDefault={handleSubmit} class="space-y-4">
                <div class="space-y-1">
                    <label
                        class="text-xs font-semibold uppercase tracking-wider text-white/40 ml-1"
                        >Email</label
                    >
                    <input
                        type="email"
                        bind:value={email}
                        placeholder="tu@email.com"
                        class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                        required
                    />
                </div>

                <div class="space-y-1">
                    <label
                        class="text-xs font-semibold uppercase tracking-wider text-white/40 ml-1"
                        >Contraseña</label
                    >
                    <input
                        type="password"
                        bind:value={password}
                        placeholder="••••••••"
                        class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                        required
                    />
                </div>

                {#if error}
                    <div
                        class="bg-red-500/10 border border-red-500/20 text-red-200 text-sm px-4 py-2 rounded-lg"
                    >
                        {error}
                    </div>
                {/if}

                <button
                    type="submit"
                    disabled={loading}
                    class="w-full py-3 bg-white text-black font-bold rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading
                        ? "Procesando..."
                        : isRegister
                          ? "Registrarse"
                          : "Iniciar Sesión"}
                </button>
            </form>

            <div class="mt-6 text-center">
                <button
                    on:click={toggleMode}
                    class="text-sm text-white/50 hover:text-white transition-colors underline"
                >
                    {isRegister
                        ? "¿Ya tienes cuenta? Inicia Sesión"
                        : "¿No tienes cuenta? Regístrate"}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .glass-panel {
        background: rgba(20, 20, 20, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }
</style>
