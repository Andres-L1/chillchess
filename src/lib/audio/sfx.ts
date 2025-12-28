import { get } from 'svelte/store';
import { audioStore } from './store';

const SOUNDS = {
    // Chess.com sounds (usually reliable CORS)
    noir: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/move-self.mp3',
    library: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/wood/move-self.mp3',
    zen: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/glass/move-self.mp3',
    default: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/move-self.mp3'
};

const CAPTURE_SOUNDS = {
    noir: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/capture.mp3',
    library: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/wood/capture.mp3',
    zen: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/glass/capture.mp3',
    default: 'https://images.chesscomfiles.com/chess-themes/sounds/_Common/standard/capture.mp3'
};

export function playMoveSound(isCapture = false) {
    try {
        const state = get(audioStore);
        if (state.isMuted) return;

        const vibe = state.activeVibe || 'custom';
        // Map 'custom' to default
        const soundKey = (vibe === 'custom' ? 'noir' : vibe) as keyof typeof SOUNDS;

        const url = isCapture ? CAPTURE_SOUNDS[soundKey] : SOUNDS[soundKey];
        const finalUrl = url || (isCapture ? CAPTURE_SOUNDS.default : SOUNDS.default);

        const audio = new Audio(finalUrl);
        // Volume logic: Ambience usually 0-1. SFX should be audible but soft.
        audio.volume = Math.min((state.musicVolume + state.ambienceVolume) / 2 + 0.2, 1);

        const promise = audio.play();
        if (promise !== undefined) {
            promise.catch(error => {
                // Auto-play policy might block this if no interaction yet, ignore
            });
        }
    } catch (e) {
        console.warn('SFX Error:', e);
    }
}
