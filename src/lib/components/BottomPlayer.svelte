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
            class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[98%] md:w-auto md:min-w-[700px] max-w-5xl z-[50]"
        >
            <div
                class="bg-[#0F172A]/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 pl-3 pr-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 md:gap-12 relative overflow-hidden group"
            >
                <!-- Shine Effect -->
                <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2s] pointer-events-none"
                ></div>

                <!-- Minimize Button - Better Mobile UX -->
                <button
                    on:click={() => (isCollapsed = true)}
                    class="absolute -top-10 md:-top-6 left-1/2 -translate-x-1/2 w-20 h-12 md:w-20 md:h-6 flex items-center justify-center bg-[#0F172A]/90 md:bg-[#0F172A]/60 backdrop-blur-sm rounded-t-2xl border-2 md:border border-white/30 border-b-0 text-white md:text-white/40 hover:text-white transition-all z-20 cursor-pointer active:scale-95 shadow-lg"
                    title="Minimizar"
                    aria-label="Minimizar reproductor"
                >
                    <div
                        class="w-12 h-2 md:w-8 md:h-1 bg-current rounded-full"
                    ></div>
                </button>

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
