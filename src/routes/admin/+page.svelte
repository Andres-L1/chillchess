<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    // Icons for Stats
    import UsersIcon from '$lib/components/icons/UsersIcon.svelte';
    import BulbIcon from '$lib/components/icons/BulbIcon.svelte';
    import MusicIcon from '$lib/components/icons/MusicIcon.svelte';
    import AlertIcon from '$lib/components/icons/AlertIcon.svelte';

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
            const { collection, query, where, getCountFromServer } = await import(
                'firebase/firestore'
            );
            const { db } = await import('$lib/firebase');

            const getCount = async (collName: string, constraints: any[] = []) => {
                const coll = collection(db, collName);
                const q = query(coll, ...constraints);
                const snapshot = await getCountFromServer(q);
                return snapshot.data().count;
            };

            const [
                totalUsers,
                proUsers,
                premiumUsers,
                verifiedArtists,
                pendingSubmissions,
                pendingProposals,
                pendingBugs,
                totalReleases,
            ] = await Promise.all([
                getCount('users'),
                getCount('users', [where('subscriptionTier', '==', 'pro')]),
                getCount('users', [where('subscriptionTier', '==', 'premium')]),
                getCount('artists', [where('isVerified', '==', true)]),
                getCount('musicSubmissions', [where('status', '==', 'pending')]),
                getCount('proposals', [where('status', '==', 'pending')]),
                getCount('bug_reports', [where('status', '==', 'reported')]),
                getCount('albums'),
            ]);

            stats = {
                totalUsers,
                proUsers: proUsers + premiumUsers,
                totalAlbums: totalReleases,
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
</script>

<!-- Stats Grid - Pure Content -->
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
                <span class="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded font-bold">
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
            <h3 class="text-slate-400 text-sm font-medium">Catálogo Musical</h3>
            <div class="flex items-baseline gap-2 mt-1">
                <p class="text-3xl font-bold text-white">
                    {stats.totalAlbums}
                </p>
                <span class="text-xs text-slate-500">Total</span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2 text-xs">
                <div class="bg-white/5 rounded px-2 py-1">
                    <span class="text-orange-400 font-bold">{stats.totalAlbums}</span>
                    Releases
                </div>
                <div class="bg-white/5 rounded px-2 py-1">
                    <span class="text-green-400 font-bold">{stats.verifiedArtists}</span>
                    Artistas
                </div>
            </div>
        </div>
    </div>

    <!-- Proposals Stat -->
    <a
        href="/admin/proposals"
        class="bg-[#131b2e]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-colors cursor-pointer block"
    >
        <div
            class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"
        >
            <BulbIcon size="lg" gradient={false} />
        </div>
        <div class="relative z-10">
            <h3 class="text-slate-400 text-sm font-medium">Propuestas Pendientes</h3>
            <p class="text-3xl font-bold text-white mt-1">
                {stats.pendingProposals}
            </p>
            {#if stats.pendingProposals > 0}
                <div class="mt-2 text-xs text-purple-400 font-bold">Requiere Revisión</div>
            {/if}
        </div>
    </a>

    <!-- Bugs Stat (New) -->
    <a
        href="/admin/bugs"
        class="bg-[#131b2e]/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-red-500/30 transition-colors cursor-pointer block"
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
    </a>
</div>
