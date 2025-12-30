<script lang="ts">
    import { audioStore, setMusicVolume } from "$lib/audio/store";

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

<script lang="ts">
    import { audioStore, setMusicVolume } from "$lib/audio/store";
    import { fly, fade } from 'svelte/transition';

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
    class="relative flex items-center justify-center p-2"
    on:mouseenter={() => isHovering = true}
    on:mouseleave={() => isHovering = false}
>
    <!-- Mute/Unmute Button -->
    <button
        on:click={() => setMusicVolume($audioStore.musicVolume === 0 ? 0.5 : 0)}
        class="text-slate-400 hover:text-white transition-colors relative z-10 p-2"
        title={$audioStore.musicVolume === 0 ? "Activar Sonido" : "Silenciar"}
    >
        {#if $audioStore.musicVolume === 0 || $audioStore.isMuted}
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
        {:else if $audioStore.musicVolume < 0.5}
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 9v6h4l5 5V4l-5 5H7z" /></svg>
        {:else}
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
        {/if}
    </button>

    <!-- Vertical Slider Popup -->
    {#if isHovering}
        <div 
            transition:fly={{ y: 10, duration: 200 }}
            class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-10 h-32 bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-end p-3 shadow-2xl z-50"
        >
            <div class="relative w-1.5 h-full bg-white/10 rounded-full flex items-end group">
                <!-- Track Fill -->
                <div 
                    class="w-full bg-primary-500 rounded-full relative"
                    style="height: {$audioStore.musicVolume * 100}%"
                >
                    <!-- Knob -->
                    <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md"></div>
                </div>
                
                <!-- Invisible Range Input -->
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    orient="vertical"
                    value={$audioStore.musicVolume}
                    on:input={handleVolumeChange}
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                    style="-webkit-appearance: slider-vertical;"
                />
            </div>
            <span class="text-[10px] font-bold text-slate-400 mt-2 font-mono">{Math.round($audioStore.musicVolume * 100)}%</span>
        </div>
    {/if}
</div>            <div
                class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
                {Math.round($audioStore.musicVolume * 100)}%
            </div>
        </div>
    </div>
</div>
