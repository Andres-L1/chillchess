import type { Config } from 'tailwindcss';
import { skeleton } from '@skeletonlabs/tw-plugin';

export default {
    darkMode: 'class',
    content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/@skeletonlabs/skeleton/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                // Warm Chillhop Palette
                primary: {
                    50: '#fff5ed',
                    100: '#ffe8d5',
                    200: '#ffcfaa',
                    300: '#ffb88c',
                    400: '#ff9e6d',
                    500: '#ff7b3d',
                    600: '#f55a1f',
                    700: '#d63f0f',
                    800: '#b13110',
                    900: '#8f2910',
                },
                secondary: {
                    50: '#fff1f7',
                    100: '#ffe4f0',
                    200: '#ffc9e3',
                    300: '#ff8fb3',
                    400: '#ff6b9d',
                    500: '#ff3d7f',
                    600: '#f01d6a',
                    700: '#d10f56',
                    800: '#ad1049',
                    900: '#8f1240',
                },
                tertiary: {
                    50: '#fdfbf7',
                    100: '#f9f5ed',
                    200: '#f5e6d3',
                    300: '#e8d5b7',
                    400: '#d4b896',
                    500: '#c19a75',
                    600: '#a67c5a',
                    700: '#8b6347',
                    800: '#72513b',
                    900: '#5e4332',
                },
            },
            fontFamily: {
                poppins: ['Poppins', 'sans-serif'],
            },
        },
    },
    plugins: [
        skeleton({
            themes: { preset: ['skeleton'] }
        }),
    ],
} satisfies Config;
