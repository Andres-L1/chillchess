<script lang="ts">
    import { audioStore, setMusicVolume } from "$lib/audio/store";
    import { fly, fade } from "svelte/transition";

    let isHovering = false;
    let volumeTimeout: number;

    function handleVolumeChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const value = parseFloat(input.value);

        if (volumeTimeout) clearTimeout(volumeTimeout);
        volumeTimeout = setTimeout(() => {
            setMusicVolume(value);
        }, 10) as unknown as number;
    }
</script>

<div
    class="relative flex items-center justify-center p-2 group"
    on:mouseenter={() => (isHovering = true)}
    on:mouseleave={() => (isHovering = false)}
    role="group"
    aria-label="Control de volumen"
>
    <!-- Mute/Unmute Button -->
    <button
        on:click={() => setMusicVolume($audioStore.musicVolume === 0 ? 0.5 : 0)}
        class="text-slate-400 hover:text-white transition-colors relative z-20 p-2"
        title={$audioStore.musicVolume === 0 ? "Activar Sonido" : "Silenciar"}
    >
        {#if $audioStore.musicVolume === 0 || $audioStore.isMuted}
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
                ><path
                    d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                /></svg
            >
        {:else if $audioStore.musicVolume < 0.5}
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
                ><path d="M7 9v6h4l5 5V4l-5 5H7z" /></svg
            >
        {:else}
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
                ><path
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
                /></svg
            >
        {/if}
    </button>

    <!-- Horizontal Slider (Expands to Right) -->
    <!-- Always rendered but hidden via width/opacity for transition -->
    <div
        class="flex items-center transition-all duration-300 ease-out overflow-hidden {isHovering
            ? 'w-24 opacity-100 ml-2'
            : 'w-0 opacity-0 ml-0 hover:w-24 hover:opacity-100'}"
    >
        <div
            class="relative w-full h-1.5 bg-white/10 rounded-full group/slider"
        >
            <!-- Track Fill -->
            <div
                class="absolute left-0 top-0 h-full bg-primary-500 rounded-full"
                style="width: {$audioStore.musicVolume * 100}%"
            >
                <!-- Knob (Visible on hover of slider) -->
                <div
                    class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity"
                ></div>
            </div>

            <!-- Input -->
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={$audioStore.musicVolume}
                on:input={handleVolumeChange}
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    </div>
</div>
