<script lang="ts">
    export let size: "sm" | "md" | "lg" = "md";

    const sizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };
</script>

<div
    class="inline-flex items-center justify-center {sizes[size]} relative group"
    title="Artista Verificado"
>
    <!-- Outer glow -->
    <div
        class="absolute inset-0 bg-primary-500/20 blur-sm rounded-full animate-pulse"
    ></div>

    <!-- Badge circle -->
    <div
        class="relative {sizes[
            size
        ]} bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg"
    >
        <!-- Checkmark -->
        <svg
            class="w-3/5 h-3/5 text-white drop-shadow-md"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 13l4 4L19 7"
            />
        </svg>
    </div>

    <!-- Tooltip on hover -->
    <div
        class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
    >
        <div
            class="bg-midnight-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-primary-500/30"
        >
            Artista Verificado
            <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div
                    class="border-4 border-transparent border-t-midnight-800"
                ></div>
            </div>
        </div>
    </div>
</div>

<style>
    @keyframes pulse {
        0%,
        100% {
            opacity: 0.6;
        }
        50% {
            opacity: 0.3;
        }
    }
</style>
