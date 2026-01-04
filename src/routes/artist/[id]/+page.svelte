<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
    import type { ArtistProfile } from '$lib/types/artist';
    import VerifiedBadge from '$lib/components/VerifiedBadge.svelte';
    import MusicIcon from '$lib/components/icons/MusicIcon.svelte';
    import { playAlbum, audioStore } from '$lib/audio/store';
    import { SOCIAL_PLATFORMS } from '$lib/types/artist';
    import { db } from '$lib/firebase';
    import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
    import { ALBUMS } from '$lib/data/albums';
    import type { Album } from '$lib/data/albums';

    export let data: { artistProfile: ArtistProfile; artistId: string };

    // Use reactive variable for real-time updates
    let artist = data.artistProfile;
    let artistAlbums: Album[] = [];
    let unsubscribeArtist: (() => void) | null = null;
    let unsubscribeAlbums: (() => void) | null = null;
    let showAllTracks = false;

    // Activity / Heatmap
    let activityMap: Record<string, number> = {};
    let calendar: { date: string; count: number; intensity: number }[] = [];
    let unsubscribeUser: (() => void) | null = null;

    onMount(() => {
        // 1. Listen to Artist Profile changes
        const artistRef = doc(db, 'artists', data.artistId);
        unsubscribeArtist = onSnapshot(artistRef, (docSnap) => {
            if (docSnap.exists()) {
                artist = docSnap.data() as ArtistProfile;
            }
        });

        // 2. Listen to User Activity (Heatmap)
        // CRITICAL FIX: We must use the REAL userId (UID) linked to the profile,
        // not the document ID (which might be 'julyactv-official')
        const targetUserId = artist.userId || data.artistId;
        const userRef = doc(db, 'users', targetUserId);

        unsubscribeUser = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                activityMap = userData.activityMap || {};
                generateCalendar();
            }
        });

        // 3. Listen to Albums changes
        const albumsRef = collection(db, 'albums');
        // query 1: by Document ID (e.g. 'julyactv-official')
        const qId = query(albumsRef, where('artistId', '==', data.artistId));

        const updateAlbums = (newDocs: Album[]) => {
            const currentMap = new Map(artistAlbums.map((a) => [a.id, a]));
            newDocs.forEach((a) => currentMap.set(a.id, a));

            const staticAlbums = ALBUMS.filter((a) => a.artist === artist.artistName);
            staticAlbums.forEach((a) => {
                if (!currentMap.has(a.id)) currentMap.set(a.id, a);
            });

            artistAlbums = Array.from(currentMap.values()).sort((a, b) => {
                const timeA = (a.createdAt as any)?.seconds || 0;
                const timeB = (b.createdAt as any)?.seconds || 0;
                return timeB - timeA;
            });
        };

        const unsubId = onSnapshot(qId, (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Album);
            updateAlbums(docs);
        });

        // query 2: by Artist Name string (Legacy)
        let unsubName: (() => void) | null = null;
        if (artist.artistName) {
            const qName = query(albumsRef, where('artist', '==', artist.artistName));
            unsubName = onSnapshot(qName, (snapshot) => {
                const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Album);
                updateAlbums(docs);
            });
        }

        // query 3: by User ID (UID) - CRITICAL for retroactive fix
        // This catches albums approved before the "profile ID fix" was applied
        let unsubUid: (() => void) | null = null;
        if (artist.userId && artist.userId !== data.artistId) {
            const qUid = query(albumsRef, where('artistId', '==', artist.userId));
            unsubUid = onSnapshot(qUid, (snapshot) => {
                const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Album);
                updateAlbums(docs);
            });
        }

        unsubscribeAlbums = () => {
            unsubId();
            if (unsubUid) unsubUid();
        };
    });

    // ============================================
    // R2 Cover URL Resolution (CRITICAL FIX)
    // ============================================
    // Albums from R2 have r2CoverKey instead of cover URL
    // We need to fetch signed URLs for these covers
    let coverUrlsMap = new Map<string, string>();

    async function fetchR2CoverUrl(r2Key: string): Promise<string | null> {
        try {
            const res = await fetch('/api/r2/get-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: r2Key }),
            });

            if (!res.ok) {
                console.error('Failed to fetch R2 cover URL:', await res.text());
                return null;
            }

            const { url } = await res.json();
            return url;
        } catch (err) {
            console.error('Error fetching R2 cover:', err);
            return null;
        }
    }

    // Reactive statement: Fetch R2 covers when albums change
    $: {
        artistAlbums.forEach(async (album) => {
            const anyAlbum = album as any;

            // If album has r2CoverKey but no cover URL cached yet
            if (anyAlbum.r2CoverKey && !coverUrlsMap.has(anyAlbum.r2CoverKey)) {
                const signedUrl = await fetchR2CoverUrl(anyAlbum.r2CoverKey);
                if (signedUrl) {
                    coverUrlsMap.set(anyAlbum.r2CoverKey, signedUrl);
                    coverUrlsMap = coverUrlsMap; // Trigger reactivity
                }
            }
        });
    }

    // Helper function to get cover URL (R2 or direct)
    function getCoverUrl(album: Album): string {
        const a = album as any;

        // Priority:
        // 1. Cached R2 signed URL
        if (a.r2CoverKey && coverUrlsMap.has(a.r2CoverKey)) {
            return coverUrlsMap.get(a.r2CoverKey)!;
        }

        // 2. Direct cover URL (legacy Firebase or external)
        if (album.cover) {
            return album.cover;
        }

        // 3. Fallback placeholder
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='32' fill='%23cbd5e1' font-weight='bold'%3EChillChess%3C/text%3E%3C/svg%3E";
    }

    onDestroy(() => {
        if (unsubscribeArtist) unsubscribeArtist();
        if (unsubscribeAlbums) unsubscribeAlbums();
        if (unsubscribeUser) unsubscribeUser();
    });

    function generateCalendar() {
        const now = new Date();
        const currentYear = now.getFullYear();

        // Check if leap year
        const isLeapYear =
            (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0;
        const daysInYear = isLeapYear ? 366 : 365;

        const start = new Date(currentYear, 0, 1); // Jan 1
        const end = new Date(currentYear, 11, 31); // Dec 31

        const tempCal = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const key = d.toISOString().split('T')[0];
            const count = activityMap[key] || 0;

            let intensity = 0;
            if (count > 0) intensity = 1;
            if (count > 1) intensity = 2; // More sensitive levels
            if (count > 3) intensity = 3;
            if (count > 5) intensity = 4;

            tempCal.push({ date: key, count, intensity });
        }
        calendar = tempCal;
    }

    $: totalTracks = artistAlbums.reduce((sum, album) => sum + (album.tracks?.length || 0), 0);
    $: flatTracks = artistAlbums.flatMap((a) =>
        (a.tracks || []).map((t) => ({
            ...t,
            cover: getCoverUrl({ ...a, cover: t.cover || a.cover } as any),
            albumTitle: a.title,
            artist: a.artist,
        }))
    );
    $: totalDurationSeconds = flatTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
    $: formattedDuration = formatTotalDuration(totalDurationSeconds);

    function formatTotalDuration(seconds: number) {
        if (!seconds) return '';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h === 0 && m === 0) return '';
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }

    function formatTrackDuration(seconds: number) {
        if (!seconds) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function playArtistMix() {
        audioStore.update((s) => ({
            ...s,
            playlist: flatTracks,
            currentTrackIndex: 0,
            isPlaying: true,
            isRadioMode: false,
            currentAlbumId: undefined,
        }));
    }

    function handlePlayTrack(index: number) {
        audioStore.update((s) => ({
            ...s,
            playlist: flatTracks,
            currentTrackIndex: index,
            isPlaying: true,
            isRadioMode: false,
            currentAlbumId: undefined,
        }));
    }

    function handlePlayAlbum(albumId: string) {
        playAlbum(albumId);
    }

    function getSocialIcon(platform: string) {
        return SOCIAL_PLATFORMS.find((p) => p.id === platform)?.icon || '🔗';
    }

    function handleImageError(e: Event) {
        const img = e.currentTarget as HTMLImageElement;
        img.src = '/logo-mobile.png';
    }
</script>

<svelte:head>
    <title>{artist.artistName} | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-[#0a0a0a] text-white font-poppins overflow-x-hidden relative">
    <!-- Dynamic Background Elements -->
    <div class="fixed inset-0 pointer-events-none z-0">
        <div
            class="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-900/20 to-transparent opacity-60"
        ></div>
        <div
            class="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]"
        ></div>
        <div
            class="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-rose-600/10 blur-[100px]"
        ></div>
        <!-- Noise texture overlay -->
        <div
            class="absolute inset-0 opacity-[0.03]"
            style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
        ></div>
    </div>

    <!-- Hero Section -->
    <div class="relative z-10 w-full">
        <!-- Banner Container -->
        <div class="relative h-[350px] md:h-[450px] w-full group overflow-hidden">
            {#if artist.bannerUrl}
                <img
                    src={artist.bannerUrl}
                    alt="{artist.artistName} banner"
                    class="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
            {:else}
                <div
                    class="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center"
                >
                    <MusicIcon size="xl" gradient={true} />
                </div>
            {/if}

            <!-- Gradient Overlay for text readability -->
            <div
                class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"
            ></div>

            <!-- Navigation -->
            <div class="absolute top-24 md:top-12 left-6 z-20">
                <a
                    href="/artists"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/5 rounded-full transition-all text-white/90 hover:text-white text-sm font-medium"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Volver
                </a>
            </div>

            <!-- Artist Header Info (Overlaps Banner) -->
            <div
                class="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-8 flex flex-col md:flex-row items-end gap-8"
            >
                <!-- Avatar with glow -->
                <div class="relative group/avatar shrink-0 mb-4 md:mb-0">
                    <div
                        class="w-32 h-32 md:w-48 md:h-48 rounded-full p-1 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm shadow-2xl"
                    >
                        {#if artist.avatarUrl}
                            <img
                                src={artist.avatarUrl}
                                alt={artist.artistName}
                                class="w-full h-full rounded-full object-cover shadow-inner bg-neutral-900"
                            />
                        {:else}
                            <div
                                class="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center"
                            >
                                <span class="text-4xl">🎵</span>
                            </div>
                        {/if}
                    </div>
                    <!-- Status Indicator REMOVED -->
                </div>

                <!-- Text Info -->
                <div class="flex-1 mb-2">
                    <div
                        class="flex items-center gap-3 mb-2 opacity-0 animate-fade-in"
                        style="animation-delay: 0.1s; animation-fill-mode: forwards;"
                    >
                        <span
                            class="px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded text-[10px] uppercase tracking-wider font-bold text-white/80"
                        >
                            Artista Verificado
                        </span>
                        {#if artist.followerCount}
                            <span class="text-white/60 text-xs flex items-center gap-1">
                                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"
                                    ><path
                                        d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"
                                    /></svg
                                >
                                {artist.followerCount.toLocaleString()} seguidores
                            </span>
                        {/if}
                    </div>

                    <h1
                        class="text-5xl md:text-7xl font-bold tracking-tight mb-4 flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 drop-shadow-lg"
                    >
                        {artist.artistName}
                        <VerifiedBadge size="lg" />
                    </h1>

                    <p
                        class="text-lg text-slate-300 max-w-2xl line-clamp-2 md:line-clamp-none mb-6"
                    >
                        {artist.bio || 'Música diseñada para acompañar tus mejores momentos.'}
                    </p>

                    <!-- Action Buttons -->
                    <div class="flex flex-wrap items-center gap-4">
                        <button
                            on:click={playArtistMix}
                            class="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-full font-bold flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transform hover:-translate-y-0.5 active:scale-95 tracking-wide text-sm"
                        >
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"
                                ><path d="M8 5v14l11-7z" /></svg
                            >
                            Reproducir Mix
                        </button>

                        <div class="flex items-center gap-3">
                            {#if artist.socialLinks}
                                {#each artist.socialLinks as social}
                                    <a
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-slate-400 hover:text-white group"
                                        title={social.platform}
                                    >
                                        <div
                                            class="scale-100 group-hover:scale-110 transition-transform"
                                        >
                                            {getSocialIcon(social.platform)}
                                        </div>
                                    </a>
                                {/each}
                            {/if}

                            <button
                                class="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-slate-400 hover:text-white"
                                title="Compartir"
                                on:click={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    // Could add a toast here if we had a toast system
                                }}
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
                                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                    /></svg
                                >
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content Grid -->
    <div class="max-w-7xl mx-auto px-6 py-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <!-- Left Column: Tracks & Albums (8 cols) -->
        <div class="lg:col-span-8 space-y-12">
            <!-- Safe for Streaming CTA -->
            <div
                class="bg-[#0f0f13] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group"
            >
                <!-- Glow Effect -->
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"
                ></div>

                <div class="flex items-start gap-6 relative z-10">
                    <div
                        class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20"
                    >
                        <svg
                            class="w-7 h-7 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            /></svg
                        >
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white mb-2">¿Eres Streamer?</h3>
                        <p class="text-sm text-slate-400 leading-relaxed max-w-md">
                            La música de <span class="text-indigo-400 font-bold"
                                >{artist.artistName}</span
                            > es perfecta para tus directos. Sin copyright, 100% segura.
                        </p>
                    </div>
                </div>

                <button
                    class="px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl text-sm font-bold transition-all shrink-0 hover:shadow-lg hover:shadow-indigo-500/10 whitespace-nowrap active:bg-indigo-500 active:text-white"
                    on:click={(e) => {
                        const btn = e.currentTarget;
                        const originalText = btn.innerText;

                        navigator.clipboard.writeText(
                            `Música por ${artist.artistName} - Proporcionada por ChillChess`
                        );

                        btn.innerText = '¡Créditos Copiados!';
                        btn.style.borderColor = '#4ade80';
                        btn.style.color = '#4ade80';

                        setTimeout(() => {
                            btn.innerText = originalText;
                            btn.style.borderColor = '';
                            btn.style.color = '';
                        }, 2000);
                    }}
                >
                    Copiar Créditos
                </button>
            </div>

            <!-- All Tracks List -->
            {#if flatTracks.length > 0}
                <section>
                    <div class="flex items-end justify-between mb-8">
                        <div>
                            <h2 class="text-3xl font-bold text-white mb-2">Canciones</h2>
                            <p class="text-slate-500 text-sm flex items-center gap-2">
                                <span>{flatTracks.length} canciones disponibles</span>
                                {#if totalDurationSeconds > 0}
                                    <span class="w-1 h-1 rounded-full bg-slate-700"></span>
                                    <span class="text-slate-400 font-medium"
                                        >🕐 {formatTotalDuration(totalDurationSeconds)}</span
                                    >
                                {/if}
                            </p>
                        </div>
                    </div>

                    <div
                        class="bg-[#121212]/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm"
                    >
                        <table class="w-full text-left border-collapse">
                            <thead
                                class="bg-white/[0.02] text-[11px] uppercase text-slate-500 font-bold tracking-wider border-b border-white/5"
                            >
                                <tr>
                                    <th class="px-6 py-4 w-16 text-center">#</th>
                                    <th class="px-6 py-4">Título</th>
                                    <th class="px-6 py-4 hidden md:table-cell">Álbum</th>
                                    <th class="px-6 py-4 text-right w-32">Duración</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                {#each showAllTracks ? flatTracks : flatTracks.slice(0, 5) as track, i}
                                    <tr
                                        class="group hover:bg-white/[0.04] transition-colors cursor-pointer"
                                        on:click={() => handlePlayTrack(i)}
                                    >
                                        <td
                                            class="px-6 py-4 text-sm text-slate-500 font-mono w-16 text-center group-hover:text-primary-400"
                                        >
                                            <span class="group-hover:hidden">{i + 1}</span>
                                            <span class="hidden group-hover:block text-orange-500"
                                                >▶</span
                                            >
                                        </td>
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-5">
                                                <img
                                                    src={track.cover || '/logo-mobile.png'}
                                                    alt=""
                                                    class="w-12 h-12 rounded-lg object-cover shadow-lg group-hover:shadow-orange-500/20 transition-all"
                                                    on:error={handleImageError}
                                                />
                                                <div class="min-w-0">
                                                    <div
                                                        class="font-bold text-white text-base truncate group-hover:text-orange-400 transition-colors mb-1"
                                                    >
                                                        {track.title}
                                                    </div>
                                                    <div
                                                        class="text-xs text-slate-500 md:hidden flex items-center gap-2"
                                                    >
                                                        <span>{track.artist}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td
                                            class="px-6 py-4 text-sm text-slate-400 hidden md:table-cell truncate max-w-[200px]"
                                        >
                                            {track.albumTitle}
                                        </td>
                                        <td
                                            class="px-6 py-4 text-sm text-slate-500 text-right font-mono"
                                        >
                                            {formatTrackDuration(track.duration || 0)}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>

                        {#if flatTracks.length > 5}
                            <div class="px-6 py-4 border-t border-white/5 text-center">
                                <button
                                    on:click={() => (showAllTracks = !showAllTracks)}
                                    class="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors py-2 flex items-center justify-center gap-2 w-full"
                                >
                                    {#if showAllTracks}
                                        <span>Ver menos</span>
                                        <svg
                                            class="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            ><path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M5 15l7-7 7 7"
                                            /></svg
                                        >
                                    {:else}
                                        <span>Ver todas las canciones ({flatTracks.length})</span>
                                        <svg
                                            class="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            ><path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M19 9l-7 7-7-7"
                                            /></svg
                                        >
                                    {/if}
                                </button>
                            </div>
                        {/if}
                    </div>
                </section>
            {/if}

            <!-- Discography Sections -->
            {#if artistAlbums.length > 0}
                {@const albumsList = artistAlbums.filter((a) => (a.tracks?.length || 0) > 1)}
                {@const singlesList = artistAlbums.filter((a) => (a.tracks?.length || 0) <= 1)}

                <!-- ALBUMS SECTION -->
                {#if albumsList.length > 0}
                    <section class="mb-12">
                        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                            <svg
                                class="w-6 h-6 text-indigo-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                            </svg>
                            Álbumes y EPs
                        </h2>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {#each albumsList as album}
                                <button
                                    class="group cursor-pointer bg-neutral-900/40 p-4 rounded-3xl border border-white/5 hover:bg-neutral-800/60 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 text-left w-full focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    on:click={() => goto(`/album/${album.id}`)}
                                >
                                    <div
                                        class="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg bg-neutral-800"
                                    >
                                        <img
                                            src={getCoverUrl(album) || '/logo-mobile.png'}
                                            alt={album.title}
                                            loading="lazy"
                                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            on:error={handleImageError}
                                        />
                                        <!-- Play Button Overlay -->
                                        <div
                                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]"
                                        >
                                            <button
                                                class="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300 hover:scale-110 hover:bg-primary-400"
                                                on:click|stopPropagation={() =>
                                                    handlePlayAlbum(album.id)}
                                            >
                                                <svg
                                                    class="w-6 h-6 ml-1 fill-current"
                                                    viewBox="0 0 24 24"
                                                    ><path d="M8 5v14l11-7z" /></svg
                                                >
                                            </button>
                                        </div>
                                        <div
                                            class="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] uppercase font-bold text-white border border-white/10"
                                        >
                                            {album.tracks?.length || 0} Tracks
                                        </div>
                                    </div>
                                    <div>
                                        <h3
                                            class="font-bold text-white text-base truncate pr-2 group-hover:text-primary-400 transition-colors"
                                        >
                                            {album.title}
                                        </h3>
                                        <p class="text-sm text-slate-400 mb-1 truncate">
                                            {new Date(
                                                album.createdAt?.seconds * 1000
                                            ).getFullYear() || 'EP'} • Álbum
                                        </p>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </section>
                {/if}

                <!-- SINGLES SECTION -->
                {#if singlesList.length > 0}
                    <section>
                        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                            <svg
                                class="w-6 h-6 text-pink-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                />
                            </svg>
                            Sencillos
                        </h2>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {#each singlesList as album}
                                <button
                                    class="group cursor-pointer bg-neutral-900/40 p-4 rounded-3xl border border-white/5 hover:bg-neutral-800/60 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 text-left w-full focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                    on:click={() => goto(`/album/${album.id}`)}
                                >
                                    <div
                                        class="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg bg-neutral-800"
                                    >
                                        <img
                                            src={getCoverUrl(album) || '/logo-mobile.png'}
                                            alt={album.title}
                                            loading="lazy"
                                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            on:error={handleImageError}
                                        />
                                        <div
                                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]"
                                        >
                                            <button
                                                class="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300 hover:scale-110 hover:bg-primary-400"
                                                on:click|stopPropagation={() =>
                                                    handlePlayAlbum(album.id)}
                                            >
                                                <svg
                                                    class="w-6 h-6 ml-1 fill-current"
                                                    viewBox="0 0 24 24"
                                                    ><path d="M8 5v14l11-7z" /></svg
                                                >
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3
                                            class="font-bold text-white text-base truncate pr-2 group-hover:text-primary-400 transition-colors"
                                        >
                                            {album.title}
                                        </h3>
                                        <p class="text-sm text-slate-400 mb-1 truncate">
                                            {new Date(
                                                album.createdAt?.seconds * 1000
                                            ).getFullYear() || 'Single'} • Sencillo
                                        </p>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </section>
                {/if}
            {/if}
        </div>

        <!-- Right Column: Stats & Sidebar (4 cols) -->
        <div class="lg:col-span-4 space-y-8">
            <!-- Activity Widget -->
            <div
                class="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
            >
                <div
                    class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"
                >
                    <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"
                        ><path
                            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"
                        /></svg
                    >
                </div>

                <h3 class="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Actividad Reciente
                </h3>
                <p
                    class="text-xs text-slate-400 mb-6 uppercase tracking-widest font-semibold flex items-center gap-1"
                >
                    ChillChess Tracker <span class="text-primary-500">PRO</span>
                </p>

                <!-- Heatmap Grid -->
                <div class="flex justify-center mb-4">
                    <div
                        class="inline-grid grid-rows-7 grid-flow-col gap-1.5 transform scale-110 origin-center"
                    >
                        {#each calendar.slice(-90) as day}
                            <!-- Show last 3 months aprox -->
                            {@const count = day.count}
                            <div
                                class="w-2.5 h-2.5 rounded-sm transition-all"
                                style="background-color: {count === 0
                                    ? '#262626'
                                    : count > 3
                                      ? '#ec4899'
                                      : count > 0
                                        ? '#9d174d'
                                        : '#262626'}; "
                                title="{day.date}: {day.count} streams"
                            ></div>
                        {/each}
                    </div>
                </div>

                <!-- Stats Badges -->
                <div class="grid grid-cols-2 gap-3 mt-6">
                    <div class="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                        <div class="text-2xl font-bold text-white">
                            {calendar.filter((d) => d.count > 0).length}
                        </div>
                        <div class="text-[10px] uppercase text-slate-500 font-bold">
                            Días Activos
                        </div>
                    </div>
                    <div class="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                        <div class="text-2xl font-bold text-white">{artistAlbums.length}</div>
                        <div class="text-[10px] uppercase text-slate-500 font-bold">
                            Lanzamientos
                        </div>
                    </div>
                </div>
            </div>

            <!-- About / Sidebar -->
            <div class="p-6">
                <h3 class="text-lg font-bold text-white mb-4">Sobre el Artista</h3>
                <p class="text-sm text-slate-400 leading-relaxed mb-6">
                    {artist.bio ||
                        `Descubre el universo sonoro de ${artist.artistName}. Una colección curada de beats lo-fi, ambient y chillhop pensada para la concentración y el relax.`}
                </p>

                <div class="space-y-3">
                    <button
                        class="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors text-slate-300 hover:text-white flex items-center justify-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            /></svg
                        >
                        Compartir Perfil
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* Custom scrollbar for table if needed */
    :global(.custom-scrollbar::-webkit-scrollbar) {
        width: 6px;
    }
    :global(.custom-scrollbar::-webkit-scrollbar-track) {
        background: transparent;
    }
    :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
    :global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
        background: rgba(255, 255, 255, 0.2);
    }

    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-in {
        animation: fade-in 0.6s ease-out forwards;
    }
</style>
