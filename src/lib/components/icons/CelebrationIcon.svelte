<script lang="ts">
    export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
    export let gradient: boolean = false;

    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
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
            <linearGradient id="celebrationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#FBBF24;stop-opacity:1" />
            </linearGradient>
        </defs>
    {/if}
    <path
        d="M5.8 11.3 2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01"
        stroke={gradient ? 'url(#celebrationGradient)' : 'currentColor'}
    />
    <path
        d="m9 13 2 2 4-4M7.5 4.2c-.3-.5-.9-.7-1.3-.4C3.9 5.5 2.3 8.1 2 11c-.1.5.4 1 1 1h5c0-1.5.8-2.8 2-3.4-1.1-1.9-2-3.5-2.5-4.4zM18.9 3.8c-.4-.3-1-.2-1.3.3-.6.9-1.5 2.5-2.6 4.3 1.2.7 2 2 2 3.4h5a1 1 0 0 0 1-1c-.3-2.9-1.8-5.5-4.1-7.0z"
        stroke={gradient ? 'url(#celebrationGradient)' : 'currentColor'}
        fill={gradient ? 'url(#celebrationGradient)' : 'none'}
        fill-opacity="0.1"
    />
</svg>
