<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
    import type { ArtistProfile } from '$lib/types/artist';
    import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
    import MusicIcon from '$lib/components/icons/MusicIcon.svelte';
    import AlbumIcon from '$lib/components/icons/AlbumIcon.svelte';
    import { db } from '$lib/firebase';
    import { collection, query, where, onSnapshot } from 'firebase/firestore';
    import { ALBUMS } from '$lib/data/albums';
    import type { Album } from '$lib/data/albums';

    export let data: { verifiedArtists: ArtistProfile[] };

    // Use reactive variable for real-time updates
    let verifiedArtists = data.verifiedArtists || [];
    let albumsMap: Record<string, Album[]> = {}; // Map artistId -> Albums
    let totalAlbumsCount = 0;

    let unsubscribeArtists: (() => void) | null = null;
    let unsubscribeAlbums: (() => void) | null = null;

    // Set up real-time listener for verified artists
    onMount(() => {
        // 1. Listen for Artists
        const artistsRef = collection(db, 'artists');
        const qArtists = query(artistsRef, where('isVerified', '==', true));

        unsubscribeArtists = onSnapshot(qArtists, (querySnapshot) => {
            verifiedArtists = [];
            querySnapshot.forEach((doc) => {
                verifiedArtists.push({ id: doc.id, ...doc.data() } as ArtistProfile);
            });
        });

        // 2. Listen for Albums
        // We fetch ALL albums and allow the template to filter them robustly
        const albumsRef = collection(db, 'albums');
        unsubscribeAlbums = onSnapshot(albumsRef, (snapshot) => {
            const firestoreAlbums = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Album);

            // Merge with static albums (deduplicated by ID)
            const all = [...firestoreAlbums];
            ALBUMS.forEach((staticAlbum) => {
                if (!all.find((a) => a.id === staticAlbum.id)) {
                    all.push(staticAlbum);
                }
            });

            // Store all albums in a flat list
            // We will filter per artist in the template or a derived store/function
            allAlbumsList = all;

            // Update total stats (approximated count of albums linked to verified artists)
            // This is just for the "Total Albums" header counter
            updateTotalStats();
        });
    });

    let allAlbumsList: Album[] = [];

    function updateTotalStats() {
        if (!verifiedArtists.length) {
            totalAlbumsCount = 0;
            return;
        }
        // Count unique albums that belong to ANY verified artist
        const relevantAlbums = allAlbumsList.filter((album) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = album as any;
            return verifiedArtists.some((artist) => {
                // Match by string ID (slug) OR by UID
                const idMatch =
                    a.artistId && (a.artistId === artist.id || a.artistId === artist.userId);
                const nameMatch =
                    album.artist &&
                    artist.artistName &&
                    album.artist.trim().toLowerCase() === artist.artistName.trim().toLowerCase();
                return idMatch || nameMatch;
            });
        });
        totalAlbumsCount = relevantAlbums.length;
    }

    // Trigger stats update when artists change too
    $: if (verifiedArtists) updateTotalStats();

    // Robust matcher for the grid
    // We pass 'albums' explicitly to trigger Svelte reactivity in the template when the list updates
    function getTimestampMillis(val: any): number {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        if (typeof val.toMillis === 'function') return val.toMillis();
        if (val instanceof Date) return val.getTime();
        if (val.seconds) return val.seconds * 1000;
        return 0;
    }

    // Robust matcher for the grid + Sorting
    function getAlbumsForArtist(artist: ArtistProfile, albums: Album[]) {
        if (!artist || !albums) return [];

        const matches = albums.filter((album) => {
            // Cast to any to access artistId if interface update hasn't propagated or is missing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const a = album as any;
            // Match by string ID OR UID
            const idMatch =
                a.artistId && (a.artistId === artist.id || a.artistId === artist.userId);
            const nameMatch =
                album.artist &&
                artist.artistName &&
                album.artist.trim().toLowerCase() === artist.artistName.trim().toLowerCase();
            return idMatch || nameMatch;
        });

        // Sort by newest first
        return matches.sort(
            (a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt)
        );
    }

    // ============================================
    // R2 Cover URL Resolution
    // ============================================
    let coverUrlsMap = new Map<string, string>();

    async function fetchR2CoverUrl(r2Key: string): Promise<string | null> {
        try {
            const res = await fetch('/api/r2/get-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: r2Key }),
            });

            if (!res.ok) return null;

            const { url } = await res.json();
            return url;
        } catch (err) {
            console.error('Error fetching R2 cover:', err);
            return null;
        }
    }

    // Fetch R2 covers when albums list changes
    $: {
        allAlbumsList.forEach(async (album) => {
            const anyAlbum = album as any;

            if (anyAlbum.r2CoverKey && !coverUrlsMap.has(anyAlbum.r2CoverKey)) {
                const signedUrl = await fetchR2CoverUrl(anyAlbum.r2CoverKey);
                if (signedUrl) {
                    coverUrlsMap.set(anyAlbum.r2CoverKey, signedUrl);
                    coverUrlsMap = coverUrlsMap;
                }
            }
        });
    }

    function getCoverUrl(album: Album): string {
        const a = album as any;

        if (a.r2CoverKey && coverUrlsMap.has(a.r2CoverKey)) {
            return coverUrlsMap.get(a.r2CoverKey)!;
        }

        if (album.cover) {
            return album.cover;
        }

        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23cbd5e1' font-weight='bold'%3EChillChess%3C/text%3E%3C/svg%3E";
    }

    // Search
    let searchQuery = '';

    $: filteredArtists = verifiedArtists.filter((artist) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            artist.artistName.toLowerCase().includes(q) ||
            (artist.bio && artist.bio.toLowerCase().includes(q))
        );
    });

    onDestroy(() => {
        if (unsubscribeArtists) unsubscribeArtists();
        if (unsubscribeAlbums) unsubscribeAlbums();
    });
