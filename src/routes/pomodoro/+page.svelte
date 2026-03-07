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
    <div class="relative max-w-lg mx-auto flex flex-col items-center gap-10 pb-16">
        <!-- Ambient Background Glows -->
        <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none transition-colors duration-1000 opacity-30"
            style="background-color: {modeColors[currentMode]}"
        ></div>

        <!-- Header section -->
        <div class="text-center space-y-2">
            <h2
                class="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase italic"
            >
                Focus <span class="text-neat-accent">Elite</span>
            </h2>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                Domina tu tiempo, domina tu mente
            </p>
        </div>

        <!-- Mode Switcher -->
        <div
            class="glass-card !bg-black/20 !rounded-3xl p-2 shadow-2xl relative overflow-hidden w-full group"
        >
            <div class="flex relative z-10 gap-1">
                {#each modes as mode}
                    <button
                        on:click={() => setMode(mode.id)}
                        class="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden {currentMode ===
                        mode.id
                            ? 'text-white'
                            : 'text-slate-500 hover:text-white hover:bg-white/5'}"
                    >
                        {#if currentMode === mode.id}
                            <div
                                class="absolute inset-0 opacity-20"
                                style="background-color: {modeColors[currentMode]}"
                            ></div>
                            <div
                                class="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
                            ></div>
                        {/if}
                        <div class="relative z-10 flex items-center gap-2">
                            <svelte:component
                                this={mode.icon}
                                class="w-4 h-4 {currentMode === mode.id
                                    ? mode.color
                                    : 'opacity-50 group-hover:opacity-100 transition-opacity'}"
                            />
                            <span class="hidden sm:inline">{mode.label}</span>
                        </div>
                    </button>
                {/each}
            </div>
        </div>

        <!-- Timer Circle -->
        <div class="relative w-72 h-72 sm:w-96 sm:h-96 group">
            <!-- Outer Glow -->
            <div
                class="absolute inset-x-[-20%] inset-y-[-20%] rounded-full blur-3xl opacity-20 transition-colors duration-1000"
                style="background-color: {modeColors[currentMode]}"
            ></div>

            <!-- Main Glass Circle -->
            <div
                class="absolute inset-0 glass-card !bg-black/40 !rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
            ></div>

            <!-- SVG Progress -->
            <svg
                class="absolute inset-0 w-full h-full -rotate-90 scale-[0.85]"
                viewBox="0 0 200 200"
            >
                <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke-width="2"
                    class="text-white/5"
                    stroke="currentColor"
                />
                <circle
                    cx="100"
                    cy="100"
                    r="92"
                    fill="none"
                    stroke-width="8"
                    stroke={modeColors[currentMode]}
                    stroke-linecap="round"
                    stroke-dasharray={2 * Math.PI * 92}
                    stroke-dashoffset={2 * Math.PI * 92 * (1 - progress)}
                    class="transition-all duration-1000 ease-linear"
                    style="filter: drop-shadow(0 0 15px {modeColors[currentMode]}80)"
                />
            </svg>

            <!-- Inner Display -->
            <div
                class="absolute inset-12 flex flex-col items-center justify-center bg-black/60 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl"
            >
                <div class="relative flex flex-col items-center">
                    <span
                        class="text-7xl sm:text-8xl font-black font-mono text-white tracking-[-0.05em] tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                        {minutes}<span class="text-white/30 animate-pulse">:</span>{seconds}
                    </span>
                    <div
                        class="mt-4 px-6 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md shadow-xl"
                    >
                        <span
                            class="text-[10px] uppercase font-black tracking-[0.4em]"
                            style="color: {modeColors[currentMode]}"
                        >
                            {currentMode === 'focus'
                                ? 'Fase de Enfoque'
                                : currentMode === 'short'
                                  ? 'Pausa Flash'
                                  : 'Descanso Profundo'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-6">
            <button
                on:click={reset}
                class="w-16 h-16 flex items-center justify-center rounded-[1.5rem] bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-90 shadow-xl"
                title="Reiniciar"
            >
                <RotateCcw class="w-6 h-6" />
            </button>
            <button
                on:click={toggleTimer}
                class="h-20 px-14 sm:px-16 rounded-[2rem] font-black text-xl text-white transition-all duration-500 flex items-center gap-4 relative overflow-hidden group border border-white/20 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-black/40 hover:bg-black/60"
            >
                <!-- Dynamic Bg Overlay -->
                <div
                    class="absolute inset-0 opacity-20 transition-colors duration-1000"
                    style="background-color: {modeColors[currentMode]}"
                ></div>

                <div
                    class="relative z-10 flex items-center gap-4 uppercase tracking-tighter italic"
                >
                    {#if isRunning}
                        <Pause class="w-8 h-8 fill-white" /> Pausar
                    {:else}
                        <Play class="w-8 h-8 fill-white" />
                        {timeLeft === DURATIONS[currentMode] ? 'Iniciar' : 'Continuar'}
                    {/if}
                </div>
            </button>
            <button
                on:click={() => (showSettings = !showSettings)}
                class="w-16 h-16 flex items-center justify-center rounded-[1.5rem] bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-90 shadow-xl {showSettings
                    ? '!bg-neat-accent/10 !text-neat-accent !border-neat-accent/30'
                    : ''}"
                title="Ajustes"
            >
                <Settings class="w-6 h-6" />
            </button>
        </div>

        <!-- Settings Panel -->
        {#if showSettings}
            <div
                class="w-full glass-card !bg-black/60 !backdrop-blur-[40px] !rounded-[3rem] border border-white/10 p-8 sm:p-10 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500"
            >
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neat-accent/50 to-transparent"
                ></div>

                <div class="flex items-center justify-between mb-8">
                    <h3
                        class="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3"
                    >
                        <Settings class="w-5 h-5 text-neat-accent" /> Configuración
                    </h3>
                    <button
                        on:click={() => (showSettings = false)}
                        class="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div
                        class="bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner group transition-all hover:border-white/10"
                    >
                        <label
                            for="focus-mins"
                            class="text-[10px] font-black text-slate-500 block mb-4 uppercase tracking-[0.2em] text-center"
                            >Enfoque</label
                        >
                        <input
                            id="focus-mins"
                            type="number"
                            bind:value={focusMins}
                            min="1"
                            max="90"
                            class="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-2xl font-black text-rose-400 text-center focus:outline-none focus:border-rose-500 shadow-inner tabular-nums"
                        />
                    </div>

                    <div
                        class="bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner group transition-all hover:border-white/10"
                    >
                        <label
                            for="short-mins"
                            class="text-[10px] font-black text-slate-500 block mb-4 uppercase tracking-[0.2em] text-center"
                            >Pausa</label
                        >
                        <input
                            id="short-mins"
                            type="number"
                            bind:value={shortMins}
                            min="1"
                            max="30"
                            class="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-2xl font-black text-emerald-400 text-center focus:outline-none focus:border-emerald-500 shadow-inner tabular-nums"
                        />
                    </div>

                    <div
                        class="bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner group transition-all hover:border-white/10"
                    >
                        <label
                            for="long-mins"
                            class="text-[10px] font-black text-slate-500 block mb-4 uppercase tracking-[0.2em] text-center"
                            >Descanso</label
                        >
                        <input
                            id="long-mins"
                            type="number"
                            bind:value={longMins}
                            min="1"
                            max="60"
                            class="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-2xl font-black text-amber-400 text-center focus:outline-none focus:border-amber-500 shadow-inner tabular-nums"
                        />
                    </div>
                </div>

                <button on:click={applySettings} class="neat-button-primary w-full py-5">
                    GUARDAR CONFIGURACIÓN
                </button>
            </div>
        {/if}

        <!-- Stats -->
        <div
            class="glass-card !bg-black/20 !rounded-[2.5rem] p-8 sm:p-10 shadow-2xl w-full flex items-center justify-center gap-8 sm:gap-14 relative overflow-hidden"
        >
            <div
                class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
            ></div>

            <div class="text-center relative z-10">
                <p
                    class="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter mb-1 tabular-nums"
                >
                    {completedPomodoros}
                </p>
                <p
                    class="text-[10px] font-black text-neat-accent uppercase tracking-widest opacity-60"
                >
                    Pomodoros
                </p>
            </div>

            <div class="w-px h-16 bg-white/10 relative z-10"></div>

            <div class="text-center relative z-10">
                <p
                    class="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter mb-1 tabular-nums"
                >
                    {completedPomodoros * focusMins}
                </p>
                <p
                    class="text-[10px] font-black text-emerald-400 uppercase tracking-widest opacity-60"
                >
                    Minutos
                </p>
            </div>

            {#if completedPomodoros > 0}
                <div class="w-px h-16 bg-white/10 relative z-10"></div>
                <div class="relative z-10">
                    <button
                        on:click={() => {
                            completedPomodoros = 0;
                            persistState();
                        }}
                        class="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all active:scale-90"
                        title="Limpiar estadísticas"
                    >
                        <RotateCcw class="w-5 h-5" />
                    </button>
                </div>
            {/if}
        </div>
    </div>
</ProGate>
