<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { AlertTriangle, Ghost, ServerCrash, Home } from 'lucide-svelte';

    export let status = 500;
    export let error: Error | null = null;
</script>

<svelte:head>
    <title>Error {status} | MultiTool</title>
    <meta
        name="description"
        content="Ha ocurrido un error. Vuelve al inicio para continuar usando MultiTool."
    />
</svelte:head>

<div class="min-h-[100dvh] flex items-center justify-center p-4 bg-[#0B0E14]">
    <div
        class="max-w-2xl w-full text-center space-y-8 bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-700/50"
    >
        <div class="flex justify-center mb-6">
            {#if status === 404}
                <Ghost class="w-24 h-24 text-brand-400 animate-bounce" />
            {:else if status === 500}
                <ServerCrash class="w-24 h-24 text-brand-400" />
            {:else}
                <AlertTriangle class="w-24 h-24 text-brand-400" />
            {/if}
        </div>

        <div class="space-y-3">
            <h1 class="text-6xl md:text-8xl font-black text-white tracking-tighter">
                {status}
            </h1>
            <h2 class="text-2xl md:text-3xl font-bold text-slate-300">
                {#if status === 404}
                    Página No Encontrada
                {:else if status === 500}
                    Error del Servidor
                {:else}
                    Algo salió mal
                {/if}
            </h2>
        </div>

        <p class="text-lg text-slate-400 max-w-md mx-auto">
            {#if status === 404}
                La herramienta que buscas no existe o ha sido movida.
            {:else if status === 500}
                Hemos tenido un problema interno en el servidor.
            {:else}
                Ha ocurrido un error inesperado al cargar la aplicación.
            {/if}
        </p>

        {#if error?.message}
            <details
                class="bg-slate-800/50 p-4 rounded-xl text-left text-sm text-slate-400 max-w-md mx-auto cursor-pointer border border-slate-700/50"
            >
                <summary class="font-bold text-slate-300 cursor-pointer">Detalles técnicos</summary>
                <div class="mt-2 overflow-auto text-xs bg-slate-950/50 text-slate-300 p-2 rounded">
                    {error.message}
                </div>
            </details>
        {/if}

        <div class="flex justify-center pt-6">
            <button
                on:click={() => goto('/')}
                class="px-8 py-4 bg-brand-600 hover:bg-brand-500 active:scale-95 rounded-2xl font-bold text-white transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-3"
            >
                <Home class="w-6 h-6" />
                <span>Volver al Inicio</span>
            </button>
        </div>
    </div>
</div>