</script>

<svelte:head>
    <title>Artistas Verificados | ChillChess</title>
</svelte:head>

<div
    class="min-h-screen bg-midnight-900 text-white font-poppins pb-32 pt-24 px-4 md:px-12 relative overflow-hidden"
>
    <!-- Ambient Background -->
    <div
        class="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none"
    ></div>

    <div class="max-w-7xl mx-auto relative z-10">
        <!-- Back Button -->
        <div class="mb-8">
            <a
                href="/"
                class="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-white/5"
            >
                <svg
                    class="w-5 h-5 transition-transform group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                <span class="font-medium">Volver</span>
            </a>
        </div>

        <!-- Header -->
        <header class="mb-12 text-center">
            <h1 class="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                Voces de <span
                    class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-400"
                    >ChillChess</span
                >
            </h1>
            <p class="text-slate-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Descubre a los artistas verificados que crean la atmósfera perfecta para tu
                concentración.
            </p>

            <!-- Search Bar -->
            <div class="max-w-md mx-auto relative group">
                <div
                    class="absolute inset-0 bg-primary-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>
                <div class="relative">
                    <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Buscar artista o género..."
                        class="w-full bg-[#0B1120] border border-white/10 rounded-2xl px-6 py-4 pl-14 text-white placeholder-slate-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all outline-none shadow-xl"
                    />
                    <svg
                        class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>
        </header>

        <!-- Stats (Optional - only show if no search) -->
        {#if !searchQuery && verifiedArtists.length > 0}
            <div class="flex justify-center gap-12 mb-16 border-b border-white/5 pb-8">
                <div class="text-center">
                    <div class="text-3xl font-bold text-white mb-1">
                        {verifiedArtists.length}
                    </div>
                    <div class="text-xs font-bold uppercase tracking-widest text-primary-500">
                        Artistas
                    </div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-white mb-1">
                        {totalAlbumsCount}
                    </div>
                    <div class="text-xs font-bold uppercase tracking-widest text-primary-500">
                        Lanzamientos
                    </div>
                </div>
            </div>
        {/if}

        <!-- Artists Grid -->
        {#if filteredArtists.length === 0}
            <div class="text-center py-32">
                <div class="inline-flex justify-center mb-6 text-slate-700">
                    <MusicIcon size="xl" />
                </div>
                <h3 class="text-2xl font-bold mb-2">No se encontraron artistas</h3>
                <p class="text-slate-400">Intenta con otra búsqueda.</p>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                {#each filteredArtists as artist}
                    {@const artistAlbums = getAlbumsForArtist(artist, allAlbumsList)}
                    {@const totalTracks = artistAlbums.reduce(
                        (sum, album) => sum + (album.tracks?.length || 0),
                        0
                    )}

                    <button
                        on:click={() => goto(`/artist/${artist.id || artist.userId}`)}
                        class="group relative bg-[#151b2e] border border-white/5 rounded-3xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-900/20 text-left h-full flex flex-col"
                    >
                        <!-- Banner Area (Background) -->
                        <div
                            class="absolute top-0 left-0 w-full h-32 overflow-hidden opacity-40 group-hover:opacity-60 transition-opacity"
                        >
                            {#if artist.bannerUrl}
                                <img
                                    src={artist.bannerUrl}
                                    alt=""
                                    class="w-full h-full object-cover blur-sm group-hover:blur-0 transition-all duration-500 scale-105 group-hover:scale-110"
                                />
                            {:else}
                                <div
                                    class="w-full h-full bg-gradient-to-br from-primary-900/50 to-purple-900/50"
                                ></div>
                            {/if}
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-[#151b2e] to-transparent"
                            ></div>
                        </div>

                        <!-- Content -->
                        <div class="relative z-10 p-6 flex flex-col h-full">
                            <!-- Header: Avatar + Badge -->
                            <div class="flex justify-between items-start mb-4">
                                <div
                                    class="w-20 h-20 rounded-2xl bg-[#0B1120] p-1 shadow-xl ring-1 ring-white/10 group-hover:ring-primary-500/50 transition-all"
                                >
                                    {#if artist.avatarUrl}
                                        <img
                                            src={artist.avatarUrl}
                                            alt={artist.artistName}
                                            class="w-full h-full rounded-xl object-cover"
                                        />
                                    {:else}
                                        <div
                                            class="w-full h-full rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-2xl font-bold text-slate-500"
                                        >
                                            {artist.artistName[0]}
                                        </div>
                                    {/if}
                                </div>

                                <VerifiedBadge />
                            </div>

                            <!-- Info -->
                            <div class="mb-6 flex-1">
                                <h3
                                    class="text-2xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors truncate"
                                >
                                    {artist.artistName}
                                </h3>
                                <p class="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                                    {artist.bio || 'Artista verificado de la comunidad ChillChess.'}
                                </p>
                            </div>

                            <!-- Metrics Pills -->
                            <div class="flex flex-wrap gap-2 mb-6">
                                <span
                                    class="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-slate-300 border border-white/5 flex items-center gap-2"
                                >
                                    <AlbumIcon size="sm" />
                                    {artistAlbums.length} lanzamientos
                                </span>
                                <span
                                    class="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-slate-300 border border-white/5 flex items-center gap-2"
                                >
                                    <MusicIcon size="sm" />
                                    {totalTracks} pistas
                                </span>
                            </div>

                            <!-- Latest Release Preview -->
                            {#if artistAlbums.length > 0}
                                <div class="pt-4 border-t border-white/5">
                                    <p
                                        class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3"
                                    >
                                        Último lanzamiento
                                    </p>
                                    <div
                                        class="flex items-center gap-3 bg-white/5 p-2 rounded-xl group-hover:bg-white/10 transition-colors"
                                    >
                                        <img
                                            src={getCoverUrl(artistAlbums[0])}
                                            alt=""
                                            class="w-10 h-10 rounded-lg object-cover bg-black/50"
                                        />
                                        <div class="min-w-0">
                                            <p class="text-sm font-bold text-white truncate">
                                                {artistAlbums[0].title}
                                            </p>
                                            <p class="text-xs text-slate-400">
                                                {getAlbumsForArtist(artist, allAlbumsList)[0].tracks
                                                    ?.length || 0} canciones
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    @keyframes fade-in-up {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-fade-in-up {
        animation: fade-in-up 0.6s ease-out;
    }
</style>
