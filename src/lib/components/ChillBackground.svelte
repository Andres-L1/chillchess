<script lang="ts">
    import { vibeStore } from "$lib/stores/vibeStore";
    import { fade, fly } from "svelte/transition";

    // Rain generation for Noir mode
    const rainDrops = Array(100).fill(0);
</script>

<div
    class="absolute inset-0 overflow-hidden bg-black transition-colors duration-1000"
>
    <!-- === MODE: NONE (Silencio Digital) === -->
    {#if $vibeStore.background === "none"}
        <div
            class="absolute inset-0 bg-[#0B1120]"
            transition:fade={{ duration: 1000 }}
        ></div>
    {/if}

    <!-- === MODE: LIBRARY (Default Lo-Fi Room) === -->
    {#if $vibeStore.background === "library" || !$vibeStore.background || $vibeStore.background === "gradient"}
        <div class="absolute inset-0" transition:fade={{ duration: 1000 }}>
            <!-- Sky Gradient -->
            <div
                class="absolute inset-0 bg-gradient-to-b from-[#1a1f3a] via-[#2d1b4e] to-[#0B1120]"
            ></div>

            <!-- Stars -->
            <div class="absolute inset-0">
                {#each Array(30) as _, i}
                    <div
                        class="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                        style="left: {Math.random() *
                            100}%; top: {Math.random() * 60}%; opacity: {0.3 +
                            Math.random() *
                                0.7}; animation-delay: {Math.random() * 3}s;"
                    ></div>
                {/each}
            </div>

            <!-- Moon -->
            <div class="absolute top-20 right-24 w-24 h-24 md:w-32 md:h-32">
                <div
                    class="w-full h-full rounded-full bg-gradient-to-br from-yellow-100 to-orange-200 shadow-[0_0_60px_rgba(255,220,120,0.4)] animate-float"
                ></div>
            </div>

            <!-- Room Silhouette (Simplified for file size, kept main elements) -->
            <div
                class="absolute bottom-0 left-0 right-0 h-[60%] flex items-end justify-center pointer-events-none"
            >
                <div class="relative w-full max-w-4xl h-full">
                    <!-- Desk -->
                    <div
                        class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent"
                    ></div>
                    <!-- Coffee -->
                    <div
                        class="absolute bottom-16 left-1/2 -translate-x-1/2 animate-float"
                    >
                        <div
                            class="relative w-12 h-14 bg-gradient-to-b from-[#d4a574] to-[#8b6f47] rounded-b-lg"
                        ></div>
                        {#each Array(3) as _, i}
                            <div
                                class="absolute -top-8 left-1/2 w-1 h-8 bg-white/30 rounded-full blur-sm animate-steam"
                                style="animation-delay: {i *
                                    0.3}s; left: calc(50% + {(i - 1) * 8}px)"
                            ></div>
                        {/each}
                    </div>
                    <!-- Lamp -->
                    <div class="absolute bottom-24 right-[30%]">
                        <div
                            class="w-20 h-14 bg-gradient-to-b from-[#e8d4a8] to-[#d4a574] rounded-b-full relative"
                        >
                            <div
                                class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-200/10 rounded-full blur-2xl animate-pulse-slow"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- === MODE: NOIR (Rain) === -->
    {#if $vibeStore.background === "noir"}
        <div
            class="absolute inset-0 bg-gradient-to-b from-slate-900 to-black"
            transition:fade={{ duration: 1000 }}
        >
            <!-- Heavy Rain CSS -->
            <div class="rain-container absolute inset-0 opacity-40">
                {#each rainDrops as _, i}
                    <div
                        class="rain-drop"
                        style="left: {Math.random() *
                            100}%; animation-duration: {0.5 +
                            Math.random() *
                                0.5}s; animation-delay: {Math.random() * 2}s;"
                    ></div>
                {/each}
            </div>
            <!-- Fog -->
            <div
                class="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-slate-800/50 to-transparent blur-3xl"
            ></div>
        </div>
    {/if}

    <!-- === MODE: ZENT (Nature) === -->
    {#if $vibeStore.background === "zen"}
        <div
            class="absolute inset-0 bg-gradient-to-br from-[#1a2e1a] to-[#0d1f12]"
            transition:fade={{ duration: 1000 }}
        >
            <!-- Floating Fireflies -->
            {#each Array(20) as _, i}
                <div
                    class="absolute w-1 h-1 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-float-slow"
                    style="left: {Math.random() * 100}%; top: {Math.random() *
                        100}%; animation-duration: {4 + Math.random() * 4}s;"
                ></div>
            {/each}
            <!-- Bamboo Silhouette hints (CSS) -->
            <div
                class="absolute bottom-0 left-10 w-4 h-[60vh] bg-black/20 blur-sm transform rotate-2"
            ></div>
            <div
                class="absolute bottom-0 right-20 w-6 h-[70vh] bg-black/20 blur-sm transform -rotate-1"
            ></div>
        </div>
    {/if}

    <!-- === MODE: CYBER (Neon Grid) === -->
    {#if $vibeStore.background === "cyber"}
        <div
            class="absolute inset-0 bg-[#050510] overflow-hidden perspective-container"
            transition:fade={{ duration: 1000 }}
        >
            <!-- Sun -->
            <div
                class="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-b from-yellow-400 to-pink-600 blur-2xl opacity-80"
            ></div>
            <!-- Grid Floor -->
            <div
                class="absolute bottom-0 w-[200%] -left-[50%] h-[50vh] bg-grid perspective-grid animate-grid-move"
            ></div>
            <div
                class="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent"
            ></div>
        </div>
    {/if}

    <!-- === MODE: SPACE (Cosmos) === -->
    {#if $vibeStore.background === "space"}
        <div
            class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-[#0B1120] to-black"
            transition:fade={{ duration: 1000 }}
        >
            <!-- Stars -->
            {#each Array(100) as _, i}
                <div
                    class="absolute bg-white rounded-full animate-twinkle"
                    style="width: {Math.random() *
                        2}px; height: {Math.random() *
                        2}px; left: {Math.random() *
                        100}%; top: {Math.random() *
                        100}%; animation-duration: {1 + Math.random() * 3}s;"
                ></div>
            {/each}
            <!-- Nebula -->
            <div
                class="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl mix-blend-screen animate-pulse-slow"
            ></div>
            <div
                class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl mix-blend-screen animate-pulse-slow"
                style="animation-delay: 2s;"
            ></div>
        </div>
    {/if}

    <!-- === MODE: BREATHE (4-7-8) === -->
    {#if $vibeStore.background === "breathe"}
        <div
            class="absolute inset-0 flex items-center justify-center bg-[#0B1120]"
            transition:fade={{ duration: 1000 }}
        >
            <div
                class="w-64 h-64 bg-primary-500/30 rounded-full blur-3xl animate-breathe"
            ></div>
            <div
                class="absolute text-primary-200 font-mono tracking-widest text-sm opacity-50"
            >
                INHALA · RETÉN · EXHALA
            </div>
        </div>
    {/if}
</div>

<style>
    /* Animations */
    .animate-float {
        animation: float 6s ease-in-out infinite;
    }
    .animate-float-slow {
        animation: float 10s ease-in-out infinite alternate;
    }
    .animate-steam {
        animation: steam 2s ease-out infinite;
    }
    .animate-twinkle {
        animation: twinkle 3s ease-in-out infinite;
    }
    .animate-pulse-slow {
        animation: pulse 8s ease-in-out infinite;
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-20px);
        }
    }
    @keyframes steam {
        0% {
            transform: translateY(0) scale(1);
            opacity: 0;
        }
        50% {
            opacity: 0.5;
        }
        100% {
            transform: translateY(-40px) scale(1.5);
            opacity: 0;
        }
    }
    @keyframes twinkle {
        0%,
        100% {
            opacity: 0.3;
        }
        50% {
            opacity: 1;
        }
    }
    @keyframes pulse {
        0%,
        100% {
            opacity: 0.3;
            transform: scale(1);
        }
        50% {
            opacity: 0.6;
            transform: scale(1.1);
        }
    }

    /* Rain */
    .rain-drop {
        position: absolute;
        width: 1px;
        height: 40px;
        background: linear-gradient(
            to bottom,
            transparent,
            rgba(255, 255, 255, 0.4)
        );
        top: -50px;
        animation: rain linear infinite;
    }
    @keyframes rain {
        100% {
            top: 100%;
        }
    }

    /* Cyber Grid */
    .perspective-container {
        perspective: 500px;
    }
    .bg-grid {
        background-image: linear-gradient(
                to right,
                rgba(236, 72, 153, 0.3) 1px,
                transparent 1px
            ),
            linear-gradient(
                to bottom,
                rgba(236, 72, 153, 0.3) 1px,
                transparent 1px
            );
        background-size: 40px 40px;
        transform-origin: bottom;
        transform: rotateX(60deg);
    }
    .animate-grid-move {
        animation: gridMove 2s linear infinite;
    }
    @keyframes gridMove {
        from {
            background-position: 0 0;
        }
        to {
            background-position: 0 40px;
        }
    }

    /* Breathe */
    .animate-breathe {
        animation: breathe 19s infinite ease-in-out;
    } /* 4+7+8 = 19s cycle approx simulation */
    @keyframes breathe {
        0% {
            transform: scale(1);
            opacity: 0.2;
        } /* Inhale 4s */
        20% {
            transform: scale(1.5);
            opacity: 0.5;
        } /* Hold 7s */
        55% {
            transform: scale(1.5);
            opacity: 0.5;
        }
        100% {
            transform: scale(1);
            opacity: 0.2;
        } /* Exhale 8s */
    }
</style>
