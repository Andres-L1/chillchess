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
        <div class="text-center">
            <div
                class="inline-block w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"
            ></div>
            <p class="text-slate-400">Conectando...</p>
        </div>
    </div>
{:else if room}
    <div class="relative min-h-screen overflow-hidden">
        <!-- Background -->
        <div class="absolute inset-0">
            <ChillBackground />
        </div>

        <!-- Content -->
        <div class="relative z-10 min-h-screen text-white font-poppins px-4 py-8 md:p-8">
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div
                    class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
                >
                    <div>
                        <button
                            on:click={() => goto('/rooms')}
                            class="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
                        >
                            ← Salir de la Sala
                        </button>
                        <h1 class="text-3xl font-bold">{room.name}</h1>
                        <p class="text-slate-400 text-sm">
                            Host: {room.hostName}
                            {#if isHost}
                                <span class="text-primary-400 font-bold ml-2">(Tú)</span>
                            {/if}
                        </p>
                    </div>
                    <div class="flex items-center gap-3 w-full md:w-auto">
                        {#if isHost}
                            <button
                                on:click={() => closeRoom(false)}
                                class="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all text-sm font-medium border border-red-500/20 whitespace-nowrap"
                            >
                                Cerrar Sala
                            </button>
                        {/if}
                        <button
                            on:click={copyRoomLink}
                            class="flex-1 md:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium whitespace-nowrap"
                        >
                            📋 Copiar Enlace
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Main Player Area -->
                    <div class="lg:col-span-2">
                        <div
                            class="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
                        >
                            <h2 class="text-xl font-bold mb-4">
                                {#if room.currentTrack}
                                    🎵 Reproduciendo
                                {:else}
                                    🎵 Esperando música...
                                {/if}
                            </h2>

                            {#if room.currentTrack}
                                {#if room.currentTrack}
                                    {@const currentAlbum = $audioStore.availableAlbums.find(
                                        (a) => a.id === room?.currentTrack?.albumId
                                    )}
                                    {@const currentTrack =
                                        currentAlbum?.tracks?.[room?.currentTrack?.trackIndex ?? 0]}

                                    <div class="text-center">
                                        {#if currentAlbum && currentTrack}
                                            <img
                                                src={currentAlbum.cover}
                                                alt={currentAlbum.title}
                                                class="w-64 h-64 mx-auto rounded-2xl shadow-2xl mb-6"
                                            />
                                            <h3 class="text-2xl font-bold mb-2">
                                                {currentTrack.title}
                                            </h3>
                                            <p class="text-slate-400 mb-4">
                                                {currentTrack.artist || currentAlbum.artist}
                                            </p>
                                            <div class="flex items-center justify-center gap-2">
                                                {#if room.currentTrack.isPlaying}
                                                    <div
                                                        class="w-3 h-3 bg-green-400 rounded-full animate-pulse"
                                                    ></div>
                                                    <span class="text-green-400 text-sm font-bold"
                                                        >Reproduciendo</span
                                                    >
                                                {:else}
                                                    <div
                                                        class="w-3 h-3 bg-slate-500 rounded-full"
                                                    ></div>
                                                    <span class="text-slate-500 text-sm font-bold"
                                                        >Pausado</span
                                                    >
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            {:else if isHost}
                                <div class="text-center py-8">
                                    <p class="text-slate-400 mb-6">
                                        Selecciona un álbum para empezar a escuchar juntos
                                    </p>

                                    <!-- Albums Grid -->
                                    <div
                                        class="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto px-4"
                                    >
                                        {#each $audioStore.availableAlbums as album}
                                            <button
                                                on:click={() => selectAlbum(album.id)}
                                                class="group relative rounded-xl overflow-hidden hover:scale-105 transition-transform"
                                            >
                                                <img
                                                    src={album.cover}
                                                    alt={album.title}
                                                    class="w-full aspect-square object-cover"
                                                />
                                                <div
                                                    class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <div class="text-center p-2">
                                                        <p class="text-sm font-bold text-white">
                                                            {album.title}
                                                        </p>
                                                        <p class="text-xs text-slate-300">
                                                            {album.artist}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        {/each}
                                    </div>
                                </div>
                            {:else}
                                <div class="text-center py-12 text-slate-500">
                                    <p>El host aún no ha reproducido nada.</p>
                                </div>
                            {/if}

                            {#if isHost}
                                <div
                                    class="mt-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl"
                                >
                                    <p class="text-sm text-primary-300">
                                        💡 Como host, los controles en /app se sincronizarán
                                        automáticamente aquí.
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Participants Sidebar -->
                    <div>
                        <div
                            class="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-8"
                        >
                            <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                                <span>👥</span>
                                <span>Participantes ({participantsList.length})</span>
                            </h3>

                            <div class="space-y-3">
                                {#each participantsList as participant (participant.uid)}
                                    <div class="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                        <div
                                            class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center text-sm font-bold"
                                        >
                                            {participant.name[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-medium">
                                                {participant.name}
                                            </p>
                                            {#if participant.uid === room.hostId}
                                                <p class="text-xs text-primary-400">Host</p>
                                            {/if}
                                        </div>
                                        {#if participant.uid === $userStore.user?.uid}
                                            <span class="text-xs text-slate-500">(Tú)</span>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
