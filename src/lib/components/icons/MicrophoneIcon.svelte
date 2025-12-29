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
                id="micGradient"
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
    <!-- Microphone -->
    <rect
        x="9"
        y="2"
        width="6"
        height="11"
        rx="3"
        stroke={gradient ? "url(#micGradient)" : "currentColor"}
        fill="none"
    />
    <path
        d="M12 19v3M8 22h8"
        stroke={gradient ? "url(#micGradient)" : "currentColor"}
    />
    <path
        d="M19 10v2a7 7 0 0 1-14 0v-2"
        stroke={gradient ? "url(#micGradient)" : "currentColor"}
    />
</svg>
