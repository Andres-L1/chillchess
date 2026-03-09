import type { Config } from 'tailwindcss';

export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#007bff',
                'background-light': '#f5f7f8',
                'background-dark': '#0f1923',
                // NeatPass Palette
                neat: {
                    amber: '#fffbeb',
                    emerald: '#ecfdf5',
                    sky: '#f0f9ff',
                    violet: '#f5f3ff',
                    rose: '#fff1f2',
                    cyan: '#ecfeff',
                    slate: '#f8fafc',
                },
                brand: {
                    50: '#F0F9FF',
                    100: '#E0F2FE',
                    200: '#BAE6FD',
                    300: '#7DD3FC',
                    400: '#38BDF8',
                    500: '#0EA5E9',
                    600: '#0284C7',
                    700: '#0369A1',
                    800: '#075985',
                    900: '#0C4A6E',
                },
                main: '#007bff',
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.5rem',
                lg: '1rem',
                xl: '1.5rem',
                '2xl': '2rem',
                '3xl': '2.5rem',
                full: '9999px',
            },
            boxShadow: {
                neo: '4px 4px 0px 0px rgba(0, 0, 0, 1)',
                'neo-hover': '6px 6px 0px 0px rgba(0, 0, 0, 1)',
                'neo-lg': '8px 8px 0px 0px rgba(0, 0, 0, 1)',
                'neo-xl': '10px 10px 0px 0px rgba(0, 0, 0, 1)',
                'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
            },
        },
    },
    plugins: [],
} satisfies Config;
