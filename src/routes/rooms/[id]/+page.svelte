<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
    import { userStore } from '$lib/auth/userStore';
    import { audioStore, playAlbum } from '$lib/audio/store';
    import ChillBackground from '$lib/components/ChillBackground.svelte';
    import { toast } from '$lib/stores/notificationStore';

    const roomId = $page.params.id;

    interface RoomData {
        name: string;
        hostId: string;
        hostName: string;
        isPublic: boolean;
        participants: Record<string, { displayName: string }>;
        currentTrack: {
            albumId: string;
            trackIndex: number;
            isPlaying: boolean;
            timestamp: any;
        } | null;
    }

    let room: RoomData | null = null;
    let loading = true;
    let isHost = false;
    let unsubscribe: (() => void) | null = null;
    let participantsList: { uid: string; name: string }[] = [];
    let showMusicSelector = false; // NEW

    function selectAlbum(albumId: string) {
        playAlbum(albumId);
        showMusicSelector = false;
    }

    // Reactive Sync Logic (Robust for guests)
    $: if (room && !isHost && room.currentTrack && $audioStore.availableAlbums.length > 0) {
        const remote = room.currentTrack;
        const local = $audioStore;

        // 1. Sync Album/Track
        if (remote.albumId !== local.currentAlbumId) {
            playAlbum(remote.albumId);
            // Force track index immediately
            audioStore.update((s) => ({
                ...s,
                currentTrackIndex: remote.trackIndex,
            }));
        } else if (remote.trackIndex !== local.currentTrackIndex) {
            audioStore.update((s) => ({
                ...s,
                currentTrackIndex: remote.trackIndex,
            }));
        }

        // 2. Sync Playback State
        if (remote.isPlaying !== local.isPlaying) {
            audioStore.update((s) => ({ ...s, isPlaying: remote.isPlaying }));
        }
    }

    onMount(async () => {
        if (!$userStore.isLoggedIn) {
            goto('/');
            return;
        }

        const { doc, onSnapshot, updateDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('$lib/firebase');

        const roomRef = doc(db, 'listeningRooms', roomId);

        // Listen to room changes
        unsubscribe = onSnapshot(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                toast.error('Esta sala no existe.');
                goto('/rooms');
                return;
            }

            const data = snapshot.data() as RoomData;
            room = data;
            isHost = data.hostId === $userStore.user?.uid;

            // Update participants list
            participantsList = Object.entries(data.participants).map(([uid, info]) => ({
                uid,
                name: info.displayName,
            }));

            loading = false;
        });

        // Add self to participants if not already
        if ($userStore.user) {
            try {
                await updateDoc(roomRef, {
                    [`participants.${$userStore.user.uid}`]: {
                        displayName: $userStore.user.displayName || 'Usuario',
                        joinedAt: serverTimestamp(),
                    },
                });
            } catch (err) {
                console.error('Error joining room:', err);
            }
        }

        // If host, sync local state to Firestore
        if (isHost) {
            resetInactivityTimer(); // Start timer

            const unsubscribeStore = audioStore.subscribe(async (state) => {
                resetInactivityTimer(); // Reset on activity

                if (!state.currentAlbumId) return;

                const currentTrack = state.playlist[state.currentTrackIndex];

                try {
                    await updateDoc(roomRef, {
                        currentTrack: {
                            albumId: state.currentAlbumId,
                            trackIndex: state.currentTrackIndex,
                            isPlaying: state.isPlaying,
                            title: currentTrack?.title || 'Unknown',
                            timestamp: serverTimestamp(),
                        },
                    });
                } catch (err) {
                    console.error('Error syncing:', err);
                }
            });

            // Clean up store subscription on unmount
            onDestroy(() => {
                unsubscribeStore();
                if (inactivityTimer) clearTimeout(inactivityTimer);
            });
        }
    });

    onDestroy(async () => {
        if (unsubscribe) unsubscribe();

        // Remove self from participants
        if ($userStore.isLoggedIn && $userStore.user) {
            try {
                const { doc, updateDoc, deleteField } = await import('firebase/firestore');
                const { db } = await import('$lib/firebase');
                const roomRef = doc(db, 'listeningRooms', roomId);

                await updateDoc(roomRef, {
                    [`participants.${$userStore.user.uid}`]: deleteField(),
                });
            } catch (err) {
                console.error('Error leaving room:', err);
            }
        }
    });

    function copyRoomLink() {
        const link = `${window.location.origin}/rooms/${roomId}`;
        navigator.clipboard.writeText(link);
        toast.success('Enlace copiado al portapapeles');
    }

    async function closeRoom(isAuto = false) {
        if (
            !isAuto &&
            !confirm(
                '¿Estás seguro de que quieres cerrar esta sala permanentemente? Todos los participantes serán desconectados.'
            )
        )
            return;

        try {
            const { doc, deleteDoc } = await import('firebase/firestore');
            const { db } = await import('$lib/firebase');
            await deleteDoc(doc(db, 'listeningRooms', roomId));
            toast.success(
                isAuto ? 'Sala cerrada por inactividad (15 min)' : 'Sala cerrada exitosamente'
            );
            goto('/rooms');
        } catch (err) {
            console.error('Error closing room:', err);
            toast.error('Error al cerrar la sala');
        }
    }

    let inactivityTimer: any;
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 min

    function resetInactivityTimer() {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            // Check if music is playing. If so, don't close.
            if ($audioStore.isPlaying) {
                resetInactivityTimer();
                return;
            }
            closeRoom(true);
        }, INACTIVITY_LIMIT);
    }
