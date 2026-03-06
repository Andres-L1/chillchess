<script lang="ts">
    import { toasts } from '$lib/stores/toasts';
    import { CheckCircle, AlertCircle, Info } from 'lucide-svelte';
    import { fly, fade } from 'svelte/transition';
</script>

<div
    class="fixed top-4 md:top-auto md:bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 z-[60] flex flex-col gap-2 pointer-events-none w-[90vw] md:w-auto safe-top"
>
    {#each $toasts as toast (toast.id)}
        <div
            transition:fly={{ y: 20, duration: 300 }}
            class="
                text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 pointer-events-auto
                {toast.type === 'success' ? 'bg-green-600' : ''}
                {toast.type === 'error' ? 'bg-red-600' : ''}
                {toast.type === 'info' ? 'bg-brand-600' : ''}
            "
        >
            {#if toast.type === 'success'}
                <CheckCircle size={20} />
            {:else if toast.type === 'error'}
                <AlertCircle size={20} />
            {:else}
                <Info size={20} />
            {/if}
            <span class="text-sm font-medium">{toast.message}</span>
        </div>
    {/each}
</div>
