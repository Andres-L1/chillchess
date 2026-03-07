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
        goto('/dashboard');
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
        class="flex-none flex items-center justify-center relative z-10 w-full pt-16 pb-24 md:pt-32 md:pb-48 px-6 lg:px-12"
    >
        <!-- Floating Assets (NeatPass Style) -->
        <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div
                class="absolute top-[20%] right-[15%] w-64 h-80 bg-gradient-to-br from-neat-accent/20 to-indigo-500/10 rounded-[3rem] border border-white/5 backdrop-blur-3xl rotate-12 animate-float shadow-2xl"
                style="animation-delay: 1s"
            ></div>
            <div
                class="absolute bottom-[10%] left-[5%] w-48 h-64 bg-gradient-to-tr from-white/5 to-white/10 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl -rotate-6 animate-float"
            ></div>
        </div>

        <div
            class="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24 relative z-10"
        >
            <!-- Left Side: Texts -->
            <div
                class="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left"
            >
                <div
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl mb-10 shadow-xl"
                >
                    <div class="w-2 h-2 rounded-full bg-neat-accent animate-pulse"></div>
                    <span class="text-xs font-black text-slate-300 uppercase tracking-[0.2em]"
                        >Built for Professionals</span
                    >
                </div>

                <h1
                    class="text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter leading-[0.85] mb-8"
                >
                    <span class="block">YOUR.</span>
                    <span class="block hero-text-gradient">DIGITAL.</span>
                    <span class="block">SWISS.</span>
                    <span class="block opacity-50">KNIFE.</span>
                </h1>

                <p
                    class="text-xl md:text-2xl text-slate-500 font-bold max-w-xl leading-snug mb-12 mx-auto lg:mx-0"
                >
                    ChillChess is a minimalist collection of essential tools for your daily
                    workflow. <span class="text-white">Private. Beautiful. Efficient.</span>
                </p>

                <div class="flex flex-col sm:flex-row items-center gap-6">
                    <button on:click={handleGoogleLogin} class="neat-button-primary group px-10">
                        <span>GET STARTED</span>
                        <ChevronRight
                            class="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        />
                    </button>
                    <a href="/pricing" class="neat-button-secondary px-10"> LEARN MORE </a>
                </div>
            </div>

            <!-- Right Side: Auth/Login Card -->
            <div class="w-full max-w-md lg:w-[460px] flex-shrink-0 relative group">
                <div
                    class="absolute -inset-4 bg-neat-accent/10 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000"
                ></div>

                <div class="glass-card p-10 md:p-14 relative z-10 overflow-hidden">
                    <!-- Small subtle light effect -->
                    <div
                        class="absolute -top-24 -right-24 w-48 h-48 bg-neat-accent/10 rounded-full blur-[60px]"
                    ></div>

                    <div
                        class="flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-8 shadow-inner"
                    >
                        <Blocks class="w-10 h-10 text-white" />
                    </div>

                    <h2 class="text-3xl font-black text-white mb-3 tracking-tighter uppercase">
                        Sign In
                    </h2>
                    <p class="text-slate-500 text-lg font-bold mb-12 tracking-tight">
                        Continue to your dashboard
                    </p>

                    {#if errorMessage}
                        <div
                            class="w-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold p-4 rounded-2xl mb-8 text-center backdrop-blur-3xl animate-in fade-in"
                        >
                            {errorMessage}
                        </div>
                    {/if}

                    <button
                        on:click={handleGoogleLogin}
                        disabled={isAuthenticating}
                        class="w-full group/btn relative overflow-hidden bg-white hover:bg-slate-100 text-black rounded-2xl py-5 flex items-center justify-center gap-4 font-black text-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                        {#if isAuthenticating}
                            <div
                                class="w-6 h-6 border-3 border-slate-300 border-t-black rounded-full animate-spin"
                            ></div>
                        {:else}
                            <svg class="w-6 h-6" viewBox="0 0 24 24">
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
                            <span>GOOGLE</span>
                        {/if}
                    </button>

                    <p
                        class="text-[10px] text-slate-600 mt-8 text-center font-black uppercase tracking-[0.2em]"
                    >
                        Your data never leaves your device.
                    </p>
                </div>
            </div>
        </div>
    </main>

    <!-- Detailed Tools Section -->
    <section class="relative z-10 w-full py-32 border-t border-white/5 bg-white/[0.01]">
        <div class="max-w-7xl mx-auto px-6 lg:px-12">
            <div class="text-center max-w-3xl mx-auto mb-24">
                <h2
                    class="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter"
                >
                    Built for Efficiency.
                </h2>
                <p class="text-slate-500 font-bold text-xl tracking-tight">
                    Every tool is designed to provide utility without the noise. Browse our growing
                    collection of professional web utilities.
                </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each tools as tool}
                    <div
                        class="glass-card !rounded-[2.5rem] p-10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group flex flex-col h-full"
                    >
                        <div
                            class="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 bg-white/5 border border-white/10 group-hover:bg-neat-accent group-hover:text-black transition-all duration-500"
                        >
                            <svelte:component
                                this={tool.icon}
                                class="w-6 h-6 shrink-0 transition-all group-hover:scale-110"
                            />
                        </div>
                        <h3
                            class="text-2xl font-black text-white mb-4 tracking-tighter uppercase group-hover:text-neat-accent transition-colors"
                        >
                            {tool.title}
                        </h3>
                        <p class="text-slate-500 font-bold text-lg leading-snug tracking-tight">
                            {tool.description}
                        </p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Footer Simple -->
    <footer class="relative z-10 w-full py-16 border-t border-white/5 text-center">
        <p class="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} CHILLCHESS PLATFORM. ALL RIGHTS RESERVED.
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
