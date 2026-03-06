import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        sveltekit(),
    ],
    build: {
        minify: 'esbuild',
        cssCodeSplit: true,
        chunkSizeWarningLimit: 500,
        target: 'es2020',
    }
});
