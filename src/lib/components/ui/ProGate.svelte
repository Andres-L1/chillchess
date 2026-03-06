<script lang="ts">
    import { authStore } from '$lib/stores/authStore';
    import { Crown, Lock, ArrowRight } from 'lucide-svelte';
    import { goto } from '$app/navigation';
</script>

{#if $authStore.loading}
    <div class="flex items-center justify-center p-12 min-h-[400px]">
        <div class="w-8 h-8 rounded-full border-t-2 border-r-2 border-brand-500 animate-spin"></div>
    </div>
{:else if $authStore.user?.isPro || $authStore.user?.isAdmin}
    <slot />
{:else}
    <div class="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div class="relative mb-6">
            <div class="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl"></div>
            <div
                class="w-20 h-20 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center relative z-10 shadow-2xl"
            >
                <Lock class="w-10 h-10 text-slate-400" />
                <div
                    class="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 rounded-full border-4 border-slate-950 flex items-center justify-center"
                >
                    <Crown class="w-4 h-4 text-amber-950" />
                </div>
            </div>
        </div>

        <h2 class="text-3xl font-black text-white mb-4 tracking-tight">
            Herramienta <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500"
                >Premium</span
            >
        </h2>

        <p class="text-slate-400 max-w-md mb-8 text-lg">
            Desbloquea esta utilidad y todo el ecosistema completo mejorando tu cuenta a nuestra
            versión ChillChess PRO.
        </p>

        <button
            on:click={() => goto('/pricing')}
            class="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl hover:shadow-white/10 overflow-hidden"
        >
            <span class="relative z-10">Ver Planes y Precios</span>
            <ArrowRight
                class="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform"
            />
        </button>
    </div>
{/if}
