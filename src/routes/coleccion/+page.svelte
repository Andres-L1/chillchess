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
    import { userSubscription } from "$lib/subscription/userSubscription";

    const categoryLabelMap = CATEGORY_LABELS.reduce(
        (acc, curr) => {
            acc[curr.id] = curr.label;
            return acc;
        },
        {} as Record<string, string>,
    );

    let selectedCategory: AlbumCategory | "all" = "all";
    let selectedAlbum: Album | null = null;

    $: filteredAlbums =
        selectedCategory === "all"
            ? ALBUMS
            : ALBUMS.filter((a) => a.category === selectedCategory);

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

    function showAlbumDetails(album: Album) {
        selectedAlbum = album;
    }

    function closeAlbumDetails() {
        selectedAlbum = null;
    }

    function playTrackFromAlbum(album: Album, index: number) {
        const isCurrentAlbum = $audioStore.currentAlbumId === album.id;

        if (isCurrentAlbum) {
            // Just change track if same album
            audioStore.update((s) => ({
                ...s,
                currentTrackIndex: index,
                isPlaying: true,
            }));
        } else {
            // Load album and play specific track
            playAlbum(album.id);
            // Must force index update after album load
            audioStore.update((s) => ({ ...s, currentTrackIndex: index }));
        }
    }

    function toggleTrackPlay(album: Album, index: number) {
        const isCurrentAlbum = $audioStore.currentAlbumId === album.id;
        const isCurrentTrack =
            isCurrentAlbum && $audioStore.currentTrackIndex === index;

        if (isCurrentTrack && $audioStore.isPlaying) {
            audioStore.update((s) => ({ ...s, isPlaying: false }));
        } else {
            playTrackFromAlbum(album, index);
        }
    }
</script>

<svelte:head>
    <title>Colección | ChillChess</title>
    <meta
        name="description"
        content="Explora nuestra colección de música y soundtracks organizados por categorías"
    />
</svelte:head>

