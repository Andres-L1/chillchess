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
                id="alertGradient"
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
    <!-- Alert Triangle -->
    <path
        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
        stroke={gradient ? "url(#alertGradient)" : "currentColor"}
        fill="none"
    />
    <line
        x1="12"
        y1="9"
        x2="12"
        y2="13"
        stroke={gradient ? "url(#alertGradient)" : "currentColor"}
    />
    <line
        x1="12"
        y1="17"
        x2="12.01"
        y2="17"
        stroke={gradient ? "url(#alertGradient)" : "currentColor"}
    />
</svg>
