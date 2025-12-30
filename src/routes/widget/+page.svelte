<script lang="ts">
    import { audioStore } from "$lib/audio/store";
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    import { db } from "$lib/firebase";
    import { doc, onSnapshot } from "firebase/firestore";

    // Query params for customization
    $: theme = $page.url.searchParams.get("theme") || "dark";
    $: size = $page.url.searchParams.get("size") || "medium";
    $: showLogo = $page.url.searchParams.get("showLogo") !== "false";
    $: opacity = parseFloat($page.url.searchParams.get("opacity") || "0.9");
    $: uid = $page.url.searchParams.get("uid");

    // Local Store Data
    $: playlist = $audioStore.playlist;
    $: currentTrackIndex = $audioStore.currentTrackIndex;
    $: currentAlbumId = $audioStore.currentAlbumId;
    $: localIsPlaying = $audioStore.isPlaying;

    $: currentTrack = playlist && playlist[currentTrackIndex];
    $: currentAlbum = $audioStore.availableAlbums.find(
        (a) => a.id === currentAlbumId,
    );

    // Derived Local Info
    $: localTrackInfo =
        currentTrack && currentAlbum
            ? {
                  title: currentTrack.title,
                  artist: currentTrack.artist || currentAlbum.artist,
                  cover:
                      (currentTrack as any).coverUrl ||
                      (currentTrack as any).cover ||
                      currentAlbum.cover,
              }
            : null;

    // Remote Data Sync
    let remoteData: any = null;

    onMount(() => {
        if (uid) {
            const unsub = onSnapshot(doc(db, "nowPlaying", uid), (snap) => {
                if (snap.exists()) {
                    remoteData = snap.data();
                }
            });
            return () => unsub();
        }
    });

    // Unified State (Remote takes precedence if UID is present)
    $: activeTrack = uid ? remoteData?.track : localTrackInfo;
    $: isPlaying = uid ? remoteData?.isPlaying : localIsPlaying;

    // Progress calculation for remote
    $: progress =
        uid && remoteData
            ? ((remoteData.track.currentTime || 0) /
                  (remoteData.track.duration || 1)) *
              100
            : $audioStore.duration > 0
              ? ($audioStore.currentTime / $audioStore.duration) * 100
              : 0;

    // Size configurations
    const sizes = {
        compact: { width: "300px", imgSize: "60px", fontSize: "text-sm" },
        medium: { width: "380px", imgSize: "72px", fontSize: "text-base" },
        large: { width: "450px", imgSize: "90px", fontSize: "text-lg" },
    };

    $: config = sizes[size as keyof typeof sizes] || sizes.medium;
</script>

<svelte:head>
    <title>ChillChess Widget - OBS Overlay</title>
    <meta name="robots" content="noindex" />
</svelte:head>

