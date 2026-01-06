<script lang="ts">
    import { db } from '$lib/firebase';
    import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
    import { toast } from 'svelte-french-toast';
    import { audioStore } from '$lib/audio/store';

    let isScanning = false;
    let isDeleting = false;
    let ghostAlbums: any[] = [];
    let scannedCount = 0;

    async function scanForGhostAlbums() {
        isScanning = true;
        ghostAlbums = [];
        scannedCount = 0;

        const toastId = toast.loading('Escaneando bibliotecaánea...');

        try {
            const albumsRef = collection(db, 'albums');
            const snapshot = await getDocs(albumsRef);
            scannedCount = snapshot.size;

            snapshot.docs.forEach((albumDoc) => {
                const album = { id: albumDoc.id, ...albumDoc.data() };

                // Check if album is ghost (no valid tracks)
                const tracks = album.tracks || [];
                const hasValidTrack = tracks.some((track: any) => {
                    return track.file || track.url || track.r2Key;
                });

                if (!hasValidTrack && tracks.length >= 0) {
                    ghostAlbums.push({
                        id: album.id,
                        title: album.title || 'Sin título',
                        artist: album.artist || 'Unknown',
                        trackCount: tracks.length,
                    });
                }
            });

            toast.success(`Escaneo completo: ${ghostAlbums.length} álbumes fantasma encontrados`, {
                id: toastId,
            });
        } catch (e: any) {
            console.error(e);
            toast.error('Error al escanear: ' + e.message, { id: toastId });
        } finally {
            isScanning = false;
        }
    }

    async function deleteGhostAlbum(albumId: string) {
        if (!confirm('¿Eliminar este álbum fantasma?')) return;

        try {
            await deleteDoc(doc(db, 'albums', albumId));

            // Update local array
            ghostAlbums = ghostAlbums.filter((a) => a.id !== albumId);

            // Update audio store
            audioStore.update((s) => ({
                ...s,
                availableAlbums: s.availableAlbums.filter((a) => a.id !== albumId),
            }));

            toast.success('Álbum eliminado');
        } catch (e: any) {
            toast.error('Error: ' + e.message);
        }
    }

    async function deleteAllGhostAlbums() {
        if (
            !confirm(
                `⚠️ ADVERTENCIA: Esto eliminará ${ghostAlbums.length} álbumes sin canciones válidas.\\n\\n¿Continuar?`
            )
        )
            return;

        isDeleting = true;
        const toastId = toast.loading('Eliminando álbumes fantasma...');
        let deleted = 0;

        try {
            for (const album of ghostAlbums) {
                try {
                    await deleteDoc(doc(db, 'albums', album.id));
                    deleted++;
                } catch (e) {
                    console.error(`Failed to delete ${album.id}`, e);
                }
            }

            // Clear the array
            ghostAlbums = [];

            // Refresh audio store
            audioStore.update((s) => ({
                ...s,
                availableAlbums: s.availableAlbums.filter((a) => {
                    const tracks = a.tracks || [];
                    return tracks.some((t: any) => t.file || t.url || t.r2Key);
                }),
            }));

            toast.success(`${deleted} álbumes eliminados`, { id: toastId });
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message, { id: toastId });
        } finally {
            isDeleting = false;
        }
    }
</script>

<div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6">
    <div>
        <h3 class="text-xl font-bold text-white mb-2">🧹 Limpieza de Álbumes Fantasma</h3>
        <p class="text-sm text-slate-400">
            Escanea y elimina álbumes sin canciones válidas (URLs rotas o vacíos).
        </p>
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
        <button
            on:click={scanForGhostAlbums}
            disabled={isScanning}
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {#if isScanning}
                <span
                    class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
            {/if}
            Escanear Biblioteca
        </button>

        {#if ghostAlbums.length > 0}
            <button
                on:click={deleteAllGhostAlbums}
                disabled={isDeleting}
                class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {#if isDeleting}
                    <span
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></span>
                {/if}
                Eliminar Todos ({ghostAlbums.length})
            </button>
        {/if}
    </div>

    <!-- Stats -->
    {#if scannedCount > 0}
        <div class="bg-black/20 rounded-xl p-4 text-sm">
            <div class="flex justify-between text-slate-300">
                <span>Álbumes escaneados:</span>
                <span class="font-bold text-white">{scannedCount}</span>
            </div>
            <div class="flex justify-between text-slate-300">
                <span>Álbumes fantasma:</span>
                <span class="font-bold text-red-400">{ghostAlbums.length}</span>
            </div>
        </div>
    {/if}

    <!-- Ghost Albums List -->
    {#if ghostAlbums.length > 0}
        <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            <p class="text-xs text-slate-500 uppercase font-bold">Álbumes Encontrados</p>
            {#each ghostAlbums as album}
                <div
                    class="flex items-center justify-between bg-black/20 rounded-lg p-3 hover:bg-black/30 transition-colors"
                >
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white truncate">{album.title}</p>
                        <p class="text-xs text-slate-500">
                            {album.artist} · {album.trackCount} tracks
                        </p>
                    </div>
                    <button
                        on:click={() => deleteGhostAlbum(album.id)}
                        class="ml-3 px-3 py-1 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-bold rounded-lg transition-all"
                    >
                        Eliminar
                    </button>
                </div>
            {/each}
        </div>
    {/if}
</div>
