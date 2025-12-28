<script lang="ts">
    import {
        togglePlayback,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
    } from "$lib/audio/store";
    import { audioStore } from "$lib/audio/store";
</script>

<div class="flex items-center gap-6 mb-1">
    <button
        on:click={toggleShuffle}
        class="transition-colors hidden md:block {$audioStore.shuffle
            ? 'text-green-400'
            : 'text-slate-400 hover:text-white'}"
        title="Aleatorio"
    >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"
            ><path
                d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
            /></svg
        >
    </button>

    <button
        on:click={prevTrack}
        class="text-white/80 hover:text-white transition-colors"
    >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
            ><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg
        >
    </button>

    <button
        on:click={togglePlayback}
        class="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10"
    >
        {#if $audioStore.isPlaying}
            <svg class="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"
                ><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg
            >
        {:else}
            <svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"
                ><path d="M8 5v14l11-7z" /></svg
            >
        {/if}
    </button>

    <button
        on:click={nextTrack}
        class="text-white/80 hover:text-white transition-colors"
    >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
            ><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg
        >
    </button>

    <button
        on:click={toggleRepeat}
        class="transition-colors relative {$audioStore.repeatMode !== 'off'
            ? 'text-green-400'
            : 'text-slate-400 hover:text-white'}"
        title={$audioStore.repeatMode === "one"
            ? "Repetir una"
            : $audioStore.repeatMode === "all"
              ? "Repetir todo"
              : "Repetir desactivado"}
    >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"
            ><path
                d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
            /></svg
        >
        {#if $audioStore.repeatMode === "one"}
            <span class="absolute -bottom-1 -right-1 text-[8px] font-bold"
                >1</span
            >
        {/if}
    </button>
</div>
