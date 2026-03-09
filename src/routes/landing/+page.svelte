<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import {
        Star,
        Check,
        Sparkles,
        ArrowRight,
        Shield,
        UserX,
        Quote,
        ChevronDown,
        Zap,
        Scan,
        Wallet,
        Palette,
        Cpu,
        Lock,
        FileCheck,
        Eye,
        Server,
        ShieldCheck,
        Heart,
        Layers,
        Search,
        Command,
        Menu,
        Github,
        Linkedin,
        Coffee,
    } from 'lucide-svelte';
    import CookieBanner from '$lib/components/ui/CookieBanner.svelte';
    import { auth, googleProvider } from '$lib/firebase';
    import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';

    let currentUser: any = null;
    let isAuthenticating = false;

    let mobileMenuOpen = false;

    onMount(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            currentUser = user;
        });
        return unsubscribe;
    });

    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }

    async function handleGoogleLogin() {
        if (isAuthenticating) return;
        if (currentUser) {
            goto('/dashboard');
            return;
        }
        isAuthenticating = true;
        try {
            await signInWithPopup(auth, googleProvider);
            goto('/dashboard');
        } catch (error) {
            console.error('Error during login:', error);
        } finally {
            isAuthenticating = false;
        }
    }
</script>

<div class="min-h-screen w-full theme-bg selection:bg-sky-200 dark:selection:bg-sky-900/40">
    <!-- Mobile Depth Bars (NeatPass Style) -->
    <div
        class="fixed top-0 left-0 right-0 z-50 h-px border-t-2 theme-border theme-bg sm:hidden"
    ></div>
    <div
        class="fixed bottom-0 left-0 right-0 z-50 h-px border-t-2 theme-border theme-bg sm:hidden"
    ></div>

    <div class="flex w-full min-h-screen flex-col">
        <!-- Header -->
        <header
            class="relative z-[100] lg:grid lg:grid-cols-[auto_1fr_auto] flex items-center justify-between p-4 gap-4 w-full bg-background-light dark:bg-background-dark border-b-4 border-black shadow-[0_4px_0px_0px_rgba(0,0,0,1)]"
        >
            <div class="flex items-center gap-3">
                <!-- Removed placeholder social buttons -->
            </div>

            <div
                class="absolute left-1/2 transform -translate-x-1/2 lg:relative lg:left-auto lg:transform-none lg:flex lg:justify-center"
            >
                <a
                    href="/"
                    class="group relative inline-flex items-center justify-center px-2 py-1"
                >
                    <span
                        class="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter theme-text uppercase italic"
                        >CHILLCHESS</span
                    >
                    <span
                        class="absolute bottom-0 left-2 right-2 h-[3px] bg-sky-400 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                    ></span>
                </a>
            </div>

            <div class="flex items-center gap-3">
                <div class="hidden lg:flex items-center gap-3">
                    <button
                        class="neo-button-primary px-4 py-2 text-sm"
                        on:click={handleGoogleLogin}
                    >
                        {currentUser ? 'Dashboard' : 'Entrar'}
                    </button>
                </div>
                <button
                    class="lg:hidden neo-button p-2"
                    aria-label="Menu"
                    on:click={toggleMobileMenu}
                >
                    <Menu class="w-5 h-5" />
                </button>
            </div>
        </header>

        <!-- Mobile Menu Overlay -->
        {#if mobileMenuOpen}
            <div class="lg:hidden fixed inset-0 z-[150] flex items-center justify-center p-4">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                    class="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    on:click={toggleMobileMenu}
                    role="presentation"
                ></div>

                <div
                    class="relative w-full max-w-sm neo-card bg-white dark:bg-slate-900 p-8 space-y-6 flex flex-col items-center text-center"
                >
                    <span class="text-2xl font-black theme-text uppercase italic">CHILLCHESS</span>
                    <button
                        class="w-full neo-button-primary py-4 text-xl"
                        on:click={handleGoogleLogin}
                    >
                        {currentUser ? 'Dashboard' : 'Entrar con Google'}
                    </button>
                    <button class="neo-button px-6 py-2" on:click={toggleMobileMenu}>Cerrar</button>
                </div>
            </div>
        {/if}

        <main class="flex-grow w-full border-b-4 border-black theme-bg p-4 sm:p-6 lg:p-8">
            <div class="max-w-7xl mx-auto space-y-24 py-12">
                <!-- Hero Section -->
                <section class="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
                    <div class="flex flex-col gap-8">
                        <div class="space-y-6">
                            <div
                                class="inline-flex items-center gap-2 rounded-full border-2 border-black bg-rose-100 px-3 py-1 text-xs font-black theme-shadow-sm text-rose-700 uppercase tracking-wider"
                            >
                                <Heart class="w-3 h-3 fill-current" />
                                La Navaja Suiza Digital
                            </div>
                            <h1
                                class="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter theme-text uppercase italic"
                            >
                                Todas tus herramientas <span class="bg-sky-400 theme-shadow-sm px-2"
                                    >en un solo lugar.</span
                                >
                            </h1>
                            <p class="max-w-xl text-xl font-bold theme-text opacity-70">
                                Facturas, cronómetros, conversores y más. Herramientas potentes,
                                diseño brutalista, solo 1€/mes por herramienta.
                            </p>
                        </div>
                        <div class="flex flex-wrap gap-4">
                            <button
                                class="neo-button-primary px-8 py-4 text-xl group"
                                on:click={handleGoogleLogin}
                            >
                                Empezar ahora
                                <ArrowRight
                                    class="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform"
                                />
                            </button>
                        </div>
                        <div class="flex flex-col gap-4">
                            <div class="flex items-center gap-6">
                                <div class="flex items-center gap-3">
                                    <span
                                        class="text-sm font-black theme-text uppercase tracking-widest opacity-60"
                                        >Suite de Productividad</span
                                    >
                                </div>
                                <div class="h-8 w-1 bg-black hidden sm:block"></div>
                                <div class="flex items-center gap-2 text-sm font-black theme-text">
                                    <Layers class="w-5 h-5 text-sky-500" />
                                    <span>15+ Herramientas</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="relative hidden lg:flex items-center justify-center">
                        <div
                            class="absolute -inset-20 bg-sky-400/20 rounded-full blur-[100px] -z-10 animate-pulse"
                        ></div>
                        <div
                            class="neo-card p-4 rotate-2 transform hover:rotate-0 transition-transform duration-500 max-w-sm w-full bg-white dark:bg-slate-900"
                        >
                            <div class="space-y-4">
                                <div
                                    class="h-48 bg-emerald-100 rounded-xl border-4 border-black flex items-center justify-center"
                                >
                                    <Zap class="w-20 h-20 text-emerald-500" />
                                </div>
                                <div class="space-y-2">
                                    <div class="h-6 w-3/4 bg-black rounded"></div>
                                    <div class="h-4 w-1/2 bg-zinc-200 rounded"></div>
                                </div>
                                <div class="flex gap-2">
                                    <div
                                        class="h-10 flex-1 bg-sky-400 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    ></div>
                                    <div
                                        class="h-10 flex-1 bg-violet-400 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <!-- Floating elements -->
                        <div
                            class="absolute -top-10 -right-10 neo-card p-3 bg-rose-400 -rotate-6 animate-bounce"
                        >
                            <Heart class="w-8 h-8 text-white fill-current" />
                        </div>
                        <div
                            class="absolute -bottom-10 -left-10 neo-card p-3 bg-amber-400 rotate-12"
                        >
                            <Star class="w-8 h-8 text-white fill-current" />
                        </div>
                    </div>
                </section>

                <hr class="border-t-4 border-black" />

                <!-- Features Grid -->
                <section class="space-y-12">
                    <div class="text-center space-y-4">
                        <div
                            class="inline-flex items-center gap-2 rounded-full border-2 border-black bg-sky-100 px-4 py-1 text-sm font-black theme-shadow-sm uppercase"
                        >
                            Características
                        </div>
                        <h2
                            class="text-4xl sm:text-6xl font-black tracking-tighter theme-text uppercase italic"
                        >
                            Potencia tu flujo de trabajo
                        </h2>
                    </div>

                    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <!-- Feature 1 -->
                        <div
                            class="neo-card p-8 bg-amber-100 space-y-4 group hover:bg-amber-200 transition-colors md:col-span-2 lg:col-span-2"
                        >
                            <div class="flex justify-between items-start">
                                <div
                                    class="p-4 bg-white border-4 border-black rounded-2xl theme-shadow"
                                >
                                    <Zap class="w-10 h-10 text-amber-500" />
                                </div>
                                <span class="text-6xl font-black text-amber-500/20 uppercase"
                                    >01</span
                                >
                            </div>
                            <div class="space-y-2">
                                <h3 class="text-2xl font-black theme-text uppercase italic">
                                    Velocidad Extrema
                                </h3>
                                <p class="text-lg font-bold theme-text opacity-70">
                                    Carga instantánea. Sin esperas. Todas las herramientas listas en
                                    menos de un segundo.
                                </p>
                            </div>
                        </div>

                        <!-- Feature 2 -->
                        <div
                            class="neo-card p-8 bg-emerald-100 space-y-4 hover:bg-emerald-200 transition-colors"
                        >
                            <div
                                class="p-4 bg-white border-4 border-black rounded-2xl theme-shadow w-fit"
                            >
                                <ShieldCheck class="w-8 h-8 text-emerald-500" />
                            </div>
                            <div class="space-y-2">
                                <h3 class="text-xl font-black theme-text uppercase italic">
                                    Privacidad Total
                                </h3>
                                <p class="font-bold theme-text opacity-70">
                                    Tus datos nunca salen de tu dispositivo. Procesamiento 100%
                                    local.
                                </p>
                            </div>
                        </div>

                        <!-- Feature 3 -->
                        <div
                            class="neo-card p-8 bg-violet-100 space-y-4 hover:bg-violet-200 transition-colors"
                        >
                            <div
                                class="p-4 bg-white border-4 border-black rounded-2xl theme-shadow w-fit"
                            >
                                <Palette class="w-8 h-8 text-violet-500" />
                            </div>
                            <div class="space-y-2">
                                <h3 class="text-xl font-black theme-text uppercase italic">
                                    Diseño Único
                                </h3>
                                <p class="font-bold theme-text opacity-70">
                                    Neo-Brutalismo en estado puro. Estética premium para usuarios
                                    exigentes.
                                </p>
                            </div>
                        </div>

                        <!-- Feature 4 -->
                        <div
                            class="neo-card p-8 bg-sky-100 space-y-4 hover:bg-sky-200 transition-colors md:col-span-2 lg:col-span-2"
                        >
                            <div class="flex justify-between items-start">
                                <div
                                    class="p-4 bg-white border-4 border-black rounded-2xl theme-shadow"
                                >
                                    <Layers class="w-10 h-10 text-sky-500" />
                                </div>
                                <span class="text-6xl font-black text-sky-500/20 uppercase">02</span
                                >
                            </div>
                            <div class="space-y-2">
                                <h3 class="text-2xl font-black theme-text uppercase italic">
                                    Todo en Uno
                                </h3>
                                <p class="text-lg font-bold theme-text opacity-70">
                                    Desde generadores de facturas hasta temporizadores Pomodoro. No
                                    busques más aplicaciones sueltas.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Redundant Before/After Section Removed -->

                <!-- FAQ Section -->
                <section class="max-w-4xl mx-auto space-y-12">
                    <div class="text-center space-y-4">
                        <div
                            class="inline-flex items-center gap-2 rounded-full border-2 border-black bg-violet-100 px-4 py-1 text-sm font-black theme-shadow-sm uppercase"
                        >
                            FAQ
                        </div>
                        <h2
                            class="text-4xl sm:text-5xl font-black tracking-tighter theme-text uppercase italic"
                        >
                            Preguntas frecuentes
                        </h2>
                    </div>

                    <div class="space-y-4">
                        {#each [{ q: '¿Cuánto cuesta?', a: '¡Solo 1€ al mes por herramienta! Chill Chess ofrece una experiencia premium a un precio simbólico para mantener el desarrollo constante de nuevas utilidades.' }, { q: '¿Dónde se guardan mis datos?', a: 'Tus datos se sincronizan de forma segura con tu cuenta de Google a través de Firebase, permitiéndote acceder a ellos desde cualquier dispositivo.' }, { q: '¿Necesito crear una cuenta?', a: 'Sí, es necesario registrarse con tu cuenta de Google para poder desbloquear las herramientas, sincronizar tus datos en la nube y guardar tus configuraciones permanentemente.' }, { q: '¿Habrá más herramientas?', a: '¡Constantemente! Añadimos nuevas utilidades basadas en las necesidades reales de los profesionales digitales.' }] as item, i}
                            <details
                                class="group neo-card bg-white dark:bg-slate-900 overflow-hidden"
                            >
                                <summary
                                    class="flex items-center justify-between p-6 cursor-pointer list-none"
                                >
                                    <div class="flex items-center gap-4">
                                        <span
                                            class="flex h-8 w-8 items-center justify-center rounded bg-sky-400 border-2 border-black text-white font-black text-sm"
                                        >
                                            0{i + 1}
                                        </span>
                                        <span class="text-xl font-black theme-text uppercase italic"
                                            >{item.q}</span
                                        >
                                    </div>
                                    <ChevronDown
                                        class="w-6 h-6 transform group-open:rotate-180 transition-transform"
                                    />
                                </summary>
                                <div class="px-18 pb-6 pl-18 md:pl-18">
                                    <p class="text-lg font-bold opacity-70 p-6 pt-0">{item.a}</p>
                                </div>
                            </details>
                        {/each}
                    </div>
                </section>

                <!-- CTA Section -->
                <section class="relative">
                    <div
                        class="neo-card bg-black p-12 sm:p-20 text-center space-y-8 overflow-hidden"
                    >
                        <div
                            class="absolute top-0 right-0 w-64 h-64 bg-sky-400 blur-[120px] opacity-20 -z-10"
                        ></div>
                        <div
                            class="absolute bottom-0 left-0 w-64 h-64 bg-violet-400 blur-[120px] opacity-20 -z-10"
                        ></div>

                        <div class="space-y-4">
                            <h2
                                class="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.9]"
                            >
                                ¿Listo para subir de nivel?
                            </h2>
                            <p class="text-xl font-bold text-zinc-400 max-w-2xl mx-auto">
                                Únete a miles de usuarios que ya disfrutan de la mejor suite de
                                herramientas web.
                            </p>
                        </div>

                        <div class="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                class="px-10 py-5 bg-sky-400 text-black font-black text-2xl border-4 border-black theme-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                on:click={handleGoogleLogin}
                            >
                                ABRIR DASHBOARD
                            </button>
                            <button
                                class="px-10 py-5 bg-white text-black font-black text-2xl border-4 border-black theme-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                on:click={handleGoogleLogin}
                            >
                                ACCESO RÁPIDO
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>

        <!-- Footer -->
        <footer class="theme-bg border-t-4 border-black p-12">
            <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div class="space-y-4">
                    <span class="text-3xl font-black tracking-tighter theme-text uppercase italic"
                        >CHILLCHESS</span
                    >
                    <p class="font-bold theme-text opacity-60">
                        La navaja suiza para el profesional digital moderno.
                    </p>
                </div>
                <div class="space-y-4">
                    <h4 class="font-black theme-text uppercase italic underline">Herramientas</h4>
                    <ul class="space-y-2 font-bold opacity-70">
                        <li>
                            <a href="/dashboard?tool=invoice" class="hover:text-sky-500">Facturas</a
                            >
                        </li>
                        <li>
                            <a href="/dashboard?tool=freelance" class="hover:text-emerald-500"
                                >Freelance</a
                            >
                        </li>
                        <li>
                            <a href="/dashboard?tool=pomodoro" class="hover:text-rose-500"
                                >Pomodoro</a
                            >
                        </li>
                    </ul>
                </div>
                <div class="space-y-4">
                    <h4 class="font-black theme-text uppercase italic underline">Comunidad</h4>
                    <ul class="space-y-2 font-bold opacity-70">
                        <li>
                            <a
                                href="https://github.com/vittorio626/ChillChess"
                                class="hover:text-black">GitHub</a
                            >
                        </li>
                    </ul>
                </div>
                <div class="space-y-4">
                    <h4 class="font-black theme-text uppercase italic underline">Legal</h4>
                    <ul class="space-y-2 font-bold opacity-70">
                        <li><a href="/privacypolicy" class="hover:text-zinc-500">Privacidad</a></li>
                        <li><a href="/tos" class="hover:text-zinc-500">Términos</a></li>
                    </ul>
                </div>
            </div>
            <div
                class="max-w-7xl mx-auto mt-12 pt-8 border-t-2 border-black/10 flex flex-col md:flex-row justify-between items-center gap-4"
            >
                <p class="font-bold opacity-40 text-sm">
                    © 2026 Chill Chess. Hecho con ❤️ para la comunidad.
                </p>
                <div class="flex gap-4">
                    <div
                        class="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 border-2 border-black rounded font-black text-xs"
                    >
                        v2.1.0
                    </div>
                </div>
            </div>
        </footer>
    </div>
</div>

<CookieBanner />

<style>
    /* Custom styles for details/summary */
    details summary::-webkit-details-marker {
        display: none;
    }

    :global(.neo-shadow-hover:hover) {
        transform: translate(2px, 2px);
        box-shadow: none;
    }
</style>
