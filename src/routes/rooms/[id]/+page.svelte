<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { onMount, onDestroy } from "svelte";
    import { userStore } from "$lib/auth/userStore";
    import { audioStore, playAlbum } from "$lib/audio/store";
    import ChillBackground from "$lib/components/ChillBackground.svelte";

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

    onMount(async () => {
        if (!$userStore.isLoggedIn) {
            goto("/");
            return;
        }

        const { doc, onSnapshot, updateDoc, serverTimestamp } = await import(
            "firebase/firestore"
        );
        const { db } = await import("$lib/firebase");

        const roomRef = doc(db, "listeningRooms", roomId);

        // Listen to room changes
        unsubscribe = onSnapshot(roomRef, (snapshot) => {
            if (!snapshot.exists()) {
                alert("Esta sala no existe.");
                goto("/rooms");
                return;
            }

            const data = snapshot.data() as RoomData;
            room = data;
            isHost = data.hostId === $userStore.user?.uid;

            // Update participants list
            participantsList = Object.entries(data.participants).map(
                ([uid, info]) => ({
                    uid,
                    name: info.displayName,
                }),
            );

            // If not host, sync playback
            if (!isHost && data.currentTrack) {
                if (
                    data.currentTrack.albumId !== $audioStore.currentAlbumId ||
                    data.currentTrack.trackIndex !==
                        $audioStore.currentTrackIndex
                ) {
                    // Sync track
                    playAlbum(data.currentTrack.albumId);
                    // Manually set track index
                    audioStore.update((s) => ({
                        ...s,
                        currentTrackIndex: data.currentTrack!.trackIndex,
                    }));
                }

                // Sync play/pause
                if (data.currentTrack.isPlaying && !$audioStore.isPlaying) {
                    audioStore.update((s) => ({ ...s, isPlaying: true }));
                } else if (
                    !data.currentTrack.isPlaying &&
                    $audioStore.isPlaying
                ) {
                    audioStore.update((s) => ({ ...s, isPlaying: false }));
                }
            }

            loading = false;
        });

        // Add self to participants if not already
        if ($userStore.user) {
            try {
                await updateDoc(roomRef, {
                    [`participants.${$userStore.user.uid}`]: {
                        displayName: $userStore.user.displayName || "Usuario",
                        joinedAt: serverTimestamp(),
                    },
                });
            } catch (err) {
                console.error("Error joining room:", err);
            }
        }

        // If host, sync local state to Firestore
        if (isHost) {
            const unsubscribeStore = audioStore.subscribe(async (state) => {
                if (!state.currentAlbumId) return;

                const currentTrack = state.playlist[state.currentTrackIndex];

                try {
                    await updateDoc(roomRef, {
                        currentTrack: {
                            albumId: state.currentAlbumId,
                            trackIndex: state.currentTrackIndex,
                            isPlaying: state.isPlaying,
                            title: currentTrack?.title || "Unknown",
                            timestamp: serverTimestamp(),
                        },
                    });
                } catch (err) {
                    console.error("Error syncing:", err);
                }
            });

            // Clean up store subscription on unmount
            onDestroy(() => {
                unsubscribeStore();
            });
        }
    });

    onDestroy(async () => {
        if (unsubscribe) unsubscribe();

        // Remove self from participants
        if ($userStore.isLoggedIn && $userStore.user) {
            try {
                const { doc, updateDoc, deleteField } = await import(
                    "firebase/firestore"
                );
                const { db } = await import("$lib/firebase");
                const roomRef = doc(db, "listeningRooms", roomId);

                await updateDoc(roomRef, {
                    [`participants.${$userStore.user.uid}`]: deleteField(),
                });
            } catch (err) {
                console.error("Error leaving room:", err);
            }
        }
    });

    function copyRoomLink() {
        const link = `${window.location.origin}/rooms/${roomId}`;
        navigator.clipboard.writeText(link);
        alert("✅ Enlace copiado al portapapeles");
    }
</script>

<svelte:head>
    <title>{room?.name || "Sala"} | ChillChess</title>
</svelte:head>

{#if loading}
    <div
        class="min-h-screen bg-[#0B1120] text-white font-poppins flex items-center justify-center"
    >
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
        <div class="relative z-10 min-h-screen text-white font-poppins p-8">
            <div class="max-w-6xl mx-auto">
                <!-- Header -->
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <button
                            on:click={() => goto("/rooms")}
                            class="text-slate-400 hover:text-white mb-2 flex items-center gap-2"
                        >
                            ← Salir de la Sala
                        </button>
                        <h1 class="text-3xl font-bold">{room.name}</h1>
                        <p class="text-slate-400 text-sm">
                            Host: {room.hostName}
                            {#if isHost}
                                <span class="text-primary-400 font-bold ml-2"
                                    >(Tú)</span
                                >
                            {/if}
                        </p>
                    </div>
                    <button
                        on:click={copyRoomLink}
                        class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm font-medium"
                    >
                        📋 Copiar Enlace
                    </button>
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
                                    {@const currentAlbum =
                                        $audioStore.availableAlbums.find(
                                            (a) =>
                                                a.id ===
                                                room.currentTrack?.albumId,
                                        )}
                                    {@const currentTrack =
                                        currentAlbum?.tracks?.[
                                            room.currentTrack?.trackIndex ?? 0
                                        ]}

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
                                                {currentTrack.artist ||
                                                    currentAlbum.artist}
                                            </p>
                                            <div
                                                class="flex items-center justify-center gap-2"
                                            >
                                                {#if room.currentTrack.isPlaying}
                                                    <div
                                                        class="w-3 h-3 bg-green-400 rounded-full animate-pulse"
                                                    ></div>
                                                    <span
                                                        class="text-green-400 text-sm font-bold"
                                                        >Reproduciendo</span
                                                    >
                                                {:else}
                                                    <div
                                                        class="w-3 h-3 bg-slate-500 rounded-full"
                                                    ></div>
                                                    <span
                                                        class="text-slate-500 text-sm font-bold"
                                                        >Pausado</span
                                                    >
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            {:else}
                                <div class="text-center py-12 text-slate-500">
                                    {#if isHost}
                                        <p>
                                            Ve a /app y reproduce algo para
                                            compartir con la sala.
                                        </p>
                                    {:else}
                                        <p>
                                            El host aún no ha reproducido nada.
                                        </p>
                                    {/if}
                                </div>
                            {/if}

                            {#if isHost}
                                <div
                                    class="mt-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl"
                                >
                                    <p class="text-sm text-primary-300">
                                        💡 Como host, los controles en /app se
                                        sincronizarán automáticamente aquí.
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
                            <h3
                                class="text-lg font-bold mb-4 flex items-center gap-2"
                            >
                                <span>👥</span>
                                <span
                                    >Participantes ({participantsList.length})</span
                                >
                            </h3>

                            <div class="space-y-3">
                                {#each participantsList as participant (participant.uid)}
                                    <div
                                        class="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                                    >
                                        <div
                                            class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center text-sm font-bold"
                                        >
                                            {participant.name[0]?.toUpperCase() ||
                                                "?"}
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-medium">
                                                {participant.name}
                                            </p>
                                            {#if participant.uid === room.hostId}
                                                <p
                                                    class="text-xs text-primary-400"
                                                >
                                                    Host
                                                </p>
                                            {/if}
                                        </div>
                                        {#if participant.uid === $userStore.user?.uid}
                                            <span class="text-xs text-slate-500"
                                                >(Tú)</span
                                            >
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
