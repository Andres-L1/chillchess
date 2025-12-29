<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import { getAlbumById } from "$lib/data/albums";

    export let currentTrack: any;
    export let isFavorite: boolean;
    export let onFavoriteClick: () => void;
    export let onShowTracks: () => void;

    $: currentAlbum = $audioStore.currentAlbumId
        ? getAlbumById($audioStore.currentAlbumId)
        : null;
</script>

<div class="flex items-center gap-4 w-1/3 min-w-0">
    <!-- Album Cover & Expand Button -->
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
        on:click={onShowTracks}
        class="hidden sm:relative sm:flex w-14 h-14 bg-white/5 rounded-lg items-center justify-center shrink-0 overflow-hidden cursor-pointer group shadow-lg shadow-black/40 border border-white/10"
        title="Ver lista de canciones"
    >
        {#if currentAlbum}
            <img
                src={currentAlbum.cover}
                alt={currentAlbum.title}
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <!-- Overlay Icon on Hover -->
            <div
                class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <svg
                    class="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    ></path></svg
                >
            </div>
        {:else}
            <!-- Fallback if no album found -->
            <div
                class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white/50"
            >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
                    ><path
                        d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                    /></svg
                >
            </div>
        {/if}
    </div>

    <div class="min-w-0 flex-1">
        <div class="font-bold text-sm sm:text-base truncate text-white">
            {currentTrack.title}
        </div>
        <div class="text-xs sm:text-sm text-slate-400 truncate">
            {currentTrack.artist}
        </div>
    </div>

    <button
        on:click={onFavoriteClick}
        class="text-white/50 hover:text-rose-400 transition-colors p-2 shrink-0"
        title="Añadir a favoritos"
        aria-label="Añadir a favoritos"
    >
        {#if isFavorite}
            <svg class="w-5 h-5 text-rose-500 fill-current" viewBox="0 0 24 24"
                ><path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                /></svg
            >
        {:else}
            <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
                ><path
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                /></svg
            >
        {/if}
    </button>
</div>
