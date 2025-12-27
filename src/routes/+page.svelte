<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Chess } from "chess.js";
    // @ts-ignore
    import { Input } from "cm-chessboard/src/cm-chessboard/Chessboard.js";

    let boardContainer: HTMLElement;
    let board: any; // cm-chessboard instance
    let game = new Chess();

    onMount(async () => {
        // Dynamic import with direct path to bypass resolution issues
        // @ts-ignore
        const { Chessboard, BORDER_TYPE } = (await import(
            "cm-chessboard/src/cm-chessboard/Chessboard.js"
        )) as any;

        // Initialize board
        board = new Chessboard(boardContainer, {
            position: game.fen(),
            style: {
                cssClass: "default", // We will override with custom CSS
                showCoordinates: false, // Zen mode by default
                borderType: BORDER_TYPE.thin,
            },
            responsive: true,
            animationDuration: 300,
            sprite: {
                url: "/assets/images/chessboard-sprite-staunton.svg", // We need to ensure this asset exists or use default
            },
        });

        // Use default sprite if custom one fails/isn't there yet,
        // actually cm-chessboard needs SVGs. For now, let's use the default path logic or check docs.
        // cm-chessboard usually ships with sprites in its dist folder.
        // We'll point to the node_modules one via a copy script or public asset.
        // For MVP, if we don't copy the sprite, it will fail to load pieces.

        // FIX: We need to copy the sprite to static folder.
        // I will add a task to do this. For now let's reference standard location assuming we copy it.
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
        <div class="text-center space-y-2">
            <h2 class="h2 font-bold text-primary-500">The Immortal Game</h2>
            <p class="text-sm opacity-70">Anderssen vs. Kieseritzky (1851)</p>
        </div>

        <hr class="opacity-20" />

        <!-- Playback Controls (Mockup) -->
        <div class="flex justify-center gap-4 text-2xl">
            <button class="btn-icon variant-soft-surface">⏮️</button>
            <button class="btn-icon variant-filled-primary shadow-lg scale-110"
                >⏸️</button
            >
            <button class="btn-icon variant-soft-surface">⏭️</button>
        </div>

        <!-- Volume / Vibe Controls -->
        <div class="space-y-4 mt-auto">
            <div class="flex justify-between text-sm">
                <span>Rainy Cafe</span>
                <span class="opacity-50">On</span>
            </div>
            <input type="range" value="50" class="w-full" />
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
