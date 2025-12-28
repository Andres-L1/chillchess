<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import { fade } from "svelte/transition";

    export let currentTrack: any;
    export let onExpand: () => void;
</script>

<div
    transition:fade={{ duration: 200 }}
    class="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2"
>
    <button
        on:click={onExpand}
        class="group bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 p-2 pr-6 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3 overflow-hidden max-w-[200px]"
    >
        <!-- Animated Icon -->
        <div
            class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center relative shrink-0"
        >
            <div
                class="absolute inset-0 rounded-full border border-white/20"
                class:animate-spin-slow={$audioStore.isPlaying}
            ></div>
            {#if $audioStore.isPlaying}
                <span class="text-xs">🔊</span>
            {:else}
                <span class="text-xs">⏸</span>
            {/if}
        </div>

        <!-- Info -->
        <div class="flex flex-col text-left min-w-0">
            <span class="text-xs font-bold text-white truncate w-full"
                >{currentTrack.title}</span
            >
            <span class="text-[10px] text-slate-400 truncate w-full"
                >{currentTrack.artist}</span
            >
        </div>
    </button>
</div>

<style>
    .animate-spin-slow {
        animation: spin 8s linear infinite;
    }
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
