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
                verifiedArtists.push({ ...doc.data() } as ArtistProfile);
            });
        });

        // 2. Listen for Albums (Global listener for simplicity, or filtered)
        // Since we need to count albums for ALL verified artists, fetching all albums is reasonable for now
        // (assuming < 1000 albums initially).
        const albumsRef = collection(db, 'albums');
        unsubscribeAlbums = onSnapshot(albumsRef, (snapshot) => {
            const firestoreAlbums = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Album);

            // Re-build map and stats
            const tempMap: Record<string, Album[]> = {};

            // Helper to add to map
            const add = (artistName: string, album: Album) => {
                if (!tempMap[artistName]) tempMap[artistName] = [];
                tempMap[artistName].push(album);
            };

            // Add Firestore albums
            firestoreAlbums.forEach((a) => {
                if (a.artist) add(a.artist, a); // Use artist name as key as per current logic
            });

            // Add Static albums (legacy)
            ALBUMS.forEach((a) => {
                // Determine if already present by ID/Name?
                // Simple merge: if not present in firestore, add it.
                if (!firestoreAlbums.find((fa) => fa.id === a.id)) {
                    add(a.artist, a);
                }
            });

            albumsMap = tempMap;

            // Calculate total relevant albums (only for verified artists)
            totalAlbumsCount = Object.keys(tempMap).reduce((sum, artistName) => {
                // Check if this artist is in verified list
                const isVerified = verifiedArtists.some((va) => va.artistName === artistName);
                return sum + (isVerified ? tempMap[artistName].length : 0);
            }, 0);
        });
    });

    onDestroy(() => {
        if (unsubscribeArtists) unsubscribeArtists();
        if (unsubscribeAlbums) unsubscribeAlbums();
    });

    // Get albums for each verified artist (Real-time)
    function getArtistAlbums(artistName: string) {
        return albumsMap[artistName] || [];
    }
</script>

<svelte:head>
    <title>Artistas Verificados | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-midnight-900 text-white font-poppins pb-32 pt-24 px-4 md:px-12">
    <div class="max-w-7xl mx-auto">
        <!-- Back Button -->
        <div class="mb-8">
            <a
                href="/"
                class="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
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
            <div class="inline-flex items-center justify-center mb-4">
                <!-- Microphone SVG Icon -->
                <svg
                    class="w-16 h-16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <defs>
                        <linearGradient id="micGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#FF7B3D;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#FFB347;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Microphone body -->
                    <rect
                        x="9"
                        y="2"
                        width="6"
                        height="11"
                        rx="3"
                        stroke="url(#micGradient)"
                        stroke-width="2"
                        fill="none"
                    />
                    <!-- Microphone stand -->
                    <path d="M12 19v3M8 22h8" stroke="url(#micGradient)" stroke-width="2" />
                    <!-- Sound waves -->
                    <path
                        d="M19 10v2a7 7 0 0 1-14 0v-2"
                        stroke="url(#micGradient)"
                        stroke-width="2"
                    />
                </svg>
            </div>
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
                Artistas <span class="text-primary-500">Verificados</span>
            </h1>
            <p class="text-slate-400 text-lg max-w-2xl mx-auto">
                Conoce a los creadores detrás de la música de ChillChess. Artistas verificados con
                contenido original y de calidad.
            </p>
        </header>

        <!-- Stats -->
        {#if verifiedArtists.length > 0}
            <div class="flex justify-center gap-8 mb-12">
                <div class="text-center">
                    <div class="text-3xl font-bold text-primary-500">
                        {verifiedArtists.length}
                    </div>
                    <div class="text-sm text-slate-500">Artistas Verificados</div>
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-primary-500">
                        {ALBUMS.filter((a) =>
                            verifiedArtists.some((va) => va.artistName === a.artist)
                        ).length}
                    </div>
                    <div class="text-sm text-slate-500">Álbumes Totales</div>
                </div>
            </div>
        {/if}

        <!-- Artists Grid -->
        {#if verifiedArtists.length === 0}
            <div class="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <div class="inline-flex justify-center mb-4 text-slate-600">
                    <MusicIcon size="xl" />
                </div>
                <h3 class="text-2xl font-bold mb-2">Próximamente</h3>
                <p class="text-slate-400">Los artistas verificados aparecerán aquí pronto.</p>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
                {#each verifiedArtists as artist}
                    {@const artistAlbums = getArtistAlbums(artist.artistName)}
                    {@const totalTracks = artistAlbums.reduce(
                        (sum, album) => sum + (album.tracks?.length || 0),
                        0
                    )}

                    <button
                        on:click={() => goto(`/artist/${artist.userId}`)}
                        class="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 rounded-2xl p-6 transition-all hover:scale-105 active:scale-95 text-left"
                    >
                        <!-- Artist Avatar -->
                        <div class="flex items-start gap-4 mb-4">
                            <div
                                class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-3xl shadow-lg shrink-0"
                            >
                                {#if artist.avatarUrl}
                                    <img
                                        src={artist.avatarUrl}
                                        alt={artist.artistName}
                                        class="w-full h-full rounded-full object-cover"
                                    />
                                {:else}
                                    <MusicIcon size="xl" gradient={true} />
                                {/if}
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <h3 class="text-xl font-bold text-white truncate">
                                        {artist.artistName}
                                    </h3>
                                    <div class="flex-shrink-0 relative z-10">
                                        <VerifiedBadge size="sm" />
                                    </div>
                                </div>
                                <p class="text-sm text-slate-400 line-clamp-2">
                                    {artist.bio || 'Artista de ChillChess'}
                                </p>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="flex gap-4 text-sm text-slate-500 mb-4">
                            <div class="flex items-center gap-1.5">
                                <AlbumIcon size="sm" />
                                <span
                                    >{artistAlbums.length} álbum{artistAlbums.length !== 1
                                        ? 'es'
                                        : ''}</span
                                >
                            </div>
                            <div class="flex items-center gap-1.5">
                                <MusicIcon size="sm" />
                                <span>{totalTracks} canciones</span>
                            </div>
                        </div>

                        <!-- Albums Preview -->
                        {#if artistAlbums.length > 0}
                            <div class="flex gap-2 overflow-x-auto pb-2">
                                {#each artistAlbums.slice(0, 3) as album}
                                    <div
                                        class="w-16 h-16 rounded-lg overflow-hidden shrink-0 ring-2 ring-white/10 group-hover:ring-primary-500/50 transition-all"
                                    >
                                        <img
                                            src={album.cover}
                                            alt={album.title}
                                            class="w-full h-full object-cover"
                                        />
                                    </div>
                                {/each}
                                {#if artistAlbums.length > 3}
                                    <div
                                        class="w-16 h-16 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-xs font-bold text-slate-400"
                                    >
                                        +{artistAlbums.length - 3}
                                    </div>
                                {/if}
                            </div>
                        {/if}

                        <!-- CTA -->
                        <div class="mt-4 flex items-center justify-between text-sm">
                            <span
                                class="text-primary-400 font-medium group-hover:text-primary-300 transition-colors"
                            >
                                Ver Perfil →
                            </span>
                            {#if artist.followerCount}
                                <span class="text-slate-500">
                                    {artist.followerCount} seguidores
                                </span>
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
