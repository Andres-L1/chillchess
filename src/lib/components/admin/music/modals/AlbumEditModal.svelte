<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { db } from '$lib/firebase';
    import { doc, updateDoc } from 'firebase/firestore';
    import { uploadToR2 } from '$lib/utils/r2Client';
    import { toast } from 'svelte-french-toast';
    import { audioStore } from '$lib/audio/store';

    const dispatch = createEventDispatcher();

    export let album: any; // The album to edit
    export let verifiedArtists: any[] = [];

    // Local state initialized from prop
    let editingAlbum = { ...album };

    // Additional state for updates
    let editCoverFile: File | null = null;
    let newTrackForAlbum = {
        title: '',
        file: null as File | null,
    };

    let isSaving = false;
    let selectedArtistId = editingAlbum.artistId || '';

    // Auto-fill artist on selection
    $: if (selectedArtistId) {
        const artist = verifiedArtists.find((a) => a.uid === selectedArtistId);
        if (artist) {
            editingAlbum.artist = artist.displayName;
            editingAlbum.artistId = artist.uid;
        }
    }

    function handleCoverSelect(e: any) {
        editCoverFile = e.target.files[0];
    }

    function handleNewTrackFile(e: any) {
        newTrackForAlbum.file = e.target.files[0];
    }

    async function saveChanges() {
        if (!editingAlbum.title || !editingAlbum.artist) {
            toast.error('Título y Artista son obligatorios');
            return;
        }

        isSaving = true;
        const toastId = toast.loading('Guardando cambios...');

        try {
            const updateData: any = {
                title: editingAlbum.title,
                artist: editingAlbum.artist,
                albumCategory: editingAlbum.albumCategory,
                updatedAt: Date.now(),
            };

            if (editingAlbum.artistId) {
                updateData.artistId = editingAlbum.artistId;
            }

            // Upload new cover if changed
            if (editCoverFile) {
                const timestamp = Date.now();
                updateData.cover = await uploadToR2(
                    editCoverFile,
                    `albums/${editingAlbum.artistId || 'unknown'}/${timestamp}_cover`
                );
                editingAlbum.cover = updateData.cover;
            }

            // Clean undefined
            Object.keys(updateData).forEach(
                (key) => updateData[key] === undefined && delete updateData[key]
            );

            const albumRef = doc(db, 'albums', editingAlbum.id);
            await updateDoc(albumRef, updateData);

            // Update local store
            audioStore.update((s) => ({
                ...s,
                availableAlbums: s.availableAlbums.map((a) =>
                    a.id === editingAlbum.id ? { ...a, ...editingAlbum } : a
                ),
            }));

            toast.success('Álbum actualizado', { id: toastId });
            dispatch('close');
        } catch (e: any) {
            console.error(e);
            toast.error('Error: ' + e.message, { id: toastId });
        } finally {
            isSaving = false;
        }
    }

    async function addTrack() {
        if (!newTrackForAlbum.title.trim() || !newTrackForAlbum.file) {
            toast.error('Título y archivo son requeridos');
            return;
        }

        const toastId = toast.loading('Subiendo track...');
        try {
            const timestamp = Date.now();
            const safeTitle = newTrackForAlbum.title.replace(/[^a-zA-Z0-9]/g, '_');

            const trackUrl = await uploadToR2(
                newTrackForAlbum.file,
                `albums/${editingAlbum.artistId || 'unknown'}/tracks/${timestamp}_${safeTitle}`
            );

            const newTrack = {
                id: `track-${Date.now()}`,
                title: newTrackForAlbum.title.trim(),
                artist: editingAlbum.artist,
                file: trackUrl,
                duration: 0,
            };

            const updatedTracks = [...(editingAlbum.tracks || []), newTrack];
            editingAlbum.tracks = updatedTracks;

            const albumRef = doc(db, 'albums', editingAlbum.id);
            await updateDoc(albumRef, {
                tracks: updatedTracks,
                updatedAt: Date.now(),
            });

            // Update store
            audioStore.update((s) => ({
                ...s,
                availableAlbums: s.availableAlbums.map((a) =>
                    a.id === editingAlbum.id ? { ...a, tracks: updatedTracks } : a
                ),
            }));

            newTrackForAlbum = { title: '', file: null };
            // Clear input
            const input = document.getElementById('newTrackInput') as HTMLInputElement;
            if (input) input.value = '';

            toast.success('Track añadido', { id: toastId });
        } catch (e: any) {
            console.error(e);
            toast.error('Error al añadir track: ' + e.message, { id: toastId });
        }
    }

    async function removeTrack(trackId: string) {
        if (!confirm('¿Eliminar esta canción?')) return;

        try {
            const updatedTracks = editingAlbum.tracks.filter((t: any) => t.id !== trackId);
            editingAlbum.tracks = updatedTracks;

            const albumRef = doc(db, 'albums', editingAlbum.id);
            await updateDoc(albumRef, {
                tracks: updatedTracks,
                updatedAt: Date.now(),
            });

            // Update store
            audioStore.update((s) => ({
                ...s,
                availableAlbums: s.availableAlbums.map((a) =>
                    a.id === editingAlbum.id ? { ...a, tracks: updatedTracks } : a
                ),
            }));

            toast.success('Track eliminado');
        } catch (e: any) {
            toast.error('Error: ' + e.message);
        }
    }
