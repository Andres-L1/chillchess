<script lang="ts">
    import {
        Blocks,
        ShieldCheck,
        Zap,
        LogIn,
        Sparkles,
        ChevronRight,
        CheckCircle2,
        Timer,
        Calculator,
        QrCode,
        LayoutList,
        Star,
    } from 'lucide-svelte';
    import { auth } from '$lib/firebase';
    import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
    import { mobileMenuOpen } from '$lib/stores/ui';
    import { authStore } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import { onMount, tick } from 'svelte';
    import CookieBanner from '$lib/components/ui/CookieBanner.svelte';

    onMount(() => {
        mobileMenuOpen.set(false);
    });

    // Redirigir si ya está logueado
    $: if (!$authStore.loading && $authStore.user) {
        goto('/freelance');
    }

    let isAuthenticating = false;
    let errorMessage = '';

    async function handleGoogleLogin() {
        if (isAuthenticating) return;
        isAuthenticating = true;
        errorMessage = '';
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // onAuthStateChanged in authStore will handle the rest
        } catch (error: any) {
            console.error('Google Login error:', error);
            if (error.code !== 'auth/popup-closed-by-user') {
                errorMessage = 'Error al iniciar sesión con Google.';
            }
            isAuthenticating = false;
        }
    }

    const tools = [
        {
            title: 'Calculadora Freelance',
            description:
                'Calcula el valor teórico de tu hora de trabajo aproximando gastos mensuales y margen deseado.',
            icon: Calculator,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10 border-blue-400/20',
        },
        {
            title: 'Gestor de Claves',
            description:
                'Genera contraseñas localmente en tu navegador. Las contraseñas generadas no se envían a nuestros servidores.',
            icon: ShieldCheck,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10 border-emerald-400/20',
        },
        {
            title: 'Pomodoro Timer',
            description:
                'Temporizador integrado con la técnica Pomodoro. Ajusta libremente los tiempos de trabajo y descanso.',
            icon: Timer,
            color: 'text-rose-400',
            bg: 'bg-rose-400/10 border-rose-400/20',
        },
        {
            title: 'Tablero Kanban',
            description:
                'Utilidad visual para la organización de tareas. Agrega, mueve y ordena tareas entre las columnas de tu tablero.',
            icon: LayoutList,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10 border-amber-400/20',
        },
        {
            title: 'Generador QR',
            description:
                'Genera códigos QR personalizados desde texto o enlaces para poder compartirlos rápidamente.',
            icon: QrCode,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10 border-purple-400/20',
        },
    ];
</script>

<svelte:head>
    <title>ChillChess | Tu Navaja Suiza Digital Diaria</title>
    <meta
        name="description"
        content="ChillChess reúne todas las herramientas útiles que necesitas en tu día a día: Pomodoro, Kanban, VCard QR, Generador de Claves y más."
    />
</svelte:head>

<div
    class="w-full min-h-[100dvh] bg-black text-slate-200 flex flex-col relative overflow-x-hidden font-sans selection:bg-white/20"
