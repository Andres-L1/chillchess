<script lang="ts">
    // @ts-nocheck
    import { onMount, onDestroy } from "svelte";
    import { fade } from "svelte/transition";
    import {
        gameStore,
        toggleAutoPlay,
        nextMove,
        prevMove,
        loadRandomLichessGame,
    } from "$lib/game/store";
    import {
        audioStore,
        setMusicVolume,
        setAmbienceVolume,
        unlockAudio,
        setVibe,
        type VibePreset,
    } from "$lib/audio/store";
    import StartOverlay from "$lib/components/StartOverlay.svelte";
    import AudioPlayer from "$lib/components/AudioPlayer.svelte";

    // @ts-ignore
    import { Input } from "cm-chessboard/src/cm-chessboard/Chessboard.js";

    let boardContainer: HTMLElement;
    let board: any;
    let showOverlay = true;

    function handleEnter() {
        showOverlay = false;
        unlockAudio();
    }

    function handleVibeChange(vibe: VibePreset) {
        setVibe(vibe);
    }

    // Reactive statement to update board when store FEN changes
    $: if (board && $gameStore.fen) {
        board.setPosition($gameStore.fen, true);
    }

    onMount(async () => {
        // @ts-ignore
        const { Chessboard, BORDER_TYPE } = (await import(
            "cm-chessboard/src/cm-chessboard/Chessboard.js"
        )) as any;

        board = new Chessboard(boardContainer, {
            position: $gameStore.fen,
            style: {
                cssClass: "default",
                showCoordinates: true,
                borderType: BORDER_TYPE.none,
            },
            responsive: true,
            animationDuration: 300,
            sprite: {
                url: "/assets/images/chessboard-sprite-staunton.svg",
            },
        });
    });

    onDestroy(() => {
        if (board) board.destroy();
    });
</script>

