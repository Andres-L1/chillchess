<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { userStore } from '$lib/auth/userStore';
    import { userSubscription } from '$lib/subscription/userSubscription';
    import { goto } from '$app/navigation';
    import { db, storage } from '$lib/firebase';
    import {
        collection,
        query,
        where,
        onSnapshot,
        addDoc,
        updateDoc,
        deleteDoc,
        doc,
        serverTimestamp,
    } from 'firebase/firestore';
    import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
    import { toast } from '$lib/stores/notificationStore';
    import type { Album } from '$lib/data/albums';

    let albums: Album[] = [];
    let loading = true;
    let unsubscribe: (() => void) | null = null;

    // Modal state
    let showModal = false;
    let editingAlbum: Album | null = null;
    let modalMode: 'create' | 'edit' = 'create';

    // Form state
    let title = '';
    let category = 'Lo-fi';
    let coverFile: File | null = null;
    let coverPreview: string | null = null;
    let tracks: Array<{ title: string; url: string }> = [];
    let newTrackTitle = '';
    let newTrackUrl = '';
    let saving = false;

    $: isVerified = $userSubscription.profile?.isVerified || false;

    onMount(() => {
        if (!$userStore.user) {
            goto('/');
            return;
        }

        if (!isVerified) {
            toast.warning('⚠️ Necesitas estar verificado para gestionar álbumes');
            goto('/artist');
            return;
        }

        // Real-time listener for artist's albums
        const albumsQuery = query(
            collection(db, 'albums'),
            where('artistId', '==', $userStore.user.uid)
        );

        unsubscribe = onSnapshot(
            albumsQuery,
            (snapshot) => {
                albums = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Album[];
                loading = false;
            },
            (error) => {
                console.error('Error loading albums:', error);
                toast.error('Error al cargar álbumes');
                loading = false;
            }
        );
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    function openCreateModal() {
        modalMode = 'create';
        editingAlbum = null;
        resetForm();
        showModal = true;
    }

    function openEditModal(album: Album) {
        modalMode = 'edit';
        editingAlbum = album;
        title = album.title;
        category = album.category || 'Lo-fi';
        coverPreview = album.cover || null;
        tracks = album.tracks ? album.tracks.map((t) => ({ title: t.title, url: t.file })) : [];
        showModal = true;
    }

    function resetForm() {
        title = '';
        category = 'Lo-fi';
        coverFile = null;
        coverPreview = null;
        tracks = [];
        newTrackTitle = '';
        newTrackUrl = '';
    }

    function handleCoverSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.warning('La portada no puede superar los 5MB');
                return;
            }
            coverFile = file;
            const reader = new FileReader();
            reader.onload = (e) => (coverPreview = e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    function addTrack() {
        if (!newTrackTitle.trim() || !newTrackUrl.trim()) {
            toast.warning('Completa título y URL del track');
            return;
        }
        tracks = [...tracks, { title: newTrackTitle.trim(), url: newTrackUrl.trim() }];
        newTrackTitle = '';
        newTrackUrl = '';
    }

    function removeTrack(index: number) {
        tracks = tracks.filter((_, i) => i !== index);
    }

    async function saveAlbum() {
        if (!$userStore.user) return;
        if (!title.trim()) {
            toast.warning('El título es obligatorio');
            return;
        }

        saving = true;

        try {
            let coverUrl = editingAlbum?.cover || '';

            // Upload cover if changed
            if (coverFile) {
                const timestamp = Date.now();
                const coverRef = ref(storage, `albums/${$userStore.user.uid}/${timestamp}_cover`);
                const snapshot = await uploadBytes(coverRef, coverFile);
                coverUrl = await getDownloadURL(snapshot.ref);
            }

            const albumData = {
                title: title.trim(),
                artist: $userStore.user.displayName || 'Unknown Artist',
                artistId: $userStore.user.uid,
                cover: coverUrl,
                category,
                tracks: tracks.map((t, idx) => ({
                    id: `track-${idx + 1}`,
                    title: t.title,
                    url: t.url,
                    duration: 0,
                })),
                releaseDate: Date.now(),
                updatedAt: Date.now(),
            };

            if (modalMode === 'create') {
                await addDoc(collection(db, 'albums'), {
                    ...albumData,
                    createdAt: serverTimestamp(),
                });
                toast.success('✅ Álbum creado');
            } else if (editingAlbum) {
                await updateDoc(doc(db, 'albums', editingAlbum.id), albumData);
                toast.success('✅ Álbum actualizado');
            }

            showModal = false;
            resetForm();
        } catch (error: any) {
            console.error('Error saving album:', error);
            toast.error('❌ Error: ' + error.message);
        } finally {
            saving = false;
        }
    }

    async function deleteAlbum(albumId: string) {
        if (!confirm('¿Estás seguro de eliminar este álbum?')) return;

        try {
            await deleteDoc(doc(db, 'albums', albumId));
            toast.success('✅ Álbum eliminado');
        } catch (error: any) {
            console.error('Error deleting album:', error);
            toast.error('❌ Error: ' + error.message);
        }
    }
</script>

<svelte:head>
    <title>Mis Álbumes | ChillChess</title>
</svelte:head>

<div
    class="min-h-screen bg-gradient-to-br from-[#0B1120] via-[#0f1729] to-[#0B1120] text-white font-poppins p-4 md:p-8"
>
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
            <div>
                <a
                    href="/artist"
                    class="text-slate-400 hover:text-white mb-2 inline-flex items-center gap-2 text-sm"
                >
                    <span>←</span> Volver al Panel
                </a>
                <h1
                    class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
                >
                    Mis Álbumes
                </h1>
                <p class="text-slate-400 text-sm mt-1">
                    Gestiona tu catálogo musical • {albums.length} álbumes
                </p>
            </div>
            <button
                on:click={openCreateModal}
                class="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 rounded-xl font-bold shadow-lg transition-all"
            >
                + Nuevo Álbum
            </button>
        </div>

        <!-- Albums Grid -->
        {#if loading}
            <div class="text-center py-20">
                <div
                    class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"
                ></div>
                <p class="mt-4 text-slate-400">Cargando álbumes...</p>
            </div>
        {:else if albums.length === 0}
            <div
                class="text-center py-20 bg-[#1a1a1a]/50 backdrop-blur-xl rounded-2xl border border-white/10"
            >
                <span class="text-6xl mb-4 block">🎵</span>
                <h3 class="text-xl font-bold mb-2">No tienes álbumes aún</h3>
                <p class="text-slate-400 mb-6">
                    Crea tu primer álbum y empieza a compartir tu música
                </p>
                <button
                    on:click={openCreateModal}
                    class="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-bold transition-colors"
                >
                    Crear Álbum
                </button>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each albums as album}
                    <div
                        class="bg-[#1a1a1a]/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-primary-500/50 transition-all group"
                    >
                        <!-- Cover -->
                        <div class="aspect-square bg-slate-800 relative overflow-hidden">
                            {#if album.cover}
                                <img
                                    src={album.cover}
                                    alt={album.title}
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                <div
                                    class="w-full h-full flex items-center justify-center text-6xl"
                                >
                                    💿
                                </div>
                            {/if}
                            <div
                                class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
                            >
                                <button
                                    on:click={() => openEditModal(album)}
                                    class="px-4 py-2 bg-white text-black rounded-lg font-bold hover:scale-105 transition-transform"
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    on:click={() => deleteAlbum(album.id)}
                                    class="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:scale-105 transition-transform"
                                >
                                    🗑️ Borrar
                                </button>
                            </div>
                        </div>
                        <!-- Info -->
                        <div class="p-4">
                            <h3 class="font-bold text-lg truncate">{album.title}</h3>
                            <p class="text-sm text-slate-400">
                                {album.category || 'Sin categoría'}
                            </p>
                            <p class="text-xs text-slate-500 mt-2">
                                {album.tracks?.length || 0} canciones
                            </p>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Modal -->
{#if showModal}
    <div
        role="dialog"
        aria-modal="true"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        on:click={() => (showModal = false)}
        on:keydown={(e) => e.key === 'Escape' && (showModal = false)}
    >
        <div
            role="document"
            class="bg-[#1a1a1a] rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            on:click|stopPropagation
            on:keydown|stopPropagation
        >
            <div
                class="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1a1a] z-10"
            >
                <h2 class="text-2xl font-bold">
                    {modalMode === 'create' ? 'Crear Álbum' : 'Editar Álbum'}
                </h2>
                <button
                    on:click={() => (showModal = false)}
                    class="text-slate-400 hover:text-white text-2xl">×</button
                >
            </div>

            <div class="p-6 space-y-6">
                <!-- Title -->
                <div>
                    <label class="block text-sm font-medium mb-2">Título del Álbum *</label>
                    <input
                        type="text"
                        bind:value={title}
                        placeholder="Ej: Midnight Lofi Vibes"
                        class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none"
                    />
                </div>

                <!-- Category -->
                <div>
                    <label class="block text-sm font-medium mb-2">Categoría</label>
                    <select
                        bind:value={category}
                        class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none"
                    >
                        <option>Lo-fi</option>
                        <option>Ambient</option>
                        <option>Chill</option>
                        <option>Jazz Hop</option>
                        <option>Study Beats</option>
                    </select>
                </div>

                <!-- Cover -->
                <div>
                    <label class="block text-sm font-medium mb-2">Portada</label>
                    <div class="flex gap-4 items-start">
                        {#if coverPreview}
                            <img
                                src={coverPreview}
                                alt="Preview"
                                class="w-32 h-32 rounded-xl object-cover"
                            />
                        {/if}
                        <label
                            class="flex-1 border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500 transition-all"
                        >
                            <span class="text-2xl block mb-2">📷</span>
                            <span class="text-sm text-slate-400"
                                >{coverFile ? coverFile.name : 'Haz clic para subir'}</span
                            >
                            <input
                                type="file"
                                accept="image/*"
                                class="hidden"
                                on:change={handleCoverSelect}
                            />
                        </label>
                    </div>
                </div>

                <!-- Tracks -->
                <div>
                    <label class="block text-sm font-medium mb-2">Canciones ({tracks.length})</label
                    >
                    <div class="space-y-2 mb-3">
                        {#each tracks as track, i}
                            <div class="flex items-center gap-2 bg-[#0B1120] p-3 rounded-lg">
                                <span class="text-slate-500 text-sm">{i + 1}.</span>
                                <div class="flex-1">
                                    <p class="font-medium text-sm">{track.title}</p>
                                    <p class="text-xs text-slate-500 truncate">{track.url}</p>
                                </div>
                                <button
                                    on:click={() => removeTrack(i)}
                                    class="text-red-400 hover:text-red-300"
                                >
                                    ✕
                                </button>
                            </div>
                        {/each}
                    </div>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            bind:value={newTrackTitle}
                            placeholder="Título de la canción"
                            class="flex-1 bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                            type="url"
                            bind:value={newTrackUrl}
                            placeholder="URL del audio"
                            class="flex-1 bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                            on:click={addTrack}
                            class="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg text-sm font-bold"
                        >
                            + Añadir
                        </button>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-3 pt-4">
                    <button
                        on:click={() => (showModal = false)}
                        class="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold"
                    >
                        Cancelar
                    </button>
                    <button
                        on:click={saveAlbum}
                        disabled={saving || !title.trim()}
                        class="flex-1 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 rounded-xl font-bold"
                    >
                        {saving
                            ? 'Guardando...'
                            : modalMode === 'create'
                              ? 'Crear Álbum'
                              : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}
