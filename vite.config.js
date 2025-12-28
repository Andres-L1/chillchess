import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    optimizeDeps: {
        exclude: ['cm-chessboard']
    },
    ssr: {
        noExternal: ['cm-chessboard']
    },
    build: {
        // Use esbuild for faster minification (already included)
        minify: 'esbuild',
        // CSS code splitting
        cssCodeSplit: true,
        // Reduce chunk size warnings threshold
        chunkSizeWarningLimit: 1000,
        // Target modern browsers for smaller bundle
        target: 'es2020'
    }
});
