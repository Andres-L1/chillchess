<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { Play, Pause, RotateCcw, Flame } from 'lucide-svelte';
    import { onMount, onDestroy } from 'svelte';

    pageHeader.set({
        title: 'Pomodoro MultiTask',
        description: 'Técnica de enfoque con animaciones fluidas.',
        category: 'Productividad',
    });

    let mode: 'focus' | 'break' | 'longBreak' = 'focus';
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let fullTime = 25 * 60;

    let isRunning = false;
    let timerInterval: any;

    let completedPomodoros = 0;

    $: minutes = Math.floor(timeLeft / 60)
        .toString()
        .padStart(2, '0');
    $: seconds = (timeLeft % 60).toString().padStart(2, '0');
    $: progress = ((fullTime - timeLeft) / fullTime) * 100;

    function setMode(newMode: typeof mode) {
        mode = newMode;
        isRunning = false;
        clearInterval(timerInterval);

        if (mode === 'focus') {
            fullTime = 25 * 60;
        } else if (mode === 'break') {
            fullTime = 5 * 60;
        } else {
            fullTime = 15 * 60;
        }

        timeLeft = fullTime;
    }

    function toggleTimer() {
        if (isRunning) {
            clearInterval(timerInterval);
            isRunning = false;
        } else {
            isRunning = true;
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                } else {
                    clearInterval(timerInterval);
                    isRunning = false;
                    playAlarm();

                    if (mode === 'focus') {
                        completedPomodoros++;
                        if (completedPomodoros % 4 === 0) {
                            setMode('longBreak');
                        } else {
                            setMode('break');
                        }
                    } else {
                        setMode('focus');
                    }
                }
            }, 1000);
        }
    }

    function resetTimer() {
        setMode(mode);
    }

    function playAlarm() {
        try {
            // Unobtrusive beep
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.value = 880; // A5
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1);
            oscillator.stop(audioCtx.currentTime + 1);
        } catch (e) {
            console.warn(e);
        }
    }

    onDestroy(() => {
        clearInterval(timerInterval);
    });
</script>

<svelte:head>
    <title>Pomodoro | MultiTool</title>
</svelte:head>

<div class="max-w-2xl mx-auto flex flex-col items-center">
    <div
        class="bg-slate-100 p-1.5 rounded-full mb-12 flex gap-1 shadow-inner border border-slate-200"
    >
        <button
            on:click={() => setMode('focus')}
            class="px-6 py-2 rounded-full text-sm font-bold transition-all {mode === 'focus'
                ? 'bg-red-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800'}"
        >
            Focus
        </button>
        <button
            on:click={() => setMode('break')}
            class="px-6 py-2 rounded-full text-sm font-bold transition-all {mode === 'break'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800'}"
        >
            Descanso
        </button>
        <button
            on:click={() => setMode('longBreak')}
            class="px-6 py-2 rounded-full text-sm font-bold transition-all {mode === 'longBreak'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800'}"
        >
            Descanso Largo
        </button>
    </div>

    <!-- Animated Timer Circle -->
    <div class="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center group mb-12">
        <!-- SVG Progress Ring -->
        <svg class="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <!-- Background track -->
            <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                class="text-slate-100"
                stroke-width="4"
            />

            <!-- Progress track -->
            <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                class="transition-all duration-1000 ease-linear
                    {mode === 'focus'
                    ? 'text-red-500'
                    : mode === 'break'
                      ? 'text-green-500'
                      : 'text-blue-500'}
                "
                stroke-width="5"
                stroke-linecap="round"
                stroke-dasharray="283"
                stroke-dashoffset={283 - (283 * progress) / 100}
            />
        </svg>

        <!-- Inner soft pulse glow -->
        <div
            class="absolute inset-4 rounded-full bg-white shadow-2xl flex flex-col items-center justify-center border-4 border-slate-50 z-10 transition-transform duration-300"
        >
            {#if isRunning && mode === 'focus'}
                <div
                    class="absolute inset-0 rounded-full animate-ping opacity-10 bg-red-400 pointer-events-none"
                ></div>
            {/if}

            <span
                class="text-6xl md:text-8xl font-black font-mono tracking-tighter text-slate-800 tabular-nums"
            >
                {minutes}:{seconds}
            </span>
            <span class="text-xs font-bold text-slate-400 tracking-widest uppercase mt-2">
                {mode === 'focus'
                    ? 'Tiempo de Enfoque'
                    : mode === 'break'
                      ? 'Toma un respiro'
                      : 'Recarga energía'}
            </span>
        </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-6">
        <button
            on:click={toggleTimer}
            class="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform hover:scale-105 active:scale-95
                {mode === 'focus'
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                : mode === 'break'
                  ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30'
                  : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'}
            "
        >
            {#if isRunning}
                <Pause class="w-8 h-8 fill-current" />
            {:else}
                <Play class="w-8 h-8 fill-current ml-1" />
            {/if}
        </button>

        <button
            on:click={resetTimer}
            class="w-14 h-14 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center shadow-sm hover:bg-slate-50 hover:text-slate-800 transition-all hover:-rotate-180 duration-500"
            title="Reiniciar"
        >
            <RotateCcw class="w-6 h-6" />
        </button>
    </div>

    <!-- Stats -->
    <div
        class="mt-12 bg-white px-8 py-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4"
    >
        <div
            class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"
        >
            <Flame class="w-5 h-5" />
        </div>
        <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Racha Actual</p>
            <p class="text-lg font-black text-slate-800">{completedPomodoros} Pomodoros</p>
        </div>
    </div>
</div>
