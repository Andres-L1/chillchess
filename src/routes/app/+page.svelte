<script lang="ts">
    // @ts-nocheck
    import { onMount, onDestroy } from "svelte";
    import { goto } from "$app/navigation";
    import {
        gameStore,
        toggleAutoPlay,
        nextMove,
        prevMove,
        loadRandomLichessGame,
    } from "$lib/game/store";
    import {
        audioStore,
        unlockAudio,
        setVibe,
        playAlbum,
    } from "$lib/audio/store";
    import {
        ALBUMS,
        type Album,
        CATEGORY_LABELS,
        type AlbumCategory,
    } from "$lib/data/albums";
    import { userStore } from "$lib/auth/userStore";
    import { playMoveSound } from "$lib/audio/sfx";

    import StartOverlay from "$lib/components/StartOverlay.svelte";
    import Visualizer from "$lib/components/Visualizer.svelte";

    let boardContainer: HTMLElement;
    let board: any;
    let showOverlay = true;
    let showMusicExplorer = false;
    let isUserLoaded = false;
    let audioContextUnlocked = false;

    // --- FOCUS TIMER LOGIC ---
    let timerRunning = false;
    let focusDuration = 25 * 60; // 25 min default
    let timeLeft = focusDuration;
    let timerInterval: any;
    let timerMode: "focus" | "short" | "long" = "focus";

    function formatTime(seconds: number) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }

    function setTimerMode(mode: "focus" | "short" | "long") {
        stopTimer();
        timerMode = mode;
        if (mode === "focus") focusDuration = 25 * 60;
        if (mode === "short") focusDuration = 5 * 60;
        if (mode === "long") focusDuration = 15 * 60;
        timeLeft = focusDuration;
    }

    function toggleTimer() {
        if (timerRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    }

    function startTimer() {
        if (timeLeft <= 0) timeLeft = focusDuration; // Reset if finished
        timerRunning = true;
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
            } else {
                completeTimer();
            }
        }, 1000);
    }

    function stopTimer() {
        timerRunning = false;
        clearInterval(timerInterval);
    }

    function resetTimer() {
        stopTimer();
        timeLeft = focusDuration;
    }

    function completeTimer() {
        stopTimer();
        // Play nice sound 3 times
        playMoveSound(true);
        setTimeout(() => playMoveSound(true), 500);
        setTimeout(() => playMoveSound(true), 1000);
    }

    // Circular Progress
    $: progressCircle = ((focusDuration - timeLeft) / focusDuration) * 283; // 283 is approx circumference of r=45
    // --- END TIMER ---

    // Auth Check Logic
    $: if (!$userStore.loading) {
        if (!$userStore.user) {
            goto("/");
        } else {
            isUserLoaded = true;
        }
    }

    function handleEnter() {
        showOverlay = false;
        audioContextUnlocked = true;
        unlockAudio();
        // Start passive auto-play for background ambience if desired
        // We leave it manual or static for now to be less distracting
    }

    function toggleMusicExplorer() {
        showMusicExplorer = !showMusicExplorer;
    }

    function playAlbumAndClose(albumId: string) {
        playAlbum(albumId);
        showMusicExplorer = false;
    }

    // Sync board (if it exists)
    $: if (board && $gameStore.fen) {
        board.setPosition($gameStore.fen, true);
    }

    // Auto-load categories
    let selectedCategory: AlbumCategory | "all" = "all";
    $: filteredAlbums =
        selectedCategory === "all"
            ? ALBUMS
            : ALBUMS.filter((a) => a.category === selectedCategory);

    onMount(async () => {
        const { Chessboard, BORDER_TYPE } = (await import(
            "cm-chessboard/src/cm-chessboard/Chessboard.js"
        )) as any;

        board = new Chessboard(boardContainer, {
            position: $gameStore.fen,
            style: {
                cssClass: "default",
                showCoordinates: false, // Cleaner for background
                borderType: BORDER_TYPE.none,
            },
            responsive: true,
            animationDuration: 800, // Slow enjoyable movement
            sprite: {
                url: "/assets/images/chessboard-sprite-staunton.svg", // Ensure this path is correct or default
            },
        });

        // Auto load a random game for background if empty
        if ($gameStore.history.length === 0) {
            loadRandomLichessGame();
        }
    });

    onDestroy(() => {
        if (board) board.destroy();
        stopTimer();
    });
</script>

