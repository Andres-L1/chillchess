<script lang="ts">
    import { onMount } from "svelte";
    import { userStore } from "$lib/auth/userStore";
    import { userSubscription } from "$lib/subscription/userSubscription";
    // @ts-ignore - SvelteKit module alias
    import { goto } from "$app/navigation";
    import {
        ALBUMS,
        type Album,
        type Track,
        type AlbumCategory,
        CATEGORY_LABELS,
        getAlbumsByCategory,
    } from "$lib/data/albums";
    import {
        playAlbum,
        audioStore,
        nextTrack,
        prevTrack,
    } from "$lib/audio/store";
    import {
        collection,
        getDocs,
        query,
        orderBy,
        limit,
        type DocumentData,
        doc,
        updateDoc,
    } from "firebase/firestore";
    import { db } from "$lib/firebase";

    let loading = true;
    let albums: Album[] = [];
    let showAddAlbum = false;
    let selectedCategory: AlbumCategory | "all" = "all";
    let activeTab: "dashboard" | "music" | "users" | "logs" = "dashboard";

    const categories: (AlbumCategory | "all")[] = [
        "all",
        "musica",
        "juegos",
        "ambiente",
    ];

    // Real Data State
    let realUsers: DocumentData[] = [];
    let usersLoading = false;

    async function fetchRealUsers() {
        if (usersLoading) return;
        usersLoading = true;
        try {
            // Fetch users (limite 100 para no explotar lectura en free tier)
            const q = query(collection(db, "users"), limit(100));
            const snapshot = await getDocs(q);
            realUsers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            systemLogs = [
                {
                    type: "success",
                    msg: `Datos sincronizados: ${realUsers.length} usuarios recuperados.`,
                    time: new Date().toLocaleTimeString("es-ES"),
                },
                ...systemLogs,
            ];
        } catch (e: any) {
            console.error(e);
            systemLogs = [
                {
                    type: "error",
                    msg: `Error de conexión DB: ${e.message}`,
                    time: new Date().toLocaleTimeString("es-ES"),
                },
                ...systemLogs,
            ];
        } finally {
            usersLoading = false;
        }
    }

    // Trigger fetch on mount or tab change
    $: if (activeTab === "users" || activeTab === "dashboard") {
        if (realUsers.length === 0) fetchRealUsers();
    }

    async function toggleUserPlan(userId: string, currentPlanIsPro: boolean) {
        if (
            !confirm(
                `¿Estás seguro de que quieres ${currentPlanIsPro ? "QUITAR" : "DAR"} permisos PRO a este usuario?`,
            )
        )
            return;

        const newStatus = currentPlanIsPro ? "free" : "pro";

        try {
            const userRef = doc(db, "users", userId);

            // Actualizamos varios campos para asegurar compatibilidad total
            await updateDoc(userRef, {
                plan: newStatus,
                tier: newStatus,
                subscriptionStatus: newStatus === "pro" ? "active" : "inactive",
                updatedByAdmin: new Date(),
            });

            systemLogs = [
                {
                    type: "success",
                    msg: `Usuario ${userId} actualizado a ${newStatus.toUpperCase()}`,
                    time: new Date().toLocaleTimeString("es-ES"),
                },
                ...systemLogs,
            ];

            // Recargar lista localmente
            realUsers = realUsers.map((u) => {
                if (u.id === userId) {
                    return {
                        ...u,
                        plan: newStatus,
                        tier: newStatus,
                        subscriptionStatus:
                            newStatus === "pro" ? "active" : "inactive",
                    };
                }
                return u;
            });
        } catch (e: any) {
            systemLogs = [
                {
                    type: "error",
                    msg: `Error actualizando usuario: ${e.message}`,
                    time: new Date().toLocaleTimeString("es-ES"),
                },
                ...systemLogs,
            ];
            alert("Error: " + e.message);
        }
    }

    // New Album Form
    let newAlbum: Partial<Album> = {
        title: "",
        artist: "",
        cover: "",
        price: "Gratis",
        tag: "Nuevo",
        description: "",
        isPremium: false,
        category: "musica", // Default category
        tracks: [],
    };

    let newTrack: Partial<Track> = {
        title: "",
        artist: "",
        file: "",
    };

    let systemLogs = [
        {
            type: "info",
            msg: "Panel de administración iniciado correctamente",
            time: new Date().toLocaleTimeString("es-ES"),
        },
        {
            type: "success",
            msg: "Conexión con servicios de ChillChess establecida",
            time: new Date().toLocaleTimeString("es-ES"),
        },
    ];

    function togglePlayPause(albumId: string) {
        const isCurrentlyPlaying =
            $audioStore.currentAlbumId === albumId && $audioStore.isPlaying;

        if (isCurrentlyPlaying) {
            // Pause
            audioStore.update((s) => ({ ...s, isPlaying: false }));
        } else {
            // Play
            playAlbum(albumId);
        }
    }

    onMount(() => {
        // Check if user is admin
        const unsubscribe = userSubscription.subscribe(($sub) => {
            if (!$sub.loading) {
                if (!$sub.profile?.isAdmin) {
                    goto("/");
                    return;
                }
                loading = false;
                loadAlbums();
            }
        });

        return unsubscribe;
    });

    function loadAlbums() {
        albums = [...ALBUMS];
    }

    $: filteredAlbums =
        selectedCategory === "all"
            ? albums
            : albums.filter((a) => a.category === selectedCategory);

    function addTrackToAlbum() {
        if (newTrack.title && newTrack.artist && newTrack.file) {
            newAlbum.tracks = [...(newAlbum.tracks || []), newTrack as Track];
            newTrack = { title: "", artist: "", file: "" };
        }
    }

    function removeTrack(index: number) {
        newAlbum.tracks = newAlbum.tracks?.filter((_, i) => i !== index) || [];
    }

    async function saveAlbum() {
        if (!newAlbum.title || !newAlbum.artist) {
            alert("Título y artista son obligatorios");
            return;
        }

        try {
            // For now, we'll just log it. In production, save to Firestore
            console.log("Saving album:", newAlbum);
            alert(
                "Álbum creado con éxito! (Por ahora solo en consola, necesitas guardarlo manualmente en albums.ts)",
            );

            // Reset form
            newAlbum = {
                title: "",
                artist: "",
                cover: "",
                price: "Gratis",
                tag: "Nuevo",
                description: "",
                isPremium: false,
                tracks: [],
            };
            showAddAlbum = false;
        } catch (error) {
            console.error("Error saving album:", error);
            alert("Error al guardar álbum");
        }
    }

    function deleteAlbum(albumId: string) {
        if (confirm("¿Estás seguro de eliminar este álbum?")) {
            albums = albums.filter((a) => a.id !== albumId);
            alert(
                "Para eliminar permanentemente, quítalo de src/lib/data/albums.ts",
            );
        }
    }
