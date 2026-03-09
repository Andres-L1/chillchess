<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { onMount, onDestroy } from 'svelte';
    import { addToast } from '$lib/stores/toasts';
    import { Play, Pause, RotateCcw, Coffee, Focus, Zap, Settings, X } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { browser } from '$app/environment';

    pageHeader.set({
        title: 'TEMPORIZADOR POMODORO',
        description: 'Optimización de ciclos de trabajo. Productividad sin concesiones.',
        category: 'PRODUCTIVIDAD',
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
        addToast('AJUSTES GUARDADOS', 'success');
    }

    onDestroy(() => {
        if (interval) clearInterval(interval);
        if (browser) document.title = 'Pomodoro Timer | ChillChess';
    });

    const modes = [
        { id: 'focus' as Mode, label: 'ENFOQUE', icon: Focus, color: 'text-rose-400' },
        { id: 'short' as Mode, label: 'PAUSA', icon: Coffee, color: 'text-emerald-400' },
        { id: 'long' as Mode, label: 'DESCANSO', icon: Zap, color: 'text-amber-400' },
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
        <!-- Header section -->
        <div class="text-center space-y-4">
            <h2
                class="text-5xl sm:text-6xl font-black text-black dark:text-white tracking-tighter uppercase italic"
            >
                TRABAJO <span
                    class="bg-primary text-white px-4 border-4 border-black shadow-neo-sm transform -rotate-2 inline-block"
                    >MAX</span
                >
            </h2>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                FLUJO DE CONCENTRACIÓN ABSOLUTA
            </p>
        </div>

        <!-- Mode Switcher -->
        <div class="bg-white dark:bg-slate-900 border-4 border-black p-2 shadow-neo-sm w-full">
            <div class="flex gap-2 relative z-10">
                {#each modes as m}
                    <button
                        on:click={() => setMode(m.id)}
                        class="flex-1 flex items-center justify-center gap-3 py-5 text-[10px] font-black uppercase tracking-widest transition-all relative group {currentMode ===
                        m.id
                            ? 'text-white'
                            : 'text-slate-500 hover:text-black dark:hover:text-white'}"
                    >
                        {#if currentMode === m.id}
                            <div
                                class="absolute inset-0 bg-primary border-2 border-black shadow-neo-sm"
                            ></div>
                        {/if}
                        <div class="relative z-10 flex items-center gap-2">
                            <svelte:component
                                this={m.icon}
                                class="w-4 h-4 {currentMode === m.id
                                    ? 'text-white'
                                    : 'opacity-50 group-hover:opacity-100 transition-opacity'}"
                            />
                            <span class="hidden sm:inline">{m.label}</span>
                        </div>
                    </button>
                {/each}
            </div>
        </div>

        <!-- Timer Circle/Square -->
        <div class="relative w-72 h-72 sm:w-96 sm:h-96 group">
            <!-- Main Neo Circle -->
            <div
                class="absolute inset-0 bg-white dark:bg-slate-900 rounded-full border-8 border-black shadow-neo overflow-hidden"
            >
                <!-- SVG Progress -->
                <svg
                    class="absolute inset-0 w-full h-full -rotate-90 scale-[0.98]"
                    viewBox="0 0 200 200"
                >
                    <circle
                        cx="100"
                        cy="100"
                        r="94"
                        fill="none"
                        stroke-width="12"
                        stroke="black"
                        class="opacity-5"
                    />
                    <circle
                        cx="100"
                        cy="100"
                        r="94"
                        fill="none"
                        stroke-width="12"
                        stroke={modeColors[currentMode]}
                        stroke-linecap="butt"
                        stroke-dasharray={2 * Math.PI * 94}
                        stroke-dashoffset={2 * Math.PI * 94 * (1 - progress)}
                        class="transition-all duration-1000 ease-linear"
                    />
                </svg>

                <!-- Inner Display -->
                <div
                    class="absolute inset-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full border-4 border-black shadow-inner"
                >
                    <div class="flex flex-col items-center">
                        <span
                            class="text-7xl sm:text-8xl font-black font-mono text-black dark:text-white tracking-[-0.05em] tabular-nums"
                        >
                            {minutes}<span class="text-primary animate-pulse">:</span>{seconds}
                        </span>
                        <div
                            class="mt-6 px-4 py-1 border-2 border-black bg-white dark:bg-slate-900 shadow-neo-sm transform -rotate-1"
                        >
                            <span
                                class="text-[10px] uppercase font-black tracking-[0.2em] text-black dark:text-white"
                            >
                                {currentMode === 'focus'
                                    ? 'ENFOQUE'
                                    : currentMode === 'short'
                                      ? 'PAUSA'
                                      : 'DESCANSO'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-8">
            <button
                on:click={reset}
                class="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-900 border-4 border-black text-black dark:text-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-90"
                title="Reiniciar"
            >
                <RotateCcw class="w-6 h-6" />
            </button>
            <button
                on:click={toggleTimer}
                class="h-24 px-12 sm:px-16 bg-primary text-white border-4 border-black font-black text-2xl shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:shadow-none transition-all flex items-center gap-4 relative overflow-hidden group"
            >
                <div class="relative z-10 flex items-center gap-4 uppercase italic">
                    {#if isRunning}
                        <Pause class="w-8 h-8 fill-white" /> PAUSE
                    {:else}
                        <Play class="w-8 h-8 fill-white" />
                        {timeLeft === DURATIONS[currentMode] ? 'START' : 'RESUME'}
                    {/if}
                </div>
            </button>
            <button
                on:click={() => (showSettings = !showSettings)}
                class="w-16 h-16 flex items-center justify-center bg-white dark:bg-slate-900 border-4 border-black text-black dark:text-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-90 {showSettings
                    ? '!bg-primary !text-white'
                    : ''}"
                title="Ajustes"
            >
                <Settings class="w-6 h-6" />
            </button>
        </div>

        <!-- Settings Panel -->
        {#if showSettings}
            <div
                class="w-full bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-10 shadow-neo relative overflow-hidden animate-in fade-in zoom-in duration-300 transform -rotate-1"
            >
                <div class="flex items-center justify-between mb-10">
                    <h3
                        class="text-xs font-black text-black dark:text-white uppercase tracking-[0.4em] flex items-center gap-3"
                    >
                        <Settings class="w-5 h-5 text-primary" /> TIEMPOS
                    </h3>
                    <button
                        on:click={() => (showSettings = false)}
                        class="w-10 h-10 flex items-center justify-center border-2 border-black bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-black hover:text-white transition-all shadow-neo-sm"
                    >
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
                    <div class="space-y-4">
                        <label
                            for="focus-mins"
                            class="text-[10px] font-black text-slate-500 block uppercase tracking-[0.2em]"
                            >TRABAJO</label
                        >
                        <input
                            id="focus-mins"
                            type="number"
                            bind:value={focusMins}
                            min="1"
                            max="90"
                            class="w-full bg-slate-100 dark:bg-slate-800 border-2 border-black px-4 py-5 text-2xl font-black text-black dark:text-white focus:outline-none focus:border-primary shadow-inner tabular-nums"
                        />
                    </div>

                    <div class="space-y-4">
                        <label
                            for="short-mins"
                            class="text-[10px] font-black text-slate-500 block uppercase tracking-[0.2em]"
                            >PAUSA</label
                        >
                        <input
                            id="short-mins"
                            type="number"
                            bind:value={shortMins}
                            min="1"
                            max="30"
                            class="w-full bg-slate-100 dark:bg-slate-800 border-2 border-black px-4 py-5 text-2xl font-black text-black dark:text-white focus:outline-none focus:border-primary shadow-inner tabular-nums"
                        />
                    </div>

                    <div class="space-y-4">
                        <label
                            for="long-mins"
                            class="text-[10px] font-black text-slate-500 block uppercase tracking-[0.2em]"
                            >RECESO</label
                        >
                        <input
                            id="long-mins"
                            type="number"
                            bind:value={longMins}
                            min="1"
                            max="60"
                            class="w-full bg-slate-100 dark:bg-slate-800 border-2 border-black px-4 py-5 text-2xl font-black text-black dark:text-white focus:outline-none focus:border-primary shadow-inner tabular-nums"
                        />
                    </div>
                </div>

                <button
                    on:click={applySettings}
                    class="w-full py-6 bg-black text-white border-2 border-black font-black uppercase tracking-widest shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-[0.98]"
                >
                    ACTUALIZAR CICLOS
                </button>
            </div>
        {/if}

        <!-- Stats -->
        <div
            class="bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-10 shadow-neo w-full flex items-center justify-center gap-10 sm:gap-14 relative transform rotate-1"
        >
            <div class="text-center">
                <p
                    class="text-5xl font-black text-black dark:text-white font-mono tracking-tighter mb-1 tabular-nums"
                >
                    {completedPomodoros}
                </p>
                <p class="text-[10px] font-black text-primary uppercase tracking-widest italic">
                    Pomodoros
                </p>
            </div>

            <div class="w-1.5 h-16 bg-black/10 dark:bg-white/10"></div>

            <div class="text-center">
                <p
                    class="text-5xl font-black text-black dark:text-white font-mono tracking-tighter mb-1 tabular-nums"
                >
                    {completedPomodoros * focusMins}
                </p>
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                    Minutos
                </p>
            </div>

            {#if completedPomodoros > 0}
                <div class="w-1.5 h-16 bg-black/10 dark:bg-white/10"></div>
                <button
                    on:click={() => {
                        completedPomodoros = 0;
                        persistState();
                    }}
                    class="w-14 h-14 flex items-center justify-center bg-red-500 text-white border-2 border-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all active:scale-90"
                    title="Limpiar estadísticas"
                >
                    <RotateCcw class="w-6 h-6" />
                </button>
            {/if}
        </div>
    </div>
</ProGate>
