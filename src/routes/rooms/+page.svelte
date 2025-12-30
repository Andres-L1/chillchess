<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount, onDestroy } from "svelte";
    import { userStore } from "$lib/auth/userStore";
    import BackIcon from "$lib/components/icons/BackIcon.svelte";

    interface Room {
        id: string;
        name: string;
        hostName: string;
        participantsCount: number;
        isPlaying: boolean;
        currentTrack?: string;
    }

    let rooms: Room[] = [];
    let loading = true;
    let unsubscribe: (() => void) | null = null;

    onMount(async () => {
        if (!$userStore.isLoggedIn) {
            goto("/");
            return;
        }

        const { collection, query, where, onSnapshot } = await import(
            "firebase/firestore"
        );
        const { db } = await import("$lib/firebase");

        // Listen to public rooms
        const q = query(
            collection(db, "listeningRooms"),
            where("isPublic", "==", true),
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
            rooms = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    hostName: data.hostName,
                    participantsCount: Object.keys(data.participants || {})
                        .length,
                    isPlaying: data.currentTrack?.isPlaying || false,
                    currentTrack: data.currentTrack?.title,
                };
            });
            loading = false;
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });
</script>

<svelte:head>
    <title>Salas de Escucha | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-[#0B1120] text-white font-poppins px-4 py-8 md:p-8">
    <div class="max-w-6xl mx-auto">
        <div
            class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
            <div>
                <a
                    href="/"
                    class="text-slate-400 hover:text-white mb-2 flex items-center gap-2 text-sm group transition-colors"
                >
                    <BackIcon size="sm" />
                    <span class="group-hover:translate-x-1 transition-transform"
                        >Volver al Inicio</span
                    >
                </a>
                <h1 class="text-3xl md:text-4xl font-bold">Salas de Escucha</h1>
                <p class="text-slate-400 mt-2 text-sm md:text-base">
                    Escucha música sincronizada con amigos en tiempo real
                </p>
            </div>
            <button
                on:click={() => goto("/rooms/create")}
                class="w-full md:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-full font-bold transition-all shadow-lg hover:scale-105"
            >
                + Crear Sala
            </button>
        </div>

        {#if loading}
            <div class="text-center py-20">
                <div
                    class="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"
                ></div>
                <p class="mt-4 text-slate-400">Cargando salas...</p>
            </div>
        {:else if rooms.length === 0}
            <div
                class="bg-white/5 border border-white/10 rounded-3xl p-16 text-center"
            >
                <div class="text-6xl mb-4">🎵</div>
                <h2 class="text-2xl font-bold mb-2">No hay salas activas</h2>
                <p class="text-slate-400 mb-6">
                    Sé el primero en crear una sala de escucha
                </p>
                <button
                    on:click={() => goto("/rooms/create")}
                    class="px-8 py-3 bg-primary-500 hover:bg-primary-600 rounded-full font-bold transition-all"
                >
                    Crear Primera Sala
                </button>
            </div>
        {:else}
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
                            <div
                                class="text-xs text-slate-500 mb-3 line-clamp-1"
                            >
                                🎵 {room.currentTrack}
                            </div>
                        {/if}

                        <div
                            class="flex items-center gap-4 text-xs text-slate-400"
                        >
                            <div class="flex items-center gap-1">
                                <span>👥</span>
                                <span>{room.participantsCount}</span>
                            </div>
                            <div class="text-primary-400 font-bold">
                                Unirse →
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .line-clamp-1 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
