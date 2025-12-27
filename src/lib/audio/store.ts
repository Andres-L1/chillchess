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
}

const initialState: AudioState = {
    musicVolume: 0.4,
    ambienceVolume: 0.6,
    isMuted: false,

    currentAmbience: 'none', // Por defecto silencio en menú
    playlist: [], // Sin música en menú
    currentTrackIndex: 0,

    isPlaying: false,
    activeVibe: 'custom'
};

export const audioStore = writable<AudioState>(initialState);

// --- Actions ---

export function setMusicVolume(val: number) {
    audioStore.update(s => ({ ...s, musicVolume: val }));
}

export function setAmbienceVolume(val: number) {
    audioStore.update(s => ({ ...s, ambienceVolume: val }));
}

export function toggleMute() {
    audioStore.update(s => ({ ...s, isMuted: !s.isMuted }));
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
