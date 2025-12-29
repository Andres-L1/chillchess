<script lang="ts">
    import { onMount } from "svelte";
    import { audioStore } from "$lib/audio/store";
    import UsersTab from "$lib/components/admin/UsersTab.svelte";
    import ProposalsTab from "$lib/components/admin/ProposalsTab.svelte";
    import SubmissionsTab from "$lib/components/admin/SubmissionsTab.svelte";
    import MusicTab from "$lib/components/admin/MusicTab.svelte";
    import LogsTab from "$lib/components/admin/LogsTab.svelte";

    type Tab =
        | "dashboard"
        | "users"
        | "proposals"
        | "submissions"
        | "music"
        | "logs";

    let activeTab: Tab = "dashboard";
    let stats = {
        totalUsers: 0,
        proUsers: 0,
        totalAlbums: 0,
        verifiedArtists: 0,
        pendingSubmissions: 0,
        pendingProposals: 0,
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
        } catch (e) {
            console.error("Error loading stats:", e);
        } finally {
            loading = false;
        }
    }

    const tabs = [
        { id: "dashboard" as Tab, label: "Dashboard", icon: "📊" },
        { id: "users" as Tab, label: "Usuarios", icon: "👥" },
        {
            id: "proposals" as Tab,
            label: "Propuestas",
            icon: "💡",
            badge: stats.pendingProposals,
        },
        {
            id: "submissions" as Tab,
            label: "Envíos Musicales",
            icon: "🎵",
            badge: stats.pendingSubmissions,
        },
        { id: "music" as Tab, label: "Música", icon: "🎼" },
        { id: "logs" as Tab, label: "Logs", icon: "📝" },
    ];
</script>

<svelte:head>
    <title>Admin Panel | ChillChess</title>
</svelte:head>

