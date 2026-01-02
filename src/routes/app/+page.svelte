<script lang="ts">
    // @ts-nocheck
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import {
        audioStore,
        unlockAudio,
        playAlbum,
        togglePlayback,
        prevTrack,
        nextTrack,
    } from '$lib/audio/store';
    import { CATEGORY_LABELS, type AlbumCategory } from '$lib/data/albums';
    import { userStore } from '$lib/auth/userStore';
    import { userSubscription } from '$lib/subscription/userSubscription';
    import { playMoveSound } from '$lib/audio/sfx';

    import Visualizer from '$lib/components/Visualizer.svelte';
    import ChillBackground from '$lib/components/ChillBackground.svelte';
    import PaywallModal from '$lib/components/PaywallModal.svelte';
    import EyeIcon from '$lib/components/icons/EyeIcon.svelte';
    import BackIcon from '$lib/components/icons/BackIcon.svelte';
    import HeadphonesIcon from '$lib/components/icons/HeadphonesIcon.svelte';
    import SettingsIcon from '$lib/components/icons/SettingsIcon.svelte';
    import MusicIcon from '$lib/components/icons/MusicIcon.svelte';
    import Clock from '$lib/components/Clock.svelte';
    import WhiteNoiseControls from '$lib/components/WhiteNoiseControls.svelte';
    import { vibeStore } from '$lib/stores/vibeStore';
    import { timerStore } from '$lib/stores/timerStore';

    let showMusicExplorer = false;
    let showVibeStudio = false;
    let showPaywall = false;
    let showWhiteNoise = false; // NEW
    let vibeTab: 'scenes' | 'clock' = 'scenes'; // Tab state for modal
    let isUserLoaded = false;
    let currentTask = ''; // Added Task Input state

    // Immersive Mode Logic
    let immersiveMode = false;
    let uiVisible = true;
    let hideUiTimeout: any;

    function toggleImmersive() {
        const isPro = $userSubscription.tier === 'pro' || $userSubscription.profile?.isAdmin;

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
    // --- FOCUS TIMER LOGIC (Connected to Store) ---
    $: timeLeft = $timerStore.timeLeft;
    $: timerRunning = $timerStore.isRunning;
    $: timerMode = $timerStore.mode;
    $: focusDuration = $timerStore.duration;

    let timerInterval: any;

    function formatTime(seconds: number) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function setTimerMode(mode: 'focus' | 'short' | 'long') {
        stopTimer(false);
        timerStore.setMode(mode);
    }

    function toggleTimer() {
        if ($timerStore.isRunning) {
            stopTimer();
        } else {
            unlockAudio();
            startTimer();
        }
    }

    function startTimer() {
        if (!$timerStore.isRunning) {
            timerStore.toggle();
        }

        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if ($timerStore.timeLeft > 0) {
                timerStore.tick();
            } else {
                completeTimer();
            }
        }, 1000);
    }

    function stopTimer(updateStore = true) {
        clearInterval(timerInterval);
        if (updateStore) timerStore.stop();
    }

    function resetTimer() {
        stopTimer();
        timerStore.reset();
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
        timerMode = 'custom';
    }

    // Circular Progress
    $: progressCircle = ((focusDuration - timeLeft) / focusDuration) * 283;
    // --- END TIMER ---

    // Auth Check Logic
    $: if (!$userStore.loading) {
        if (!$userStore.user) {
            goto('/');
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
    let selectedCategory: AlbumCategory | 'all' = 'all';

    // Dynamic Albums from Store
    $: filteredAlbums =
        selectedCategory === 'all'
            ? $audioStore.availableAlbums
            : $audioStore.availableAlbums.filter((a) => a.category === selectedCategory);

    onDestroy(() => {
        stopTimer();
    });
    $: hideUI = immersiveMode && !uiVisible;
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
    <div class="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
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
            class="p-4 md:p-6 flex justify-between items-center animate-fade-in-down shrink-0 transition-opacity duration-700 ease-in-out z-50"
            class:opacity-0={hideUI}
            class:pointer-events-none={hideUI}
        >
            <a
                href="/"
                class="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity text-white p-2 -ml-2 group"
                title="Salir"
            >
                <BackIcon size="md" />
            </a>

            <div class="flex items-center gap-2">
                <!-- Immersive Toggle (PRO) -->
                <button
                    on:click={toggleImmersive}
                    class="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full px-3 py-2 border border-white/10 hover:border-white/20 shadow-lg transition-all group"
                    title="Modo Inmersivo (PRO)"
                >
                    <EyeIcon size="sm" open={!immersiveMode} gradient={immersiveMode} />
                </button>
            </div>

            <button
                on:click={toggleMusicExplorer}
                class="p-2 opacity-50 hover:opacity-100 transition-opacity text-white"
                title="Explorar Música"
            >
                <MusicIcon size="md" />
            </button>
        </header>

        <!-- CENTER: FOCUS TIMER (Flexible space) -->
        <main class="flex-1 flex flex-col items-center justify-center p-4 min-h-0 relative z-20">
            <!-- Timer Label Pill -->
            <!-- Task Input (Loggd Style) -->
            <div
                class="w-full max-w-2xl px-4 text-center mb-10 z-30 transition-opacity duration-700"
                class:opacity-0={hideUI}
            >
                <input
                    type="text"
                    bind:value={currentTask}
                    placeholder="¿En qué estás trabajando?"
                    class="w-full bg-transparent border-none text-center text-3xl md:text-5xl font-light text-white placeholder:text-white/20 hover:placeholder:text-white/40 focus:placeholder:text-white/50 focus:outline-none transition-all"
                />
            </div>

            <!-- Timer Container -->
            <div
                class="relative group flex items-center justify-center mb-12 {immersiveMode
                    ? 'scale-110'
                    : ''} transition-all duration-700"
            >
                <!-- Circular Progress SVG -->
                <!-- Circular Progress SVG (Ultra Thin) -->
                <svg
                    class="w-[320px] h-[320px] md:w-[480px] md:h-[480px] transform -rotate-90 text-white relative z-10"
                    viewBox="0 0 100 100"
                >
                    <!-- Track (Ultra subtle) -->
                    <circle
                        cx="50"
                        cy="50"
                        r="49"
                        fill="none"
                        stroke="white"
                        stroke-width="0.5"
                        class="opacity-20"
                    />
                    <!-- Indicator (Thin & Glowy) -->
                    <circle
                        cx="50"
                        cy="50"
                        r="49"
                        fill="none"
                        stroke="url(#gradient-timer)"
                        stroke-width="1"
                        stroke-dasharray="307.8"
                        stroke-dashoffset={((focusDuration - timeLeft) / focusDuration) * 307.8}
                        stroke-linecap="round"
                        class="filter drop-shadow-[0_0_15px_rgba(249,115,22,0.6)] transition-all duration-1000 ease-linear origin-center"
                    />
                    <defs>
                        <linearGradient id="gradient-timer" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#fff" />
                            <stop offset="100%" stop-color="#fff" />
                        </linearGradient>
                    </defs>
                </svg>

                <!-- Time Display -->
                <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div
                        class="font-poppins text-7xl md:text-9xl font-light tracking-tighter text-white/90 select-none tabular-nums drop-shadow-2xl"
                    >
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <!-- Controls (Ultra Minimal) -->
            <div
                class="flex items-center gap-6 md:gap-10 animate-fade-in-up transition-opacity duration-700 min-h-[60px]"
                class:opacity-0={hideUI}
                class:pointer-events-none={hideUI}
            >
                {#if !timerRunning && timeLeft === focusDuration}
                    <!-- Initial State: Play Button -->
                    <div class="flex flex-col items-center gap-8">
                        <button
                            on:click={startTimer}
                            class="group relative flex items-center justify-center"
                        >
                            <div
                                class="absolute inset-0 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500 scale-75 group-hover:scale-100"
                            ></div>
                            <span
                                class="relative text-3xl md:text-5xl font-light tracking-[0.2em] text-white group-hover:text-white transition-all uppercase opacity-80 group-hover:opacity-100"
                            >
                                Empezar
                            </span>
                        </button>

                        <!-- Discrete Presets -->
                        <div
                            class="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        >
                            {#each [5, 25, 45, 60] as min}
                                <button
                                    on:click={() => {
                                        timeLeft = min * 60;
                                        focusDuration = timeLeft;
                                    }}
                                    class="text-xs font-medium text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                                    class:text-white={focusDuration === min * 60}
                                    class:underline={focusDuration === min * 60}
                                >
                                    {min}m
                                </button>
                            {/each}
                        </div>
                    </div>
                {:else}
                    <!-- Active Session Controls (Icons Only) -->

                    <!-- Cancel -->
                    <button
                        on:click={resetTimer}
                        class="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/10 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105 backdrop-blur-sm"
                        title="Cancelar"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                d="M6 18L18 6M6 6l12 12"
                            /></svg
                        >
                    </button>

                    <!-- Pause / Resume (Main Action) -->
                    <button
                        on:click={toggleTimer}
                        class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white text-black hover:scale-110 transition-all flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                        {#if timerRunning}
                            <svg
                                class="w-6 h-6 md:w-8 md:h-8"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                ><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg
                            >
                        {:else}
                            <svg
                                class="w-6 h-6 md:w-8 md:h-8 ml-1"
                                fill="currentColor"
                                viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg
                            >
                        {/if}
                    </button>

                    <!-- Finish (Check) -->
                    <button
                        on:click={completeTimer}
                        class="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/10 hover:bg-green-500/20 hover:border-green-500/50 flex items-center justify-center text-slate-400 hover:text-green-400 transition-all hover:scale-105 backdrop-blur-sm"
                        title="Terminar"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                                d="M5 13l4 4L19 7"
                            /></svg
                        >
                    </button>
                {/if}
            </div>
        </main>

        <!-- BOTTOM: INTEGRATED PLAYER & VISUALIZER -->
        <div
            class="w-full flex flex-col items-center justify-end pb-8 transition-all duration-500 pointer-events-none hover:pointer-events-auto group/player"
            class:translate-y-20={hideUI}
            class:opacity-0={hideUI}
        >
            <!-- Player Controls (Floating - Minimal) -->
            <div
                class="bg-black/20 backdrop-blur-md border border-white/5 rounded-full px-4 py-2 flex items-center gap-4 shadow-xl mb-4 pointer-events-auto transform translate-y-4 group-hover/player:translate-y-0 transition-all hover:bg-black/40 hover:border-white/10 hover:scale-105"
            >
                <!-- Track Info (Desktop - Minimal) -->
                {#if $audioStore.isPlaying}
                    <div class="hidden md:flex flex-col items-end mr-2 text-right opacity-60">
                        <span class="text-[9px] uppercase font-bold tracking-widest leading-none">
                            {$audioStore.playlist[$audioStore.currentTrackIndex]?.title || 'Musica'}
                        </span>
                    </div>
                {/if}

                <!-- Controls -->
                <div class="flex items-center gap-2">
                    <button
                        on:click|stopPropagation={prevTrack}
                        class="text-white/50 hover:text-white transition-colors p-1.5"
                        aria-label="Anterior"
                    >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"
                            ><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg
                        >
                    </button>

                    <button
                        on:click|stopPropagation={togglePlayback}
                        class="w-8 h-8 bg-white/10 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center transition-all"
                        aria-label={$audioStore.isPlaying ? 'Pausar' : 'Reproducir'}
                    >
                        {#if $audioStore.isPlaying}
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"
                                ><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg
                            >
                        {:else}
                            <svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"
                                ><path d="M8 5v14l11-7z" /></svg
                            >
                        {/if}
                    </button>

                    <button
                        on:click|stopPropagation={nextTrack}
                        class="text-white/50 hover:text-white transition-colors p-1.5"
                        aria-label="Siguiente"
                    >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
                            ><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg
                        >
                    </button>

                    <!-- Divider -->
                    <div class="w-px h-4 bg-white/10 mx-1"></div>

                    <button
                        on:click|stopPropagation={() => {
                            showVibeStudio = true;
                        }}
                        class="text-white/50 hover:text-white transition-colors p-1.5"
                        title="Vibe Studio"
                    >
                        <SettingsIcon size="xs" />
                    </button>

                    <!-- Ambience Toggle (White Noise) -->
                    <button
                        on:click|stopPropagation={() => {
                            showWhiteNoise = true;
                        }}
                        class="text-white/50 hover:text-white transition-colors p-1.5"
                        title="Sonidos Ambientales"
                    >
                        <HeadphonesIcon size="xs" />
                    </button>

                    <!-- Volume Control -->
                    <div class="w-px h-4 bg-white/10 mx-1"></div>
                    <div class="flex items-center gap-2 group/vol" title="Volumen">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            bind:value={$audioStore.musicVolume}
                            on:click|stopPropagation
                            class="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 transition-all opacity-50 hover:opacity-100"
                        />
                    </div>
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

    <!-- White Noise Overlay -->
    {#if showWhiteNoise}
        <button
            class="absolute inset-0 z-[65] bg-black/80 backdrop-blur-xl animate-fade-in flex items-center justify-center p-4"
            on:click|self={() => (showWhiteNoise = false)}
            on:keydown={(e) => e.key === 'Escape' && (showWhiteNoise = false)}
        >
            <div
                class="bg-[#1e293b] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-fade-in-up"
            >
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-white">Ambiente</h2>
                    <button
                        on:click={() => (showWhiteNoise = false)}
                        class="p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <WhiteNoiseControls />
            </div>
        </button>
    {/if}

    <!-- Vibe Studio Overlay (Improved Responsiveness) -->
    {#if showVibeStudio}
        <div
            class="absolute inset-0 z-[70] bg-black/90 backdrop-blur-2xl animate-fade-in flex flex-col items-center justify-center p-4 md:p-8"
            role="dialog"
            aria-modal="true"
        >
            <!-- Close Backdrop -->
            <button
                class="absolute inset-0 w-full h-full cursor-default focus:outline-none"
                on:click={() => (showVibeStudio = false)}
                aria-label="Cerrar"
            ></button>

            <div
                class="relative bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
                <!-- Header -->
                <div
                    class="p-6 md:p-8 border-b border-white/5 flex justify-between items-start shrink-0 bg-[#0F172A]"
                >
                    <div>
                        <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">Vibe Studio</h2>
                        <p class="text-slate-400 text-sm">Diseña tu espacio ideal</p>
                    </div>
                    <button
                        on:click={() => (showVibeStudio = false)}
                        class="p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors text-white"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            /></svg
                        >
                    </button>
                </div>

                <!-- Tabs -->
                <div class="px-6 md:px-8 border-b border-white/5 bg-[#0F172A]/50 shrink-0">
                    <div class="flex gap-6">
                        <button
                            on:click={() => (vibeTab = 'scenes')}
                            class="py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors {vibeTab ===
                            'scenes'
                                ? 'border-primary-500 text-primary-400'
                                : 'border-transparent text-slate-500 hover:text-white'}"
                        >
                            🌆 Ambientes
                        </button>
                        <button
                            on:click={() => (vibeTab = 'clock')}
                            class="py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors {vibeTab ===
                            'clock'
                                ? 'border-primary-500 text-primary-400'
                                : 'border-transparent text-slate-500 hover:text-white'}"
                        >
                            🕰️ Reloj
                        </button>
                    </div>
                </div>

                <!-- Content (Scrollable) -->
                <div class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[#0B1120]">
                    {#if vibeTab === 'scenes'}
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {#each [{ id: 'none', label: 'Silencio Digital', icon: '🔇', desc: 'Sin efectos', pro: false }, { id: 'noir', label: 'Lluvia Nocturna', icon: '🌧️', desc: 'Lluvia suave y tonos oscuros', pro: false }, { id: 'library', label: 'Biblioteca', icon: '📚', desc: 'Ambiente académico', pro: false }, { id: 'zen', label: 'Jardín Zen', icon: '🎋', desc: 'Naturaleza y viento', pro: true }, { id: 'space', label: 'Cosmos', icon: '🌌', desc: 'Frecuencias espaciales', pro: true }, { id: 'cyber', label: 'Cyber Grid', icon: '👾', desc: 'Neón retro-futurista', pro: true }, { id: 'breathe', label: 'Modo Respiración', icon: '🧘', desc: 'Guía 4-7-8 pulsante', pro: true }] as vibe}
                                {@const isLocked = vibe.pro && $userSubscription.tier !== 'pro'}
                                <button
                                    on:click={() => {
                                        if (isLocked) {
                                            showPaywall = true;
                                        } else {
                                            vibeStore.setBackground(vibe.id);
                                            // Optional: Close on select? Maybe not, allow exploring.
                                        }
                                    }}
                                    class="relative p-4 rounded-xl border transition-all text-left flex items-center gap-4 group
                                    {$vibeStore.background === vibe.id
                                        ? 'bg-primary-500/10 border-primary-500 ring-1 ring-primary-500'
                                        : 'border-white/5 hover:border-white/20 hover:bg-white/5'}
                                    {isLocked ? 'opacity-60 grayscale' : ''}"
                                >
                                    <div
                                        class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-black/20 group-hover:scale-110 transition-transform"
                                    >
                                        {vibe.icon}
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-white text-sm">{vibe.label}</h3>
                                        <p class="text-xs text-slate-400">{vibe.desc}</p>
                                    </div>
                                    {#if isLocked}
                                        <div class="absolute top-2 right-2 text-xs">🔒</div>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    {:else if vibeTab === 'clock'}
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {#each [{ id: 'modern', label: 'Moderno', font: 'font-poppins', desc: 'Minimalista', pro: false }, { id: 'neon', label: 'Neon Cyber', font: 'font-mono text-primary-400 shadow-glow', desc: 'Hacker Style', pro: true }, { id: 'retro', label: 'Pixel Retro', font: 'font-mono', desc: '8-bit Clásico', pro: true }, { id: 'elegant', label: 'Editorial', font: 'font-serif italic', desc: 'Sofisticado', pro: true }, { id: 'analog', label: 'Analógico', font: 'text-2xl', desc: 'Atemporal', pro: true }] as style}
                                {@const isLocked = style.pro && $userSubscription.tier !== 'pro'}
                                <button
                                    on:click={() => {
                                        if (isLocked) {
                                            showPaywall = true;
                                        } else {
                                            vibeStore.setClockStyle(style.id);
                                        }
                                    }}
                                    class="relative p-6 rounded-xl border transition-all text-left flex flex-col gap-4 group
                                        {$vibeStore.clockStyle === style.id
                                        ? 'bg-primary-500/10 border-primary-500 ring-1 ring-primary-500'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}
                                        {isLocked ? 'opacity-60' : ''}"
                                >
                                    <div
                                        class="h-20 bg-black/30 rounded-lg flex items-center justify-center text-3xl text-white overflow-hidden group-hover:scale-[1.02] transition-transform"
                                    >
                                        {#if style.id === 'analog'}
                                            <div
                                                class="w-12 h-12 rounded-full border-2 border-white/80 relative"
                                            >
                                                <div
                                                    class="absolute inset-0 m-auto w-0.5 h-5 bg-white top-[10%] origin-bottom animate-[spin_4s_linear_infinite]"
                                                ></div>
                                                <div
                                                    class="absolute inset-0 m-auto w-0.5 h-3 bg-white top-[25%] origin-bottom animate-[spin_60s_linear_infinite]"
                                                ></div>
                                            </div>
                                        {:else}
                                            <span class={style.font}>12:00</span>
                                        {/if}
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <h3 class="font-bold text-white">{style.label}</h3>
                                            <p class="text-xs text-slate-400">{style.desc}</p>
                                        </div>
                                        {#if isLocked}<span>🔒</span>{/if}
                                    </div>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
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
    <PaywallModal show={showPaywall} blockedFeature="vibe" on:close={() => (showPaywall = false)} />
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
