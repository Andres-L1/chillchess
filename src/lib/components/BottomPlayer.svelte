<script lang="ts">
    import { audioStore } from '$lib/audio/store';
    import { onMount } from 'svelte';
    import { getAlbumById } from '$lib/data/albums';
    import { favoritesStore, toggleFavorite, isFavorite } from '$lib/data/favorites';
    import { userSubscription } from '$lib/subscription/userSubscription';
    import { devLogger } from '$lib/utils/devLogger';

    import MiniPlayer from './player/MiniPlayer.svelte';
    import DesktopPlayer from './player/DesktopPlayer.svelte';
    import MobilePlayer from './player/MobilePlayer.svelte';
    import MinimizedPlayer from './player/MinimizedPlayer.svelte';

    // State
    // Minimized state (Bubble vs Dock)
    let isMinimized = false;
    // Collapsed state (MiniPlayer vs Main Player)
    let isCollapsed = false;

    // Persistent close state
    let isClosed = false;

    // Logic for resolved cover
    let resolvedCover = '/logo-mobile.png';

    $: currentTrack = $audioStore.playlist[$audioStore.currentTrackIndex];
    $: isTrackFavorite = currentTrack?.id ? isFavorite(currentTrack.id, $favoritesStore) : false;
    $: currentAlbum = $audioStore.currentAlbumId ? getAlbumById($audioStore.currentAlbumId) : null;

    // Reactivity for Auto-Open
    let lastTrackId: string | undefined;
    $: if (currentTrack?.id !== lastTrackId) {
        lastTrackId = currentTrack?.id;
        if (currentTrack?.id) {
            isClosed = false;
            isMinimized = false;
            localStorage.setItem('chillchess_player_closed', 'false');
        }
    }

    onMount(() => {
        const savedClosedState = localStorage.getItem('chillchess_player_closed');
        if (savedClosedState === 'true') {
            isClosed = true;
        }
    });

    function closePlayer() {
        audioStore.update((s) => ({ ...s, isPlaying: false }));
        isClosed = true;
        localStorage.setItem('chillchess_player_closed', 'true');
    }

    function handleFavoriteToggle(trackId: string) {
        const result = toggleFavorite(trackId, $userSubscription.tier);
        if (!result.success && result.error) {
            alert(result.error);
        }
    }

    async function downloadTrack() {
        if (!currentTrack || !currentTrack.file) {
            alert('No se puede descargar esta canción (archivo no disponible)');
            return;
        }

        const isPro = ['pro', 'premium', 'lifetime'].includes($userSubscription.tier);

        if (!isPro) {
            alert('👑 Descargas disponibles solo para usuarios PRO');
            return;
        }

        try {
            const response = await fetch(currentTrack.file);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${currentTrack.title} - ${currentTrack.artist}.mp3`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            devLogger.error('Download error:', { error: e });
            alert('Error al descargar');
        }
    }

    // R2 Resolution Logic
    $: if (currentAlbum) {
        import('$lib/utils/r2').then(({ resolveCoverUrl }) => {
            resolveCoverUrl(currentAlbum.r2CoverKey || currentAlbum.cover, '/logo-mobile.png')
                .then((url) => (resolvedCover = url))
                .catch((err) => {
                    devLogger.error('Error resolving album cover', { error: err });
                    resolvedCover = '/logo-mobile.png';
                });
        });
    } else if (currentTrack?.cover) {
        import('$lib/utils/r2').then(({ resolveCoverUrl }) => {
            const coverKey = (currentTrack as any).albumCover || currentTrack.cover;
            resolveCoverUrl(coverKey, '/logo-mobile.png')
                .then((url) => (resolvedCover = url))
                .catch((err) => {
                    devLogger.error('Error resolving track cover', { error: err });
                    resolvedCover = '/logo-mobile.png';
                });
        });
    }
</script>

{#if currentTrack && !isClosed}
    {#if isCollapsed}
        <MiniPlayer
            {currentTrack}
            onExpand={() => (isCollapsed = false)}
            isFavorite={isTrackFavorite}
            onFavoriteClick={() => currentTrack?.id && handleFavoriteToggle(currentTrack.id)}
            onClose={closePlayer}
        />
    {:else}
        <DesktopPlayer
            {currentTrack}
            {resolvedCover}
            {isTrackFavorite}
            bind:isMinimized
            on:close={closePlayer}
            on:favorite={() => currentTrack?.id && handleFavoriteToggle(currentTrack.id)}
            on:download={downloadTrack}
        />

        {#if isMinimized}
            <MinimizedPlayer
                {currentTrack}
                {resolvedCover}
                on:expand={() => (isMinimized = false)}
                on:close={closePlayer}
            />
        {/if}

        <MobilePlayer
            {currentTrack}
            currentAlbum={currentAlbum || null}
            {resolvedCover}
            {isTrackFavorite}
            on:collapse={() => (isCollapsed = true)}
            on:favorite={() => currentTrack?.id && handleFavoriteToggle(currentTrack.id)}
            on:download={downloadTrack}
        />
    {/if}
{/if}
