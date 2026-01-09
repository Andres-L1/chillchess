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
            <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#F87171;stop-opacity:1" />
            </linearGradient>
        </defs>
    {/if}
    <rect
        x="3"
        y="11"
        width="18"
        height="11"
        rx="2"
        ry="2"
        stroke={gradient ? 'url(#lockGradient)' : 'currentColor'}
    />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={gradient ? 'url(#lockGradient)' : 'currentColor'} />
</svg>
