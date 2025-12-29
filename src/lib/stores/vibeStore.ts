import { writable } from 'svelte/store';

export type ClockStyle = 'modern' | 'neon' | 'elegant' | 'retro' | 'analog';
export type BackgroundMode = 'gradient' | 'particles' | 'grid' | 'aurora';

interface VibeState {
    background: BackgroundMode;
    bgParams: {
        color: string;
        intensity: number;
    };
    clockStyle: ClockStyle;
    showSeconds: boolean;
    isBreathing: boolean; // For breathing exercise mode
}

const initialState: VibeState = {
    background: 'gradient',
    bgParams: {
        color: 'default',
        intensity: 0.5
    },
    clockStyle: 'modern',
    showSeconds: false,
    isBreathing: false
};

function createVibeStore() {
    const { subscribe, set, update } = writable<VibeState>(initialState);

    return {
        subscribe,
        setClockStyle: (style: ClockStyle) => update(s => ({ ...s, clockStyle: style })),
        setBackground: (mode: BackgroundMode) => update(s => ({ ...s, background: mode })),
        toggleSeconds: () => update(s => ({ ...s, showSeconds: !s.showSeconds })),
        toggleBreathing: () => update(s => ({ ...s, isBreathing: !s.isBreathing })),
        reset: () => set(initialState)
    };
}

export const vibeStore = createVibeStore();
