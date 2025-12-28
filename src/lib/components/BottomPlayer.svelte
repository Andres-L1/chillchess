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
        <MiniPlayer {currentTrack} onExpand={() => (isCollapsed = false)} />
    {:else}
        <!-- FULL BAR -->
        <div
            transition:slide={{ duration: 300, axis: "y" }}
            class="fixed bottom-0 left-0 w-full bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 z-[50] text-white px-4 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        >
            <!-- Minimize Button -->
            <button
                on:click={() => (isCollapsed = true)}
                class="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#121212]/95 border-t border-l border-r border-white/10 rounded-t-lg flex items-center justify-center text-white/30 hover:text-white hover:h-6 transition-all group"
                title="Minimizar reproductor"
            >
                <div class="w-8 h-1 bg-current rounded-full"></div>
            </button>

            <div
                class="flex items-center justify-between gap-4 max-w-[1920px] mx-auto relative"
            >
                <!-- Left: Track Info & Favorite -->
                <TrackInfo
                    {currentTrack}
                    isFavorite={isTrackFavorite}
                    onFavoriteClick={() =>
                        currentTrack?.id && toggleFavorite(currentTrack.id)}
                    onShowTracks={() => dispatch("showTracks")}
                />

                <!-- Center: Controls & Progress -->
                <div
                    class="flex flex-col items-center justify-center flex-1 w-full max-w-xl"
                >
                    <PlaybackControls />
                    <ProgressBar />
                </div>

                <!-- Right: Volume Control -->
                <VolumeControl bind:showVolumeSlider>
                    <svelte:fragment slot="minimize-button">
                        <button
                            on:click={() => (isCollapsed = true)}
                            class="md:hidden text-white/50 hover:text-white"
                        >
                            ⬇
                        </button>
                    </svelte:fragment>
                </VolumeControl>
            </div>
        </div>
    {/if}
{/if}
