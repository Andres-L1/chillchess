import { writable } from 'svelte/store';

export type TimerMode = 'focus' | 'short' | 'long';

export interface TimerState {
    isRunning: boolean;
    mode: TimerMode;
    timeLeft: number;
    duration: number;
}

const initialState: TimerState = {
    isRunning: false,
    mode: 'focus',
    timeLeft: 25 * 60,
    duration: 25 * 60
};

function createTimerStore() {
    const { subscribe, set, update } = writable<TimerState>(initialState);
    let interval: any;

    return {
        subscribe,
        setMode: (mode: TimerMode) => {
            let duration = 25 * 60;
            if (mode === 'short') duration = 5 * 60;
            if (mode === 'long') duration = 15 * 60;

            update(s => ({
                ...s,
                isRunning: false,
                mode,
                duration,
                timeLeft: duration
            }));
            if (interval) clearInterval(interval);
        },
        toggle: () => {
            update(s => {
                if (s.isRunning) {
                    if (interval) clearInterval(interval);
                    return { ...s, isRunning: false };
                } else {
                    // Start logic handled implicitly by component usually, 
                    // but we can simulate tick here or let component handle tick
                    return { ...s, isRunning: true };
                }
            });
        },
        tick: () => {
            update(s => {
                if (!s.isRunning) return s;
                if (s.timeLeft <= 0) {
                    return { ...s, isRunning: false, timeLeft: 0 };
                }
                return { ...s, timeLeft: s.timeLeft - 1 };
            });
        },
        reset: () => {
            update(s => ({ ...s, isRunning: false, timeLeft: s.duration }));
        },
        stop: () => {
            update(s => ({ ...s, isRunning: false }));
        }
    };
}

export const timerStore = createTimerStore();
