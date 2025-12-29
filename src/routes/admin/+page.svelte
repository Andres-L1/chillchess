<script lang="ts">
    import { onMount } from "svelte";
    import { userSubscription } from "$lib/subscription/userSubscription";
    import { audioStore } from "$lib/audio/store";
    import VerifyTab from "$lib/components/admin/VerifyTab.svelte";

    type Tab = "dashboard" | "verify" | "legacy";

    let activeTab: Tab = "dashboard";
    let stats = {
        totalUsers: 0,
        proUsers: 0,
        totalAlbums: 0,
        verifiedArtists: 0,
    };

    let loading = true;

    onMount(async () => {
        try {
            const { collection, getDocs, query, where } = await import(
                "firebase/firestore"
            );
            const { db } = await import("$lib/firebase");

            // Get user stats
            const usersSnap = await getDocs(collection(db, "users"));
            stats.totalUsers = usersSnap.size;
            stats.proUsers = usersSnap.docs.filter((doc) => {
                const tier = doc.data().subscriptionTier;
                return tier === "pro" || tier === "premium";
            }).length;

            // Get verified artists
            const artistsRef = collection(db, "artists");
            const q = query(artistsRef, where("isVerified", "==", true));
            const artistsSnap = await getDocs(q);
            stats.verifiedArtists = artistsSnap.size;

            // Get albums from store
            stats.totalAlbums = $audioStore.availableAlbums.length;
        } catch (e) {
            console.error("Error loading stats:", e);
        } finally {
            loading = false;
        }
    });

    const tabs = [
        { id: "dashboard" as Tab, label: "Dashboard", icon: "📊" },
        { id: "verify" as Tab, label: "Verificar Usuarios", icon: "✓" },
        { id: "legacy" as Tab, label: "Panel Completo", icon: "⚙️" },
    ];
</script>

<svelte:head>
    <title>Admin Panel | ChillChess</title>
</svelte:head>

<div class="p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header with Tabs -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-6">
                Panel de Administración
            </h1>

            <!-- Tab Navigation -->
            <div class="flex gap-2 overflow-x-auto pb-2">
                {#each tabs as tab}
                    <button
                        on:click={() => (activeTab = tab.id)}
                        class="px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all {activeTab ===
                        tab.id
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}"
                    >
                        <span class="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Tab Content -->
        <div class="animate-fade-in">
            {#if activeTab === "dashboard"}
                <!-- Dashboard Stats -->
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
                    <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <div
                            class="bg-white/5 border border-white/10 rounded-2xl p-6"
                        >
                            <div class="flex items-center gap-4">
                                <div class="p-3 bg-primary-500/20 rounded-xl">
                                    <svg
                                        class="w-8 h-8 text-primary-400"
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
                                <div>
                                    <p class="text-sm text-slate-400">
                                        Total Usuarios
                                    </p>
                                    <p class="text-2xl font-bold text-white">
                                        {stats.totalUsers}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-white/5 border border-white/10 rounded-2xl p-6"
                        >
                            <div class="flex items-center gap-4">
                                <div class="p-3 bg-purple-500/20 rounded-xl">
                                    <svg
                                        class="w-8 h-8 text-purple-400"
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
                                <div>
                                    <p class="text-sm text-slate-400">
                                        Usuarios PRO
                                    </p>
                                    <p class="text-2xl font-bold text-white">
                                        {stats.proUsers}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-white/5 border border-white/10 rounded-2xl p-6"
                        >
                            <div class="flex items-center gap-4">
                                <div class="p-3 bg-blue-500/20 rounded-xl">
                                    <svg
                                        class="w-8 h-8 text-blue-400"
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
                                <div>
                                    <p class="text-sm text-slate-400">
                                        Total Álbumes
                                    </p>
                                    <p class="text-2xl font-bold text-white">
                                        {stats.totalAlbums}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-white/5 border border-white/10 rounded-2xl p-6"
                        >
                            <div class="flex items-center gap-4">
                                <div class="p-3 bg-green-500/20 rounded-xl">
                                    <svg
                                        class="w-8 h-8 text-green-400"
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
                                <div>
                                    <p class="text-sm text-slate-400">
                                        Artistas Verificados
                                    </p>
                                    <p class="text-2xl font-bold text-white">
                                        {stats.verifiedArtists}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div>
                        <h2 class="text-xl font-bold text-white mb-4">
                            Acciones Rápidas
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                on:click={() => (activeTab = "verify")}
                                class="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 hover:scale-105 transition-transform text-left"
                            >
                                <div class="relative z-10">
                                    <svg
                                        class="w-12 h-12 mb-4 text-white"
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
                                    <h3
                                        class="text-xl font-bold text-white mb-2"
                                    >
                                        Verificar Usuarios
                                    </h3>
                                    <p class="text-white/80">
                                        Gestiona artistas verificados
                                    </p>
                                </div>
                                <div
                                    class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"
                                ></div>
                            </button>

                            <button
                                on:click={() => (activeTab = "legacy")}
                                class="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 hover:scale-105 transition-transform text-left"
                            >
                                <div class="relative z-10">
                                    <svg
                                        class="w-12 h-12 mb-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        /><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <h3
                                        class="text-xl font-bold text-white mb-2"
                                    >
                                        Panel Completo
                                    </h3>
                                    <p class="text-white/80">
                                        Todas las funciones avanzadas
                                    </p>
                                </div>
                                <div
                                    class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"
                                ></div>
                            </button>
                        </div>
                    </div>
                {/if}
            {:else if activeTab === "verify"}
                <!-- Verify Users Tab -->
                <VerifyTab />
            {:else if activeTab === "legacy"}
                <!-- Legacy Panel Info -->
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
                >
                    <svg
                        class="w-16 h-16 mx-auto mb-4 text-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h3 class="text-2xl font-bold text-white mb-2">
                        Panel Completo
                    </h3>
                    <p class="text-slate-400 mb-6 max-w-md mx-auto">
                        El panel completo con todas las funcionalidades
                        avanzadas está disponible en una página separada
                    </p>
                    <a
                        href="/admin/legacy"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                    >
                        Abrir Panel Completo
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                        </svg>
                    </a>
                </div>
            {/if}
        </div>
    </div>
</div>
