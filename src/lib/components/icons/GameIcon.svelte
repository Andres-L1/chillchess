<script lang="ts">
    export let size: "sm" | "md" | "lg" | "xl" = "md";
    export let gradient: boolean = true;

    const sizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
        xl: "w-6 h-6",
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
                id="gameGradient"
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
    <!-- Game controller -->
    <path
        d="M6 11h4m2 0h4m-8 4h.01M15.99 15h.01"
        stroke={gradient ? "url(#gameGradient)" : "currentColor"}
    />
    <path
        d="M5 17a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10z"
        stroke={gradient ? "url(#gameGradient)" : "currentColor"}
        fill="none"
    />
    <path
        d="M3 8h2M3 12h2M19 8h2M19 12h2"
        stroke={gradient ? "url(#gameGradient)" : "currentColor"}
    />
</svg>
