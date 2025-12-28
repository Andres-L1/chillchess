import { writable } from 'svelte/store';
import type { Track, Album } from '$lib/data/albums';
import { ALBUMS } from '$lib/data/albums';

export type AmbienceType = 'rain' | 'library' | 'garden' | 'none';
// MusicType ya no es un enum fijo, ahora depende del album
export type VibePreset = 'noir' | 'library' | 'zen' | 'custom';

export interface AudioState {
    musicVolume: number;
    ambienceVolume: number;
    isMuted: boolean;

    // Capa de Ambiente (Loop)
    currentAmbience: AmbienceType;

    // Capa de Música (Playlist)
    playlist: Track[];
    currentTrackIndex: number;
    currentAlbumId?: string;

    isPlaying: boolean;
    activeVibe: VibePreset;

    // Playback state
    duration: number;
    currentTime: number;
    seekRequest: number | null;

    // Playback modes
    repeatMode: 'off' | 'one' | 'all';
    shuffle: boolean;
}

const initialState: AudioState = {
    musicVolume: 0.4,
    ambienceVolume: 0.6,
    isMuted: false,

    currentAmbience: 'none',
    playlist: [],
    currentTrackIndex: 0,

    isPlaying: false,
    activeVibe: 'custom',

    duration: 0,
    currentTime: 0,
    seekRequest: null,

    repeatMode: 'off',
    shuffle: false
};

export const audioStore = writable<AudioState>(initialState);

// --- Actions ---

export function toggleRepeat() {
    audioStore.update(s => {
        const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
        const currentIndex = modes.indexOf(s.repeatMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        return { ...s, repeatMode: nextMode };
    });
}

export function toggleShuffle() {
    audioStore.update(s => ({ ...s, shuffle: !s.shuffle }));
}

export function seek(time: number) {
    audioStore.update(s => ({ ...s, seekRequest: time }));
}

export function togglePlayback() {
    audioStore.update(s => ({ ...s, isPlaying: !s.isPlaying }));
}

export function setMusicVolume(val: number) {
    audioStore.update(s => ({ ...s, musicVolume: val }));
}

export function setAmbienceVolume(val: number) {
    audioStore.update(s => ({ ...s, ambienceVolume: val }));
}

export function toggleMute() {
    audioStore.update(s => ({ ...s, isMuted: !s.isMuted }));
}

export function unlockAudio() {
    audioStore.update(s => ({ ...s, isPlaying: true }));
}

export function playAlbum(albumId: string) {
    const album = ALBUMS.find(a => a.id === albumId);
    if (!album) return;

    audioStore.update(s => ({
        ...s,
        playlist: album.tracks,
        currentTrackIndex: 0,
        currentAlbumId: albumId,
        isPlaying: true, // Auto-play
        // Si el album tiene un vibe asociado, poner el ambiente de ese vibe
        currentAmbience: getAmbienceForVibe(album.vibeId) || s.currentAmbience
    }));
}

export function nextTrack() {
    audioStore.update(s => {
        if (s.playlist.length === 0) return s;
        // Loop playlist
        const nextIndex = (s.currentTrackIndex + 1) % s.playlist.length;
        return { ...s, currentTrackIndex: nextIndex };
    });
}

export function prevTrack() {
    audioStore.update(s => {
        if (s.playlist.length === 0) return s;
        let prevIndex = s.currentTrackIndex - 1;
        if (prevIndex < 0) prevIndex = s.playlist.length - 1;
        return { ...s, currentTrackIndex: prevIndex };
    });
}

// Helpers
function getAmbienceForVibe(vibeId?: string): AmbienceType | null {
    switch (vibeId) {
        case 'noir': return 'rain';
        case 'library': return 'library';
        case 'zen': return 'garden';
        default: return null;
    }
}

// Retro-compatibilidad para setVibe (ahora carga un álbum si existe)
export function setVibe(vibe: VibePreset) {
    // Buscar si hay un album con ese vibe
    const album = ALBUMS.find(a => a.vibeId === vibe);

    if (album) {
        playAlbum(album.id);
    } else {
        // Fallback básico si no hay album (solo ambiente)
        audioStore.update(s => ({
            ...s,
            currentAmbience: getAmbienceForVibe(vibe) || 'none',
            activeVibe: vibe,
            playlist: [], // Vaciar playlist si es solo vibe ambiental
            isPlaying: true
        }));
    }
}
