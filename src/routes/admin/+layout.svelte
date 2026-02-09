<script lang="ts">
    import { page } from '$app/stores';
    import { userStore } from '$lib/auth/userStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { fade, scale } from 'svelte/transition';

    // Icons
    import BackIcon from '$lib/components/icons/BackIcon.svelte';
    import SystemStatus from '$lib/components/admin/SystemStatus.svelte';

    let isAuthorized = false;
    let isLoading = true;
    let isMobileMenuOpen = false;

    // Navigation Configuration
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/admin' },
        { id: 'users', label: 'Usuarios', icon: '👥', href: '/admin/users' },
        { id: 'proposals', label: 'Propuestas', icon: '💡', href: '/admin/proposals' },
        { id: 'submissions', label: 'Envíos', icon: '🎵', href: '/admin/submissions' },
        { id: 'music', label: 'Música', icon: '🎼', href: '/admin/music' },
        { id: 'bugs', label: 'Bugs', icon: '🐛', href: '/admin/bugs' },
        { id: 'cleanup', label: 'Limpieza', icon: '🧹', href: '/admin/cleanup' },
        { id: 'backups', label: 'Backups', icon: '💾', href: '/admin/backups' },
        { id: 'logs', label: 'Logs', icon: '📝', href: '/admin/logs' },
    ];

    $: currentPath = $page.url.pathname;
    $: activeTab =
        tabs.find(
            (t) => t.href === currentPath || (t.href !== '/admin' && currentPath.startsWith(t.href))
        ) || tabs[0];

    onMount(async () => {
        if ($userStore.loading) {
            const unsubscribe = userStore.subscribe((state) => {
                if (!state.loading) {
                    checkAccess(state.user);
                    unsubscribe();
                }
            });
        } else {
            checkAccess($userStore.user);
        }
    });

    async function checkAccess(user: any) {
        if (!user) {
            isLoading = false;
            goto('/');
            return;
        }

        const ADMIN_EMAIL = 'andreslgumuzio@gmail.com';

        if (user.email !== ADMIN_EMAIL) {
            console.warn('Unauthorized admin access attempt');
            isLoading = false;
            goto('/');
            return;
        }

        try {
            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('$lib/firebase');

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();

            if (userData?.isAdmin === true) {
                isAuthorized = true;
            } else {
                goto('/');
            }
        } catch (error) {
            console.error('Error checking admin access:', error);
            goto('/');
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>AdminOS | {activeTab.label}</title>
    <meta name="theme-color" content="#0B1120" />
</svelte:head>

{#if isLoading}
    <div class="min-h-screen flex items-center justify-center bg-[#0B1120]">
        <div class="text-center">
            <div
                class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mb-4"
            ></div>
            <p class="text-white/60 font-medium">Verificando acceso...</p>
        </div>
    </div>
{:else if isAuthorized}
    <div class="min-h-screen bg-[#0B1120] text-slate-200 font-poppins relative overflow-hidden">
        <!-- Ambient Background Glows -->
        <div
            class="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"
        ></div>
        <div
            class="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"
        ></div>

        <div class="flex h-screen overflow-hidden relative z-10">
            <!-- Mobile Menu Overlay -->
            {#if isMobileMenuOpen}
                <div
                    class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    on:click={() => (isMobileMenuOpen = false)}
                    on:keydown={() => {}}
                    role="button"
                    tabindex="0"
                    transition:fade
                ></div>
            {/if}

            <!-- Sidebar -->
            <aside
                class="
                    fixed md:relative z-50 h-full w-72
                    bg-[#131b2e]/90 md:bg-[#131b2e]/60 backdrop-blur-2xl
                    border-r border-white/5 flex flex-col shadow-2xl
                    transition-transform duration-300 ease-in-out
                    {isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                "
            >
                <!-- Logo Area -->
                <div class="p-8 border-b border-white/5 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center shadow-lg shadow-primary-500/20"
                        >
                            <span class="text-xl">♛</span>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-white tracking-tight leading-none">
                                AdminOS
                            </h1>
                            <span
                                class="text-[10px] uppercase text-slate-500 font-bold tracking-widest"
                                >ChillChess</span
                            >
                        </div>
                    </div>
                    <button
                        class="md:hidden text-slate-400 hover:text-white"
                        on:click={() => (isMobileMenuOpen = false)}
                    >
                        ✕
                    </button>
                </div>

                <!-- Navigation -->
                <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    {#each tabs as tab}
                        <a
                            href={tab.href}
                            on:click={() => (isMobileMenuOpen = false)}
                            class="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden {currentPath ===
                                tab.href ||
                            (tab.href !== '/admin' && currentPath.startsWith(tab.href))
                                ? 'bg-primary-500/10 text-white shadow-lg shadow-primary-500/5 ring-1 ring-primary-500/50'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                        >
                            {#if currentPath === tab.href || (tab.href !== '/admin' && currentPath.startsWith(tab.href))}
                                <div
                                    class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(255,123,61,0.5)]"
                                    transition:scale
                                ></div>
                            {/if}

                            <div class="flex items-center gap-3 relative z-10">
                                <span
                                    class="text-xl opacity-80 group-hover:scale-110 transition-transform"
                                    >{tab.icon}</span
                                >
                                <span class="font-medium text-sm tracking-wide">{tab.label}</span>
                            </div>
                        </a>
                    {/each}
                </nav>

                <!-- User Footer -->
                <div class="p-4 border-t border-white/5 bg-[#0f1524]/50">
                    <a
                        href="/"
                        class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group text-slate-400 hover:text-white w-full"
                    >
                        <div
                            class="bg-white/5 p-2 rounded-lg group-hover:bg-white/10 transition-colors"
                        >
                            <BackIcon size="sm" />
                        </div>
                        <div class="flex flex-col text-left">
                            <span class="text-xs font-bold">Volver a la App</span>
                            <span class="text-[10px]">Salir del panel</span>
                        </div>
                    </a>
                </div>
            </aside>

            <!-- Main Content Area -->
            <main
                class="flex-1 overflow-y-auto bg-[#0B1120] relative custom-scrollbar flex flex-col w-full"
            >
                <!-- Header Sticky -->
                <header
                    class="sticky top-0 z-30 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 flex-shrink-0"
                >
                    <div class="flex items-center justify-between h-20">
                        <div class="flex items-center gap-4 w-full justify-between">
                            <div class="flex items-center gap-4">
                                <button
                                    class="md:hidden p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white"
                                    on:click={() => (isMobileMenuOpen = true)}
                                >
                                    ☰
                                </button>

                                <div>
                                    <h2
                                        class="text-lg md:text-2xl font-bold text-white flex items-center gap-2"
                                    >
                                        {activeTab?.icon}
                                        {activeTab?.label}
                                    </h2>
                                </div>
                            </div>

                            <SystemStatus />
                        </div>
                    </div>
                </header>

                <div class="p-8 max-w-7xl mx-auto w-full space-y-8 pb-32 flex-1">
                    <slot />
                </div>
            </main>
        </div>
    </div>
{/if}

<style>
    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
</style>
