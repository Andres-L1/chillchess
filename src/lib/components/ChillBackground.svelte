<script lang="ts">
    import { onMount } from "svelte";

    let time = new Date();

    onMount(() => {
        const interval = setInterval(() => {
            time = new Date();
        }, 1000);

        return () => clearInterval(interval);
    });

    $: hours = time.getHours().toString().padStart(2, "0");
    $: minutes = time.getMinutes().toString().padStart(2, "0");
</script>

<div class="absolute inset-0 overflow-hidden">
    <!-- Sky Gradient -->
    <div
        class="absolute inset-0 bg-gradient-to-b from-[#1a1f3a] via-[#2d1b4e] to-[#0B1120]"
    ></div>

    <!-- Stars -->
    <div class="absolute inset-0">
        {#each Array(50) as _, i}
            <div
                class="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                style="
                    left: {Math.random() * 100}%;
                    top: {Math.random() * 60}%;
                    opacity: {0.3 + Math.random() * 0.7};
                    animation-delay: {Math.random() * 3}s;
                "
            ></div>
        {/each}
    </div>

    <!-- Moon -->
    <div class="absolute top-20 right-24 w-24 h-24 md:w-32 md:h-32">
        <div
            class="w-full h-full rounded-full bg-gradient-to-br from-yellow-100 to-orange-200 shadow-[0_0_60px_rgba(255,220,120,0.4)] animate-float"
        ></div>
    </div>

    <!-- Floating Clouds -->
    <div
        class="absolute top-32 left-[10%] w-32 h-12 opacity-20 animate-cloud-slow"
    >
        <div class="w-full h-full bg-white rounded-full blur-xl"></div>
    </div>
    <div
        class="absolute top-48 right-[20%] w-40 h-14 opacity-15 animate-cloud-medium"
    >
        <div class="w-full h-full bg-white rounded-full blur-xl"></div>
    </div>

    <!-- Window Frame -->
    <div
        class="absolute bottom-0 left-0 right-0 h-[60%] flex items-end justify-center pointer-events-none"
    >
        <!-- Room Interior Silhouette -->
        <div class="relative w-full max-w-4xl h-full">
            <!-- Desk Silhouette -->
            <div
                class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent"
            ></div>

            <!-- Plant Left -->
            <div class="absolute bottom-16 left-12 md:left-24">
                <div class="relative">
                    <!-- Pot -->
                    <div
                        class="w-16 h-20 md:w-20 md:h-24 bg-gradient-to-b from-[#3d2817] to-[#2d1810] rounded-b-2xl"
                    ></div>
                    <!-- Leaves -->
                    {#each Array(5) as _, i}
                        <div
                            class="absolute bottom-16 left-1/2 -translate-x-1/2 w-2 h-12 md:h-16 bg-gradient-to-t from-[#2d5016] to-[#4a7c24] rounded-full origin-bottom animate-sway"
                            style="
                                transform: rotate({-30 +
                                i * 15}deg) translateX(-50%);
                                animation-delay: {i * 0.2}s;
                            "
                        ></div>
                    {/each}
                </div>
            </div>

            <!-- Books Stack Right -->
            <div
                class="absolute bottom-16 right-12 md:right-24 flex flex-col gap-1"
            >
                <div
                    class="w-20 h-6 md:w-24 md:h-8 bg-[#8b4513] rounded-sm transform -rotate-2"
                ></div>
                <div
                    class="w-20 h-6 md:w-24 md:h-8 bg-[#a0522d] rounded-sm transform rotate-1"
                ></div>
                <div
                    class="w-20 h-6 md:w-24 md:h-8 bg-[#cd853f] rounded-sm transform -rotate-1"
                ></div>
            </div>

            <!-- Coffee Cup -->
            <div
                class="absolute bottom-16 left-1/2 -translate-x-1/2 animate-float"
            >
                <!-- Cup -->
                <div
                    class="relative w-12 h-14 md:w-14 md:h-16 bg-gradient-to-b from-[#d4a574] to-[#8b6f47] rounded-b-lg"
                >
                    <!-- Handle -->
                    <div
                        class="absolute -right-3 top-4 w-5 h-8 border-4 border-[#8b6f47] rounded-r-full"
                    ></div>
                    <!-- Steam -->
                    {#each Array(3) as _, i}
                        <div
                            class="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-white/30 rounded-full blur-sm animate-steam"
                            style="
                                left: calc(50% + {(i - 1) * 8}px);
                                animation-delay: {i * 0.3}s;
                            "
                        ></div>
                    {/each}
                </div>
                <!-- Saucer -->
                <div
                    class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 md:w-18 h-2 bg-[#8b6f47] rounded-full"
                ></div>
            </div>

            <!-- Vinyl Record Player (Left of center) -->
            <div
                class="absolute bottom-20 left-[35%] md:left-[40%] animate-float"
                style="animation-delay: 0.5s;"
            >
                <!-- Base -->
                <div
                    class="relative w-20 h-12 md:w-24 md:h-14 bg-gradient-to-b from-[#4a4a4a] to-[#2a2a2a] rounded-lg"
                >
                    <!-- Turntable -->
                    <div
                        class="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-14 md:w-16 md:h-16 bg-[#1a1a1a] rounded-full border-2 border-[#333]"
                    >
                        <!-- Vinyl -->
                        <div
                            class="absolute inset-1 bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-full animate-spin-slow"
                        >
                            <!-- Center Label -->
                            <div
                                class="absolute inset-[30%] bg-gradient-to-br from-red-900 to-red-700 rounded-full flex items-center justify-center text-[6px] text-white/50"
                            >
                                ♪
                            </div>
                            <!-- Grooves -->
                            <div
                                class="absolute inset-2 rounded-full border border-white/5"
                            ></div>
                            <div
                                class="absolute inset-4 rounded-full border border-white/5"
                            ></div>
                        </div>
                    </div>
                    <!-- Tone Arm -->
                    <div
                        class="absolute top-0 right-2 w-8 h-1 bg-[#888] rounded-full origin-right transform rotate-[-25deg]"
                    ></div>
                </div>
            </div>

            <!-- Lamp (Right side) -->
            <div class="absolute bottom-24 right-[30%] md:right-[35%]">
                <!-- Stand -->
                <div
                    class="w-1 h-24 md:h-32 bg-gradient-to-b from-[#666] to-[#333] mx-auto"
                ></div>
                <!-- Shade -->
                <div class="relative -mt-2">
                    <div
                        class="w-16 h-12 md:w-20 md:h-14 bg-gradient-to-b from-[#e8d4a8] to-[#d4a574] rounded-b-full"
                    ></div>
                    <!-- Light Glow -->
                    <div
                        class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-200/10 rounded-full blur-2xl animate-pulse-slow"
                    ></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Atmospheric Particles -->
    {#each Array(20) as _, i}
        <div
            class="absolute w-0.5 h-0.5 bg-white/20 rounded-full animate-float-particle"
            style="
                left: {Math.random() * 100}%;
                top: {Math.random() * 100}%;
                animation-delay: {Math.random() * 5}s;
                animation-duration: {3 + Math.random() * 4}s;
            "
        ></div>
    {/each}

    <!-- Time Display (Bottom Right) -->
    <div
        class="absolute bottom-8 right-8 text-white/20 font-mono text-4xl md:text-5xl font-light tracking-wider"
    >
        {hours}:{minutes}
    </div>
</div>

<style>
    @keyframes twinkle {
        0%,
        100% {
            opacity: 0.3;
        }
        50% {
            opacity: 1;
        }
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    @keyframes sway {
        0%,
        100% {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(3deg);
        }
    }

    @keyframes steam {
        0% {
            transform: translateY(0) translateX(-50%) scale(1);
            opacity: 0;
        }
        50% {
            opacity: 0.6;
        }
        100% {
            transform: translateY(-30px) translateX(-50%) scale(1.5);
            opacity: 0;
        }
    }

    @keyframes cloud-slow {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(20px);
        }
    }

    @keyframes cloud-medium {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-15px);
        }
    }

    @keyframes pulse-slow {
        0%,
        100% {
            opacity: 0.1;
        }
        50% {
            opacity: 0.2;
        }
    }

    @keyframes float-particle {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        50% {
            opacity: 0.4;
        }
        100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
        }
    }

    .animate-twinkle {
        animation: twinkle 3s ease-in-out infinite;
    }

    .animate-float {
        animation: float 4s ease-in-out infinite;
    }

    .animate-sway {
        animation: sway 3s ease-in-out infinite;
    }

    .animate-steam {
        animation: steam 2s ease-out infinite;
    }

    .animate-cloud-slow {
        animation: cloud-slow 20s ease-in-out infinite alternate;
    }

    .animate-cloud-medium {
        animation: cloud-medium 15s ease-in-out infinite alternate;
    }

    .animate-pulse-slow {
        animation: pulse-slow 4s ease-in-out infinite;
    }

    .animate-float-particle {
        animation: float-particle 6s ease-out infinite;
    }

    .animate-spin-slow {
        animation: spin 8s linear infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
</style>