>
    <!-- Liquid Glass Premium Effects -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        <div
            class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/20 via-black to-black"
        ></div>
        <div
            class="absolute top-[20%] left-[10%] w-[600px] h-[600px] bg-slate-800/20 rounded-full blur-[120px] mix-blend-screen opacity-50"
        ></div>
        <div
            class="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] mix-blend-screen opacity-50"
        ></div>
        <div
            class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwem0yMCAyMGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTIgMiAuOSAyIDItLjkgMi0yIDJ6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-[0.15] mix-blend-overlay"
        ></div>
    </div>

    <!-- Hero Section -->
    <main
        class="flex-none flex items-center justify-center relative z-10 w-full pt-16 pb-24 md:pt-24 md:pb-32"
    >
        <div
            class="max-w-7xl w-full mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12"
        >
            <!-- Left Side: Texts -->
            <div
                class="flex-1 w-full max-w-2xl lg:max-w-none flex flex-col items-center lg:items-start text-center lg:text-left"
            >
                <div
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-sm"
                >
                    <Sparkles class="w-4 h-4 text-slate-300" />
                    <span class="text-sm font-medium text-slate-300"
                        >Colección de herramientas web</span
                    >
                </div>

                <h1
                    class="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-tight drop-shadow-sm mb-6"
                >
                    Utilidades para<br class="hidden sm:block" /> tu día a día.
                </h1>

                <p
                    class="text-lg md:text-xl text-slate-400 font-light max-w-xl leading-relaxed mb-10 mx-auto lg:mx-0"
                >
                    ChillChess agrupa diferentes utilidades prácticas en un entorno <span
                        class="text-white font-medium">limpio y sin distracciones</span
                    >.
                </p>

                <div
                    class="flex flex-col sm:flex-row items-center gap-4 text-slate-300 text-sm font-medium mt-4"
                >
                    <a
                        href="/pricing"
                        class="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-white font-medium flex items-center gap-2 backdrop-blur-xl"
                    >
                        <Star class="w-4 h-4 text-slate-300" />
                        Ver Planes y Precios
                    </a>
                </div>
            </div>

            <!-- Right Side: Auth Card -->
            <div class="w-full max-w-md lg:w-[420px] xl:w-[460px] flex-shrink-0 relative group">
                <div
                    class="absolute -inset-1 bg-white/5 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-500"
                ></div>

                <div
                    class="relative bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-8 md:p-10 shadow-2xl flex flex-col items-center"
                >
                    <div
                        class="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6"
                    >
                        <Blocks class="w-8 h-8 text-white" />
                    </div>

                    <h2 class="text-2xl font-medium text-white mb-2 text-center">Inicia Sesión</h2>
                    <p class="text-slate-400 text-sm text-center mb-10 max-w-xs font-light">
                        Accede al panel mediante tu cuenta de Google.
                    </p>

                    {#if errorMessage}
                        <div
                            class="w-full bg-red-950/50 border border-red-500/20 text-red-200 text-sm p-3 rounded-xl mb-6 text-center backdrop-blur-md"
                        >
                            {errorMessage}
                        </div>
                    {/if}

                    <button
                        on:click={handleGoogleLogin}
                        disabled={isAuthenticating}
                        class="w-full relative overflow-hidden bg-white hover:bg-slate-100 text-black rounded-xl py-4 flex items-center justify-center gap-3 font-medium transition-all disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-white/20 group/btn"
                    >
                        {#if isAuthenticating}
                            <div
                                class="w-5 h-5 border-2 border-slate-300 border-t-black rounded-full animate-spin"
                            ></div>
                            <span class="relative z-10 text-lg">Conectando...</span>
                        {:else}
                            <svg class="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span class="relative z-10 text-lg">Continuar con Google</span>
                            <ChevronRight
                                class="w-5 h-5 opacity-0 -ml-5 transition-all group-hover/btn:opacity-100 group-hover/btn:ml-0 delay-75"
                            />
                        {/if}
                    </button>

                    <p class="text-xs text-slate-500 mt-6 text-center font-light leading-relaxed">
                        Al continuar, aceptas la <a
                            href="/cookies"
                            class="text-slate-300 hover:text-white transition-colors"
                            >Política de Cookies</a
                        >.
                    </p>
                </div>
            </div>
        </div>
    </main>

    <!-- Detailed Tools Section -->
    <section class="relative z-10 w-full py-24 border-t border-white/5">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="text-center max-w-2xl mx-auto mb-16">
                <h2 class="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">
                    Utilidades desde el navegador
                </h2>
                <p class="text-slate-400 font-light">
                    Explora las herramientas disponibles que pueden ayudarte en distintas tareas
                    cotidianas.
                </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each tools as tool}
                    <div
                        class="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
                    >
                        <div
                            class="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors"
                        >
                            <svelte:component
                                this={tool.icon}
                                class="w-5 h-5 text-slate-300 group-hover:text-white transition-colors"
                            />
                        </div>
                        <h3
                            class="text-xl font-medium text-white mb-3 group-hover:text-white transition-colors tracking-tight"
                        >
                            {tool.title}
                        </h3>
                        <p class="text-slate-400 font-light text-sm leading-relaxed">
                            {tool.description}
                        </p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Footer Simple -->
    <footer class="relative z-10 w-full py-8 border-t border-white/5 text-center">
        <p class="text-slate-500 font-light text-sm">
            © {new Date().getFullYear()} ChillChess. Todos los derechos reservados.
        </p>
    </footer>

    <!-- Cookie Banner Component -->
    <CookieBanner />
</div>

<style>
    :global(body) {
        overflow-x: hidden;
        background-color: #000;
    }
</style>
