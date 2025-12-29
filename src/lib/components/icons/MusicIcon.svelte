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
                id="musicGradient"
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
    <!-- Musical note -->
    <path
        d="M9 18V5l12-2v13"
        stroke={gradient ? "url(#musicGradient)" : "currentColor"}
    />
    <circle
        cx="6"
        cy="18"
        r="3"
        stroke={gradient ? "url(#musicGradient)" : "currentColor"}
        fill="none"
    />
    <circle
        cx="18"
        cy="16"
        r="3"
        stroke={gradient ? "url(#musicGradient)" : "currentColor"}
        fill="none"
    />
</svg>
