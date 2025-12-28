<script lang="ts">
    import { page } from "$app/stores";
    import { audioStore, playAlbum } from "$lib/audio/store";
    import { getAlbumById } from "$lib/data/albums";
    import { userSubscription } from "$lib/subscription/userSubscription";
    import PaywallModal from "$lib/components/PaywallModal.svelte";

    $: albumId = $page.params.id;
    $: album = getAlbumById(albumId);
    $: isPlaying = $audioStore.isPlaying;
    $: isCurrentAlbum = $audioStore.currentAlbumId === albumId;

    let showPaywall = false;

    function handlePlayAlbum() {
        if (album?.isPremium && $userSubscription.tier === "free") {
            showPaywall = true;
            return;
        }
        if (album) {
            playAlbum(album.id);
        }
    }

    function handlePlayTrack(index: number) {
        if (album?.isPremium && $userSubscription.tier === "free") {
            showPaywall = true;
            return;
        }
        if (album) {
            playAlbum(album.id);
            // Wait for next tick then set track index
            audioStore.update((s) => ({ ...s, currentTrackIndex: index }));
        }
    }

    function formatDuration(seconds?: number) {
        if (!seconds) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
</script>

<svelte:head>
    <title>{album?.title || "Álbum"} | ChillChess</title>
</svelte:head>

<PaywallModal
    show={showPaywall}
    blockedFeature="vibe"
    on:close={() => (showPaywall = false)}
/>

{#if !album}
    <div class="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div class="text-center">
            <h1 class="text-2xl font-bold text-white mb-4">
                Álbum no encontrado
            </h1>
            <a href="/" class="text-blue-400 hover:text-blue-300"
                >← Volver al inicio</a
            >
        </div>
    </div>
{:else}
    <div class="min-h-screen bg-[#0B1120] text-white">
        <!-- Header -->
        <div class="border-b border-white/5">
            <div
                class="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between"
            >
                <a
                    href="/"
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
                </a>

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
                            <p class="text-lg text-slate-400">{album.artist}</p>
                            <p class="text-sm text-slate-500 mt-2">
                                {album.tracks.length} canciones
                            </p>
                        </div>

                        <button
                            on:click={handlePlayAlbum}
                            class="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/30"
                        >
                            {#if isPlaying && $audioStore.currentAlbumId === album.id}
                                <svg
                                    class="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                                <span>Pausar</span>
                            {:else}
                                <svg
                                    class="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
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
                        {#each album.tracks as track, index}
                            {@const isCurrentTrack =
                                $audioStore.currentAlbumId === album.id &&
                                $audioStore.currentTrackIndex === index}
                            <button
                                on:click={() => handlePlayTrack(index)}
                                class="w-full group bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all flex items-center gap-4 {isCurrentTrack
                                    ? 'ring-2 ring-blue-500'
                                    : ''}"
                            >
                                <!-- Play Button -->
                                <div
                                    class="w-10 h-10 rounded-full bg-white/10 group-hover:bg-blue-500 flex items-center justify-center transition-all shrink-0"
                                >
                                    {#if isCurrentTrack && isPlaying}
                                        <svg
                                            class="w-5 h-5 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
                                            />
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
                                <div
                                    class="text-slate-500 font-bold w-8 text-left"
                                >
                                    {index + 1}
                                </div>

                                <!-- Track Info -->
                                <div class="flex-1 text-left min-w-0">
                                    <div
                                        class="font-medium text-white truncate group-hover:text-blue-300 transition-colors"
                                    >
                                        {track.title}
                                    </div>
                                    <div
                                        class="text-sm text-slate-400 truncate"
                                    >
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
