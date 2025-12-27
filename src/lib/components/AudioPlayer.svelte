<script lang="ts">
    import { audioStore } from "$lib/audio/store";

    // Placeholder paths - User should replace these with real files
    const TRACKS = {
        music: {
            lofi: "/assets/audio/music/lofi.mp3",
            jazz: "/assets/audio/music/jazz.mp3",
            piano: "/assets/audio/music/piano.mp3",
            flute: "/assets/audio/music/flute.mp3",
            none: "",
        },
        ambience: {
            rain: "/assets/audio/ambience/rain.mp3",
            library: "/assets/audio/ambience/library.mp3",
            garden: "/assets/audio/ambience/garden.mp3",
            none: "",
        },
    };

    let musicEl: HTMLAudioElement;
    let ambienceEl: HTMLAudioElement;

    // Reactively update volumes and tracks
    $: if (musicEl) {
        musicEl.volume = $audioStore.isMuted ? 0 : $audioStore.musicVolume;

        // Change track if needed
        const newSrc = TRACKS.music[$audioStore.currentMusic];
        if (musicEl.src !== newSrc && newSrc) {
            musicEl.src = newSrc;
            if ($audioStore.isPlaying) musicEl.play().catch(console.error);
        }

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

        // Change track if needed
        const newSrc = TRACKS.ambience[$audioStore.currentAmbience];
        if (ambienceEl.src !== newSrc && newSrc) {
            ambienceEl.src = newSrc;
            if ($audioStore.isPlaying) ambienceEl.play().catch(console.error);
        }

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
