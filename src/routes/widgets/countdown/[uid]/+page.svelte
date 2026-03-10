<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { db } from '$lib/firebase';
    import { fade } from 'svelte/transition';

    const { uid } = $page.params;

    interface CountdownSettings {
        duration: number;
        title: string;
        timeLeft: number;
        isActive: boolean;
        lastUpdated: number;
        bgColor: string;
        barColor: string;
        borderColor: string;
    }

    let settings: CountdownSettings = {
        duration: 300,
        title: 'Break Time',
        timeLeft: 300,
        isActive: false,
        lastUpdated: Date.now(),
        bgColor: '#ffffff',
        barColor: '#FFDD00',
        borderColor: '#000000'
    };

    let loading = true;
    let timerInterval: any;

    onMount(() => {
        if (!uid) return;

        const settingsRef = doc(db, 'users', uid, 'streamerSettings', 'neo_countdown');
        const unsub = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as Partial<CountdownSettings>;
                const now = Date.now();
                
                const updatedSettings: CountdownSettings = {
                    duration: data.duration ?? 300,
                    title: data.title || 'Break Time',
                    timeLeft: data.timeLeft ?? 300,
                    isActive: data.isActive ?? false,
                    lastUpdated: data.lastUpdated ?? now,
                    bgColor: data.bgColor || '#ffffff',
                    barColor: data.barColor || '#FFDD00',
                    borderColor: data.borderColor || '#000000'
                };

                if (updatedSettings.isActive) {
                    const elapsed = Math.floor((now - updatedSettings.lastUpdated) / 1000);
                    updatedSettings.timeLeft = Math.max(0, updatedSettings.timeLeft - elapsed);
                }
                
                settings = updatedSettings;
            }
            loading = false;
        });

        timerInterval = setInterval(() => {
            if (settings.isActive && settings.timeLeft > 0) {
                settings.timeLeft -= 1;
            }
        }, 1000);

        return () => {
            unsub();
            clearInterval(timerInterval);
        };
    });

    $: progress = (settings.timeLeft / settings.duration) * 100;
    $: minutes = Math.floor(settings.timeLeft / 60).toString().padStart(2, '0');
    $: seconds = (settings.timeLeft % 60).toString().padStart(2, '0');
</script>

<svelte:head>
    <title>Neo Countdown | ChillChess</title>
</svelte:head>

{#if !loading}
    <div 
        class="w-full h-full flex items-center justify-center p-8 bg-transparent overflow-hidden"
    >
        <div 
            class="w-full max-w-xl p-10 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative"
            style="background-color: {settings.bgColor}; border-color: {settings.borderColor};"
        >
            <!-- Title -->
            <div class="absolute -top-10 -left-2 bg-black text-white px-6 py-2 font-black text-xl uppercase tracking-widest transform -rotate-1">
                {settings.title}
            </div>

            <!-- Time Display -->
            <div class="flex items-baseline justify-center gap-4 py-8">
                <span class="text-[120px] font-black leading-none tracking-tighter tabular-nums" style="color: {settings.borderColor};">
                    {minutes}
                </span>
                <span class="text-[80px] font-black leading-none opacity-30 animated-colon" style="color: {settings.borderColor};">:</span>
                <span class="text-[120px] font-black leading-none tracking-tighter tabular-nums" style="color: {settings.borderColor};">
                    {seconds}
                </span>
            </div>

            <!-- Progress Bar -->
            <div class="h-10 w-full border-4 border-black bg-slate-100 dark:bg-slate-800 mt-4 overflow-hidden">
                <div 
                    class="h-full transition-all duration-1000 ease-linear border-r-4 border-black"
                    style="width: {progress}%; background-color: {settings.barColor};"
                ></div>
            </div>

            {#if settings.timeLeft === 0}
                <div 
                    in:fade
                    class="absolute inset-0 flex items-center justify-center bg-black/5 z-20 pointer-events-none"
                >
                    <div class="bg-red-500 text-white border-4 border-black p-4 font-black text-2xl rotate-3 shadow-neo uppercase">
                        ¡TIEMPO AGOTADO!
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    :global(body) {
        background: transparent !important;
        margin: 0;
        padding: 0;
        overflow: hidden;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .tabular-nums {
        font-variant-numeric: tabular-nums;
    }

    @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }

    .animated-colon {
        animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
</style>
