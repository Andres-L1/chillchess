<script lang="ts">
    import {
        ALBUMS,
        type Album,
        type AlbumCategory,
        CATEGORY_LABELS,
    } from "$lib/data/albums";
    import {
        playAlbum,
        audioStore,
        nextTrack,
        prevTrack,
    } from "$lib/audio/store";
    import {
        favoritesStore,
        toggleFavorite,
        isFavorite,
    } from "$lib/data/favorites";
    import VerifiedBadge from "$lib/components/VerifiedBadge.svelte";
    import MusicIcon from "$lib/components/icons/MusicIcon.svelte";
    import GameIcon from "$lib/components/icons/GameIcon.svelte";
    import LeafIcon from "$lib/components/icons/LeafIcon.svelte";
    import SearchIcon from "$lib/components/icons/SearchIcon.svelte";
    import { fade, fly } from "svelte/transition";

    const categoryLabelMap = CATEGORY_LABELS.reduce(
        (acc, curr) => {
            acc[curr.id] = curr.label;
            return acc;
        },
        {} as Record<string, string>,
    );

    let selectedCategory: AlbumCategory | "all" = "all";
    let selectedAlbum: Album | null = null;
    let searchQuery = "";

    // Derived filtered albums
    // Derived filtered albums (Deep Search)
    $: sourceAlbums =
        $audioStore.availableAlbums.length > 0
            ? $audioStore.availableAlbums
            : ALBUMS;

    $: filteredAlbums = sourceAlbums.filter((a) => {
        const matchesCategory =
            selectedCategory === "all" || a.category === selectedCategory;

        if (searchQuery === "") return matchesCategory;

        const lowQuery = searchQuery.toLowerCase();

        // 1. Match Album Title or Artist
        const matchesAlbumInfo =
            a.title.toLowerCase().includes(lowQuery) ||
            a.artist.toLowerCase().includes(lowQuery);

        // 2. Deep Match: Check into tracks
        const matchesTracks = a.tracks?.some(
            (t) =>
                t.title.toLowerCase().includes(lowQuery) ||
                t.artist.toLowerCase().includes(lowQuery),
        );

        return matchesCategory && (matchesAlbumInfo || matchesTracks);
    });

    // Featured album (randomized or specific)
    $: featuredAlbum = ALBUMS[0]; // For now, the first one

    function togglePlayPause(albumId: string) {
        const isCurrentlyPlaying =
            $audioStore.currentAlbumId === albumId && $audioStore.isPlaying;

        if (isCurrentlyPlaying) {
            audioStore.update((s) => ({ ...s, isPlaying: false }));
        } else {
            playAlbum(albumId);
        }
    }

    function showAlbumDetails(album: Album) {
        selectedAlbum = album;
    }

    function closeAlbumDetails() {
        selectedAlbum = null;
    }

    function toggleTrackPlay(album: Album, index: number) {
        const isCurrentAlbum = $audioStore.currentAlbumId === album.id;
        const isCurrentTrack =
            isCurrentAlbum && $audioStore.currentTrackIndex === index;

        if (isCurrentTrack && $audioStore.isPlaying) {
            audioStore.update((s) => ({ ...s, isPlaying: false }));
        } else {
            if (!isCurrentAlbum) {
                playAlbum(album.id);
            }
            audioStore.update((s) => ({
                ...s,
                currentTrackIndex: index,
                isPlaying: true,
            }));
        }
    }
</script>

<svelte:head>
    <title>Colección Premium | ChillChess</title>
</svelte:head>

<div
    class="min-h-screen bg-[#0B1120] text-white pb-32 font-poppins selection:bg-primary-500/30"
