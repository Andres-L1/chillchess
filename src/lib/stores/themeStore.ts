import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeColor = 'sky' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';

const STORAGE_KEY = 'chillchess_theme';

const themes: Record<ThemeColor, Record<string, string>> = {
    sky: {
        '50': '236 254 255',
        '100': '207 250 254',
        '200': '165 243 252',
        '300': '103 232 249',
        '400': '34 211 238',
        '500': '0 229 255', // NeatPass Hero Highlight Cyan
        '600': '8 145 178',
        '700': '14 116 144',
        '800': '21 94 117',
        '900': '22 78 99',
    },
    emerald: {
        '50': '236 253 245',
        '100': '209 250 229',
        '200': '167 243 208',
        '300': '110 231 183',
        '400': '52 211 153',
        '500': '16 185 129',
        '600': '5 150 105',
        '700': '4 120 87',
        '800': '6 95 70',
        '900': '6 78 59',
    },
    indigo: {
        '50': '238 242 255',
        '100': '224 231 255',
        '200': '199 210 254',
        '300': '165 180 252',
        '400': '129 140 248',
        '500': '99 102 241',
        '600': '79 70 229',
        '700': '67 56 202',
        '800': '55 48 163',
        '900': '49 46 129',
    },
    purple: {
        '50': '250 245 255',
        '100': '243 232 255',
        '200': '233 213 255',
        '300': '216 180 254',
        '400': '192 132 252',
        '500': '168 85 247',
        '600': '147 51 234',
        '700': '126 34 206',
        '800': '107 33 168',
        '900': '88 28 135',
    },
    amber: {
        '50': '255 251 235',
        '100': '254 243 199',
        '200': '253 230 138',
        '300': '252 211 77',
        '400': '251 191 36',
        '500': '245 158 11',
        '600': '217 119 6',
        '700': '180 83 9',
        '800': '146 64 14',
        '900': '120 53 15',
    },
    rose: {
        '50': '255 241 242',
        '100': '255 228 230',
        '200': '254 205 211',
        '300': '253 164 175',
        '400': '251 113 133',
        '500': '244 63 94',
        '600': '225 29 72',
        '700': '190 18 60',
        '800': '159 18 57',
        '900': '136 19 55',
    }
}

export type ThemeMode = 'light' | 'dark';

function createThemeModeStore() {
    let initialMode: ThemeMode = 'dark';

    if (browser) {
        const stored = localStorage.getItem('chillchess_mode');
        if (stored === 'light' || stored === 'dark') {
            initialMode = stored as ThemeMode;
        } else {
            // Si no hay nada guardado, forzamos dark y lo guardamos
            localStorage.setItem('chillchess_mode', 'dark');
        }
    }

    const { subscribe, set, update } = writable<ThemeMode>(initialMode);

    return {
        subscribe,
        toggle: () => update(m => {
            const next = m === 'light' ? 'dark' : 'light';
            if (browser) {
                localStorage.setItem('chillchess_mode', next);
                document.documentElement.classList.toggle('dark', next === 'dark');
            }
            return next;
        }),
        setMode: (mode: ThemeMode) => {
            if (browser) {
                localStorage.setItem('chillchess_mode', mode);
                document.documentElement.classList.toggle('dark', mode === 'dark');
            }
            set(mode);
        }
    };
}

function createThemeStore() {
    let initialColor: ThemeColor = 'sky';
    if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && Object.keys(themes).includes(stored)) {
            initialColor = stored as ThemeColor;
        }
    }
    const { subscribe, set } = writable<ThemeColor>(initialColor);
    return {
        subscribe,
        set: (color: ThemeColor) => {
            if (browser) localStorage.setItem(STORAGE_KEY, color);
            set(color);
        }
    };
}

export const themeModeStore = createThemeModeStore();

export const themeColorStore = createThemeStore();

export const themeVariables = derived(themeColorStore, ($themeColor) => {
    const palette = themes[$themeColor as ThemeColor] || themes.sky;
    let vars = '';
    for (const [key, value] of Object.entries(palette)) {
        vars += `--brand-${key}: ${value};\n`;
    }
    return vars;
});
