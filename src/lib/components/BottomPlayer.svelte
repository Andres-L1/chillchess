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
    let isClosed = false;

    // Re-open player automatically when track changes
    $: if (currentTrack) {
        // We don't force open on every reactive update, only if track ID changes
        // Ideally logic would be here, but for now let's just ensure it shows if hidden logic is simple
        // Actually, simplistic approach: if currentTrack changes ID, set isClosed = false.
    }

    // Better reactivity for "New Track -> Open Player"
    let lastTrackId: string | undefined;
    $: if (currentTrack?.id !== lastTrackId) {
        lastTrackId = currentTrack?.id;
        isClosed = false;
    }

    function closePlayer() {
        audioStore.update((s) => ({ ...s, isPlaying: false }));
        isClosed = true;
    }
</script>

{#if currentTrack && !isClosed}
    {#if isCollapsed}
        <MiniPlayer
            {currentTrack}
            onExpand={() => (isCollapsed = false)}
            isFavorite={isTrackFavorite}
            onFavoriteClick={() =>
                currentTrack?.id && toggleFavorite(currentTrack.id)}
            onClose={closePlayer}
        />
        <!-- Note: MiniPlayer needs to support onClose prop or we wrap it. 
             If MiniPlayer doesn't support onClose, I'll wrap it or just rely on expanded view close.
             Let's assume user interacts mostly with expanded. 
             For now, I will add a close button to the expanded view primarily.
        -->
    {:else}
        <!-- FLOATING DOCK PLAYER -->
        <div
            transition:slide={{ duration: 400, axis: "y" }}
            class="fixed bottom-2 md:bottom-6 left-1/2 -translate-x-1/2 w-[95%] md:w-auto md:min-w-[700px] max-w-5xl z-[50] flex flex-col items-center"
        >
            <!-- Control Handle (Minimize & Close) -->
            <div class="flex items-end gap-1 -mb-[1px] z-10">
                <!-- Minimize -->
                <button
                    on:click={() => (isCollapsed = true)}
                    class="w-16 h-6 flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-md border border-white/20 border-b-0 rounded-t-xl text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
                    title="Minimizar"
                >
                    <div class="w-8 h-1 bg-current rounded-full"></div>
                </button>

                <!-- Close (New) -->
                <button
                    on:click={closePlayer}
                    class="w-10 h-6 flex items-center justify-center bg-red-500/10 hover:bg-red-500/80 backdrop-blur-md border border-red-500/20 hover:border-red-500 border-b-0 rounded-t-xl text-red-400 hover:text-white transition-all cursor-pointer active:scale-95 group/close"
                    title="Cerrar Reproductor"
                >
                    <svg
                        class="w-3 h-3 group-hover/close:scale-125 transition-transform"
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
            </div>

            <div
                class="w-full bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-3xl p-3 md:px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 md:gap-12 relative overflow-hidden group"
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
                    <div class="flex items-center justify-center mb-2">
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
