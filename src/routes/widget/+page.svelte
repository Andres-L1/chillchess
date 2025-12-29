<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    // Query params for customization
    $: theme = $page.url.searchParams.get("theme") || "dark";
    $: size = $page.url.searchParams.get("size") || "medium";
    $: showLogo = $page.url.searchParams.get("showLogo") !== "false";
    $: opacity = parseFloat($page.url.searchParams.get("opacity") || "0.9");

    $: currentTrack = $audioStore.currentTrack;
    $: isPlaying = $audioStore.isPlaying;

    // Size configurations
    const sizes = {
        compact: { width: "300px", imgSize: "60px", fontSize: "text-sm" },
        medium: { width: "400px", imgSize: "80px", fontSize: "text-base" },
        large: { width: "500px", imgSize: "100px", fontSize: "text-lg" },
    };

    $: config = sizes[size as keyof typeof sizes] || sizes.medium;
</script>

<svelte:head>
    <title>ChillChess Widget - OBS Overlay</title>
    <meta name="robots" content="noindex" />
</svelte:head>

{#if currentTrack && isPlaying}
    <div
        class="widget-container font-poppins transition-all duration-300"
        style="
            width: {config.width}; 
            opacity: {opacity};
            background: {theme === 'light'
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(15, 23, 42, 0.95)'};
            color: {theme === 'light' ? '#1e293b' : '#f1f5f9'};
        "
    >
        <!-- Album Art -->
        <div
            class="album-art"
            style="width: {config.imgSize}; height: {config.imgSize};"
        >
            <img
                src={currentTrack.cover || "/default-cover.jpg"}
                alt={currentTrack.title}
                class="w-full h-full object-cover rounded-xl shadow-lg"
            />
        </div>

        <!-- Track Info -->
        <div class="track-info flex-1 ml-4">
            <p
                class="track-title font-bold {config.fontSize} leading-tight mb-1 line-clamp-1"
            >
                {currentTrack.title}
            </p>
            <p
                class="artist-name text-opacity-70 {config.fontSize ===
                'text-lg'
                    ? 'text-base'
                    : 'text-xs'} line-clamp-1"
                style="opacity: 0.7;"
            >
                {currentTrack.artist}
            </p>
            {#if showLogo}
                <p
                    class="chillchess-logo text-[10px] mt-2 flex items-center gap-1"
                    style="opacity: 0.5;"
                >
                    <span>🎵</span>
                    <span>ChillChess.app</span>
                </p>
            {/if}
        </div>

        <!-- Equalizer animation -->
        <div class="equalizer">
            {#each Array(3) as _, i}
                <div
                    class="bar"
                    style="animation-delay: {i * 0.1}s; background: {theme ===
                    'light'
                        ? '#3b82f6'
                        : '#60a5fa'};"
                ></div>
            {/each}
        </div>
    </div>
{:else}
    <div
        class="widget-container font-poppins"
        style="width: {config.width}; opacity: {opacity}; background: rgba(15, 23, 42, 0.8); color: #94a3b8;"
    >
        <div class="text-center py-8 px-4">
            <p class="text-sm">🎵 Esperando música...</p>
            <p class="text-xs mt-1 opacity-60">ChillChess.app</p>
        </div>
    </div>
{/if}

<style>
    .widget-container {
        display: flex;
        align-items: center;
        padding: 16px;
        border-radius: 16px;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .line-clamp-1 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .equalizer {
        display: flex;
        gap: 3px;
        align-items: flex-end;
        height: 24px;
        margin-left: 12px;
    }

    .bar {
        width: 4px;
        background: #60a5fa;
        border-radius: 2px;
        animation: bounce 0.6s ease-in-out infinite alternate;
    }

    @keyframes bounce {
        0% {
            height: 6px;
        }
        100% {
            height: 24px;
        }
    }

    /* Prevent text selection for OBS */
    * {
        user-select: none;
        -webkit-user-select: none;
    }
</style>
