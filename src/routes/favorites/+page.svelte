<script lang="ts">
    import { favoritesStore, toggleFavorite } from '$lib/data/favorites';
    import { ALBUMS, type Track } from '$lib/data/albums';
    import { playPlaylist, audioStore } from '$lib/audio/store';

    // Flatten tracks y añadir info del álbum
    interface AugmentedTrack extends Track {
        albumCover: string;
        albumTitle: string;
    }

    // Reactividad para reconstruir la lista cuando cambien los favoritos
    $: favoriteTracks = ALBUMS.flatMap((album) =>
        (album.tracks || []).map((track) => ({
            ...track,
            albumCover: album.cover,
            albumTitle: album.title,
        }))
    ).filter((t) => $favoritesStore.includes(t.id || ''));

    function playAll() {
        if (favoriteTracks.length > 0) {
            playPlaylist(favoriteTracks);
        }
    }

    function playTrack(index: number) {
        // Reproducir la lista de favoritos empezando desde este índice
        audioStore.update((s) => ({
            ...s,
            playlist: favoriteTracks,
            currentTrackIndex: index,
            currentAlbumId: undefined,
            isPlaying: true,
        }));
    }
</script>

<svelte:head>
    <title>Mi Música | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-[#0B1120] text-white pb-32 pt-28 px-4 md:px-8 font-poppins">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-12">
        <div
            class="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 sm:gap-6 mb-8 border-b border-white/10 pb-8"
        >
            <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div
                    class="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-rose-900/20"
                >
                    💖
                </div>
                <div class="text-center sm:text-left">
                    <h5 class="text-sm font-bold uppercase text-slate-400 tracking-wider mb-2">
                        Playlist Personal
                    </h5>
                    <h1
                        class="text-3xl sm:text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-200"
                    >
                        Mi Música
                    </h1>
                    <p
                        class="text-slate-400 mt-2 flex items-center gap-2 justify-center sm:justify-start"
                    >
                        <span class="text-white font-bold">{favoriteTracks.length}</span> canciones favoritas
                    </p>
                </div>
            </div>

            {#if favoriteTracks.length > 0}
                <button
                    on:click={playAll}
                    class="bg-rose-500 hover:bg-rose-600 text-white rounded-full p-3 sm:p-4 shadow-lg shadow-rose-500/30 hover:scale-105 transition-all shrink-0"
                    aria-label="Reproducir todo"
                >
                    <svg class="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24"
                        ><path d="M8 5v14l11-7z" /></svg
                    >
                </button>
            {/if}
        </div>

        <!-- Track List -->
        {#if favoriteTracks.length > 0}
            <div class="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                <!-- Table Header (hidden on mobile) -->
                <div
                    class="hidden sm:grid grid-cols-[auto_1fr_auto] gap-4 p-4 text-xs font-bold text-slate-500 border-b border-white/5 uppercase tracking-wider"
                >
                    <span class="w-8 text-center">#</span>
                    <span>Título</span>
                    <span class="mr-4">Acciones</span>
                </div>
                <div class="divide-y divide-white/5">
                    {#each favoriteTracks as track, i}
                        <div
                            class="group grid grid-cols-[auto_1fr_auto] gap-4 p-3 hover:bg-white/5 transition-colors items-center"
                        >
                            <div
                                class="w-8 text-center text-slate-500 font-bold group-hover:text-white"
                            >
                                <button
                                    class="w-full h-full flex items-center justify-center"
                                    on:click={() => playTrack(i)}
                                >
                                    <span class="group-hover:hidden">{i + 1}</span>
                                    <svg
                                        class="w-4 h-4 hidden group-hover:block"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg
                                    >
                                </button>
                            </div>

                            <div class="min-w-0 flex items-center gap-4">
                                <img
                                    src={track.albumCover}
                                    alt={track.albumTitle}
                                    class="w-10 h-10 rounded shadow-sm object-cover"
                                />
                                <div class="min-w-0">
                                    <div class="font-medium text-white truncate">
                                        {track.title}
                                    </div>
                                    <div class="text-xs text-slate-400 truncate">
                                        {track.artist}
                                    </div>
                                </div>
                            </div>

                            <button
                                on:click={() => toggleFavorite(track.id || '')}
                                class="text-rose-500 hover:text-white hover:bg-rose-500 p-2 rounded-full transition-colors mr-2"
                                title="Quitar de favoritos"
                            >
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    />
                                </svg>
                            </button>
                        </div>
                    {/each}
                </div>
            </div>
        {:else}
            <div
                class="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed"
            >
                <div class="text-6xl mb-6 opacity-20">💔</div>
                <h2 class="text-2xl font-bold text-slate-100 mb-2">Aún no tienes favoritos</h2>
                <p class="text-slate-400 mb-8 max-w-md mx-auto">
                    Explora la colección y dale al corazón para guardar tus canciones preferidas
                    aquí.
                </p>
                <a
                    href="/coleccion"
                    class="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-bold transition-all inline-block hover:scale-105 shadow-lg shadow-primary-500/20"
                >
                    Explorar Música
                </a>
            </div>
        {/if}
    </div>
</div>
