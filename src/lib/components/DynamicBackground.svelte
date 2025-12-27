<script lang="ts">
    import { onMount } from "svelte";

    // Simple rain particle generation
    let raindrops: { left: number; delay: number; duration: number }[] = [];

    onMount(() => {
        // Generate rain drops
        raindrops = Array.from({ length: 100 }, () => ({
            left: Math.random() * 100, // %
            delay: Math.random() * 2, // s
            duration: 0.5 + Math.random() * 0.5, // s
        }));
    });
</script>

<div class="fixed inset-0 -z-10 overflow-hidden bg-black">
    <!-- Ken Burns Background -->
    <div
        class="absolute inset-0 bg-cover bg-center animate-ken-burns opacity-60"
        style="background-image: url('/assets/images/backgrounds/lofi-study.png');"
    ></div>

    <!-- Rain Overlay -->
    <div class="absolute inset-0 pointer-events-none opacity-40">
        {#each raindrops as drop}
            <div
                class="absolute top-[-10px] w-[1px] h-[15px] bg-white/50 animate-rain"
                style="left: {drop.left}%; animation-delay: {drop.delay}s; animation-duration: {drop.duration}s;"
            ></div>
        {/each}
    </div>

    <!-- Vignette & Tint -->
    <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none mix-blend-multiply"
    ></div>
    <div
        class="absolute inset-0 bg-primary-900/10 pointer-events-none mix-blend-overlay"
    ></div>
</div>

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
    }
</style>
