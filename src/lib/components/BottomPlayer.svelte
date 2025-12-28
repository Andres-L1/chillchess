<script lang="ts">
    import {
        audioStore,
        togglePlayback,
        nextTrack,
        prevTrack,
        seek,
        setMusicVolume,
        setAmbienceVolume,
        toggleShuffle,
        toggleRepeat,
    } from "$lib/audio/store";
    import { slide } from "svelte/transition";
    import { onMount, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    // Favorites Logic (Local for MVP)
    let favorites: string[] = [];
    let showVolumeSlider = false;

    onMount(() => {
        const stored = localStorage.getItem("chillchess_favorites");
        if (stored) favorites = JSON.parse(stored);
    });

    function toggleFavorite(trackId?: string) {
        if (!trackId) return;

        if (favorites.includes(trackId)) {
            favorites = favorites.filter((id) => id !== trackId);
        } else {
            favorites = [...favorites, trackId];
        }
        localStorage.setItem("chillchess_favorites", JSON.stringify(favorites));
    }

    $: currentTrack = $audioStore.playlist[$audioStore.currentTrackIndex];
    $: isFavorite = currentTrack?.id && favorites.includes(currentTrack.id);

    // Format time helpers
    function formatTime(seconds: number) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    function handleSeek(e: Event) {
        const input = e.target as HTMLInputElement;
        seek(parseFloat(input.value));
    }

    // Debounced volume change for better performance
    let volumeTimeout: number;
    function handleVolumeChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const value = parseFloat(input.value);

        // Clear previous timeout
        if (volumeTimeout) clearTimeout(volumeTimeout);

        // Update immediately for visual feedback (slider moves)
        // but debounce the actual store update
        volumeTimeout = setTimeout(() => {
            setMusicVolume(value);
        }, 50) as unknown as number;
    }

    let ambienceTimeout: number;
    function handleAmbienceVolumeChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const value = parseFloat(input.value);

        if (ambienceTimeout) clearTimeout(ambienceTimeout);
        ambienceTimeout = setTimeout(() => {
            setAmbienceVolume(value);
        }, 50) as unknown as number;
    }
</script>

