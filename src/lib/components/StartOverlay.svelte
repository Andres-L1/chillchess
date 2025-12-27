<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";

    const dispatch = createEventDispatcher();

    function enter() {
        dispatch("start");
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
    class="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/90 backdrop-blur-sm"
    transition:fade
>
    <div class="text-center space-y-8 animate-pulse-slow">
        <h1
            class="h1 font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-tertiary-400"
        >
            ChillChess
        </h1>
        <p class="text-xl font-light opacity-80">
            El Santuario Visual del Ajedrecista
        </p>

        <button
            on:click={enter}
            class="btn variant-filled-primary rounded-full px-8 py-4 shadow-xl text-lg font-semibold hover:scale-105 transition-transform"
        >
            Entrar al Santuario
        </button>

        <p class="text-xs opacity-50 space-y-1">
            <span>Recomendamos usar auriculares</span>
            <br />
            <span>Click para activar la experiencia sonora</span>
        </p>
    </div>
</div>

<style>
    @keyframes pulse-slow {
        0%,
        100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.95;
            transform: scale(0.98);
        }
    }
    .animate-pulse-slow {
        animation: pulse-slow 4s ease-in-out infinite;
    }
</style>
