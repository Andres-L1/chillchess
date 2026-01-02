<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
    import type { ArtistProfile } from '$lib/types/artist';
    import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
    import MusicIcon from '$lib/components/icons/MusicIcon.svelte';
    import { playAlbum, audioStore } from '$lib/audio/store';
    import { SOCIAL_PLATFORMS } from '$lib/types/artist';
    import { db } from '$lib/firebase';
    import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
    import { ALBUMS } from '$lib/data/albums'; // Keep type reference if needed, but not data
    import type { Album } from '$lib/data/albums';

    export let data: { artistProfile: ArtistProfile; artistId: string };

    // Use reactive variable for real-time updates
    let artist = data.artistProfile;
    let artistAlbums: Album[] = []; // Changed to local state
    let unsubscribeArtist: (() => void) | null = null;
    let unsubscribeAlbums: (() => void) | null = null; // New listener for albums

    // Set up real-time listener
    onMount(() => {
        // 1. Listen to Artist Profile changes
        const artistRef = doc(db, 'artists', data.artistId);
        unsubscribeArtist = onSnapshot(artistRef, (docSnap) => {
            if (docSnap.exists()) {
                artist = docSnap.data() as ArtistProfile;
            }
        });

        // 2. Listen to Albums changes (Real-time Discography)
        // We listen to BOTH querying by artistId (new standard) AND artist Name (legacy/fallback)
        // This ensures old albums and new ones both appear.
        const albumsRef = collection(db, 'albums');

        // Query 1: By ID
        const qId = query(albumsRef, where('artistId', '==', data.artistId));

        // Query 2: By Name (Legacy support) - we need to wait for artist profile to load name first?
        // Actually, 'artist' variable is reactive but inside onMount we need the initial value or wait.
        // Let's rely on data.artistProfile.artistName or updated artist.artistName.
        // Ideally we start with ID query, but we can setup name query too.

        const updateAlbums = (newDocs: Album[]) => {
            // Merge with existing state.
            const currentMap = new Map(artistAlbums.map((a) => [a.id, a]));
            newDocs.forEach((a) => currentMap.set(a.id, a));

            // Also merge static albums just in case specific ones are hardcoded
            const staticAlbums = ALBUMS.filter((a) => a.artist === artist.artistName);
            staticAlbums.forEach((a) => {
                if (!currentMap.has(a.id)) currentMap.set(a.id, a);
            });

            artistAlbums = Array.from(currentMap.values()).sort((a, b) => {
                const timeA = (a.createdAt as any)?.seconds || 0;
                const timeB = (b.createdAt as any)?.seconds || 0;
                return timeB - timeA;
            });
        };

        const unsubId = onSnapshot(qId, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Album);
            updateAlbums(docs);
        });

        // We also want to query by Name, but only if we have a name.
        // Note: This might duplicate reads if an album has both correct ID and Name, but map deduplicates.
        let unsubName: (() => void) | null = null;
        if (artist.artistName) {
            const qName = query(albumsRef, where('artist', '==', artist.artistName));
            unsubName = onSnapshot(qName, (snapshot) => {
                const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Album);
                updateAlbums(docs);
            });
        }

        unsubscribeAlbums = () => {
            unsubId();
            if (unsubName) unsubName();
        };
    });

    onDestroy(() => {
        if (unsubscribeArtist) unsubscribeArtist();
        if (unsubscribeAlbums) unsubscribeAlbums();
    });

    $: totalTracks = artistAlbums.reduce((sum, album) => sum + (album.tracks?.length || 0), 0);
    $: popularTracks = artistAlbums
        .flatMap((album) => album.tracks || [])
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

    function handlePlayAlbum(albumId: string) {
        playAlbum(albumId);
    }

    function getSocialIcon(platform: string) {
        return SOCIAL_PLATFORMS.find((p) => p.id === platform)?.icon || '🔗';
    }
    $: flatTracks = artistAlbums.flatMap((a) =>
        (a.tracks || []).map((t) => ({
            ...t,
            albumCover: a.cover,
            albumTitle: a.title,
            artist: a.artist,
        }))
    );

    $: totalDurationSeconds = flatTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
    $: formattedDuration = formatTime(totalDurationSeconds);

    function formatTime(seconds: number) {
        if (!seconds) return '--';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }

    function playArtistMix() {
        audioStore.update((s) => ({
            ...s,
            playlist: flatTracks,
            currentTrackIndex: 0,
            isPlaying: true,
            isRadioMode: false,
            currentAlbumId: undefined,
        }));
    }

    function handlePlayTrack(index: number) {
        audioStore.update((s) => ({
            ...s,
            playlist: flatTracks,
            currentTrackIndex: index,
            isPlaying: true,
            isRadioMode: false,
            currentAlbumId: undefined,
        }));
    }
</script>

