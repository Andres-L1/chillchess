<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    import { userStore } from '$lib/auth/userStore';
    import { audioStore, playAlbum } from '$lib/audio/store';
    import ChillBackground from '$lib/components/ChillBackground.svelte';
    import { toast } from '$lib/stores/notificationStore';
    import { db } from '$lib/firebase';
    import {
        doc,
        onSnapshot,
        updateDoc,
        serverTimestamp,
        collection,
        addDoc,
        query,
        orderBy,
        limit,
        deleteField,
        deleteDoc,
    } from 'firebase/firestore';
    import { fly, fade } from 'svelte/transition';

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
            title?: string;
        } | null;
    }

    let room: RoomData | null = null;
    let loading = true;
    let isHost = false;
    let unsubscribe: (() => void) | null = null;
    let participantsList: { uid: string; name: string }[] = [];

    // UI States
    let showMusicSelector = false;
    let selectedAlbumForBrowsing: any | null = null;
    let showChat = false;

    // Chat
    let messages: any[] = [];
    let newMessage = '';
    let chatUnsubscribe: (() => void) | null = null;
    let chatContainer: HTMLElement;

    // Host Logic
    let unsubscribeStore: (() => void) | null = null;
    let inactivityTimer: any;
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 min

    function resetInactivityTimer() {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if ($audioStore.isPlaying) {
                resetInactivityTimer();
                return;
            }
            closeRoom(true);
        }, INACTIVITY_LIMIT);
    }

    function copyRoomLink() {
        const link = `${window.location.origin}/rooms/${roomId}`;
        navigator.clipboard.writeText(link);
        toast.success('Enlace copiado al portapapeles');
    }

    async function closeRoom(isAuto = false) {
        if (!isHost) return;
        if (!isAuto && !confirm('¿Cerrar sala y desconectar a todos?')) return;

        try {
            await deleteDoc(doc(db, 'listeningRooms', roomId));
            toast.success(isAuto ? 'Sala cerrada por inactividad' : 'Sala cerrada');
            goto('/rooms');
        } catch (e) {
            console.error(e);
        }
    }

    // Music Selector
    function browseAlbum(album: any) {
        selectedAlbumForBrowsing = album;
    }

    function selectTrack(albumId: string, trackIndex: number) {
        playAlbum(albumId);
        // Force track index update slightly delayed to ensure playlist loaded
        setTimeout(() => {
            audioStore.update((s) => ({ ...s, currentTrackIndex: trackIndex, isPlaying: true }));
        }, 150);
        showMusicSelector = false;
        selectedAlbumForBrowsing = null;
    }

    function selectAlbum(albumId: string) {
        selectTrack(albumId, 0);
    }

    // Chat Logic
    function toggleChat() {
        showChat = !showChat;
        if (showChat && !chatUnsubscribe) {
            const msgsRef = collection(db, 'listeningRooms', roomId, 'messages');
            const q = query(msgsRef, orderBy('timestamp', 'asc'), limit(50));
            chatUnsubscribe = onSnapshot(q, (snap) => {
                messages = snap.docs.map((d) => d.data());
            });
        }
    }

    async function sendMessage() {
        if (!newMessage.trim()) return;
        const text = newMessage.trim();
        newMessage = '';
        try {
            await addDoc(collection(db, 'listeningRooms', roomId, 'messages'), {
                text,
                senderId: $userStore.user?.uid || 'anon',
                senderName: $userStore.user?.displayName || 'Usuario',
                timestamp: serverTimestamp(),
            });
        } catch (e) {
            console.error(e);
            toast.error('Error enviando mensaje');
        }
    }

    $: if (messages && chatContainer) {
        setTimeout(() => (chatContainer.scrollTop = chatContainer.scrollHeight), 50);
    }

    // Sync Logic
    $: if (room && !isHost && room.currentTrack && $audioStore.availableAlbums.length > 0) {
        const remote = room.currentTrack;
        const local = $audioStore;
        if (remote.albumId !== local.currentAlbumId) {
            playAlbum(remote.albumId);
            audioStore.update((s) => ({ ...s, currentTrackIndex: remote.trackIndex }));
        } else if (remote.trackIndex !== local.currentTrackIndex) {
            audioStore.update((s) => ({ ...s, currentTrackIndex: remote.trackIndex }));
        }
        if (remote.isPlaying !== local.isPlaying) {
            audioStore.update((s) => ({ ...s, isPlaying: remote.isPlaying }));
        }
    }

    onMount(async () => {
        if (!$userStore.isLoggedIn) {
            goto('/');
            return;
        }

        const roomRef = doc(db, 'listeningRooms', roomId);

        unsubscribe = onSnapshot(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                toast.error('Esta sala no existe.');
                goto('/rooms');
                return;
            }
            const data = snapshot.data() as RoomData;
            room = data;
            isHost = data.hostId === $userStore.user?.uid;
            participantsList = Object.entries(data.participants || {}).map(([uid, info]) => ({
                uid,
                name: info.displayName,
            }));
            loading = false;
        });

        if ($userStore.user) {
            try {
                await updateDoc(roomRef, {
                    [`participants.${$userStore.user.uid}`]: {
                        displayName: $userStore.user.displayName || 'Usuario',
                        joinedAt: serverTimestamp(),
                    },
                });
            } catch (err) {
                console.error(err);
            }
        }
    });

    $: if (isHost && !unsubscribeStore && room) {
        resetInactivityTimer();
        const roomRef = doc(db, 'listeningRooms', roomId);
        unsubscribeStore = audioStore.subscribe(async (state) => {
            resetInactivityTimer();
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
            } catch (e) {
                console.error(e);
            }
        });
    }

    onDestroy(async () => {
        if (unsubscribe) unsubscribe();
        if (chatUnsubscribe) chatUnsubscribe();
        if (unsubscribeStore) unsubscribeStore();
        if (inactivityTimer) clearTimeout(inactivityTimer);

        if ($userStore.user && room) {
            const roomRef = doc(db, 'listeningRooms', roomId);
            const pKeys = Object.keys(room.participants || {});
            const amILast = pKeys.length <= 1 && pKeys.includes($userStore.user.uid);

            try {
                if (amILast) {
                    await deleteDoc(roomRef);
                    // Messages left orphaned
                } else {
                    await updateDoc(roomRef, {
                        [`participants.${$userStore.user.uid}`]: deleteField(),
                    });
                }
            } catch (e) {
                console.error(e);
            }
        }
    });
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
    <!-- Main Room Interface -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a] font-poppins transition-all duration-300"
        class:mr-80={showChat}
    >
        <!-- Static Background (ChillChess Standard) -->
        <div class="absolute inset-0 z-0 opacity-40">
            <ChillBackground />
        </div>

        <!-- Content -->
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
                            <span>🎵</span>
                            <span class="hidden md:inline">Música</span>
                        </button>
                    {/if}
                    <button
                        on:click={toggleChat}
                        class="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold text-sm transition-colors border border-white/10 flex items-center gap-2 {showChat
                            ? 'bg-white/20'
                            : ''}"
                    >
                        <span>💬</span>
                        <span class="hidden md:inline">Chat</span>
                    </button>
                    <button
                        on:click={copyRoomLink}
                        class="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors border border-white/5"
                        title="Copiar enlace"
                    >
                        📋
                    </button>
                    {#if isHost}
                        <button
                            on:click={() => closeRoom()}
                            class="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-full text-red-500 hover:text-red-400 transition-colors border border-red-500/20"
                            title="Cerrar Sala"
                        >
                            🚫
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

                    {#if currentAlbum}
                        <!-- Player Card -->
                        <div class="flex flex-col items-center max-w-2xl w-full">
                            <div class="relative group cursor-default mb-8">
                                <!-- Subtle Glow -->
                                <div
                                    class="absolute inset-0 bg-primary-500/20 blur-[50px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
                                ></div>
                                <img
                                    src={currentAlbum.cover}
                                    alt={currentAlbum.title}
                                    class="relative z-10 w-[260px] h-[260px] md:w-[320px] md:h-[320px] object-cover rounded-[32px] shadow-2xl border border-white/10"
                                />
                                {#if room.currentTrack.isPlaying}
                                    <div
                                        class="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-green-500/90 backdrop-blur text-black font-bold text-xs rounded-full uppercase tracking-widest shadow-lg animate-pulse"
                                    >
                                        En directo
                                    </div>
                                {/if}
                            </div>

                            <div class="text-center space-y-2 mb-8">
                                <h2
                                    class="text-3xl md:text-4xl font-bold tracking-tight px-4 truncate max-w-full"
                                >
                                    {room.currentTrack.title || 'Música desconocida'}
                                </h2>
                                <p class="text-lg text-slate-400">
                                    {currentAlbum.artist}
                                </p>
                            </div>

                            <!-- Volume Control -->
                            <div
                                class="flex items-center gap-4 w-full max-w-xs px-4 animate-fade-in delay-100 mb-4"
                            >
                                <button
                                    on:click={() =>
                                        audioStore.update((s) => ({ ...s, isMuted: !s.isMuted }))}
                                    class="text-slate-400 hover:text-white transition-colors"
                                >
                                    {#if $audioStore.isMuted || $audioStore.musicVolume === 0}
                                        🔇
                                    {:else if $audioStore.musicVolume < 0.5}
                                        🔉
                                    {:else}
                                        🔊
                                    {/if}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={$audioStore.isMuted ? 0 : $audioStore.musicVolume}
                                    on:input={(e) => {
                                        const val = +e.currentTarget.value;
                                        audioStore.update((s) => ({
                                            ...s,
                                            musicVolume: val,
                                            isMuted: val === 0,
                                        }));
                                    }}
                                    class="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:transition-colors"
                                />
                            </div>
                        </div>
                    {/if}
                {:else}
                    <div
                        class="flex flex-col items-center text-center p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md"
                    >
                        <div
                            class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl mb-4"
                        >
                            🎵
                        </div>
                        <h2 class="text-2xl font-bold mb-2">Sala en silencio</h2>
                        <p class="text-slate-400 mb-6">
                            Selecciona música para comenzar la sesión.
                        </p>
                        {#if isHost}
                            <button
                                on:click={() => (showMusicSelector = true)}
                                class="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-all border border-white/10"
                            >
                                Elegir Música
                            </button>
                        {/if}
                    </div>
                {/if}
            </main>

            <!-- Footer: Participants -->
            <footer class="mt-12 flex flex-col items-center gap-4">
                <div class="flex flex-wrap items-center justify-center gap-3">
                    {#each participantsList as p}
                        <div
                            class="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 backdrop-blur-sm"
                        >
                            <div
                                class="w-2 h-2 rounded-full {p.uid === room.hostId
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'}"
                            ></div>
                            <span class="text-sm font-medium text-slate-200">
                                {p.name}
                                {p.uid === $userStore.user?.uid ? '(Tú)' : ''}
                            </span>
                            {#if p.uid === room.hostId}
                                <span
                                    class="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded ml-1 font-bold"
                                    >HOST</span
                                >
                            {/if}
                        </div>
                    {/each}
                </div>
            </footer>
        </div>
    </div>

    <!-- Right Chat Sidebar -->
    {#if showChat}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="fixed inset-y-0 right-0 w-80 bg-[#0f172a] border-l border-white/10 z-30 flex flex-col shadow-2xl"
            transition:fly={{ x: 300, duration: 300 }}
        >
            <div
                class="p-4 border-b border-white/10 flex justify-between items-center bg-[#0B1120]"
            >
                <h3 class="font-bold flex items-center gap-2">💬 Chat de Sala</h3>
                <button on:click={() => (showChat = false)} class="p-2 hover:bg-white/10 rounded-lg"
                    >✕</button
                >
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-4" bind:this={chatContainer}>
                {#each messages as msg}
                    <div class="flex flex-col items-start animate-fade-in">
                        <div class="flex items-center gap-2 mb-1">
                            <span
                                class="text-xs font-bold {msg.senderId === room.hostId
                                    ? 'text-yellow-500'
                                    : 'text-primary-400'}"
                            >
                                {msg.senderName}
                            </span>
                            <span class="text-[10px] text-slate-600">
                                {msg.timestamp
                                    ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString(
                                          [],
                                          { hour: '2-digit', minute: '2-digit' }
                                      )
                                    : ''}
                            </span>
                        </div>
                        <p
                            class="text-sm text-slate-300 bg-white/5 px-3 py-2 rounded-lg rounded-tl-none break-words max-w-full"
                        >
                            {msg.text}
                        </p>
                    </div>
                {/each}
                {#if messages.length === 0}
                    <div class="text-center py-10 opacity-30">
                        <p class="text-4xl mb-2">👋</p>
                        <p class="text-sm">Di hola a la sala</p>
                    </div>
                {/if}
            </div>

            <div class="p-4 border-t border-white/10 bg-[#0B1120]">
                <form on:submit|preventDefault={sendMessage} class="flex gap-2">
                    <input
                        bind:value={newMessage}
                        class="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm focus:border-primary-500 outline-none transition-colors"
                        placeholder="Escribe un mensaje..."
                    />
                    <button
                        type="submit"
                        class="p-2 bg-primary-500 hover:bg-primary-600 rounded-full text-white transition-colors"
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
    {/if}

    <!-- Music Selector Modal -->
    {#if showMusicSelector}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
            on:click={() => (showMusicSelector = false)}
        >
            <div
                class="bg-[#1e293b] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
                on:click|stopPropagation
            >
                <div
                    class="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a]"
                >
                    <h3 class="text-xl font-bold flex items-center gap-2">
                        {#if selectedAlbumForBrowsing}
                            <button
                                on:click={() => (selectedAlbumForBrowsing = null)}
                                class="hover:text-primary-400 transition-colors">Albums</button
                            >
                            <span class="text-slate-500">/</span>
                            <span>{selectedAlbumForBrowsing.title}</span>
                        {:else}
                            <span>📀</span> Elegir Álbum
                        {/if}
                    </h3>
                    <button
                        on:click={() => (showMusicSelector = false)}
                        class="p-2 hover:bg-white/10 rounded-full transition-colors">✕</button
                    >
                </div>

                <div class="flex-1 overflow-y-auto p-6 bg-[#0B1120]">
                    {#if selectedAlbumForBrowsing}
                        <!-- Tracks View -->
                        <div class="space-y-2">
                            {#each selectedAlbumForBrowsing.tracks || [] as track, i}
                                <button
                                    on:click={() => selectTrack(selectedAlbumForBrowsing.id, i)}
                                    class="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left group"
                                >
                                    <div class="flex items-center gap-4">
                                        <span
                                            class="w-6 text-center text-slate-500 group-hover:text-primary-400 font-mono text-sm"
                                            >{i + 1}</span
                                        >
                                        <div>
                                            <div
                                                class="font-bold text-slate-200 group-hover:text-white"
                                            >
                                                {track.title}
                                            </div>
                                            <div class="text-xs text-slate-500">
                                                {track.artist || selectedAlbumForBrowsing.artist}
                                            </div>
                                        </div>
                                    </div>
                                    <span class="text-xs text-slate-500">Reproducir ▶</span>
                                </button>
                            {/each}
                        </div>
                    {:else}
                        <!-- Albums Grid -->
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {#each $audioStore.availableAlbums as album}
                                <button
                                    on:click={() => browseAlbum(album)}
                                    class="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-white/5 text-left"
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
                                        <p class="text-xs text-slate-400">Ver canciones</p>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
{:else}
    <!-- Error State -->
    <div class="text-center p-20 text-red-400">Error al cargar la sala</div>
{/if}
