<script lang="ts">
    // @ts-nocheck
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { audioStore } from "$lib/audio/store";

    // Background images for each vibe
    const BACKGROUNDS = {
        noir: "/assets/images/backgrounds/lofi-study.png",
        library: "/assets/images/backgrounds/library.png",
        zen: "/assets/images/backgrounds/zen-garden.png",
    };

    // Simple rain particle generation
    let raindrops: { left: number; delay: number; duration: number }[] = [];
    let isMobile = false;

    $: currentBg =
        $audioStore.activeVibe === "custom"
            ? BACKGROUNDS.noir
            : BACKGROUNDS[$audioStore.activeVibe];
    $: showRain = $audioStore.currentAmbience === "rain";

    // Conditional styling: only show on app page
    $: isApp = $page.url.pathname.startsWith("/app");

    onMount(() => {
        // Detect mobile for performance optimization
        isMobile = window.innerWidth < 768;

        // Generate rain drops - fewer on mobile for better performance
        const particleCount = isMobile ? 50 : 75;
        raindrops = Array.from({ length: particleCount }, () => ({
            left: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 0.5 + Math.random() * 0.5,
        }));
    });
</script>

{#if isApp}
    <div class="fixed inset-0 -z-10 overflow-hidden bg-black">
        <!-- Ken Burns Background - GPU accelerated -->
        <div
            class="absolute inset-0 bg-cover bg-center animate-ken-burns opacity-60 transition-all duration-1000"
            style="background-image: url('{currentBg}'); will-change: transform;"
        ></div>

        <!-- Rain Overlay (only for Noir vibe) -->
        {#if showRain}
            <div
                class="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-500"
            >
                {#each raindrops as drop}
                    <div
                        class="absolute top-[-10px] w-[1px] h-[15px] bg-white/50 animate-rain"
                        style="left: {drop.left}%; animation-delay: {drop.delay}s; animation-duration: {drop.duration}s; will-change: transform;"
                    ></div>
                {/each}
            </div>
        {/if}

        <!-- Vignette & Tint -->
        <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none mix-blend-multiply"
        ></div>
        <div
            class="absolute inset-0 bg-primary-900/10 pointer-events-none mix-blend-overlay"
        ></div>
    </div>
{/if}

<style>
    @keyframes ken-burns {
        0% {
            transform: scale(1) translate(0, 0);
        }
        50% {
            transform: scale(1.1) translate(-2%, 1%);
        }
        100% {
            transform: scale(1) translate(0, 0);
        }
    }

    .animate-ken-burns {
        animation: ken-burns 60s ease-in-out infinite alternate;
        /* GPU acceleration */
        transform: translateZ(0);
        backface-visibility: hidden;
    }

    @keyframes rain {
        0% {
            transform: translateY(-10px);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(100vh);
            opacity: 0;
        }
    }

    .animate-rain {
        animation-name: rain;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        /* GPU acceleration */
        transform: translateZ(0);
        backface-visibility: hidden;
    }
</style>
