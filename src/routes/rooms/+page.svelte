<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
    import { userStore } from '$lib/auth/userStore';
    import BackIcon from '$lib/components/icons/BackIcon.svelte';
    import ChillBackground from '$lib/components/ChillBackground.svelte';

    interface Room {
        id: string;
        name: string;
        hostName: string;
        participantsCount: number;
        isPlaying: boolean;
        currentTrack?: string;
    }

    let rooms: Room[] = [];
    let myRooms: (Room & { hostId: string })[] = [];
    let loading = true;
    let unsubscribe: (() => void) | null = null;
    let unsubscribeMyRoom: (() => void) | null = null;

    onMount(async () => {
        if (!$userStore.isLoggedIn) {
            goto('/');
            return;
        }

        const { collection, query, where, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('$lib/firebase');

        // Listen to public rooms
        const q = query(collection(db, 'listeningRooms'), where('isPublic', '==', true));

        unsubscribe = onSnapshot(q, (snapshot) => {
            rooms = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    hostName: data.hostName,
                    participantsCount: Object.keys(data.participants || {}).length,
                    isPlaying: data.currentTrack?.isPlaying || false,
                    currentTrack: data.currentTrack?.title,
                };
            });
            loading = false;
        });

        // Listen to MY rooms (hostId == me) to allow rejoining
        if ($userStore.user?.uid) {
            const myQ = query(
                collection(db, 'listeningRooms'),
                where('hostId', '==', $userStore.user.uid)
            );
            unsubscribeMyRoom = onSnapshot(myQ, (snap) => {
                myRooms = snap.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        hostName: data.hostName,
                        hostId: data.hostId,
                        participantsCount: Object.keys(data.participants || {}).length,
                        isPlaying: data.currentTrack?.isPlaying || false,
                        currentTrack: data.currentTrack?.title,
                    };
                });
            });
        }
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
        if (unsubscribeMyRoom) unsubscribeMyRoom();
    });
</script>

<svelte:head>
    <title>Salas de Escucha | ChillChess</title>
</svelte:head>

<div class="relative min-h-screen bg-[#0B1120] text-white font-poppins overflow-hidden">
    <div class="absolute inset-0 z-0 opacity-50">
        <ChillBackground />
    </div>

    <div class="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <button
            on:click={() => goto('/')}
            class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
            <BackIcon size="md" />
            <span>Volver al Inicio</span>
        </button>

        <div
            class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
        >
            <div>
                <h1
                    class="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
                >
                    Salas de Escucha
                </h1>
                <p class="text-slate-400 max-w-xl">
                    Escucha música sincronizada con amigos en tiempo real
                </p>
            </div>
            <button
                on:click={() => goto('/rooms/create')}
                class="w-full md:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-full font-bold transition-all shadow-lg hover:scale-105"
            >
                + Crear Sala
            </button>
        </div>

        <!-- My Active Room Banner -->
        {#if myRooms.length > 0}
            <div class="mb-12 animate-fade-in">
                <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Tu Sala Activa
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {#each myRooms as room}
                        <button
                            on:click={() => goto(`/rooms/${room.id}`)}
                            class="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-6 hover:bg-primary-500/20 transition-all text-left flex items-center justify-between group"
                        >
                            <div>
                                <h3
                                    class="text-xl font-bold text-primary-200 group-hover:text-primary-100 mb-1"
                                >
                                    {room.name}
                                </h3>
                                <div class="text-sm text-primary-300/60 flex items-center gap-2">
                                    <div
                                        class="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                                    ></div>
                                    Sala en curso • {room.participantsCount} oyentes
                                </div>
                            </div>
                            <div
                                class="px-4 py-2 bg-primary-500 text-white rounded-full font-bold text-sm shadow-lg group-hover:scale-105 transition-transform"
                            >
                                Volver a entrar
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        {/if}

        {#if loading}
            <div class="text-center py-20">
                <div
                    class="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"
                ></div>
                <p class="mt-4 text-slate-400">Cargando salas...</p>
            </div>
        {:else if rooms.length === 0}
            <div class="py-16 text-center">
                <div class="text-6xl mb-4 opacity-50">🎵</div>
                <h2 class="text-2xl font-bold mb-2">No hay salas activas</h2>
                <p class="text-slate-400 mb-6">Sé el primero en crear una sala de escucha</p>
                <button
                    on:click={() => goto('/rooms/create')}
                    class="px-8 py-3 bg-primary-500 hover:bg-primary-600 rounded-full font-bold transition-all shadow-lg hover:shadow-primary-500/25"
                >
                    Crear Primera Sala
                </button>
            </div>
        {:else}
            <!-- Public Rooms Grid -->
            <div class="mb-6">
                <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Explorar Salas Públicas
                </h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each rooms as room (room.id)}
                    <button
                        on:click={() => goto(`/rooms/${room.id}`)}
                        class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-primary-500/30 transition-all text-left group"
                    >
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                                <h3
                                    class="text-lg font-bold mb-1 group-hover:text-primary-400 transition-colors"
                                >
                                    {room.name}
                                </h3>
                                <p class="text-xs text-slate-400">
                                    Host: {room.hostName}
                                </p>
                            </div>
                            {#if room.isPlaying}
                                <div
                                    class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                                    title="Reproduciendo"
                                ></div>
                            {/if}
                        </div>

                        {#if room.currentTrack}
                            <div class="text-xs text-slate-500 mb-3 line-clamp-1">
                                🎵 {room.currentTrack}
                            </div>
                        {/if}

                        <div class="flex items-center gap-2 mt-4 text-xs text-slate-400">
                            <div class="bg-white/5 px-2 py-1 rounded">
                                👥 {room.participantsCount}
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>
