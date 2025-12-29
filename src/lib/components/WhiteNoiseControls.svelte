<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import type { WhiteNoiseType } from "$lib/audio/store";

    const whiteNoises: { id: WhiteNoiseType; label: string; icon: string }[] = [
        { id: "none", label: "Ninguno", icon: "🔇" },
        { id: "rain", label: "Lluvia", icon: "🌧️" },
        { id: "fire", label: "Fuego", icon: "🔥" },
        { id: "cafe", label: "Café", icon: "☕" },
        { id: "ocean", label: "Océano", icon: "🌊" },
        { id: "forest", label: "Bosque", icon: "🌲" },
    ];

    function setWhiteNoise(type: WhiteNoiseType) {
        audioStore.update((s) => ({ ...s, currentWhiteNoise: type }));
    }

    function handleVolumeChange(e: Event) {
        const target = e.target as HTMLInputElement;
        audioStore.update((s) => ({
            ...s,
            whiteNoiseVolume: parseFloat(target.value),
        }));
    }
</script>

<div class="white-noise-controls">
    <h3 class="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
        <span>🎧</span>
        <span>Sonidos Ambientales</span>
    </h3>

    <!-- Noise Selector -->
    <div class="grid grid-cols-3 gap-2 mb-4">
        {#each whiteNoises as noise}
            <button
                on:click={() => setWhiteNoise(noise.id)}
                class="p-3 rounded-xl text-center transition-all {$audioStore.currentWhiteNoise ===
                noise.id
                    ? 'bg-primary-500 text-white scale-105 shadow-lg'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}"
            >
                <div class="text-2xl mb-1">{noise.icon}</div>
                <div class="text-xs font-medium">{noise.label}</div>
            </button>
        {/each}
    </div>

    <!-- Volume Slider -->
    {#if $audioStore.currentWhiteNoise !== "none"}
        <div class="space-y-2">
            <div
                class="flex justify-between items-center text-xs text-slate-400"
            >
                <span>Volumen</span>
                <span>{Math.round($audioStore.whiteNoiseVolume * 100)}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={$audioStore.whiteNoiseVolume}
                on:input={handleVolumeChange}
                class="w-full accent-primary-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
        </div>
    {/if}
</div>

<style>
    /* Custom range styling */
    input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #ff7b3d;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(255, 123, 61, 0.4);
    }

    input[type="range"]::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #ff7b3d;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 8px rgba(255, 123, 61, 0.4);
    }
</style>
