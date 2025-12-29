<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    // Query params for customization
    $: theme = $page.url.searchParams.get("theme") || "dark";
    $: size = $page.url.searchParams.get("size") || "medium";
    $: showLogo = $page.url.searchParams.get("showLogo") !== "false";
    $: opacity = parseFloat($page.url.searchParams.get("opacity") || "0.9");

    // Derive current track from store
    $: playlist = $audioStore.playlist;
    $: currentTrackIndex = $audioStore.currentTrackIndex;
    $: currentAlbumId = $audioStore.currentAlbumId;
    $: isPlaying = $audioStore.isPlaying;

    $: currentTrack = playlist && playlist[currentTrackIndex];
    $: currentAlbum = $audioStore.availableAlbums.find(
        (a) => a.id === currentAlbumId,
    );

    // Combine track and album info
    $: trackInfo =
        currentTrack && currentAlbum
            ? {
                  title: currentTrack.title,
                  artist: currentTrack.artist || currentAlbum.artist,
                  cover: currentAlbum.cover,
              }
            : null;

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

{#if trackInfo && isPlaying}
    <div
        class="widget-container font-poppins"
        style="
            width: {config.width}; 
            opacity: {opacity};
        "
    >
        <!-- Background Glow -->
        <div
            class="glow-bg"
            style="background: linear-gradient(135deg, {theme === 'light'
                ? '#4f46e5, #06b6d4'
                : '#ff7b3d, #6366f1'});"
        ></div>

        <!-- Album Art with Animated Border -->
        <div
            class="album-container"
            style="width: {config.imgSize}; height: {config.imgSize};"
        >
            <div class="album-border"></div>
            <img
                src={trackInfo.cover || "/default-cover.jpg"}
                alt={trackInfo.title}
                class="album-img"
            />
            <div class="vinyl-spin"></div>
        </div>

        <!-- Track Info -->
        <div class="track-info">
            <div class="track-title {config.fontSize}">
                {trackInfo.title}
            </div>
            <div
                class="artist-name"
                style="font-size: {config.fontSize === 'text-lg'
                    ? '14px'
                    : config.fontSize === 'text-base'
                      ? '12px'
                      : '10px'};"
            >
                {trackInfo.artist}
            </div>

            <!-- Progress Bar -->
            <div class="progress-container">
                <div
                    class="progress-bar"
                    style="width: {$audioStore.duration > 0
                        ? ($audioStore.currentTime / $audioStore.duration) * 100
                        : 0}%"
                ></div>
            </div>

            <!-- Logo (if enabled) -->
            {#if showLogo}
                <div class="logo-container">
                    <svg viewBox="0 0 1024 300" class="logo-svg">
                        <!-- Crown with headphones icon -->
                        <g transform="translate(20, 50)">
                            <!-- Headphones -->
                            <path
                                d="M 80 100 Q 80 40 120 40 Q 160 40 160 100"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="8"
                                stroke-linecap="round"
                            />
                            <circle
                                cx="80"
                                cy="110"
                                r="15"
                                fill="currentColor"
                            />
                            <circle
                                cx="160"
                                cy="110"
                                r="15"
                                fill="currentColor"
                            />
                            <!-- Crown -->
                            <path
                                d="M 120 20 L 125 40 L 135 35 L 130 50 L 145 48 L 138 65 L 102 65 L 95 48 L 110 50 L 105 35 L 115 40 Z"
                                fill="currentColor"
                            />
                        </g>
                        <!-- ChillChess Text -->
                        <text
                            x="200"
                            y="120"
                            font-family="Poppins, sans-serif"
                            font-size="80"
                            font-weight="700"
                            fill="currentColor">ChillChess</text
                        >
                    </svg>
                </div>
            {/if}
        </div>

        <!-- Animated Equalizer -->
        <div class="equalizer">
            {#each Array(4) as _, i}
                <div class="bar" style="animation-delay: {i * 0.15}s;"></div>
            {/each}
        </div>
    </div>
{:else}
    <div
        class="widget-container widget-idle font-poppins"
        style="width: {config.width}; opacity: {opacity};"
    >
        <div class="idle-content">
            <div class="pulse-circle"></div>
            <p class="idle-text">🎵 Esperando música...</p>
            <p class="idle-subtext">ChillChess.app</p>
        </div>
    </div>
{/if}

<style>
    * {
        user-select: none;
        -webkit-user-select: none;
    }

    .widget-container {
        position: relative;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        border: 2px solid rgba(255, 123, 61, 0.3);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 40px rgba(255, 123, 61, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .glow-bg {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        opacity: 0.1;
        filter: blur(40px);
        animation: rotate 20s linear infinite;
        pointer-events: none;
    }

    .album-container {
        position: relative;
        flex-shrink: 0;
        z-index: 2;
    }

    .album-border {
        position: absolute;
        inset: -3px;
        border-radius: 16px;
        background: linear-gradient(135deg, #ff7b3d, #6366f1, #06b6d4);
        animation: rotate 3s linear infinite;
        z-index: -1;
    }

    .album-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
        position: relative;
        z-index: 1;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }

    .vinyl-spin {
        position: absolute;
        inset: 10%;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.2);
        animation: spin 3s linear infinite;
        pointer-events: none;
    }

    .track-info {
        flex: 1;
        min-width: 0;
        z-index: 2;
    }

    .track-title {
        font-weight: 700;
        color: white;
        line-height: 1.2;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .artist-name {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
    }

    .progress-container {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 8px;
    }

    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #ff7b3d, #6366f1);
        border-radius: 2px;
        transition: width 0.3s ease;
        box-shadow: 0 0 10px rgba(255, 123, 61, 0.5);
    }

    .logo-container {
        margin-top: 4px;
    }

    .logo-svg {
        width: 140px;
        height: auto;
        opacity: 0.6;
        color: white;
    }

    .equalizer {
        display: flex;
        gap: 4px;
        align-items: flex-end;
        height: 40px;
        z-index: 2;
    }

    .bar {
        width: 5px;
        background: linear-gradient(to top, #ff7b3d, #6366f1);
        border-radius: 3px;
        animation: bounce 0.6s ease-in-out infinite alternate;
        box-shadow: 0 0 10px rgba(255, 123, 61, 0.5);
    }

    .widget-idle {
        justify-content: center;
        padding: 40px;
        background: rgba(15, 23, 42, 0.8);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .idle-content {
        text-align: center;
    }

    .pulse-circle {
        width: 60px;
        height: 60px;
        margin: 0 auto 16px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff7b3d, #6366f1);
        animation: pulse 2s ease-in-out infinite;
    }

    .idle-text {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 8px;
        font-weight: 600;
    }

    .idle-subtext {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
        font-weight: 500;
    }

    @keyframes bounce {
        0% {
            height: 8px;
        }
        100% {
            height: 40px;
        }
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes pulse {
        0%,
        100% {
            transform: scale(1);
            opacity: 0.6;
        }
        50% {
            transform: scale(1.1);
            opacity: 1;
        }
    }
</style>
