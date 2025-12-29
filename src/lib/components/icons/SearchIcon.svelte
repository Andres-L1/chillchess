<script lang="ts">
    export let size: "sm" | "md" | "lg" | "xl" | "2xl" = "md";
    export let gradient: boolean = true;

    const sizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
        xl: "w-8 h-8",
        "2xl": "w-16 h-16",
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
    {#if gradient}
        <defs>
            <linearGradient
                id="searchGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
            >
                <stop offset="0%" style="stop-color:#FF7B3D;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FFB347;stop-opacity:1" />
            </linearGradient>
        </defs>
    {/if}
    <!-- Search -->
    <circle
        cx="11"
        cy="11"
        r="8"
        stroke={gradient ? "url(#searchGradient)" : "currentColor"}
        fill="none"
    />
    <path
        d="m21 21-4.35-4.35"
        stroke={gradient ? "url(#searchGradient)" : "currentColor"}
    />
</svg>
