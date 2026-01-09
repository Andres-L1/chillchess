<script lang="ts">
    import { audioStore } from '$lib/audio/store';
    import { userStore } from '$lib/auth/userStore';
    import { db } from '$lib/firebase';
    import { doc, setDoc } from 'firebase/firestore';

    let lastUpdate = 0;
    let timeout: any;

    // Helper to resolve R2 keys to public URLs
    async function resolveR2Url(key: string): Promise<string> {
        if (!key || (!key.startsWith('music/') && !key.startsWith('catalog/'))) {
            return key; // Not an R2 key, return as-is
        }

        try {
            const res = await fetch('/api/r2/get-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
            });
            if (res.ok) {
                const data = await res.json();
                return data.url;
            }
        } catch (e) {
            console.warn('Failed to resolve R2 URL:', e);
        }

        return '/logo-mobile.png'; // Fallback
    }

    // Reactivo a cambios relevantes
    $: if ($userStore.user) {
        // Trigger sync cuando cambian estas props clave
        const _ = {
            idx: $audioStore.currentTrackIndex,
            playing: $audioStore.isPlaying,
            time: Math.floor($audioStore.currentTime / 5), // Sync cada 5s de progreso aprox si no hay otros cambios
        };
        syncState();
    }

    async function syncState() {
        if (!$userStore.user) return;
        const state = $audioStore;

        // Rate limiting (max 1 write per 2s)
        const now = Date.now();
        if (now - lastUpdate < 2000) {
            clearTimeout(timeout);
            timeout = setTimeout(syncState, 2000);
            return;
        }

        lastUpdate = now;

        let track = null;
        let cover = '/logo-mobile.png';
        let artist = 'ChillChess';
        let title = 'Chill Session';

        if (state.playlist && state.playlist.length > 0) {
            const currentTrack = state.playlist[state.currentTrackIndex];
            if (currentTrack) {
                // Find album info for fallbacks
                const album = state.availableAlbums.find((a) => a.id === state.currentAlbumId);

                title = currentTrack.title;
                artist = currentTrack.artist || album?.artist || 'ChillChess Artist';

                // Get cover, might be R2 key
                const rawCover =
                    (currentTrack as any).coverUrl ||
                    (currentTrack as any).cover ||
                    (currentTrack as any).albumCover ||
                    album?.cover ||
                    album?.r2CoverKey ||
                    '/logo-mobile.png';

                // Resolve R2 key to public URL before syncing
                cover = await resolveR2Url(rawCover);
            }
        }

        const data = {
            isPlaying: state.isPlaying,
            track: {
                title,
                artist,
                cover, // Now always a public URL, never an R2 key
                duration: state.duration || 0,
                currentTime: state.currentTime || 0,
            },
            updatedAt: now,
        };

        try {
            // Guardamos en una colección 'nowPlaying' usando el UID como ID del documento
            // Esto es más limpio que un subdocumento profundo
            await setDoc(doc(db, 'nowPlaying', $userStore.user.uid), data, {
                merge: true,
            });
        } catch (e) {
            console.warn('Widget sync error:', e);
        }
    }
</script>
