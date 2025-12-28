import { writable } from 'svelte/store';
import type { Track, Album } from '$lib/data/albums';
import { ALBUMS } from '$lib/data/albums';
import { db } from '$lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

export type AmbienceType = 'rain' | 'library' | 'garden' | 'none';
export type VibePreset = 'noir' | 'library' | 'zen' | 'custom';

export interface AudioState {
    musicVolume: number;
    // Ambience
    ambienceVolume: number;
    currentAmbience: AmbienceType;

    isMuted: boolean;

    // Library (Dynamic)
    availableAlbums: Album[];
    isLoadingLibrary: boolean;

    // Playback
    playlist: Track[];
    currentTrackIndex: number;
    currentAlbumId?: string;

    isPlaying: boolean;
    activeVibe: VibePreset;

    // Progress
    duration: number;
    currentTime: number;
    seekRequest: number | null;

    // Modes
    repeatMode: 'off' | 'one' | 'all';
    shuffle: boolean;
}

const initialState: AudioState = {
    musicVolume: 0.4,
    ambienceVolume: 0.6,
    currentAmbience: 'none',
    isMuted: false,

    availableAlbums: [], // Starts empty, fills from DB
    isLoadingLibrary: true,

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

// --- Initialization ---

export async function initAudioLibrary() {
    try {
        // Try to fetch from Firestore
        const q = query(collection(db, 'albums'));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const fetchedAlbums = snapshot.docs.map(doc => {
                const data = doc.data() as Album;
                // Ensure ID reflects doc ID if missing (though they should match)
                return { ...data, id: doc.id };
            });

            console.log(`[AudioLibrary] Loaded ${fetchedAlbums.length} albums from Firestore.`);
            audioStore.update(s => ({
                ...s,
                availableAlbums: fetchedAlbums,
                isLoadingLibrary: false
            }));
            return;
        }
    } catch (e) {
        console.error("[AudioLibrary] Connection error, using offline fallback:", e);
    }

    // Fallback to static data
    console.log("[AudioLibrary] Using static fallback.");
    audioStore.update(s => ({
        ...s,
        availableAlbums: ALBUMS,
        isLoadingLibrary: false
    }));
}


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
    audioStore.update(s => {
        // Look in Dynamic Library first
        const album = s.availableAlbums.find(a => a.id === albumId);
        if (!album) return s;

        return {
            ...s,
            playlist: album.tracks,
            currentTrackIndex: 0,
            currentAlbumId: albumId,
            isPlaying: true,
            currentAmbience: getAmbienceForVibe(album.vibeId) || s.currentAmbience
        };
    });
}

export function playPlaylist(tracks: Track[]) {
    audioStore.update(s => ({
        ...s,
        playlist: tracks,
        currentTrackIndex: 0,
        currentAlbumId: undefined, // Playlist personalizada
        isPlaying: true
    }));
}

export function nextTrack() {
    audioStore.update(s => {
        if (s.playlist.length === 0) return s;
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

export function setVibe(vibe: VibePreset) {
    audioStore.update(s => {
        const album = s.availableAlbums.find(a => a.vibeId === vibe);
        if (album) {
            // Side-effect: dispatch playAlbum-like update
            // Since we are inside update(), we return the new state directly
            return {
                ...s,
                playlist: album.tracks,
                currentTrackIndex: 0,
                currentAlbumId: album.id,
                isPlaying: true,
                currentAmbience: getAmbienceForVibe(album.vibeId) || s.currentAmbience
            };
        } else {
            return {
                ...s,
                currentAmbience: getAmbienceForVibe(vibe) || 'none',
                activeVibe: vibe,
                playlist: [],
                isPlaying: true
            };
        }
    });
}
