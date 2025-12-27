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
    import DynamicBackground from "$lib/components/DynamicBackground.svelte";

    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

    // Fonts
    import "@fontsource/cinzel";
    import "@fontsource/inter";
</script>

<!-- App Shell -->
<div class="h-full w-full overflow-hidden relative">
    <!-- Dynamic Background Layer -->
    <DynamicBackground />

    <!-- Content -->
    <div class="relative z-10 h-full">
        <slot />
    </div>
</div>

<style>
    :global(body) {
        font-family: "Inter", sans-serif;
    }
    :global(h1, h2, h3, h4, h5, h6) {
        font-family: "Cinzel", serif;
    }
</style>
