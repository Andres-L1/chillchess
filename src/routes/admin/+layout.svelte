<script lang="ts">
    import { authStore } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import { ShieldAlert, Loader2 } from 'lucide-svelte';
    import { onMount } from 'svelte';

    let checking = true;

    $: {
        if (!$authStore.loading) {
            if (!$authStore.user || !$authStore.user.isAdmin) {
                // Not authorized
                goto('/landing');
            } else {
                checking = false;
            }
        }
    }
</script>

{#if $authStore.loading || checking}
    <div class="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 class="w-8 h-8 text-brand-500 animate-spin mb-4" />
        <p class="text-slate-400 font-medium">Verificando credenciales de administrador...</p>
    </div>
{:else if $authStore.user?.isAdmin}
    <slot />
{:else}
    <div class="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
        <div class="text-center">
            <ShieldAlert class="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 class="text-2xl font-bold mb-2">Acceso Denegado</h1>
            <p class="text-slate-400">No tienes permisos para ver esta página.</p>
        </div>
    </div>
{/if}
