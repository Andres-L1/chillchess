<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { onMount, onDestroy } from 'svelte';
    import { Play, Pause, RotateCcw, Coffee, Focus, Zap, Settings, X } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { browser } from '$app/environment';

    pageHeader.set({
        title: 'Pomodoro Timer',
        description: 'Enfócate con la técnica Pomodoro.',
        category: 'Productividad',
    });

    type Mode = 'focus' | 'short' | 'long';

    // ---- Custom durations (minutes) ----
    let focusMins = 25;
    let shortMins = 5;
    let longMins = 15;
    let showSettings = false;

    $: DURATIONS = {
        focus: focusMins * 60,
        short: shortMins * 60,
        long: longMins * 60,
    } as Record<Mode, number>;

    // ---- Persistence ----
    onMount(() => {
        if (!browser) return;
        try {
            const saved = localStorage.getItem('pomodoro_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                completedPomodoros = parsed.completedPomodoros ?? 0;
                focusMins = parsed.focusMins ?? 25;
                shortMins = parsed.shortMins ?? 5;
                longMins = parsed.longMins ?? 15;
            }
        } catch {}

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        timeLeft = DURATIONS[currentMode];
    });

    function persistState() {
        if (!browser) return;
        localStorage.setItem(
            'pomodoro_state',
            JSON.stringify({ completedPomodoros, focusMins, shortMins, longMins })
        );
    }

    // ---- Timer state ----
    let currentMode: Mode = 'focus';
    let timeLeft = 25 * 60;
    let isRunning = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    let completedPomodoros = 0;

    $: progress = 1 - timeLeft / DURATIONS[currentMode];
    $: minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    $: seconds = String(timeLeft % 60).padStart(2, '0');

    // Keep page title in sync
    $: if (browser) {
        document.title = isRunning
            ? `${minutes}:${seconds} — Pomodoro | ChillChess`
            : 'Pomodoro Timer | ChillChess';
    }

    function setMode(mode: Mode) {
        currentMode = mode;
        timeLeft = DURATIONS[mode];
        isRunning = false;
        if (interval) clearInterval(interval);
    }

    function playBeep() {
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch {}
    }

    function sendNotification(title: string, body: string) {
        if (!browser || !('Notification' in window)) return;
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.png' });
        }
    }

    function handleTimerEnd() {
        if (interval) clearInterval(interval);
        isRunning = false;
        playBeep();

        if (currentMode === 'focus') {
            completedPomodoros++;
            persistState();
            sendNotification('¡Pomodoro completado! 🍅', 'Tómate un descanso merecido.');
        } else {
            sendNotification('¡Descanso terminado!', 'Es hora de volver a enfocarse.');
        }
    }

    function toggleTimer() {
        if (isRunning) {
            if (interval) clearInterval(interval);
            isRunning = false;
        } else {
            isRunning = true;
            interval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                } else {
                    handleTimerEnd();
                }
            }, 1000);
        }
    }

    function reset() {
        if (interval) clearInterval(interval);
        isRunning = false;
        timeLeft = DURATIONS[currentMode];
    }

    function applySettings() {
        showSettings = false;
        persistState();
        reset();
    }

    onDestroy(() => {
        if (interval) clearInterval(interval);
        if (browser) document.title = 'Pomodoro Timer | ChillChess';
    });

    const modes = [
        { id: 'focus' as Mode, label: 'Enfoque', icon: Focus, color: 'text-rose-400' },
        { id: 'short' as Mode, label: 'Pausa', icon: Coffee, color: 'text-emerald-400' },
        { id: 'long' as Mode, label: 'Descanso', icon: Zap, color: 'text-amber-400' },
    ];

    const modeColors: Record<Mode, string> = {
        focus: '#f43f5e',
        short: '#34d399',
        long: '#f59e0b',
    };
</script>

<svelte:head>
    <title>Pomodoro Timer | ChillChess</title>
    <meta
        name="description"
        content="Maximiza tu concentración con la técnica Pomodoro. Ajusta tiempos de trabajo y descanso."
    />
</svelte:head>

