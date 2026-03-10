<script lang="ts">
    import '../app.postcss';
    import { page } from '$app/stores';
    import { themeVariables, themeModeStore } from '$lib/stores/themeStore';
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
        // Sincronizar clase dark con el store
        const unsubscribeTheme = themeModeStore.subscribe((mode) => {
            if (typeof document !== 'undefined') {
                document.documentElement.classList.toggle('dark', mode === 'dark');
            }
        });

        const settingsRef = doc(db, 'settings', 'global');
        unsubscribeSettings = onSnapshot(settingsRef, (snap) => {
            if (snap.exists()) {
                globalSettings = snap.data();
            } else {
                globalSettings = null;
            }
        });

        return () => {
            unsubscribeTheme();
        };
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
            const isWidgetRoute = $page.url.pathname.startsWith('/widgets');
            const isPublicRoute = publicRoutes.includes($page.url.pathname) || isWidgetRoute;

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
    <div
        class="h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark"
    >
        <div class="flex flex-col items-center gap-6">
            <div
                class="w-16 h-16 border-4 border-black border-t-primary rounded-full animate-spin shadow-neo-sm bg-white"
            ></div>
            <p
                class="text-black dark:text-white font-black text-xl uppercase tracking-widest animate-pulse"
            >
                Cargando...
            </p>
        </div>
    </div>
{:else if isMaintenance}
    <div
        class="h-screen w-full flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6"
    >
        <div
            class="max-w-lg w-full bg-white dark:bg-slate-900 border-4 border-black p-10 shadow-neo text-center space-y-8"
        >
            <div
                class="w-20 h-20 bg-red-100 border-4 border-black flex items-center justify-center mx-auto transform -rotate-3"
            >
                <ShieldAlert class="w-12 h-12 text-red-600" />
            </div>
            <h1 class="text-4xl font-black text-black dark:text-white uppercase tracking-tighter">
                Modo Mantenimiento
            </h1>
            <p class="text-xl font-bold text-slate-600 dark:text-slate-400 leading-tight">
                Estamos realizando mejoras en la plataforma.<br />Volveremos a estar operativos muy
                pronto.
            </p>
            {#if !$authStore.user}
                <button
                    on:click={handleAdminLogin}
                    class="px-6 py-2 bg-black text-white font-bold hover:bg-primary transition-colors border-2 border-black shadow-neo-sm"
                >
                    Acceso Admin
                </button>
            {/if}
        </div>
    </div>
    <Toast />
{:else if ['/', '/landing', '/pricing', '/cookies'].includes($page.url.pathname)}
    {@const isLanding = $page.url.pathname === '/landing'}
    <div class="flex flex-col min-h-screen w-full bg-background-light dark:bg-background-dark">
        {#if !isLanding && globalSettings?.globalMessageActive && globalSettings?.globalMessageText}
            <div
                class="w-full bg-yellow-300 border-b-2 border-black px-4 py-2 flex items-center justify-center gap-3 text-center text-sm font-black uppercase tracking-widest text-black relative z-50 shadow-neo-sm"
            >
                <Info class="w-4 h-4 flex-shrink-0" />
                <span>{globalSettings.globalMessageText}</span>
            </div>
        {/if}
        <div class="flex-1 w-full {isLanding ? '' : 'pt-28'}">
            <slot />
        </div>
    </div>
    <Toast />
{:else if $page.url.pathname.startsWith('/widgets')}
    <slot />
{:else}
    <div
        class="flex h-screen w-full bg-background-light dark:bg-background-dark overflow-hidden text-black dark:text-white selection:bg-primary/30"
    >
        <!-- Sidebar and Content -->
        <div class="flex h-screen w-full relative z-10">
            <Sidebar />

            <div
                class="flex-1 flex flex-col min-w-0 overflow-hidden relative border-l-2 border-black"
            >
                {#if globalSettings?.globalMessageActive && globalSettings?.globalMessageText}
                    <div
                        class="w-full bg-yellow-300 border-b-2 border-black px-6 py-2 flex items-center justify-center gap-3 text-center text-sm font-black uppercase tracking-widest text-black z-40 shadow-neo-sm"
                    >
                        <Info class="w-4 h-4 flex-shrink-0" />
                        <span>{globalSettings.globalMessageText}</span>
                    </div>
                {/if}
                <Header />

                <main
                    class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-background-light dark:bg-background-dark/50"
                >
                    <div class="max-w-7xl mx-auto">
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

    /* Global Neo-Brutalist Scrollbar */
    :global(::-webkit-scrollbar) {
        width: 14px;
        height: 14px;
    }

    :global(::-webkit-scrollbar-track) {
        background: #fff;
        border-left: 3px solid #000;
        border-right: 3px solid #000;
    }

    :global(::-webkit-scrollbar-thumb) {
        background: var(--primary, #6366f1);
        border: 3px solid #000;
        box-shadow: inset -2px -2px 0px 0px rgba(0,0,0,0.2);
    }

    :global(::-webkit-scrollbar-thumb:hover) {
        background: #000;
        cursor: pointer;
    }

    /* Firefox Support */
    :global(html) {
        scrollbar-width: auto;
        scrollbar-color: #000 #fff;
    }
</style>
