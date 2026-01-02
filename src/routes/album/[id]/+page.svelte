<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { audioStore, playAlbum } from '$lib/audio/store';
    import { getAlbumById } from '$lib/data/albums';
    import type { Album } from '$lib/data/albums';
    import { userSubscription } from '$lib/subscription/userSubscription';
    import PaywallModal from '$lib/components/PaywallModal.svelte';
    import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
    import { db } from '$lib/firebase';
    import { doc, getDoc } from 'firebase/firestore';

    $: albumId = $page.params.id;

    let album: Album | undefined | null = null;
    let loading = true;

    // Reactively load album when ID changes
    $: if (albumId) {
        loadAlbum(albumId);
    }

    async function loadAlbum(id: string) {
        loading = true;
        album = null; // Reset to prevent showing wrong data during load

        // 1. Check Static Data
        let found = getAlbumById(id);

        // 2. Check Store (Dynamic Data)
        if (!found) {
            found = $audioStore.availableAlbums.find((a) => a.id === id);
        }

        // 3. Fetch from Firestore (Fallback)
        if (!found) {
            try {
                const docRef = doc(db, 'albums', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    found = { id: docSnap.id, ...docSnap.data() } as Album;
                }
            } catch (error) {
                console.error('Error loading album:', error);
            }
        }

        album = found;
        loading = false;
    }

    $: isPlaying = $audioStore.isPlaying;
    $: isCurrentAlbum = $audioStore.currentAlbumId === albumId;

    let showPaywall = false;

    function handlePlayAlbum() {
        const currentAlbum = album;
        if (!currentAlbum) return;
        if (currentAlbum.isPremium && $userSubscription.tier === 'free') {
            showPaywall = true;
            return;
        }
        // Ensure store has this album data if it was just fetched
        // Ensure store has this album data if it was just fetched
        if (!$audioStore.availableAlbums.find((a) => a.id === currentAlbum.id)) {
            audioStore.update((s) => ({
                ...s,
                availableAlbums: [...s.availableAlbums, currentAlbum],
            }));
        }
        playAlbum(currentAlbum.id);
    }

    function handlePlayTrack(index: number) {
        const currentAlbum = album;
        if (!currentAlbum) return;

        if (currentAlbum.isPremium && $userSubscription.tier === 'free') {
            showPaywall = true;
            return;
        }

        // Ensure store has this album data if it was just fetched
        // Ensure store has this album data if it was just fetched
        if (!$audioStore.availableAlbums.find((a) => a.id === currentAlbum.id)) {
            audioStore.update((s) => ({
                ...s,
                availableAlbums: [...s.availableAlbums, currentAlbum],
            }));
        }

        playAlbum(currentAlbum.id);
        // Wait for next tick then set track index
        setTimeout(() => {
            audioStore.update((s) => ({ ...s, currentTrackIndex: index }));
        }, 50);
    }

    function formatDuration(seconds?: number) {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            goto('/');
        }
    }
</script>

<svelte:head>
    <title>{album?.title || 'Álbum'} | ChillChess</title>
</svelte:head>

<PaywallModal show={showPaywall} blockedFeature="vibe" on:close={() => (showPaywall = false)} />

{#if !album}
    <div class="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div class="text-center">
            <h1 class="text-2xl font-bold text-white mb-4">Álbum no encontrado</h1>
            <a href="/" class="text-blue-400 hover:text-blue-300">← Volver al inicio</a>
        </div>
    </div>
{:else}
    <div class="min-h-screen bg-[#0B1120] text-white">
        <!-- Header -->
        <div class="border-b border-white/5">
            <div class="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                <button
                    on:click={goBack}
                    class="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
                >
                    <svg
                        class="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    <span class="font-medium">Volver</span>
                </button>

                {#if album.isPremium}
                    <div
                        class="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-xs font-bold"
                    >
                        🔒 PREMIUM
                    </div>
                {/if}
            </div>
        </div>

        <!-- Album View -->
        <div class="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <!-- Left: Album Cover -->
                <div class="lg:col-span-1">
                    <div class="sticky top-8">
                        <div
                            class="aspect-square rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 mb-6"
                        >
                            <img
                                src={album.cover}
                                alt={album.title}
                                class="w-full h-full object-cover"
                            />
                        </div>

                        <div class="text-center mb-6">
                            <h1 class="text-3xl font-bold mb-2">
                                {album.title}
                            </h1>
                            <p
                                class="text-lg text-slate-400 flex items-center justify-center gap-2"
                            >
                                {album.artist}
                                {#if album.artist === 'JULYACTV'}
                                    <VerifiedBadge size="sm" />
                                {/if}
                            </p>
                            <p class="text-sm text-slate-500 mt-2">
                                {album.tracks?.length || 0} canciones
                            </p>
                        </div>

                        <button
                            on:click={handlePlayAlbum}
                            class="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/30"
                        >
                            {#if isPlaying && $audioStore.currentAlbumId === album.id}
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                                <span>Pausar</span>
                            {:else}
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                <span>Reproducir Todo</span>
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Right: Track List -->
                <div class="lg:col-span-2">
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold mb-2">Canciones</h2>
                        <p class="text-slate-400 text-sm">
                            {album.description}
                        </p>
                    </div>

                    <div class="space-y-2">
                        {#each album.tracks || [] as track, index}
                            {@const isCurrentTrack =
                                $audioStore.currentAlbumId === album.id &&
                                $audioStore.currentTrackIndex === index}
                            <button
                                on:click={() => handlePlayTrack(index)}
                                class="w-full group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all flex items-center gap-4 {isCurrentTrack
                                    ? 'ring-2 ring-primary-500'
                                    : ''}"
                            >
                                <!-- Play Button -->
                                <div
                                    class="w-10 h-10 rounded-full bg-white/10 group-hover:bg-primary-500 flex items-center justify-center transition-all shrink-0"
                                >
                                    {#if isCurrentTrack && isPlaying}
                                        <svg
                                            class="w-5 h-5 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                        </svg>
                                    {:else}
                                        <svg
                                            class="w-5 h-5 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    {/if}
                                </div>

                                <!-- Track Number -->
                                <div class="text-slate-500 font-bold w-8 text-left">
                                    {index + 1}
                                </div>

                                <!-- Track Info -->
                                <div class="flex-1 text-left min-w-0">
                                    <div
                                        class="font-medium text-white truncate group-hover:text-blue-300 transition-colors"
                                    >
                                        {track.title}
                                    </div>
                                    <div class="text-sm text-slate-400 truncate">
                                        {track.artist}
                                    </div>
                                </div>

                                <!-- Duration -->
                                <div class="text-slate-500 text-sm font-medium">
                                    {formatDuration(track.duration)}
                                </div>

                                <!-- More Options (placeholder) -->
                                <button
                                    class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <svg
                                        class="w-5 h-5 text-slate-400"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                                        />
                                    </svg>
                                </button>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
