<script lang="ts">
    // @ts-nocheck
    import { onMount, onDestroy } from "svelte";
    import { gameStore, toggleAutoPlay, nextMove, prevMove, loadRandomLichessGame } from "$lib/game/store";
    import { audioStore, setMusicVolume, setAmbienceVolume, unlockAudio, setVibe, type VibePreset } from "$lib/audio/store";
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

    $: if (board && $gameStore.fen) {
        board.setPosition($gameStore.fen, true);
    }

    onMount(async () => {
        // @ts-ignore
        const { Chessboard, BORDER_TYPE } = await import("cm-chessboard/src/cm-chessboard/Chessboard.js") as any;

        board = new Chessboard(boardContainer, {
            position: $gameStore.fen,
            style: {
                // High Contrast Colors (Lichess/Chess.com standard style)
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

<!-- Layout Principal: 3 Columnas (Info - Tablero - Controles) para Desktop, Stacked para Móvil -->
<div class="h-full w-full relative flex flex-col md:flex-row items-center justify-between p-4 md:p-8 gap-6 transition-opacity duration-700" class:opacity-0={showOverlay}>
    
    <!-- 1. LEFT: Game Info (Minimalist) -->
    <div class="w-full md:w-80 flex flex-col gap-4 order-2 md:order-1 pointer-events-none md:pointer-events-auto">
        <div class="glass-panel p-6 rounded-2xl relative overflow-hidden group">
             <!-- Status Indicator -->
            <div class="absolute top-0 left-0 w-1 h-full bg-primary-500 transition-all duration-500" class:opacity-100={$gameStore.isPlaying} class:opacity-30={!$gameStore.isPlaying}></div>

            <div class="space-y-1">
                <h2 class="text-2xl font-poppins font-bold text-white leading-tight">{$gameStore.currentGame.event}</h2>
                <p class="text-sm text-white/60">{$gameStore.currentGame.date} • {$gameStore.currentGame.description}</p>
            </div>
            
            <div class="mt-6 flex flex-col gap-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-white"></div>
                        <span class="text-lg font-medium text-white/90">{$gameStore.currentGame.white}</span>
                    </div>
                </div>
                <div class="w-full h-px bg-white/10"></div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-black border border-white/20"></div>
                        <span class="text-lg font-medium text-white/90">{$gameStore.currentGame.black}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Vibe Mini-Selector -->
        <div class="glass-panel p-2 rounded-xl flex justify-between items-center pointer-events-auto">
            <button on:click={() => setVibe('noir')} class="flex-1 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex flex-col items-center gap-1 opacity-70 hover:opacity-100" class:opacity-100={$audioStore.activeVibe === 'noir'} class:bg-white-10={$audioStore.activeVibe === 'noir'}>
                <span>🌧️</span>
                <span class="text-[0.65rem] uppercase tracking-wider">Noir</span>
            </button>
            <button on:click={() => setVibe('library')} class="flex-1 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex flex-col items-center gap-1 opacity-70 hover:opacity-100" class:opacity-100={$audioStore.activeVibe === 'library'}>
                <span>📚</span>
                <span class="text-[0.65rem] uppercase tracking-wider">Library</span>
            </button>
            <button on:click={() => setVibe('zen')} class="flex-1 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex flex-col items-center gap-1 opacity-70 hover:opacity-100" class:opacity-100={$audioStore.activeVibe === 'zen'}>
                <span>🌸</span>
                <span class="text-[0.65rem] uppercase tracking-wider">Zen</span>
            </button>
        </div>
    </div>

    <!-- 2. CENTER: The Board (HERO) -->
    <div class="flex-1 h-full max-h-[85vh] aspect-square flex items-center justify-center order-1 md:order-2 z-10 w-full">
        <div class="relative w-full h-full max-w-[85vh] shadow-2xl rounded-sm overflow-hidden border-4 border-[#302E2B]">
            <div bind:this={boardContainer} class="w-full h-full board-container"></div>
        </div>
    </div>

    <!-- 3. RIGHT: Controls (Modern Player Style) -->
    <div class="w-full md:w-80 flex flex-col justify-end gap-6 order-3 pointer-events-auto h-full">
        
        <!-- Logo Top Right (Desktop Only) -->
        <div class="hidden md:flex flex-col items-end mb-auto pt-4 opacity-50">
            <h1 class="text-3xl font-poppins font-bold tracking-tight">ChillChess</h1>
            <span class="text-xs uppercase tracking-[0.2em]">Visual Sanctuary</span>
        </div>

        <!-- Main Controls Panel -->
        <div class="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <!-- Playback -->
            <div class="flex items-center justify-center gap-6">
                <button on:click={prevMove} class="p-3 text-2xl text-white/50 hover:text-white transition-colors hover:scale-110 active:scale-95">⏮️</button>
                
                <button on:click={toggleAutoPlay} class="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center text-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                    {#if $gameStore.isPlaying}
                        ⏸️
                    {:else}
                        ▶️
                    {/if}
                </button>
                
                <button on:click={nextMove} class="p-3 text-2xl text-white/50 hover:text-white transition-colors hover:scale-110 active:scale-95">⏭️</button>
            </div>

            <!-- New Game -->
            <button on:click={loadRandomLichessGame} disabled={$gameStore.isLoadingGame} class="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition-all flex items-center justify-center gap-2">
                <span>🔄</span>
                {$gameStore.isLoadingGame ? 'Loading...' : 'Random Game'}
            </button>

            <!-- Audio Mixers (Clean) -->
            <div class="space-y-4 pt-4 border-t border-white/5">
                <div class="space-y-2 group">
                    <div class="flex justify-between text-xs text-white/40 group-hover:text-white/70 transition-colors">
                        <span>Ambience</span>
                        <span>{Math.round($audioStore.ambienceVolume * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={$audioStore.ambienceVolume} on:input={(e) => setAmbienceVolume(e.currentTarget.valueAsNumber)} />
                </div>
                <div class="space-y-2 group">
                    <div class="flex justify-between text-xs text-white/40 group-hover:text-white/70 transition-colors">
                        <span>Music</span>
                        <span>{Math.round($audioStore.musicVolume * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={$audioStore.musicVolume} on:input={(e) => setMusicVolume(e.currentTarget.valueAsNumber)} />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* CSS Puro para el tablero - Colores Lichess Standard (Warm) */
    :global(.board-container) {
        background-color: #302E2B; /* Deep background to prevent gaps showing white */
    }
    
    /* Squares */
    :global(.board-container .board .square.white) {
        background-color: #EAD8C0 !important; /* Cream warm */
    }
    :global(.board-container .board .square.black) {
        background-color: #A77B56 !important; /* Warm light brown */
    }

    /* Remove previous noisy texture if any remains */
    :global(.board-container .square::before) {
        display: none !important;
    }

    /* Notation */
    :global(.board-container .coordinates) {
        fill: #A77B56; /* Match dark square for internal, or contrast for external. cm-chessboard usually handles this but we can force styles if needed */
        font-weight: 500;
        font-family: 'Poppins', sans-serif;
    }
</style>
