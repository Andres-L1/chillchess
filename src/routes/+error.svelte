<script lang="ts">
    // @ts-ignore
    import { page } from "$app/stores";
    import { onMount } from "svelte";

    interface Particle {
        id: number;
        x: number;
        y: number;
        size: number;
        duration: number;
        delay: number;
    }

    // Simple particle effect for aesthetics
    let particles: Particle[] = [];

    onMount(() => {
        particles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
        }));
    });
</script>

<div
    class="min-h-screen bg-[#0B1120] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden"
>
    <!-- Background Effects -->
    <div class="absolute inset-0 z-0">
        <div
            class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(69,26,160,0.15),transparent_70%)]"
        ></div>

        {#each particles as p}
            <div
                class="absolute rounded-full bg-white/10 animate-float"
                style="
                    left: {p.x}%; 
                    top: {p.y}%; 
                    width: {p.size}px; 
                    height: {p.size}px; 
                    animation-duration: {p.duration}s;
                    animation-delay: {p.delay}s;
                "
            ></div>
        {/each}
    </div>

    <div
        class="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto"
    >
        <!-- Error Code -->
        <h1
            class="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 leading-none select-none opacity-90 blur-sm"
        >
            {$page.status}
        </h1>

        <!-- Chess Icon with Glitch Effect -->
        <div class="mb-8 relative">
            <svg
                class="w-24 h-24 text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                fill="currentColor"
                viewBox="0 0 24 24"
            >
                <!-- Rotated/Fallen Pawn implementation -->
                <path
                    d="M19 22H5v-2h14v2zm-2-4H7v-2h10v2zm-2-4H9V8h6v6zM12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"
                    transform="rotate(15, 12, 12)"
                />
            </svg>
        </div>

        <!-- Message -->
        <h2 class="text-3xl font-bold mb-4 tracking-tight">
            {#if $page.status === 404}
                Jugada ilegal: Página no encontrada
            {:else}
                Algo ha salido mal en el tablero
            {/if}
        </h2>

        <p class="text-slate-400 mb-10 text-lg leading-relaxed">
            {#if $page.status === 404}
                Parece que esta casilla no existe en el tablero. La pieza que
                buscas se ha movido o nunca estuvo aquí.
            {:else}
                {$page.error?.message ||
                    "Ha ocurrido un error inesperado al procesar tu movimiento."}
            {/if}
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4">
            <a
                href="/"
                class="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
            >
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    /></svg
                >
                Volver al Inicio
            </a>

            <button
                on:click={() => history.back()}
                class="px-8 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    /></svg
                >
                Regresar
            </button>
        </div>

        <!-- Debug Info (only for error, not 404) -->
        {#if $page.status !== 404 && $page.status !== 200}
            <div
                class="mt-12 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left w-full"
            >
                <p class="text-red-400 text-xs font-mono break-all">
                    Error ID: {Math.random().toString(36).substr(2, 9)}<br />
                    {$page.error?.message}
                </p>
            </div>
        {/if}
    </div>
</div>

<style>
    @keyframes float {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.5;
        }
        90% {
            opacity: 0.5;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }

    .animate-float {
        animation-name: float;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
    }
</style>
