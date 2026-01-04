<script lang="ts">
    import { page } from '$app/stores';
    import { onMount, onDestroy } from 'svelte';
    import { db } from '$lib/firebase';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { fade } from 'svelte/transition';

    // Parameters
    $: roomId = $page.url.searchParams.get('id');
    $: theme = $page.url.searchParams.get('theme') || 'dark'; // dark, light, transparent
    $: showCode = $page.url.searchParams.get('code') !== 'false';
    $: scale = Number($page.url.searchParams.get('scale') || 1);

    interface RoomData {
        name: string;
        participants: Record<string, any>;
        currentTrack: {
            title: string;
            artist?: string; // Sometimes tied to album
            cover?: string; // Might need to resolve if not stored directly
            isPlaying: boolean;
            albumId: string;
            trackIndex: number;
        } | null;
    }

    let room: RoomData | null = null;
    let loading = true;
    let error = '';

    // We need to fetch album details if cover isn't in room data
    // Usually room.currentTrack has limited info. We might need to listen to audioStore or fetch album.
    // For simplicity/performance in a widget, we'll try to sync robustly.
    // Actually, looking at `src/routes/rooms/[id]/+page.svelte`, the room doc stores:
    // currentTrack: { albumId, trackIndex, title, isPlaying... }
    // It DOES NOT store cover url or artist name usually. We need to fetch that or have a cache.
    // To avoid complex Auth/Store logic in a lightweight widget, we might just rely on checking a minimal 'albums' collection or similar?
    // OR just fetch the album doc if we have it?
    // Wait, `audioStore` loads `availableAlbums` from `src/lib/data/albums.ts` (static) usually?
    // Yes, for now albums are static in `src/lib/data/albums.ts`. We can import that!

    import { ALBUMS as albums } from '$lib/data/albums';

    let unsubscribe: (() => void) | null = null;

    onMount(() => {
        if (!roomId) {
            error = 'No Room ID provided';
            loading = false;
            return;
        }

        const roomRef = doc(db, 'listeningRooms', roomId);
        unsubscribe = onSnapshot(
            roomRef,
            (snap) => {
                if (!snap.exists()) {
                    error = 'Sala no encontrada';
                    loading = false;
                    return;
                }
                room = snap.data() as RoomData;
                loading = false;
            },
            (err) => {
                console.error(err);
                error = 'Error de conexión';
            }
        );
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    // Computed
    $: participantsCount = room ? Object.keys(room.participants || {}).length : 0;

    $: currentTrackInfo = (() => {
        if (!room?.currentTrack) return null;
        const album = albums.find((a) => a.id === room?.currentTrack?.albumId);
        const track = album?.tracks?.[room.currentTrack.trackIndex];
        return {
            title: track?.title || room.currentTrack.title || 'Desconocido',
            artist: track?.artist || album?.artist || 'ChillChess',
            cover: album?.cover || '/images/cover-placeholder.jpg',
            isPlaying: room.currentTrack.isPlaying,
        };
    })();
</script>

<div
    class="min-h-screen p-4 flex items-center justify-center font-poppins overflow-hidden"
    style="transform: scale({scale}); transform-origin: top left;"
    class:bg-transparent={theme === 'transparent'}
    class:bg-[#0B1120]={theme === 'dark'}
    class:bg-white={theme === 'light'}
>
    {#if error}
        <div
            class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg font-bold"
        >
            {error}
        </div>
    {:else if loading}
        <div class="animate-pulse flex gap-4 items-center">
            <div class="w-16 h-16 bg-white/10 rounded-xl"></div>
            <div class="space-y-2">
                <div class="w-32 h-4 bg-white/10 rounded"></div>
                <div class="w-24 h-3 bg-white/10 rounded"></div>
            </div>
        </div>
    {:else if room}
        <div class="relative w-full max-w-sm">
            <!-- Glass Card -->
            <div
                class="
                relative overflow-hidden rounded-2xl border border-white/10
                {theme === 'light'
                    ? 'bg-white/80 text-slate-900 border-slate-200'
                    : 'bg-black/60 text-white shadow-2xl'}
                backdrop-blur-xl p-4 flex items-center gap-4
            "
            >
                <!-- Cover Art -->
                <div class="relative shrink-0">
                    {#if currentTrackInfo}
                        <img
                            src={currentTrackInfo.cover}
                            alt="Cover"
                            class="w-20 h-20 rounded-xl object-cover shadow-lg border border-white/5"
                            class:grayscale={!currentTrackInfo.isPlaying}
                        />
                        {#if currentTrackInfo.isPlaying}
                            <div
                                class="absolute -bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-[#1e293b] animate-bounce"
                            ></div>
                        {/if}
                    {:else}
                        <div
                            class="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center"
                        >
                            <span class="text-2xl">🎵</span>
                        </div>
                    {/if}
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                    {#if currentTrackInfo}
                        <h3 class="font-bold text-lg leading-tight truncate">
                            {currentTrackInfo.title}
                        </h3>
                        <p class="text-sm opacity-70 truncate mb-1">{currentTrackInfo.artist}</p>
                    {:else}
                        <h3 class="font-bold text-lg opacity-50">Esperando música...</h3>
                    {/if}

                    <!-- Stats Row -->
                    <div class="flex items-center gap-3 mt-2 text-xs font-bold opacity-80">
                        <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10">
                            <span class="text-green-400">●</span>
                            <span>{participantsCount} oyentes</span>
                        </div>
                        {#if showCode}
                            <div class="uppercase tracking-wider opacity-60">
                                Sala: {room.name}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        background: transparent !important;
        margin: 0;
        overflow: hidden;
    }
</style>