<svelte:head>
    <title>{artist.artistName} | Artistas ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-midnight-900 text-white font-poppins">
    <!-- Header with Banner -->
    <div class="relative h-64 md:h-80 overflow-hidden">
        {#if artist.bannerUrl}
            <img
                src={artist.bannerUrl}
                alt="{artist.artistName} banner"
                class="w-full h-full object-cover"
            />
        {:else}
            <div
                class="w-full h-full bg-gradient-to-br from-primary-900/40 via-midnight-800 to-midnight-900"
            ></div>
        {/if}
        <div
            class="absolute inset-0 bg-gradient-to-t from-midnight-900 via-midnight-900/50 to-transparent"
        ></div>

        <!-- Back Button -->
        <div class="absolute top-6 left-6">
            <a
                href="/artists"
                class="inline-flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/10 rounded-xl transition-all text-white"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                Volver a Artistas
            </a>
        </div>
    </div>

    <!-- Profile Section -->
    <div class="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
        <div class="flex flex-col md:flex-row gap-8 mb-12">
            <!-- Avatar -->
            <div class="mx-auto md:mx-0">
                <div
                    class="w-40 h-40 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-6xl shadow-2xl ring-4 ring-midnight-900"
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
            </div>

            <!-- Info -->
            <div class="flex-1 text-center md:text-left">
                <div class="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
                    <h1 class="text-4xl md:text-5xl font-bold">
                        {artist.artistName}
                    </h1>
                    <VerifiedBadge size="xl2" />
                </div>

                <p class="text-lg text-slate-300 mb-6 max-w-2xl">
                    {artist.bio}
                </p>

                <!-- Stats -->
                <div class="flex flex-wrap justify-center md:justify-start gap-6 mb-6">
                    <div class="text-center md:text-left">
                        <div class="text-2xl font-bold text-primary-500">
                            {artistAlbums.length}
                        </div>
                        <div class="text-sm text-slate-500">Álbumes</div>
                    </div>
                    <div class="text-center md:text-left">
                        <div class="text-2xl font-bold text-primary-500">
                            {totalTracks}
                        </div>
                        <div class="text-sm text-slate-500">Canciones</div>
                    </div>
                    {#if artist.followerCount}
                        <div class="text-center md:text-left">
                            <div class="text-2xl font-bold text-primary-500">
                                {artist.followerCount}
                            </div>
                            <div class="text-sm text-slate-500">Seguidores</div>
                        </div>
                    {/if}
                </div>

                <!-- Social Links -->
                {#if artist.socialLinks && artist.socialLinks.length > 0}
                    <div class="flex flex-wrap justify-center md:justify-start gap-3">
                        {#each artist.socialLinks as social}
                            <a
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all flex items-center gap-2"
                            >
                                <span>{getSocialIcon(social.platform)}</span>
                                <span class="text-sm capitalize">{social.platform}</span>
                            </a>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Songs Section (NEW) -->
        {#if flatTracks.length > 0}
            <div class="mb-12 animate-fade-in">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div class="flex items-center gap-4">
                        <h2 class="text-3xl font-bold">Canciones</h2>
                        <div
                            class="text-sm text-slate-500 bg-white/5 px-3 py-1 rounded-full whitespace-nowrap"
                        >
                            {flatTracks.length} tracks • {formattedDuration}
                        </div>
                    </div>
                    <button
                        on:click={playArtistMix}
                        class="w-full md:w-auto bg-primary-500 hover:bg-primary-400 text-white px-6 py-2 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary-500/20 transform hover:-translate-y-0.5"
                    >
                        <span>▶</span> Reproducir Todo
                    </button>
                </div>

                <div class="bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
                    <div class="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                        {#each flatTracks as track, i}
                            <button
                                class="w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors group rounded-xl text-left"
                                on:click={() => handlePlayTrack(i)}
                            >
                                <div
                                    class="w-12 h-12 rounded-lg bg-slate-800 flex-shrink-0 overflow-hidden relative group-hover:shadow-lg transition-all"
                                >
                                    <img
                                        src={track.albumCover}
                                        alt={track.albumTitle}
                                        class="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                                    />
                                    <div
                                        class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span class="text-white text-sm">▶</span>
                                    </div>
                                </div>

                                <span
                                    class="text-sm font-mono text-slate-600 w-6 text-center group-hover:text-primary-400 transition-colors"
                                >
                                    {i + 1}
                                </span>

                                <div class="min-w-0 flex-1">
                                    <div
                                        class="font-bold text-white truncate group-hover:text-primary-300 transition-colors"
                                    >
                                        {track.title}
                                    </div>
                                    <div
                                        class="text-xs text-slate-400 truncate flex items-center gap-2"
                                    >
                                        <span>{track.albumTitle}</span>
                                    </div>
                                </div>
                                <div
                                    class="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                                >
                                    ▶
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}

        <!-- Albums Section -->
        <div class="pb-32">
            <h2 class="text-3xl font-bold mb-8">Discografía</h2>

            {#if artistAlbums.length === 0}
                <div class="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                    <div class="inline-flex justify-center mb-3 text-slate-400">
                        <MusicIcon size="xl" />
                    </div>
                    <p class="text-slate-400">Este artista aún no tiene álbumes publicados.</p>
                </div>
            {:else}
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {#each artistAlbums as album}
                        <button on:click={() => goto(`/album/${album.id}`)} class="group text-left">
                            <div
                                class="aspect-square rounded-2xl bg-slate-800 mb-4 overflow-hidden relative shadow-lg group-hover:shadow-primary-500/30 transition-all group-hover:-translate-y-2"
                            >
                                <img
                                    src={album.cover}
                                    alt={album.title}
                                    class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />

                                <!-- Play Overlay -->
                                <div
                                    class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <button
                                        on:click|stopPropagation={() => handlePlayAlbum(album.id)}
                                        class="w-14 h-14 bg-primary-500 hover:bg-primary-400 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                    >
                                        {#if $audioStore.currentAlbumId === album.id && $audioStore.isPlaying}
                                            <svg
                                                class="w-6 h-6"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                            </svg>
                                        {:else}
                                            <svg
                                                class="w-6 h-6 ml-1"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        {/if}
                                    </button>
                                </div>
                            </div>

                            <h3
                                class="font-bold text-white/90 group-hover:text-primary-400 transition-colors truncate mb-1"
                            >
                                {album.title}
                            </h3>
                            <p class="text-sm text-slate-400 truncate">
                                {(album.tracks || []).length} canciones
                            </p>

                            {#if album.tag}
                                <span
                                    class="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-300 font-bold"
                                >
                                    {album.tag}
                                </span>
                            {/if}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>
