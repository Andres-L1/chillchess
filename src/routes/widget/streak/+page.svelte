<script lang="ts">
    import { page } from '$app/stores';
    import { db } from '$lib/firebase';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { onMount, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';

    let uid = $page.url.searchParams.get('uid');
    let label = $page.url.searchParams.get('label') || 'Días en Directo';
    // Optional theming
    let color = $page.url.searchParams.get('color') || 'orange'; // orange, purple, etc

    let daysCount = 0;
    let loading = true;
    let unsubscribe: () => void;

    onMount(() => {
        if (!uid) {
            loading = false;
            return;
        }

        const userRef = doc(db, 'users', uid);
        unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const activityMap = data.activityMap || {};
                // Calculate unique active days
                daysCount = Object.values(activityMap).filter((c: any) => c > 0).length;
            }
            loading = false;
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });
</script>

<div
    class="w-screen h-screen flex items-center justify-center p-4 bg-transparent font-poppins overflow-hidden"
>
    {#if !uid}
        <div class="text-white bg-red-500/80 p-4 rounded-xl text-center">
            <p class="font-bold">Error: Falta UID</p>
        </div>
    {:else if !loading}
        <div
            class="flex items-center gap-4 bg-[#0F172A]/90 border border-white/10 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md"
            transition:fade
        >
            <!-- Icon -->
            <div
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white animate-pulse-slow"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
            </div>

            <!-- Text Info -->
            <div class="flex flex-col">
                <span
                    class="text-3xl font-bold text-white leading-none tabular-nums tracking-tight"
                >
                    {daysCount}
                </span>
                <span class="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">
                    {label}
                </span>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Custom slow pulse for the icon */
    .animate-pulse-slow {
        animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 1;
        }
        50% {
            opacity: 0.8;
        }
    }
</style>