<div class="min-h-screen bg-[#0B1120] text-white pb-32">
    <!-- Header -->
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12"
        >
            <div>
                <h1
                    class="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                >
                    Colección Musical
                </h1>
                <p class="text-slate-400 text-lg">
                    Descubre {ALBUMS.length}
                    {ALBUMS.length === 1 ? "álbum" : "álbumes"} organizados por categoría
                </p>
            </div>
            <a
                href="/"
                class="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 w-fit"
            >
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
                Volver al Inicio
            </a>
        </div>

        <!-- View Toggle (Albums / Artists) -->
        <div class="flex items-center gap-6 mb-12 border-b border-white/10">
            <button
                class="text-lg font-bold text-white border-b-2 border-primary-500 pb-4 px-2"
            >
                📀 Álbumes
            </button>
            <a
                href="/artists"
                class="text-lg font-bold text-slate-400 hover:text-white transition-colors pb-4 px-2 hover:border-b-2 hover:border-white/10"
            >
                🎤 Artistas
            </a>
        </div>

        <!-- Category Filters -->
        <div class="mb-12">
            <div class="flex items-center gap-3 mb-6">
                <svg
                    class="w-6 h-6 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"
                    />
                </svg>
                <h2 class="text-2xl font-bold">Categorías</h2>
            </div>

            <div class="flex flex-wrap gap-4">
                <button
                    on:click={() => (selectedCategory = "all")}
                    class="px-6 py-3 rounded-xl font-medium transition-all {selectedCategory ===
                    'all'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'}"
                >
                    📚 Todas ({ALBUMS.length})
                </button>
                <button
                    on:click={() => (selectedCategory = "musica")}
                    class="px-6 py-3 rounded-xl font-medium transition-all {selectedCategory ===
                    'musica'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'}"
                >
                    🎵 Música ({ALBUMS.filter((a) => a.category === "musica")
                        .length})
                </button>
                <button
                    on:click={() => (selectedCategory = "juegos")}
                    class="px-6 py-3 rounded-xl font-medium transition-all {selectedCategory ===
                    'juegos'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'}"
                >
                    🎮 Juegos ({ALBUMS.filter((a) => a.category === "juegos")
                        .length})
                </button>
                <button
                    on:click={() => (selectedCategory = "ambiente")}
                    class="px-6 py-3 rounded-xl font-medium transition-all {selectedCategory ===
                    'ambiente'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'}"
                >
                    🌿 Ambiente ({ALBUMS.filter(
                        (a) => a.category === "ambiente",
                    ).length})
                </button>
            </div>
        </div>

        <!-- Albums Grid -->
        {#if filteredAlbums.length > 0}
            <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {#each filteredAlbums as album}
                    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                    <div
                        on:click={() => showAlbumDetails(album)}
                        class="group bg-[#1e293b]/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all hover:scale-105 cursor-pointer"
                    >
                        <!-- Album Cover -->
                        <div class="aspect-square relative overflow-hidden">
                            <img
                                src={album.cover}
                                alt={album.title}
                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />

                            <!-- Category Badge -->
                            <div
                                class="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-xs font-bold flex items-center gap-1"
                            >
                                {#if album.category === "musica"}
                                    <span>🎵</span>
                                {:else if album.category === "juegos"}
                                    <span>🎮</span>
                                {:else}
                                    <span>🌿</span>
                                {/if}
                                {categoryLabelMap[album.category]}
                            </div>

                            <!-- Premium Badge -->
                            {#if album.isPremium}
                                <div
                                    class="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full"
                                >
                                    PRO
                                </div>
                            {/if}

                            <!-- Click to View Overlay -->
                            <div
                                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <div class="text-center">
                                    <svg
                                        class="w-16 h-16 mx-auto mb-2 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                        />
                                    </svg>
                                    <p class="text-white font-bold">
                                        Ver Canciones
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Album Info -->
                        <div class="p-5">
                            <div
                                class="flex items-start justify-between gap-2 mb-2"
                            >
                                <h3 class="font-bold text-lg truncate flex-1">
                                    {album.title}
                                </h3>
                                {#if album.tag}
                                    <span
                                        class="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 font-bold shrink-0"
                                    >
                                        {album.tag}
                                    </span>
                                {/if}
                            </div>

                            <p class="text-sm text-slate-400 mb-3 truncate">
                                {album.artist}
                            </p>

                            <div
                                class="flex items-center justify-between text-xs text-slate-500"
                            >
                                <span
                                    >{album.tracks?.length || 0} canciones</span
                                >
                                <span
                                    class="font-bold {album.isPremium
                                        ? 'text-orange-400'
                                        : 'text-green-400'}"
                                >
                                    {album.price}
                                </span>
                            </div>

                            {#if album.description}
                                <p
                                    class="mt-3 text-xs text-slate-500 line-clamp-2"
                                >
                                    {album.description}
                                </p>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="text-center py-20">
                <div
                    class="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center"
                >
                    <svg
                        class="w-10 h-10 text-slate-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                        />
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-slate-400 mb-2">
                    No hay álbumes en esta categoría
                </h3>
                <p class="text-slate-500">
                    Próximamente añadiremos más contenido
                </p>
            </div>
        {/if}
    </div>
</div>

<!-- Track List Modal -->
{#if selectedAlbum}
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <button
            class="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-sm"
            on:click={closeAlbumDetails}
            aria-label="Cerrar"
        ></button>

        <!-- Modal -->
        <div
            class="relative w-full max-w-lg bg-[#0B1120]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 z-10 overflow-hidden"
        >
            <!-- Header -->
            <div class="p-6 border-b border-white/10">
                <div class="flex items-start justify-between gap-4 mb-4">
                    <div class="flex-1">
                        <h2 class="text-2xl font-bold text-white mb-1">
                            {selectedAlbum.title}
                        </h2>
                        <p class="text-slate-400">
                            {selectedAlbum.artist}
                        </p>
                        <p class="text-xs text-slate-500 mt-1">
                            {selectedAlbum.tracks?.length || 0} canciones
                        </p>
                    </div>
                    <button
                        on:click={closeAlbumDetails}
                        class="text-white/70 hover:text-white transition-colors text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                <!-- Album Controls -->
                <div class="flex items-center gap-3">
                    <button
                        on:click={prevTrack}
                        class="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            ><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg
                        >
                    </button>

                    <button
                        on:click={() =>
                            togglePlayPause(selectedAlbum?.id || "")}
                        class="flex-1 h-10 flex items-center justify-center gap-2 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform"
                    >
                        {#if $audioStore.currentAlbumId === selectedAlbum.id && $audioStore.isPlaying}
                            <svg
                                class="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                                /></svg
                            >
                            Pausar
                        {:else}
                            <svg
                                class="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                ><path d="M8 5v14l11-7z" /></svg
                            >
                            Reproducir Álbum
                        {/if}
                    </button>

                    <button
                        on:click={nextTrack}
                        class="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"
                            /></svg
                        >
                    </button>
                </div>
            </div>

            <!-- Track List -->
            <div class="p-6 max-h-[60vh] overflow-y-auto">
                {#if selectedAlbum.tracks && selectedAlbum.tracks.length > 0}
                    <div class="space-y-2">
                        {#each selectedAlbum.tracks as track, index}
                            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                            <div
                                class="group flex items-center gap-3 rounded-xl p-3 transition-colors cursor-pointer {$audioStore.currentAlbumId ===
                                    selectedAlbum.id &&
                                $audioStore.currentTrackIndex === index
                                    ? 'bg-blue-500/20 border border-blue-500/30'
                                    : 'bg-white/5 hover:bg-white/10 border border-transparent'}"
                                on:click={() =>
                                    selectedAlbum &&
                                    toggleTrackPlay(selectedAlbum, index)}
                            >
                                <div
                                    class="w-8 h-8 flex items-center justify-center shrink-0"
                                >
                                    {#if $audioStore.currentAlbumId === selectedAlbum.id && $audioStore.currentTrackIndex === index && $audioStore.isPlaying}
                                        <!-- Playing Icon -->
                                        <svg
                                            class="w-4 h-4 text-blue-400"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            ><path
                                                d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                                            /></svg
                                        >
                                    {:else if $audioStore.currentAlbumId === selectedAlbum.id && $audioStore.currentTrackIndex === index}
                                        <!-- Paused indicator if current -->
                                        <svg
                                            class="w-4 h-4 text-blue-400"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            ><path d="M8 5v14l11-7z" /></svg
                                        >
                                    {:else}
                                        <!-- Number / Play on Hover -->
                                        <span
                                            class="text-slate-500 font-bold group-hover:hidden"
                                            >{index + 1}</span
                                        >
                                        <svg
                                            class="w-4 h-4 text-white hidden group-hover:block"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            ><path d="M8 5v14l11-7z" /></svg
                                        >
                                    {/if}
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div
                                        class="font-medium text-white truncate {$audioStore.currentAlbumId ===
                                            selectedAlbum.id &&
                                        $audioStore.currentTrackIndex === index
                                            ? 'text-blue-300'
                                            : ''}"
                                    >
                                        {track.title}
                                    </div>
                                    <div
                                        class="text-sm text-slate-400 truncate"
                                    >
                                        {track.artist}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p class="text-center text-slate-500 py-8">
                        No hay canciones en este álbum
                    </p>
                {/if}
            </div>
        </div>
    </div>
{/if}