{#if showOverlay}
    <StartOverlay on:start={handleEnter} />
{/if}

<AudioPlayer />

<div
    class="h-full flex flex-col md:flex-row transition-opacity duration-1000"
    class:opacity-50={showOverlay}
>
    <!-- Main Stage: Board -->
    <div class="flex-1 flex items-center justify-center p-8 relative">
        <!-- Premium Board Container -->
        <div class="relative w-full max-w-[min(80vh,90vw)] aspect-square">
            <!-- Board Shadow/Glow -->
            <div
                class="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-tertiary-500/20 blur-3xl -z-10 scale-110"
            ></div>

            <!-- Board Frame -->
            <div
                class="glass-strong p-4 rounded-2xl shadow-2xl glow-gold h-full"
            >
                <div
                    bind:this={boardContainer}
                    class="w-full h-full board-container rounded-lg overflow-hidden"
                ></div>
            </div>
        </div>

        <!-- Floating Title -->
        <div class="absolute top-8 left-8">
            <h1
                class="text-5xl font-bold font-cinzel bg-clip-text text-transparent bg-gradient-to-r from-primary-300 via-primary-400 to-tertiary-400 drop-shadow-lg"
            >
                ChillChess
            </h1>
            <p class="text-sm text-surface-300 mt-1 font-light tracking-wide">
                Visual Sanctuary
            </p>
        </div>
    </div>

    <!-- Premium Sidebar -->
    <div
        class="w-full md:w-96 glass-strong border-l border-primary-500/10 p-8 flex flex-col gap-6 backdrop-blur-xl z-20 shadow-2xl"
    >
        <!-- Game Info Card -->
        <div
            class="glass p-6 rounded-xl space-y-3 border border-primary-500/20"
        >
            {#if $gameStore.isLoadingGame}
                <div class="animate-pulse space-y-2">
                    <div
                        class="h-4 bg-surface-600 rounded w-3/4 loading-shimmer"
                    ></div>
                    <div
                        class="h-3 bg-surface-600 rounded w-1/2 loading-shimmer"
                    ></div>
                </div>
            {:else}
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h2
                            class="text-lg font-bold text-primary-400 font-cinzel"
                        >
                            {$gameStore.currentGame.event}
                        </h2>
                        <p class="text-xs text-surface-400 mt-1">
                            {$gameStore.currentGame.description}
                        </p>
                    </div>
                    <span
                        class="text-xs px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full"
                        >{$gameStore.currentGame.date}</span
                    >
                </div>

                <div
                    class="flex items-center justify-between pt-3 border-t border-surface-700"
                >
                    <div class="text-center flex-1">
                        <p class="text-xs text-surface-500 mb-1">White</p>
                        <p class="text-sm font-semibold text-surface-200">
                            {$gameStore.currentGame.white}
                        </p>
                    </div>
                    <div class="text-primary-500 text-xl">⚔️</div>
                    <div class="text-center flex-1">
                        <p class="text-xs text-surface-500 mb-1">Black</p>
                        <p class="text-sm font-semibold text-surface-200">
                            {$gameStore.currentGame.black}
                        </p>
                    </div>
                </div>
            {/if}
        </div>

        <hr class="border-surface-700/50" />

        <!-- Atmosphere Selector -->
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <p
                    class="text-xs font-semibold text-primary-400 uppercase tracking-wider"
                >
                    Atmosphere
                </p>
                <span class="text-xs text-surface-500"
                    >{$audioStore.activeVibe}</span
                >
            </div>
            <div class="grid grid-cols-3 gap-2">
                <button
                    on:click={() => handleVibeChange("noir")}
                    class="btn-premium px-4 py-3 rounded-xl text-sm font-medium transition-all {$audioStore.activeVibe ===
                    'noir'
                        ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/50'
                        : 'glass hover:bg-surface-700/50 text-surface-300'}"
                >
                    <div class="text-xl mb-1">🌧️</div>
                    <div class="text-xs">Noir</div>
                </button>
                <button
                    on:click={() => handleVibeChange("library")}
                    class="btn-premium px-4 py-3 rounded-xl text-sm font-medium transition-all {$audioStore.activeVibe ===
                    'library'
                        ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/50'
                        : 'glass hover:bg-surface-700/50 text-surface-300'}"
                >
                    <div class="text-xl mb-1">📚</div>
                    <div class="text-xs">Library</div>
                </button>
                <button
                    on:click={() => handleVibeChange("zen")}
                    class="btn-premium px-4 py-3 rounded-xl text-sm font-medium transition-all {$audioStore.activeVibe ===
                    'zen'
                        ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/50'
                        : 'glass hover:bg-surface-700/50 text-surface-300'}"
                >
                    <div class="text-xl mb-1">🌸</div>
                    <div class="text-xs">Zen</div>
                </button>
            </div>
        </div>

        <hr class="border-surface-700/50" />

        <!-- Playback Controls -->
        <div class="space-y-3">
            <p
                class="text-xs font-semibold text-primary-400 uppercase tracking-wider"
            >
                Playback
            </p>
            <div class="flex justify-center gap-3">
                <button
                    on:click={prevMove}
                    class="btn-premium w-12 h-12 rounded-full glass hover:bg-surface-700/50 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95"
                    title="Previous Move"
                >
                    ⏮️
                </button>

                <button
                    on:click={toggleAutoPlay}
                    class="btn-premium w-16 h-16 rounded-full bg-primary-500 hover:bg-primary-400 flex items-center justify-center text-2xl shadow-lg shadow-primary-500/50 transition-all hover:scale-110 active:scale-95"
                    title={$gameStore.isPlaying ? "Pause" : "Play"}
                >
                    {#if $gameStore.isPlaying}
                        ⏸️
                    {:else}
                        ▶️
                    {/if}
                </button>

                <button
                    on:click={nextMove}
                    class="btn-premium w-12 h-12 rounded-full glass hover:bg-surface-700/50 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95"
                    title="Next Move"
                >
                    ⏭️
                </button>
            </div>
        </div>

        <!-- New Game Button -->
        <button
            on:click={loadRandomLichessGame}
            disabled={$gameStore.isLoadingGame}
            class="btn-premium w-full py-3 rounded-xl glass hover:bg-surface-700/50 text-sm font-medium text-surface-300 hover:text-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span class="mr-2">🔄</span>
            {$gameStore.isLoadingGame ? "Loading..." : "New Random Game"}
        </button>

        <hr class="border-surface-700/50" />

        <!-- Volume Controls -->
        <div class="space-y-5 mt-auto">
            <!-- Ambience -->
            <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-surface-400 flex items-center gap-2">
                        <span class="text-lg">🌧️</span>
                        Ambience
                    </span>
                    <span class="text-primary-400 font-mono text-xs"
                        >{Math.round($audioStore.ambienceVolume * 100)}%</span
                    >
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={$audioStore.ambienceVolume}
                    on:input={(e) =>
                        setAmbienceVolume(e.currentTarget.valueAsNumber)}
                    class="w-full"
                />
            </div>

            <!-- Music -->
            <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-surface-400 flex items-center gap-2">
                        <span class="text-lg">🎵</span>
                        Music
                    </span>
                    <span class="text-primary-400 font-mono text-xs"
                        >{Math.round($audioStore.musicVolume * 100)}%</span
                    >
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={$audioStore.musicVolume}
                    on:input={(e) =>
                        setMusicVolume(e.currentTarget.valueAsNumber)}
                    class="w-full"
                />
            </div>
        </div>
    </div>
</div>

<style>
    /* Premium Chess Board Styling */
    :global(.board-container) {
        /* Light squares - Warm cream/gold */
        --light-square-color: #e8d5b7;
        --dark-square-color: #2c2416;

        /* Piece colors */
        --piece-color-white: #ffffff;
        --piece-color-black: #1a1a1a;

        /* Highlight colors */
        --highlight-color: rgba(197, 160, 89, 0.5);
        --selected-color: rgba(0, 217, 255, 0.3);
    }

    /* Add subtle texture to board */
    :global(.board-container .square) {
        position: relative;
    }

    :global(.board-container .square::before) {
        content: "";
        position: absolute;
        inset: 0;
        background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.02) 2px,
            rgba(0, 0, 0, 0.02) 4px
        );
        pointer-events: none;
    }
</style>
