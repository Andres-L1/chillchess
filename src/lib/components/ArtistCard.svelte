<script lang="ts">
    import type { ArtistProfile, SocialLink } from '$lib/types/artist';
    import { SOCIAL_PLATFORMS } from '$lib/types/artist';
    import { onMount } from 'svelte';
    import { collection, query, where, getDocs } from 'firebase/firestore';
    import { db } from '$lib/firebase';
    import { audioStore } from '$lib/audio/store';
    import type { Album } from '$lib/data/albums';

    export let profile: ArtistProfile;
    export let isPro: boolean = false;
    export let isPreview: boolean = false;

    let artistAlbums: Album[] = [];
    let loadingAlbums = true;

    onMount(async () => {
        if (!profile.userId || isPreview) {
            loadingAlbums = false;
            return;
        }

        try {
            // Query albums where artistId matches
            const q = query(collection(db, 'albums'), where('artistId', '==', profile.userId));
            const snapshot = await getDocs(q);
            artistAlbums = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Album);
        } catch (e) {
            console.error('Error loading artist albums:', e);
        } finally {
            loadingAlbums = false;
        }
    });

    // Helper to extract year safely
    function getAlbumYear(album: Album) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const seconds = (album.createdAt as any)?.seconds;
        return new Date(seconds ? seconds * 1000 : Date.now()).getFullYear();
    }

    // Get social platform info
    function getPlatformInfo(platform: string) {
        return SOCIAL_PLATFORMS.find((p) => p.id === platform) || SOCIAL_PLATFORMS[6];
    }

    // Handle link click
    function handleSocialClick(link: SocialLink) {
        if (!isPro && !isPreview) {
            // Free users: links don't work
            alert('🔒 Actualiza a Pro para habilitar links a redes sociales');
            return;
        }
        // Pro users or preview: open link
        window.open(link.url, '_blank');
    }

    // Theme colors
    $: themeColor = profile.themeColor || '#9333EA';
    $: accentColor = profile.accentColor || '#A855F7';
    $: cardLayout = profile.cardLayout || 'default';
</script>

<div
    class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl transition-all hover:scale-[1.02] duration-300"
    style="max-width: 500px;"
