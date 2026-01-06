<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    import { db } from '$lib/firebase';
    import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
    import { uploadToR2 } from '$lib/utils/r2Client';
    import { toast } from 'svelte-french-toast';

    const dispatch = createEventDispatcher();

    export let verifiedArtists: any[] = [];

    let newAlbumData = {
        title: '',
        artist: '',
        artistId: '',
        albumCategory: 'musica',
        coverFile: null as File | null,
        tracks: [] as File[],
    };

    let selectedArtistId = '';
    let isCreating = false;

    // Auto-fill artist name
    $: if (selectedArtistId) {
        const artist = verifiedArtists.find((a) => a.uid === selectedArtistId);
        if (artist) {
            newAlbumData.artist = artist.displayName;
            newAlbumData.artistId = artist.uid;
        }
    }

    function handleCoverSelect(e: any) {
        newAlbumData.coverFile = e.target.files[0];
    }

    function handleTracksSelect(e: any) {
        newAlbumData.tracks = Array.from(e.target.files);
    }

    async function createAlbum() {
        if (
            !newAlbumData.title ||
            !newAlbumData.artist ||
            !newAlbumData.coverFile ||
            newAlbumData.tracks.length === 0
        ) {
            toast.error('Completa todos los campos (Portada y Tracks obligatorios)');
            return;
        }

        isCreating = true;
        const toastId = toast.loading('Creando álbum...');

        try {
            // Sanitized folder names
            const safeArtist = newAlbumData.artist.replace(/[^a-zA-Z0-9]/g, '_');
            const safeAlbum = newAlbumData.title.replace(/[^a-zA-Z0-9]/g, '_');

            // 1. Upload Cover
            let coverUrl = '';
            if (newAlbumData.coverFile) {
                coverUrl = await uploadToR2(
                    newAlbumData.coverFile,
                    `albums/${newAlbumData.artistId}/${safeAlbum}`
                );
            }

            // 2. Upload Tracks
            const uploadedTracks: any[] = [];
            for (const file of newAlbumData.tracks) {
                const trackUrl = await uploadToR2(
                    file,
                    `albums/${newAlbumData.artistId}/${safeAlbum}/tracks`
                );

                uploadedTracks.push({
                    title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                    artist: newAlbumData.artist,
                    file: trackUrl,
                    id: crypto.randomUUID(),
                    duration: 0,
                });
            }

            // 3. Save to Firestore
            await addDoc(collection(db, 'albums'), {
                title: newAlbumData.title,
                artist: newAlbumData.artist,
                artistId: newAlbumData.artistId,
                albumCategory: newAlbumData.albumCategory,
                cover: coverUrl,
                tracks: uploadedTracks,
                createdAt: serverTimestamp(),
                vibeId: 'custom',
                price: 'Free',
                tag: 'New',
                description: 'Uploaded via Admin R2',
                isPremium: false,
            });

            toast.success('Álbum creado exitosamente', { id: toastId });
            dispatch('close');
        } catch (e: any) {
            console.error(e);
            toast.error('Error: ' + e.message, { id: toastId });
        } finally {
            isCreating = false;
        }
    }
</script>

<div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
    on:click|self={() => dispatch('close')}
    on:keydown={(e) => e.key === 'Escape' && dispatch('close')}
    role="button"
    tabindex="0"
    aria-label="Cerrar modal"
    transition:fade
>
    <div
        class="bg-midnight-900 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-3xl shadow-2xl relative overflow-y-auto max-h-[90vh]"
    >
        <button
            on:click={() => dispatch('close')}
            class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
            ✕
        </button>

        <h3 class="text-2xl font-bold mb-6 flex items-center gap-3">
            <span class="text-3xl">💿</span> Crear Nuevo Álbum
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- LEFT: Metadata -->
            <div class="space-y-5">
                <label class="block group">
                    <span class="block text-sm font-semibold text-slate-400 mb-2"
                        >Título del Álbum</span
                    >
                    <input
                        type="text"
                        bind:value={newAlbumData.title}
                        class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none"
                        placeholder="Ej. Summer Vibes"
                    />
                </label>

                <label class="block group">
                    <span class="block text-sm font-semibold text-slate-400 mb-2">Artista</span>
                    <div class="relative">
                        <select
                            bind:value={selectedArtistId}
                            class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 appearance-none"
                        >
                            <option value="" disabled selected>-- Selecciona un Artista --</option>
                            {#each verifiedArtists as artist}
                                <option value={artist.uid}>
                                    {artist.displayName}
                                    {artist.isFounder ? '(Fundador 💎)' : ''}
                                </option>
                            {/each}
                        </select>
                        <div
                            class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500"
                        >
                            ▼
                        </div>
                    </div>
                </label>

                <label class="block group">
                    <span class="block text-sm font-semibold text-slate-400 mb-2">Categoría</span>
                    <select
                        bind:value={newAlbumData.albumCategory}
                        class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none"
                    >
                        <option value="musica">Música</option>
                        <option value="juegos">Juegos / Focus</option>
                        <option value="ambiente">Ambiente</option>
                    </select>
                </label>
            </div>

            <!-- RIGHT: Files -->
            <div class="space-y-5">
                <label class="block group cursor-pointer">
                    <span class="block text-sm font-semibold text-slate-400 mb-2">Portada</span>
                    <div
                        class="relative w-full aspect-video md:aspect-square bg-black/40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-4 hover:border-primary-500/50 transition-all overflow-hidden"
                    >
                        {#if newAlbumData.coverFile}
                            <div
                                class="absolute inset-0 bg-cover bg-center"
                                style="background-image: url({URL.createObjectURL(
                                    newAlbumData.coverFile
                                )});"
                            ></div>
                        {:else}
                            <span class="text-4xl mb-2 opacity-50">🖼️</span>
                            <span class="text-xs text-slate-500">Click para subir</span>
                        {/if}
                        <input
                            type="file"
                            accept="image/*"
                            on:change={handleCoverSelect}
                            class="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </label>

                <label class="block group">
                    <span class="block text-sm font-semibold text-slate-400 mb-2"
                        >Tracks (Múltiple)</span
                    >
                    <div class="bg-black/40 border border-white/10 rounded-xl p-4">
                        <input
                            type="file"
                            multiple
                            accept="audio/*"
                            on:change={handleTracksSelect}
                            class="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30 cursor-pointer"
                        />
                        {#if newAlbumData.tracks.length > 0}
                            <div class="mt-2 text-xs text-slate-300">
                                {newAlbumData.tracks.length} archivos seleccionados
                            </div>
                        {/if}
                    </div>
                </label>
            </div>
        </div>

        <div class="flex justify-end gap-4">
            <button
                on:click={() => dispatch('close')}
                class="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-white/5 transition-colors"
            >
                Cancelar
            </button>
            <button
                on:click={createAlbum}
                disabled={isCreating}
                class="px-8 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-primary-900/20 transition-all flex items-center gap-2"
            >
                {#if isCreating}
                    <div
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></div>
                    Creando...
                {:else}
                    ✨ Crear Álbum
                {/if}
            </button>
        </div>
    </div>
</div>
