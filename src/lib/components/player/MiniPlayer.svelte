<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import { getAlbumById } from "$lib/data/albums";
    import { fade } from "svelte/transition";

    export let currentTrack: any;
    export let onExpand: () => void;
    export let isFavorite: boolean = false;
    export let onFavoriteClick: () => void = () => {};
    export let onClose: (() => void) | undefined = undefined;

    $: currentAlbum = $audioStore.currentAlbumId
        ? getAlbumById($audioStore.currentAlbumId)
        : null;
</script>

<div
    transition:fade={{ duration: 200 }}
    class="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2"
>
    <button
        on:click={onExpand}
        class="group bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 p-2 pr-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3 overflow-hidden max-w-[240px]"
    >
        <!-- Animated Vinyl Icon -->
        <div
            class="relative shrink-0 w-11 h-11 flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
        >
            {#if currentAlbum}
                <div class="relative w-full h-full">
                    <img
                        src={currentAlbum.cover}
                        alt="Album Art"
                        class="absolute inset-0 w-full h-full rounded-full object-cover border-[1.5px] border-white/20 shadow-md"
                        class:animate-spin-slow={$audioStore.isPlaying}
                    />
                    <!-- Vinyl Grooves Shine -->
                    <div
                        class="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"
                    ></div>
                </div>
            {:else}
                <div
                    class="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center border border-white/20"
                    class:animate-spin-slow={$audioStore.isPlaying}
                >
                    <svg
                        class="w-4 h-4 text-white/70"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                        />
                    </svg>
                </div>
            {/if}

            <!-- Center Dot (Vinyl effect) -->
            <div
                class="absolute w-2.5 h-2.5 bg-[#0F172A] rounded-full z-10 border border-white/10"
            ></div>

            <!-- Playing Indicator Overlay -->
            {#if $audioStore.isPlaying}
                <div
                    class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0F172A] flex items-center justify-center"
                >
                    <div
                        class="w-1 h-1 bg-white rounded-full animate-ping"
                    ></div>
                </div>
            {/if}
        </div>

        <!-- Update Info with Album Artist Priority -->
        <div class="flex flex-col text-left min-w-0 pr-2">
            <span
                class="text-xs font-bold text-white truncate w-24 sm:w-32 leading-tight"
                >{currentTrack.title}</span
            >
            <span
                class="text-[10px] text-slate-400 truncate w-24 sm:w-32 font-medium"
                >{currentAlbum?.artist || currentTrack.artist}</span
            >
        </div>

        <!-- Favorite Button (visible on mini player) -->
        <div class="pl-2 border-l border-white/10 flex items-center">
            <button
                on:click|stopPropagation={onFavoriteClick}
                class="text-white/40 hover:text-rose-400 hover:scale-110 transition-all p-1"
                title="Favorito"
            >
                {#if isFavorite}
                    <svg
                        class="w-4 h-4 text-rose-500 fill-current"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        />
                    </svg>
                {:else}
                    <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                {/if}
            </button>
        </div>
        <!-- Close Button (Hover) -->
        {#if onClose}
            <button
                on:click|stopPropagation={onClose}
                class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 z-50"
                title="Cerrar"
            >
                <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2.5"
                        d="M6 18L18 6M6 6l12 12"
                    ></path></svg
                >
            </button>
        {/if}
    </button>
</div>

<style>
    .animate-spin-slow {
        animation: spin 8s linear infinite;
    }
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
