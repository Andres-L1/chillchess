<script lang="ts">
    export let vibe: string = "noir";
    export let active: boolean = false;
</script>

<div
    class="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-1000"
    class:opacity-40={active}
    class:opacity-0={!active}
>
    <!-- Wave 1 -->
    <div
        class="wave absolute bottom-0 left-0 w-[200%] h-[50%] opacity-30 mix-blend-screen animate-wave-slow"
        class:bg-blue-500={vibe === "noir"}
        class:bg-amber-600={vibe === "library"}
        class:bg-pink-400={vibe === "zen"}
    ></div>

    <!-- Wave 2 -->
    <div
        class="wave absolute bottom-[-10%] left-[-50%] w-[200%] h-[50%] opacity-30 mix-blend-screen animate-wave-medium delay-700"
        class:bg-purple-600={vibe === "noir"}
        class:bg-orange-500={vibe === "library"}
        class:bg-green-400={vibe === "zen"}
    ></div>

    <!-- Wave 3 -->
    <div
        class="wave absolute bottom-[-20%] left-[-20%] w-[200%] h-[60%] opacity-20 mix-blend-screen animate-wave-fast delay-1000"
        class:bg-indigo-500={vibe === "noir"}
        class:bg-yellow-600={vibe === "library"}
        class:bg-teal-400={vibe === "zen"}
    ></div>
</div>

<style>
    .wave {
        border-radius: 45% 40% 45% 40%;
        filter: blur(40px);
    }

    @keyframes wave {
        0% {
            transform: translate(0, 0) rotate(0deg);
        }
        50% {
            transform: translate(-2%, -5%) rotate(5deg);
        }
        100% {
            transform: translate(0, 0) rotate(0deg);
        }
    }

    .animate-wave-slow {
        animation: wave 15s infinite ease-in-out;
    }
    .animate-wave-medium {
        animation: wave 10s infinite ease-in-out reverse;
    }
    .animate-wave-fast {
        animation: wave 7s infinite ease-in-out;
    }
</style>
