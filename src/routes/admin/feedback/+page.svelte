<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { authStore } from '$lib/stores/authStore';
    import { onMount, onDestroy } from 'svelte';
    import {
        Crown,
        AlertCircle,
        MessageSquare,
        Trash2,
        CheckCircle2,
        ChevronLeft,
        Loader2,
        Bug,
        Lightbulb,
    } from 'lucide-svelte';
    import {
        collection,
        query,
        orderBy,
        onSnapshot,
        doc,
        updateDoc,
        deleteDoc,
    } from 'firebase/firestore';
    import { db } from '$lib/firebase';
    import { addToast } from '$lib/stores/toasts';
    import { goto } from '$app/navigation';

    onMount(() => {
        pageHeader.set({
            title: 'Gestión de Feedback',
            description: 'Bugs y sugerencias de usuarios PRO',
            category: 'Admin Panel',
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
        pageHeader.set({ title: '', description: '', category: '' });
    });

    // Check if user is admin
    $: if (!$authStore.loading && $authStore.user && !$authStore.user.isAdmin) {
        goto('/dashboard');
    }

    let feedbackItems: any[] = [];
    let loading = true;
    let unsubscribe: () => void;
    let filterType: 'all' | 'unread' | 'bug' | 'suggestion' = 'unread';

    let isDataSubscribed = false;
    $: if (!$authStore.loading && $authStore.user?.isAdmin && !isDataSubscribed) {
        console.log('Admin Feedback: Auth ready, starting subscription...');
        startSubscription();
    }

    function startSubscription() {
        isDataSubscribed = true;
        const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));

        unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items: any[] = [];
                snapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() });
                });
                feedbackItems = items;
                loading = false;
            },
            (error) => {
                console.error('Error fetching feedback:', error);
                // No reseteamos isDataSubscribed aquí para evitar el bucle infinito
                if (error.code === 'permission-denied') {
                    addToast('Sin permisos para ver feedback.', 'error');
                } else {
                    addToast('No se pudo cargar el feedback.', 'error');
                }
                loading = false;
            }
        );
    }

    $: filteredFeedback = feedbackItems.filter((item) => {
        if (filterType === 'all') return true;
        if (filterType === 'unread') return item.status === 'unread';
        if (filterType === 'bug') return item.type === 'bug';
        if (filterType === 'suggestion') return item.type === 'suggestion';
        return true;
    });

    function getRelativeTime(timestamp: any) {
        if (!timestamp) return 'Justo ahora';
        const date = timestamp.toDate();
        const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto', style: 'short' });
        const daysDifference = Math.round(
            (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        const hoursDifference = Math.round(
            (date.getTime() - new Date().getTime()) / (1000 * 60 * 60)
        );
        const minsDifference = Math.round((date.getTime() - new Date().getTime()) / (1000 * 60));

        if (Math.abs(daysDifference) > 0) return rtf.format(daysDifference, 'day');
        if (Math.abs(hoursDifference) > 0) return rtf.format(hoursDifference, 'hour');
        return rtf.format(minsDifference, 'minute');
    }

    async function markAsRead(id: string) {
        try {
            await updateDoc(doc(db, 'feedback', id), {
                status: 'read',
            });
            addToast('Marcado como leído', 'success');
        } catch (error) {
            console.error('Error updating status', error);
        }
    }

    async function deleteFeedback(id: string) {
        if (!confirm('¿Seguro que deseas eliminar permanentemente este reporte?')) return;
        try {
            await deleteDoc(doc(db, 'feedback', id));
            addToast('Reporte eliminado', 'success');
        } catch (error) {
            console.error('Error deleting feedback', error);
        }
    }
</script>

<svelte:head>
    <title>Feedback Admin | ChillChess</title>
</svelte:head>

<!-- Solo muestra si es admin -->
{#if $authStore.user?.isAdmin}
    <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
            <button
                on:click={() => goto('/admin')}
                class="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5 active:scale-95"
            >
                <ChevronLeft class="w-4 h-4" />
                Volver a Admin
            </button>
            <div class="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                    on:click={() => (filterType = 'unread')}
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all {filterType ===
                    'unread'
                        ? 'bg-white text-black'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}">No Leídos</button
                >
                <button
                    on:click={() => (filterType = 'all')}
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all {filterType ===
                    'all'
                        ? 'bg-white text-black'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}">Todos</button
                >
                <div class="w-px h-4 bg-white/10 mx-1"></div>
                <button
                    on:click={() => (filterType = 'bug')}
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all {filterType ===
                    'bug'
                        ? 'bg-red-500/10 text-red-100 border border-red-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                    ><Bug class="w-3 h-3" /> Bugs</button
                >
                <button
                    on:click={() => (filterType = 'suggestion')}
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all {filterType ===
                    'suggestion'
                        ? 'bg-brand-500/10 text-brand-100 border border-brand-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                    ><Lightbulb class="w-3 h-3" /> Sugerencias</button
                >
            </div>
        </div>

        {#if loading}
            <div class="flex flex-col items-center justify-center py-20">
                <Loader2 class="w-8 h-8 text-brand-500 animate-spin mb-4" />
                <p class="text-slate-400 font-medium">Cargando reportes...</p>
            </div>
        {:else if filteredFeedback.length === 0}
            <div
                class="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-16 text-center shadow-inner"
            >
                <div
                    class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                >
                    <MessageSquare class="w-8 h-8 text-slate-500" />
                </div>
                <h3 class="text-xl font-bold text-white mb-2 tracking-tight">Cero Reportes</h3>
                <p class="text-slate-400">No hay elementos que coincidan con estos filtros.</p>
            </div>
        {:else}
            <div
                class="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden"
            >
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                ></div>

                <div class="divide-y divide-white/5">
                    {#each filteredFeedback as item (item.id)}
                        <div
                            class="p-5 md:p-6 hover:bg-white/[0.02] transition-colors relative group"
                        >
                            <!-- Indicador Read/Unread lateral -->
                            {#if item.status === 'unread'}
                                <div
                                    class="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 shadow-[0_0_10px_rgba(var(--color-brand-500),0.8)]"
                                ></div>
                            {/if}

                            <div
                                class="flex flex-col md:flex-row gap-4 md:items-start justify-between"
                            >
                                <div class="flex items-start gap-4">
                                    <!-- Icono -->
                                    <div class="shrink-0 mt-1">
                                        {#if item.type === 'bug'}
                                            <div
                                                class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-inner"
                                            >
                                                <Bug class="w-5 h-5" />
                                            </div>
                                        {:else}
                                            <div
                                                class="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shadow-inner"
                                            >
                                                <Lightbulb class="w-5 h-5" />
                                            </div>
                                        {/if}
                                    </div>

                                    <!-- Contenido -->
                                    <div class="min-w-0">
                                        <div class="flex items-center gap-2 mb-1">
                                            <span
                                                class="text-sm font-bold text-white truncate max-w-[200px]"
                                                >{item.userName}</span
                                            >
                                            <span
                                                class="text-xs text-slate-500 truncate"
                                                title={item.userEmail}>({item.userEmail})</span
                                            >
                                            <span
                                                class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest"
                                                ><Crown
                                                    class="w-2.5 h-2.5 inline align-text-bottom mr-0.5"
                                                /> PRO</span
                                            >
                                            <span
                                                class="text-xs text-slate-600 ml-2 whitespace-nowrap"
                                                >{getRelativeTime(item.createdAt)}</span
                                            >
                                        </div>

                                        <div
                                            class="bg-black/30 border border-white/5 rounded-xl p-4 mt-3 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed"
                                        >
                                            {item.message}
                                        </div>
                                    </div>
                                </div>

                                <!-- Acciones -->
                                <div
                                    class="flex items-center gap-2 pt-2 md:pt-0 shrink-0 self-end md:self-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {#if item.status === 'unread'}
                                        <button
                                            on:click={() => markAsRead(item.id)}
                                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-all border border-brand-500/20 active:scale-95"
                                        >
                                            <CheckCircle2 class="w-3.5 h-3.5" /> Marcar Leído
                                        </button>
                                    {:else}
                                        <span
                                            class="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-white/5 text-slate-500 border border-transparent"
                                        >
                                            Leído
                                        </span>
                                    {/if}
                                    <button
                                        on:click={() => deleteFeedback(item.id)}
                                        class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
                                        title="Eliminar permanentemente"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
{:else if !$authStore.loading}
    <!-- No Admin Fallback -->
    <div class="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle class="w-12 h-12 text-red-500 mb-4 opacity-80" />
        <h2 class="text-xl font-bold text-white mb-2">Acceso Denegado</h2>
        <p class="text-slate-400">No tienes permisos para ver esta página.</p>
    </div>
{/if}
