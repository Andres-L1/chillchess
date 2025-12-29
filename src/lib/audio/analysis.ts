import { writable } from 'svelte/store';

export interface AudioAnalysis {
    bass: number; // 0-1 (Normalized volume of low frequencies)
    mid: number;  // 0-1
    high: number; // 0-1
    isPlaying: boolean;
}

export const analysisStore = writable<AudioAnalysis>({
    bass: 0,
    mid: 0,
    high: 0,
    isPlaying: false
});