</script>

<div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
    on:click|self={() => dispatch('close')}
    on:keydown={(e) => e.key === 'Escape' && dispatch('close')}
    role="button"
    tabindex="0"
    transition:fade
>
    <!-- MODAL CONTENT -->
    <div
        class="bg-[#131b2e] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-4xl shadow-2xl relative overflow-y-auto max-h-[90vh] flex flex-col md:flex-row gap-8"
    >
        <button
            on:click={() => dispatch('close')}
            class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
            ✕
        </button>

        <!-- LEFT COLUMN: Album Info -->
        <div class="flex-1 space-y-6">
            <h3 class="text-2xl font-bold text-white flex items-center gap-2">
                <span>✏️</span> Editar Álbum
            </h3>

            <!-- Cover Preview & Edit -->
            <div
                class="relative w-full aspect-square rounded-2xl overflow-hidden group border border-white/10"
            >
                <img
                    src={editCoverFile ? URL.createObjectURL(editCoverFile) : editingAlbum.cover}
                    alt="Cover"
                    class="w-full h-full object-cover"
                />
                <div
                    class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    <span class="text-white font-bold">Cambiar Portada</span>
                    <input
                        type="file"
                        on:change={handleCoverSelect}
                        accept="image/*"
                        class="absolute inset-0 opacity-0 cursor-pointer"
                    />
                </div>
            </div>

            <!-- Metadata Form -->
            <div class="space-y-4">
                <input
                    type="text"
                    bind:value={editingAlbum.title}
                    class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white font-bold"
                    placeholder="Título"
                />

                <select
                    bind:value={selectedArtistId}
                    class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white"
                >
                    {#each verifiedArtists as artist}
                        <option value={artist.uid}>{artist.displayName}</option>
                    {/each}
                </select>

                <select
                    bind:value={editingAlbum.albumCategory}
                    class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white"
                >
                    <option value="musica">Música</option>
                    <option value="juegos">Juegos</option>
                    <option value="ambiente">Ambiente</option>
                </select>
            </div>

            <button
                on:click={saveChanges}
                disabled={isSaving}
                class="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2"
            >
                {#if isSaving}
                    <span
                        class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    ></span>
                {/if}
                Guardar Cambios
            </button>
        </div>

        <!-- RIGHT COLUMN: Tracks Manager -->
        <div class="flex-1 bg-black/20 rounded-2xl p-4 border border-white/5 flex flex-col h-full">
            <h4 class="font-bold text-white mb-4">Gestión de Tracks</h4>

            <!-- Add Track Form -->
            <div class="bg-white/5 p-4 rounded-xl mb-4 space-y-3">
                <p class="text-xs text-slate-400 uppercase font-bold">Añadir Track</p>
                <input
                    type="text"
                    bind:value={newTrackForAlbum.title}
                    placeholder="Nombre de la canción"
                    class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <input
                    id="newTrackInput"
                    type="file"
                    accept="audio/*"
                    on:change={handleNewTrackFile}
                    class="block w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-white/10 file:text-white hover:file:bg-white/20"
                />
                <button
                    on:click={addTrack}
                    class="w-full py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                    ＋ Añadir
                </button>
            </div>

            <!-- Track List -->
            <div class="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                {#each editingAlbum.tracks || [] as track, i}
                    <div
                        class="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group"
                    >
                        <div class="flex items-center gap-3 overflow-hidden">
                            <span class="text-xs text-slate-500 w-4">{i + 1}</span>
                            <span class="text-sm text-slate-200 truncate">{track.title}</span>
                        </div>
                        <button
                            on:click={() => removeTrack(track.id)}
                            class="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                            title="Eliminar"
                        >
                            ✕
                        </button>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
