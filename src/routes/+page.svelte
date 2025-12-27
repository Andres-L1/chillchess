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
                showCoordinates: false,
                borderType: BORDER_TYPE.thin,
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
    <div class="flex-1 flex items-center justify-center p-4 relative">
        <div
            class="glass p-1 rounded-lg shadow-2xl glow-cyan w-full max-w-[80vh] aspect-square"
        >
            <div
                bind:this={boardContainer}
                class="w-full h-full board-container"
            ></div>
        </div>

        <!-- Ambient Overlay Title -->
        <h1
            class="absolute top-8 left-8 text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400 opacity-90"
        >
            ChillChess
        </h1>
    </div>

    <!-- Sidebar Controls -->
    <div
        class="w-full md:w-80 glass border-l border-surface-500/30 p-6 flex flex-col gap-6 backdrop-blur-xl z-20"
    >
        <!-- Game Info -->
        <div class="text-center space-y-2">
            {#if $gameStore.isLoadingGame}
                <div class="animate-pulse">
                    <p class="text-sm opacity-70">Loading new game...</p>
                </div>
            {:else}
                <h2 class="h2 font-bold text-primary-500">
                    {$gameStore.currentGame.event}
                </h2>
                <div class="flex flex-col gap-1">
                    <p class="text-sm font-semibold">
                        {$gameStore.currentGame.white}
                    </p>
                    <p class="text-xs opacity-50">vs</p>
                    <p class="text-sm font-semibold">
                        {$gameStore.currentGame.black}
                    </p>
                </div>
                <p class="text-xs opacity-50 mt-2">
                    {$gameStore.currentGame.date} • {$gameStore.currentGame
                        .description}
                </p>
            {/if}
        </div>

        <hr class="opacity-20" />

        <!-- Vibe Selector -->
        <div class="space-y-3">
            <p
                class="text-xs font-semibold opacity-70 uppercase tracking-wider"
            >
                Atmosphere
            </p>
            <div class="grid grid-cols-3 gap-2">
                <button
                    on:click={() => handleVibeChange("noir")}
                    class="btn btn-sm {$audioStore.activeVibe === 'noir'
                        ? 'variant-filled-primary'
                        : 'variant-soft-surface'} transition-all"
                >
                    🌧️ Noir
                </button>
                <button
                    on:click={() => handleVibeChange("library")}
                    class="btn btn-sm {$audioStore.activeVibe === 'library'
                        ? 'variant-filled-primary'
                        : 'variant-soft-surface'} transition-all"
                >
                    📚 Library
                </button>
                <button
                    on:click={() => handleVibeChange("zen")}
                    class="btn btn-sm {$audioStore.activeVibe === 'zen'
                        ? 'variant-filled-primary'
                        : 'variant-soft-surface'} transition-all"
                >
                    🌸 Zen
                </button>
            </div>
        </div>

        <hr class="opacity-20" />

        <!-- Playback Controls -->
        <div class="flex justify-center gap-4 text-2xl">
            <button
                class="btn-icon variant-soft-surface hover:variant-filled-surface transition-all"
                on:click={prevMove}
                title="Previous Move"
            >
                ⏮️
            </button>

            <button
                class="btn-icon variant-filled-primary shadow-lg scale-110 hover:scale-125 transition-all"
                on:click={toggleAutoPlay}
                title={$gameStore.isPlaying ? "Pause" : "Play"}
            >
                {#if $gameStore.isPlaying}
                    ⏸️
                {:else}
                    ▶️
                {/if}
            </button>

            <button
                class="btn-icon variant-soft-surface hover:variant-filled-surface transition-all"
                on:click={nextMove}
                title="Next Move"
            >
                ⏭️
            </button>
        </div>

        <!-- New Game Button -->
        <button
            on:click={loadRandomLichessGame}
            class="btn variant-ghost-surface text-sm"
            disabled={$gameStore.isLoadingGame}
        >
            🔄 New Random Game
        </button>

        <!-- Volume Controls -->
        <div class="space-y-6 mt-auto">
            <!-- Ambience Control -->
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span>🌧️ Ambience</span>
                    <span class="opacity-50"
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
                    class="w-full h-1 bg-surface-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <!-- Music Control -->
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span>🎵 Music</span>
                    <span class="opacity-50"
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
                    class="w-full h-1 bg-surface-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    </div>
</div>

<style>
    /* Custom Board Styling Overrides for 'Noir' feel */
    :global(.board-container) {
        --color-white: #c5a059; /* Gold/Wood Light */
        --color-black: #1a1f35; /* Dark Navy */
        --color-highlight: rgba(0, 217, 255, 0.4);
    }
</style>
