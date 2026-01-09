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
            <linearGradient id="bugGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#DC2626;stop-opacity:1" />
            </linearGradient>
        </defs>
    {/if}
    <path
        d="m8 2 1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"
        stroke={gradient ? 'url(#bugGradient)' : 'currentColor'}
    />
    <path
        d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6Z"
        stroke={gradient ? 'url(#bugGradient)' : 'currentColor'}
    />
    <path
        d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4"
        stroke={gradient ? 'url(#bugGradient)' : 'currentColor'}
    />
</svg>
