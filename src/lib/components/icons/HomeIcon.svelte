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
    {#if gradient}
        <defs>
            <linearGradient
                id="homeGradient"
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
    <!-- Home -->
    <path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={gradient ? "url(#homeGradient)" : "currentColor"}
        fill="none"
    />
    <polyline
        points="9 22 9 12 15 12 15 22"
        stroke={gradient ? "url(#homeGradient)" : "currentColor"}
    />
</svg>
