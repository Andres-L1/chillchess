<script lang="ts">
    import { goto } from '$app/navigation';
    import { userStore } from '$lib/auth/userStore';
    import { onMount } from 'svelte';
    import { toast } from '$lib/stores/notificationStore';
    import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
    import { db } from '$lib/firebase';

    let roomName = '';
    let isPublic = false;
    let creating = false;
    let isPro = false;

    onMount(async () => {
        if (!$userStore.isLoggedIn) {
            goto('/');
            return;
        }

        try {
            if ($userStore.user?.uid) {
                const snap = await getDoc(doc(db, 'users', $userStore.user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    isPro = data.subscriptionTier === 'pro' || data.subscriptionTier === 'premium';
                }
            }
        } catch (e) {
            console.error(e);
        }
    });

    async function createRoom() {
        if (!roomName.trim() || creating) return;

        if (isPublic && !isPro) {
            toast.error('Las salas públicas son exclusivas de PRO');
            return;
        }

        creating = true;
        try {
            const roomData = {
                name: roomName.trim(),
                hostId: $userStore.user?.uid,
                hostName: $userStore.user?.displayName || 'Usuario',
                createdAt: serverTimestamp(),
                isPublic,
                currentTrack: null,
                participants: {
                    [$userStore.user?.uid || 'unknown']: {
                        displayName: $userStore.user?.displayName || 'Usuario',
                        joinedAt: serverTimestamp(),
                    },
                },
            };

            const docRef = await addDoc(collection(db, 'listeningRooms'), roomData);
            goto(`/rooms/${docRef.id}`);
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error('Error al crear la sala. Intenta de nuevo.');
        } finally {
            creating = false;
        }
    }
</script>

<svelte:head>
    <title>Crear Sala | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-[#0B1120] text-white font-poppins p-8">
    <div class="max-w-2xl mx-auto">
        <button
            on:click={() => goto('/rooms')}
            class="text-slate-400 hover:text-white mb-6 flex items-center gap-2"
        >
            ← Volver
        </button>

        <div class="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <h1 class="text-3xl font-bold mb-2">Crear Sala de Escucha</h1>
            <p class="text-slate-400 mb-8">
                Escucha música sincronizada con tus amigos en tiempo real.
            </p>

            <form on:submit|preventDefault={createRoom} class="space-y-6">
                <!-- Room Name -->
                <div>
                    <label for="roomName" class="block text-sm font-medium mb-2"
                        >Nombre de la Sala</label
                    >
                    <input
                        id="roomName"
                        type="text"
                        bind:value={roomName}
                        placeholder="Ej: Sesión de Estudio Nocturna"
                        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
                        maxlength="50"
                        required
                    />
                </div>

                <!-- Privacy -->
                <div>
                    <span class="block text-sm font-medium mb-3">Privacidad</span>
                    <div class="flex gap-4">
                        <button
                            type="button"
                            on:click={() => {
                                if (isPro) {
                                    isPublic = true;
                                } else {
                                    toast.error('Las salas públicas son exclusivas de PRO');
                                }
                            }}
                            class="flex-1 py-3 px-4 rounded-xl transition-all relative overflow-hidden {isPublic
                                ? 'bg-primary-500 text-white border-2 border-primary-500'
                                : 'bg-white/5 text-slate-400 border-2 border-white/10 hover:border-white/20'}"
                        >
                            {#if !isPro}
                                <div
                                    class="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider"
                                >
                                    PRO
                                </div>
                            {/if}
                            <div class="text-2xl mb-1">🌍</div>
                            <div class="text-sm font-bold">Pública</div>
                            <div class="text-xs opacity-70">Visible para todos</div>
                        </button>
                        <button
                            type="button"
                            on:click={() => (isPublic = false)}
                            class="flex-1 py-3 px-4 rounded-xl transition-all {!isPublic
                                ? 'bg-primary-500 text-white border-2 border-primary-500'
                                : 'bg-white/5 text-slate-400 border-2 border-white/10 hover:border-white/20'}"
                        >
                            <div class="text-2xl mb-1">🔒</div>
                            <div class="text-sm font-bold">Privada</div>
                            <div class="text-xs opacity-70">Solo con enlace</div>
                        </button>
                    </div>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    disabled={!roomName.trim() || creating}
                    class="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-white/10 disabled:text-slate-500 rounded-xl font-bold transition-all disabled:cursor-not-allowed"
                >
                    {creating ? 'Creando...' : 'Crear Sala'}
                </button>
            </form>

            <div class="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h3 class="text-sm font-bold mb-2 flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>¿Cómo funciona?</span>
                </h3>
                <ul class="text-xs text-slate-300 space-y-1">
                    <li>• Como host, tú controlas la reproducción.</li>
                    <li>• Todos en la sala escuchan lo mismo sincronizado.</li>
                    <li>• Comparte el enlace de la sala para invitar amigos.</li>
                </ul>
            </div>
        </div>
    </div>
</div>