{#if activeTrack && isPlaying}
    <div
        class="widget-container font-poppins"
        style="
            width: {config.width}; 
            opacity: {opacity};
        "
    >
        <!-- Background Glow removed for cleaner look -->

        <!-- Vinilo Giratorio (Estabilizado) -->
        <div
            class="album-container"
            style="width: {config.imgSize}; height: {config.imgSize};"
        >
            <!-- La animación de giro va AQUÍ, en el contenedor, para no reiniciarse con updates de datos -->
            <div class="relative w-full h-full animate-spin-slow">
                <img
                    src={activeTrack.cover || "/logo-mobile.png"}
                    alt={activeTrack.title}
                    class="w-full h-full object-cover rounded-full shadow-2xl border-[3px] border-white/10"
                />
                <!-- Centro del vinilo -->
                <div
                    class="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <div
                        class="w-[25%] h-[25%] bg-[#0B1120] rounded-full border border-white/20 backdrop-blur-sm shadow-inner"
                    ></div>
                </div>
            </div>
        </div>

        <!-- Track Info -->
        <div class="track-info">
            <div class="track-title {config.fontSize}">
                {activeTrack.title}
            </div>
            <div
                class="artist-name"
                style="font-size: {config.fontSize === 'text-lg'
                    ? '14px'
                    : config.fontSize === 'text-base'
                      ? '12px'
                      : '10px'};"
            >
                {activeTrack.artist}
            </div>

            <!-- Progress Bar -->
            <div class="progress-container">
                <div class="progress-bar" style="width: {progress}%"></div>
            </div>

            <!-- Logo (if enabled) - INCREASED SIZE -->
            {#if showLogo}
                <div class="logo-container mt-2">
                    <img
                        src="/logo-desktop.png"
                        alt="ChillChess"
                        class="h-14 w-auto object-contain opacity-100"
                    />
                </div>
            {/if}
        </div>

        <!-- Animated Equalizer (Chaotic) -->
        <div class="equalizer">
            {#each Array(6) as _, i}
                <div
                    class="bar"
                    style="
                        animation-duration: {0.4 + ((i * 0.3) % 0.8)}s; 
                        animation-delay: -{i * 0.2}s;
                        height: {10 + i * 5}px;
                    "
                ></div>
            {/each}
        </div>
    </div>
{:else}
    <div
        class="widget-idle font-poppins flex flex-col items-center justify-center transition-all duration-500"
        style="width: {config.width}; opacity: {opacity};"
    >
        <!-- Logo Animado -->
        <div class="relative mb-2">
            <div
                class="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl opacity-30 animate-pulse"
            ></div>
            <img
                src="/logo-desktop.png"
                alt="ChillChess"
                class="h-20 w-auto relative z-10 drop-shadow-xl animate-float object-contain"
            />
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
        gap: 24px;
        padding: 16px 24px;

        /* True Glass Effect */
        background: linear-gradient(
            135deg,
            rgba(15, 15, 20, 0.4),
            rgba(5, 5, 8, 0.6)
        );
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);

        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);

        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);

        overflow: hidden;
        transition: all 0.3s ease;
    }

    /* Glow removed */

    .album-container {
        position: relative;
        flex-shrink: 0;
        z-index: 2;
    }

    /* Clean Cover without heavy borders */
    .album-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        box-shadow:
            0 15px 35px -5px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.05);
    }

    /* Removed .album-border and .vinyl-spin for cleaner look */

    .track-info {
        flex: 1;
        min-width: 0;
        z-index: 2;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .track-title {
        font-weight: 800; /* Bolder */
        color: white;
        line-height: 1.1;
        margin-bottom: 6px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        letter-spacing: -0.02em;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8); /* Sharper shadow for glass */
    }

    .artist-name {
        color: rgba(255, 255, 255, 0.9); /* Higher contrast */
        font-size: 0.9em;
        margin-bottom: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
        letter-spacing: 0.01em;
    }

    .progress-container {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 10px;
    }

    .progress-bar {
        height: 100%;
        background: linear-gradient(
            90deg,
            #6366f1,
            #a855f7
        ); /* Vibrant Gradient */
        border-radius: 4px;
        transition: width 0.3s ease;
        box-shadow: 0 0 15px rgba(99, 102, 241, 0.4); /* Neon Glow */
    }

    .logo-container {
        display: flex;
        align-items: center;
        opacity: 0.95;
        transition: opacity 0.3s;
    }

    .equalizer {
        display: flex;
        gap: 4px;
        align-items: flex-end;
        height: 32px;
        z-index: 2;
        padding-left: 10px;
    }

    .bar {
        width: 4px;
        background: #a855f7;
        border-radius: 2px;
        animation: bounce 0.8s ease-in-out infinite alternate;
        opacity: 0.8;
    }

    /* Idle State */
    .widget-idle {
        background: transparent;
        padding: 20px;
    }

    .animate-float {
        animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    @keyframes bounce {
        0% {
            height: 6px;
        }
        100% {
            height: 32px;
        }
    }

    @keyframes pulse-glow {
        0% {
            opacity: 0.3;
            transform: scale(1);
        }
        100% {
            opacity: 0.6;
            transform: scale(1.1);
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

    .animate-spin-slow {
        animation: spin 8s linear infinite;
    }
</style>
