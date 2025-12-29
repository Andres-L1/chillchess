<script lang="ts">
    export let size: "sm" | "md" | "lg" | "xl" = "md";
    export let gradient: boolean = true;
    export let open: boolean = true;

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
                id="eyeGradient"
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

    {#if open}
        <!-- Eye Open -->
        <path
            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
            stroke={gradient ? "url(#eyeGradient)" : "currentColor"}
            fill="none"
        />
        <circle
            cx="12"
            cy="12"
            r="3"
            stroke={gradient ? "url(#eyeGradient)" : "currentColor"}
            fill="none"
        />
    {:else}
        <!-- Eye Closed (Slashed) -->
        <path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
            stroke={gradient ? "url(#eyeGradient)" : "currentColor"}
            fill="none"
        />
        <line
            x1="1"
            y1="1"
            x2="23"
            y2="23"
            stroke={gradient ? "url(#eyeGradient)" : "currentColor"}
        />
    {/if}
</svg>
