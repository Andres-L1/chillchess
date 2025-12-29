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

    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

    // Fonts
    import "@fontsource/poppins/300.css";
    import "@fontsource/poppins/400.css";
    import "@fontsource/poppins/600.css";
    import "@fontsource/poppins/700.css";
    import "@fontsource/inter/300.css";
    import "@fontsource/inter/400.css";

    import { onMount } from "svelte";
    import { initAudioLibrary } from "$lib/audio/store";

    onMount(() => {
        initAudioLibrary();
    });
</script>

<!-- App Shell -->
<div class="min-h-screen w-full relative">
    <!-- Dynamic Background Layer -->
    <DynamicBackground />

    <!-- Content -->
    <div class="relative z-10">
        <slot />
    </div>

    <AudioPlayer />
    {#if !$page.url.pathname.startsWith("/app")}
        <BottomPlayer />
    {/if}
    <MusicToast />
    <ToastContainer />
    <CookieConsent />
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
