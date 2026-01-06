<script lang="ts">
    import { db, storage } from '$lib/firebase';
    import {
        collection,
        addDoc,
        deleteDoc,
        doc,
        query,
        orderBy,
        onSnapshot,
        serverTimestamp,
    } from 'firebase/firestore';
    import { ref, deleteObject } from 'firebase/storage';
    import { onMount, onDestroy } from 'svelte';
    import { uploadToR2 } from '$lib/utils/r2Client';
    import { toast } from 'svelte-french-toast';

    // --- STATE ---
    let catalogTracks: any[] = [];
    let loadingCatalog = false;

    // Upload Form State
    let newTrackTitle = '';
    let newTrackArtist = 'ChillChess Originals';
    let newTrackFile: File | null = null;
    let newTrackCover: File | null = null;
    let isUploading = false;
    let unsubscribeCatalog: () => void;

    onMount(() => {
        subscribeToCatalog();
    });

    onDestroy(() => {
        if (unsubscribeCatalog) unsubscribeCatalog();
    });

    function subscribeToCatalog() {
        loadingCatalog = true;
        const q = query(collection(db, 'creatorCatalog'), orderBy('createdAt', 'desc'));

        unsubscribeCatalog = onSnapshot(
            q,
            (snap) => {
                catalogTracks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                loadingCatalog = false;
            },
            (error) => {
                console.error('Catalog realtime error:', error);
                toast.error('Error cargando catálogo');
                loadingCatalog = false;
            }
        );
    }

    // --- HANDLERS ---
    function handleFileSelect(e: any, type: 'audio' | 'cover') {
        const file = e.target.files[0];
        if (type === 'audio') newTrackFile = file;
        else newTrackCover = file;
    }

    async function uploadToCatalog() {
        if (!newTrackTitle || !newTrackFile) {
            toast.error('Título y archivo de audio son obligatorios');
            return;
        }

        isUploading = true;
        const toastId = toast.loading('Subiendo track...');

        try {
            const timestamp = Date.now();
            const safeFileName = newTrackFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const storagePath = `catalog/${timestamp}_${safeFileName}`;

            // Upload Audio to R2
            const audioUrl = await uploadToR2(newTrackFile, storagePath);

            let coverUrl = '';
            if (newTrackCover) {
                const safeCoverName = newTrackCover.name.replace(/[^a-zA-Z0-9.]/g, '_');
                coverUrl = await uploadToR2(
                    newTrackCover,
                    `catalog/covers/${timestamp}_${safeCoverName}`
                );
            }

            // Save to Firestore
            await addDoc(collection(db, 'creatorCatalog'), {
                title: newTrackTitle,
                artist: newTrackArtist,
                url: audioUrl,
                coverUrl: coverUrl || '/images/default-cover.jpg',
                storagePath: storagePath,
                createdAt: serverTimestamp(),
                duration: 0,
            });

            toast.success('✅ Pista añadida al catálogo', { id: toastId });

            // Reset Form
            newTrackTitle = '';
            newTrackFile = null;
            newTrackCover = null;

            // Clear file inputs
            const inputs = document.querySelectorAll('input[type="file"]');
            inputs.forEach((input: any) => (input.value = ''));
        } catch (e: any) {
            console.error(e);
            toast.error('Error al subir: ' + e.message, { id: toastId });
        } finally {
            isUploading = false;
        }
    }

    async function deleteCatalogTrack(track: any) {
        if (!confirm(`¿Eliminar "${track.title}" del catálogo?`)) return;

        const toastId = toast.loading('Eliminando...');
        try {
            await deleteDoc(doc(db, 'creatorCatalog', track.id));

            // If we still have some old files in Firebase Storage, try to delete them
            // Note: R2 file deletion is currently handled by lifecycle rules or manual cleanup scripts
            // implementing direct R2 delete requires a backend endpoint
            if (track.storagePath && !track.storagePath.startsWith('catalog/')) {
                const audioRef = ref(storage, track.storagePath);
                await deleteObject(audioRef).catch(() =>
                    console.warn('Legacy Audio file not found')
                );
            }

            toast.success('Pista eliminada', { id: toastId });
        } catch (e: any) {
            toast.error('Error al eliminar: ' + e.message, { id: toastId });
        }
    }

    function handleImageError(e: Event) {
        const img = e.currentTarget as HTMLImageElement;
        img.src = '/logo-mobile-legacy.png';
    }
</script>

<div class="space-y-6 animate-fade-in">
    <!-- UPLOAD CARD -->
    <div
        class="bg-gradient-to-br from-[#131b2e] to-[#0f1524] p-6 rounded-2xl border border-white/5"
    >
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>📤</span> Subir Nuevo Track
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
                <input
                    type="text"
                    bind:value={newTrackTitle}
                    placeholder="Título del Track"
                    class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
                />

                <input
                    type="text"
                    bind:value={newTrackArtist}
                    placeholder="Artista"
                    class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all"
                />
            </div>

            <div class="space-y-4">
                <div
                    class="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-3"
                >
                    <span class="text-2xl">🎵</span>
                    <input
                        type="file"
                        accept="audio/*"
                        on:change={(e) => handleFileSelect(e, 'audio')}
                        class="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 cursor-pointer"
                    />
                </div>

                <div
                    class="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-3"
                >
                    <span class="text-2xl">🖼️</span>
                    <input
                        type="file"
                        accept="image/*"
                        on:change={(e) => handleFileSelect(e, 'cover')}
                        class="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 cursor-pointer"
                    />
                </div>
            </div>
        </div>

        <div class="mt-6 flex justify-end">
            <button
                on:click={uploadToCatalog}
                disabled={isUploading}
                class="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all transform active:scale-95 flex items-center gap-2"
            >
                {#if isUploading}
                    <div
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></div>
                    Subiendo...
                {:else}
                    🚀 Publicar Track
                {/if}
            </button>
        </div>
    </div>

    <!-- CATALOG LIST -->
    <div class="bg-[#131b2e]/60 border border-white/5 rounded-2xl overflow-hidden">
        <div class="p-4 border-b border-white/5 bg-black/20">
            <h4 class="font-bold text-slate-400 text-sm uppercase">
                Catálogo Actual ({catalogTracks.length})
            </h4>
        </div>

        {#if loadingCatalog}
            <div class="p-8 text-center text-slate-500">Cargando catálogo...</div>
        {:else if catalogTracks.length === 0}
            <div class="p-8 text-center text-slate-500">No hay tracks en el catálogo.</div>
        {/if}

        <div class="divide-y divide-white/5">
            {#each catalogTracks as track}
                <div
                    class="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                >
                    <div class="flex items-center gap-4">
                        <img
                            src={track.coverUrl}
                            alt=""
                            class="w-12 h-12 rounded-lg object-cover"
                            on:error={handleImageError}
                        />
                        <div>
                            <div class="font-bold text-white text-sm">{track.title}</div>
                            <div class="text-xs text-slate-400">{track.artist}</div>
                        </div>
                    </div>

                    <div
                        class="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <a
                            href={track.url}
                            target="_blank"
                            class="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white"
                            download
                        >
                            ⬇️
                        </a>
                        <button
                            on:click={() => deleteCatalogTrack(track)}
                            class="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