</script>

<svelte:head>
    <title>Admin Panel | ChillChess</title>
</svelte:head>

{#if loading}
    <div class="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div class="text-white text-xl">Verificando permisos...</div>
    </div>
{:else}
    <div
        class="min-h-screen bg-[#0B1120] flex text-slate-200 font-poppins overflow-hidden"
    >
        <!-- SIDEBAR NAVIGATION -->
        <aside
            class="w-20 md:w-64 bg-[#0F172A] border-r border-white/5 flex flex-col justify-between shrink-0 transition-all duration-300"
        >
            <div>
                <div class="p-6 flex items-center gap-3 mb-6">
                    <img src="/favicon.svg" alt="Logo" class="w-8 h-8" />
                    <div class="hidden md:block">
                        <h1 class="font-bold text-white text-lg leading-none">
                            ChillChess
                        </h1>
                        <span
                            class="text-[10px] text-blue-400 font-bold uppercase tracking-wider"
                            >Admin v2.0</span
                        >
                    </div>
                </div>

                <nav class="px-3 space-y-1">
                    <button
                        on:click={() => (activeTab = "dashboard")}
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all {activeTab ===
                        'dashboard'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'}"
                    >
                        <span class="text-xl">📊</span>
                        <span class="hidden md:block font-medium text-sm"
                            >Dashboard</span
                        >
                    </button>

                    <button
                        on:click={() => (activeTab = "music")}
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all {activeTab ===
                        'music'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'}"
                    >
                        <span class="text-xl">🎵</span>
                        <span class="hidden md:block font-medium text-sm"
                            >Contenido & Música</span
                        >
                    </button>

                    <button
                        on:click={() => (activeTab = "users")}
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all {activeTab ===
                        'users'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'}"
                    >
                        <span class="text-xl">👥</span>
                        <span class="hidden md:block font-medium text-sm"
                            >Usuarios</span
                        >
                    </button>

                    <button
                        on:click={() => (activeTab = "logs")}
                        class="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all {activeTab ===
                        'logs'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'}"
                    >
                        <span class="text-xl">⚠️</span>
                        <span class="hidden md:block font-medium text-sm"
                            >Logs Sistema</span
                        >
                    </button>
                </nav>
            </div>

            <div class="p-4 border-t border-white/5">
                <a
                    href="/"
                    class="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-white transition-colors text-sm"
                >
                    <span>←</span>
                    <span class="hidden md:block">Volver a la App</span>
                </a>
            </div>
        </aside>

        <!-- MAIN CONTENT AREA -->
        <main class="flex-1 overflow-y-auto h-screen relative bg-[#0B1120]">
            <!-- Top Bar -->
            <header
                class="sticky top-0 z-30 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center"
            >
                <h2 class="text-xl font-bold text-white capitalize">
                    {activeTab === "music" ? "Gestión de Contenido" : activeTab}
                </h2>
                <div class="flex items-center gap-4">
                    <div
                        class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ring-2 ring-white/10"
                    ></div>
                </div>
            </header>

            <div class="p-8 pb-32 max-w-7xl mx-auto">
                <!-- TAB: DASHBOARD -->
                {#if activeTab === "dashboard"}
                    <div class="space-y-8 animate-fade-in">
                        <!-- KPI Cards (Real Data) -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div
                                class="bg-[#1e293b]/50 p-6 rounded-2xl border border-white/5"
                            >
                                <div
                                    class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2"
                                >
                                    Biblioteca Musical
                                </div>
                                <div class="text-3xl font-bold text-white">
                                    {albums.length}
                                </div>
                                <div class="text-slate-500 text-xs mt-1">
                                    Álbumes totales
                                </div>
                            </div>
                            <div
                                class="bg-[#1e293b]/50 p-6 rounded-2xl border border-white/5"
                            >
                                <div
                                    class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2"
                                >
                                    Categorías Activas
                                </div>
                                <div class="text-3xl font-bold text-white">
                                    {categories.filter((c) => c !== "all")
                                        .length}
                                </div>
                                <div class="text-slate-500 text-xs mt-1">
                                    Música, Juegos, Ambiente...
                                </div>
                            </div>
                            <div
                                class="bg-[#1e293b]/50 p-6 rounded-2xl border border-white/5"
                            >
                                <div
                                    class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2"
                                >
                                    Usuarios Registrados
                                </div>
                                <div class="text-3xl font-bold text-white">
                                    {realUsers.length > 0
                                        ? realUsers.length
                                        : "..."}
                                </div>
                                <div class="text-slate-500 text-xs mt-1">
                                    Conectados a Firebase
                                </div>
                            </div>
                        </div>

                        <!-- Real Data Notice -->
                        <div
                            class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 flex items-start gap-4"
                        >
                            <div class="text-2xl">⚡</div>
                            <div>
                                <h3 class="font-bold text-white mb-1">
                                    Modo Online Activo
                                </h3>
                                <p class="text-slate-400 text-sm">
                                    Conexión establecida con la base de datos de
                                    producción. Gestionando datos reales.
                                </p>
                            </div>
                        </div>
                    </div>
                {/if}

                <!-- TAB: MUSIC / CONTENT (Existing CMS) -->
                {#if activeTab === "music"}
                    <div class="animate-fade-in">
                        <!-- Stats Cards (Mini) -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div
                                class="bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl p-4 border border-white/5 flex items-center justify-between"
                            >
                                <div>
                                    <div class="text-slate-400 text-xs">
                                        Total Álbumes
                                    </div>
                                    <div class="text-2xl font-bold">
                                        {albums.length}
                                    </div>
                                </div>
                                <div class="text-2xl">📚</div>
                            </div>
                            <div
                                class="bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl p-4 border border-white/5 flex items-center justify-between"
                            >
                                <div>
                                    <div class="text-slate-400 text-xs">
                                        Premium
                                    </div>
                                    <div class="text-2xl font-bold">
                                        {albums.filter((a) => a.isPremium)
                                            .length}
                                    </div>
                                </div>
                                <div class="text-2xl">💎</div>
                            </div>
                            <div
                                class="bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl p-4 border border-white/5 flex items-center justify-between"
                            >
                                <div>
                                    <div class="text-slate-400 text-xs">
                                        Gratis
                                    </div>
                                    <div class="text-2xl font-bold">
                                        {albums.filter((a) => !a.isPremium)
                                            .length}
                                    </div>
                                </div>
                                <div class="text-2xl">🎁</div>
                            </div>
                        </div>

                        <!-- Add Album Button -->
                        <div class="mb-8 flex justify-end">
                            <button
                                on:click={() => (showAddAlbum = !showAddAlbum)}
                                class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/20 flex items-center gap-2"
                            >
                                {showAddAlbum
                                    ? "✕ Cancelar"
                                    : "+ Nuevo Contenido"}
                            </button>
                        </div>

                        <!-- Add Album Form -->
                        {#if showAddAlbum}
                            <div
                                class="bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl p-8 border border-white/5 mb-12 shadow-2xl"
                            >
                                <h2 class="text-2xl font-bold mb-6">
                                    Nuevo Contenido
                                </h2>

                                <div
                                    class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                                >
                                    <div>
                                        <label
                                            for="album-title"
                                            class="block text-sm text-slate-400 mb-2"
                                            >Título *</label
                                        >
                                        <input
                                            id="album-title"
                                            type="text"
                                            bind:value={newAlbum.title}
                                            class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Nombre del álbum"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            for="album-artist"
                                            class="block text-sm text-slate-400 mb-2"
                                            >Artista *</label
                                        >
                                        <input
                                            id="album-artist"
                                            type="text"
                                            bind:value={newAlbum.artist}
                                            class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Nombre del artista"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            for="album-cover"
                                            class="block text-sm text-slate-400 mb-2"
                                            >URL Portada</label
                                        >
                                        <input
                                            id="album-cover"
                                            type="text"
                                            bind:value={newAlbum.cover}
                                            class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="/assets/images/covers/..."
                                        />
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                for="album-tag"
                                                class="block text-sm text-slate-400 mb-2"
                                                >Tag</label
                                            >
                                            <input
                                                id="album-tag"
                                                type="text"
                                                bind:value={newAlbum.tag}
                                                class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                                placeholder="tag"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                for="album-category"
                                                class="block text-sm text-slate-400 mb-2"
                                                >Categoría</label
                                            >
                                            <select
                                                id="album-category"
                                                bind:value={newAlbum.category}
                                                class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none cursor-pointer"
                                            >
                                                <option value="musica"
                                                    >🎵 Música</option
                                                >
                                                <option value="juegos"
                                                    >🎮 Juegos</option
                                                >
                                                <option value="ambiente"
                                                    >🌿 Ambiente</option
                                                >
                                            </select>
                                        </div>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label
                                            for="album-description"
                                            class="block text-sm text-slate-400 mb-2"
                                            >Descripción</label
                                        >
                                        <textarea
                                            id="album-description"
                                            bind:value={newAlbum.description}
                                            class="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                            rows="3"
                                            placeholder="Descripción del álbum"
                                        ></textarea>
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <label
                                            class="flex items-center gap-3 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                bind:checked={
                                                    newAlbum.isPremium
                                                }
                                                class="w-5 h-5 rounded border-white/10 bg-black/30 checked:bg-blue-500"
                                            />
                                            <span class="text-sm"
                                                >Contenido Premium (Solo Pro)</span
                                            >
                                        </label>
                                    </div>
                                </div>

                                <!-- Tracks Section -->
                                <div class="border-t border-white/10 pt-6">
                                    <h3 class="text-xl font-bold mb-4">
                                        Canciones / Elementos
                                    </h3>

                                    <!-- Add Track Form -->
                                    <div
                                        class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
                                    >
                                        <input
                                            type="text"
                                            bind:value={newTrack.title}
                                            class="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                            placeholder="Título"
                                        />
                                        <input
                                            type="text"
                                            bind:value={newTrack.artist}
                                            class="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                            placeholder="Subtítulo/Artista"
                                        />
                                        <div class="flex gap-2">
                                            <input
                                                type="text"
                                                bind:value={newTrack.file}
                                                class="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                                                placeholder="Ruta archivo"
                                            />
                                            <button
                                                on:click={addTrackToAlbum}
                                                class="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl text-sm font-bold transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Tracks List -->
                                    {#if newAlbum.tracks && newAlbum.tracks.length > 0}
                                        <div
                                            class="space-y-2 max-h-60 overflow-y-auto pr-2"
                                        >
                                            {#each newAlbum.tracks as track, i}
                                                <div
                                                    class="flex items-center justify-between bg-black/20 rounded-xl px-4 py-3 border border-white/5"
                                                >
                                                    <div class="flex-1">
                                                        <div
                                                            class="font-medium"
                                                        >
                                                            {track.title}
                                                        </div>
                                                        <div
                                                            class="text-xs text-slate-400"
                                                        >
                                                            {track.artist} • {track.file}
                                                        </div>
                                                    </div>
                                                    <button
                                                        on:click={() =>
                                                            removeTrack(i)}
                                                        class="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            {/each}
                                        </div>
                                    {:else}
                                        <div
                                            class="text-center text-slate-500 py-8 border border-dashed border-white/10 rounded-xl"
                                        >
                                            No hay elementos añadidos aún
                                        </div>
                                    {/if}
                                </div>

                                <div class="flex justify-end gap-4 mt-8">
                                    <button
                                        on:click={() => (showAddAlbum = false)}
                                        class="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        on:click={saveAlbum}
                                        class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        {/if}

                        <!-- Category Filters (Cleaned Up) -->
                        <div class="flex gap-2 overflow-x-auto pb-4 mb-4">
                            {#each categories as cat}
                                <button
                                    on:click={() => (selectedCategory = cat)}
                                    class="px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all uppercase text-xs tracking-wider {selectedCategory ===
                                    cat
                                        ? 'bg-white text-black'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}"
                                >
                                    {cat}
                                </button>
                            {/each}
                        </div>

                        <!-- Albums Grid -->
                        <div
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {#each filteredAlbums as album}
                                <div
                                    class="bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all group"
                                >
                                    <div
                                        class="aspect-video relative group-hover:opacity-100 transition-opacity"
                                    >
                                        <img
                                            src={album.cover}
                                            alt={album.title}
                                            class="w-full h-full object-cover"
                                        />
                                        {#if album.isPremium}
                                            <div
                                                class="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded"
                                            >
                                                PRO
                                            </div>
                                        {/if}
                                    </div>
                                    <div class="p-4">
                                        <h3
                                            class="font-bold text-lg mb-0.5 truncate"
                                        >
                                            {album.title}
                                        </h3>
                                        <p
                                            class="text-sm text-slate-400 mb-2 truncate"
                                        >
                                            {album.artist}
                                        </p>

                                        <div class="flex gap-2 mt-4">
                                            <button
                                                on:click={() =>
                                                    togglePlayPause(album.id)}
                                                class="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                {#if $audioStore.currentAlbumId === album.id && $audioStore.isPlaying}
                                                    <span>⏸ Pausar</span>
                                                {:else}
                                                    <span>▶ Previsualizar</span
                                                    >
                                                {/if}
                                            </button>
                                            <button
                                                on:click={() =>
                                                    deleteAlbum(album.id)}
                                                class="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- TAB: USERS -->
                {#if activeTab === "users"}
                    <div class="animate-fade-in">
                        <div
                            class="bg-[#1e293b]/50 rounded-2xl border border-white/5 overflow-x-auto"
                        >
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr
                                        class="bg-white/5 text-slate-400 text-xs uppercase tracking-wider"
                                    >
                                        <th class="p-4">Usuario</th>
                                        <th class="p-4">Email</th>
                                        <th class="p-4">Plan Actual</th>
                                        <th class="p-4">Últ. Login</th>
                                        <th class="p-4">Acciones</th>
                                        <th class="p-4 text-right">ID</th>
                                    </tr>
                                </thead>
                                <tbody class="text-sm divide-y divide-white/5">
                                    {#if usersLoading}
                                        <tr
                                            ><td
                                                colspan="6"
                                                class="p-8 text-center text-slate-500"
                                                >Cargando base de datos...</td
                                            ></tr
                                        >
                                    {:else if realUsers.length > 0}
                                        {#each realUsers as user}
                                            <tr
                                                class="hover:bg-white/5 transition-colors"
                                            >
                                                <td
                                                    class="p-4 flex items-center gap-3"
                                                >
                                                    <div
                                                        class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white uppercase"
                                                    >
                                                        {(user.email ||
                                                            user.id)[0] || "?"}
                                                    </div>
                                                    <span
                                                        class="font-bold text-white"
                                                        >{user.email ||
                                                            "Anónimo"}</span
                                                    >
                                                </td>
                                                <td class="p-4 text-slate-400"
                                                    >{user.email || "-"}</td
                                                >
                                                <td class="p-4">
                                                    {#if user.plan === "pro" || user.tier === "pro"}
                                                        <span
                                                            class="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs font-bold ring-1 ring-purple-500/50"
                                                            >PRO MEMBER</span
                                                        >
                                                    {:else}
                                                        <span
                                                            class="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-bold"
                                                            >FREE TIER</span
                                                        >
                                                    {/if}
                                                </td>
                                                <td
                                                    class="p-4 text-slate-500 text-xs"
                                                >
                                                    {user.lastLogin?.seconds
                                                        ? new Date(
                                                              user.lastLogin
                                                                  .seconds *
                                                                  1000,
                                                          ).toLocaleDateString()
                                                        : "N/A"}
                                                </td>
                                                <td class="p-4">
                                                    {#if user.plan === "pro" || user.tier === "pro"}
                                                        <button
                                                            on:click={() =>
                                                                toggleUserPlan(
                                                                    user.id,
                                                                    true,
                                                                )}
                                                            class="text-xs bg-red-500/10 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded transition-colors border border-red-500/20"
                                                        >
                                                            Quitar Pro
                                                        </button>
                                                    {:else}
                                                        <button
                                                            on:click={() =>
                                                                toggleUserPlan(
                                                                    user.id,
                                                                    false,
                                                                )}
                                                            class="text-xs bg-green-500/10 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded transition-colors border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                                                        >
                                                            💎 Ascender a Pro
                                                        </button>
                                                    {/if}
                                                </td>
                                                <td
                                                    class="p-4 text-right text-xs text-slate-600 font-mono truncate max-w-[100px]"
                                                    >{user.id}</td
                                                >
                                            </tr>
                                        {/each}
                                    {:else}
                                        <tr
                                            ><td
                                                colspan="6"
                                                class="p-8 text-center text-slate-500"
                                                >No se encontraron usuarios en
                                                la colección 'users'.</td
                                            ></tr
                                        >
                                    {/if}
                                </tbody>
                            </table>
                        </div>
                    </div>
                {/if}

                <!-- TAB: LOGS -->
                {#if activeTab === "logs"}
                    <div
                        class="animate-fade-in bg-black rounded-xl p-4 font-mono text-xs text-green-400 h-[600px] overflow-y-auto border border-white/10 shadow-inner"
                    >
                        <div
                            class="mb-4 text-slate-500 border-b border-white/10 pb-2 flex justify-between"
                        >
                            <span>Consola del Sistema (En Vivo)</span>
                            <span class="text-[10px] opacity-50">Conectado</span
                            >
                        </div>
                        <div class="space-y-2">
                            {#each systemLogs as log}
                                <div class="flex gap-3">
                                    <span class="text-slate-500 opacity-50"
                                        >[{log.time}]</span
                                    >
                                    <span
                                        class={log.type === "error"
                                            ? "text-red-500"
                                            : log.type === "warn"
                                              ? "text-yellow-400"
                                              : "text-green-400"}
                                    >
                                        {log.type === "info"
                                            ? "ℹ️"
                                            : log.type === "success"
                                              ? "✅"
                                              : "⚠️"}
                                        {log.msg}
                                    </span>
                                </div>
                            {/each}
                            {#if systemLogs.length < 5}
                                <div class="opacity-30 mt-4 text-center italic">
                                    Esperando nuevos eventos del sistema...
                                </div>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        </main>
    </div>
{/if}
