<script lang="ts">
    import '../app.postcss';

    // Floating UI for Popups
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { storePopup } from '@skeletonlabs/skeleton';
    import { page } from '$app/stores';
    import DynamicBackground from '$lib/components/DynamicBackground.svelte';
    import AudioPlayer from '$lib/components/AudioPlayer.svelte';
    import BottomPlayer from '$lib/components/BottomPlayer.svelte';
    import MusicToast from '$lib/components/MusicToast.svelte';
    import CookieConsent from '$lib/components/CookieConsent.svelte';
    import ToastContainer from '$lib/components/ToastContainer.svelte';
    import AudioSync from '$lib/components/AudioSync.svelte';
    import TimerSync from '$lib/components/TimerSync.svelte';
    import KeyboardShortcuts from '$lib/components/KeyboardShortcuts.svelte';

    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

    // Fonts
    import '@fontsource/poppins/300.css';
    import '@fontsource/poppins/400.css';
    import '@fontsource/poppins/600.css';
    import '@fontsource/poppins/700.css';
    import '@fontsource/inter/300.css';
    import '@fontsource/inter/400.css';

    import { onMount } from 'svelte';
    import { initAudioLibrary, audioStore } from '$lib/audio/store';
    import { userStore } from '$lib/auth/userStore';
    import { goto } from '$app/navigation';

    onMount(() => {
        initAudioLibrary();
    });

    // START AUTH WALL
    $: {
        if (!$userStore.loading) {
            const path = $page.url.pathname;
            const isPublic =
                path === '/' ||
                path.startsWith('/widget') ||
                path === '/terms' ||
                path === '/privacy';

            if (!$userStore.user && !isPublic) {
                goto('/');
            }
        }
    }
    // END AUTH WALL
</script>

<!-- Skip Navigation Links for Accessibility -->
<a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:shadow-lg"
>
    Saltar al contenido principal
</a>

<!-- App Shell -->
<div class="min-h-screen w-full relative">
    <!-- Dynamic Background Layer -->
    {#if $page.url.pathname !== '/widget'}
        <DynamicBackground />
    {/if}

    <!-- Content -->
    <div
        id="main-content"
        class="relative z-10 {$page.url.pathname !== '/' &&
        !$page.url.pathname.startsWith('/app') &&
        !$page.url.pathname.match(/^\/rooms\/[a-zA-Z0-9]+$/)
            ? 'pb-32'
            : ''}"
    >
        <slot />
    </div>

    <!-- Global Components (Excluded ONLY from Widget View, stored in /widget) -->
    <!-- We use strict equality to allow /widget/config to have these components -->
    {#if $page.url.pathname !== '/widget'}
        <AudioPlayer />
        <!-- Show player everywhere except specific widget/room routes -->
        {#if !$page.url.pathname.match(/^\/rooms\/[a-zA-Z0-9]+$/)}
            <BottomPlayer />
        {/if}

        <ToastContainer />
        <CookieConsent />
        <AudioSync />
        <TimerSync />
        <KeyboardShortcuts />
    {/if}
</div>

<style>
    :global(body) {
        font-family: 'Inter', sans-serif;
        font-weight: 300;
    }
    :global(h1, h2, h3, h4, h5, h6) {
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
    }
    /* Screen reader only class */
    :global(.sr-only) {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }
</style>
