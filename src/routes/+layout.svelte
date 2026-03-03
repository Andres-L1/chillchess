<script lang="ts">
    import '../app.postcss';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore';
    import { Loader2 } from 'lucide-svelte';
    import Sidebar from '$lib/components/layout/Sidebar.svelte';
    import Header from '$lib/components/layout/Header.svelte';
    import Toast from '$lib/components/ui/Toast.svelte';
    import { auth } from '$lib/firebase';
    import { signOut } from 'firebase/auth';

    // Manejar redirecciones basadas en autenticación
    $: {
        if (!$authStore.loading) {
            const publicRoutes = ['/', '/landing', '/pricing', '/cookies'];
            const isPublicRoute = publicRoutes.includes($page.url.pathname);

            if (!$authStore.user) {
                if (!isPublicRoute) {
                    console.log('Layout: Redirecting to landing (Unauthorized)');
                    goto('/landing');
                }
            } else {
                if ($page.url.pathname === '/landing' || $page.url.pathname === '/') {
                    console.log('Layout: Redirecting to freelance (Authorized)');
                    goto('/freelance');
                }
            }
        }
    }

    async function handleLogout() {
        try {
            await signOut(auth);
            goto('/landing');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }
</script>

{#if $authStore.loading}
    <div class="h-screen w-full flex items-center justify-center bg-[#0B0E14]">
        <div class="flex flex-col items-center gap-4">
            <Loader2 class="w-10 h-10 text-brand-500 animate-spin" />
            <p class="text-slate-400 font-medium animate-pulse">Cargando aplicación...</p>
        </div>
    </div>
{:else if ['/landing', '/pricing', '/cookies'].includes($page.url.pathname)}
    <slot />
    <Toast />
{:else}
    <div class="flex h-screen bg-[#0B0E14] overflow-hidden text-slate-200">
        <Sidebar on:logout={handleLogout} />

        <div class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <Header />

            <main class="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 custom-scrollbar">
                <div class="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                    <slot />
                </div>
            </main>
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
