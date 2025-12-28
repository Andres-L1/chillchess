<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import { fly } from "svelte/transition";
    import { onDestroy } from "svelte";

    let show = false;
    let trackDisplay = "";
    let lastTrackId = "";
    let timeout: any;

    // Detect active track change safely
    $: currentTrack = $audioStore.playlist?.[$audioStore.currentTrackIndex];

    $: if (currentTrack && currentTrack.id !== lastTrackId) {
        lastTrackId = currentTrack.id || "";
        trackDisplay = `${currentTrack.title} • ${currentTrack.artist}`;
        show = true;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            show = false;
        }, 4000);
    }

    onDestroy(() => {
        if (timeout) clearTimeout(timeout);
    });
</script>

{#if show && trackDisplay}
    <div
        transition:fly={{ y: -20, duration: 600 }}
        class="fixed top-20 md:top-8 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 bg-[#0F172A]/80 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl flex items-center gap-3 pointer-events-none"
    >
        <div
            class="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"
        ></div>
        <span
            class="text-xs md:text-sm font-medium text-slate-200 tracking-wide font-poppins"
            >{trackDisplay}</span
        >
    </div>
{/if}
