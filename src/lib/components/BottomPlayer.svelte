<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import { slide } from "svelte/transition";
    import { onMount, createEventDispatcher } from "svelte";

    import MiniPlayer from "./player/MiniPlayer.svelte";
    import TrackInfo from "./player/TrackInfo.svelte";
    import PlaybackControls from "./player/PlaybackControls.svelte";
    import ProgressBar from "./player/ProgressBar.svelte";
    import VolumeControl from "./player/VolumeControl.svelte";

    const dispatch = createEventDispatcher();

    import {
        favoritesStore,
        toggleFavorite,
        isFavorite,
    } from "$lib/data/favorites";

    let showVolumeSlider = false;
    let isCollapsed = false;

    $: currentTrack = $audioStore.playlist[$audioStore.currentTrackIndex];
    $: isTrackFavorite = currentTrack?.id
        ? isFavorite(currentTrack.id, $favoritesStore)
        : false;
</script>

{#if currentTrack}
    {#if isCollapsed}
        <MiniPlayer
            {currentTrack}
            onExpand={() => (isCollapsed = false)}
            isFavorite={isTrackFavorite}
            onFavoriteClick={() =>
                currentTrack?.id && toggleFavorite(currentTrack.id)}
        />
    {:else}
        <!-- FLOATING DOCK PLAYER -->
        <div
            transition:slide={{ duration: 400, axis: "y" }}
            class="fixed bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 w-[95%] md:w-auto md:min-w-[700px] max-w-5xl z-[50] flex flex-col items-center"
        >
            <!-- Minimize Button (Outside Main Container to avoid clipping) -->
            <button
                on:click={() => (isCollapsed = true)}
                class="w-16 h-6 flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-md border border-white/20 border-b-0 rounded-t-xl text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95 -mb-[1px] z-10"
                title="Minimizar"
                aria-label="Minimizar reproductor"
            >
                <div class="w-8 h-1 bg-current rounded-full"></div>
            </button>

            <div
                class="w-full bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-full p-3 md:px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 md:gap-12 relative overflow-hidden group"
            >
                <!-- Shine Effect -->
                <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2s] pointer-events-none"
                ></div>

                <!-- Left: Track Info & Favorite -->
                <div class="flex-shrink-0">
                    <TrackInfo
                        {currentTrack}
                        isFavorite={isTrackFavorite}
                        onFavoriteClick={() =>
                            currentTrack?.id && toggleFavorite(currentTrack.id)}
                        onShowTracks={() => dispatch("showTracks")}
                    />
                </div>

                <!-- Center: Controls & Progress -->
                <div
                    class="flex-1 flex flex-col justify-center max-w-md w-full"
                >
                    <div class="flex items-center justify-center -mb-1">
                        <PlaybackControls />
                    </div>
                    <div class="w-full px-2">
                        <ProgressBar />
                    </div>
                </div>

                <!-- Right: Volume Control - Always visible on desktop -->
                <div class="flex-shrink-0 hidden lg:flex items-center">
                    <VolumeControl bind:showVolumeSlider />
                </div>
            </div>
        </div>
    {/if}
{/if}
