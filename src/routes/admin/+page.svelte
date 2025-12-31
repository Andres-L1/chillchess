<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    import { audioStore } from '$lib/audio/store';

    // Tabs Components
    import UsersTab from '$lib/components/admin/UsersTab.svelte';
    import ProposalsTab from '$lib/components/admin/ProposalsTab.svelte';
    import SubmissionsTab from '$lib/components/admin/SubmissionsTab.svelte';
    import MusicTab from '$lib/components/admin/MusicTab.svelte';
    import LogsTab from '$lib/components/admin/LogsTab.svelte';
    import BugsTab from '$lib/components/admin/BugsTab.svelte';
    import BackupsTab from '$lib/components/admin/BackupsTab.svelte';

    // Icons
    import BackIcon from '$lib/components/icons/BackIcon.svelte';
    import UsersIcon from '$lib/components/icons/UsersIcon.svelte';
    import BulbIcon from '$lib/components/icons/BulbIcon.svelte';
    import MusicIcon from '$lib/components/icons/MusicIcon.svelte';
    import AlertIcon from '$lib/components/icons/AlertIcon.svelte';
    import SystemStatus from '$lib/components/admin/SystemStatus.svelte';

    type Tab =
        | 'dashboard'
        | 'users'
        | 'proposals'
        | 'submissions'
        | 'music'
        | 'bugs'
        | 'backups'
        | 'logs';

    interface TabDef {
        id: Tab;
        label: string;
        icon: string;
        badge?: number;
    }

    let activeTab: Tab = 'dashboard';
    let stats = {
        totalUsers: 0,
        proUsers: 0,
        totalAlbums: 0,
        verifiedArtists: 0,
        pendingSubmissions: 0,
        pendingProposals: 0,
        pendingBugs: 0,
    };

    let loading = true;

    // --- OPTIMIZED STATS LOADING ---
    onMount(async () => {
        await loadStats();
    });

    async function loadStats() {
        loading = true;
        try {
            const { collection, query, where, getCountFromServer } = await import(
                'firebase/firestore'
            );
            const { db } = await import('$lib/firebase');

            // Helper for counts (much faster/cheaper than getDocs)
            const getCount = async (collName: string, constraints: any[] = []) => {
                const coll = collection(db, collName);
                const q = query(coll, ...constraints);
                const snapshot = await getCountFromServer(q);
                return snapshot.data().count;
            };

            // Parallel execution for speed
            const [
                totalUsers,
                proUsers,
                premiumUsers,
                verifiedArtists,
                pendingSubmissions,
                pendingProposals,
                pendingBugs,
            ] = await Promise.all([
                getCount('users'),
                getCount('users', [where('subscriptionTier', '==', 'pro')]),
                getCount('users', [where('subscriptionTier', '==', 'premium')]),
                getCount('artists', [where('isVerified', '==', true)]),
                getCount('musicSubmissions', [where('status', '==', 'pending')]),
                getCount('proposals', [where('status', '==', 'pending')]),
                getCount('bug_reports', [where('status', '==', 'reported')]),
            ]);

            stats = {
                totalUsers,
                proUsers: proUsers + premiumUsers,
                totalAlbums: $audioStore.availableAlbums.length,
                verifiedArtists,
                pendingSubmissions,
                pendingProposals,
                pendingBugs,
            };
        } catch (e) {
            console.error('Error loading stats:', e);
        } finally {
            loading = false;
        }
    }

    $: tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'Usuarios', icon: '👥' },
        {
            id: 'proposals',
            label: 'Propuestas',
            icon: '💡',
            badge: stats.pendingProposals,
        },
        {
            id: 'submissions',
            label: 'Envíos',
            icon: '🎵',
            badge: stats.pendingSubmissions,
        },
        { id: 'music', label: 'Música', icon: '🎼' },
        {
            id: 'bugs',
            label: 'Bugs',
            icon: '🐛',
            badge: stats.pendingBugs,
        },
        { id: 'backups', label: 'Backups', icon: '💾' },
        { id: 'logs', label: 'Logs', icon: '📝' },
    ] as TabDef[];

    let isMobileMenuOpen = false;
</script>

<svelte:head>
    <title>AdminOS | ChillChess</title>
    <meta name="theme-color" content="#0B1120" />
