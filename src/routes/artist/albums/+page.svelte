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

    const GENRES = ['Lo-fi', 'Ambient', 'Chill', 'Jazz Hop', 'Study Beats'];

    // Form state
    let title = '';
    let category = 'Lo-fi';
    let customCategory = '';
    let albumCategory: 'musica' | 'juegos' | 'ambiente' = 'musica';
    let coverFile: File | null = null;
    let coverPreview: string | null = null;
    let tracks: Array<{ title: string; url: string }> = [];
    let newTrackTitle = '';
    let newTrackUrl = '';
    let newTrackFile: File | null = null;
    let uploadingTrack = false;
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

        if (GENRES.includes(album.category)) {
            category = album.category;
            customCategory = '';
        } else {
            category = 'Otra';
            customCategory = album.category;
        }

        albumCategory = (album as any).albumCategory || 'musica';
        coverPreview = album.cover || null;
        tracks = album.tracks ? album.tracks.map((t) => ({ title: t.title, url: t.file })) : [];
        showModal = true;
    }

    function resetForm() {
        title = '';
        category = 'Lo-fi';
        customCategory = '';
        albumCategory = 'musica';
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

    function handleTrackFileSelect(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validate file type
            if (!file.type.startsWith('audio/')) {
                toast.error('❌ Solo se permiten archivos de audio');
                return;
            }

            // Validate size (500MB max)
            if (file.size > 500 * 1024 * 1024) {
                toast.error('❌ El archivo no puede superar 500MB');
                return;
            }

            newTrackFile = file;
            // Clear URL if file is selected
            newTrackUrl = '';
        }
    }

    async function addTrack() {
        if (!newTrackTitle.trim()) {
            toast.warning('⚠️ El título es obligatorio');
            return;
        }

        let trackUrl = newTrackUrl.trim();

        // Upload file if selected
        if (newTrackFile) {
            try {
                uploadingTrack = true;
                const folder = `albums/${$userStore.user?.uid}`;
                trackUrl = await uploadToR2(newTrackFile, folder);
                toast.success('✅ Audio subido correctamente');
            } catch (error: any) {
                toast.error('❌ Error subiendo audio: ' + error.message);
                uploadingTrack = false;
                return;
            } finally {
                uploadingTrack = false;
            }
        }

        if (!trackUrl) {
            toast.warning('⚠️ Proporciona una URL o sube un archivo de audio');
            return;
        }

        tracks = [...tracks, { title: newTrackTitle.trim(), url: trackUrl }];
        newTrackTitle = '';
        newTrackUrl = '';
        newTrackFile = null;
    }

    function removeTrack(index: number) {
        tracks = tracks.filter((_, i) => i !== index);
    }

    function moveTrack(index: number, direction: number) {
        if (index + direction < 0 || index + direction >= tracks.length) return;
        const newTracks = [...tracks];
        const temp = newTracks[index];
        newTracks[index] = newTracks[index + direction];
        newTracks[index + direction] = temp;
        tracks = newTracks;
    }

    const PUBLIC_R2_DOMAIN = 'https://pub-e58e51867b4c44f58a32c407eb8cca7c.r2.dev';

    async function uploadToR2(file: File, folder: string) {
        if (!$userStore.user) {
            throw new Error('Usuario no autenticado');
        }

        // Sanitize filename to prevent R2/URL issues and add timestamp for uniqueness/cache-busting
        const timestamp = Date.now();
        const safeName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Get Firebase auth token
        const token = await $userStore.user.getIdToken();

        // 1. Get signed URL
        const res = await fetch('/api/r2/sign-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                fileName: safeName,
                fileType: file.type,
                fileSize: file.size,
                folder: folder,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Error del servidor' }));
            throw new Error(err.error || 'Error obteniendo URL de subida');
        }

        const { uploadUrl, key } = await res.json();

        // 2. Upload to R2
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!uploadRes.ok) {
            throw new Error('Error subiendo archivo a R2');
        }

        return `${PUBLIC_R2_DOMAIN}/${key}`;
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
            let r2CoverKey = editingAlbum?.r2CoverKey || null;

            // Upload cover if changed
            if (coverFile) {
                // Determine folder: existing albums might want to overwrite or version?
                // For simplicity and cache busting, we use a new timestamped key
                const folder = `albums/${$userStore.user.uid}`;

                // Upload to R2 and get Public URL
                coverUrl = await uploadToR2(coverFile, folder);

                // Extract Key from URL for metadata (optional but good practice)
                r2CoverKey = coverUrl.replace(`${PUBLIC_R2_DOMAIN}/`, '');
            }

            const albumData: any = {
                title: title.trim(),
                artist: $userStore.user.displayName || 'Unknown Artist',
                artistId: $userStore.user.uid,
                cover: coverUrl || null,
                category: category === 'Otra' ? customCategory.trim() : category,
                albumCategory,
                tracks: tracks.map((t, idx) => ({
                    id: `track-${idx + 1}`,
                    title: t.title,
                    artist: $userStore.user?.displayName || 'Unknown Artist', // ✅
                    url: t.url, // Legacy public URL
                    file: t.url, // Backward compatibility
                    // ✅ Extract R2 key from URL if it's R2 (with null check)
                    r2Key:
                        t.url && t.url.includes(PUBLIC_R2_DOMAIN)
                            ? t.url.replace(`${PUBLIC_R2_DOMAIN}/`, '')
                            : undefined,
                    duration: 0,
                    albumCover: r2CoverKey || coverUrl || null, // ✅
                })),
                updatedAt: Date.now(),
            };

            // Only add R2 fields if they have valid values
            if (r2CoverKey) {
                albumData.r2CoverKey = r2CoverKey;
                albumData.storageProvider = 'cloudflare_r2';
            }

            // Recursive cleaner ensuring NO undefined values exist anywhere
            function cleanFirestoreData(obj: any): any {
                if (obj === null || typeof obj !== 'object') {
                    return obj;
                }

                if (Array.isArray(obj)) {
                    return obj.map(cleanFirestoreData);
                }

                const cleaned: any = {};
                for (const key in obj) {
                    if (obj[key] !== undefined) {
                        cleaned[key] = cleanFirestoreData(obj[key]);
                    }
                }
                return cleaned;
            }

            const cleanData = cleanFirestoreData(albumData);

            if (modalMode === 'create') {
                await addDoc(collection(db, 'albums'), {
                    ...cleanData,
                    releaseDate: Date.now(),
                    createdAt: serverTimestamp(),
                });
                toast.success('✅ Álbum creado');
            } else if (editingAlbum) {
                await updateDoc(doc(db, 'albums', editingAlbum.id), cleanData);
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

<!-- Modal - Floating & Mobile-First -->
{#if showModal}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
        role="presentation"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
        on:click={() => (showModal = false)}
    >
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            class="bg-[#1a1a1a] rounded-2xl border border-white/20 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
            on:click|stopPropagation
            on:keydown={(e) => e.key === 'Escape' && (showModal = false)}
            tabindex="-1"
        >
            <div
                class="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#1a1a1a] z-10"
            >
                <h2 id="modal-title" class="text-xl sm:text-2xl font-bold">
                    {modalMode === 'create' ? 'Crear Álbum' : 'Editar Álbum'}
                </h2>
                <button
                    type="button"
                    on:click={() => (showModal = false)}
                    class="text-slate-400 hover:text-white text-2xl sm:text-3xl w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all"
                    aria-label="Cerrar">×</button
                >
            </div>

            <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <!-- Title -->
                <div>
                    <label for="album-title" class="block text-sm font-medium mb-2"
                        >Título del Álbum *</label
                    >
                    <input
                        id="album-title"
                        type="text"
                        bind:value={title}
                        placeholder="Ej: Midnight Lofi Vibes"
                        class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none text-base"
                    />
                </div>

                <!-- Category -->
                <div>
                    <label for="album-category" class="block text-sm font-medium mb-2"
                        >Categoría</label
                    >
                    <select
                        id="album-category"
                        bind:value={category}
                        class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none text-base"
                    >
                        {#each GENRES as g}
                            <option value={g}>{g}</option>
                        {/each}
                        <option value="Otra">Otra</option>
                    </select>

                    {#if category === 'Otra'}
                        <div class="mt-2 animate-fade-in-down">
                            <input
                                type="text"
                                bind:value={customCategory}
                                placeholder="Especifique el género (ej: Trap, Drill...)"
                                class="w-full bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 focus:border-primary-500 focus:outline-none text-base"
                            />
                        </div>
                    {/if}
                </div>

                <!-- Album Category (Tipo de Contenido) -->
                <div>
                    <span class="block text-sm font-medium mb-2">Tipo de Contenido</span>
                    <div class="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            on:click={() => (albumCategory = 'musica')}
                            class="p-3 rounded-xl border-2 transition-all {albumCategory ===
                            'musica'
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20'}"
                        >
                            <div class="text-2xl mb-1">🎵</div>
                            <div class="text-xs font-medium">Música</div>
                        </button>
                        <button
                            type="button"
                            on:click={() => (albumCategory = 'juegos')}
                            class="p-3 rounded-xl border-2 transition-all {albumCategory ===
                            'juegos'
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20'}"
                        >
                            <div class="text-2xl mb-1">🎮</div>
                            <div class="text-xs font-medium">Juegos</div>
                        </button>
                        <button
                            type="button"
                            on:click={() => (albumCategory = 'ambiente')}
                            class="p-3 rounded-xl border-2 transition-all {albumCategory ===
                            'ambiente'
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20'}"
                        >
                            <div class="text-2xl mb-1">🌿</div>
                            <div class="text-xs font-medium">Ambiente</div>
                        </button>
                    </div>
                </div>

                <!-- Cover -->
                <div>
                    <label for="album-cover" class="block text-sm font-medium mb-2">Portada</label>
                    <div class="flex flex-col sm:flex-row gap-4 items-start">
                        {#if coverPreview}
                            <img
                                src={coverPreview}
                                alt="Preview"
                                class="w-32 h-32 rounded-xl object-cover mx-auto sm:mx-0"
                            />
                        {/if}
                        <label
                            for="album-cover"
                            class="flex-1 w-full border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500 transition-all active:scale-95"
                        >
                            <span class="text-2xl block mb-2">📷</span>
                            <span class="text-sm text-slate-400"
                                >{coverFile ? coverFile.name : 'Haz clic para subir'}</span
                            >
                            <input
                                id="album-cover"
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
                    <label for="tracks-list" class="block text-sm font-medium mb-2"
                        >Canciones ({tracks.length})</label
                    >
                    <div id="tracks-list" class="space-y-2 mb-3">
                        {#each tracks as track, i}
                            <div
                                class="flex items-center gap-2 bg-[#0B1120] p-3 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors"
                            >
                                <!-- Reorder Controls -->
                                <div class="flex flex-col gap-1 mr-1">
                                    <button
                                        type="button"
                                        on:click={() => moveTrack(i, -1)}
                                        disabled={i === 0}
                                        class="text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500"
                                        >▲</button
                                    >
                                    <button
                                        type="button"
                                        on:click={() => moveTrack(i, 1)}
                                        disabled={i === tracks.length - 1}
                                        class="text-slate-500 hover:text-white disabled:opacity-30 disabled:hover:text-slate-500"
                                        >▼</button
                                    >
                                </div>
                                <span class="text-slate-500 text-sm shrink-0 w-6 text-center"
                                    >{i + 1}.</span
                                >

                                <div class="flex-1 min-w-0 flex flex-col gap-1">
                                    <input
                                        type="text"
                                        bind:value={track.title}
                                        class="font-medium text-sm bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary-500 focus:outline-none w-full transition-colors"
                                        placeholder="Título del track"
                                    />
                                    <input
                                        type="text"
                                        bind:value={track.url}
                                        class="text-xs text-slate-500 bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary-500 focus:outline-none w-full transition-colors"
                                        placeholder="URL del audio"
                                    />
                                </div>
                                <button
                                    type="button"
                                    on:click={() => removeTrack(i)}
                                    class="text-red-400 hover:text-red-300 w-8 h-8 flex items-center justify-center hover:bg-red-500/10 rounded transition-all shrink-0 ml-2"
                                    aria-label="Eliminar track"
                                >
                                    ✕
                                </button>
                            </div>
                        {/each}
                    </div>
                    <div class="space-y-2">
                        <!-- Title Input -->
                        <input
                            type="text"
                            bind:value={newTrackTitle}
                            placeholder="Título de la canción *"
                            class="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm"
                        />

                        <!-- File Upload or URL Input -->
                        <div class="flex flex-col sm:flex-row gap-2 items-center">
                            <!-- Option 1: Upload File -->
                            <label class="flex-1 w-full cursor-pointer">
                                <div
                                    class="bg-[#0B1120] border-2 {newTrackFile
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-dashed border-white/10'} rounded-lg px-3 py-2 text-sm h-full flex items-center justify-center hover:border-primary-500 transition-colors"
                                >
                                    {#if newTrackFile}
                                        <span class="text-primary-400 font-medium truncate"
                                            >📁 {newTrackFile.name}</span
                                        >
                                    {:else}
                                        <span class="text-slate-400"
                                            >📁 Subir archivo de audio...</span
                                        >
                                    {/if}
                                </div>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    class="hidden"
                                    on:change={handleTrackFileSelect}
                                    disabled={uploadingTrack}
                                />
                            </label>

                            <!-- Divider -->
                            <span class="text-slate-500 text-xs font-medium">o</span>

                            <!-- Option 2: Manual URL -->
                            <input
                                type="url"
                                bind:value={newTrackUrl}
                                placeholder="URL del audio"
                                disabled={!!newTrackFile || uploadingTrack}
                                class="flex-1 w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />

                            <!-- Add Button -->
                            <button
                                type="button"
                                on:click={addTrack}
                                disabled={uploadingTrack}
                                class="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold whitespace-nowrap active:scale-95 transition-transform"
                            >
                                {uploadingTrack ? '⏳ Subiendo...' : '+ Añadir'}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        type="button"
                        on:click={() => (showModal = false)}
                        class="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold active:scale-95 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        on:click={saveAlbum}
                        disabled={saving || !title.trim()}
                        class="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold active:scale-95 transition-all"
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