{#if currentTrack}
    <div
        transition:slide={{ duration: 300, axis: "y" }}
        class="fixed bottom-0 left-0 w-full bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 z-50 text-white px-4 py-3 shadow-2xl"
    >
        <div
            class="flex items-center justify-between gap-4 max-w-[1920px] mx-auto"
        >
            <!-- Left: Track Info & Favorite -->
            <div class="flex items-center gap-4 w-1/3 min-w-0">
                <!-- Cover Art (Optional, if available in Album struct or we fallback) -->
                <!-- We don't have cover in Track interface directly, need to fetch from Album if needed, 
                     but for MVP maybe just a music icon or try to find album cover from store.currentAlbumId -->
                <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                <div
                    on:click={() => dispatch("showTracks")}
                    class="hidden sm:flex w-14 h-14 bg-white/10 rounded-lg items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:bg-white/20 transition-colors group"
                    title="Ver lista de canciones"
                >
                    <svg
                        class="w-8 h-8 text-white/50 group-hover:text-white/80 transition-colors"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        ><path
                            d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                        /></svg
                    >
                </div>

                <div class="min-w-0 flex-1">
                    <div
                        class="font-bold text-sm sm:text-base truncate text-white"
                    >
                        {currentTrack.title}
                    </div>
                    <div class="text-xs sm:text-sm text-slate-400 truncate">
                        {currentTrack.artist}
                    </div>
                </div>

                <button
                    on:click={() => toggleFavorite(currentTrack.id)}
                    class="text-white/50 hover:text-green-400 transition-colors p-2"
                    title="Añadir a favoritos"
                >
                    {#if isFavorite}
                        <svg
                            class="w-5 h-5 text-green-500 fill-current"
                            viewBox="0 0 24 24"
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

            <!-- Center: Controls & Progress -->
            <div
                class="flex flex-col items-center justify-center flex-1 w-full max-w-xl"
            >
                <!-- Controls -->
                <div class="flex items-center gap-6 mb-1">
                    <button
                        on:click={toggleShuffle}
                        class="transition-colors {$audioStore.shuffle
                            ? 'text-green-400'
                            : 'text-slate-400 hover:text-white'}"
                        title="Aleatorio"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
                            /></svg
                        >
                    </button>

                    <button
                        on:click={prevTrack}
                        class="text-white/80 hover:text-white transition-colors"
                    >
                        <svg
                            class="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            ><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg
                        >
                    </button>

                    <button
                        on:click={togglePlayback}
                        class="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        {#if $audioStore.isPlaying}
                            <svg
                                class="w-6 h-6 ml-0.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                                /></svg
                            >
                        {:else}
                            <svg
                                class="w-6 h-6 ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                ><path d="M8 5v14l11-7z" /></svg
                            >
                        {/if}
                    </button>

                    <button
                        on:click={nextTrack}
                        class="text-white/80 hover:text-white transition-colors"
                    >
                        <svg
                            class="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"
                            /></svg
                        >
                    </button>

                    <button
                        on:click={toggleRepeat}
                        class="transition-colors relative {$audioStore.repeatMode !==
                        'off'
                            ? 'text-green-400'
                            : 'text-slate-400 hover:text-white'}"
                        title={$audioStore.repeatMode === "one"
                            ? "Repetir una"
                            : $audioStore.repeatMode === "all"
                              ? "Repetir todo"
                              : "Repetir desactivado"}
                    >
                        <svg
                            class="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
                            /></svg
                        >
                        {#if $audioStore.repeatMode === "one"}
                            <span
                                class="absolute -bottom-1 -right-1 text-[8px] font-bold"
                                >1</span
                            >
                        {/if}
                    </button>
                </div>

                <!-- Progress -->
                <div
                    class="w-full flex items-center gap-2 text-xs text-slate-400 font-mono"
                >
                    <span class="w-10 text-right"
                        >{formatTime($audioStore.currentTime)}</span
                    >

                    <div
                        class="relative flex-1 h-1 bg-white/10 rounded-full group cursor-pointer group"
                    >
                        <!-- Custom Range Input overlay -->
                        <input
                            type="range"
                            min="0"
                            max={$audioStore.duration || 100}
                            value={$audioStore.currentTime}
                            on:input={handleSeek}
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <!-- Visual Progress -->
                        <div
                            class="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-green-500 transition-colors pointer-events-none"
                            style="width: {($audioStore.currentTime /
                                ($audioStore.duration || 1)) *
                                100}%"
                        ></div>
                        <!-- Handle (only visible on hover logic via CSS if needed, kept simple for now) -->
                    </div>

                    <span class="w-10">{formatTime($audioStore.duration)}</span>
                </div>
            </div>

            <!-- Right: Volume Control -->
            <div
                class="flex w-auto md:w-1/3 justify-end items-center gap-2 md:gap-4"
            >
                <div class="flex items-center gap-2 relative">
                    <button
                        on:click={() => (showVolumeSlider = !showVolumeSlider)}
                        class="text-white/70 hover:text-white transition-colors"
                        title="Volumen"
                    >
                        {#if $audioStore.musicVolume === 0 || $audioStore.isMuted}
                            <svg
                                class="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                                /></svg
                            >
                        {:else if $audioStore.musicVolume < 0.5}
                            <svg
                                class="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                ><path d="M7 9v6h4l5 5V4l-5 5H7z" /></svg
                            >
                        {:else}
                            <svg
                                class="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
                                /></svg
                            >
                        {/if}
                    </button>

                    {#if showVolumeSlider}
                        <div
                            class="absolute bottom-full right-0 mb-4 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex gap-8 z-50"
                        >
                            <!-- Music Slider -->
                            <div class="flex flex-col items-center gap-3 h-40">
                                <span
                                    class="text-[10px] font-bold text-slate-400 uppercase tracking-widest rotate-180"
                                    style="writing-mode: vertical-rl"
                                    >Música</span
                                >
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={$audioStore.musicVolume}
                                    on:input={handleVolumeChange}
                                    class="flex-1 w-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-colors
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                                    style="writing-mode: bt-lr; -webkit-appearance: slider-vertical;"
                                />
                                <div
                                    class="text-xs font-bold text-white tabular-nums w-8 text-center bg-white/5 rounded px-1"
                                >
                                    {Math.round($audioStore.musicVolume * 100)}%
                                </div>
                            </div>

                            <!-- Ambience Slider -->
                            <div class="flex flex-col items-center gap-3 h-40">
                                <span
                                    class="text-[10px] font-bold text-slate-400 uppercase tracking-widest rotate-180"
                                    style="writing-mode: vertical-rl"
                                    >Ambiente</span
                                >
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={$audioStore.ambienceVolume}
                                    on:input={handleAmbienceVolumeChange}
                                    class="flex-1 w-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-colors
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(96,165,250,0.5)] [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-400 [&::-moz-range-thumb]:border-0"
                                    style="writing-mode: bt-lr; -webkit-appearance: slider-vertical;"
                                />
                                <div
                                    class="text-xs font-bold text-blue-400 tabular-nums w-8 text-center bg-blue-500/10 rounded px-1"
                                >
                                    {Math.round(
                                        $audioStore.ambienceVolume * 100,
                                    )}%
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}
