<script lang="ts">
    import { vibeStore } from "$lib/stores/vibeStore";
    import { fade, fly } from "svelte/transition";

    import { analysisStore } from "$lib/audio/analysis";

    // Audio Reactivity
    $: bass = $analysisStore.isPlaying ? $analysisStore.bass : 0;
    // Smoothed values could be better, but direct binding is responsive
    $: pulseScale = 1 + bass * 0.2; // Gentle pulse
    $: intenseScale = 1 + bass * 0.4; // Stronger pulse
    $: reactiveOpacity = 0.3 + bass * 0.7;

    // Rain generation for Noir mode (Optimized count)
    const rainDrops = Array(30).fill(0);
</script>

<div
    class="absolute inset-0 overflow-hidden bg-black transition-colors duration-1000"
>
    <!-- === MODE: NONE (Silencio Digital) === -->
    {#if $vibeStore.background === "none"}
        <div
            class="absolute inset-0 bg-[#0B1120]"
            transition:fade={{ duration: 1000 }}
        >
            <!-- Subtle Reactive Glow even in Silence mode if music is playing -->
            {#if $analysisStore.isPlaying}
                <div
                    class="absolute inset-0 bg-primary-500/5 mix-blend-overlay transition-opacity duration-75"
                    style="opacity: {bass}"
                ></div>
            {/if}
        </div>
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
                {#each Array(15) as _, i}
                    <div
                        class="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                        style="left: {Math.random() *
                            100}%; top: {Math.random() * 60}%; opacity: {0.3 +
                            Math.random() *
                                0.7}; animation-delay: {Math.random() * 3}s;"
                    ></div>
                {/each}
            </div>

            <!-- Moon (Reactive) -->
            <div
                class="absolute top-20 right-24 w-24 h-24 md:w-32 md:h-32 transition-transform duration-75 origin-center will-change-transform"
                style="transform: scale({pulseScale})"
            >
                <!-- Static Glow Container -->
                <div
                    class="absolute inset-0 rounded-full bg-yellow-100 opacity-20 blur-xl md:blur-2xl transition-opacity duration-75"
                    style="opacity: {0.3 + bass * 0.4}"
                ></div>

                <!-- Moon Body -->
                <div
                    class="w-full h-full rounded-full bg-gradient-to-br from-yellow-100 to-orange-200 shadow-[0_0_60px_rgba(255,220,120,0.3)] animate-float"
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
                    <!-- Lamp (Reactive Light) -->
                    <div class="absolute bottom-24 right-[30%]">
                        <div
                            class="w-20 h-14 bg-gradient-to-b from-[#e8d4a8] to-[#d4a574] rounded-b-full relative"
                        >
                            <div
                                class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-200/10 rounded-full blur-3xl transition-opacity duration-75 will-change-transform"
                                style="opacity: {0.4 +
                                    bass *
                                        0.6}; transform: translate(-50%, -20%) scale({1 +
                                    bass * 0.5});"
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
            <!-- Reactive Lightning Flash (Subtle) -->
            <div
                class="absolute inset-0 bg-blue-500/10 mix-blend-overlay transition-opacity duration-100 pointer-events-none"
                style="opacity: {bass > 0.7 ? bass * 0.3 : 0}"
            ></div>

            <!-- Heavy Rain CSS (Optimized count to 15) -->
            <div class="rain-container absolute inset-0 opacity-40">
                {#each Array(15) as _, i}
                    <div
                        class="rain-drop"
                        style="left: {Math.random() *
                            100}%; animation-duration: {0.5 +
                            Math.random() *
                                0.5}s; animation-delay: {Math.random() * 2}s;"
                    ></div>
                {/each}
            </div>
            <!-- Fog (Reduced complexity) -->
            <div
                class="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-slate-900/80 to-transparent"
            ></div>
        </div>
    {/if}

    <!-- === MODE: ZENT (Nature) === -->
    {#if $vibeStore.background === "zen"}
        <div
            class="absolute inset-0 bg-gradient-to-br from-[#1a2e1a] to-[#0d1f12]"
            transition:fade={{ duration: 1000 }}
        >
            <!-- Reactive Forest Glow -->
            <div
                class="absolute inset-0 bg-green-400/5 transition-opacity duration-300"
                style="opacity: {bass * 0.3}"
            ></div>

            <!-- Floating Fireflies (Reduced to 10) -->
            {#each Array(10) as _, i}
                <div
                    class="absolute w-1 h-1 bg-green-400 rounded-full shadow-[0_0_5px_rgba(74,222,128,0.8)] animate-float-slow transition-transform duration-300"
                    style="left: {Math.random() * 100}%; top: {Math.random() *
                        100}%; animation-duration: {4 +
                        Math.random() * 4}s; transform: scale({pulseScale})"
                ></div>
            {/each}
            <!-- Bamboo Silhouette hints (CSS) -->
            <div
                class="absolute bottom-0 left-10 w-4 h-[50vh] bg-black/20 blur-sm transform rotate-2"
            ></div>
            <div
                class="absolute bottom-0 right-20 w-6 h-[60vh] bg-black/20 blur-sm transform -rotate-1"
            ></div>
        </div>
    {/if}

    <!-- === MODE: CYBER (Neon Grid) === -->
    {#if $vibeStore.background === "cyber"}
        <div
            class="absolute inset-0 bg-[#050510] overflow-hidden perspective-container"
            transition:fade={{ duration: 1000 }}
        >
            <!-- Sun (Reactive) -->
            <div
                class="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 transition-transform duration-75 will-change-transform"
                style="transform: translate(-50%, 0) scale({intenseScale});"
            >
                <!-- Glow Layer (Optimized blur) -->
                <div
                    class="absolute inset-0 rounded-full bg-pink-500 blur-2xl opacity-40 transition-opacity"
                    style="opacity: {0.4 + bass * 0.3}"
                ></div>

                <!-- Sun Core -->
                <div
                    class="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-400 to-pink-600 shadow-lg"
                ></div>
            </div>

            <!-- Grid Floor -->
            <div
                class="absolute bottom-0 w-[200%] -left-[50%] h-[50vh] bg-grid perspective-grid animate-grid-move"
                style="opacity: {0.6 + bass * 0.3}"
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
            <!-- Reactive Core -->
            <div
                class="absolute inset-0 bg-indigo-500/10 mix-blend-screen transition-opacity duration-75"
                style="opacity: {bass * 0.3}"
            ></div>

            <!-- Stars (Reduced to 20) -->
            {#each Array(20) as _, i}
                <div
                    class="absolute bg-white rounded-full animate-twinkle"
                    style="width: {Math.random() *
                        2}px; height: {Math.random() *
                        2}px; left: {Math.random() *
                        100}%; top: {Math.random() *
                        100}%; animation-duration: {1 + Math.random() * 3}s;"
                ></div>
            {/each}
            <!-- Nebula (Reactive) - Reduced size and blur radius -->
            <div
                class="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-2xl mix-blend-screen animate-pulse-slow transition-transform duration-100"
                style="transform: scale({pulseScale})"
            ></div>
            <div
                class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-2xl mix-blend-screen animate-pulse-slow transition-transform duration-100"
                style="animation-delay: 2s; transform: scale({pulseScale})"
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
                class="w-48 h-48 bg-primary-500/30 rounded-full blur-2xl animate-breathe"
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