>
    <!-- Hero Section -->
    <div
        class="relative h-[50vh] min-h-[500px] w-full overflow-hidden flex items-end"
    >
        <!-- Animated Background Gradient -->
        <div
            class="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#1a1a2e] to-[#0B1120]"
        ></div>

        <!-- Album Art Blur Backdrop -->
        {#if featuredAlbum}
            <div
                class="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-110 transition-all duration-1000 transform"
                style="background-image: url({featuredAlbum.cover});"
            ></div>
            <div
                class="absolute inset-0 bg-gradient-to-b from-[#0B1120]/20 via-[#0B1120]/60 to-[#0B1120] z-0"
            ></div>
        {/if}

        <!-- Hero Content -->
        <div
            class="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-end gap-8"
        >
            <div class="flex-1 space-y-4">
                <div
                    class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md"
                >
                    <span>✨</span> Colección Oficial
                </div>
                <h1 class="text-5xl md:text-7xl font-bold leading-tight">
                    Explora tu <br />
                    <span
                        class="bg-gradient-to-r from-primary-400 via-primary-500 to-orange-400 bg-clip-text text-transparent drop-shadow-sm"
                        >Atmósfera</span
                    >
                </h1>
                <p
                    class="text-slate-300 text-lg md:text-xl max-w-2xl font-light"
                >
                    Una selección curada de paisajes sonoros para concentración,
                    relajación y gaming de alto rendimiento.
                </p>

                <!-- Search Bar -->
                <div class="relative max-w-lg mt-8 group">
                    <div
                        class="absolute inset-0 bg-primary-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    ></div>
                    <div
                        class="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/10 transition-all focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500"
                    >
                        <div class="pl-4 text-slate-400">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            bind:value={searchQuery}
                            placeholder="Buscar artistas, álbumes o vibes..."
                            class="w-full bg-transparent border-none text-white py-4 px-4 focus:ring-0 placeholder-slate-400 font-medium"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Grid Section -->
    <div class="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <!-- Filters Toolbar -->
        <div
            class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 sticky top-4 z-20 py-4 bg-[#0B1120]/80 backdrop-blur-xl rounded-2xl md:bg-transparent md:backdrop-filter-none md:static"
        >
            <!-- Type Tabs -->
            <div
                class="flex items-center p-1 bg-white/5 rounded-xl border border-white/5"
            >
                <button
                    class="px-6 py-2 rounded-lg bg-white/10 text-white shadow-sm font-bold text-sm transition-all"
                >
                    📀 Álbumes
                </button>
                <a
                    href="/artists"
                    class="px-6 py-2 rounded-lg text-slate-400 hover:text-white font-medium text-sm transition-all hover:bg-white/5"
                >
                    🎤 Artistas
                </a>
            </div>

            <!-- Categories -->
            <div
                class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar mask-gradient-r"
            >
                <button
                    on:click={() => (selectedCategory = "all")}
                    class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all {selectedCategory ===
                    'all'
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}"
                >
                    Todas
                </button>
                <button
                    on:click={() => (selectedCategory = "musica")}
                    class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 {selectedCategory ===
                    'musica'
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}"
                >
                    <span>🎵</span> Música
                </button>
                <button
                    on:click={() => (selectedCategory = "juegos")}
                    class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 {selectedCategory ===
                    'juegos'
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}"
                >
                    <span>🎮</span> Juegos
                </button>
                <button
                    on:click={() => (selectedCategory = "ambiente")}
                    class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 {selectedCategory ===
                    'ambiente'
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'}"
                >
                    <span>🌿</span> Ambiente
                </button>
            </div>
        </div>

        <!-- Albums Grid -->
        {#if filteredAlbums.length > 0}
            <div
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
                {#each filteredAlbums as album (album.id)}
                    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                    <div
                        in:fade={{ duration: 300 }}
                        on:click={() => showAlbumDetails(album)}
                        class="group relative bg-[#181825] rounded-2xl overflow-hidden hover:bg-[#232336] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 cursor-pointer border border-white/5"
                    >
                        <!-- Cover Wrapper -->
                        <div
                            class="aspect-square w-full relative overflow-hidden"
                        >
                            <img
                                src={album.cover}
                                alt={album.title}
                                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            <!-- Badges -->
                            <div
                                class="absolute top-2 left-2 flex flex-col gap-1 items-start"
                            >
                                {#if album.isPremium}
                                    <span
                                        class="px-2 py-0.5 rounded-md bg-orange-500/90 backdrop-blur-sm text-black text-[10px] font-black uppercase shadow-lg"
                                        >PRO</span
                                    >
                                {/if}
                            </div>

                            <!-- Play Overlay -->
                            <div
                                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]"
                            >
                                <button
                                    class="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary-500/40 transform scale-50 group-hover:scale-100 transition-transform duration-300 hover:scale-110 hover:bg-primary-400"
                                >
                                    <svg
                                        class="w-5 h-5 ml-1"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path d="M8 5v14l11-7z" /></svg
                                    >
                                </button>
                            </div>
                        </div>

                        <!-- Content -->
                        <div class="p-4">
                            <h3
                                class="font-bold text-white text-base truncate mb-1"
                                title={album.title}
                            >
                                {album.title}
                            </h3>
                            <div
                                class="flex items-center gap-1.5 text-sm text-slate-400"
                            >
                                <span class="truncate max-w-[120px]"
                                    >{album.artist}</span
                                >
                                {#if album.artist === "JULYACTV" || album.isVerified}
                                    <VerifiedBadge
                                        size="sm"
                                        showTooltip={false}
                                    />
                                {/if}
                            </div>
                            <div
                                class="flex items-center justify-between mt-3 text-xs text-slate-500 font-medium"
                            >
                                <span
                                    >{album.category.charAt(0).toUpperCase() +
                                        album.category.slice(1)}</span
                                >
                                <span
                                    class="bg-white/5 px-2 py-1 rounded text-slate-400"
                                    >{album.tracks?.length || 0} tracks</span
                                >
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div
                class="flex flex-col items-center justify-center py-20 text-center animate-fade-in"
            >
                <div class="text-6xl mb-4 opacity-50">🪐</div>
                <h3 class="text-2xl font-bold text-white mb-2">
                    Nada por aquí...
                </h3>
                <p class="text-slate-400 max-w-md">
                    No encontramos resultados para tu búsqueda. Intenta con otro
                    término o explora otras categorías.
                </p>
                <button
                    on:click={() => {
                        searchQuery = "";
                        selectedCategory = "all";
                    }}
                    class="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
                >
                    Limpiar filtros
                </button>
            </div>
        {/if}
    </div>
</div>

<!-- Modal View -->
{#if selectedAlbum}
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
            class="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            role="button"
            tabindex="0"
            on:click={closeAlbumDetails}
            on:keydown={(e) => e.key === "Escape" && closeAlbumDetails()}
            transition:fade
            aria-label="Cerrar detalles del álbum"
        ></div>

        <div
            class="relative w-full max-w-4xl bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[80vh]"
            transition:fly={{ y: 50 }}
        >
            <!-- Modal Cover Side -->
            <div class="w-full md:w-1/3 relative min-h-[200px] md:min-h-0">
                <img
                    src={selectedAlbum.cover}
                    alt="Cover"
                    class="absolute inset-0 w-full h-full object-cover"
                />
                <div
                    class="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent md:bg-gradient-to-r"
                ></div>

                <div class="absolute bottom-0 left-0 p-6 z-10 w-full">
                    <h2
                        class="text-3xl font-bold text-white leading-tight mb-2 drop-shadow-md"
                    >
                        {selectedAlbum.title}
                    </h2>
                    <div
                        class="flex items-center gap-2 text-white/90 font-medium mb-4 drop-shadow-md"
                    >
                        {selectedAlbum.artist}
                        <VerifiedBadge size="sm" />
                    </div>

                    <button
                        on:click={() =>
                            togglePlayPause(selectedAlbum?.id || "")}
                        class="w-full py-3 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-xl shadow-lg shadow-primary-900/40 transition-all flex items-center justify-center gap-2"
                    >
                        {#if $audioStore.currentAlbumId === selectedAlbum.id && $audioStore.isPlaying}
                            <span>⏸ Pausar</span>
                        {:else}
                            <span>▶ Reproducir Todo</span>
                        {/if}
                    </button>
                </div>
            </div>

            <!-- Modal Tracks Side -->
            <div class="flex-1 overflow-y-auto bg-[#0F172A] p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-slate-200">
                        Lista de Canciones
                    </h3>
                    <button
                        on:click={closeAlbumDetails}
                        class="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                        >✕</button
                    >
                </div>

                <div class="space-y-1">
                    {#if selectedAlbum.tracks && selectedAlbum.tracks.length > 0}
                        {#each selectedAlbum.tracks as track, index}
                            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                            <div
                                class="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer {$audioStore.currentAlbumId ===
                                    selectedAlbum.id &&
                                $audioStore.currentTrackIndex === index
                                    ? 'bg-white/5'
                                    : ''}"
                                on:click={() =>
                                    selectedAlbum &&
                                    toggleTrackPlay(selectedAlbum, index)}
                            >
                                <div
                                    class="w-8 flex justify-center text-sm font-medium text-slate-500 group-hover:text-white transition-colors"
                                >
                                    {#if $audioStore.currentAlbumId === selectedAlbum.id && $audioStore.currentTrackIndex === index && $audioStore.isPlaying}
                                        <!-- Equalizer Animation Widget -->
                                        <div
                                            class="flex items-end gap-[2px] h-3"
                                        >
                                            <div
                                                class="w-1 bg-primary-400 animate-[bounce_0.8s_infinite] h-2"
                                            ></div>
                                            <div
                                                class="w-1 bg-primary-400 animate-[bounce_1.2s_infinite] h-3"
                                            ></div>
                                            <div
                                                class="w-1 bg-primary-400 animate-[bounce_0.6s_infinite] h-1"
                                            ></div>
                                        </div>
                                    {:else}
                                        <span class="group-hover:hidden"
                                            >{index + 1}</span
                                        >
                                        <span
                                            class="hidden group-hover:block text-white"
                                            >▶</span
                                        >
                                    {/if}
                                </div>

                                <div class="flex-1 min-w-0">
                                    <h4
                                        class="font-medium text-slate-200 truncate {$audioStore.currentAlbumId ===
                                            selectedAlbum.id &&
                                        $audioStore.currentTrackIndex === index
                                            ? 'text-primary-400'
                                            : ''}"
                                    >
                                        {track.title}
                                    </h4>
                                    <p class="text-xs text-slate-500 truncate">
                                        {track.artist}
                                    </p>
                                </div>

                                <div
                                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <button
                                        on:click|stopPropagation={() =>
                                            toggleFavorite(track.id || "")}
                                        class="p-2 hover:bg-white/10 rounded-full {isFavorite(
                                            track.id || '',
                                            $favoritesStore,
                                        )
                                            ? 'text-red-500'
                                            : 'text-slate-400'}"
                                    >
                                        ♥
                                    </button>
                                </div>

                                <span class="text-xs text-slate-600 font-mono">
                                    {Math.floor(
                                        (track.duration || 180) / 60,
                                    )}:{(track.duration || 180) % 60 < 10
                                        ? "0"
                                        : ""}{(track.duration || 180) % 60}
                                </span>
                            </div>
                        {/each}
                    {:else}
                        <div class="text-center py-10 text-slate-500">
                            No hay tracks disponibles
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}
