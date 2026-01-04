<script lang="ts">
    import {
        audioStore,
        togglePlayback,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
    } from '$lib/audio/store';
    import { slide } from 'svelte/transition';
    import { onMount, createEventDispatcher } from 'svelte';
    import { getAlbumById } from '$lib/data/albums';

    import MiniPlayer from './player/MiniPlayer.svelte';
    import TrackInfo from './player/TrackInfo.svelte';
    import PlaybackControls from './player/PlaybackControls.svelte';
    import ProgressBar from './player/ProgressBar.svelte';
    import VolumeControl from './player/VolumeControl.svelte';

    const dispatch = createEventDispatcher();

    import { favoritesStore, toggleFavorite, isFavorite } from '$lib/data/favorites';
    import { userSubscription } from '$lib/subscription/userSubscription';

    function handleFavoriteToggle(trackId: string) {
        const result = toggleFavorite(trackId, $userSubscription.tier);
        if (!result.success && result.error) {
            alert(result.error);
        }
    }

    let showVolumeSlider = false;
    let isCollapsed = false;
    let showTrackList = false;

    $: currentTrack = $audioStore.playlist[$audioStore.currentTrackIndex];
    $: isTrackFavorite = currentTrack?.id ? isFavorite(currentTrack.id, $favoritesStore) : false;
    $: currentAlbum = $audioStore.currentAlbumId ? getAlbumById($audioStore.currentAlbumId) : null;

    // Persistent close state using localStorage
    let isClosed = false;

    onMount(() => {
        // Restore close state from localStorage
        const savedClosedState = localStorage.getItem('chillchess_player_closed');
        if (savedClosedState === 'true') {
            isClosed = true;
        }
    });

    // Better reactivity for "New Track -> Open Player"
    let lastTrackId: string | undefined;
    $: if (currentTrack?.id !== lastTrackId) {
        lastTrackId = currentTrack?.id;
        // Only auto-open if a new track actually started playing
        if (currentTrack?.id) {
            isClosed = false;
            // Also un-minimize if a new track starts
            isMinimized = false;
            localStorage.setItem('chillchess_player_closed', 'false');
        }
    }

    function closePlayer() {
        audioStore.update((s) => ({ ...s, isPlaying: false }));
        isClosed = true;
        // Persist the closed state
        localStorage.setItem('chillchess_player_closed', 'true');
    }

    // Minimized state
    let isMinimized = false;
    let resolvedCover = '/logo-mobile.png';

    $: if (currentAlbum) {
        if (currentAlbum.cover) {
            resolvedCover = currentAlbum.cover;
        } else if ((currentAlbum as any).r2CoverKey) {
            fetch(`/api/r2/get-url?key=${encodeURIComponent((currentAlbum as any).r2CoverKey)}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.url) resolvedCover = data.url;
                })
                .catch((err) => console.error('Error resolving cover in BottomPlayer', err));
        } else {
            resolvedCover = '/logo-mobile.png';
        }
    } else if (currentTrack?.cover) {
        resolvedCover = currentTrack.cover;
    }

    function handleImageError(e: Event) {
        const img = e.currentTarget as HTMLImageElement;
        img.src = '/logo-mobile.png';
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
        <!-- Note: MiniPlayer needs to support onClose prop or we wrap it. 
             If MiniPlayer doesn't support onClose, I'll wrap it or just rely on expanded view close.
             Let's assume user interacts mostly with expanded. 
             For now, I will add a close button to the expanded view primarily.
        -->
    {:else}
        <!-- FLOATING DOCK PLAYER -->
        <!-- FLOATING DOCK PLAYER -->
        <!-- DESKTOP DOCK LAYOUT (EVOLVED) -->
        <div
            transition:slide={{ duration: 400, axis: 'y' }}
            class="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex-col items-center group/dock perspective-1000 {isMinimized
                ? 'pointer-events-none'
                : ''}"
        >
            <!-- Minimized View (Optional - can be expanded later if needed) -->

            <!-- Main Player Container -->
            <div class="relative w-[750px] transition-all duration-300 hover:w-[780px]">
                <!-- 0. Dynamic Ambient Glow (Behind) -->
                <div
                    class="absolute -inset-4 bg-gradient-to-t from-primary-500/20 to-purple-500/20 blur-3xl rounded-[3rem] opacity-0 group-hover/dock:opacity-100 transition-opacity duration-700"
                ></div>

                <!-- 1. Glass Background -->
                <div
                    class="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                >
                    <!-- Animated Shine -->
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/dock:translate-x-full transition-transform duration-[1.5s] ease-in-out {isMinimized
                            ? 'hidden'
                            : ''}"
                    ></div>
                </div>

                <!-- 2. Content -->
                <div
                    class="relative z-10 px-4 py-3 flex items-center gap-6 {isMinimized
                        ? 'hidden'
                        : ''}"
                >
                    <!-- Track Info -->
                    <div class="flex-initial w-48 truncate">
                        <TrackInfo
                            {currentTrack}
                            isFavorite={isTrackFavorite}
                            onFavoriteClick={() =>
                                currentTrack?.id && handleFavoriteToggle(currentTrack.id)}
                            onShowTracks={() => (showTrackList = !showTrackList)}
                        />
                    </div>

                    <!-- Controls & Progress (Centered) -->
                    <div class="flex-1 flex flex-col justify-center gap-1">
                        <div class="flex items-center justify-center -mt-1">
                            <PlaybackControls />
                        </div>
                        <div class="w-full px-2">
                            <ProgressBar />
                        </div>
                    </div>

                    <!-- Volume & Extras -->
                    <div
                        class="flex flex-shrink-0 items-center gap-4 border-l border-white/10 pl-6"
                    >
                        <VolumeControl />

                        <!-- Close / Minimize Button -->
                        <div class="flex items-center gap-1">
                            <button
                                on:click={() => (isMinimized = true)}
                                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                title="Minimizar reproductor"
                            >
                                <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    ></path>
                                </svg>
                            </button>
                            <button
                                on:click={closePlayer}
                                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors"
                                title="Cerrar reproductor"
                            >
                                <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- DESKTOP QUEUE POPUP -->
                {#if showTrackList && !isMinimized}
                    <div
                        transition:slide={{ axis: 'y' }}
                        class="absolute bottom-full left-0 w-full mb-4 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl max-h-[400px] overflow-hidden flex flex-col"
                    >
                        <div
                            class="flex items-center justify-between mb-4 border-b border-white/5 pb-2"
                        >
                            <h3 class="text-white font-bold">Cola de Reproducción</h3>
                            <button
                                on:click={() => (showTrackList = false)}
                                class="text-slate-400 hover:text-white"
                            >
                                <svg
                                    class="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    ><path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    /></svg
                                >
                            </button>
                        </div>
                        <div class="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20">
                            {#each $audioStore.playlist as track, i}
                                <button
                                    class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group text-left transition-colors {i ===
                                    $audioStore.currentTrackIndex
                                        ? 'bg-white/10'
                                        : ''}"
                                    on:click={() => {
                                        audioStore.update((s) => ({
                                            ...s,
                                            currentTrackIndex: i,
                                            isPlaying: true,
                                        }));
                                    }}
                                >
                                    <div
                                        class="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-slate-800"
                                    >
                                        <img
                                            src={track.cover || resolvedCover || '/logo-mobile.png'}
                                            class="w-full h-full object-cover {i ===
                                                $audioStore.currentTrackIndex &&
                                            $audioStore.isPlaying
                                                ? 'opacity-50'
                                                : ''}"
                                            alt=""
                                            loading="lazy"
                                            on:error={handleImageError}
                                        />
                                        {#if i === $audioStore.currentTrackIndex && $audioStore.isPlaying}
                                            <div
                                                class="absolute inset-0 flex items-center justify-center"
                                            >
                                                <div
                                                    class="w-1 h-3 bg-primary-500 animate-bounce"
                                                ></div>
                                            </div>
                                        {/if}
                                    </div>
                                    <div class="min-w-0">
                                        <div
                                            class="text-sm font-medium text-white truncate {i ===
                                            $audioStore.currentTrackIndex
                                                ? 'text-primary-400'
                                                : ''}"
                                        >
                                            {track.title}
                                        </div>
                                        <div class="text-xs text-slate-400 truncate">
                                            {track.artist}
                                        </div>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Hide Handle (Visual only) -->
            <div
                class="absolute -bottom-6 opacity-0 group-hover/dock:opacity-100 transition-opacity"
            >
                <button
                    on:click={() => (isCollapsed = true)}
                    class="text-xs text-slate-500 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 hover:text-white"
                    >Ocultar</button
                >
            </div>
        </div>

        <!-- FLOATING MINIMIZED BUBBLE (Redesigned) -->
        {#if isMinimized}
            <div class="fixed bottom-6 right-6 z-[100] group/mini" transition:slide>
                <!-- Close Button (Absolute) -->
                <button
                    on:click|stopPropagation={closePlayer}
                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center shadow-lg opacity-0 group-hover/mini:opacity-100 transition-all hover:bg-red-600 z-50 hover:scale-110"
                    title="Cerrar reproductor"
                >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M6 18L18 6M6 6l12 12"
                        /></svg
                    >
                </button>

                <button
                    class="group flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-white/10 p-2 pr-6 rounded-full shadow-2xl hover:bg-black/90 hover:border-primary-500/30 transition-all duration-300 max-w-[300px]"
                    on:click={() => (isMinimized = false)}
                >
                    <div
                        class="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                    >
                        <img
                            src={resolvedCover || '/logo-mobile.png'}
                            alt="Now Playing"
                            class="w-full h-full object-cover {$audioStore.isPlaying
                                ? 'animate-[spin_10s_linear_infinite]'
                                : ''}"
                            on:error={handleImageError}
                        />
                        <!-- Play/Expand Overlay -->
                        <div
                            class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"
                                ><path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"
                                ></path></svg
                            >
                        </div>
                    </div>

                    <div class="flex flex-col items-start min-w-0 overflow-hidden">
                        <span
                            class="text-xs font-bold text-white truncate w-full group-hover:text-primary-400 transition-colors"
                        >
                            {currentTrack.title}
                        </span>
                        <span class="text-xs text-slate-400 truncate w-full">
                            {currentTrack.artist}
                        </span>
                    </div>
                </button>
            </div>
        {/if}

        <!-- MOBILE FULLSCREEN LAYOUT -->
        <div
            class="md:hidden fixed inset-0 z-[200] flex flex-col safe-area-bottom overflow-hidden bg-slate-900"
            transition:slide={{ duration: 400, axis: 'y' }}
        >
            <!-- 1. Background Blur Layer (Matches current track) -->
            <div
                class="absolute inset-0 z-0 opacity-40 scale-110 blur-3xl transition-all duration-1000"
                style="background-image: url('{currentTrack.cover ||
                    currentAlbum?.cover ||
                    '/logo-mobile.png'}'); background-position: center; background-size: cover;"
            ></div>
            <!-- Gradient Overlay -->
            <div
                class="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-slate-900/80 to-slate-950/95"
            ></div>

            <!-- 2. Content Container -->
            <div
                class="relative z-10 flex-1 flex flex-col h-full w-full max-w-lg mx-auto p-6 pt-16 md:pt-6"
            >
                <!-- Header -->
                <div class="flex items-center justify-between pt-2 pb-6">
                    <button
                        on:click={() => (isCollapsed = true)}
                        class="p-2 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
                        aria-label="Minimizar"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            /></svg
                        >
                    </button>

                    <div class="flex flex-col items-center">
                        <span
                            class="text-[10px] font-bold tracking-[0.2em] text-white font-cinzel uppercase"
                            >Reproduciendo</span
                        >
                        <span class="text-xs text-slate-400 font-medium truncate max-w-[150px]"
                            >{currentAlbum?.title || 'ChillChess Radio'}</span
                        >
                    </div>

                    <button
                        class="p-2 w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
                        aria-label="Opciones"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                            /></svg
                        >
                    </button>
                </div>

                <!-- Spacer for Tracklist Animation -->
                <div class="flex-1 overflow-hidden relative">
                    {#if showTrackList}
                        <!-- QUEUE VIEW (Updated Style with Navigation) -->
                        <div
                            class="absolute inset-0 overflow-y-auto pr-2 scrollbar-hide bg-slate-950/80 backdrop-blur-xl rounded-t-3xl border-t border-white/10 pt-4 px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 flex flex-col"
                            transition:slide={{ axis: 'y', duration: 300 }}
                        >
                            <!-- HEADER NAVIGATION (Missing in previous version) -->
                            <div
                                class="flex items-center justify-between mb-6 sticky top-0 bg-slate-950/50 backdrop-blur-sm p-2 rounded-xl z-30"
                            >
                                <h3 class="text-white font-bold text-lg">Cola</h3>
                                <button
                                    on:click={() => (showTrackList = false)}
                                    class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                >
                                    <svg
                                        class="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M19 9l-7 7-7-7"
                                        /></svg
                                    >
                                </button>
                            </div>

                            <div class="text-sm text-slate-400 mb-6 flex items-center gap-2">
                                <span
                                    class="bg-white/10 px-2 py-0.5 rounded text-xs font-bold text-slate-300"
                                    >MIX</span
                                >
                                <span>Reproduciendo desde {currentAlbum?.title || 'Radio'}</span>
                            </div>

                            <div class="space-y-4 pb-24">
                                {#each $audioStore.playlist as track, i}
                                    <button
                                        class="w-full flex items-center gap-4 text-left group rounded-xl hover:bg-white/5 p-2 transition-colors {i ===
                                        $audioStore.currentTrackIndex
                                            ? 'bg-white/5'
                                            : 'opacity-80'}"
                                        on:click={() => {
                                            audioStore.update((s) => ({
                                                ...s,
                                                currentTrackIndex: i,
                                                isPlaying: true,
                                            }));
                                        }}
                                    >
                                        <!-- Album Art / Status -->
                                        <div
                                            class="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative bg-slate-800"
                                        >
                                            <img
                                                src={track.cover ||
                                                    resolvedCover ||
                                                    '/logo-mobile.png'}
                                                alt=""
                                                class="w-full h-full object-cover {i ===
                                                    $audioStore.currentTrackIndex &&
                                                $audioStore.isPlaying
                                                    ? 'opacity-50'
                                                    : ''}"
                                                on:error={handleImageError}
                                            />
                                            {#if i === $audioStore.currentTrackIndex && $audioStore.isPlaying}
                                                <div
                                                    class="absolute inset-0 flex items-center justify-center"
                                                >
                                                    <div class="flex gap-1 items-end h-4">
                                                        <div
                                                            class="w-1 bg-primary-500 animate-[bounce_1s_infinite] h-2"
                                                        ></div>
                                                        <div
                                                            class="w-1 bg-primary-500 animate-[bounce_1.2s_infinite] h-4"
                                                        ></div>
                                                        <div
                                                            class="w-1 bg-primary-500 animate-[bounce_0.8s_infinite] h-3"
                                                        ></div>
                                                    </div>
                                                </div>
                                            {/if}
                                        </div>

                                        <!-- Info -->
                                        <div class="flex-1 min-w-0">
                                            <p
                                                class="font-bold text-base truncate {i ===
                                                $audioStore.currentTrackIndex
                                                    ? 'text-primary-400'
                                                    : 'text-white'}"
                                            >
                                                {track.title}
                                            </p>
                                            <p class="text-xs text-slate-400 truncate">
                                                {track.artist}
                                            </p>
                                        </div>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {:else}
                        <!-- MAIN PLAYER VIEW -->
                        <div
                            class="flex flex-col h-full"
                            transition:slide={{ axis: 'y', duration: 300 }}
                        >
                            <div class="flex-1 flex items-center justify-center p-4">
                                <div
                                    class="w-full aspect-square relative max-w-[340px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden group border border-white/5"
                                >
                                    <img
                                        src={currentTrack.cover ||
                                            resolvedCover ||
                                            '/logo-mobile.png'}
                                        alt={currentTrack.title}
                                        class="w-full h-full object-cover {$audioStore.isPlaying
                                            ? 'scale-100'
                                            : 'scale-105'}"
                                        on:error={handleImageError}
                                    />
                                </div>
                            </div>

                            <!-- Info Row -->
                            <div class="flex items-center justify-between mb-8 px-2">
                                <div class="flex-1 pr-6 min-w-0">
                                    <h2
                                        class="text-2xl font-bold text-white leading-tight font-poppins truncate block"
                                    >
                                        {currentTrack.title}
                                    </h2>
                                    <a
                                        href="/artist"
                                        class="text-lg text-slate-400 mt-1 hover:text-white transition-colors truncate block"
                                    >
                                        {currentTrack.artist}
                                    </a>
                                </div>
                                <button
                                    on:click={() =>
                                        currentTrack?.id && handleFavoriteToggle(currentTrack.id)}
                                    class="w-10 h-10 active:scale-90 transition-transform flex items-center justify-center"
                                >
                                    <svg
                                        class="w-7 h-7 {isTrackFavorite
                                            ? 'text-primary-500 fill-primary-500'
                                            : 'text-slate-400'}"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <!-- Progress -->
                            <div class="mb-8 w-full">
                                <ProgressBar />
                            </div>

                            <!-- Controls -->
                            <div class="flex items-center justify-between mb-10 px-2">
                                <button
                                    on:click={toggleShuffle}
                                    class="text-slate-400 hover:text-white transition-colors {$audioStore.shuffle
                                        ? "text-primary-500 relative after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary-500 after:rounded-full"
                                        : ''}"
                                >
                                    <svg
                                        class="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                        /></svg
                                    >
                                </button>

                                <button
                                    on:click={prevTrack}
                                    class="text-white hover:scale-110 active:scale-95 transition-transform"
                                >
                                    <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"
                                        ><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg
                                    >
                                </button>

                                <button
                                    on:click={togglePlayback}
                                    class="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                    {#if $audioStore.isPlaying}
                                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"
                                            ><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg
                                        >
                                    {:else}
                                        <svg
                                            class="w-8 h-8 ml-1"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg
                                        >
                                    {/if}
                                </button>

                                <button
                                    on:click={nextTrack}
                                    class="text-white hover:scale-110 active:scale-95 transition-transform"
                                >
                                    <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"
                                        ><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg
                                    >
                                </button>

                                <button
                                    on:click={toggleRepeat}
                                    class="text-slate-400 hover:text-white relative transition-colors {$audioStore.repeatMode !==
                                    'off'
                                        ? "text-primary-500 relative after:content-[''] after:absolute after:-bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary-500 after:rounded-full"
                                        : ''}"
                                >
                                    <svg
                                        class="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        /></svg
                                    >
                                    {#if $audioStore.repeatMode === 'one'}
                                        <span
                                            class="absolute -top-1 -right-1 text-[8px] bg-green-500 text-black px-1 rounded-full font-bold"
                                            >1</span
                                        >
                                    {/if}
                                </button>
                            </div>

                            <!-- Bottom Row (Queue & Share) -->
                            <div class="flex items-center justify-between px-6 pb-2">
                                <button
                                    on:click={() => (showTrackList = !showTrackList)}
                                    class="text-slate-400 hover:text-white transition-colors active:scale-90"
                                >
                                    <svg
                                        class="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        /></svg
                                    >
                                </button>

                                <button
                                    on:click={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        // Simple alert for now as we don't have the full share sheet logic yet
                                        alert('Link copiado!');
                                    }}
                                    class="text-slate-400 hover:text-white transition-colors active:scale-90"
                                >
                                    <svg
                                        class="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                        /></svg
                                    >
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
{/if}