{#if showOverlay}
    <StartOverlay on:start={handleEnter} />
{/if}

<!-- Main Container: Zen Studio -->
<div
    class="relative w-screen h-screen bg-[#0B1120] overflow-hidden flex flex-col text-white font-poppins selection:bg-purple-500/30"
>
    <!-- BACKGROUND LAYER (Blurred Chessboard) -->
    <div
        class="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
    >
        <div
            bind:this={boardContainer}
            class="w-full h-full opacity-30 transform scale-110 transition-all duration-1000 ease-in-out filter blur-sm brightness-75 grayscale-[0.3]"
            class:blur-md={!timerRunning}
            class:blur-lg={timerRunning}
            class:scale-125={timerRunning}
        ></div>
        <!-- Vignette -->
        <div
            class="absolute inset-0 bg-radial-gradient from-transparent via-[#0B1120]/60 to-[#0B1120] pointer-events-none"
        ></div>
    </div>

    <!-- UI LAYER -->
    <div class="relative z-10 w-full h-full flex flex-col">
        <!-- Navbar -->
        <header
            class="p-6 flex justify-between items-center animate-fade-in-down"
        >
            <a
                href="/"
                class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity z-50"
            >
                <span class="text-xl">←</span>
                <span class="text-sm font-medium">Salir</span>
            </a>

            <div
                class="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg"
            >
                <div
                    class="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                ></div>
                <span class="text-xs text-slate-300 font-mono tracking-wider"
                    >ZEN MODE</span
                >
            </div>

            <button
                on:click={toggleMusicExplorer}
                class="p-2 opacity-50 hover:opacity-100 transition-opacity z-50"
            >
                <span class="text-xl">🎵</span>
            </button>
        </header>

        <!-- CENTER: FOCUS TIMER -->
        <main class="flex-1 flex flex-col items-center justify-center p-4">
            <div class="relative group">
                <!-- Circular Progress SVG -->
                <!-- r=45, cx=50, cy=50, circumference ~283 -->
                <svg
                    class="w-72 h-72 md:w-96 md:h-96 transform -rotate-90 drop-shadow-2xl"
                    viewBox="0 0 100 100"
                >
                    <!-- Track -->
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        class="text-white/5"
                    />
                    <!-- Indicator -->
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-dasharray="283"
                        stroke-dashoffset={progressCircle}
                        stroke-linecap="round"
                        class="text-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-linear"
                    />
                </svg>

                <!-- Time Display (Centered) -->
                <div
                    class="absolute inset-0 flex flex-col items-center justify-center"
                >
                    <div
                        class="font-mono text-6xl md:text-8xl font-light tracking-tighter text-white drop-shadow-lg tabular-nums select-none"
                    >
                        {formatTime(timeLeft)}
                    </div>
                    <div
                        class="text-slate-400 text-sm tracking-[0.2em] mt-2 uppercase opacity-60 font-medium"
                    >
                        {timerRunning ? "Enfocado" : "Listo"}
                    </div>
                </div>
            </div>

            <!-- Controls -->
            <div
                class="mt-12 flex flex-col items-center gap-6 animate-fade-in-up"
            >
                <!-- Main Action -->
                <button
                    on:click={toggleTimer}
                    class="group relative px-10 py-4 bg-white text-black rounded-full font-bold tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 flex items-center gap-3 z-50"
                >
                    {#if timerRunning}
                        <span>⏸ PAUSAR</span>
                    {:else if timeLeft < focusDuration && timeLeft > 0}
                        <span>▶ REANUDAR</span>
                    {:else}
                        <span>▶ INICIAR</span>
                    {/if}
                </button>

                <!-- Secondary Actions -->
                <div class="flex items-center gap-4 z-50">
                    <button
                        on:click={() => setTimerMode("focus")}
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-all {timerMode ===
                        'focus'
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}"
                    >
                        25m
                    </button>
                    <button
                        on:click={() => setTimerMode("short")}
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-all {timerMode ===
                        'short'
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}"
                    >
                        5m
                    </button>
                    <button
                        on:click={() => setTimerMode("long")}
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-all {timerMode ===
                        'long'
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}"
                    >
                        15m
                    </button>
                    <button
                        on:click={resetTimer}
                        class="p-2 text-slate-600 hover:text-red-400 transition-colors ml-2"
                        title="Reset"
                    >
                        ↺
                    </button>
                </div>
            </div>
        </main>

        <!-- BOTTOM: VISUALIZER (Subtle) -->
        <div
            class="h-24 w-full flex items-end justify-center pb-4 opacity-30 hover:opacity-100 transition-opacity"
        >
            <Visualizer />
        </div>
    </div>

    <!-- Music Explorer Overlay -->
    {#if showMusicExplorer}
        <div
            class="absolute inset-0 z-[60] bg-black/80 backdrop-blur-xl animate-fade-in flex flex-col p-8 overflow-hidden"
        >
            <div class="flex justify-between items-center mb-8 shrink-0">
                <h2 class="text-3xl font-bold text-white">Biblioteca</h2>
                <div class="flex items-center gap-4">
                    <!-- Categories -->
                    <div class="hidden md:flex gap-2">
                        {#each CATEGORY_LABELS as cat}
                            <button
                                on:click={() => (selectedCategory = cat.id)}
                                class="px-3 py-1 rounded-full text-xs font-medium transition-all {selectedCategory ===
                                cat.id
                                    ? 'bg-white text-black'
                                    : 'bg-white/10 text-slate-400 hover:text-white'}"
                            >
                                {cat.label}
                            </button>
                        {/each}
                    </div>

                    <button
                        on:click={toggleMusicExplorer}
                        class="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div
                class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-y-auto pb-20"
            >
                {#each filteredAlbums as album}
                    <button
                        on:click={() => playAlbumAndClose(album.id)}
                        class="group text-left p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                    >
                        <div
                            class="w-full aspect-square rounded-lg mb-4 bg-slate-800 bg-cover bg-center shadow-lg group-hover:scale-105 transition-transform relative overflow-hidden"
                            style="background-image: url('{album.cover}')"
                        >
                            {#if $audioStore.currentAlbumId === album.id && $audioStore.isPlaying}
                                <div
                                    class="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"
                                >
                                    <div class="flex gap-1 items-end h-8">
                                        <div
                                            class="w-1 bg-white animate-[bounce_1s_infinite] h-4"
                                        ></div>
                                        <div
                                            class="w-1 bg-white animate-[bounce_1.2s_infinite] h-8"
                                        ></div>
                                        <div
                                            class="w-1 bg-white animate-[bounce_0.8s_infinite] h-6"
                                        ></div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                        <h3
                            class="font-bold truncate text-white group-hover:text-purple-400 transition-colors"
                        >
                            {album.title}
                        </h3>
                        <p class="text-xs text-slate-400 truncate">
                            {album.artist}
                        </p>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    /* Custom utility like bg-radial-gradient */
    .bg-radial-gradient {
        background-image: radial-gradient(
            circle at center,
            var(--tw-gradient-from),
            var(--tw-gradient-via),
            var(--tw-gradient-to)
        );
    }
</style>
