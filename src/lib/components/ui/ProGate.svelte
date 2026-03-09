<script lang="ts">
    import { authStore } from '$lib/stores/authStore';
    import { Crown, Lock, ArrowRight } from 'lucide-svelte';
    import { goto } from '$app/navigation';
</script>

{#if $authStore.loading}
    <div class="flex flex-col items-center justify-center p-12 min-h-[400px] space-y-4">
        <div
            class="w-16 h-16 border-8 border-black border-t-primary rounded-full animate-spin shadow-neo-sm"
        ></div>
        <p
            class="font-black text-black dark:text-white uppercase tracking-widest text-xs animate-pulse"
        >
            Verificando acceso...
        </p>
    </div>
{:else if $authStore.user?.isPro || $authStore.user?.isAdmin}
    <slot />
{:else}
    <div class="flex flex-col items-center justify-center py-24 px-4 text-center">
        <!-- Locked Icon Container -->
        <div class="relative mb-12 transform -rotate-3">
            <div
                class="w-32 h-32 bg-white dark:bg-slate-900 border-4 border-black flex items-center justify-center shadow-neo"
            >
                <Lock class="w-16 h-16 text-black dark:text-white" />
                <div
                    class="absolute -top-6 -right-6 w-14 h-14 bg-primary border-4 border-black flex items-center justify-center shadow-neo"
                >
                    <Crown class="w-7 h-7 text-white" />
                </div>
            </div>
        </div>

        <h2
            class="text-3xl md:text-7xl font-black text-black dark:text-white mb-8 tracking-tighter uppercase italic leading-none"
        >
            CONTENIDO <span
                class="bg-black text-white px-4 dark:bg-white dark:text-black shadow-neo">PRO</span
            >
        </h2>

        <p
            class="text-black dark:text-white max-w-lg mb-12 text-xl font-bold tracking-tight uppercase leading-tight italic"
        >
            ESTA HERRAMIENTA ES EXCLUSIVA PARA MIEMBROS <span class="text-primary underline px-1"
                >CHILLCHESS PRO</span
            >. DESBLOQUEA TODO EL POTENCIAL AHORA MISMO.
        </p>

        <button
            on:click={() => goto('/pricing')}
            class="group relative inline-flex items-center justify-center gap-6 px-12 py-8 bg-primary text-white border-4 border-black font-black transition-all shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none uppercase tracking-widest text-lg italic"
        >
            DESBLOQUEAR ACCESO
            <ArrowRight class="w-7 h-7 group-hover:translate-x-2 transition-transform" />
        </button>

        <p class="mt-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            ACCESO INSTANTÁNEO A MÁS DE 20 HERRAMIENTAS
        </p>
    </div>
{/if}
