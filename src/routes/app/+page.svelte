<script lang="ts">
    import { onMount } from 'svelte';
    import { userStore } from '$lib/auth/userStore';
    import { db } from '$lib/firebase';
    import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
    import FocusTimer from '$lib/components/focus/FocusTimer.svelte';
    import BackIcon from '$lib/components/icons/BackIcon.svelte';
    import { fade, fly } from 'svelte/transition';

    let showTimer = false;
    let recentSessions: any[] = [];
    let loading = true;

    // Load sessions logic
    async function loadSessions() {
        if (!$userStore.user) return;
        loading = true;
        try {
            const q = query(
                collection(db, 'focus_sessions'),
                where('userId', '==', $userStore.user.uid),
                orderBy('createdAt', 'desc'),
                limit(10)
            );
            const querySnapshot = await getDocs(q);
            recentSessions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error('Error loading sessions:', e);
        } finally {
            loading = false;
        }
    }

    // Refresh when closing timer to show new session
    function closeTimer() {
        showTimer = false;
        loadSessions();
    }

    onMount(() => {
        if ($userStore.user) {
            loadSessions();
        }
    });

    $: if ($userStore.user && !loading && recentSessions.length === 0) {
        loadSessions();
    }

    function formatDuration(seconds: number) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }

    function formatDate(timestamp: any) {
        if (!timestamp) return '';
        // Handle Firestore timestamp or JS Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('es-ES', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    }
</script>

{#if showTimer}
    <div transition:fade={{ duration: 300 }} class="fixed inset-0 z-50 bg-[#0B1120]">
        <FocusTimer on:close={closeTimer} />
    </div>
{:else}
    <div class="min-h-screen bg-[#0B1120] text-white font-poppins selection:bg-orange-500/30">
        <!-- Dashboard Header -->
        <header
            class="p-6 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
            <div>
                <a
                    href="/"
                    class="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-medium text-sm uppercase tracking-wider group"
                >
                    <BackIcon size="xs" />
                    <span class="group-hover:-translate-x-1 transition-transform">Volver</span>
                </a>
                <h1 class="text-3xl md:text-5xl font-light tracking-tight mb-2">
                    Hola, <span class="font-medium text-white"
                        >{$userStore.user?.displayName?.split(' ')[0] || 'Viajero'}</span
                    >
                </h1>
                <p class="text-slate-400 font-light text-lg">Tu historial de enfoque.</p>
            </div>

            <!-- Quick Start Button -->
            <button
                on:click={() => (showTimer = true)}
                class="hidden md:flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full hover:scale-105 transition-transform font-bold tracking-wide shadow-[0_0_30px_rgba(255,255,255,0.15)] group"
            >
                <svg
                    class="w-6 h-6 group-hover:rotate-90 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                    /></svg
                >
                <span>NUEVA SESIÓN</span>
            </button>
        </header>

        <main class="px-6 md:px-12 max-w-6xl mx-auto pb-24">
            <!-- Stats Row (Simple) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div
                    class="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                    <div
                        class="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-2"
                    >
                        Sesiones
                    </div>
                    <div class="text-3xl md:text-4xl font-light">{recentSessions.length}</div>
                </div>
                <div
                    class="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                    <div
                        class="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-2"
                    >
                        Tiempo Total
                    </div>
                    <div class="text-3xl md:text-4xl font-light flex items-baseline gap-1">
                        {Math.floor(
                            recentSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60
                        )}<span class="text-sm text-slate-500 font-medium">min</span>
                    </div>
                </div>
            </div>

            <!-- Activity Feed -->
            <div class="mb-8">
                <h2 class="text-xl font-medium mb-6 flex items-center gap-2 text-slate-200">
                    <svg
                        class="w-5 h-5 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        /></svg
                    >
                    Actividad Reciente
                </h2>

                {#if loading}
                    <div class="space-y-4 animate-pulse">
                        <div class="h-20 bg-white/5 rounded-xl w-full"></div>
                        <div class="h-20 bg-white/5 rounded-xl w-full"></div>
                        <div class="h-20 bg-white/5 rounded-xl w-full"></div>
                    </div>
                {:else if recentSessions.length === 0}
                    <div
                        class="text-center py-20 border border-dashed border-white/10 rounded-2xl text-slate-500 bg-white/[0.02]"
                    >
                        <p class="mb-4">No hay sesiones registradas aún.</p>
                        <button
                            on:click={() => (showTimer = true)}
                            class="text-orange-400 hover:text-orange-300 underline underline-offset-4 font-medium"
                            >Empezar ahora</button
                        >
                    </div>
                {:else}
                    <div class="space-y-3">
                        {#each recentSessions as session, i}
                            <div
                                in:fly={{ y: 20, delay: i * 50 }}
                                class="group flex items-center justify-between p-5 bg-[#0F172A] border border-white/5 rounded-2xl hover:border-white/20 transition-all hover:bg-white/[0.07]"
                            >
                                <div class="flex items-center gap-5">
                                    <div
                                        class="w-12 h-12 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center text-orange-500 shadow-inner group-hover:scale-110 transition-transform"
                                    >
                                        <!-- Check icon if completed, else simple dot -->
                                        {#if session.completed}
                                            <svg
                                                class="w-5 h-5 text-green-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                ><path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M5 13l4 4L19 7"
                                                /></svg
                                            >
                                        {:else}
                                            <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                                        {/if}
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-white text-lg">
                                            {session.task || 'Sesión de Enfoque'}
                                        </h3>
                                        <p class="text-xs text-slate-500 font-mono mt-0.5">
                                            {formatDate(session.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div
                                        class="font-mono text-xl text-white font-light tracking-tight"
                                    >
                                        {formatDuration(session.duration)}
                                    </div>
                                    <div
                                        class="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1 opacity-60"
                                    >
                                        TIMER
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </main>

        <!-- Mobile FAB -->
        <button
            on:click={() => (showTimer = true)}
            class="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-white text-black rounded-full shadow-[0_10px_40px_rgba(255,255,255,0.3)] flex items-center justify-center z-40 active:scale-90 transition-transform"
        >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                /></svg
            >
        </button>
    </div>
{/if}
