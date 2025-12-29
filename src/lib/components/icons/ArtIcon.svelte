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
                id="artGradient"
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
    <!-- Palette/Art -->
    <path
        d="M12 19l7-7 3 3-7 7-3-3z"
        stroke={gradient ? "url(#artGradient)" : "currentColor"}
        fill="none"
    />
    <path
        d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"
        stroke={gradient ? "url(#artGradient)" : "currentColor"}
        fill="none"
    />
    <path
        d="M2 2l7.586 7.586"
        stroke={gradient ? "url(#artGradient)" : "currentColor"}
    />
    <circle
        cx="11"
        cy="11"
        r="2"
        stroke={gradient ? "url(#artGradient)" : "currentColor"}
        fill="none"
    />
</svg>