</svelte:head>

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
                transition:fade
            ></div>
        {/if}

        <!-- Sidebar (Responsive: Drawer on Mobile, Fixed on Desktop) -->
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
                        <span class="text-[10px] uppercase text-slate-500 font-bold tracking-widest"
                            >ChillChess</span
                        >
                    </div>
                </div>
                <!-- Close Button (Mobile Only) -->
                <button
                    class="md:hidden text-slate-400 hover:text-white"
                    on:click={() => (isMobileMenuOpen = false)}
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        /></svg
                    >
                </button>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                {#each tabs as tab}
                    <button
                        on:click={() => {
                            activeTab = tab.id;
                            isMobileMenuOpen = false; // Close on select
                        }}
                        class="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden {activeTab ===
                        tab.id
                            ? 'bg-primary-500/10 text-white shadow-lg shadow-primary-500/5 ring-1 ring-primary-500/50'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                    >
                        {#if activeTab === tab.id}
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

                        {#if tab.badge && tab.badge > 0}
                            <span
                                class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/20 animate-pulse"
                            >
                                {tab.badge}
                            </span>
                        {/if}
                    </button>
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

        <!-- Main Content (Windowless Fullscreen Mode) -->
        <main
            class="flex-1 overflow-y-auto bg-[#0B1120] relative custom-scrollbar flex flex-col w-full"
        >
            <!-- Header Sticky -->
            <header
                class="sticky top-0 z-30 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 flex-shrink-0"
            >
                <div class="flex items-center justify-between h-20">
                    <div class="flex items-center gap-4">
                        <!-- Mobile Burger Button -->
                        <button
                            class="md:hidden p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white"
                            on:click={() => (isMobileMenuOpen = true)}
                        >
                            <svg
                                class="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                /></svg
                            >
                        </button>

                        <div>
                            <h2
                                class="text-lg md:text-2xl font-bold text-white flex items-center gap-2"
                            >
                                {tabs.find((t) => t.id === activeTab)?.icon}
                                {tabs.find((t) => t.id === activeTab)?.label}
                            </h2>

                            <p class="text-xs text-slate-400 mt-1">
                                {#if loading}
                                    Actualizando métricas...
                                {:else}
                                    Sistema operativo y funcionando
                                {/if}
                            </p>
                        </div>

                        <div class="flex items-center gap-4">
                            <SystemStatus />
                        </div>
                    </div>
                </div>
            </header>

            <div class="p-8 max-w-7xl mx-auto w-full space-y-8 pb-32 flex-1">
                {#if activeTab === 'dashboard'}
                    <!-- Stats Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" in:fade>
                        <!-- Users Stat -->
                        <div
                            class="bg-[#131b2e]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-colors"
                        >
                            <div
                                class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
                            >
                                <UsersIcon size="lg" />
                            </div>
                            <div class="relative z-10">
                                <h3 class="text-slate-400 text-sm font-medium">Usuarios Totales</h3>
                                <p class="text-3xl font-bold text-white mt-1">
                                    {stats.totalUsers}
                                </p>
                                <div class="mt-2 text-xs flex items-center gap-2">
                                    <span
                                        class="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded font-bold"
                                    >
                                        {stats.proUsers} PRO
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Music Stat -->
                        <div
                            class="bg-[#131b2e]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-orange-500/30 transition-colors"
                        >
                            <div
                                class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
                            >
                                <MusicIcon size="lg" />
                            </div>
                            <div class="relative z-10">
                                <h3 class="text-slate-400 text-sm font-medium">Álbumes Activos</h3>
                                <p class="text-3xl font-bold text-white mt-1">
                                    {stats.totalAlbums}
                                </p>
                                <div class="mt-2 text-xs flex items-center gap-2">
                                    <span
                                        class="text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded font-bold"
                                    >
                                        {stats.verifiedArtists} Artistas
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Proposals Stat -->
                        <div
                            class="bg-[#131b2e]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-colors cursor-pointer"
                            on:click={() => (activeTab = 'proposals')}
                        >
                            <div
                                class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
                            >
                                <BulbIcon size="lg" gradient={false} />
                            </div>
                            <div class="relative z-10">
                                <h3 class="text-slate-400 text-sm font-medium">
                                    Propuestas Pendientes
                                </h3>
                                <p class="text-3xl font-bold text-white mt-1">
                                    {stats.pendingProposals}
                                </p>
                                {#if stats.pendingProposals > 0}
                                    <div class="mt-2 text-xs text-purple-400 font-bold">
                                        Requiere Revisión
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <!-- Bugs Stat (New) -->
                        <div
                            class="bg-[#131b2e]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-red-500/30 transition-colors cursor-pointer"
                            on:click={() => (activeTab = 'bugs')}
                        >
                            <div
                                class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
                            >
                                <AlertIcon size="lg" />
                            </div>
                            <div class="relative z-10">
                                <h3 class="text-slate-400 text-sm font-medium">Bugs Reportados</h3>
                                <p class="text-3xl font-bold text-white mt-1">
                                    {stats.pendingBugs}
                                </p>
                                {#if stats.pendingBugs > 0}
                                    <div class="mt-2 text-xs text-red-400 font-bold animate-pulse">
                                        Acción Requerida
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                {:else if activeTab === 'users'}
                    <UsersTab />
                {:else if activeTab === 'proposals'}
                    <ProposalsTab />
                {:else if activeTab === 'submissions'}
                    <SubmissionsTab />
                {:else if activeTab === 'music'}
                    <MusicTab />
                {:else if activeTab === 'bugs'}
                    <BugsTab />
                {:else if activeTab === 'backups'}
                    <BackupsTab />
                {:else if activeTab === 'logs'}
                    <LogsTab />
                {/if}
            </div>
        </main>
    </div>
</div>

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
