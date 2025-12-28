<script lang="ts">
    import { audioStore, setMusicVolume } from "$lib/audio/store";

    export let showVolumeSlider = false;

    let volumeTimeout: number;
    function handleVolumeChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const value = parseFloat(input.value);

        if (volumeTimeout) clearTimeout(volumeTimeout);

        volumeTimeout = setTimeout(() => {
            setMusicVolume(value);
        }, 50) as unknown as number;
    }
</script>

<div class="flex w-auto md:w-1/3 justify-end items-center gap-2 md:gap-4">
    <slot name="minimize-button" />

    <div class="hidden md:flex items-center gap-2 relative">
        <button
            on:click={() => (showVolumeSlider = !showVolumeSlider)}
            class="text-white/70 hover:text-white transition-colors"
            title="Volumen"
        >
            {#if $audioStore.musicVolume === 0 || $audioStore.isMuted}
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
                    ><path
                        d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                    /></svg
                >
            {:else if $audioStore.musicVolume < 0.5}
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
                    ><path d="M7 9v6h4l5 5V4l-5 5H7z" /></svg
                >
            {:else}
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
                    ><path
                        d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
                    /></svg
                >
            {/if}
        </button>

        {#if showVolumeSlider}
            <div
                class="absolute bottom-full right-0 mb-4 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex gap-4 z-50"
            >
                <!-- Music Slider ONLY -->
                <div class="flex flex-col items-center gap-3 h-32">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={$audioStore.musicVolume}
                        on:input={handleVolumeChange}
                        class="flex-1 w-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-colors
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                        style="writing-mode: bt-lr; -webkit-appearance: slider-vertical;"
                    />
                    <div
                        class="text-xs font-bold text-white tabular-nums w-8 text-center bg-white/5 rounded px-1"
                    >
                        {Math.round($audioStore.musicVolume * 100)}%
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
