<script lang="ts">
    // @ts-nocheck
    import { onMount, onDestroy } from "svelte";
    import { goto } from "$app/navigation";
    import {
        audioStore,
        unlockAudio,
        playAlbum,
        togglePlayback,
        prevTrack,
        nextTrack,
    } from "$lib/audio/store";
    import { CATEGORY_LABELS, type AlbumCategory } from "$lib/data/albums";
    import { userStore } from "$lib/auth/userStore";
    import { userSubscription } from "$lib/subscription/userSubscription";
    import { playMoveSound } from "$lib/audio/sfx";

    import Visualizer from "$lib/components/Visualizer.svelte";
    import ChillBackground from "$lib/components/ChillBackground.svelte";
    import PaywallModal from "$lib/components/PaywallModal.svelte";
    import EyeIcon from "$lib/components/icons/EyeIcon.svelte";
    import Clock from "$lib/components/Clock.svelte";
    import { vibeStore } from "$lib/stores/vibeStore";

    let showMusicExplorer = false;
    let showVibeStudio = false;
    let showPaywall = false;
    let vibeTab: "scenes" | "clock" = "scenes"; // Tab state for modal
    let isUserLoaded = false;

    // Immersive Mode Logic
    let immersiveMode = false;
    let uiVisible = true;
    let hideUiTimeout: any;

    function toggleImmersive() {
        const isPro =
            $userSubscription.tier === "pro" ||
            $userSubscription.profile?.isAdmin;

        if (!isPro) {
            showPaywall = true;
            return;
        }

        immersiveMode = !immersiveMode;
        if (immersiveMode) {
            resetInactivityTimer();
        } else {
            uiVisible = true;
            if (hideUiTimeout) clearTimeout(hideUiTimeout);
        }
    }

    function handleActivity() {
        if (!immersiveMode) return;
        uiVisible = true;
        resetInactivityTimer();
    }

    function resetInactivityTimer() {
        if (hideUiTimeout) clearTimeout(hideUiTimeout);
        hideUiTimeout = setTimeout(() => {
            if (immersiveMode) uiVisible = false;
        }, 3000);
    }

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

    function adjustTime(minutes: number) {
        if (timerRunning) return;
        let newTime = timeLeft + minutes * 60;
        if (newTime < 60) newTime = 60; // Min 1 min
        if (newTime > 180 * 60) newTime = 180 * 60; // Max 180 min
        timeLeft = newTime;
        focusDuration = timeLeft;
        timerMode = "custom";
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

<svelte:window
    on:mousemove={handleActivity}
    on:click={handleActivity}
    on:keydown={handleActivity}
/>

<!-- Main Container: Zen Studio -->
<div
    class="relative w-screen h-[100dvh] bg-[#0B1120] overflow-hidden flex flex-col text-white font-poppins selection:bg-primary-500/30"
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
    <!-- UI LAYER -->
    <div
        class="relative z-10 w-full h-full flex flex-col overflow-hidden transition-opacity duration-700 ease-in-out {immersiveMode &&
        !uiVisible
            ? 'opacity-0 cursor-none'
            : 'opacity-100'}"
    >
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

            <!-- Immersive Toggle (PRO) -->
            <button
                on:click={toggleImmersive}
                class="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full px-3 py-2 border border-white/10 hover:border-white/20 shadow-lg transition-all group ml-2"
                title="Modo Inmersivo (PRO)"
            >
                <EyeIcon
                    size="md"
                    open={!immersiveMode}
                    gradient={immersiveMode}
                />
                {#if immersiveMode}
                    <span
                        class="text-xs font-bold text-orange-400 font-mono tracking-wider ml-1"
                        >ON</span
                    >
                {/if}
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
                        class="text-white filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-1000 ease-linear origin-center"
                        class:text-green-400={timerRunning}
                        class:animate-breathe={timerRunning}
                    />
                </svg>

                <!-- Time Display/Input (Centered) -->
                <div
                    class="absolute inset-0 flex flex-col items-center justify-center z-10"
                >
                    {#if !timerRunning}
                        <div
                            class="flex items-center justify-center relative group/input gap-4"
                        >
                            <button
                                on:click={() => adjustTime(-5)}
                                class="text-slate-500 hover:text-white transition-colors p-2 opacity-0 group-hover/input:opacity-100"
                                aria-label="- 5 minutos"
                            >
                                <svg
                                    class="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    ><path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M20 12H4"
                                    /></svg
                                >
                            </button>

                            <div class="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="180"
                                    value={Math.floor(timeLeft / 60)}
                                    on:input={(e) => {
                                        const val = parseInt(
                                            e.currentTarget.value,
                                        );
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
                            </div>

                            <button
                                on:click={() => adjustTime(5)}
                                class="text-slate-500 hover:text-white transition-colors p-2 opacity-0 group-hover/input:opacity-100"
                                aria-label="+ 5 minutos"
                            >
                                <svg
                                    class="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    ><path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M12 4v16m8-8H4"
                                    /></svg
                                >
                            </button>

                            <div
                                class="absolute -bottom-6 text-xs text-slate-500 opacity-0 group-hover/input:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                            >
                                Click para editar o usa +/-
                            </div>
                        </div>
                    {:else}
                        <Clock {timeLeft} isTimerRunning={timerRunning} />
                    {/if}

                    {#if !timerRunning}
                        <div
                            class="text-slate-400 text-sm tracking-[0.2em] mt-2 md:mt-4 uppercase opacity-60 font-medium"
                        >
                            ENFOQUE
                        </div>
                    {:else}
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

        <!-- BOTTOM: INTEGRATED PLAYER & VISUALIZER -->
        <div
            class="w-full flex flex-col items-center justify-end pb-8 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none hover:pointer-events-auto group/player"
            class:opacity-100={!immersiveMode || uiVisible}
        >
            <!-- Player Controls (Floating) -->
            <div
                class="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl mb-4 pointer-events-auto transform translate-y-4 group-hover/player:translate-y-0 transition-transform"
            >
                <!-- Track Info (Desktop) -->
                <div class="hidden md:flex flex-col items-end mr-2 text-right">
                    <span
                        class="text-[10px] uppercase text-slate-400 font-bold tracking-widest leading-none mb-1"
                        >Ahora Suena</span
                    >
                    <span
                        class="text-xs text-white font-bold truncate max-w-[150px] leading-none"
                    >
                        {$audioStore.playlist[$audioStore.currentTrackIndex]
                            ?.title || "ChillChess"}
                    </span>
                </div>

                <!-- Controls -->
                <div class="flex items-center gap-4">
                    <button
                        on:click|stopPropagation={prevTrack}
                        class="text-slate-400 hover:text-white transition-colors p-1"
                        aria-label="Anterior"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            ><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg
                        >
                    </button>

                    <button
                        on:click|stopPropagation={togglePlayback}
                        class="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-white/10"
                        aria-label={$audioStore.isPlaying
                            ? "Pausar"
                            : "Reproducir"}
                    >
                        {#if $audioStore.isPlaying}
                            <svg
                                class="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                                /></svg
                            >
                        {:else}
                            <svg
                                class="w-5 h-5 ml-0.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                ><path d="M8 5v14l11-7z" /></svg
                            >
                        {/if}
                    </button>

                    <button
                        on:click|stopPropagation={nextTrack}
                        class="text-slate-400 hover:text-white transition-colors p-1"
                        aria-label="Siguiente"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"
                            /></svg
                        >
                    </button>
                </div>
            </div>

            <!-- Visualizer (Behind/Below) -->
            <div class="h-12 w-full flex items-end justify-center opacity-40">
                <Visualizer />
            </div>
        </div>
    </div>

    <!-- Music Explorer Overlay -->
    {#if showMusicExplorer}
        <div
            class="absolute inset-0 z-[60] bg-black/80 backdrop-blur-xl animate-fade-in flex flex-col p-4 md:p-8 overflow-hidden"
        >
            <div class="flex justify-between items-center mb-8 shrink-0">
                <h2 class="text-3xl font-bold text-slate-100">Biblioteca</h2>
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
                            class="font-bold truncate text-white group-hover:text-primary-400 transition-colors"
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
                <div class="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h2 class="text-3xl font-bold text-slate-100 mb-1">
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

                <!-- TABS -->
                <div class="flex gap-4 mb-6 border-b border-white/10 pb-1">
                    <button
                        on:click={() => (vibeTab = "scenes")}
                        class="px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 {vibeTab ===
                        'scenes'
                            ? 'border-primary-500 text-white'
                            : 'border-transparent text-slate-500 hover:text-white'}"
                    >
                        🌆 Ambientes
                    </button>
                    <button
                        on:click={() => (vibeTab = "clock")}
                        class="px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 {vibeTab ===
                        'clock'
                            ? 'border-primary-500 text-white'
                            : 'border-transparent text-slate-500 hover:text-white'}"
                    >
                        🕰️ Reloj
                    </button>
                </div>

                <!-- CONTENT -->
                <div class="overflow-y-auto flex-1 pr-2">
                    {#if vibeTab === "scenes"}
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Existing Scenes Logic -->
                            {#each [{ id: "none", label: "Silencio Digital", icon: "🔇", desc: "Sin efectos de fondo", pro: false }, { id: "noir", label: "Lluvia Nocturna", icon: "🌧️", desc: "Sonido de lluvia suave y tonos oscuros", pro: false }, { id: "library", label: "Biblioteca", icon: "📚", desc: "Ambiente académico y texturas de papel", pro: false }, { id: "zen", label: "Jardín Zen", icon: "🎋", desc: "Naturaleza y sonidos de viento", pro: true }, { id: "space", label: "Cosmos", icon: "🌌", desc: "Frecuencias espaciales y vacío", pro: true }, { id: "cyber", label: "Cyber Grid", icon: "👾", desc: "Rejilla de neón retro-futurista", pro: true }, { id: "breathe", label: "Modo Respiración", icon: "🧘", desc: "Fondo pulsante para guiado 4-7-8", pro: true }] as vibe}
                                {@const isLocked =
                                    vibe.pro &&
                                    $userSubscription.tier !== "pro"}
                                <button
                                    on:click={() => {
                                        if (isLocked) {
                                            showPaywall = true;
                                        } else {
                                            vibeStore.setBackground(vibe.id);
                                            showVibeStudio = false;
                                        }
                                    }}
                                    class="relative p-5 rounded-2xl border transition-all text-left flex items-center gap-4 group {isLocked
                                        ? 'bg-white/5 border-white/5 opacity-70 hover:opacity-100 cursor-not-allowed'
                                        : 'bg-[#1e293b]/50 border-white/10 hover:bg-[#1e293b] hover:border-orange-500/50 cursor-pointer'}"
                                >
                                    <div
                                        class="w-10 h-10 rounded-lg flex items-center justify-center text-xl {isLocked
                                            ? 'bg-white/5 grayscale'
                                            : 'bg-white/10 group-hover:bg-orange-500/20'}"
                                    >
                                        {vibe.icon}
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2">
                                            <h3
                                                class="font-bold text-slate-200 text-sm"
                                            >
                                                {vibe.label}
                                            </h3>
                                            {#if isLocked}
                                                <span
                                                    class="text-[9px] bg-orange-500/20 text-orange-400 px-1 py-0.5 rounded font-bold uppercase tracking-wider border border-orange-500/20"
                                                    >PRO</span
                                                >
                                            {/if}
                                        </div>
                                        <p
                                            class="text-xs text-slate-400 mt-0.5"
                                        >
                                            {vibe.desc}
                                        </p>
                                    </div>
                                    {#if isLocked}
                                        <div class="text-slate-500">🔒</div>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    {:else if vibeTab === "clock"}
                        <div class="space-y-6">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {#each [{ id: "modern", label: "Moderno", font: "font-poppins", desc: "Limpio y minimalista", pro: false }, { id: "neon", label: "Neon Cyber", font: "font-mono text-primary-400 shadow-glow", desc: "Estilo hacker brillante", pro: true }, { id: "retro", label: "Pixel Retro", font: "font-mono", desc: "Estilo 8-bit clásico", pro: true }, { id: "elegant", label: "Editorial", font: "font-serif italic", desc: "Sofisticado y clásico", pro: true }, { id: "analog", label: "Analógico", font: "text-2xl", desc: "Clásico y atemporal", pro: true }] as style}
                                    {@const isLocked =
                                        style.pro &&
                                        $userSubscription.tier !== "pro"}
                                    <button
                                        on:click={() => {
                                            if (isLocked) {
                                                showPaywall = true;
                                            } else {
                                                vibeStore.setClockStyle(
                                                    style.id,
                                                );
                                            }
                                        }}
                                        class="group relative p-4 rounded-xl border transition-all text-left flex flex-col gap-3
                                            {$vibeStore.clockStyle === style.id
                                            ? 'bg-primary-500/10 border-primary-500'
                                            : isLocked
                                              ? 'bg-white/5 border-white/5 opacity-70'
                                              : 'bg-[#1e293b]/50 border-white/10 hover:border-white/30'}"
                                    >
                                        <!-- Preview -->
                                        <div
                                            class="h-16 flex items-center justify-center bg-black/20 rounded-lg text-2xl text-white"
                                        >
                                            {#if style.id === "analog"}
                                                <svg
                                                    viewBox="0 0 100 100"
                                                    class="w-10 h-10 text-white opacity-80"
                                                >
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="45"
                                                        stroke="currentColor"
                                                        stroke-width="4"
                                                        fill="none"
                                                    />
                                                    <line
                                                        x1="50"
                                                        y1="50"
                                                        x2="50"
                                                        y2="25"
                                                        stroke="currentColor"
                                                        stroke-width="4"
                                                        stroke-linecap="round"
                                                    />
                                                    <line
                                                        x1="50"
                                                        y1="50"
                                                        x2="70"
                                                        y2="50"
                                                        stroke="currentColor"
                                                        stroke-width="3"
                                                        stroke-linecap="round"
                                                    />
                                                </svg>
                                            {:else}
                                                <span
                                                    class="{style.font} {style.id ===
                                                    'neon'
                                                        ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]'
                                                        : ''} {style.id ===
                                                    'retro'
                                                        ? 'font-bold'
                                                        : ''}"
                                                >
                                                    12:45
                                                </span>
                                            {/if}
                                        </div>

                                        <div
                                            class="flex justify-between items-end"
                                        >
                                            <div>
                                                <h3
                                                    class="font-bold text-white text-sm flex items-center gap-2"
                                                >
                                                    {style.label}
                                                    {#if isLocked}
                                                        <span
                                                            class="text-[9px] bg-orange-500/20 text-orange-400 px-1 py-0.5 rounded font-bold uppercase tracking-wider"
                                                            >PRO</span
                                                        >
                                                    {/if}
                                                </h3>
                                                <p
                                                    class="text-xs text-slate-400 mt-0.5"
                                                >
                                                    {style.desc}
                                                </p>
                                            </div>

                                            {#if $vibeStore.clockStyle === style.id}
                                                <div class="text-primary-400">
                                                    <svg
                                                        class="w-5 h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        ><path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M5 13l4 4L19 7"
                                                        ></path></svg
                                                    >
                                                </div>
                                            {:else if isLocked}
                                                <div class="text-slate-500">
                                                    🔒
                                                </div>
                                            {/if}
                                        </div>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </button>
    {/if}

    <!-- Immersive Education Toast -->
    {#if immersiveMode && uiVisible}
        <div
            class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs text-slate-400 pointer-events-none animate-fade-in"
        >
            Modo Inmersivo activo. Mueve el mouse para ver controles.
        </div>
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

    @keyframes breathe {
        0%,
        100% {
            transform: scale(1);
            opacity: 0.8;
        }
        50% {
            transform: scale(1.03);
            opacity: 1;
        }
    }
    .animate-breathe {
        animation: breathe 4s ease-in-out infinite;
        transform-origin: center;
    }
</style>
