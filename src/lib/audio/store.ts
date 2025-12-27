import { writable } from 'svelte/store';

export interface AudioState {
    musicVolume: number; // 0.0 to 1.0
    ambienceVolume: number; // 0.0 to 1.0
    isMuted: boolean;
    currentAmbience: 'rain' | 'library' | 'none';
    currentMusic: 'lofi' | 'jazz' | 'piano' | 'none';
    isPlaying: boolean; // Master playing state (unlocked by user)
}

const initialState: AudioState = {
    musicVolume: 0.4,
    ambienceVolume: 0.6,
    isMuted: false,
    currentAmbience: 'rain',
    currentMusic: 'lofi',
    isPlaying: false
};

export const audioStore = writable<AudioState>(initialState);

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
