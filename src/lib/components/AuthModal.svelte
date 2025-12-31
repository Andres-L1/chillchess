<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { auth } from '$lib/firebase';
    import {
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
        updateProfile,
    } from 'firebase/auth';

    export let show = false;

    const dispatch = createEventDispatcher();

    let isRegistering = false;
    let email = '';
    let password = '';
    let name = '';
    let error = '';
    let loading = false;

    async function handleSubmit() {
        if (!email || !password) {
            error = 'Por favor completa todos los campos';
            return;
        }

        if (isRegistering && !name) {
            error = 'Necesitamos tu nombre para el perfil';
            return;
        }

        loading = true;
        error = '';

        try {
            let userCredential;
            if (isRegistering) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Update display name
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, {
                        displayName: name,
                    });
                }
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            // Sync with Server Session (Cookie)
            if (userCredential.user) {
                const token = await userCredential.user.getIdToken();
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idToken: token }),
                });
            }
            dispatch('close');
        } catch (e: any) {
            console.error(e);
            if (e.code === 'auth/email-already-in-use') {
                error = 'Este correo ya está registrado. Intenta iniciar sesión.';
            } else if (
                e.code === 'auth/wrong-password' ||
                e.code === 'auth/user-not-found' ||
                e.code === 'auth/invalid-credential'
            ) {
                error = 'Credenciales incorrectas.';
            } else if (e.code === 'auth/weak-password') {
                error = 'La contraseña debe tener al menos 6 caracteres.';
            } else {
                error = 'Error: ' + e.message;
            }
        } finally {
            loading = false;
        }
    }

    function toggleMode() {
        isRegistering = !isRegistering;
        error = '';
    }

    function close() {
        dispatch('close');
    }
</script>

{#if show}
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <button
            class="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm cursor-default focus:outline-none"
            on:click={close}
            aria-label="Cerrar modal"
        ></button>

        <!-- Modal -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div
            class="relative w-full max-w-sm bg-[#1a1a1a]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel p-8 text-white pointer-events-auto z-10 flex flex-col items-center"
            on:click|stopPropagation
            on:keydown={(e) => e.key === 'Escape' && close()}
            role="dialog"
            aria-modal="true"
            tabindex="-1"
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
                ♟️
            </div>

            <h2 class="text-2xl font-bold font-poppins mb-2 text-center">
                {isRegistering ? 'Crear Cuenta' : 'Bienvenido'}
            </h2>
            <p class="text-white/60 text-sm mb-6 leading-relaxed text-center">
                {isRegistering
                    ? 'Únete para guardar tu progreso y desbloquear vibes.'
                    : 'Accede a tu espacio de concentración.'}
            </p>

            <!-- Toggle -->
            <div class="flex gap-4 mb-6 bg-white/5 p-1 rounded-xl w-full">
                <button
                    class="flex-1 py-2 text-sm font-medium rounded-lg transition-all {!isRegistering
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-white/40 hover:text-white'}"
                    on:click={() => {
                        isRegistering = false;
                        error = '';
                    }}
                    type="button">Entrar</button
                >
                <button
                    class="flex-1 py-2 text-sm font-medium rounded-lg transition-all {isRegistering
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-white/40 hover:text-white'}"
                    on:click={() => {
                        isRegistering = true;
                        error = '';
                    }}
                    type="button">Registrarse</button
                >
            </div>

            {#if error}
                <div
                    class="w-full bg-red-500/10 border border-red-500/20 text-red-200 text-xs px-4 py-2 rounded-lg mb-4 text-left"
                >
                    {error}
                </div>
            {/if}

            <form on:submit|preventDefault={handleSubmit} class="w-full flex flex-col gap-4">
                {#if isRegistering}
                    <div>
                        <input
                            type="text"
                            bind:value={name}
                            placeholder="Nombre de usuario"
                            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                            required
                            disabled={loading}
                        />
                    </div>
                {/if}

                <div>
                    <input
                        type="email"
                        bind:value={email}
                        placeholder="Correo electrónico"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <input
                        type="password"
                        bind:value={password}
                        placeholder="Contraseña"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                        required
                        minlength="6"
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    class="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {#if loading}
                        <span
                            class="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"
                        ></span>
                    {:else}
                        {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
                    {/if}
                </button>
            </form>

            <div
                class="mt-6 flex justify-center gap-4 text-xs text-white/30 w-full border-t border-white/5 pt-4"
            >
                <a
                    href="/privacy"
                    target="_blank"
                    class="hover:text-white underline transition-colors">Privacidad</a
                >
                <span>•</span>
                <a
                    href="/terms"
                    target="_blank"
                    class="hover:text-white underline transition-colors">Términos</a
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .glass-panel {
        background: rgba(20, 20, 20, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
    }
</style>
