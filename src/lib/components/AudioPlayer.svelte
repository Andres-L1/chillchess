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

    let musicEl: HTMLAudioElement;
    let ambienceEl: HTMLAudioElement;

    // Handle Seek Request
    $: if (musicEl && $audioStore.seekRequest !== null) {
        musicEl.currentTime = $audioStore.seekRequest;
        audioStore.update((s) => ({ ...s, seekRequest: null }));
    }

    // --- MEDIA SESSION API INTEGRATION (Background Play & Metadata) ---
    $: updateMediaSession(
        $audioStore.currentTrackIndex,
        $audioStore.currentAlbumId,
        $audioStore.playlist,
    );

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
        // Encontrar info del álbum para la carátula
        const currentAlbum = $audioStore.availableAlbums.find(
            (a) => a.id === albumId,
        );

        if (currentTrack && currentAlbum) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.artist || currentAlbum.artist,
                album: currentAlbum.title,
                artwork: [
                    {
                        src: currentAlbum.cover,
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: currentAlbum.cover,
                        sizes: "512x512",
                        type: "image/jpeg",
                    },
                ],
            });

            // Set Action Handlers
            navigator.mediaSession.setActionHandler("play", () => {
                if (!$audioStore.isPlaying) togglePlayback();
            });
            navigator.mediaSession.setActionHandler("pause", () => {
                if ($audioStore.isPlaying) togglePlayback();
            });
            navigator.mediaSession.setActionHandler("previoustrack", () =>
                prevTrack(),
            );
            navigator.mediaSession.setActionHandler("nexttrack", () =>
                nextTrack(),
            );
            navigator.mediaSession.setActionHandler("stop", () => {
                if ($audioStore.isPlaying) togglePlayback();
            });
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
                    ambienceEl.play().catch(console.error);
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
            ambienceEl.play().catch(console.error);
        } else if (!$audioStore.isPlaying && !ambienceEl.paused) {
            ambienceEl.pause();
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
                musicEl.play().catch(console.error);
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
    preload="auto"
    crossorigin="anonymous"
></audio>

<!-- Ambience Player (Loop) -->
<audio bind:this={ambienceEl} loop preload="auto" crossorigin="anonymous"
></audio>
