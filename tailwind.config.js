/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            colors: {
                chill: {
                    cyan: '#00D9FF',
                    pink: '#FF006E',
                    violet: '#8B5CF6',
                    navy: '#0a0e27',
                    'navy-light': '#1a1f3a'
                }
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': {
                        opacity: '1',
                        boxShadow: '0 0 20px currentColor'
                    },
                    '50%': {
                        opacity: '0.7',
                        boxShadow: '0 0 40px currentColor'
                    }
                }
            }
        }
    },
    plugins: []
};
