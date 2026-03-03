<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { onMount, onDestroy } from 'svelte';
    import { Play, Pause, RotateCcw, Coffee, Focus, Zap } from 'lucide-svelte';

    pageHeader.set({
        title: 'Pomodoro Timer',
        description: 'Enfócate con la técnica Pomodoro.',
        category: 'Productividad',
    });

    type Mode = 'focus' | 'short' | 'long';

    const DURATIONS: Record<Mode, number> = {
        focus: 25 * 60,
        short: 5 * 60,
        long: 15 * 60,
    };

    let currentMode: Mode = 'focus';
    let timeLeft = DURATIONS[currentMode];
    let isRunning = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    let completedPomodoros = 0;

    $: progress = 1 - timeLeft / DURATIONS[currentMode];
    $: minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    $: seconds = String(timeLeft % 60).padStart(2, '0');

    function setMode(mode: Mode) {
        currentMode = mode;
        timeLeft = DURATIONS[mode];
        isRunning = false;
        if (interval) clearInterval(interval);
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
                    if (interval) clearInterval(interval);
                    isRunning = false;
                    if (currentMode === 'focus') completedPomodoros++;
                    try {
                        const audio = new Audio(
                            'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' +
                                'A'.repeat(100)
                        );
                        audio.volume = 0.3;
                        audio.play().catch(() => {});
                    } catch {}
                }
            }, 1000);
        }
    }

    function reset() {
        if (interval) clearInterval(interval);
        isRunning = false;
        timeLeft = DURATIONS[currentMode];
    }

    onDestroy(() => {
        if (interval) clearInterval(interval);
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
    <title>Pomodoro Timer | MultiTool</title>
    <meta
        name="description"
        content="Maximiza tu concentración con la técnica Pomodoro. Ajusta tiempos de trabajo y descanso."
    />
</svelte:head>

<div class="max-w-md mx-auto flex flex-col items-center gap-8">
    <!-- Mode Switcher -->
    <div
        class="flex bg-slate-800/80 rounded-2xl p-1.5 border border-slate-700/50 shadow-lg shadow-black/10 w-full"
    >
        {#each modes as mode}
            <button
                on:click={() => setMode(mode.id)}
                class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
                class:bg-slate-700={currentMode === mode.id}
                class:text-white={currentMode === mode.id}
                class:shadow-md={currentMode === mode.id}
                class:text-slate-500={currentMode !== mode.id}
                class:hover:text-slate-300={currentMode !== mode.id}
            >
                <svelte:component
                    this={mode.icon}
                    class="w-4 h-4 {currentMode === mode.id ? mode.color : ''}"
                />
                <span class="hidden sm:inline">{mode.label}</span>
            </button>
        {/each}
    </div>

    <!-- Timer Circle -->
    <div class="relative w-64 h-64 sm:w-72 sm:h-72">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke-width="8"
                class="text-slate-800"
                stroke="currentColor"
            />
            <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke-width="8"
                stroke={modeColors[currentMode]}
                stroke-linecap="round"
                stroke-dasharray={2 * Math.PI * 90}
                stroke-dashoffset={2 * Math.PI * 90 * (1 - progress)}
                class="transition-all duration-1000 ease-linear"
                style="filter: drop-shadow(0 0 8px {modeColors[currentMode]}40)"
            />
        </svg>
        <div
            class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 rounded-full m-4 border border-slate-800"
        >
            <span
                class="text-5xl sm:text-6xl font-black font-mono text-white tracking-tighter tabular-nums"
            >
                {minutes}:{seconds}
            </span>
            <span class="text-xs uppercase tracking-widest text-slate-500 font-bold mt-2">
                {currentMode === 'focus'
                    ? 'Enfoque'
                    : currentMode === 'short'
                      ? 'Pausa Corta'
                      : 'Descanso Largo'}
            </span>
        </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-4">
        <button
            on:click={reset}
            class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
            <RotateCcw class="w-5 h-5" />
        </button>
        <button
            on:click={toggleTimer}
            class="px-10 py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 flex items-center gap-3"
            style="background-color: {modeColors[currentMode]}; box-shadow: 0 8px 25px {modeColors[
                currentMode
            ]}30"
        >
            {#if isRunning}
                <Pause class="w-6 h-6" /> Pausar
            {:else}
                <Play class="w-6 h-6" />
                {timeLeft === DURATIONS[currentMode] ? 'Iniciar' : 'Reanudar'}
            {/if}
        </button>
    </div>

    <!-- Stats -->
    <div
        class="flex items-center gap-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-700/50 shadow-lg shadow-black/10 w-full justify-center"
    >
        <div class="text-center">
            <p class="text-2xl font-black text-white font-mono">{completedPomodoros}</p>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pomodoros</p>
        </div>
        <div class="w-px h-8 bg-slate-700"></div>
        <div class="text-center">
            <p class="text-2xl font-black text-white font-mono">{completedPomodoros * 25}</p>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Minutos</p>
        </div>
    </div>
</div>
