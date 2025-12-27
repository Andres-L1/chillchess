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
            themes: {
                custom: [
                    {
                        name: 'chillhop-warm',
                        properties: {
                            '--theme-font-family-base': 'Inter, sans-serif',
                            '--theme-font-family-heading': 'Poppins, sans-serif',
                            '--theme-rounded-base': '16px',
                            '--theme-rounded-container': '24px',
                            '--color-primary-50': '255 245 237',
                            '--color-primary-100': '255 232 213',
                            '--color-primary-200': '255 207 170',
                            '--color-primary-300': '255 184 140',
                            '--color-primary-400': '255 158 109',
                            '--color-primary-500': '255 123 61',
                            '--color-primary-600': '245 90 31',
                            '--color-primary-700': '214 63 15',
                            '--color-primary-800': '177 49 16',
                            '--color-primary-900': '143 41 16',
                            '--color-surface-50': '253 251 247',
                            '--color-surface-100': '249 245 237',
                            '--color-surface-200': '245 230 211',
                            '--color-surface-300': '232 213 183',
                            '--color-surface-400': '212 184 150',
                            '--color-surface-500': '193 154 117',
                            '--color-surface-600': '166 124 90',
                            '--color-surface-700': '139 99 71',
                            '--color-surface-800': '114 81 59',
                            '--color-surface-900': '94 67 50',
                        },
                    },
                ],
            },
        }),
    ],
} satisfies Config;
