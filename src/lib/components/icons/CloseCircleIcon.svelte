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
            <linearGradient id="closeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#EF4444;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#F87171;stop-opacity:1" />
            </linearGradient>
        </defs>
    {/if}
    <circle cx="12" cy="12" r="10" stroke={gradient ? 'url(#closeGradient)' : 'currentColor'} />
    <line
        x1="15"
        y1="9"
        x2="9"
        y2="15"
        stroke={gradient ? 'url(#closeGradient)' : 'currentColor'}
    />
    <line
        x1="9"
        y1="9"
        x2="15"
        y2="15"
        stroke={gradient ? 'url(#closeGradient)' : 'currentColor'}
    />
</svg>
