<script lang="ts">
    import { audioStore, playAlbum } from "$lib/audio/store";
    import { fade } from "svelte/transition";

    $: groupedAlbums = $audioStore.availableAlbums.reduce(
        (acc, album) => {
            if (!acc[album.artist]) acc[album.artist] = [];
            acc[album.artist].push(album);
            return acc;
        },
        {} as Record<string, typeof $audioStore.availableAlbums>,
    );

    $: artists = Object.keys(groupedAlbums).sort();

    function playAlbumAction(id: string) {
        playAlbum(id);
    }
</script>

<div
    class="min-h-screen bg-[#0B1120] text-white font-poppins pb-32 pt-24 px-4 md:px-12"
>
    <div class="max-w-7xl mx-auto">
        <!-- Back to Home Button -->
        <div class="mb-6">
            <a
                href="/"
                class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95"
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

        <header class="mb-8 flex items-center gap-4">
            <div
                class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-purple-900/50"
            >
                🎤
            </div>
            <div>
                <h1
                    class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
                >
                    Artistas & Colecciones
                </h1>
                <p class="text-slate-400 mt-2">
                    Explora el catálogo completo de ChillChess.
                </p>
            </div>
        </header>

        <!-- View Toggle (Albums / Artists) -->
        <div class="flex items-center gap-6 mb-12 border-b border-white/10">
            <a
                href="/coleccion"
                class="text-lg font-bold text-slate-400 hover:text-white transition-colors pb-4 px-2 hover:border-b-2 hover:border-white/10"
            >
                📀 Álbumes
            </a>
            <button
                class="text-lg font-bold text-white border-b-2 border-primary-500 pb-4 px-2"
            >
                🎤 Artistas
            </button>
        </div>

        {#if $audioStore.isLoadingLibrary}
            <div class="flex items-center justify-center h-64">
                <div
                    class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"
                ></div>
            </div>
        {:else if artists.length === 0}
            <div
                class="text-center py-20 bg-white/5 rounded-3xl border border-white/5"
            >
                <span class="text-4xl block mb-4">📭</span>
                <p class="text-slate-500">
                    No hay artistas disponibles en este momento.
                </p>
            </div>
        {:else}
            <div class="space-y-16 animate-fade-in-up">
                {#each artists as artist}
                    <section>
                        <div
                            class="flex items-baseline gap-4 mb-6 border-b border-white/5 pb-2"
                        >
                            <h2 class="text-2xl font-bold text-white/90">
                                {artist}
                            </h2>
                            <span
                                class="text-xs text-slate-500 font-mono tracking-wider"
                                >{groupedAlbums[artist].length} ALBUM{groupedAlbums[
                                    artist
                                ].length > 1
                                    ? "S"
                                    : ""}</span
                            >
                        </div>

                        <div
                            class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
                        >
                            {#each groupedAlbums[artist] as album}
                                <button
                                    on:click={() => playAlbumAction(album.id)}
                                    class="group text-left"
                                >
                                    <div
                                        class="aspect-square rounded-2xl bg-slate-800 mb-4 overflow-hidden relative shadow-lg group-hover:shadow-purple-500/20 transition-all group-hover:-translate-y-1"
                                    >
                                        <img
                                            src={album.cover}
                                            alt={album.title}
                                            class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        <!-- Overlay Play Icon -->
                                        <div
                                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
                                        >
                                            {#if $audioStore.currentAlbumId === album.id && $audioStore.isPlaying}
                                                <div
                                                    class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black pl-1 animate-pulse"
                                                >
                                                    ⏸
                                                </div>
                                            {:else}
                                                <div
                                                    class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black pl-1"
                                                >
                                                    ▶
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                    <h3
                                        class="font-bold text-sm md:text-base text-white/90 group-hover:text-purple-400 transition-colors truncate"
                                    >
                                        {album.title}
                                    </h3>
                                    <div class="flex items-center gap-2 mt-1">
                                        {#if album.category}
                                            <span
                                                class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 capitalize border border-white/5"
                                            >
                                                {album.category}
                                            </span>
                                        {/if}
                                        {#if album.isPremium}
                                            <span
                                                class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/20"
                                                >PRO</span
                                            >
                                        {/if}
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </section>
                {/each}
            </div>
        {/if}
    </div>
</div>
