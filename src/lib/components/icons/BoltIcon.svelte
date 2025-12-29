<script lang="ts">
    export let size: "sm" | "md" | "lg" | "xl" = "md";
    export let gradient: boolean = true;

    const sizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
        xl: "w-8 h-8",
    };
</script>

<svg
    class={sizes[size]}
    viewBox="0 0 24 24"
    fill="none"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
>
    <!-- Use yellow/orange for Lightning -->
    {#if gradient}
        <defs>
            <linearGradient
                id="boltGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
            >
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
            </linearGradient>
        </defs>
    {/if}
    <!-- Lightning/Bolt -->
    <path
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        stroke={gradient ? "url(#boltGradient)" : "currentColor"}
        fill="none"
    />
</svg>
