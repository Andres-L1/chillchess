<script lang="ts">
    import { onMount } from "svelte";
    import { fade, fly, slide } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
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
        { id: "logs", label: "Logs", icon: "📝" },
    ];
</script>

<svelte:head>
    <title>Admin Studio | ChillChess</title>
</svelte:head>

<div
    class="min-h-screen bg-[#0B1120] text-white font-poppins pb-20 relative overflow-hidden"
>
    <!-- Background Decor (Admin Vibe) -->
    <div
        class="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none"
    ></div>
    <div
        class="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"
    ></div>

    <div class="relative max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <!-- Header -->
        <div
            class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
            in:fly={{ y: -20, duration: 600 }}
        >
            <div>
                <h1
                    class="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight"
                >
                    Admin<span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-400"
                        >Studio</span
                    >
                </h1>
                <p class="text-slate-400 font-light text-lg">
                    Centro de Comando & Control
                </p>
            </div>

            <div
                class="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md shadow-lg"
            >
                <div
                    class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                ></div>
                <span
                    class="text-xs font-bold text-slate-300 uppercase tracking-widest"
                    >Sistema Activo</span
                >
            </div>
        </div>

        <!-- Navigation Dock -->
        <div
            class="sticky top-4 z-40 mb-10"
            in:fly={{ y: 20, duration: 600, delay: 100 }}
        >
            <div
                class="flex p-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl w-full md:w-max overflow-x-auto no-scrollbar shadow-2xl mx-auto md:mx-0"
            >
                {#each tabs as tab}
                    <button
                        on:click={() => (activeTab = tab.id)}
                        class="relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 group {activeTab ===
                        tab.id
                            ? 'text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                    >
                        {#if activeTab === tab.id}
                            <div
                                class="absolute inset-0 bg-white/10 rounded-xl border border-white/10 shadow-inner"
                                transition:fade={{ duration: 200 }}
                            ></div>
                        {/if}
                        <span
                            class="relative z-10 text-lg group-hover:scale-110 transition-transform"
                            >{tab.icon}</span
                        >
                        <span class="relative z-10 hidden md:inline-block"
                            >{tab.label}</span
                        >

                        {#if tab.badge && tab.badge > 0}
                            <span
                                class="relative z-10 ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full shadow-lg animate-pulse"
                            >
                                {tab.badge}
                            </span>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Content Area -->
        <div class="min-h-[500px]" in:fade={{ duration: 400, delay: 200 }}>
            {#if activeTab === "dashboard"}
                {#if loading}
                    <div
                        class="flex flex-col items-center justify-center h-64 text-slate-500 animate-pulse"
                    >
                        <div
                            class="w-12 h-12 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin mb-4"
                        ></div>
                        <p>Cargando datos del sistema...</p>
                    </div>
                {:else}
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        in:fly={{ y: 20, duration: 500 }}
                    >
                        <!-- Stat Card 1 -->
                        <div
                            class="group relative bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 backdrop-blur-xl border border-white/5 hover:border-primary-500/30 rounded-3xl p-8 overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] hover:-translate-y-1"
                        >
                            <div
                                class="absolute -right-4 -bottom-4 text-[120px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity grayscale group-hover:grayscale-0"
                            >
                                👥
                            </div>
                            <h3
                                class="text-slate-400 font-medium mb-2 uppercase tracking-wider text-xs"
                            >
                                Total Usuarios
                            </h3>
                            <p class="text-5xl font-bold text-white mb-2">
                                {stats.totalUsers}
                            </p>
                            <div
                                class="h-1 w-12 bg-primary-500 rounded-full group-hover:w-24 transition-all duration-500"
                            ></div>
                        </div>

                        <!-- Stat Card 2 -->
                        <div
                            class="group relative bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 rounded-3xl p-8 overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:-translate-y-1"
                        >
                            <div
                                class="absolute -right-4 -bottom-4 text-[120px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity grayscale group-hover:grayscale-0"
                            >
                                👑
                            </div>
                            <h3
                                class="text-slate-400 font-medium mb-2 uppercase tracking-wider text-xs"
                            >
                                Miembros PRO
                            </h3>
                            <p class="text-5xl font-bold text-white mb-2">
                                {stats.proUsers}
                            </p>
                            <div
                                class="h-1 w-12 bg-purple-500 rounded-full group-hover:w-24 transition-all duration-500"
                            ></div>
                        </div>

                        <!-- Stat Card 3 -->
                        <div
                            class="group relative bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 rounded-3xl p-8 overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1"
                        >
                            <div
                                class="absolute -right-4 -bottom-4 text-[120px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity grayscale group-hover:grayscale-0"
                            >
                                💿
                            </div>
                            <h3
                                class="text-slate-400 font-medium mb-2 uppercase tracking-wider text-xs"
                            >
                                Álbumes Activos
                            </h3>
                            <p class="text-5xl font-bold text-white mb-2">
                                {stats.totalAlbums}
                            </p>
                            <div
                                class="h-1 w-12 bg-blue-500 rounded-full group-hover:w-24 transition-all duration-500"
                            ></div>
                        </div>

                        <!-- Actions Grid -->
                        <div class="col-span-1 lg:col-span-3 mt-8">
                            <h2 class="text-2xl font-bold text-white mb-6">
                                Acciones Requeridas
                            </h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {#if stats.pendingSubmissions > 0}
                                    <button
                                        on:click={() =>
                                            (activeTab = "submissions")}
                                        class="group flex items-center gap-6 p-6 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 rounded-2xl transition-all text-left"
                                    >
                                        <div
                                            class="p-4 bg-orange-500/20 rounded-xl text-2xl group-hover:scale-110 transition-transform"
                                        >
                                            🎵
                                        </div>
                                        <div>
                                            <h4
                                                class="font-bold text-white text-lg"
                                            >
                                                Revisar Envíos Musicales
                                            </h4>
                                            <p
                                                class="text-orange-200/60 text-sm mt-1"
                                            >
                                                {stats.pendingSubmissions} pistas
                                                esperando tu oído crítico.
                                            </p>
                                        </div>
                                    </button>
                                {/if}
                                {#if stats.pendingProposals > 0}
                                    <button
                                        on:click={() =>
                                            (activeTab = "proposals")}
                                        class="group flex items-center gap-6 p-6 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 rounded-2xl transition-all text-left"
                                    >
                                        <div
                                            class="p-4 bg-yellow-500/20 rounded-xl text-2xl group-hover:scale-110 transition-transform"
                                        >
                                            💡
                                        </div>
                                        <div>
                                            <h4
                                                class="font-bold text-white text-lg"
                                            >
                                                Revisar Propuestas
                                            </h4>
                                            <p
                                                class="text-yellow-200/60 text-sm mt-1"
                                            >
                                                {stats.pendingProposals} ideas de
                                                la comunidad.
                                            </p>
                                        </div>
                                    </button>
                                {/if}
                                {#if stats.pendingSubmissions === 0 && stats.pendingProposals === 0}
                                    <div
                                        class="col-span-2 p-8 border border-dashed border-white/10 rounded-2xl text-center"
                                    >
                                        <p class="text-slate-500">
                                            Todo limpio. Tómate un café. ☕
                                        </p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
            {:else if activeTab === "users"}
                <div in:slide={{ duration: 300, axis: "y" }}>
                    <UsersTab />
                </div>
            {:else if activeTab === "proposals"}
                <div in:slide={{ duration: 300, axis: "y" }}>
                    <ProposalsTab />
                </div>
            {:else if activeTab === "submissions"}
                <div in:slide={{ duration: 300, axis: "y" }}>
                    <SubmissionsTab on:approved={loadStats} />
                </div>
            {:else if activeTab === "music"}
                <div in:slide={{ duration: 300, axis: "y" }}>
                    <MusicTab />
                </div>
            {:else if activeTab === "logs"}
                <div in:slide={{ duration: 300, axis: "y" }}>
                    <LogsTab />
                </div>
            {/if}
        </div>
    </div>
</div>
