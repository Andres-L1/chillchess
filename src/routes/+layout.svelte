<script lang="ts">
    import "../app.postcss";

    // Floating UI for Popups
    import {
        computePosition,
        autoUpdate,
        offset,
        shift,
        flip,
        arrow,
    } from "@floating-ui/dom";
    import { storePopup } from "@skeletonlabs/skeleton";
    import { page } from "$app/stores";
    import DynamicBackground from "$lib/components/DynamicBackground.svelte";
    import AudioPlayer from "$lib/components/AudioPlayer.svelte";
    import BottomPlayer from "$lib/components/BottomPlayer.svelte";
    import MusicToast from "$lib/components/MusicToast.svelte";
    import CookieConsent from "$lib/components/CookieConsent.svelte";
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import AudioSync from "$lib/components/AudioSync.svelte";
    import TimerSync from "$lib/components/TimerSync.svelte";

    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

    // Fonts
    import "@fontsource/poppins/300.css";
    import "@fontsource/poppins/400.css";
    import "@fontsource/poppins/600.css";
    import "@fontsource/poppins/700.css";
    import "@fontsource/inter/300.css";
    import "@fontsource/inter/400.css";

    import { onMount } from "svelte";
    import { initAudioLibrary, audioStore } from "$lib/audio/store";
    import { beforeNavigate } from "$app/navigation";

    onMount(() => {
        initAudioLibrary();
    });

    beforeNavigate(({ from, to }) => {
        // If leaving /app path, stop music and white noise
        if (
            from?.url.pathname.startsWith("/app") &&
            to?.url.pathname &&
            !to.url.pathname.startsWith("/app")
        ) {
            audioStore.update((s) => ({
                ...s,
                isPlaying: false,
                currentWhiteNoise: "none",
                currentAmbience: "none",
            }));
        }
    });
</script>

<!-- App Shell -->
<div class="min-h-screen w-full relative">
    <!-- Dynamic Background Layer -->
    {#if $page.url.pathname !== "/widget"}
        <DynamicBackground />
    {/if}

    <!-- Content -->
    <div
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
    {#if $page.url.pathname !== "/widget"}
        <AudioPlayer />
        {#if !$page.url.pathname.startsWith("/app") && !$page.url.pathname.match(/^\/rooms\/[a-zA-Z0-9]+$/)}
            <BottomPlayer />
        {/if}
        <MusicToast />
        <ToastContainer />
        <CookieConsent />
        <AudioSync />
        <TimerSync />
    {/if}
</div>

<style>
    :global(body) {
        font-family: "Inter", sans-serif;
        font-weight: 300;
    }
    :global(h1, h2, h3, h4, h5, h6) {
        font-family: "Poppins", sans-serif;
        font-weight: 600;
    }
</style>
