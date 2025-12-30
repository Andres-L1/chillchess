<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import { db, storage } from "$lib/firebase";
    import {
        collection,
        addDoc,
        getDocs,
        deleteDoc,
        doc,
        serverTimestamp,
        query,
        orderBy,
        where,
    } from "firebase/firestore";
    import {
        ref,
        uploadBytes,
        getDownloadURL,
        deleteObject,
    } from "firebase/storage";
    import type { Album } from "$lib/data/albums";
    import { onMount, tick } from "svelte";
    import { fly } from "svelte/transition";

    // --- CREATE ALBUM STATE ---
    let showCreateAlbumForm = false;
    let isCreatingAlbum = false;
    let verifiedArtists: any[] = [];
    let selectedArtistId = "";

    let newAlbumData = {
        title: "",
        artist: "", // Name (display)
        artistId: "", // Link to profile
        category: "musica",
        coverFile: null as File | null,
        tracks: [] as File[],
    };

    // --- R2 UPLOAD HELPER ---
    async function uploadToR2(file: File, folderPath: string) {
        // 1. Get Signed URL
        const res = await fetch("/api/r2/sign-url", {
            method: "POST",
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                folder: folderPath,
            }),
        });
        if (!res.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl, key } = await res.json();

        // 2. Upload File (PUT to Signed URL)
        const upload = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
        });
        if (!upload.ok) throw new Error("Failed to upload file to R2");

        // 3. Return Public URL (Assuming R2 dev domain or configured custom domain)
        // Since we don't have the custom domain available here securely, we construct using the R2 dev domain pattern
        // known from the project context or use the key.
        // For now, we return the key prefixed with a standard domain.
        const PUBLIC_R2_DOMAIN = "https://pub-68b007968c59b47aa64fadcf.r2.dev";
        return `${PUBLIC_R2_DOMAIN}/${key}`;
    }

    // Handlers
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
            alert("Completa todos los campos (Portada y Tracks obligatorios)");
            return;
        }
        isCreatingAlbum = true;
        try {
            // Sanitized folder names for R2 structure
            const safeArtist = newAlbumData.artist.replace(
                /[^a-zA-Z0-9]/g,
                "_",
            );
            const safeAlbum = newAlbumData.title.replace(/[^a-zA-Z0-9]/g, "_");
            const folderPath = `artists/${safeArtist}/${safeAlbum}`;

            // 1. Upload Cover to R2
            const coverUrl = await uploadToR2(
                newAlbumData.coverFile,
                folderPath,
            );

            // 2. Upload Tracks loop to R2
            const uploadedTracks = [];
            for (const file of newAlbumData.tracks) {
                const trackUrl = await uploadToR2(file, folderPath);
                uploadedTracks.push({
                    title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                    artist: newAlbumData.artist,
                    file: trackUrl,
                    id: crypto.randomUUID(),
                    duration: 0, // Placeholder
                });
            }

            // 3. Save Album Doc to Firestore
            await addDoc(collection(db, "albums"), {
                title: newAlbumData.title,
                artist: newAlbumData.artist,
                category: newAlbumData.category,
                cover: coverUrl,
                tracks: uploadedTracks,
                createdAt: serverTimestamp(),
                vibeId: "custom",
                price: "Free",
                tag: "New",
                description: "Uploaded via Admin R2",
                isPremium: false,
            });

            alert("✅ Álbum creado y subido a R2 exitosamente");
            showCreateAlbumForm = false;
            // Reset fields
            newAlbumData = {
                title: "",
                artist: "",
                artistId: "",
                category: "musica",
                coverFile: null,
                tracks: [],
            };
        } catch (e: any) {
            console.error(e);
            alert("Error: " + e.message);
        } finally {
            isCreatingAlbum = false;
        }
    }

    let activeSection: "library" | "creators" = "library";

    // --- LIBRARY LOGIC ---
    let searchTerm = "";
    let playingTrack: string | null = null;
    let audio: HTMLAudioElement | null = null;
    let statusMessage = "";

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
        if (
            !confirm(
                `⚠️ ¿ELIMINAR ÁLBUM "${album.title}"?\n\nEsta acción es irreversible.`,
            )
        )
            return;

        try {
            await deleteDoc(doc(db, "albums", album.id));
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

    // --- CREATORS CATALOG LOGIC ---
    let catalogTracks: any[] = [];
    let loadingCatalog = false;

    // Upload Form
    let newTrackTitle = "";
    let newTrackArtist = "ChillChess Originals";
    let newTrackFile: File | null = null;
    let newTrackCover: File | null = null;
    let isUploading = false;
    let uploadProgress = 0;

    onMount(async () => {
        await Promise.all([loadCatalog(), loadVerifiedArtists()]);
    });

    async function loadVerifiedArtists() {
        try {
            // Fetch users who are verified OR have role='artist'
            // Since we can't do OR query on different fields easily without composite index,
            // we'll try fetching verified users first.
            // Adjust this query based on your actual schema.
            // Assuming 'isVerified' boolean field exists.
            // If not, we might need to fetch all and filter, or fetch by role.
            const q = query(
                collection(db, "users"),
                where("role", "in", ["artist", "verified", "admin"]),
            );
            // Fallback: if role isn't used, try isVerified.
            // Let's try to get a broad list.
            // If this fails (index missing), we catch and log.
            const snap = await getDocs(q);
            verifiedArtists = snap.docs.map((d) => ({
                uid: d.id,
                displayName:
                    d.data().displayName || d.data().username || "Sin Nombre",
                photoURL: d.data().photoURL,
            }));

            console.log("Artists loaded:", verifiedArtists);
        } catch (e) {
            console.warn("Could not load verified artists (check indexes):", e);
            // Fallback: Empty list, user might have to type manually if we allow it.
        }
    }

    async function loadCatalog() {
        loadingCatalog = true;
        try {
            const q = query(
                collection(db, "creatorCatalog"),
                orderBy("createdAt", "desc"),
            );
            const snap = await getDocs(q);
            catalogTracks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (e) {
            console.error("Error loading catalog:", e);
        } finally {
            loadingCatalog = false;
        }
    }

    // --- R2 UPLOAD HELPER --- (Previous implementation remains valid)
    // ... (uploadToR2 function) ...

    async function uploadToCatalog() {
        if (!newTrackTitle || !newTrackFile) {
            alert("Título y archivo de audio son obligatorios");
            return;
        }

        isUploading = true;
        uploadProgress = 10;

        try {
            const timestamp = Date.now();
            const storagePath = `catalog/${timestamp}_${newTrackFile.name}`;
            const audioRef = ref(storage, storagePath);

            // Upload Audio
            await uploadBytes(audioRef, newTrackFile);
            const audioUrl = await getDownloadURL(audioRef);
            uploadProgress = 60;

            let coverUrl = "";
            if (newTrackCover) {
                const coverPath = `catalog/covers/${timestamp}_${newTrackCover.name}`;
                const coverRef = ref(storage, coverPath);
                await uploadBytes(coverRef, newTrackCover);
                coverUrl = await getDownloadURL(coverRef);
            }
            uploadProgress = 80;

            // Save to Firestore
            await addDoc(collection(db, "creatorCatalog"), {
                title: newTrackTitle,
                artist: newTrackArtist,
                url: audioUrl,
                coverUrl: coverUrl || "/images/default-cover.jpg", // Fallback
                storagePath: storagePath, // To delete later
                createdAt: serverTimestamp(),
                duration: 0, // Placeholder
            });

            uploadProgress = 100;
            statusMessage = "✅ Pista añadida al catálogo";

            // Reset Form
            newTrackTitle = "";
            newTrackFile = null;
            newTrackCover = null;
            const fileInputs = document.querySelectorAll('input[type="file"]');
            fileInputs.forEach((input: any) => (input.value = ""));

            await loadCatalog();
            setTimeout(() => (statusMessage = ""), 3000);
        } catch (e: any) {
            console.error(e);
            alert("Error al subir: " + e.message);
        } finally {
            isUploading = false;
            uploadProgress = 0;
        }
    }

    async function deleteCatalogTrack(track: any) {
        if (!confirm(`¿Eliminar "${track.title}" del catálogo?`)) return;

        try {
            await deleteDoc(doc(db, "creatorCatalog", track.id));
            if (track.storagePath) {
                const audioRef = ref(storage, track.storagePath);
                await deleteObject(audioRef).catch(() =>
                    console.warn("Audio file not found"),
                );
            }
            // Add deletion for cover if needed, but skipping for simplicity

            catalogTracks = catalogTracks.filter((t) => t.id !== track.id);
            statusMessage = "🗑️ Pista eliminada";
        } catch (e: any) {
            alert("Error al eliminar: " + e.message);
        }
    }
</script>

<div class="animate-fade-in">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-2xl font-bold text-white mb-2">Gestión Musical</h2>
            <p class="text-slate-400">
                Gestiona la biblioteca de la app y el catálogo para creadores.
            </p>
        </div>

        <!-- Tabs Switcher -->
        <div class="flex bg-black/30 p-1 rounded-xl">
            <button
                class="px-4 py-2 rounded-lg text-sm font-bold transition-colors {activeSection ===
                'library'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'}"
                on:click={() => (activeSection = "library")}
            >
                Biblioteca App
            </button>
            <button
                class="px-4 py-2 rounded-lg text-sm font-bold transition-colors {activeSection ===
                'creators'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'}"
                on:click={() => (activeSection = "creators")}
            >
                Catálogo Streamers
            </button>
        </div>
    </div>

    <!-- Status Message -->
    {#if statusMessage}
        <div class="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl">
            {statusMessage}
        </div>
    {/if}

    {#if activeSection === "library"}
        <!-- LIBRARY VIEW (EXISTING CODE) -->
        <div
            class="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
        >
            <input
                type="text"
                bind:value={searchTerm}
                placeholder="Buscar por álbum o artista..."
                class="flex-1 w-full bg-midnight-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
            />
            <button
                on:click={() => (showCreateAlbumForm = !showCreateAlbumForm)}
                class="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
            >
                {#if showCreateAlbumForm}✕ Cancelar{:else}＋ Nuevo Álbum{/if}
            </button>
        </div>

        {#if showCreateAlbumForm}
            <!-- FLOATING MODAL OVERLAY -->
            <div
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in cursor-pointer"
                on:click|self={() => (showCreateAlbumForm = false)}
                on:keydown={(e) =>
                    e.key === "Escape" && (showCreateAlbumForm = false)}
                role="button"
                tabindex="0"
                aria-label="Cerrar modal"
            >
                <!-- CARD FLOTANTE -->
                <div
                    class="bg-midnight-900 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-3xl shadow-2xl relative overflow-y-auto max-h-[90vh]"
                >
                    <!-- Close Button -->
                    <button
                        on:click={() => (showCreateAlbumForm = false)}
                        class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>

                    <h3 class="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span class="text-3xl">💿</span> Crear Nuevo Álbum
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <!-- Left Column: Metadata -->
                        <div class="space-y-5">
                            <label class="block group">
                                <span
                                    class="block text-sm font-semibold text-slate-400 group-focus-within:text-primary-400 mb-2 transition-colors"
                                    >Título del Álbum</span
                                >
                                <input
                                    type="text"
                                    bind:value={newAlbumData.title}
                                    class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder-slate-600"
                                    placeholder="Ej. Summer Vibes"
                                />
                            </label>

                            <label class="block group">
                                <span
                                    class="block text-sm font-semibold text-slate-400 group-focus-within:text-primary-400 mb-2 transition-colors"
                                    >Artista (Seleccionar Verificado)</span
                                >
                                <div class="relative">
                                    <select
                                        bind:value={selectedArtistId}
                                        class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none appearance-none transition-all"
                                    >
                                        <option value="" disabled selected
                                            >-- Selecciona un Artista --</option
                                        >
                                        {#each verifiedArtists as artist}
                                            <option value={artist.uid}
                                                >{artist.displayName}</option
                                            >
                                        {/each}
                                    </select>
                                    <div
                                        class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500"
                                    >
                                        ▼
                                    </div>
                                </div>
                                <p class="text-xs text-slate-500 mt-2">
                                    ¿No encuentras al artista? Asegúrate de que
                                    tenga el rol 'artist' o esté 'verificado'.
                                    <button
                                        on:click={loadVerifiedArtists}
                                        class="text-primary-400 underline hover:text-primary-300 ml-1"
                                        >Recargar lista</button
                                    >
                                </p>
                            </label>

                            <label class="block group">
                                <span
                                    class="block text-sm font-semibold text-slate-400 group-focus-within:text-primary-400 mb-2 transition-colors"
                                    >Categoría</span
                                >
                                <select
                                    bind:value={newAlbumData.category}
                                    class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none"
                                >
                                    <option value="musica">Música</option>
                                    <option value="juegos"
                                        >Juegos / Focus</option
                                    >
                                    <option value="ambiente">Ambiente</option>
                                </select>
                            </label>
                        </div>

                        <!-- Right Column: Files -->
                        <div class="space-y-5">
                            <label class="block group cursor-pointer">
                                <span
                                    class="block text-sm font-semibold text-slate-400 group-hover:text-primary-400 mb-2 transition-colors"
                                    >Portada del Álbum</span
                                >
                                <div
                                    class="relative w-full aspect-video md:aspect-square bg-black/40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-4 group-hover:border-primary-500/50 transition-all overflow-hidden"
                                >
                                    {#if newAlbumData.coverFile}
                                        <div
                                            class="absolute inset-0 bg-cover bg-center"
                                            style="background-image: url({URL.createObjectURL(
                                                newAlbumData.coverFile,
                                            )});"
                                        >
                                            <div
                                                class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span
                                                    class="text-white font-bold"
                                                    >Cambiar Imagen</span
                                                >
                                            </div>
                                        </div>
                                    {:else}
                                        <span class="text-4xl mb-2 opacity-50"
                                            >🖼️</span
                                        >
                                        <span
                                            class="text-xs text-slate-500 text-center"
                                            >Click para subir imagen</span
                                        >
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
                                <span
                                    class="block text-sm font-semibold text-slate-400 mb-2"
                                    >Tracks (Selección múltiple)</span
                                >
                                <div
                                    class="bg-black/40 border border-white/10 rounded-xl p-4"
                                >
                                    <input
                                        type="file"
                                        multiple
                                        accept="audio/*"
                                        on:change={handleTracksSelect}
                                        class="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30 cursor-pointer"
                                    />

                                    {#if newAlbumData.tracks.length > 0}
                                        <div
                                            class="mt-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar"
                                        >
                                            {#each newAlbumData.tracks as file}
                                                <div
                                                    class="flex items-center gap-2 py-2 border-b border-white/5 last:border-0 text-xs text-slate-300"
                                                >
                                                    <span
                                                        class="text-primary-500"
                                                        >🎵</span
                                                    >
                                                    {file.name}
                                                </div>
                                            {/each}
                                        </div>
                                    {:else}
                                        <div
                                            class="mt-4 text-center text-xs text-slate-600 italic py-2"
                                        >
                                            Ningún track seleccionado
                                        </div>
                                    {/if}
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div
                        class="flex justify-end items-center gap-4 pt-4 border-t border-white/5"
                    >
                        <button
                            on:click={() => (showCreateAlbumForm = false)}
                            class="px-6 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            on:click={createAlbum}
                            disabled={isCreatingAlbum}
                            class="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 rounded-xl font-bold text-white shadow-lg shadow-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all w-full md:w-auto"
                        >
                            {isCreatingAlbum
                                ? "Subiendo y Procesando..."
                                : "🚀 Publicar Álbum"}
                        </button>
                    </div>
                </div>
            </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each filteredAlbums.slice(0, 50) as album (album.id)}
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group"
                >
                    <div class="flex gap-4 mb-4">
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
    {:else}
        <!-- CREATORS CATALOG VIEW (NEW) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Upload Form -->
            <div
                class="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit"
            >
                <h3
                    class="text-xl font-bold text-white mb-4 flex items-center gap-2"
                >
                    <span class="text-purple-400">📤</span> Subir Música
                </h3>

                <div class="space-y-4">
                    <label class="block">
                        <span class="block text-sm text-slate-400 mb-1"
                            >Título</span
                        >
                        <input
                            type="text"
                            bind:value={newTrackTitle}
                            placeholder="Ej. Midnight Vibes"
                            class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none"
                        />
                    </label>
                    <label class="block">
                        <span class="block text-sm text-slate-400 mb-1"
                            >Artista</span
                        >
                        <input
                            type="text"
                            bind:value={newTrackArtist}
                            class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none"
                        />
                    </label>

                    <div
                        class="bg-black/20 p-4 rounded-lg border border-white/5 border-dashed"
                    >
                        <label class="block w-full cursor-pointer">
                            <span class="block text-sm text-slate-400 mb-2"
                                >Archivo de Audio (MP3)</span
                            >
                            <input
                                type="file"
                                accept="audio/mpeg"
                                on:change={(e) =>
                                    (newTrackFile =
                                        e.currentTarget.files?.[0] || null)}
                                class="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30"
                            />
                        </label>
                    </div>

                    <div
                        class="bg-black/20 p-4 rounded-lg border border-white/5 border-dashed"
                    >
                        <label class="block w-full cursor-pointer">
                            <span class="block text-sm text-slate-400 mb-2"
                                >Portada (Opcional)</span
                            >
                            <input
                                type="file"
                                accept="image/*"
                                on:change={(e) =>
                                    (newTrackCover =
                                        e.currentTarget.files?.[0] || null)}
                                class="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-500/20 file:text-slate-400 hover:file:bg-slate-500/30"
                            />
                        </label>
                    </div>

                    <button
                        on:click={uploadToCatalog}
                        disabled={isUploading ||
                            !newTrackTitle ||
                            !newTrackFile}
                        class="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {#if isUploading}
                            <div
                                class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                            ></div>
                            Subiendo {Math.round(uploadProgress)}%...
                        {:else}
                            <span>🚀 Publicar en Catálogo</span>
                        {/if}
                    </button>
                    <p class="text-xs text-slate-500 text-center">
                        La música será pública en el catálogo de creadores de
                        inmediato.
                    </p>
                </div>
            </div>

            <!-- List -->
            <div class="lg:col-span-2">
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                    <div
                        class="p-4 border-b border-white/10 flex justify-between items-center"
                    >
                        <h3 class="font-bold text-slate-200">
                            Catálogo Actual ({catalogTracks.length})
                        </h3>
                        <button
                            on:click={loadCatalog}
                            class="text-xs text-purple-400 hover:text-purple-300"
                            >Actualizar</button
                        >
                    </div>

                    {#if loadingCatalog}
                        <div class="p-8 text-center text-slate-500">
                            Cargando...
                        </div>
                    {:else if catalogTracks.length === 0}
                        <div class="p-8 text-center text-slate-500">
                            El catálogo está vacío. Sube tu primera canción.
                        </div>
                    {:else}
                        <div class="divide-y divide-white/5">
                            {#each catalogTracks as track}
                                <div
                                    class="p-3 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                                >
                                    <div
                                        class="w-10 h-10 rounded bg-black/50 overflow-hidden flex-shrink-0"
                                    >
                                        <img
                                            src={track.coverUrl}
                                            alt={track.title}
                                            class="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                                        />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p
                                            class="font-bold text-white text-sm truncate"
                                        >
                                            {track.title}
                                        </p>
                                        <p
                                            class="text-xs text-slate-400 truncate"
                                        >
                                            {track.artist}
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button
                                            on:click={() =>
                                                togglePlay(track.url)}
                                            class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                        >
                                            {#if playingTrack === track.url}⏸{:else}▶{/if}
                                        </button>
                                        <button
                                            on:click={() =>
                                                deleteCatalogTrack(track)}
                                            class="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors"
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
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
