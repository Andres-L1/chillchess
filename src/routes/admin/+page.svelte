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
        initAudioLibrary,
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
        setDoc,
        addDoc,
        deleteDoc,
        writeBatch,
    } from "firebase/firestore";
    import { db } from "$lib/firebase";

    let loading = true;

    // Dynamic Albums from Store
    $: albums = $audioStore.availableAlbums;

    let showAddAlbum = false;
    let selectedCategory: AlbumCategory | "all" = "all";
    let activeTab: "dashboard" | "music" | "users" | "logs" = "dashboard";
    let syncingMusic = false;

    const categories: (AlbumCategory | "all")[] = [
        "all",
        "musica",
        "juegos",
        "ambiente",
    ];

    // Real Data State
    let realUsers: DocumentData[] = [];
    let usersLoading = false;

    // Edit State
    let editingAlbum: Album | null = null;

    let editingAlbumId: string | null = null;

    // --- SYNC/MIGRATION LOGIC ---
    async function syncAlbumsToFirestore() {
        if (
            !confirm(
                "Esto sobrescribirá la colección 'albums' en Firestore con los datos locales (ALBUMS). ¿Continuar?",
            )
        )
            return;

        syncingMusic = true;
        try {
            const batch = writeBatch(db);

            for (const album of ALBUMS) {
                const albumRef = doc(db, "albums", album.id);
                // Clean undefineds if any, Firestore doesn't like them
                const data = JSON.parse(JSON.stringify(album));
                batch.set(albumRef, data, { merge: true });
            }

            await batch.commit();

            // Reload library
            await initAudioLibrary();

            systemLogs = [
                {
                    type: "success",
                    msg: `Migración exitosa: ${ALBUMS.length} álbumes sincronizados a Firestore.`,
                    time: new Date().toLocaleTimeString("es-ES"),
                },
                ...systemLogs,
            ];
            alert(
                `Sincronizados ${ALBUMS.length} álbumes a Firestore correctamente.`,
            );
        } catch (e: any) {
            console.error(e);
            systemLogs = [
                {
                    type: "error",
                    msg: `Error migrando música: ${e.message}`,
                    time: new Date().toLocaleTimeString("es-ES"),
                },
                ...systemLogs,
            ];
            alert("Error al sincronizar música: " + e.message);
        } finally {
            syncingMusic = false;
        }
    }
    // ---------------------------

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

    // Trigger fetch on tab change
    $: if (activeTab === "users" || activeTab === "dashboard") {
        if (realUsers.length === 0) fetchRealUsers();
    }

    async function toggleUserPlan(userId: string, currentPlanIsPro: boolean) {
        const action = currentPlanIsPro ? "QUITAR" : "DAR";
        const user = realUsers.find((u) => u.id === userId);
        const userName = user?.displayName || user?.email || "este usuario";

        if (
            !confirm(
                `¿Estás seguro de que quieres ${action} permisos PRO a ${userName}?`,
            )
        ) {
            return;
        }

        const newStatus = currentPlanIsPro ? "free" : "pro";

        try {
            const userRef = doc(db, "users", userId);

            await updateDoc(userRef, {
                subscriptionTier: newStatus,
                subscriptionStatus: newStatus === "pro" ? "active" : "inactive",
                updatedByAdmin: new Date().toISOString(),
            });

            // Forzar actualización reactiva creando nuevo array
            realUsers = realUsers.map((u) => {
                if (u.id === userId) {
                    return {
                        ...u,
                        subscriptionTier: newStatus,
                        subscriptionStatus:
                            newStatus === "pro" ? "active" : "inactive",
                    };
                }
                return u;
            });

            systemLogs = [
                {
                    type: "success",
                    msg: `✅ ${userName} actualizado a ${newStatus.toUpperCase()}`,
                    time: new Date().toLocaleTimeString("es-ES"),
                },
                ...systemLogs,
            ];

            alert(
                `✅ Usuario actualizado a ${newStatus.toUpperCase()} correctamente`,
            );
        } catch (e: any) {
            systemLogs = [
                {
                    type: "error",
                    msg: `❌ Error actualizando usuario: ${e.message}`,
                    time: new Date().toLocaleTimeString("es-ES"),
                },
                ...systemLogs,
            ];
            alert(`❌ Error: ${e.message}`);
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
                // Init library if not already
                if ($audioStore.availableAlbums.length === 0) {
                    initAudioLibrary();
                }
            }
        });

        return unsubscribe;
    });

    $: filteredAlbums =
        selectedCategory === "all"
            ? albums
            : albums.filter((a) => a.category === selectedCategory);

    function addTrackToAlbum() {
        if (newTrack.title && newTrack.artist && newTrack.file) {
            newAlbum.tracks = [
                ...(newAlbum.tracks || []),
                { ...newTrack, id: crypto.randomUUID() } as Track,
            ];
            newTrack = { title: "", artist: "", file: "" };
        }
    }

    function removeTrack(index: number) {
        newAlbum.tracks = newAlbum.tracks?.filter((_, i) => i !== index) || [];
    }

    function editAlbum(album: Album) {
        editingAlbumId = album.id;
        newAlbum = JSON.parse(JSON.stringify(album)); // Deep copy
        showAddAlbum = true;
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function resetForm() {
        newAlbum = {
            title: "",
            artist: "",
            cover: "",
            price: "Gratis",
            tag: "Nuevo",
            description: "",
            isPremium: false,
            category: "musica",
            tracks: [],
        };
        editingAlbumId = null;
        showAddAlbum = false;
    }

    async function saveAlbum() {
        if (!newAlbum.title || !newAlbum.artist) {
            alert("Título y artista son obligatorios");
            return;
        }

        try {
            // Clean logic
            const albumData = { ...newAlbum };
            if (!albumData.id && !editingAlbumId) {
                // Generate a slug-like ID if new
                albumData.id =
                    albumData.title?.toLowerCase().replace(/\s+/g, "-") +
                    "-" +
                    Math.floor(Math.random() * 1000);
            }

            if (editingAlbumId) {
                // UPDATE
                await updateDoc(doc(db, "albums", editingAlbumId), albumData);
                systemLogs = [
                    {
                        type: "success",
                        msg: `Álbum editado: ${albumData.title}`,
                        time: new Date().toLocaleTimeString(),
                    },
                    ...systemLogs,
                ];
            } else {
                // CREATE
                // We use setDoc with a custom ID or addDoc with auto ID.
                // Since we manually set ID for consistency in ALBUMS static data so far, let's keep manual IDs if possible, or use the generated one.
                await setDoc(doc(db, "albums", albumData.id!), albumData);
                systemLogs = [
                    {
                        type: "success",
                        msg: `Álbum creado: ${albumData.title}`,
                        time: new Date().toLocaleTimeString(),
                    },
                    ...systemLogs,
                ];
            }

            // Refresh Library store
            await initAudioLibrary();

            resetForm();
            alert("Guardado correctamente en Firestore.");
        } catch (error: any) {
            console.error("Error saving album:", error);
            alert("Error al guardar álbum: " + error.message);
        }
    }

    async function deleteAlbum(albumId: string) {
        if (
            !confirm(
                "¿Estás seguro de eliminar este álbum de la base de datos? IRREVERSIBLE.",
            )
        )
            return;

        try {
            await deleteDoc(doc(db, "albums", albumId));
            await initAudioLibrary(); // Refresh
            alert("Eliminado.");
        } catch (e: any) {
            alert("Error al eliminar: " + e.message);
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
                    <img
                        src="/logo-desktop.png"
                        alt="Logo"
                        class="h-8 w-auto"
                        style="mix-blend-mode: screen; filter: brightness(1.2);"
                    />
                    <div class="hidden md:block">
                        <h1 class="font-bold text-white text-lg leading-none">
                            Admin Panel
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
        <main
            class="flex-1 overflow-y-auto h-screen relative bg-[#0B1120] pb-20"
        >
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
                        <!-- KPI Cards (Real Data from Store) -->
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
                                    Álbumes activos
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

                <!-- AI Studio Tab -->

                <!-- TAB: USERS - Simple Version -->
                {#if activeTab === "users"}
                    <div class="animate-fade-in space-y-4">
                        <!-- Header -->
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-bold text-white">
                                Usuarios ({realUsers.length})
                            </h2>
                            <button
                                on:click={fetchRealUsers}
                                disabled={usersLoading}
                                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                            >
                                {usersLoading
                                    ? "⏳ Cargando..."
                                    : "🔄 Refrescar"}
                            </button>
                        </div>

                        <!-- Table Container -->
                        <div
                            class="bg-[#1e293b]/50 rounded-2xl border border-white/5 overflow-hidden"
                        >
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <!-- Header -->
                                    <thead class="bg-white/5">
                                        <tr class="text-left">
                                            <th
                                                class="px-6 py-4 text-xs font-bold text-slate-400 uppercase"
                                                >Usuario</th
                                            >
                                            <th
                                                class="px-6 py-4 text-xs font-bold text-slate-400 uppercase"
                                                >Email</th
                                            >
                                            <th
                                                class="px-6 py-4 text-xs font-bold text-slate-400 uppercase"
                                                >Plan</th
                                            >
                                            <th
                                                class="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center"
                                                >Acción</th
                                            >
                                        </tr>
                                    </thead>

                                    <!-- Body -->
                                    <tbody class="divide-y divide-white/5">
                                        {#if usersLoading}
                                            <!-- Loading State -->
                                            <tr>
                                                <td
                                                    colspan="4"
                                                    class="px-6 py-12 text-center"
                                                >
                                                    <div
                                                        class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white mb-2"
                                                    ></div>
                                                    <p class="text-slate-400">
                                                        Cargando usuarios...
                                                    </p>
                                                </td>
                                            </tr>
                                        {:else if realUsers.length === 0}
                                            <!-- Empty State -->
                                            <tr>
                                                <td
                                                    colspan="4"
                                                    class="px-6 py-12 text-center text-slate-400"
                                                >
                                                    No hay usuarios registrados
                                                </td>
                                            </tr>
                                        {:else}
                                            <!-- Users List -->
                                            {#each realUsers as user}
                                                {@const isPro =
                                                    user.subscriptionTier ===
                                                        "pro" ||
                                                    user.subscriptionTier ===
                                                        "premium"}
                                                <tr
                                                    class="hover:bg-white/5 transition-colors"
                                                >
                                                    <!-- Usuario: Avatar + Name -->
                                                    <td class="px-6 py-4">
                                                        <div
                                                            class="flex items-center gap-3"
                                                        >
                                                            <div
                                                                class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0"
                                                            >
                                                                {(user.displayName ||
                                                                    user.email ||
                                                                    "U")[0].toUpperCase()}
                                                            </div>
                                                            <span
                                                                class="text-white font-medium"
                                                            >
                                                                {user.displayName ||
                                                                    "Sin nombre"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <!-- Email -->
                                                    <td class="px-6 py-4">
                                                        <span
                                                            class="text-slate-300 text-sm"
                                                        >
                                                            {user.email ||
                                                                "No especificado"}
                                                        </span>
                                                    </td>

                                                    <!-- Plan Badge -->
                                                    <td class="px-6 py-4">
                                                        {#if isPro}
                                                            <span
                                                                class="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold text-white"
                                                            >
                                                                ✨ PRO
                                                            </span>
                                                        {:else}
                                                            <span
                                                                class="inline-flex items-center px-3 py-1 bg-slate-700 rounded-full text-xs font-medium text-slate-300"
                                                            >
                                                                GRATUITO
                                                            </span>
                                                        {/if}
                                                    </td>

                                                    <!-- Action Button -->
                                                    <td
                                                        class="px-6 py-4 text-center"
                                                    >
                                                        <button
                                                            on:click={() =>
                                                                toggleUserPlan(
                                                                    user.id,
                                                                    isPro,
                                                                )}
                                                            class="px-4 py-2 rounded-lg font-medium text-xs transition-all {isPro
                                                                ? 'bg-red-600 hover:bg-red-500 text-white'
                                                                : 'bg-green-600 hover:bg-green-500 text-white'}"
                                                        >
                                                            {isPro
                                                                ? "❌ Quitar Pro"
                                                                : "✅ Dar Pro"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            {/each}
                                        {/if}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                {/if}

                <!-- TAB: MUSIC / CONTENT (Existing CMS + SYNC) -->
                {#if activeTab === "music"}
                    <div class="animate-fade-in">
                        <!-- Migration / Sync Action Banner -->
                        {#if albums.length === 0}
                            <div
                                class="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-2xl p-6 mb-8 flex justify-between items-center"
                            >
                                <div>
                                    <h3
                                        class="text-[#F59E0B] font-bold text-lg"
                                    >
                                        Inicializar Base de Datos
                                    </h3>
                                    <p class="text-slate-400 text-sm">
                                        Parece que la librería está vacía. Usa
                                        esta herramienta para sincronizar los
                                        álbumes por defecto (`albums.ts`) hacia
                                        Firestore.
                                    </p>
                                </div>
                                <button
                                    on:click={syncAlbumsToFirestore}
                                    disabled={syncingMusic}
                                    class="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {syncingMusic
                                        ? "Sincronizando..."
                                        : "Sincronizar a Firestore"}
                                </button>
                            </div>
                        {/if}

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
                            <!-- ... other stats ... -->
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
                        </div>

                        <!-- Add Album Button -->
                        <div class="mb-8 flex justify-end">
                            <button
                                on:click={() => {
                                    resetForm();
                                    showAddAlbum = true;
                                }}
                                class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/20 flex items-center gap-2"
                            >
                                {showAddAlbum
                                    ? "✕ Cancelar"
                                    : "+ Nuevo Contenido"}
                            </button>
                        </div>

                        <!-- Add/Edit Album Modal -->
                        {#if showAddAlbum}
                            <div
                                class="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
                            >
                                <!-- Backdrop -->
                                <button
                                    class="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-default"
                                    on:click={resetForm}
                                    aria-label="Cerrar modal"
                                ></button>

                                <!-- Modal Content -->
                                <div
                                    class="relative bg-[#1e293b] rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 z-10"
                                >
                                    <button
                                        on:click={resetForm}
                                        class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                                    >
                                        ✕
                                    </button>

                                    {#if editingAlbumId}
                                        <div
                                            class="text-xs font-mono text-purple-400 mb-2"
                                        >
                                            EDITANDO: {editingAlbumId}
                                        </div>
                                    {/if}
                                    <h2
                                        class="text-2xl font-bold mb-6 text-white"
                                    >
                                        {editingAlbumId
                                            ? "Editar Contenido"
                                            : "Nuevo Contenido"}
                                    </h2>

                                    <div
                                        class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                                    >
                                        <!-- Inputs (Same logic, slightly tighter styles) -->
                                        <div>
                                            <label
                                                for="album-title"
                                                class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                                                >Título *</label
                                            >
                                            <input
                                                id="album-title"
                                                type="text"
                                                bind:value={newAlbum.title}
                                                class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                                placeholder="Ej. Lo-Fi Dreams"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                for="album-artist"
                                                class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                                                >Artista *</label
                                            >
                                            <input
                                                id="album-artist"
                                                type="text"
                                                bind:value={newAlbum.artist}
                                                class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                                placeholder="Ej. ChillChess Originals"
                                            />
                                        </div>
                                        <div class="md:col-span-2">
                                            <label
                                                for="album-cover"
                                                class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                                                >URL Portada</label
                                            >
                                            <div class="flex gap-4">
                                                <input
                                                    id="album-cover"
                                                    type="text"
                                                    bind:value={newAlbum.cover}
                                                    class="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                                    placeholder="/assets/images/..."
                                                />
                                                {#if newAlbum.cover}
                                                    <img
                                                        src={newAlbum.cover}
                                                        alt="Preview"
                                                        class="w-12 h-12 rounded-lg object-cover border border-white/10"
                                                    />
                                                {/if}
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                for="album-tag"
                                                class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                                                >Etiqueta (Tag)</label
                                            >
                                            <input
                                                id="album-tag"
                                                type="text"
                                                bind:value={newAlbum.tag}
                                                class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                                placeholder="Ej. Nuevo"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                for="album-category"
                                                class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                                                >Categoría</label
                                            >
                                            <select
                                                id="album-category"
                                                bind:value={newAlbum.category}
                                                class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none cursor-pointer appearance-none"
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

                                        <div class="md:col-span-2">
                                            <label
                                                for="album-description"
                                                class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                                                >Descripción</label
                                            >
                                            <textarea
                                                id="album-description"
                                                bind:value={
                                                    newAlbum.description
                                                }
                                                class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                                rows="2"
                                                placeholder="Breve descripción del álbum..."
                                            ></textarea>
                                        </div>
                                        <div class="flex items-center gap-4">
                                            <label
                                                class="flex items-center gap-3 cursor-pointer select-none"
                                            >
                                                <div class="relative">
                                                    <input
                                                        type="checkbox"
                                                        bind:checked={
                                                            newAlbum.isPremium
                                                        }
                                                        class="sr-only peer"
                                                    />
                                                    <div
                                                        class="w-10 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                                                    ></div>
                                                </div>
                                                <span
                                                    class="text-sm font-bold {newAlbum.isPremium
                                                        ? 'text-blue-400'
                                                        : 'text-slate-400'}"
                                                    >Pro Member Only</span
                                                >
                                            </label>
                                        </div>
                                    </div>

                                    <!-- Tracks Section -->
                                    <div
                                        class="border-t border-white/10 pt-6 bg-black/20 -mx-8 px-8 pb-4"
                                    >
                                        <h3
                                            class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4"
                                        >
                                            Lista de Reproducción ({newAlbum
                                                .tracks?.length || 0})
                                        </h3>

                                        <!-- Add Track Mini Form -->
                                        <div
                                            class="flex flex-col md:flex-row gap-2 mb-4 bg-white/5 p-3 rounded-xl border border-white/5"
                                        >
                                            <input
                                                type="text"
                                                bind:value={newTrack.title}
                                                class="flex-1 bg-transparent border-b border-white/20 px-2 py-1 text-white text-sm focus:border-blue-500 focus:outline-none"
                                                placeholder="Nombre canción"
                                            />
                                            <input
                                                type="text"
                                                bind:value={newTrack.artist}
                                                class="flex-1 bg-transparent border-b border-white/20 px-2 py-1 text-white text-sm focus:border-blue-500 focus:outline-none"
                                                placeholder="Artista (Opcional)"
                                            />
                                            <input
                                                type="text"
                                                bind:value={newTrack.file}
                                                class="flex-1 bg-transparent border-b border-white/20 px-2 py-1 text-white text-sm focus:border-blue-500 focus:outline-none"
                                                placeholder="URL Archivo (.mp3)"
                                                on:keydown={(e) =>
                                                    e.key === "Enter" &&
                                                    addTrackToAlbum()}
                                            />
                                            <button
                                                on:click={addTrackToAlbum}
                                                class="px-4 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-bold transition-colors uppercase"
                                            >
                                                + Añadir
                                            </button>
                                        </div>

                                        <!-- Tracks List -->
                                        {#if newAlbum.tracks && newAlbum.tracks.length > 0}
                                            <div
                                                class="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar"
                                            >
                                                {#each newAlbum.tracks as track, i}
                                                    <div
                                                        class="flex items-center gap-3 bg-black/20 hover:bg-white/5 rounded-lg px-3 py-2 border border-white/5 transition-colors group"
                                                    >
                                                        <span
                                                            class="text-xs text-slate-500 font-mono w-4"
                                                            >{i + 1}</span
                                                        >
                                                        <div
                                                            class="flex-1 min-w-0"
                                                        >
                                                            <div
                                                                class="flex items-baseline gap-2"
                                                            >
                                                                <span
                                                                    class="font-medium text-sm text-slate-200 truncate"
                                                                    >{track.title}</span
                                                                >
                                                                {#if track.artist}
                                                                    <span
                                                                        class="text-xs text-slate-500 truncate"
                                                                        >- {track.artist}</span
                                                                    >
                                                                {/if}
                                                            </div>
                                                            <div
                                                                class="text-[10px] text-slate-600 truncate font-mono"
                                                            >
                                                                {track.file}
                                                            </div>
                                                        </div>
                                                        <button
                                                            on:click={() =>
                                                                removeTrack(i)}
                                                            class="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                {/each}
                                            </div>
                                        {:else}
                                            <div
                                                class="text-center text-slate-600 text-xs py-4 italic"
                                            >
                                                Añade canciones arriba para
                                                crear la lista.
                                            </div>
                                        {/if}
                                    </div>

                                    <div
                                        class="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10"
                                    >
                                        <button
                                            on:click={resetForm}
                                            class="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors text-sm"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            on:click={saveAlbum}
                                            class="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-white shadow-lg shadow-blue-900/20 transform active:scale-95 transition-all text-sm"
                                        >
                                            {editingAlbumId
                                                ? "Guardar Cambios"
                                                : "Publicar Contenido"}
                                        </button>
                                    </div>
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
                                    class="bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all group relative"
                                >
                                    <!-- Edit Button (Always visible for admin) -->
                                    <button
                                        on:click={() => editAlbum(album)}
                                        class="absolute top-2 right-2 z-20 bg-black/50 hover:bg-black/90 p-2 rounded-lg backdrop-blur text-white text-xs font-bold transition-colors"
                                    >
                                        ✏️ Editar
                                    </button>

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
                                                class="absolute bottom-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg"
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
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <!-- TAB: LOGS -->
                {#if activeTab === "logs"}
                    <div class="animate-fade-in">
                        <div
                            class="bg-[#1e293b]/50 rounded-2xl border border-white/5 p-6 font-mono text-sm max-h-[600px] overflow-y-auto"
                        >
                            {#each systemLogs as log}
                                <div
                                    class="mb-2 border-l-2 pl-3 py-1"
                                    class:border-green-500={log.type ===
                                        "success"}
                                    class:border-red-500={log.type === "error"}
                                    class:border-blue-500={log.type === "info"}
                                >
                                    <span class="text-slate-500 text-xs mr-2"
                                        >[{log.time}]</span
                                    >
                                    <span class="text-slate-300">{log.msg}</span
                                    >
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        </main>
    </div>
{/if}
