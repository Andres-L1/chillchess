<script lang="ts">
    import { audioStore } from "$lib/audio/store";

    // Placeholder paths - User should replace these with real files in static/assets/audio/
    const TRACKS = {
        music: {
            lofi: "/assets/audio/music/lofi.mp3",
            jazz: "/assets/audio/music/jazz.mp3",
            piano: "/assets/audio/music/piano.mp3",
            none: "",
        },
        ambience: {
            rain: "/assets/audio/ambience/rain.mp3",
            library: "/assets/audio/ambience/library.mp3",
            none: "",
        },
    };

    let musicEl: HTMLAudioElement;
    let ambienceEl: HTMLAudioElement;

    // Reactively update volumes
    $: if (musicEl) {
        musicEl.volume = $audioStore.isMuted ? 0 : $audioStore.musicVolume;
        // Handle Play/Pause based on store.isPlaying
        if (
            $audioStore.isPlaying &&
            $audioStore.currentMusic !== "none" &&
            musicEl.paused
        ) {
            musicEl.play().catch(console.error);
        } else if (
            !$audioStore.isPlaying ||
            $audioStore.currentMusic === "none"
        ) {
            musicEl.pause();
        }
    }

    $: if (ambienceEl) {
        ambienceEl.volume = $audioStore.isMuted
            ? 0
            : $audioStore.ambienceVolume;
        if (
            $audioStore.isPlaying &&
            $audioStore.currentAmbience !== "none" &&
            ambienceEl.paused
        ) {
            ambienceEl.play().catch(console.error);
        } else if (
            !$audioStore.isPlaying ||
            $audioStore.currentAmbience === "none"
        ) {
            ambienceEl.pause();
        }
    }
</script>

<!-- Hidden Audio Elements -->
<audio
    bind:this={musicEl}
    src={TRACKS.music[$audioStore.currentMusic]}
    loop
    preload="auto"
></audio>
<audio
    bind:this={ambienceEl}
    src={TRACKS.ambience[$audioStore.currentAmbience]}
    loop
    preload="auto"
></audio>
