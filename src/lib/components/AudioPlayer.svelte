<script lang="ts">
    import {
        audioStore,
        nextTrack,
        prevTrack,
        togglePlayback,
    } from "$lib/audio/store";

    // Ambience files (loops)
    const AMBIENCE_TRACKS = {
        rain: "/assets/audio/ambience/rain.mp3",
        library: "/assets/audio/ambience/library.mp3",
        garden: "/assets/audio/ambience/garden.mp3",
        none: "",
    };

    // White Noise files (loops)
    const WHITE_NOISE_TRACKS = {
        none: "",
        rain: "/whitenoise/rain.wav",
        fire: "/whitenoise/fire.mp3",
        cafe: "/whitenoise/cafe.wav",
        ocean: "/whitenoise/ocean.flac",
        forest: "/whitenoise/forest.wav",
    };

    let musicEl: HTMLAudioElement;
    let ambienceEl: HTMLAudioElement;
    let whiteNoiseEl: HTMLAudioElement;

    // Handle Seek Request
    $: if (musicEl && $audioStore.seekRequest !== null) {
        musicEl.currentTime = $audioStore.seekRequest;
        audioStore.update((s) => ({ ...s, seekRequest: null }));
    }

    // --- MEDIA SESSION API INTEGRATION (Background Play & Metadata) ---

    // Update Playback State (Playing/Paused) for System UI
    $: if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = $audioStore.isPlaying
            ? "playing"
            : "paused";
    }

    $: updateMediaSession(
        $audioStore.currentTrackIndex,
        $audioStore.currentAlbumId,
        $audioStore.playlist,
    );

    function getAbsoluteUrl(path: string) {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return window.location.origin + path;
    }

    function updateMediaSession(
        index: number,
        albumId: string | undefined,
        playlist: any[],
    ) {
        if (typeof navigator === "undefined" || !("mediaSession" in navigator))
            return;

        if (playlist.length === 0) {
            navigator.mediaSession.metadata = null;
            return;
        }

        const currentTrack = playlist[index];
        const currentAlbum = $audioStore.availableAlbums.find(
            (a) => a.id === albumId,
        );

        if (currentTrack && currentAlbum) {
            const artUrl = getAbsoluteUrl(currentAlbum.cover);

            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.artist || currentAlbum.artist,
                album: currentAlbum.title,
                artwork: [
                    {
                        src: artUrl,
                        sizes: "512x512",
                        type: "image/jpeg",
                    },
                ],
            });

            // Set Action Handlers
            try {
                navigator.mediaSession.setActionHandler("play", () =>
                    togglePlayback(),
                );
                navigator.mediaSession.setActionHandler("pause", () =>
                    togglePlayback(),
                );
                navigator.mediaSession.setActionHandler("previoustrack", () =>
                    prevTrack(),
                );
                navigator.mediaSession.setActionHandler("nexttrack", () =>
                    nextTrack(),
                );
                navigator.mediaSession.setActionHandler("seekto", (details) => {
                    // Support system scrubber
                    if (
                        details.seekTime !== undefined &&
                        details.fastSeek === false
                    ) {
                        audioStore.update((s) => ({
                            ...s,
                            seekRequest: details.seekTime ?? null,
                        }));
                    }
                });
            } catch (e) {
                console.warn("Media Session Action Handler error:", e);
            }
        }
    }

    // Reactively update volumes
    $: if (musicEl) {
        musicEl.volume = $audioStore.isMuted ? 0 : $audioStore.musicVolume;

        // Handle Playlist
        if ($audioStore.playlist.length > 0) {
            const currentTrack =
                $audioStore.playlist[$audioStore.currentTrackIndex];
            const trackSrc = currentTrack.file; // Path relative to static

            // Change source if different
            // Note: Use getAttribute to avoid full URL matching issues
            if (musicEl.getAttribute("src") !== trackSrc) {
                musicEl.src = trackSrc;
                if ($audioStore.isPlaying) {
                    musicEl
                        .play()
                        .catch((e) => console.log("Auto-play blocked:", e));
                }
            }

            // Play/Pause state
            if (
                $audioStore.isPlaying &&
                musicEl.paused &&
                musicEl.readyState >= 2
            ) {
                // 2 = HAVE_CURRENT_DATA
                musicEl.play().catch((e) => console.log("Play error:", e));
            } else if (!$audioStore.isPlaying && !musicEl.paused) {
                musicEl.pause();
            }
        } else {
            // No playlist active -> Stop music
            musicEl.pause();
            musicEl.src = "";
        }
    }

    // Handle Ambience Layer
    $: if (ambienceEl) {
        ambienceEl.volume = $audioStore.isMuted
            ? 0
            : $audioStore.ambienceVolume;

        const ambienceSrc = AMBIENCE_TRACKS[$audioStore.currentAmbience];

        if (ambienceEl.getAttribute("src") !== ambienceSrc) {
            if (ambienceSrc) {
                ambienceEl.src = ambienceSrc;
                if ($audioStore.isPlaying) {
                    ambienceEl.play().catch(() => {
                        /* Autoplay blocked */
                    });
                }
            } else {
                ambienceEl.pause();
                ambienceEl.src = "";
            }
        }

        // Play/Pause sync
        if (
            $audioStore.isPlaying &&
            ambienceSrc &&
            ambienceEl.paused &&
            ambienceEl.readyState >= 2
        ) {
            ambienceEl.play().catch(() => {
                /* Autoplay blocked */
            });
        } else if (!$audioStore.isPlaying && !ambienceEl.paused) {
            ambienceEl.pause();
        }
    }

    // Handle White Noise Layer (independent of music playback)
    $: if (whiteNoiseEl) {
        whiteNoiseEl.volume = $audioStore.isMuted
            ? 0
            : $audioStore.whiteNoiseVolume;

        const whiteNoiseSrc = WHITE_NOISE_TRACKS[$audioStore.currentWhiteNoise];

        if (whiteNoiseEl.getAttribute("src") !== whiteNoiseSrc) {
            if (whiteNoiseSrc) {
                whiteNoiseEl.src = whiteNoiseSrc;
                whiteNoiseEl.play().catch(() => {
                    /* Autoplay blocked */
                });
            } else {
                whiteNoiseEl.pause();
                whiteNoiseEl.src = "";
            }
        }

        // Keep playing if has source (white noise is always on when selected)
        if (
            whiteNoiseSrc &&
            whiteNoiseEl.paused &&
            whiteNoiseEl.readyState >= 2
        ) {
            whiteNoiseEl.play().catch(() => {
                /* Autoplay blocked */
            });
        }
    }

    function handleTrackEnd() {
        console.log("Track ended");

        // Handle repeat modes
        const { repeatMode, currentTrackIndex, playlist } = $audioStore;

        if (repeatMode === "one") {
            // Repeat current track
            if (musicEl) {
                musicEl.currentTime = 0;
                musicEl.play().catch(() => {
                    /* Autoplay blocked */
                });
            }
        } else if (repeatMode === "all") {
            // Go to next track, loop back to start if at end
            nextTrack();
        } else {
            // Normal mode: next track or stop at end
            if (currentTrackIndex < playlist.length - 1) {
                nextTrack();
            } else {
                // End of playlist
                audioStore.update((s) => ({ ...s, isPlaying: false }));
            }
        }
    }

    function handleTimeUpdate() {
        if (musicEl) {
            audioStore.update((s) => ({
                ...s,
                currentTime: musicEl.currentTime,
            }));
        }
    }

    // --- AUDIO ANALYSIS (VISUALIZER) ---
    import { analysisStore } from "$lib/audio/analysis";

    let audioContext: AudioContext;
    let sourceNode: MediaElementAudioSourceNode;
    let analyser: AnalyserNode;
    let animationLoopId: number;

    function initAudioAnalysis() {
        if (typeof window === "undefined") return;
        if (!musicEl || audioContext) return;

        try {
            const AudioContextClass =
                window.AudioContext || (window as any).webkitAudioContext;
            audioContext = new AudioContextClass();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256; // 128 bins

            // Connect graph
            sourceNode = audioContext.createMediaElementSource(musicEl);
            sourceNode.connect(analyser);
            analyser.connect(audioContext.destination);

            console.log("Audio Context Initialized for Visualization");
        } catch (e) {
            console.error("Audio Analysis Setup Failed:", e);
        }
    }

    function updateVisualizer(time: number) {
        if (!analyser) return;

        // Throttling: Limit updates to ~30fps to save CPU
        // 1000ms / 30fps = ~33ms
        if (time - lastFrameTime < 33) {
            if (!musicEl.paused) {
                animationLoopId = requestAnimationFrame(updateVisualizer);
            }
            return;
        }
        lastFrameTime = time;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        // Simple frequency bands mapping
        // 0-3: Bass
        // 4-15: Mid
        // 16+: High
        const bassEnd = 4;
        const midEnd = 16;

        const getAvg = (start: number, end: number) => {
            let sum = 0;
            for (let i = start; i < end; i++) sum += dataArray[i];
            return sum / (end - start) / 255;
        };

        const bass = getAvg(0, bassEnd);
        const mid = getAvg(bassEnd, midEnd);
        const high = getAvg(midEnd, 32);

        analysisStore.set({ bass, mid, high, isPlaying: true });

        if (!musicEl.paused) {
            animationLoopId = requestAnimationFrame(updateVisualizer);
        }
    }

    import { browser } from "$app/environment";
    let lastFrameTime = 0;

    // Trigger analysis loop when playing
    $: if (browser && $audioStore.isPlaying) {
        // Initialize context on first play
        if (!audioContext && musicEl) {
            initAudioAnalysis();
        }
        // Resume context
        if (audioContext?.state === "suspended") {
            audioContext.resume();
        }
        // Start loop
        cancelAnimationFrame(animationLoopId);
        animationLoopId = requestAnimationFrame(updateVisualizer);
    } else if (browser) {
        cancelAnimationFrame(animationLoopId);
        // Reset analysis when stopped to avoid stuck visuals
        analysisStore.update((s) => ({
            ...s,
            bass: 0,
            mid: 0,
            high: 0,
            isPlaying: false,
        }));
    }

    function handleDurationChange() {
        if (musicEl) {
            audioStore.update((s) => ({ ...s, duration: musicEl.duration }));
        }
    }
</script>

<!-- Music Player (Playlist) -->
<audio
    bind:this={musicEl}
    on:ended={handleTrackEnd}
    on:timeupdate={handleTimeUpdate}
    on:durationchange={handleDurationChange}
    on:error={(e) => console.warn("Audio Error (Music):", e)}
    preload="auto"
    crossorigin="anonymous"
></audio>

<!-- Ambience Player (Loop) -->
<audio
    bind:this={ambienceEl}
    loop
    preload="auto"
    crossorigin="anonymous"
    on:error={(e) => console.warn("Audio Error (Ambience):", e)}
></audio>

<!-- White Noise Player (Loop) -->
<audio
    bind:this={whiteNoiseEl}
    loop
    preload="auto"
    crossorigin="anonymous"
    on:error={(e) => console.warn("Audio Error (White Noise):", e)}
></audio>
