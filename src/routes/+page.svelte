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
            animationDuration: 400,
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
    <div class="flex-1 flex items-center justify-center p-12 relative">
        <!-- Premium Board Container -->
        <div class="relative w-full max-w-[min(75vh,85vw)] aspect-square">
            <!-- Warm Glow -->
            <div
                class="absolute inset-0 bg-gradient-to-br from-primary-400/30 via-secondary-400/20 to-tertiary-400/30 blur-3xl -z-10 scale-110 animate-pulse"
            ></div>

            <!-- Board Frame with Wood Texture -->
            <div
                class="glass-strong p-6 rounded-3xl shadow-2xl glow-warm h-full relative overflow-hidden"
            >
                <!-- Subtle wood grain overlay -->
                <div
                    class="absolute inset-0 opacity-5 pointer-events-none"
                    style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;100&quot; height=&quot;100&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cfilter id=&quot;noise&quot;%3E%3CfeTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.9&quot; numOctaves=&quot;4&quot; /%3E%3C/filter%3E%3Crect width=&quot;100&quot; height=&quot;100&quot; filter=&quot;url(%23noise)&quot; opacity=&quot;0.5&quot;/%3E%3C/svg%3E');"
                ></div>

                <div
                    bind:this={boardContainer}
                    class="w-full h-full board-container rounded-2xl overflow-hidden shadow-inner"
                ></div>
            </div>
        </div>

        <!-- Floating Title - Softer -->
        <div class="absolute top-12 left-12">
            <h1
                class="text-6xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-primary-300 via-secondary-300 to-primary-400 drop-shadow-2xl"
            >
                ChillChess
            </h1>
            <p
                class="text-base text-tertiary-200 mt-2 font-light tracking-widest"
            >
                visual sanctuary
            </p>
        </div>
    </div>

    <!-- Cozy Sidebar -->
    <div
        class="w-full md:w-[420px] glass-strong border-l border-primary-400/10 p-10 flex flex-col gap-8 backdrop-blur-2xl z-20 shadow-2xl"
    >
        <!-- Game Info Card - Warm & Cozy -->
        <div
            class="glass p-8 rounded-3xl space-y-4 border border-primary-400/15 glow-soft"
        >
            {#if $gameStore.isLoadingGame}
                <div class="animate-pulse space-y-3">
                    <div
                        class="h-5 bg-tertiary-700/30 rounded-2xl w-3/4 loading-shimmer"
                    ></div>
                    <div
                        class="h-4 bg-tertiary-700/30 rounded-2xl w-1/2 loading-shimmer"
                    ></div>
                </div>
            {:else}
                <div class="space-y-3">
                    <div class="flex items-start justify-between gap-3">
                        <h2
                            class="text-xl font-semibold text-primary-300 font-poppins leading-tight"
                        >
                            {$gameStore.currentGame.event}
                        </h2>
                        <span
                            class="text-xs px-3 py-1.5 bg-primary-500/20 text-primary-200 rounded-full whitespace-nowrap"
                            >{$gameStore.currentGame.date}</span
                        >
                    </div>
                    <p class="text-sm text-tertiary-300 font-light">
                        {$gameStore.currentGame.description}
                    </p>
                </div>

                <div
                    class="flex items-center justify-between pt-4 border-t border-tertiary-700/30"
                >
                    <div class="text-center flex-1">
                        <p
                            class="text-xs text-tertiary-400 mb-1.5 uppercase tracking-wide"
                        >
                            White
                        </p>
                        <p class="text-base font-medium text-tertiary-100">
                            {$gameStore.currentGame.white}
                        </p>
                    </div>
                    <div class="text-primary-400 text-2xl px-4">⚔️</div>
                    <div class="text-center flex-1">
                        <p
                            class="text-xs text-tertiary-400 mb-1.5 uppercase tracking-wide"
                        >
                            Black
                        </p>
                        <p class="text-base font-medium text-tertiary-100">
                            {$gameStore.currentGame.black}
                        </p>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Atmosphere Selector - Softer -->
        <div class="space-y-4">
            <div class="flex items-center justify-between px-1">
                <p
                    class="text-sm font-medium text-primary-300 uppercase tracking-widest"
                >
                    Atmosphere
                </p>
                <span class="text-xs text-tertiary-400 capitalize"
                    >{$audioStore.activeVibe}</span
                >
            </div>
            <div class="grid grid-cols-3 gap-3">
                <button
                    on:click={() => handleVibeChange("noir")}
                    class="btn-premium px-5 py-5 rounded-2xl text-sm font-medium transition-all {$audioStore.activeVibe ===
                    'noir'
                        ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-xl glow-warm'
                        : 'glass hover:glass-strong text-tertiary-300'}"
                >
                    <div class="text-3xl mb-2">🌧️</div>
                    <div class="text-xs font-light">Noir</div>
                </button>
                <button
                    on:click={() => handleVibeChange("library")}
                    class="btn-premium px-5 py-5 rounded-2xl text-sm font-medium transition-all {$audioStore.activeVibe ===
                    'library'
                        ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-xl glow-warm'
                        : 'glass hover:glass-strong text-tertiary-300'}"
                >
                    <div class="text-3xl mb-2">📚</div>
                    <div class="text-xs font-light">Library</div>
                </button>
                <button
                    on:click={() => handleVibeChange("zen")}
                    class="btn-premium px-5 py-5 rounded-2xl text-sm font-medium transition-all {$audioStore.activeVibe ===
                    'zen'
                        ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-xl glow-warm'
                        : 'glass hover:glass-strong text-tertiary-300'}"
                >
                    <div class="text-3xl mb-2">🌸</div>
                    <div class="text-xs font-light">Zen</div>
                </button>
            </div>
        </div>

        <!-- Playback Controls - Larger & Softer -->
        <div class="space-y-4">
            <p
                class="text-sm font-medium text-primary-300 uppercase tracking-widest px-1"
            >
                Playback
            </p>
            <div class="flex justify-center items-center gap-4">
                <button
                    on:click={prevMove}
                    class="btn-premium w-14 h-14 rounded-2xl glass hover:glass-strong flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 text-tertiary-200"
                    title="Previous Move"
                >
                    ⏮️
                </button>

                <button
                    on:click={toggleAutoPlay}
                    class="btn-premium w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 flex items-center justify-center text-3xl shadow-2xl transition-all hover:scale-110 active:scale-95 {$gameStore.isPlaying
                        ? 'animate-breathe'
                        : ''}"
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
                    class="btn-premium w-14 h-14 rounded-2xl glass hover:glass-strong flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 text-tertiary-200"
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
            class="btn-premium w-full py-4 rounded-2xl glass hover:glass-strong text-base font-light text-tertiary-200 hover:text-primary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span class="mr-2 text-xl">🔄</span>
            {$gameStore.isLoadingGame
                ? "Loading new game..."
                : "New Random Game"}
        </button>

        <!-- Volume Controls - Softer -->
        <div class="space-y-6 mt-auto pt-6 border-t border-tertiary-700/20">
            <!-- Ambience -->
            <div class="space-y-3">
                <div class="flex items-center justify-between text-sm px-1">
                    <span
                        class="text-tertiary-300 flex items-center gap-2 font-light"
                    >
                        <span class="text-xl">🌧️</span>
                        Ambience
                    </span>
                    <span
                        class="text-primary-400 font-mono text-sm tabular-nums"
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
            <div class="space-y-3">
                <div class="flex items-center justify-between text-sm px-1">
                    <span
                        class="text-tertiary-300 flex items-center gap-2 font-light"
                    >
                        <span class="text-xl">🎵</span>
                        Music
                    </span>
                    <span
                        class="text-primary-400 font-mono text-sm tabular-nums"
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
    /* Warm, Visible Chess Board */
    :global(.board-container) {
        /* Light squares - Warm cream */
        --light-square-color: #f5e6d3;
        /* Dark squares - Warm chocolate brown (VISIBLE!) */
        --dark-square-color: #8b6f47;

        /* Piece colors with better contrast */
        --piece-color-white: #ffffff;
        --piece-color-black: #2a1f1a;

        /* Warm highlight colors */
        --highlight-color: rgba(255, 158, 109, 0.5);
        --selected-color: rgba(255, 107, 157, 0.4);
    }

    /* Subtle wood texture on squares */
    :global(.board-container .square) {
        position: relative;
    }

    :global(.board-container .square::before) {
        content: "";
        position: absolute;
        inset: 0;
        background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 3px,
            rgba(139, 99, 71, 0.03) 3px,
            rgba(139, 99, 71, 0.03) 6px
        );
        pointer-events: none;
    }

    /* Coordinates styling */
    :global(.board-container .coordinates) {
        color: #d4b896;
        font-size: 0.7rem;
        font-weight: 300;
        opacity: 0.6;
    }
</style>
