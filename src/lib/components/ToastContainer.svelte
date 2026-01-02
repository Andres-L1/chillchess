<script lang="ts">
    import { notifications } from '$lib/stores/notificationStore';
    import { fly, fade, scale } from 'svelte/transition';
    import { flip } from 'svelte/animate';

    function getStyles(type: string) {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    text: 'text-emerald-100',
                    iconColor: 'text-emerald-400',
                };
            case 'error':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    text: 'text-red-100',
                    iconColor: 'text-red-400',
                };
            case 'warning':
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    text: 'text-amber-100',
                    iconColor: 'text-amber-400',
                };
            default: // info
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    text: 'text-blue-100',
                    iconColor: 'text-blue-400',
                };
        }
    }
</script>

<div
    class="fixed top-24 left-1/2 -translate-x-1/2 z-[150] flex flex-col items-center gap-4 w-full max-w-md px-4 pointer-events-none"
>
    {#each $notifications as note (note.id)}
        {@const style = getStyles(note.type)}
        <div
            animate:flip={{ duration: 400 }}
            in:fly={{ y: -30, duration: 400, opacity: 0 }}
            out:fly={{ y: -20, duration: 300, opacity: 0 }}
            class="pointer-events-auto flex items-start gap-4 p-4 rounded-2xl backdrop-blur-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.4)] {style.bg} {style.border} {style.text} min-w-[320px] max-w-full transform hover:scale-[1.02] transition-transform"
            role="alert"
        >
            <!-- Icon -->
            <div class="mt-0.5 shrink-0 {style.iconColor}">
                {#if note.type === 'success'}
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                {:else if note.type === 'error'}
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                {:else if note.type === 'warning'}
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                {:else}
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                {/if}
            </div>

            <!-- Content -->
            <div class="flex-1 pt-0.5">
                <p class="font-medium leading-relaxed drop-shadow-sm">{note.message}</p>
            </div>

            <!-- Close -->
            <button
                on:click={() => notifications.remove(note.id)}
                class="shrink-0 opacity-50 hover:opacity-100 transition-opacity p-1 -mr-1"
                aria-label="Cerrar"
            >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    {/each}
</div>
