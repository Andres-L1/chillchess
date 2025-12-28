<script lang="ts">
    // @ts-nocheck
    import { onMount, onDestroy } from "svelte";
    import { goto } from "$app/navigation";
    import { audioStore, unlockAudio, playAlbum } from "$lib/audio/store";
    import { CATEGORY_LABELS, type AlbumCategory } from "$lib/data/albums";
    import { userStore } from "$lib/auth/userStore";
    import { userSubscription } from "$lib/subscription/userSubscription";
    import { playMoveSound } from "$lib/audio/sfx";

    import Visualizer from "$lib/components/Visualizer.svelte";
    import ChillBackground from "$lib/components/ChillBackground.svelte";
    import PaywallModal from "$lib/components/PaywallModal.svelte";

    let showMusicExplorer = false;
    let showVibeStudio = false;
    let showPaywall = false;
    let isUserLoaded = false;

    // --- FOCUS TIMER LOGIC ---
    let timerRunning = false;
    let focusDuration = 25 * 60; // 25 min default
    let timeLeft = focusDuration;
    let timerInterval: any;
    let timerMode: "focus" | "short" | "long" | "custom" = "focus";

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
            // Ensure audio is unlocked on first interaction
            unlockAudio();
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
        // Reset to default of current mode
        if (timerMode === "focus") focusDuration = 25 * 60;
        if (timerMode === "short") focusDuration = 5 * 60;
        if (timerMode === "long") focusDuration = 15 * 60;
        // If custom, keep current focusDuration as base
        timeLeft = focusDuration;
    }

    function completeTimer() {
        stopTimer();
        playMoveSound(true);
        setTimeout(() => playMoveSound(true), 500);
        setTimeout(() => playMoveSound(true), 1000);
    }

    // Circular Progress
    $: progressCircle = ((focusDuration - timeLeft) / focusDuration) * 283;
    // --- END TIMER ---

    // Auth Check Logic
    $: if (!$userStore.loading) {
        if (!$userStore.user) {
            goto("/");
        } else {
            isUserLoaded = true;
        }
    }

    function toggleMusicExplorer() {
        showMusicExplorer = !showMusicExplorer;
    }

    function playAlbumAndClose(albumId: string) {
        playAlbum(albumId);
        showMusicExplorer = false;
    }

    // Auto-load categories
    let selectedCategory: AlbumCategory | "all" = "all";

    // Dynamic Albums from Store
    $: filteredAlbums =
        selectedCategory === "all"
            ? $audioStore.availableAlbums
            : $audioStore.availableAlbums.filter(
                  (a) => a.category === selectedCategory,
              );

    onDestroy(() => {
        stopTimer();
    });
</script>

<!-- Main Container: Zen Studio -->
<div
    class="relative w-screen h-[100dvh] bg-[#0B1120] overflow-hidden flex flex-col text-white font-poppins selection:bg-purple-500/30"
