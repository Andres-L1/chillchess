<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import { db } from "$lib/firebase";
    import { doc, deleteDoc } from "firebase/firestore";
    import type { Album } from "$lib/data/albums";

    let searchTerm = "";
    let playingTrack: string | null = null;
    let audio: HTMLAudioElement | null = null;
    let statusMessage = "";

    // Filter albums based on search
    $: filteredAlbums = $audioStore.availableAlbums.filter((album) => {
        const term = searchTerm.toLowerCase();
        return (
            album.title.toLowerCase().includes(term) ||
            album.artist.toLowerCase().includes(term)
        );
    });

    function togglePlay(url: string) {
        if (playingTrack === url) {
            audio?.pause();
            playingTrack = null;
        } else {
            if (audio) audio.pause();
            audio = new Audio(url);
            audio.play();
            playingTrack = url;
            audio.onended = () => (playingTrack = null);
        }
    }

    async function deleteAlbum(album: Album) {
        // Check if it's a local static album (cannot be deleted)
        // Static albums usually have simple IDs like 'asap-forever', remote ones have auto-generated UIDs
        // Or we can check if it exists in the 'albums' collection in Firestore.
        // For safety, we will assume if it has a long ID it's remote, or we try to delete and fail gracefully.

        if (
            !confirm(
                `⚠️ ¿ELIMINAR ÁLBUM "${album.title}"?\n\nEsta acción es irreversible.`,
            )
        )
            return;

        try {
            // Attempt to delete from Firestore
            await deleteDoc(doc(db, "albums", album.id));

            // Remove from store locally to update UI immediately
            audioStore.update((state) => ({
                ...state,
                availableAlbums: state.availableAlbums.filter(
                    (a) => a.id !== album.id,
                ),
            }));

            statusMessage = "✅ Álbum eliminado correctamente";
            setTimeout(() => (statusMessage = ""), 3000);
        } catch (e: any) {
            console.error(e);
            if (e.code === "permission-denied") {
                statusMessage =
                    "❌ No tienes permisos o es un álbum del sistema (no eliminable)";
            } else {
                statusMessage =
                    "❌ Error al eliminar (probablemente es un álbum estático local): " +
                    e.message;
            }
        }
    }
</script>

<div class="animate-fade-in">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-white mb-2">Gestión Musical</h2>
        <p class="text-slate-400">
            Explora y gestiona la biblioteca musical ({$audioStore
                .availableAlbums.length} álbumes)
        </p>
    </div>

    <!-- Status -->
    {#if statusMessage}
        <div class="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl">
            {statusMessage}
        </div>
    {/if}

    <!-- Search -->
    <div class="mb-6">
        <input
            type="text"
            bind:value={searchTerm}
            placeholder="Buscar por álbum o artista..."
            class="w-full bg-midnight-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
        />
    </div>

    <!-- Album Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredAlbums as album}
            <div
                class="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group"
            >
                <div class="flex gap-4 mb-4">
                    <!-- Cover -->
                    <div
                        class="w-20 h-20 rounded-lg overflow-hidden bg-black/50 flex-shrink-0 relative"
                    >
                        <img
                            src={album.cover}
                            alt={album.title}
                            class="w-full h-full object-cover"
                        />
                        {#if album.isPremium}
                            <div
                                class="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5"
                            >
                                PRO
                            </div>
                        {/if}
                    </div>

                    <!-- Info -->
                    <div class="overflow-hidden">
                        <h3
                            class="font-bold text-white truncate"
                            title={album.title}
                        >
                            {album.title}
                        </h3>
                        <p class="text-sm text-slate-400 truncate">
                            {album.artist}
                        </p>
                        <p class="text-xs text-slate-500 mt-1 capitalize">
                            {album.category} • {album.tracks?.length || 0} tracks
                        </p>
                    </div>
                </div>

                <!-- Tracks Preview -->
                <div
                    class="bg-black/20 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto custom-scrollbar"
                >
                    {#if album.tracks && album.tracks.length > 0}
                        {#each album.tracks as track}
                            <div
                                class="flex items-center gap-2 py-1 hover:bg-white/5 rounded px-2 text-xs"
                            >
                                <button
                                    on:click={() => togglePlay(track.file)}
                                    class="text-primary-400 hover:text-white"
                                >
                                    {#if playingTrack === track.file}
                                        ⏸
                                    {:else}
                                        ▶
                                    {/if}
                                </button>
                                <span class="text-slate-300 truncate"
                                    >{track.title}</span
                                >
                            </div>
                        {/each}
                    {:else}
                        <p class="text-xs text-slate-500 text-center py-2">
                            Sin pistas disponibles
                        </p>
                    {/if}
                </div>

                <!-- Actions -->
                <div class="flex justify-end pt-3 border-t border-white/10">
                    <button
                        on:click={() => deleteAlbum(album)}
                        class="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                        🗑️ Eliminar Álbum
                    </button>
                </div>
            </div>
        {/each}
    </div>

    {#if filteredAlbums.length === 0}
        <div class="text-center py-12 text-slate-400">
            <p>No se encontraron álbumes</p>
        </div>
    {/if}
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 4px;
    }
</style>
