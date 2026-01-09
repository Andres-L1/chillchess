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
            <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#34D399;stop-opacity:1" />
            </linearGradient>
        </defs>
    {/if}
    <path
        d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
        stroke={gradient ? 'url(#checkGradient)' : 'currentColor'}
    />
    <polyline
        points="22 4 12 14.01 9 11.01"
        stroke={gradient ? 'url(#checkGradient)' : 'currentColor'}
    />
</svg>
