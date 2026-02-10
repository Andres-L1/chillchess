import { writable } from 'svelte/store';
import type { Track, Album } from '$lib/types';
import { ALBUMS } from '$lib/data/albums';
import { db } from '$lib/firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';

export type AmbienceType = 'rain' | 'library' | 'garden' | 'none';
export type VibePreset = 'noir' | 'library' | 'zen' | 'custom';
export type WhiteNoiseType = 'none' | 'rain' | 'fire' | 'cafe' | 'ocean' | 'forest';

export interface AudioState {
    musicVolume: number;
    // Ambience
    ambienceVolume: number;
    currentAmbience: AmbienceType;

    // White Noise
    whiteNoiseVolume: number;
    currentWhiteNoise: WhiteNoiseType;

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

    whiteNoiseVolume: 0.5,
    currentWhiteNoise: 'none',

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

// --- Initialization ---

let isInitialized = false;
const CACHE_VERSION = "v5_show_all_albums"; // ✅ Show albums without createdAt

export async function initAudioLibrary() {
    if (isInitialized) return;
    isInitialized = true;

    // 1. FAST LOAD: Try to load from LocalStorage first
    if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('chillchess_albums_cache');
        const cachedVersion = localStorage.getItem('chillchess_cache_version');

        if (cached && cachedVersion === CACHE_VERSION) {
            try {
                const parsed = JSON.parse(cached);
                console.log("[AudioLibrary] Loaded from cache (Instant).");
                audioStore.update(s => ({
                    ...s,
                    availableAlbums: parsed,
                    isLoadingLibrary: false
                }));
            } catch (e) {
                console.warn("Invalid cache", e);
            }
        } else {
            console.log("[AudioLibrary] Cache outdated or missing, fetching fresh.");
        }
    }

    // 2. BACKGROUND SYNC: Fetch from Firestore (Real-time)
    try {
        // ✅ Load ALL albums (no orderBy to avoid excluding albums without createdAt)
        const q = query(
            collection(db, 'albums'),
            limit(200) // Increased limit
        );

        // Subscribe to real-time updates
        const { onSnapshot } = await import('firebase/firestore');

        onSnapshot(q, (snapshot) => {
            const safeAlbums: Album[] = [];

            snapshot.docs.forEach((doc) => {
                try {
                    const data = doc.data();

                    // Allow description but block huge generic fields
                    const isToxic = Object.entries(data).some(([key, val]) => {
                        if (key === 'description' || key === 'tracks') return false; // Allow strict content
                        if (typeof val === 'string' && val.length > 500000) { // Bump limit to 500KB for covers
                            console.warn(`[QUARANTINE] Field '${key}' in album ${doc.id} is large (${Math.round(val.length / 1024)}KB).`);
                            return false; // Soft warn instead of block for now, unless > 500KB
                        }
                        return false;
                    });

                    // if (isToxic) return; 

                    safeAlbums.push({ id: doc.id, ...data } as Album);
                } catch (err) {
                    console.error(`[QUARANTINE] Failed to parse album ${doc.id}`, err);
                }
            });

            // ✅ Sort client-side (newest first, albums without createdAt go last)
            safeAlbums.sort((a, b) => {
                const aTime = (a as any).createdAt?.seconds || 0;
                const bTime = (b as any).createdAt?.seconds || 0;
                return bTime - aTime; // Descending (newest first)
            });

            console.log(`[AudioLibrary] Synced ${safeAlbums.length} albums from Firestore.`);

            audioStore.update((s) => ({
                ...s,
                availableAlbums: safeAlbums,
                isLoadingLibrary: false,
            }));

            // Update Cache
            if (typeof localStorage !== 'undefined' && safeAlbums.length > 0) {
                try {
                    const json = JSON.stringify(safeAlbums);
                    if (json.length < 5000000) {
                        localStorage.setItem('chillchess_albums_cache', json);
                        localStorage.setItem('chillchess_cache_version', CACHE_VERSION);
                    }
                } catch (e) {
                    console.warn("[Cache] Failed", e);
                }
            }
        }, (error) => {
            console.error("Firestore Listener Error:", error);
        });

    } catch (e) {
        console.warn("[AudioLibrary] Setup error:", e);
    }


    // 3. FALLBACK: Only if Cache AND Network fail, use static
    audioStore.update(s => {
        if (s.availableAlbums.length > 0) return s; // Keep cache if we have it
        console.log("[AudioLibrary] Using static fallback.");
        return {
            ...s,
            availableAlbums: ALBUMS,
            isLoadingLibrary: false
        };
    });
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
            playlist: (album.tracks || []).map((t) => ({
                ...t,
                artist: t.artist || album.artist, // Fallback to album artist
                cover: t.cover || (t as any).albumCover || album.cover, // ✅ Complete fallback
            })),
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

        let nextIndex: number;

        if (s.shuffle && s.playlist.length > 1) {
            // Random shuffle: pick a random song that isn't the current one
            do {
                nextIndex = Math.floor(Math.random() * s.playlist.length);
            } while (nextIndex === s.currentTrackIndex);
        } else {
            // Normal behavior: next track or loop to start
            nextIndex = (s.currentTrackIndex + 1) % s.playlist.length;
        }

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
                playlist: album.tracks || [],
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
