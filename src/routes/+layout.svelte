<script lang="ts">
    import '../app.postcss';
    import { page } from '$app/stores';
    import { themeVariables } from '$lib/stores/themeStore';
    import { mobileMenuOpen } from '$lib/stores/ui';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore';
    import { Loader2, ShieldAlert, Info } from 'lucide-svelte';
    import { onMount, onDestroy } from 'svelte';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { db, auth } from '$lib/firebase';
    import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

    async function handleAdminLogin() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error in admin login:', error);
        }
    }

    let globalSettings: any = null;
    let unsubscribeSettings: () => void;

    onMount(() => {
        const settingsRef = doc(db, 'settings', 'global');
        unsubscribeSettings = onSnapshot(settingsRef, (snap) => {
            if (snap.exists()) {
                globalSettings = snap.data();
            } else {
                globalSettings = null;
            }
        });
    });

    onDestroy(() => {
        if (unsubscribeSettings) unsubscribeSettings();
    });

    $: isMaintenance = globalSettings?.maintenanceMode && !$authStore.user?.isAdmin;
    import Sidebar from '$lib/components/layout/Sidebar.svelte';
    import Header from '$lib/components/layout/Header.svelte';
    import Toast from '$lib/components/ui/Toast.svelte';

    // Manejar redirecciones basadas en autenticación
    $: {
        if (!$authStore.loading) {
            const publicRoutes = ['/', '/landing', '/pricing', '/cookies'];
            const isPublicRoute = publicRoutes.includes($page.url.pathname);

            if (!$authStore.user) {
                if (!isPublicRoute) {
                    goto('/landing');
                }
            } else {
                if ($page.url.pathname === '/landing' || $page.url.pathname === '/') {
                    goto('/dashboard');
                }
            }
        }
    }

    // Lógica global para "Deslizar para abrir" (Swipe to open) desde el borde izquierdo
    let touchStartGlobalX = 0;
    let touchStartGlobalY = 0;

    function handleGlobalTouchStart(e: TouchEvent) {
        // Solo iniciamos si el toque empieza en los primeros 30 píxeles de la izquierda
        if (e.touches[0].clientX < 30) {
            touchStartGlobalX = e.touches[0].clientX;
            touchStartGlobalY = e.touches[0].clientY;
        } else {
            touchStartGlobalX = 0;
            touchStartGlobalY = 0;
        }
    }

    function handleGlobalTouchEnd(e: TouchEvent) {
        if (!touchStartGlobalX || $mobileMenuOpen || window.innerWidth >= 768) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const swipeDistanceX = touchEndX - touchStartGlobalX;
        const swipeDistanceY = Math.abs(touchEndY - touchStartGlobalY);

        // Si se desliza hacia la derecha más de 40px, y el movimiento es predominantemente horizontal
        if (swipeDistanceX > 40 && swipeDistanceY < 50) {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }
            mobileMenuOpen.set(true);
        }

        touchStartGlobalX = 0;
        touchStartGlobalY = 0;
    }
</script>

<svelte:head>
    {@html '<sty' + 'le>:root {\n' + $themeVariables + '\n}</sty' + 'le>'}
</svelte:head>

<svelte:window on:touchstart={handleGlobalTouchStart} on:touchend={handleGlobalTouchEnd} />

{#if $authStore.loading}
    <div class="h-screen w-full flex items-center justify-center bg-[#0B0E14]">
        <div class="flex flex-col items-center gap-4">
            <Loader2 class="w-10 h-10 text-neat-accent animate-spin" />
            <p class="text-slate-400 font-medium animate-pulse">Cargando aplicación...</p>
        </div>
    </div>
{:else if isMaintenance}
    <div
        class="h-screen w-full flex flex-col items-center justify-center bg-[#0B0E14] text-center p-6 relative overflow-hidden"
    >
        <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div
                class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] mix-blend-screen"
            ></div>
        </div>
        <div
            class="relative z-10 flex flex-col items-center max-w-lg bg-black/40 backdrop-blur-3xl border border-white/10 p-8 rounded-3xl shadow-2xl"
        >
            <div
                class="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 mb-6 shadow-inner drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
                <ShieldAlert class="w-8 h-8" />
            </div>
            <h1 class="text-3xl font-bold text-white mb-3 tracking-tight">Modo Mantenimiento</h1>
            <p class="text-slate-400 mb-6 border-b border-white/10 pb-6 w-full leading-relaxed">
                Estamos realizando mejoras en la plataforma.<br />Volveremos a estar operativos muy
                pronto.
            </p>
            {#if !$authStore.user}
                <button
                    on:click={handleAdminLogin}
                    class="text-xs text-slate-500 hover:text-white transition-colors underline underline-offset-4"
                >
                    Acceso para administradores
                </button>
            {/if}
        </div>
    </div>
    <Toast />
{:else if ['/', '/landing', '/pricing', '/cookies'].includes($page.url.pathname)}
    <div class="flex flex-col min-h-screen relative">
        {#if globalSettings?.globalMessageActive && globalSettings?.globalMessageText && $page.url.pathname !== '/landing'}
            <div
                class="w-full bg-neat-accent/10 border-b border-white/5 px-4 py-2.5 flex items-center justify-center gap-3 text-center text-xs font-black uppercase tracking-widest text-neat-accent backdrop-blur-md relative z-50"
            >
                <Info class="w-4 h-4 flex-shrink-0" />
                <span>{globalSettings.globalMessageText}</span>
            </div>
        {/if}
        <div class="flex-1 w-full">
            <slot />
        </div>
    </div>
    <Toast />
{:else}
    <div
        class="flex h-screen w-full bg-[#03060B] overflow-hidden text-slate-200 relative selection:bg-neat-accent/20"
    >
        <!-- Ambient Background Glow (NeatPass Style) -->
        <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div
                class="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-neat-accent/5 rounded-full blur-[150px] mix-blend-screen animate-pulse"
                style="animation-duration: 10s"
            ></div>
            <div
                class="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[50vw] bg-indigo-500/5 rounded-full blur-[120px] mix-blend-screen"
            ></div>
        </div>

        <!-- Layout Content -->
        <div class="flex h-screen w-full relative z-10">
            <Sidebar />

            <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {#if globalSettings?.globalMessageActive && globalSettings?.globalMessageText && $page.url.pathname !== '/landing'}
                    <div
                        class="w-full bg-neat-accent/5 border-b border-white/5 px-6 py-2.5 flex items-center justify-center gap-3 text-center text-xs font-black uppercase tracking-widest text-neat-accent backdrop-blur-3xl z-40"
                    >
                        <Info class="w-4 h-4 flex-shrink-0" />
                        <span>{globalSettings.globalMessageText}</span>
                    </div>
                {/if}
                <Header />

                <main class="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-12 custom-scrollbar">
                    <div
                        class="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] fill-mode-both"
                    >
                        <slot />
                    </div>
                </main>
            </div>
        </div>
    </div>
    <Toast />
{/if}

<style>
    :global(html) {
        scroll-behavior: smooth;
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #1e232e;
        border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #2a3140;
    }

    /* Support for Firefox */
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #1e232e transparent;
    }
</style>
