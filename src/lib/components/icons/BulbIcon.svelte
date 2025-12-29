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
    <!-- Use purple for Bulb/Proposals -->
    {#if gradient}
        <defs>
            <linearGradient
                id="bulbGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
            >
                <stop offset="0%" style="stop-color:#C084FC;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
            </linearGradient>
        </defs>
    {/if}
    <!-- Lightbulb -->
    <path
        d="M9 21h6"
        stroke={gradient ? "url(#bulbGradient)" : "currentColor"}
    />
    <path
        d="M12 21a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2 2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z"
        stroke={gradient ? "url(#bulbGradient)" : "currentColor"}
        display="none"
    />
    <!-- Better bulb path -->
    <path
        d="M8.5 21h7M9 18h6M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"
        stroke={gradient ? "url(#bulbGradient)" : "currentColor"}
        fill="none"
    />
</svg>