>
    <!-- Banner -->
    <div class="relative h-32 overflow-hidden">
        {#if profile.bannerUrl && isPro}
            <img src={profile.bannerUrl} alt="Banner" class="w-full h-full object-cover" />
        {:else if isPro && profile.bannerStyle === 'gradient'}
            <div
                class="w-full h-full"
                style="background: linear-gradient(135deg, {themeColor}, {accentColor})"
            ></div>
        {:else}
            <!-- Default gradient for free users -->
            <div class="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900"></div>
        {/if}

        <!-- PRO Badge -->
        {#if isPro}
            <div
                class="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg"
            >
                ✨ PRO
            </div>
        {/if}
    </div>

    <!-- Avatar -->
    <div class="relative -mt-16 flex justify-center px-6">
        <div
            class="w-32 h-32 rounded-full border-4 overflow-hidden shadow-xl"
            style="border-color: {isPro ? themeColor : '#6366F1'}"
        >
            {#if profile.avatarUrl}
                <img
                    src={profile.avatarUrl}
                    alt={profile.artistName}
                    class="w-full h-full object-cover bg-slate-800"
                />
            {:else}
                <div
                    class="w-full h-full flex items-center justify-center text-5xl"
                    style="background: linear-gradient(135deg, {isPro
                        ? themeColor
                        : '#6366F1'}, {isPro ? accentColor : '#8B5CF6'})"
                >
                    {profile.artistName.charAt(0).toUpperCase()}
                </div>
            {/if}
        </div>
    </div>

    <!-- Content -->
    <div class="px-6 pb-6 pt-4 text-center">
        <!-- Artist Name -->
        <h2 class="text-2xl font-bold mb-2" style="color: {isPro ? themeColor : '#FFFFFF'}">
            {profile.artistName}
        </h2>

        <!-- Bio -->
        <p class="text-slate-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            {profile.bio || 'Artista en ChillChess'}
        </p>

        <!-- Stats (PRO only) -->
        {#if isPro && (profile.totalPlays || profile.followerCount)}
            <div class="flex justify-center gap-8 mb-6 text-sm">
                {#if profile.totalPlays}
                    <div>
                        <div class="text-2xl font-bold text-white">
                            {profile.totalPlays.toLocaleString()}
                        </div>
                        <div class="text-slate-500 text-xs">Reproducciones</div>
                    </div>
                {/if}
                {#if profile.followerCount}
                    <div>
                        <div class="text-2xl font-bold text-white">
                            {profile.followerCount.toLocaleString()}
                        </div>
                        <div class="text-slate-500 text-xs">Seguidores</div>
                    </div>
                {/if}
            </div>
        {/if}

        <!-- Social Links -->
        {#if profile.socialLinks && profile.socialLinks.length > 0}
            <div class="flex flex-wrap justify-center gap-3 mt-6">
                {#each profile.socialLinks as link}
                    {@const platformInfo = getPlatformInfo(link.platform)}
                    <button
                        on:click={() => handleSocialClick(link)}
                        class="group relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                        style="background: {isPro
                            ? `${platformInfo.color}15`
                            : '#ffffff10'}; border: 1px solid {isPro
                            ? `${platformInfo.color}30`
                            : '#ffffff20'}"
                        class:opacity-60={!isPro}
                        class:cursor-not-allowed={!isPro && !isPreview}
                        class:hover:scale-105={isPro || isPreview}
                    >
                        <span class="text-lg">{platformInfo.icon}</span>
                        <span
                            class="text-white"
                            style="color: {isPro ? platformInfo.color : '#9CA3AF'}"
                        >
                            {link.label || platformInfo.label}
                        </span>

                        {#if !isPro && !isPreview}
                            <span
                                class="absolute -top-2 -right-2 text-xs bg-yellow-500 text-black rounded-full w-5 h-5 flex items-center justify-center font-bold"
                            >
                                🔒
                            </span>
                        {/if}
                    </button>
                {/each}
            </div>
        {/if}

        <!-- Discography / Releases Section (Auto-Connected) -->
        {#if !loadingAlbums && artistAlbums.length > 0}
            <!-- 1. All Tracks (Popular / Latest) -->
            {@const allTracks = artistAlbums.flatMap((a) =>
                (a.tracks || []).map((t) => ({ ...t, albumCover: a.cover, albumTitle: a.title }))
            )}

            {#if allTracks.length > 0}
                <div class="mt-8 pt-6 border-t border-white/10">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Canciones ({allTracks.length})
                        </h3>
                        <button
                            on:click={() => {
                                // Play All
                                audioStore.update((s) => ({
                                    ...s,
                                    playlist: allTracks,
                                    currentTrackIndex: 0,
                                    isPlaying: true,
                                    isRadioMode: false,
                                    currentAlbumId: undefined,
                                }));
                            }}
                            class="text-xs font-bold text-primary-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <span>▶</span> Reproducir Todas
                        </button>
                    </div>

                    <div class="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {#each allTracks as track, i}
                            <button
                                on:click={() => {
                                    // Play this track within the context of ALL artist tracks
                                    audioStore.update((s) => ({
                                        ...s,
                                        playlist: allTracks,
                                        currentTrackIndex: i,
                                        isPlaying: true,
                                        isRadioMode: false,
                                        currentAlbumId: undefined,
                                    }));
                                }}
                                class="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group text-left"
                            >
                                <div
                                    class="w-8 h-8 rounded overflow-hidden bg-black/50 flex-shrink-0 relative group-hover:ring-1 group-hover:ring-primary-500"
                                >
                                    <img
                                        src={track.albumCover || '/images/default-album.png'}
                                        alt={track.title}
                                        class="w-full h-full object-cover"
                                    />
                                    <div
                                        class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                    >
                                        <span class="text-white text-[10px]">▶</span>
                                    </div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p
                                        class="text-xs font-bold text-white truncate group-hover:text-primary-400 transition-colors"
                                    >
                                        {track.title}
                                    </p>
                                    <p class="text-[10px] text-slate-500 truncate">
                                        {track.albumTitle}
                                    </p>
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- 2. Albums List -->
            <div class="mt-8 pt-6 border-t border-white/10">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Álbumes
                </h3>
                <div class="space-y-3">
                    {#each artistAlbums as album}
                        <div
                            class="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors group text-left cursor-default"
                        >
                            <img
                                src={album.cover}
                                alt={album.title}
                                class="w-10 h-10 rounded object-cover bg-black/50"
                            />
                            <div class="flex-1 min-w-0">
                                <p
                                    class="text-sm font-bold text-white truncate group-hover:text-primary-400 transition-colors"
                                >
                                    {album.title}
                                </p>
                                <p class="text-[10px] text-slate-500">
                                    {album.tracks?.length || 0} canciones
                                </p>
                            </div>
                            <span class="text-xs text-slate-600 font-mono">
                                {getAlbumYear(album)}
                            </span>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Upgrade CTA for free users -->
        {#if !isPro && !isPreview}
            <div
                class="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30"
            >
                <p class="text-xs text-purple-300 mb-2">
                    ✨ Desbloquea personalización completa y links activos
                </p>
                <button
                    class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                >
                    Actualizar a Pro
                </button>
            </div>
        {/if}
    </div>
</div>
