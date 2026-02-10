<script lang="ts">
    import { slide, fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { goto } from '$app/navigation';
    import {
        audioStore,
        togglePlayback,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
    } from '$lib/audio/store';
    import { userSubscription } from '$lib/subscription/userSubscription';
    import type { Track, Album } from '$lib/types';

    import ProgressBar from './ProgressBar.svelte';

    export let currentTrack: Track;
    export let currentAlbum: Album | null;
    export let resolvedCover: string;
    export let isTrackFavorite: boolean;

    const dispatch = createEventDispatcher();

    let showTrackList = false;
    let showMobileOptions = false;

    function handleImageError(e: Event) {
        const img = e.currentTarget as HTMLImageElement;
        img.src = '/logo-mobile.png';
    }
</script>

<!-- MOBILE FULLSCREEN LAYOUT -->
<div
    class="md:hidden fixed top-0 left-0 w-full h-[100dvh] z-[200] flex flex-col safe-area-bottom overflow-hidden bg-slate-900"
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
                on:click={() => dispatch('collapse')}
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
                on:click={() => (showMobileOptions = true)}
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
                    <!-- HEADER NAVIGATION -->
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
                                        src={track.cover || resolvedCover || '/logo-mobile.png'}
                                        alt=""
                                        class="w-full h-full object-cover {i ===
                                            $audioStore.currentTrackIndex && $audioStore.isPlaying
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
                <div class="flex flex-col h-full" transition:slide={{ axis: 'y', duration: 300 }}>
                    <div class="flex-1 flex items-center justify-center p-4">
                        <div
                            class="w-full aspect-square relative max-w-[340px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden group border border-white/5"
                        >
                            <img
                                src={currentTrack.cover || resolvedCover || '/logo-mobile.png'}
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
                        <!-- Download Button (Mobile) -->
                        <button
                            on:click={() => dispatch('download')}
                            class="w-10 h-10 active:scale-90 transition-transform flex items-center justify-center {[
                                'pro',
                                'premium',
                                'lifetime',
                            ].includes($userSubscription.tier)
                                ? 'text-slate-400'
                                : 'text-slate-600'}"
                        >
                            <svg
                                class="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                        </button>

                        <div class="flex-1 px-4 min-w-0 text-center">
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
                            on:click={() => dispatch('favorite')}
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
                                <svg class="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"
                                    ><path d="M8 5v14l11-7z" /></svg
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
                    <div class="flex items-center justify-between px-6 pb-16 pt-4">
                        <button
                            on:click={() => (showTrackList = !showTrackList)}
                            class="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-90 p-3 rounded-xl hover:bg-white/5"
                            aria-label="Ver cola de reproducción"
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
                            <span class="text-[10px] font-medium">Cola</span>
                        </button>

                        <button
                            on:click={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copiado!');
                            }}
                            class="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-90 p-3 rounded-xl hover:bg-white/5"
                            aria-label="Compartir"
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
                            <span class="text-[10px] font-medium">Compartir</span>
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Mobile Options Menu Overlay -->
    {#if showMobileOptions}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center"
            transition:fade={{ duration: 200 }}
            on:click={() => (showMobileOptions = false)}
        >
            <div
                class="bg-[#1e293b] w-full rounded-t-3xl border-t border-white/10 p-6 space-y-2 mb-0 safe-area-bottom shadow-2xl"
                on:click|stopPropagation
                transition:slide={{ axis: 'y', duration: 200 }}
            >
                <div class="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                    <div class="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden">
                        <img
                            src={currentTrack.cover || resolvedCover || '/logo-mobile.png'}
                            class="w-full h-full object-cover"
                            alt=""
                        />
                    </div>
                    <div class="min-w-0">
                        <h3 class="text-white font-bold truncate max-w-[200px]">
                            {currentTrack.title}
                        </h3>
                        <p class="text-slate-400 text-sm">{currentTrack.artist}</p>
                    </div>
                </div>

                {#if currentAlbum?.artistId}
                    <button
                        class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white transition-colors text-left"
                        on:click={() => {
                            showMobileOptions = false;
                            dispatch('collapse'); // Minimize player
                            goto(`/artist/${currentAlbum.artistId}`);
                        }}
                    >
                        <svg
                            class="w-6 h-6 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        <span>Ver perfil del Artista</span>
                    </button>
                {/if}

                <button
                    class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-white transition-colors text-left"
                    on:click={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: currentTrack.title,
                                text: `Escucha ${currentTrack.title} de ${currentTrack.artist} en ChillChess`,
                                url: window.location.href,
                            });
                        } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Enlace copiado');
                        }
                        showMobileOptions = false;
                    }}
                >
                    <svg
                        class="w-6 h-6 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                    </svg>
                    <span>Compartir canción</span>
                </button>

                <button
                    class="w-full p-3 mt-4 text-center font-bold text-slate-300 hover:text-white border-t border-white/5 pt-4"
                    on:click={() => (showMobileOptions = false)}
                >
                    Cancelar
                </button>
            </div>
        </div>
    {/if}
</div>
