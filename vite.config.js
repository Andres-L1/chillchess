import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
    plugins: [
        sveltekit(),
        imagetools({
            defaultDirectives: (url) => {
                // Auto-optimize images
                return new URLSearchParams({
                    format: 'webp',
                    quality: '80'
                });
            }
        })
    ],
    optimizeDeps: {
        exclude: ['cm-chessboard']
    },
    ssr: {
        noExternal: ['cm-chessboard']
    },
    build: {
        // Use esbuild for faster minification
        minify: 'esbuild',
        // CSS code splitting
        cssCodeSplit: true,
        // Reduce chunk size warnings threshold
        chunkSizeWarningLimit: 500,
        // Target modern browsers for smaller bundle
        target: 'es2020',
        // Advanced chunking strategy
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Firebase chunks (aggressive splitting to reduce main bundle)
                    if (id.includes('firebase/auth')) return 'firebase-auth';
                    if (id.includes('firebase/firestore')) return 'firebase-firestore';
                    if (id.includes('firebase/storage')) return 'firebase-storage';
                    if (id.includes('firebase/functions')) return 'firebase-functions';
                    if (id.includes('@firebase') || id.includes('firebase/app')) return 'firebase-core';

                    // Heavy admin pages
                    if (id.includes('/routes/admin/')) return 'admin-panel';

                    // Artist submission (heavy R2 logic)
                    if (id.includes('/routes/artist/submit')) return 'artist-submit';

                    // Proposals
                    if (id.includes('/routes/proposals')) return 'proposals';

                    // Large vendor libraries
                    if (id.includes('node_modules')) {
                        // Extract large libraries separately
                        if (id.includes('svelte')) return 'svelte-vendor';
                        // Everything else goes into vendor
                        return 'vendor';
                    }
                }
            }
        }
    }
});
