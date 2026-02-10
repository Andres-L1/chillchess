<script lang="ts">
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { audioStore } from '$lib/audio/store';
    import type { Track } from '$lib/types';

    export let currentTrack: Track;
    export let resolvedCover: string;

    const dispatch = createEventDispatcher();

    function handleImageError(e: Event) {
        const img = e.currentTarget as HTMLImageElement;
        img.src = '/logo-mobile.png';
    }
</script>

<!-- FLOATING MINIMIZED BUBBLE -->
<div class="fixed bottom-6 right-6 z-[100] group/mini" transition:slide>
    <!-- Close Button (Absolute) -->
    <button
        on:click|stopPropagation={() => dispatch('close')}
        class="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full text-white flex items-center justify-center shadow-lg opacity-100 md:opacity-0 md:group-hover/mini:opacity-100 transition-all hover:bg-red-600 z-50 hover:scale-110"
        title="Cerrar reproductor"
    >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M6 18L18 6M6 6l12 12"
            /></svg
        >
    </button>

    <button
        class="group flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-white/10 p-2 pr-6 rounded-full shadow-2xl hover:bg-black/90 hover:border-primary-500/30 transition-all duration-300 max-w-[300px]"
        on:click={() => dispatch('expand')}
    >
        <div
            class="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
        >
            <img
                src={resolvedCover || '/logo-mobile.png'}
                alt="Now Playing"
                class="w-full h-full object-cover {$audioStore.isPlaying
                    ? 'animate-[spin_10s_linear_infinite]'
                    : ''}"
                on:error={handleImageError}
            />
            <!-- Play/Expand Overlay -->
            <div
                class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"
                    ><path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"
                    ></path></svg
                >
            </div>
        </div>

        <div class="flex flex-col items-start min-w-0 overflow-hidden">
            <span
                class="text-xs font-bold text-white truncate w-full group-hover:text-primary-400 transition-colors"
            >
                {currentTrack.title}
            </span>
            <span class="text-xs text-slate-400 truncate w-full">
                {currentTrack.artist}
            </span>
        </div>
    </button>
</div>
