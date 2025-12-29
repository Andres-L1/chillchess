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
                id="pawnGradient"
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
    <!-- Chess Pawn -->
    <path
        d="M12 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
        transform="translate(0, 4)"
        stroke={gradient ? "url(#pawnGradient)" : "currentColor"}
        fill="none"
    />
    <path
        d="M9 13c0-1.3.8-2.5 2-3h2c1.2.5 2 1.7 2 3v2H9v-2z"
        stroke={gradient ? "url(#pawnGradient)" : "currentColor"}
        fill="none"
    />
    <path
        d="M7 19l2-3h6l2 3"
        stroke={gradient ? "url(#pawnGradient)" : "currentColor"}
    />
    <line
        x1="6"
        y1="22"
        x2="18"
        y2="22"
        stroke={gradient ? "url(#pawnGradient)" : "currentColor"}
    />
</svg>