<ProGate>
    <div class="relative max-w-lg mx-auto flex flex-col items-center gap-8">
        <!-- Ambient Background Glows -->
        <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none transition-colors duration-1000"
            style="background-color: {modeColors[currentMode]}15"
        ></div>

        <!-- Mode Switcher -->
        <div
            class="bg-black/40 backdrop-blur-2xl rounded-2xl p-2 border border-white/10 shadow-sm relative overflow-hidden w-full"
        >
            <div
                class="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"
            ></div>
            <div class="flex relative z-10 gap-1 sm:gap-2">
                {#each modes as mode}
                    <button
                        on:click={() => setMode(mode.id)}
                        class="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 relative overflow-hidden group {currentMode ===
                        mode.id
                            ? 'text-white shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                    >
                        {#if currentMode === mode.id}
                            <div
                                class="absolute inset-0 opacity-10"
                                style="background-color: {modeColors[currentMode]}"
                            ></div>
                            <div
                                class="absolute inset-0 bg-white/10 mix-blend-overlay border border-white/20 rounded-xl"
                            ></div>
                            <div
                                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 blur-sm"
                                style="background-color: {modeColors[currentMode]}"
                            ></div>
                        {/if}
                        <div class="relative z-10 flex items-center gap-2">
                            <svelte:component
                                this={mode.icon}
                                class="w-4 h-4 {currentMode === mode.id
                                    ? mode.color
                                    : 'group-hover:scale-110 transition-transform'}"
                            />
                            <span class="hidden sm:inline">{mode.label}</span>
                        </div>
                    </button>
                {/each}
            </div>
        </div>

        <!-- Timer Circle -->
        <div class="relative w-64 h-64 sm:w-80 sm:h-80 group">
            <div
                class="absolute inset-0 rounded-full blur-2xl opacity-20 transition-colors duration-1000"
                style="background-color: {modeColors[currentMode]}"
            ></div>

            <div
                class="absolute inset-0 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 shadow-sm"
            ></div>

            <svg class="absolute inset-0 w-full h-full -rotate-90 scale-90" viewBox="0 0 200 200">
                <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke-width="4"
                    class="text-white/10"
                    stroke="currentColor"
                />
                <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke-width="6"
                    stroke={modeColors[currentMode]}
                    stroke-linecap="round"
                    stroke-dasharray={2 * Math.PI * 90}
                    stroke-dashoffset={2 * Math.PI * 90 * (1 - progress)}
                    class="transition-all duration-1000 ease-linear"
                    style="filter: drop-shadow(0 0 12px {modeColors[currentMode]}40)"
                />
            </svg>

            <div
                class="absolute inset-x-8 inset-y-8 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-full border border-white/5 shadow-inner"
            >
                <span
                    class="text-5xl sm:text-7xl font-black font-mono text-white tracking-tighter tabular-nums drop-shadow-lg scale-y-110"
                >
                    {minutes}:{seconds}
                </span>
                <span
                    class="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-bold mt-4 sm:mt-6 bg-black/80 px-4 py-1.5 rounded-full border border-white/10 shadow-inner"
                    style="color: {modeColors[currentMode]}"
                >
                    {currentMode === 'focus'
                        ? 'Enfoque'
                        : currentMode === 'short'
                          ? 'Pausa Corta'
                          : 'Descanso Largo'}
                </span>
            </div>
        </div>

        <!-- Controls -->
        <div
            class="flex items-center gap-5 sm:gap-6 bg-black/40 backdrop-blur-2xl p-3 sm:p-4 rounded-3xl border border-white/10 shadow-sm"
        >
            <button
                on:click={reset}
                class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-inner active:scale-90"
                title="Reiniciar"
            >
                <RotateCcw class="w-5 h-5" />
            </button>
            <button
                on:click={toggleTimer}
                class="px-10 py-4 sm:px-12 sm:py-5 rounded-2xl font-bold text-white transition-all duration-300 flex items-center gap-3 relative overflow-hidden group border border-white/20 active:scale-95 shadow-lg backdrop-blur-sm"
                style="background-color: {modeColors[
                    currentMode
                ]}33; text-shadow: 0 0 10px {modeColors[currentMode]}80"
            >
                <div
                    class="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"
                ></div>
                <div class="relative z-10 flex items-center gap-3 text-lg tracking-wide">
                    {#if isRunning}
                        <Pause class="w-6 h-6 fill-white" /> Pausar
                    {:else}
                        <Play class="w-6 h-6 fill-white" />
                        {timeLeft === DURATIONS[currentMode] ? 'Iniciar' : 'Reanudar'}
                    {/if}
                </div>
            </button>
            <button
                on:click={() => (showSettings = !showSettings)}
                class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-inner active:scale-90 {showSettings
                    ? 'bg-white/10 text-white ring-1 ring-white/30'
                    : ''}"
                title="Ajustes"
            >
                <Settings class="w-5 h-5" />
            </button>
        </div>

        <!-- Settings Panel -->
        {#if showSettings}
            <div
                class="w-full bg-black/60 backdrop-blur-3xl rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            >
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                ></div>

                <div class="flex items-center justify-between mb-6">
                    <h3
                        class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"
                    >
                        <Settings class="w-4 h-4 text-slate-400" /> Tiempos (min)
                    </h3>
                    <button
                        on:click={() => (showSettings = false)}
                        class="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-colors"
                    >
                        <X class="w-4 h-4" />
                    </button>
                </div>

                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div
                        class="bg-black/40 p-3 rounded-2xl border border-white/10 shadow-inner group"
                    >
                        <label
                            for="focus-mins"
                            class="text-[10px] font-bold text-rose-400 block mb-2 uppercase tracking-wider text-center"
                            >Enfoque</label
                        >
                        <div class="relative">
                            <div
                                class="absolute -inset-0.5 bg-rose-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"
                            ></div>
                            <input
                                id="focus-mins"
                                type="number"
                                bind:value={focusMins}
                                min="1"
                                max="90"
                                class="relative w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-base font-bold text-white text-center focus:outline-none focus:border-rose-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div
                        class="bg-black/40 p-3 rounded-2xl border border-white/10 shadow-inner group"
                    >
                        <label
                            for="short-mins"
                            class="text-[10px] font-bold text-emerald-400 block mb-2 uppercase tracking-wider text-center"
                            >Pausa</label
                        >
                        <div class="relative">
                            <div
                                class="absolute -inset-0.5 bg-emerald-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"
                            ></div>
                            <input
                                id="short-mins"
                                type="number"
                                bind:value={shortMins}
                                min="1"
                                max="30"
                                class="relative w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-base font-bold text-white text-center focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div
                        class="bg-black/40 p-3 rounded-2xl border border-white/10 shadow-inner group"
                    >
                        <label
                            for="long-mins"
                            class="text-[10px] font-bold text-amber-400 block mb-2 uppercase tracking-wider text-center"
                            >Descanso</label
                        >
                        <div class="relative">
                            <div
                                class="absolute -inset-0.5 bg-amber-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"
                            ></div>
                            <input
                                id="long-mins"
                                type="number"
                                bind:value={longMins}
                                min="1"
                                max="60"
                                class="relative w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-base font-bold text-white text-center focus:outline-none focus:border-amber-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                <button
                    on:click={applySettings}
                    class="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3.5 rounded-xl transition-all shadow-sm active:scale-95 text-sm tracking-wide border border-white/20"
                >
                    Guardar Cambios
                </button>
            </div>
        {/if}

        <!-- Stats -->
        <div
            class="bg-black/40 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/10 shadow-sm w-full flex items-center justify-center gap-6 sm:gap-10 relative overflow-hidden"
        >
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
            ></div>

            <div class="text-center relative z-10 group cursor-default">
                <div
                    class="absolute inset-0 bg-brand-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <p class="text-3xl sm:text-4xl font-black text-white font-mono drop-shadow-md">
                    {completedPomodoros}
                </p>
                <p class="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">
                    Pomodoros
                </p>
            </div>

            <div class="w-px h-12 bg-white/10 relative z-10"></div>

            <div class="text-center relative z-10 group cursor-default">
                <div
                    class="absolute inset-0 bg-emerald-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <p class="text-3xl sm:text-4xl font-black text-white font-mono drop-shadow-md">
                    {completedPomodoros * focusMins}
                </p>
                <p class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                    Minutos
                </p>
            </div>

            {#if completedPomodoros > 0}
                <div class="w-px h-12 bg-white/10 relative z-10"></div>
                <div class="relative z-10 flex items-center justify-center">
                    <button
                        on:click={() => {
                            completedPomodoros = 0;
                            persistState();
                        }}
                        class="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500 border border-red-500/20 hover:border-red-500 transition-all active:scale-90"
                        title="Resetear estadísticas"
                    >
                        <RotateCcw class="w-4 h-4" />
                    </button>
                </div>
            {/if}
        </div>
    </div>
</ProGate>
