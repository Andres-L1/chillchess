<script lang="ts">
    export let size: "sm" | "md" | "lg" = "md";

    const sizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };
</script>

<div class="inline-flex items-center group relative">
    <!-- Verified Checkmark with Orange Gradient -->
    <svg
        class="{sizes[size]} transition-all group-hover:scale-110"
        viewBox="0 0 24 24"
        fill="none"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <defs>
            <linearGradient
                id="verifiedGradient-{size}"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
            >
                <stop offset="0%" style="stop-color:#FF7B3D;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FFB347;stop-opacity:1" />
            </linearGradient>
        </defs>
        <!-- Checkmark path -->
        <path
            d="M20 6L9 17L4 12"
            stroke="url(#verifiedGradient-{size})"
            filter="drop-shadow(0 0 4px rgba(255, 123, 61, 0.3))"
        />
    </svg>

    <!-- Tooltip on hover -->
    <div
        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-midnight-800 border border-primary-500/30 rounded-lg text-xs font-medium text-primary-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
    >
        Artista Verificado
        <!-- Arrow -->
        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div
                class="border-4 border-transparent border-t-midnight-800"
            ></div>
        </div>
    </div>
</div>
