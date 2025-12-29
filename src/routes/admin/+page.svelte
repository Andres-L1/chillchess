<script lang="ts">
    import { onMount } from "svelte";
    import { userSubscription } from "$lib/subscription/userSubscription";
    import { audioStore } from "$lib/audio/store";

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

    const quickActions = [
        {
            title: "Verificar Usuarios",
            description: "Gestiona artistas verificados",
            icon: "✓",
            href: "/admin/verify",
            color: "from-green-500 to-emerald-600",
        },
        {
            title: "Ver Logs",
            description: "Revisa logs del sistema",
            icon: "📝",
            href: "/admin/logs",
            color: "from-blue-500 to-indigo-600",
        },
    ];
</script>

<svelte:head>
    <title>Admin Dashboard | ChillChess</title>
</svelte:head>

<div class="p-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p class="text-slate-400">Bienvenido al panel de administración</p>
        </div>

        <!-- Stats Grid -->
        {#if loading}
            <div class="text-center py-12">
                <div
                    class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"
                ></div>
                <p class="mt-4 text-slate-400">Cargando estadísticas...</p>
            </div>
        {:else}
            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
                <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-primary-500/20 rounded-xl">
                            <span class="text-3xl">👥</span>
                        </div>
                        <div>
                            <p class="text-sm text-slate-400">Total Usuarios</p>
                            <p class="text-2xl font-bold text-white">
                                {stats.totalUsers}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-purple-500/20 rounded-xl">
                            <span class="text-3xl">👑</span>
                        </div>
                        <div>
                            <p class="text-sm text-slate-400">Usuarios PRO</p>
                            <p class="text-2xl font-bold text-white">
                                {stats.proUsers}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-blue-500/20 rounded-xl">
                            <span class="text-3xl">🎵</span>
                        </div>
                        <div>
                            <p class="text-sm text-slate-400">Total Álbumes</p>
                            <p class="text-2xl font-bold text-white">
                                {stats.totalAlbums}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div class="flex items-center gap-4">
                        <div class="p-3 bg-green-500/20 rounded-xl">
                            <span class="text-3xl">✓</span>
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
            <div class="mb-8">
                <h2 class="text-xl font-bold text-white mb-4">
                    Acciones Rápidas
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {#each quickActions as action}
                        <a
                            href={action.href}
                            class="group relative overflow-hidden bg-gradient-to-br {action.color} rounded-2xl p-6 hover:scale-105 transition-transform"
                        >
                            <div class="relative z-10">
                                <div class="text-5xl mb-4">{action.icon}</div>
                                <h3 class="text-xl font-bold text-white mb-2">
                                    {action.title}
                                </h3>
                                <p class="text-white/80">
                                    {action.description}
                                </p>
                            </div>
                            <div
                                class="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"
                            ></div>
                        </a>
                    {/each}
                </div>
            </div>

            <!-- Legacy Admin Panel Link -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-white mb-2">
                    Panel Completo (Legacy)
                </h3>
                <p class="text-slate-400 mb-4">
                    Accede al panel de administración completo con todas las
                    funciones avanzadas
                </p>
                <a
                    href="/admin/legacy"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
                >
                    Abrir Panel Completo →
                </a>
            </div>
        {/if}
    </div>
</div>
