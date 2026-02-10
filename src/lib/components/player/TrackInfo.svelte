<script lang="ts">
    import type { Track } from '$lib/types';
    import { createEventDispatcher } from 'svelte';

    export let currentTrack: Track;
    export let isFavorite: boolean;

    const dispatch = createEventDispatcher();
</script>

<div class="flex items-center gap-3 group/info">
    <!-- Album Art / Trigger -->
    <button
        class="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg border border-white/10 group-hover/info:border-primary-500/50 transition-colors"
        on:click={() => dispatch('showTracks')}
    >
        <img
            src={currentTrack.cover || currentTrack.albumCover || '/logo-mobile.png'}
            class="w-full h-full object-cover"
            alt={currentTrack.title}
        />
        <div
            class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/info:opacity-100 transition-opacity"
        >
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                />
            </svg>
        </div>
    </button>

    <div class="flex flex-col min-w-0">
        <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-white truncate max-w-[120px]"
                >{currentTrack.title}</span
            >
            <button
                on:click={() => dispatch('favorite')}
                class="text-slate-400 hover:text-rose-500 transition-colors"
            >
                {#if isFavorite}
                    <svg class="w-4 h-4 text-rose-500 fill-current" viewBox="0 0 24 24"
                        ><path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                        /></svg
                    >
                {:else}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        /></svg
                    >
                {/if}
            </button>
        </div>
        <a
            href="/artist"
            class="text-xs text-slate-400 hover:text-white transition-colors truncate block"
        >
            {currentTrack.artist}
        </a>
    </div>
</div>
