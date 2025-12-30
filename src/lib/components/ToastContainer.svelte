<script lang="ts">
    import { notifications } from "$lib/stores/notificationStore";
    import { fly, fade } from "svelte/transition";
    import { flip } from "svelte/animate";

    function getIcon(type: string) {
        switch (type) {
            case "success":
                return "✅";
            case "error":
                return "❌";
            case "warning":
                return "⚠️";
            case "info":
                return "ℹ️";
            default:
                return "🔔";
        }
    }

    function getColors(type: string) {
        switch (type) {
            case "success":
                return "bg-green-500/10 border-green-500/30 text-green-200";
            case "error":
                return "bg-red-500/10 border-red-500/30 text-red-200";
            case "warning":
                return "bg-yellow-500/10 border-yellow-500/30 text-yellow-200";
            default:
                return "bg-blue-500/10 border-blue-500/30 text-blue-200";
        }
    }
</script>

<div
    class="fixed top-32 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full max-w-sm px-4 pointer-events-none"
>
    {#each $notifications as note (note.id)}
        <div
            animate:flip={{ duration: 300 }}
            in:fly={{ y: -20, duration: 300 }}
            out:fade={{ duration: 200 }}
            class="pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl {getColors(
                note.type,
            )} min-w-[300px]"
            role="alert"
        >
            <span class="text-xl">{getIcon(note.type)}</span>
            <p class="text-sm font-medium flex-1">{note.message}</p>
            <button
                on:click={() => notifications.remove(note.id)}
                class="opacity-50 hover:opacity-100 transition-opacity p-1"
                aria-label="Cerrar notificación"
            >
                ✕
            </button>
        </div>
    {/each}
</div>