</script>

<svelte:head>
    <title>{room?.name || 'Sala'} | ChillChess</title>
</svelte:head>

{#if loading}
    <div class="min-h-screen bg-[#0B1120] text-white font-poppins flex items-center justify-center">
        <div class="text-center relative">
            <div
                class="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse"
            ></div>
            <div
                class="relative z-10 w-20 h-20 border-4 border-white/20 border-t-primary-500 rounded-full animate-spin mb-6 mx-auto"
            ></div>
            <p class="text-slate-300 text-lg font-medium tracking-wide animate-pulse">
                Sintonizando frecuencia...
            </p>
        </div>
    </div>
{:else if room}
    <div class="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] font-poppins">
        <!-- Static Background (ChillChess Standard) -->
        <div class="absolute inset-0 z-0 opacity-40">
            <ChillBackground />
        </div>

        <!-- Content Container -->
        <div class="relative z-10 flex flex-col min-h-screen p-6 md:p-12">
            <!-- Header -->
            <header class="flex justify-between items-center mb-12">
                <div class="flex items-center gap-4">
                    <button
                        on:click={() => goto('/rooms')}
                        class="px-4 py-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-sm font-bold text-white/90 hover:text-white transition-all border border-white/10 flex items-center gap-2 group"
                    >
                        <span class="group-hover:-translate-x-1 transition-transform">←</span>
                        Salir
                    </button>
                    <div
                        class="px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/5"
                    >
                        <span class="text-white/60 text-xs uppercase tracking-wider font-bold mr-2"
                            >Sala</span
                        >
                        <span class="font-bold text-white">{room.name}</span>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    {#if isHost}
                        <button
                            on:click={() => (showMusicSelector = true)}
                            class="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20 rounded-full text-white font-bold text-sm transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <svg
                                class="w-4 h-4"
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
                            <span class="hidden md:inline">Cambiar Música</span>
                        </button>
                    {/if}
                    <button
                        on:click={copyRoomLink}
                        class="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:scale-105 backdrop-blur-md"
                        title="Copiar Enlace"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            /></svg
                        >
                    </button>
                    {#if isHost}
                        <button
                            on:click={() => closeRoom(false)}
                            class="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full transition-all hover:scale-105 backdrop-blur-md border border-red-500/20"
                            title="Cerrar Sala"
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
                                    d="M6 18L18 6M6 6l12 12"
                                /></svg
                            >
                        </button>
                    {/if}
                </div>
            </header>

            <!-- Main Stage -->
            <main class="flex-1 flex flex-col items-center justify-center relative">
                {#if room.currentTrack}
                    {@const currentAlbum = $audioStore.availableAlbums.find(
                        (a) => a.id === room?.currentTrack?.albumId
                    )}
                    {@const currentTrack =
                        currentAlbum?.tracks?.[room?.currentTrack?.trackIndex ?? 0]}

                    {#if currentAlbum && currentTrack}
                        <!-- Large Album Art with Glow -->
                        <div class="relative group cursor-default mb-10">
                            <!-- Glow Effect -->
                            <div
                                class="absolute inset-0 bg-primary-500/20 blur-[60px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-1000"
                            ></div>

                            <!-- Image -->
                            <img
                                src={currentAlbum.cover}
                                alt={currentAlbum.title}
                                class="relative z-10 w-[280px] h-[280px] md:w-[450px] md:h-[450px] object-cover rounded-[32px] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.6)] border border-white/10 animate-float-slow"
                            />

                            <!-- Playing Status Badge -->
                            <div
                                class="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 shadow-xl"
                            >
                                {#if room.currentTrack.isPlaying}
                                    <span class="relative flex h-3 w-3">
                                        <span
                                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                                        ></span>
                                        <span
                                            class="relative inline-flex rounded-full h-3 w-3 bg-green-500"
                                        ></span>
                                    </span>
                                    <span
                                        class="text-xs font-bold text-white uppercase tracking-wider"
                                        >En directo</span
                                    >
                                {:else}
                                    <span class="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                    <span
                                        class="text-xs font-bold text-white uppercase tracking-wider"
                                        >Pausado</span
                                    >
                                {/if}
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="text-center max-w-2xl px-4">
                            <h2
                                class="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight drop-shadow-xl"
                            >
                                {currentTrack.title}
                            </h2>
                            <p class="text-xl md:text-2xl text-white/70 font-medium">
                                {currentTrack.artist || currentAlbum.artist}
                            </p>
                        </div>
                    {/if}
                {:else}
                    <!-- Empty State -->
                    <div class="text-center">
                        <div
                            class="w-32 h-32 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse"
                        >
                            <span class="text-4xl">🎵</span>
                        </div>
                        <h2 class="text-2xl font-bold text-white mb-2">Sala en silencio</h2>
                        <p class="text-slate-400 max-w-md mx-auto">
                            {#if isHost}
                                Selecciona música para comenzar la sesión.
                                <br />
                                <button
                                    on:click={() => (showMusicSelector = true)}
                                    class="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold transition-all"
                                >
                                    Elegir Música
                                </button>
                            {:else}
                                Esperando al anfitrión...
                            {/if}
                        </p>
                    </div>
                {/if}
            </main>

            <!-- Footer: Participants -->
            <footer class="mt-12">
                <div class="flex justify-center flex-wrap gap-2 md:gap-4">
                    {#each participantsList as participant (participant.uid)}
                        <div
                            class="group relative pl-1 pr-4 py-1 bg-black/40 hover:bg-surface-800/80 backdrop-blur-xl border border-white/5 rounded-full flex items-center gap-3 transition-all cursor-default"
                        >
                            <div
                                class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg"
                            >
                                {participant.name[0]?.toUpperCase()}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-white leading-tight"
                                    >{participant.name}</span
                                >
                                <span
                                    class="text-[10px] text-primary-400 font-medium leading-tight"
                                >
                                    {participant.uid === room.hostId ? 'Host Sync' : 'Oyente'}
                                </span>
                            </div>

                            {#if participant.uid === $userStore.user?.uid}
                                <div
                                    class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0B1120] rounded-full"
                                ></div>
                            {/if}
                        </div>
                    {/each}
                </div>
                <p class="text-center text-white/20 text-xs mt-6 uppercase tracking-widest">
                    ChillChess Listening Room • Live Sync
                </p>
            </footer>
        </div>

        <!-- Music Selector Modal (For Host) -->
        {#if showMusicSelector}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
                on:click={() => (showMusicSelector = false)}
            >
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="bg-[#1e293b] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
                    on:click|stopPropagation
                >
                    <div
                        class="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a]"
                    >
                        <h3 class="text-xl font-bold flex items-center gap-2">
                            <span>📀</span> Elegir Álbum
                        </h3>
                        <button
                            on:click={() => (showMusicSelector = false)}
                            class="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <svg
                                class="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
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

                    <div class="flex-1 overflow-y-auto p-6 bg-[#0B1120]">
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {#each $audioStore.availableAlbums as album}
                                <button
                                    on:click={() => selectAlbum(album.id)}
                                    class="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-white/5"
                                >
                                    <img
                                        src={album.cover}
                                        alt={album.title}
                                        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div
                                        class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <p
                                            class="font-bold text-white text-sm md:text-base truncate"
                                        >
                                            {album.title}
                                        </p>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>
{/if}
