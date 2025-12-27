import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    optimizeDeps: {
        exclude: ['cm-chessboard']
    },
    ssr: {
        noExternal: ['cm-chessboard']
    }
});
