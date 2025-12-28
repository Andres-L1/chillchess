<script lang="ts">
    import { fade, scale } from "svelte/transition";
    import { createEventDispatcher } from "svelte";

    export let show = false;
    export let title = "";
    export let type: "info" | "success" | "error" | "warning" | "confirm" =
        "info";
    export let showCancel = false;
    export let confirmText = "Aceptar";
    export let cancelText = "Cancelar";
    export let size: "sm" | "md" | "lg" = "md";

    const dispatch = createEventDispatcher();

    function handleConfirm() {
        dispatch("confirm");
        close();
    }

    function handleCancel() {
        dispatch("cancel");
        close();
    }

    function close() {
        dispatch("close");
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            close();
        }
    }

    // Icon and color based on type
    $: icon = {
        info: "ℹ️",
        success: "✅",
        error: "❌",
        warning: "⚠️",
        confirm: "❓",
    }[type];

    $: colorClass = {
        info: "from-blue-600 to-blue-700",
        success: "from-green-600 to-green-700",
        error: "from-red-600 to-red-700",
        warning: "from-yellow-600 to-yellow-700",
        confirm: "from-purple-600 to-purple-700",
    }[type];

    $: maxWidth = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-2xl",
    }[size];
</script>

{#if show}
    <div
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in"
        transition:fade={{ duration: 200 }}
    >
        <!-- Backdrop -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="absolute inset-0 bg-black/80 backdrop-blur-sm"
            on:click={handleBackdropClick}
        ></div>

        <!-- Modal Content -->
        <div
            class="relative bg-[#1a1a1a] rounded-2xl border border-white/10 w-full {maxWidth} shadow-2xl overflow-hidden"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <!-- Header with gradient -->
            {#if title}
                <div
                    class="px-6 py-4 bg-gradient-to-r {colorClass} flex items-center gap-3"
                >
                    <span class="text-2xl">{icon}</span>
                    <h3 class="text-lg font-bold text-white flex-1">{title}</h3>
                    <button
                        on:click={close}
                        class="text-white/70 hover:text-white transition-colors p-1"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            {/if}

            <!-- Body -->
            <div class="px-6 py-6 text-slate-300">
                <slot />
            </div>

            <!-- Footer with actions -->
            <div
                class="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end gap-3"
            >
                {#if showCancel}
                    <button
                        on:click={handleCancel}
                        class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                    >
                        {cancelText}
                    </button>
                {/if}
                <button
                    on:click={handleConfirm}
                    class="px-4 py-2 bg-gradient-to-r {colorClass} hover:opacity-90 rounded-lg font-medium text-white transition-all shadow-lg"
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
{/if}
