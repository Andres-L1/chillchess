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
    <!-- Use blue for User Profile -->
    {#if gradient}
        <defs>
            <linearGradient
                id="userGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
            >
                <stop offset="0%" style="stop-color:#60A5FA;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
            </linearGradient>
        </defs>
    {/if}
    <!-- User -->
    <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={gradient ? "url(#userGradient)" : "currentColor"}
    />
    <circle
        cx="12"
        cy="7"
        r="4"
        stroke={gradient ? "url(#userGradient)" : "currentColor"}
        fill="none"
    />
</svg>
