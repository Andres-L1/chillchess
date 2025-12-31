<script lang="ts">
    import { onMount } from "svelte";
    import { fade, fly, scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { audioStore } from "$lib/audio/store";
    import UsersTab from "$lib/components/admin/UsersTab.svelte";
    import ProposalsTab from "$lib/components/admin/ProposalsTab.svelte";
    import SubmissionsTab from "$lib/components/admin/SubmissionsTab.svelte";
    import MusicTab from "$lib/components/admin/MusicTab.svelte";
    import LogsTab from "$lib/components/admin/LogsTab.svelte";
    import BugsTab from "$lib/components/admin/BugsTab.svelte";

    // Icons
    import BackIcon from "$lib/components/icons/BackIcon.svelte";
    import UsersIcon from "$lib/components/icons/UsersIcon.svelte";
    import BulbIcon from "$lib/components/icons/BulbIcon.svelte";
    import MusicIcon from "$lib/components/icons/MusicIcon.svelte";
    import CollectionIcon from "$lib/components/icons/CollectionIcon.svelte";
    import AlertIcon from "$lib/components/icons/AlertIcon.svelte";
    import SystemStatus from "$lib/components/admin/SystemStatus.svelte";

    type Tab =
        | "dashboard"
        | "users"
        | "proposals"
        | "submissions"
        | "music"
        | "bugs"
        | "logs";

    interface TabDef {
        id: Tab;
        label: string;
        icon: string;
        badge?: number;
    }

    let activeTab: Tab = "dashboard";
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

    onMount(async () => {
        await loadStats();
    });

    async function loadStats() {
        loading = true;
        try {
            const { collection, getDocs, query, where } = await import(
                "firebase/firestore"
            );
            const { db } = await import("$lib/firebase");

            // Users stats
            const usersSnap = await getDocs(collection(db, "users"));
            stats.totalUsers = usersSnap.size;
            stats.proUsers = usersSnap.docs.filter((doc) => {
                const tier = doc.data().subscriptionTier;
                return tier === "pro" || tier === "premium";
            }).length;

            // Verified artists
            const artistsRef = collection(db, "artists");
            const verifiedQuery = query(
                artistsRef,
                where("isVerified", "==", true),
            );
            const artistsSnap = await getDocs(verifiedQuery);
            stats.verifiedArtists = artistsSnap.size;

            // Albums
            stats.totalAlbums = $audioStore.availableAlbums.length;

            // Pending submissions
            const submissionsRef = collection(db, "musicSubmissions");
            const pendingSubsQuery = query(
                submissionsRef,
                where("status", "==", "pending"),
            );
            const pendingSubsSnap = await getDocs(pendingSubsQuery);
            stats.pendingSubmissions = pendingSubsSnap.size;

            // Pending proposals
            const proposalsRef = collection(db, "proposals");
            const pendingPropsQuery = query(
                proposalsRef,
                where("status", "==", "pending"),
            );
            const pendingPropsSnap = await getDocs(pendingPropsQuery);
            stats.pendingProposals = pendingPropsSnap.size;

            // Pending bugs (reported status)
            const bugsRef = collection(db, "bug_reports");
            const pendingBugsQuery = query(
                bugsRef,
                where("status", "==", "reported"),
            );
            const pendingBugsSnap = await getDocs(pendingBugsQuery);
            stats.pendingBugs = pendingBugsSnap.size;
        } catch (e) {
            console.error("Error loading stats:", e);
        } finally {
            loading = false;
        }
    }

    const tabs: TabDef[] = [
        { id: "dashboard", label: "Dashboard", icon: "📊" },
        { id: "users", label: "Usuarios", icon: "👥" },
        {
            id: "proposals",
            label: "Propuestas",
            icon: "💡",
            badge: stats.pendingProposals,
        },
        {
            id: "submissions",
            label: "Envíos",
            icon: "🎵",
            badge: stats.pendingSubmissions,
        },
        { id: "music", label: "Música", icon: "🎼" },
        {
            id: "bugs",
            label: "Bugs",
            icon: "🐛",
            badge: stats.pendingBugs,
        },
        { id: "logs", label: "Logs", icon: "📝" },
    ];
</script>

<svelte:head>
    <title>AdminOS | ChillChess</title>
    <meta name="theme-color" content="#0B1120" />
</svelte:head>

<div
    class="min-h-screen bg-[#0B1120] text-white font-poppins relative overflow-hidden"
>
    <!-- OS Wallpaper / Ambient Background -->
    <div class="absolute inset-0 pointer-events-none">
        <div
            class="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse-slow"
        ></div>
        <div
            class="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow"
            style="animation-delay: 2s"
        ></div>
    </div>

    <!-- === DESKTOP / HOME VIEW === -->
    <div
        class="relative h-screen flex flex-col p-4 md:p-8 overflow-y-auto no-scrollbar"
    >
        <!-- Status Bar -->
        <div
            class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 px-2"
            in:fly={{ y: -20, duration: 800 }}
        >
            <div class="flex flex-col">
                <span
                    class="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1"
                    >ChillOS v1.0</span
                >
                <div class="flex items-center gap-4">
                    <h1 class="text-2xl font-bold">Hola, Admin 👋</h1>
                    <a
                        href="/"
                        class="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-slate-300 transition-colors flex items-center gap-2 group"
                    >
                        <BackIcon size="sm" />
                        <span>Volver al Inicio</span>
                    </a>
                </div>
            </div>
            <SystemStatus />
        </div>

        <!-- Dashboard Widgets (Apps) -->
        {#if loading}
            <div
                class="flex-1 flex flex-col items-center justify-center text-slate-500"
            >
                <div
                    class="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"
                ></div>
                <p class="animate-pulse">Iniciando sistema...</p>
            </div>
        {:else}
            <!-- Métricas Principales (Widgets) -->
            <div
                class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 max-w-6xl mx-auto w-full"
            >
                <!-- Users Widget -->
                <button
                    on:click={() => (activeTab = "users")}
                    class="group relative aspect-square md:aspect-video rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 p-6 flex flex-col justify-between hover:scale-[1.02] active:scale-95 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 ring-0 hover:ring-2 ring-white/10"
                >
                    <div
                        class="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform"
                    >
                        👥
                    </div>
                    <div class="text-left">
                        <p class="text-3xl font-bold text-white">
                            {stats.totalUsers}
                        </p>
                        <p class="text-sm text-slate-400">Usuarios</p>
                    </div>
                </button>

                <!-- Pro Widget -->
                <button
                    on:click={() => (activeTab = "users")}
                    class="group relative aspect-square md:aspect-video rounded-3xl bg-gradient-to-br from-purple-900/20 to-slate-900/50 border border-white/10 p-6 flex flex-col justify-between hover:scale-[1.02] active:scale-95 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 ring-0 hover:ring-2 ring-purple-500/30"
                >
                    <div
                        class="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform"
                    >
                        👑
                    </div>
                    <div class="text-left">
                        <p class="text-3xl font-bold text-white">
                            {stats.proUsers}
                        </p>
                        <p class="text-sm text-slate-400">PRO</p>
                    </div>
                </button>

                <!-- Music Widget -->
                <button
                    on:click={() => (activeTab = "music")}
                    class="group relative aspect-square md:aspect-video rounded-3xl bg-gradient-to-br from-pink-900/20 to-slate-900/50 border border-white/10 p-6 flex flex-col justify-between hover:scale-[1.02] active:scale-95 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 ring-0 hover:ring-2 ring-pink-500/30"
                >
                    <div
                        class="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform"
                    >
                        💿
                    </div>
                    <div class="text-left">
                        <p class="text-3xl font-bold text-white">
                            {stats.totalAlbums}
                        </p>
                        <p class="text-sm text-slate-400">Álbumes</p>
                    </div>
                </button>

                <!-- Submissions Widget (Notification style) -->
                <button
                    on:click={() => (activeTab = "submissions")}
                    class="col-span-1 md:col-span-1 group relative aspect-square md:aspect-video rounded-3xl bg-gradient-to-br from-orange-900/20 to-slate-900/50 border border-white/10 p-6 flex flex-col justify-between hover:scale-[1.02] active:scale-95 transition-all duration-300 ring-0 hover:ring-2 ring-orange-500/30"
                >
                    <div class="flex justify-between items-start w-full">
                        <div
                            class="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform"
                        >
                            🎵
                        </div>
                        {#if stats.pendingSubmissions > 0}
                            <span
                                class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-bounce"
                                >{stats.pendingSubmissions}</span
                            >
                        {/if}
                    </div>
                    <div class="text-left">
                        <p class="text-lg font-bold text-white leading-tight">
                            Envíos
                        </p>
                        <p class="text-xs text-slate-400">Pendientes</p>
                    </div>
                </button>
            </div>

            <!-- More Apps Grid -->
            <div
                class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-6xl mx-auto w-full"
            >
                {#each tabs.filter((t) => t.id !== "dashboard") as app}
                    <button
                        on:click={() => (activeTab = app.id)}
                        class="flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-white/5 transition-colors group"
                    >
                        <div
                            class="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 border-t border-white/20 shadow-lg flex items-center justify-center text-white/80 group-hover:scale-110 transition-transform duration-300 relative"
                        >
                            <!-- Render icon based on app.id -->
                            {#if app.id === "users"}
                                <UsersIcon size="lg" />
                            {:else if app.id === "proposals"}
                                <BulbIcon size="lg" />
                            {:else if app.id === "submissions"}
                                <MusicIcon size="lg" />
                            {:else if app.id === "music"}
                                <CollectionIcon size="lg" />
                            {:else if app.id === "logs"}
                                <AlertIcon size="lg" />
                            {/if}

                            {#if app.badge && app.badge > 0}
                                <div
                                    class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#0B1120] flex items-center justify-center text-[10px] font-bold text-white"
                                >
                                    {app.badge}
                                </div>
                            {/if}
                        </div>
                        <span
                            class="text-xs font-medium text-slate-300 group-hover:text-white"
                            >{app.label}</span
                        >
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <!-- === WINDOW / FULLSCREEN OVERLAY === -->
    {#if activeTab !== "dashboard"}
        <!-- Backdrop (Desktop) / Background (Mobile) -->
        <div
            class="fixed inset-0 z-40 flex items-center justify-center md:p-10"
        >
            <!-- Backdrop Button -->
            <button
                transition:fade={{ duration: 200 }}
                class="absolute inset-0 bg-black/60 backdrop-blur-sm w-full h-full border-0 cursor-default"
                on:click={() => (activeTab = "dashboard")}
                aria-label="Cerrar ventana"
            ></button>

            <!-- Window Container -->
            <div
                class="relative z-10 w-full h-full md:w-[90vw] md:h-[85vh] md:max-w-6xl md:rounded-3xl bg-[#0B1120] md:bg-[#0f172a]/95 md:backdrop-blur-2xl md:border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                in:scale={{ start: 0.95, duration: 300, easing: cubicOut }}
                role="dialog"
                aria-modal="true"
            >
                <!-- Window Header / Native App Bar -->
                <div
                    class="flex-shrink-0 h-16 md:h-14 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-white/[0.02]"
                >
                    <div class="flex items-center gap-4">
                        <button
                            on:click={() => (activeTab = "dashboard")}
                            class="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
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
                                    d="M15 19l-7-7 7-7"
                                /></svg
                            >
                        </button>
                        <!-- Traffic Lights (Desktop Only) -->
                        <div class="hidden md:flex gap-2">
                            <button
                                on:click={() => (activeTab = "dashboard")}
                                class="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
                                aria-label="Cerrar"
                            ></button>
                            <div
                                class="w-3 h-3 rounded-full bg-yellow-500"
                            ></div>
                            <div
                                class="w-3 h-3 rounded-full bg-green-500"
                            ></div>
                        </div>
                        <h2
                            class="text-lg font-bold text-white ml-2 md:ml-4 flex items-center gap-2"
                        >
                            <span
                                >{tabs.find((t) => t.id === activeTab)
                                    ?.icon}</span
                            >
                            {tabs.find((t) => t.id === activeTab)?.label}
                        </h2>
                    </div>

                    <button
                        on:click={() => (activeTab = "dashboard")}
                        class="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Esc
                    </button>
                </div>

                <!-- Window Content -->
                <div
                    class="flex-1 overflow-y-auto overflow-x-hidden p-0 md:p-6 bg-[#0B1120] md:bg-transparent custom-track"
                >
                    {#if activeTab === "users"}
                        <UsersTab />
                    {:else if activeTab === "proposals"}
                        <ProposalsTab />
                    {:else if activeTab === "submissions"}
                        <SubmissionsTab on:approved={loadStats} />
                    {:else if activeTab === "music"}
                        <MusicTab />
                    {:else if activeTab === "bugs"}
                        <BugsTab />
                    {:else if activeTab === "logs"}
                        <LogsTab />
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    <!-- === DOCK (Desktop Only - Persistent Quick Access) === -->
    {#if activeTab === "dashboard"}
        <div
            class="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-end gap-2 p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
            in:fly={{ y: 50, duration: 600, delay: 500 }}
        >
            {#each tabs.filter((t) => t.id !== "dashboard") as app}
                <button
                    on:click={() => (activeTab = app.id)}
                    class="group relative w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-200"
                    title={app.label}
                >
                    <span class="text-xl">{app.icon}</span>
                    {#if app.badge && app.badge > 0}
                        <div
                            class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[#0B1120]"
                        ></div>
                    {/if}
                    <!-- Tooltip -->
                    <div
                        class="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
                    >
                        {app.label}
                    </div>
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .custom-track::-webkit-scrollbar {
        width: 6px;
    }
    .custom-track::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-track::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
    .custom-track::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    .animate-pulse-slow {
        animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
        0%,
        100% {
            opacity: 0.1;
            transform: scale(1);
        }
        50% {
            opacity: 0.3;
            transform: scale(1.1);
        }
    }
</style>
