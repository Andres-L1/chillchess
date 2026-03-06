<script lang="ts">
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/stores/authStore';

    // El root solo redirige según el estado de auth
    $: if (!$authStore.loading) {
        if ($authStore.user) {
            goto('/dashboard');
        } else {
            goto('/landing');
        }
    }
</script>

<div class="h-screen w-full flex items-center justify-center bg-[#0B0E14]">
    <div class="animate-pulse text-slate-400">Redirigiendo...</div>
</div>
