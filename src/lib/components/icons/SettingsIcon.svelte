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
                id="settingsGradient"
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
    <!-- Gear/Settings -->
    <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
        stroke={gradient ? "url(#settingsGradient)" : "currentColor"}
    />
    <circle
        cx="12"
        cy="12"
        r="3"
        stroke={gradient ? "url(#settingsGradient)" : "currentColor"}
        fill="none"
    />
</svg>
