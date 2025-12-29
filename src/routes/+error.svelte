<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    export let status = 500;
    export let error: Error | null = null;
</script>

<svelte:head>
    <title>Error {status} | ChillChess</title>
</svelte:head>

<div
    class="min-h-screen bg-midnight-900 text-white font-poppins flex items-center justify-center p-4"
>
    <div class="max-w-2xl w-full text-center space-y-8">
        <!-- Error Icon -->
        <div class="text-8xl">
            {#if status === 404}
                🔍
            {:else if status === 500}
                ♟️
            {:else}
                ⚠️
            {/if}
        </div>

        <!-- Error Title -->
        <div class="space-y-3">
            <h1 class="text-6xl md:text-8xl font-bold text-primary-500">
                {status}
            </h1>
            <h2 class="text-2xl md:text-3xl font-bold text-slate-100">
                {#if status === 404}
                    Página No Encontrada
                {:else if status === 500}
                    Algo Ha Salido Mal
                {:else}
                    Error
                {/if}
            </h2>
        </div>

        <!-- Error Message -->
        <p class="text-lg text-slate-400 max-w-md mx-auto">
            {#if status === 404}
                La página que buscas no existe o ha sido movida.
            {:else if status === 500}
                Hemos tenido un problema en el servidor. Nuestro equipo ha sido
                notificado y estamos trabajando en solucionarlo.
            {:else}
                Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
            {/if}
        </p>

        {#if error?.message}
            <details
                class="bg-white/5 p-4 rounded-xl text-left text-sm text-slate-500 max-w-md mx-auto cursor-pointer"
            >
                <summary class="font-medium text-slate-300 cursor-pointer"
                    >Detalles técnicos</summary
                >
                <pre class="mt-2 overflow-auto">{error.message}</pre>
            </details>
        {/if}

        <!-- Action Buttons -->
        <div
            class="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
        >
            <button
                on:click={() => goto("/")}
                class="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-primary-900/30"
            >
                🏠 Volver al Inicio
            </button>

            <button
                on:click={() => goto("/coleccion")}
                class="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-lg transition-all"
            >
                🎵 Ir a la Colección
            </button>
        </div>

        <!-- Support Link -->
        <div class="pt-6 border-t border-white/10">
            <p class="text-sm text-slate-500">
                ¿El problema persiste?
                <a
                    href="https://discord.gg/G7SrFtJHnr"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary-400 hover:text-primary-300 underline ml-1"
                >
                    Contáctanos en Discord
                </a>
            </p>
        </div>
    </div>
</div>
