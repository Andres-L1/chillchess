<script lang="ts">
    import { slide } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import {
        audioStore,
        togglePlayback,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
    } from '$lib/audio/store';
    import { userSubscription } from '$lib/subscription/userSubscription';
    import type { Track } from '$lib/types';

    import TrackInfo from './TrackInfo.svelte';
    import PlaybackControls from './PlaybackControls.svelte';
    import ProgressBar from './ProgressBar.svelte';
    import VolumeControl from './VolumeControl.svelte';

    export let currentTrack: Track;
    export let isTrackFavorite: boolean;
    export let isMinimized: boolean;
    export let resolvedCover: string;

    const dispatch = createEventDispatcher();

    let showTrackList = false;

    function handleImageError(e: Event) {
        const img = e.currentTarget as HTMLImageElement;
        img.src = '/logo-mobile.png';
    }
</script>

<!-- DESKTOP DOCK LAYOUT -->
<div
    transition:slide={{ duration: 400, axis: 'y' }}
    class="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex-col items-center group/dock perspective-1000 {isMinimized
        ? 'pointer-events-none'
        : ''}"
>
    <!-- Main Player Container -->
    <div class="relative w-[750px] transition-all duration-300 hover:w-[780px]">
        <!-- 0. Dynamic Ambient Glow (Behind) -->
        <div
            class="absolute -inset-4 bg-gradient-to-t from-primary-500/20 to-purple-500/20 blur-3xl rounded-[3rem] opacity-0 group-hover/dock:opacity-100 transition-opacity duration-700"
        ></div>

        <!-- 1. Glass Background -->
        <div
            class="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        >
            <!-- Animated Shine -->
            <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/dock:translate-x-full transition-transform duration-[1.5s] ease-in-out {isMinimized
                    ? 'hidden'
                    : ''}"
            ></div>
        </div>

        <!-- 2. Content -->
        <div class="relative z-10 px-4 py-3 flex items-center gap-6 {isMinimized ? 'hidden' : ''}">
            <!-- Track Info -->
            <div class="flex-initial w-48 truncate">
                <TrackInfo
                    {currentTrack}
                    isFavorite={isTrackFavorite}
                    onFavoriteClick={() => dispatch('favorite')}
                    onShowTracks={() => (showTrackList = !showTrackList)}
                />
            </div>

            <!-- Controls & Progress (Centered) -->
            <div class="flex-1 flex flex-col justify-center gap-1">
                <div class="flex items-center justify-center -mt-1">
                    <PlaybackControls />
                </div>
                <div class="w-full px-2">
                    <ProgressBar />
                </div>
            </div>

            <!-- Volume & Extras -->
            <div class="flex flex-shrink-0 items-center gap-4 border-l border-white/10 pl-6">
                <VolumeControl />

                <!-- Download Button (Desktop) -->
                <button
                    on:click={() => dispatch('download')}
                    class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 {[
                        'pro',
                        'premium',
                        'lifetime',
                    ].includes($userSubscription.tier)
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-400'} transition-colors"
                    title={['pro', 'premium', 'lifetime'].includes($userSubscription.tier)
                        ? 'Descargar'
                        : 'Descarga disponible en PRO'}
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    {#if !['pro', 'premium', 'lifetime'].includes($userSubscription.tier)}
                        <span class="absolute -top-1 -right-1 text-[8px]">🔒</span>
                    {/if}
                </button>

                <!-- Close / Minimize Button -->
                <div class="flex items-center gap-1">
                    <button
                        on:click={() => (isMinimized = true)}
                        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        title="Minimizar reproductor"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            ></path>
                        </svg>
                    </button>
                    <button
                        on:click={() => dispatch('close')}
                        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors"
                        title="Cerrar reproductor"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- DESKTOP QUEUE POPUP -->
        {#if showTrackList && !isMinimized}
            <div
                transition:slide={{ axis: 'y' }}
                class="absolute bottom-full left-0 w-full mb-4 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl max-h-[400px] overflow-hidden flex flex-col"
            >
                <div class="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                    <h3 class="text-white font-bold">Cola de Reproducción</h3>
                    <button
                        on:click={() => (showTrackList = false)}
                        class="text-slate-400 hover:text-white"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            /></svg
                        >
                    </button>
                </div>
                <div class="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20">
                    {#each $audioStore.playlist as track, i}
                        <button
                            class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group text-left transition-colors {i ===
                            $audioStore.currentTrackIndex
                                ? 'bg-white/10'
                                : ''}"
                            on:click={() => {
                                audioStore.update((s) => ({
                                    ...s,
                                    currentTrackIndex: i,
                                    isPlaying: true,
                                }));
                            }}
                        >
                            <div
                                class="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-slate-800"
                            >
                                <img
                                    src={track.cover || resolvedCover || '/logo-mobile.png'}
                                    class="w-full h-full object-cover {i ===
                                        $audioStore.currentTrackIndex && $audioStore.isPlaying
                                        ? 'opacity-50'
                                        : ''}"
                                    alt=""
                                    loading="lazy"
                                    on:error={handleImageError}
                                />
                                {#if i === $audioStore.currentTrackIndex && $audioStore.isPlaying}
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <div class="w-1 h-3 bg-primary-500 animate-bounce"></div>
                                    </div>
                                {/if}
                            </div>
                            <div class="min-w-0">
                                <div
                                    class="text-sm font-medium text-white truncate {i ===
                                    $audioStore.currentTrackIndex
                                        ? 'text-primary-400'
                                        : ''}"
                                >
                                    {track.title}
                                </div>
                                <div class="text-xs text-slate-400 truncate">
                                    {track.artist}
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {/if}
    </div>

    <!-- Hide Handle (Visual only) -->
    <div class="absolute -bottom-6 opacity-0 group-hover/dock:opacity-100 transition-opacity">
        <button
            on:click={() => (isMinimized = true)}
            class="text-xs text-slate-500 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 hover:text-white"
            >Ocultar</button
        >
    </div>
</div>
