import { writable } from 'svelte/store';

export type AmbienceType = 'rain' | 'library' | 'garden' | 'none';
export type MusicType = 'lofi' | 'jazz' | 'piano' | 'flute' | 'none';
export type VibePreset = 'noir' | 'library' | 'zen' | 'custom';

export interface AudioState {
    musicVolume: number;
    ambienceVolume: number;
    isMuted: boolean;
    currentAmbience: AmbienceType;
    currentMusic: MusicType;
    isPlaying: boolean;
    activeVibe: VibePreset;
}

const initialState: AudioState = {
    musicVolume: 0.4,
    ambienceVolume: 0.6,
    isMuted: false,
    currentAmbience: 'rain',
    currentMusic: 'lofi',
    isPlaying: false,
    activeVibe: 'noir'
};

export const audioStore = writable<AudioState>(initialState);

export function setMusicVolume(val: number) {
    audioStore.update(s => ({ ...s, musicVolume: val, activeVibe: 'custom' }));
}

export function setAmbienceVolume(val: number) {
    audioStore.update(s => ({ ...s, ambienceVolume: val, activeVibe: 'custom' }));
}

export function toggleMute() {
    audioStore.update(s => ({ ...s, isMuted: !s.isMuted }));
}

export function unlockAudio() {
    audioStore.update(s => ({ ...s, isPlaying: true }));
}

// Vibe Presets
export function setVibe(vibe: VibePreset) {
    audioStore.update(s => {
        switch (vibe) {
            case 'noir':
                return {
                    ...s,
                    currentAmbience: 'rain',
                    currentMusic: 'jazz',
                    musicVolume: 0.4,
                    ambienceVolume: 0.6,
                    activeVibe: 'noir'
                };
            case 'library':
                return {
                    ...s,
                    currentAmbience: 'library',
                    currentMusic: 'piano',
                    musicVolume: 0.3,
                    ambienceVolume: 0.5,
                    activeVibe: 'library'
                };
            case 'zen':
                return {
                    ...s,
                    currentAmbience: 'garden',
                    currentMusic: 'flute',
                    musicVolume: 0.35,
                    ambienceVolume: 0.7,
                    activeVibe: 'zen'
                };
            default:
                return s;
        }
    });
}