<div class="p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">
                Panel de Administración
            </h1>
            <p class="text-slate-400">Gestión completa de ChillChess</p>
        </div>

        <!-- Tab Navigation -->
        <div class="mb-8 overflow-x-auto pb-2">
            <div class="flex gap-2 min-w-max">
                {#each tabs as tab}
                    <button
                        on:click={() => (activeTab = tab.id)}
                        class="relative px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all {activeTab ===
                        tab.id
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}"
                    >
                        <span class="mr-2">{tab.icon}</span>
                        {tab.label}
                        {#if tab.badge && tab.badge > 0}
                            <span
                                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                            >
                                {tab.badge}
                            </span>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Tab Content -->
        <div class="animate-fade-in">
            {#if activeTab === "dashboard"}
                <!-- Dashboard -->
                {#if loading}
                    <div class="text-center py-12">
                        <div
                            class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"
                        ></div>
                        <p class="mt-4 text-slate-400">
                            Cargando estadísticas...
                        </p>
                    </div>
                {:else}
                    <!-- Stats Grid -->
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                    >
                        <!-- Total Users -->
                        <div
                            class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <div class="p-3 bg-primary-500/20 rounded-xl">
                                    <svg
                                        class="w-6 h-6 text-primary-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <button
                                    on:click={() => (activeTab = "users")}
                                    class="text-xs text-primary-400 hover:text-primary-300"
                                    >Ver →</button
                                >
                            </div>
                            <p class="text-3xl font-bold text-white mb-1">
                                {stats.totalUsers}
                            </p>
                            <p class="text-sm text-slate-400">Total Usuarios</p>
                        </div>

                        <!-- PRO Users -->
                        <div
                            class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <div class="p-3 bg-purple-500/20 rounded-xl">
                                    <svg
                                        class="w-6 h-6 text-purple-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                        />
                                    </svg>
                                </div>
                                <button
                                    on:click={() => (activeTab = "users")}
                                    class="text-xs text-purple-400 hover:text-purple-300"
                                    >Ver →</button
                                >
                            </div>
                            <p class="text-3xl font-bold text-white mb-1">
                                {stats.proUsers}
                            </p>
                            <p class="text-sm text-slate-400">Usuarios PRO</p>
                        </div>

                        <!-- Verified Artists -->
                        <div
                            class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <div class="p-3 bg-green-500/20 rounded-xl">
                                    <svg
                                        class="w-6 h-6 text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <button
                                    on:click={() => (activeTab = "users")}
                                    class="text-xs text-green-400 hover:text-green-300"
                                    >Ver →</button
                                >
                            </div>
                            <p class="text-3xl font-bold text-white mb-1">
                                {stats.verifiedArtists}
                            </p>
                            <p class="text-sm text-slate-400">
                                Artistas Verificados
                            </p>
                        </div>

                        <!-- Total Albums -->
                        <div
                            class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <div class="p-3 bg-blue-500/20 rounded-xl">
                                    <svg
                                        class="w-6 h-6 text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                        />
                                    </svg>
                                </div>
                                <button
                                    on:click={() => (activeTab = "music")}
                                    class="text-xs text-blue-400 hover:text-blue-300"
                                    >Ver →</button
                                >
                            </div>
                            <p class="text-3xl font-bold text-white mb-1">
                                {stats.totalAlbums}
                            </p>
                            <p class="text-sm text-slate-400">
                                Álbumes Totales
                            </p>
                        </div>

                        <!-- Pending Submissions -->
                        <div
                            class="bg-white/5 border border-orange-500/20 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <div class="p-3 bg-orange-500/20 rounded-xl">
                                    <svg
                                        class="w-6 h-6 text-orange-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <button
                                    on:click={() => (activeTab = "submissions")}
                                    class="text-xs text-orange-400 hover:text-orange-300"
                                    >Ver →</button
                                >
                            </div>
                            <p class="text-3xl font-bold text-white mb-1">
                                {stats.pendingSubmissions}
                            </p>
                            <p class="text-sm text-slate-400">
                                Envíos Pendientes
                            </p>
                        </div>

                        <!-- Pending Proposals -->
                        <div
                            class="bg-white/5 border border-yellow-500/20 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <div class="p-3 bg-yellow-500/20 rounded-xl">
                                    <svg
                                        class="w-6 h-6 text-yellow-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                        />
                                    </svg>
                                </div>
                                <button
                                    on:click={() => (activeTab = "proposals")}
                                    class="text-xs text-yellow-400 hover:text-yellow-300"
                                    >Ver →</button
                                >
                            </div>
                            <p class="text-3xl font-bold text-white mb-1">
                                {stats.pendingProposals}
                            </p>
                            <p class="text-sm text-slate-400">
                                Propuestas Pendientes
                            </p>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div>
                        <h2 class="text-xl font-bold text-white mb-4">
                            Acciones Pendientes
                        </h2>
                        <div class="space-y-4">
                            {#if stats.pendingSubmissions > 0}
                                <button
                                    on:click={() => (activeTab = "submissions")}
                                    class="w-full text-left bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 rounded-xl p-4 transition-all group"
                                >
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <div>
                                            <p class="text-white font-medium">
                                                Revisar Envíos Musicales
                                            </p>
                                            <p class="text-sm text-slate-400">
                                                {stats.pendingSubmissions} envíos
                                                esperando aprobación
                                            </p>
                                        </div>
                                        <svg
                                            class="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </button>
                            {/if}

                            {#if stats.pendingProposals > 0}
                                <button
                                    on:click={() => (activeTab = "proposals")}
                                    class="w-full text-left bg-yellow-500/10 border border-yellow-500/20 hover:border-yellow-500/40 rounded-xl p-4 transition-all group"
                                >
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <div>
                                            <p class="text-white font-medium">
                                                Revisar Propuestas
                                            </p>
                                            <p class="text-sm text-slate-400">
                                                {stats.pendingProposals} propuestas
                                                de usuarios PRO
                                            </p>
                                        </div>
                                        <svg
                                            class="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </button>
                            {/if}

                            {#if stats.pendingSubmissions === 0 && stats.pendingProposals === 0}
                                <div class="text-center py-8 text-slate-400">
                                    <svg
                                        class="w-16 h-16 mx-auto mb-4 opacity-50"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <p class="font-medium">¡Todo al día!</p>
                                    <p class="text-sm">
                                        No hay acciones pendientes
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>
                {/if}
            {:else if activeTab === "users"}
                <UsersTab />
            {:else if activeTab === "proposals"}
                <ProposalsTab />
            {:else if activeTab === "submissions"}
                <SubmissionsTab on:approved={loadStats} />
            {:else if activeTab === "music"}
                <MusicTab />
            {:else if activeTab === "logs"}
                <LogsTab />
            {/if}
        </div>
    </div>
</div>