>
    <!-- BACKGROUND LAYER (Chill Lo-Fi Scene) -->
    <div
        class="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden"
    >
        <ChillBackground />
        <!-- Vignette Overlay -->
        <div
            class="absolute inset-0 bg-radial-gradient from-transparent via-[#0B1120]/40 to-[#0B1120]/80 pointer-events-none"
        ></div>
    </div>

    <!-- UI LAYER -->
    <div class="relative z-10 w-full h-full flex flex-col overflow-hidden">
        <!-- Navbar (Fixed height) -->
        <header
            class="p-4 md:p-6 flex justify-between items-center animate-fade-in-down shrink-0"
        >
            <a
                href="/"
                class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity z-50 text-white"
            >
                <span class="text-xl">←</span>
                <span class="text-sm font-medium">Salir</span>
            </a>

            <button
                on:click={() => (showVibeStudio = !showVibeStudio)}
                class="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 hover:border-white/20 shadow-lg transition-all group"
            >
                <span
                    class="w-2 h-2 rounded-full bg-orange-400 group-hover:scale-125 transition-transform"
                ></span>
                <span
                    class="text-xs font-bold text-slate-300 group-hover:text-white font-mono tracking-wider uppercase"
                >
                    Vibe Studio
                </span>
            </button>

            <button
                on:click={toggleMusicExplorer}
                class="p-2 opacity-50 hover:opacity-100 transition-opacity z-50 text-white"
            >
                <span class="text-xl">🎵</span>
            </button>
        </header>

        <!-- CENTER: FOCUS TIMER (Flexible space) -->
        <main
            class="flex-1 flex flex-col items-center justify-evenly p-4 min-h-0"
        >
            <!-- Timer Container -->
            <div class="relative group flex items-center justify-center">
                <!-- Circular Progress SVG (Responsive to Height & Width) -->
                <svg
                    class="w-auto h-auto max-w-[80vw] max-h-[40vh] md:max-h-[50vh] aspect-square transform -rotate-90 drop-shadow-2xl text-white"
                    viewBox="0 0 100 100"
                >
                    <!-- Track -->
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        class="text-white/5"
                    />
                    <!-- Indicator -->
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-dasharray="283"
                        stroke-dashoffset={progressCircle}
                        stroke-linecap="round"
                        class="text-white filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-1000 ease-linear"
                        class:text-green-400={timerRunning}
                    />
                </svg>

                <!-- Time Display/Input (Centered) -->
                <div
                    class="absolute inset-0 flex flex-col items-center justify-center z-10"
                >
                    {#if !timerRunning}
                        <div
                            class="flex items-baseline justify-center relative group/input"
                        >
                            <input
                                type="number"
                                min="1"
                                max="180"
                                value={Math.floor(timeLeft / 60)}
                                on:input={(e) => {
                                    const val = parseInt(e.currentTarget.value);
                                    if (val > 0 && val <= 180) {
                                        timeLeft = val * 60;
                                        focusDuration = timeLeft;
                                        timerMode = "custom";
                                    }
                                }}
                                class="font-mono text-5xl md:text-8xl font-light tracking-tighter text-white bg-transparent text-center w-[1.5em] focus:outline-none focus:border-b-2 focus:border-white/20 appearance-none m-0 p-0 selection:bg-white/20 hover:scale-105 transition-transform cursor-pointer"
                            />
                            <span
                                class="text-2xl text-slate-500 font-medium absolute -right-6 top-2 md:top-8 md:-right-8 opacity-0 group-hover/input:opacity-100 transition-opacity"
                                >m</span
                            >
                            <div
                                class="absolute -bottom-6 text-xs text-slate-500 opacity-0 group-hover/input:opacity-100 transition-opacity whitespace-nowrap"
                            >
                                Click para editar
                            </div>
                        </div>
                    {:else}
                        <div
                            class="font-mono text-5xl md:text-8xl font-light tracking-tighter text-white drop-shadow-lg tabular-nums select-none"
                        >
                            {formatTime(timeLeft)}
                        </div>
                        <div
                            class="text-slate-400 text-sm tracking-[0.2em] mt-2 md:mt-4 uppercase opacity-60 font-medium animate-pulse"
                        >
                            ENFOQUE
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Controls (Flexible positioning) -->
            <div
                class="flex flex-col items-center gap-6 md:gap-8 animate-fade-in-up w-full max-w-md"
            >
                <!-- Main Action -->
                <button
                    on:click={toggleTimer}
                    class="group relative px-8 py-4 md:px-10 md:py-5 bg-white text-black rounded-full font-bold tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] active:scale-95 flex items-center gap-3 z-50 text-sm md:text-base border border-transparent hover:border-white/50 w-full md:w-auto justify-center"
                >
                    {#if timerRunning}
                        <span>PAUSAR</span>
                    {:else if timeLeft < focusDuration && timeLeft > 0}
                        <span>REANUDAR</span>
                    {:else}
                        <span>INICIAR</span>
                    {/if}
                </button>

                <!-- Secondary Actions -->
                <div
                    class="flex items-center justify-center gap-2 md:gap-3 z-50 bg-black/20 backdrop-blur-sm p-1.5 md:p-2 rounded-2xl border border-white/5 w-auto max-w-full overflow-x-auto no-scrollbar"
                >
                    <button
                        on:click={() => setTimerMode("focus")}
                        class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap {timerMode ===
                        'focus'
                            ? 'bg-white text-black shadow-lg'
                            : 'text-slate-500 hover:text-white hover:bg-white/5'}"
                    >
                        25m
                    </button>
                    <button
                        on:click={() => setTimerMode("short")}
                        class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap {timerMode ===
                        'short'
                            ? 'bg-white text-black shadow-lg'
                            : 'text-slate-500 hover:text-white hover:bg-white/5'}"
                    >
                        5m
                    </button>
                    <button
                        on:click={() => setTimerMode("long")}
                        class="px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap {timerMode ===
                        'long'
                            ? 'bg-white text-black shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}"
                    >
                        15m
                    </button>

                    <div class="w-px h-6 bg-white/10 mx-1 shrink-0"></div>

                    <button
                        on:click={resetTimer}
                        class="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10 shrink-0"
                        title="Reiniciar"
                    >
                        <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            ></path></svg
                        >
                    </button>
                </div>
            </div>
        </main>

        <!-- BOTTOM: VISUALIZER (Subtle) -->
        <div
            class="h-24 w-full flex items-end justify-center pb-4 opacity-20 hover:opacity-100 transition-opacity"
        >
            <Visualizer />
        </div>
    </div>

    <!-- Music Explorer Overlay -->
    {#if showMusicExplorer}
        <div
            class="absolute inset-0 z-[60] bg-black/80 backdrop-blur-xl animate-fade-in flex flex-col p-4 md:p-8 overflow-hidden"
        >
            <div class="flex justify-between items-center mb-8 shrink-0">
                <h2 class="text-3xl font-bold text-white">Biblioteca</h2>
                <div
                    class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end"
                >
                    <!-- Categories (Scrollable Layout) -->
                    <div
                        class="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar max-w-[200px] md:max-w-none"
                    >
                        {#each CATEGORY_LABELS as cat}
                            <button
                                on:click={() => (selectedCategory = cat.id)}
                                class="px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 {selectedCategory ===
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
                        class="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors shrink-0"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 overflow-y-auto pb-24 md:pb-20"
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

    <!-- Vibe Studio Overlay -->
    {#if showVibeStudio}
        <button
            class="absolute inset-0 z-[70] bg-black/80 backdrop-blur-xl animate-fade-in flex flex-col p-4 md:p-8 overflow-hidden text-left cursor-default w-full border-none outline-none appearance-none"
            on:click|self={() => (showVibeStudio = false)}
            on:keydown={(e) => e.key === "Escape" && (showVibeStudio = false)}
            tabindex="0"
        >
            <div class="max-w-4xl mx-auto w-full h-full flex flex-col">
                <div class="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h2 class="text-3xl font-bold text-white mb-1">
                            Vibe Studio
                        </h2>
                        <p class="text-slate-400 text-sm">
                            Personaliza tu atmósfera de concentración
                        </p>
                    </div>
                    <button
                        on:click={() => (showVibeStudio = false)}
                        class="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors shrink-0"
                    >
                        ✕
                    </button>
                </div>

                <div
                    class="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto"
                >
                    <!-- Example Vibes (Hardcoded mainly for UI demo, should link to actual logic) -->
                    {#each [{ id: "none", label: "Silencio Digital", icon: "🔇", desc: "Sin efectos de fondo", pro: false }, { id: "noir", label: "Lluvia Nocturna", icon: "🌧️", desc: "Sonido de lluvia suave y tonos oscuros", pro: false }, { id: "library", label: "Biblioteca", icon: "📚", desc: "Ambiente académico y texturas de papel", pro: false }, { id: "zen", label: "Jardín Zen", icon: "🎋", desc: "Naturaleza y sonidos de viento", pro: true }, { id: "space", label: "Cosmos", icon: "🌌", desc: "Frecuencias espaciales y vacío", pro: true }] as vibe}
                        {@const isLocked =
                            vibe.pro &&
                            $userSubscription.tier !== "pro" &&
                            $userSubscription.tier !== "premium"}
                        <button
                            on:click={() => {
                                if (isLocked) {
                                    showPaywall = true;
                                } else {
                                    // Logic to set vibe background
                                    // For now just console log or minor implementation
                                    console.log("Setting vibe:", vibe.id);
                                    // Ideally call a store function here
                                    showVibeStudio = false;
                                }
                            }}
                            class="relative p-6 rounded-2xl border transition-all text-left flex items-start gap-4 group {isLocked
                                ? 'bg-white/5 border-white/5 opacity-70 hover:opacity-100 cursor-not-allowed'
                                : 'bg-[#1e293b]/50 border-white/10 hover:bg-[#1e293b] hover:border-orange-500/50 cursor-pointer'}"
                        >
                            <div
                                class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl {isLocked
                                    ? 'bg-white/5 grayscale'
                                    : 'bg-white/10 group-hover:bg-orange-500/20'}"
                            >
                                {vibe.icon}
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <h3 class="font-bold text-white text-lg">
                                        {vibe.label}
                                    </h3>
                                    {#if isLocked}
                                        <span
                                            class="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-orange-500/20"
                                            >PRO</span
                                        >
                                    {/if}
                                </div>
                                <p
                                    class="text-sm text-slate-400 leading-relaxed"
                                >
                                    {vibe.desc}
                                </p>
                            </div>
                            {#if isLocked}
                                <div
                                    class="absolute top-4 right-4 text-slate-500"
                                >
                                    🔒
                                </div>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        </button>
    {/if}

    <!-- Paywall Modal -->
    <PaywallModal
        show={showPaywall}
        blockedFeature="vibe"
        on:close={() => (showPaywall = false)}
    />
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

    /* Remove input arrows */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    input[type="number"] {
        -moz-appearance: textfield;
        appearance: textfield;
    }
</style>
