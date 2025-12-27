<script lang="ts">
    // @ts-nocheck
    import { onMount, onDestroy } from "svelte";
    import {
        gameStore,
        toggleAutoPlay,
        nextMove,
        prevMove,
        resetGamePosition,
    } from "$lib/game/store";
    // @ts-ignore
    import { Input } from "cm-chessboard/src/cm-chessboard/Chessboard.js";

    let boardContainer: HTMLElement;
    let board: any; // cm-chessboard instance

    // Reactive statement to update board when store FEN changes
    $: if (board && $gameStore.fen) {
        // Stop any previous animation? cm-chessboard handles it.
        // We use 'true' for animation.
        // Check if we are resetting (move index -1) to avoid backward animation if needed,
        // but setPosition handles it intelligently usually.
        board.setPosition($gameStore.fen, true);
    }

    onMount(async () => {
        // Dynamic import with direct path
        // @ts-ignore
        const { Chessboard, BORDER_TYPE } = (await import(
            "cm-chessboard/src/cm-chessboard/Chessboard.js"
        )) as any;

        // Initialize board
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

<div class="h-full flex flex-col md:flex-row">
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

    <!-- Sidebar Controls (Collapsible) -->
    <div
        class="w-full md:w-80 glass border-l border-surface-500/30 p-6 flex flex-col gap-6 backdrop-blur-xl z-20"
    >
        <!-- Game Info -->
        <div class="text-center space-y-2">
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

        <!-- Volume / Vibe Controls -->
        <div class="space-y-4 mt-auto">
            <div class="flex justify-between text-sm">
                <span>Rainy Cafe</span>
                <span class="opacity-50">Coming Phase 3</span>
            </div>
            <input
                type="range"
                value="50"
                class="w-full h-1 bg-surface-600 rounded-lg appearance-none cursor-not-allowed opacity-50"
                disabled
            />
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
