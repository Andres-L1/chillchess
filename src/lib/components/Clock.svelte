<script lang="ts">
    import { vibeStore } from "$lib/stores/vibeStore";
    import { fade } from "svelte/transition";

    export let timeLeft: number; // In seconds

    let timeString = "";

    // Format seconds to MM:SS
    $: {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timeString = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }

    // Styles configuration
    const styles = {
        modern: "font-poppins font-light tracking-tighter",
        neon: "font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-primary-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]",
        elegant: "font-serif italic tracking-wide", // Needs a serif font loaded or system serif
        retro: "font-mono tracking-tight", // Will add pixelated effect style
        analog: "", // Handled separately
    };

    // Analog Clock Calculations logic moved here to script for safety
    // Rotations based on remaining time (countdown style? or time style?)
    // Assuming simple mapping:
    // Seconds hand rotates 360 deg every minute (timeLeft % 60)
    // Minute hand just points roughly to minutes remaining if we treat 60m as full circle
    $: minuteDeg = (timeLeft / 3600) * 360 * -1; // Counter-clockwise or distinct visual
    $: secondDeg = (timeLeft % 60) * 6;
</script>

<div
    class="relative flex items-center justify-center transition-all duration-500 w-full"
    transition:fade
>
    <!-- DIGITAL CLOCKS -->
    {#if $vibeStore.clockStyle !== "analog"}
        <div class="relative group cursor-default text-center">
            <!-- Main Time Display -->
            <div
                class="text-5xl md:text-8xl select-none transition-all duration-300
                {styles[$vibeStore.clockStyle]}
                {$vibeStore.clockStyle === 'retro' ? 'pixel-font' : ''}
                text-white"
            >
                {timeString}
            </div>

            <!-- Seconds (Optional - for future) -->
            {#if $vibeStore.showSeconds}
                <span
                    class="absolute -right-8 bottom-4 text-xl opacity-50 font-mono"
                >
                    {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
            {/if}

            <!-- Neon Glow Effect Extra Layer -->
            {#if $vibeStore.clockStyle === "neon"}
                <div
                    class="absolute inset-0 blur-xl opacity-50 text-primary-400 select-none pointer-events-none"
                    aria-hidden="true"
                >
                    {timeString}
                </div>
            {/if}
        </div>

        <!-- ANALOG CLOCK (SVG) -->
    {:else}
        <div
            class="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl flex items-center justify-center"
        >
            <!-- Face Markers -->
            {#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as i}
                <div
                    class="absolute w-1 h-3 bg-white/30 rounded-full"
                    style="transform: rotate({i * 30}deg) translateY(-450%);"
                ></div>
            {/each}

            <!-- Minute Hand (Main) -->
            <!-- Using simple CSS rotation for hands -->
            <div
                class="absolute w-1.5 h-1/2 top-1/2 left-1/2 bg-white rounded-full origin-bottom shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10"
                style="height: 35%; margin-left: -3px; margin-top: -35%; transform: rotate({(timeLeft /
                    3600) *
                    360}deg)"
            ></div>

            <!-- Second Hand (Fast) -->
            <div
                class="absolute w-0.5 h-1/2 top-1/2 left-1/2 bg-primary-400 rounded-full origin-bottom z-20 opacity-80"
                style="height: 45%; margin-left: -1px; margin-top: -45%; transform: rotate({(timeLeft %
                    60) *
                    6}deg)"
            ></div>

            <!-- Center Dot -->
            <div
                class="absolute w-3 h-3 bg-white rounded-full z-30 shadow-lg"
            ></div>
        </div>
    {/if}
</div>

<style>
    /* Retro Pixel Effect */
    .pixel-font {
        font-family: "Courier New", Courier, monospace;
        font-weight: bold;
        letter-spacing: -0.05em;
    }
</style>
