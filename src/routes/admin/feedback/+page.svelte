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
        HelpCircle,
        Heart,
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
    let filterType: 'all' | 'unread' | 'bug' | 'idea' | 'question' | 'kudos' = 'unread';

    let isDataSubscribed = false;
    $: if (!$authStore.loading) {
        if ($authStore.user?.isAdmin && !isDataSubscribed) {
            startSubscription();
        }
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
        if (filterType === 'idea') return item.type === 'idea';
        if (filterType === 'question') return item.type === 'question';
        if (filterType === 'kudos') return item.type === 'kudos';
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
                class="flex items-center gap-2 text-sm font-black text-black hover:-translate-x-1 hover:-translate-y-1 transition-transform bg-white px-4 py-2 border-4 border-black shadow-neo-sm active:translate-x-0 active:translate-y-0 active:shadow-none uppercase tracking-widest"
            >
                <ChevronLeft class="w-4 h-4" />
                Volver a Admin
            </button>
            <div class="flex items-center gap-3 p-2 bg-slate-50 border-4 border-black overflow-x-auto custom-scrollbar shadow-neo-sm">
                <button
                    on:click={() => (filterType = 'unread')}
                    class="px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-wider transition-all {filterType === 'unread'
                        ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-black hover:-translate-y-1 shadow-neo-sm'}">No Leídos</button>
                
                <button
                    on:click={() => (filterType = 'all')}
                    class="px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-wider transition-all {filterType === 'all'
                        ? 'bg-black text-white shadow-none translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-black hover:-translate-y-1 shadow-neo-sm'}">Todos</button>
                
                <div class="w-1 h-8 bg-black mx-1 shrink-0"></div>
                
                <button
                    on:click={() => (filterType = 'bug')}
                    class="flex items-center gap-2 px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-wider shrink-0 transition-all {filterType === 'bug'
                        ? 'bg-red-500 text-white shadow-none translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-black hover:-translate-y-1 shadow-neo-sm'}"
                    ><Bug class="w-4 h-4" /> Bugs</button>
                
                <button
                    on:click={() => (filterType = 'idea')}
                    class="flex items-center gap-2 px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-wider shrink-0 transition-all {filterType === 'idea'
                        ? 'bg-yellow-400 text-black shadow-none translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-black hover:-translate-y-1 shadow-neo-sm'}"
                    ><Lightbulb class="w-4 h-4" /> Ideas</button>
                
                <button
                    on:click={() => (filterType = 'question')}
                    class="flex items-center gap-2 px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-wider shrink-0 transition-all {filterType === 'question'
                        ? 'bg-blue-400 text-black shadow-none translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-black hover:-translate-y-1 shadow-neo-sm'}"
                    ><HelpCircle class="w-4 h-4" /> Dudas</button>
                
                <button
                    on:click={() => (filterType = 'kudos')}
                    class="flex items-center gap-2 px-4 py-2 border-4 border-black text-xs font-black uppercase tracking-wider shrink-0 transition-all {filterType === 'kudos'
                        ? 'bg-green-400 text-black shadow-none translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-black hover:-translate-y-1 shadow-neo-sm'}"
                    ><Heart class="w-4 h-4" /> Apoyo</button>
            </div>
        </div>

        {#if loading}
            <div class="flex flex-col items-center justify-center py-20">
                <Loader2 class="w-8 h-8 text-brand-500 animate-spin mb-4" />
                <p class="text-slate-400 font-medium">Cargando reportes...</p>
            </div>
        {:else if filteredFeedback.length === 0}
            <div
                class="bg-white border-4 border-black p-16 text-center shadow-neo"
            >
                <div
                    class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 border-4 border-black mb-6 shadow-neo-sm transform -rotate-6"
                >
                    <MessageSquare class="w-8 h-8 text-black" />
                </div>
                <h3 class="text-2xl font-black text-black mb-2 tracking-tight uppercase">CERO REPORTES</h3>
                <p class="text-slate-600 font-bold">No hay elementos que coincidan con estos filtros.</p>
            </div>
        {:else}
            <div
                class="bg-white border-4 border-black shadow-neo relative overflow-hidden"
            >
                <div class="divide-y-4 divide-black">
                    {#each filteredFeedback as item (item.id)}
                        <div
                            class="p-5 md:p-6 hover:bg-slate-50 transition-colors relative group"
                        >
                            <div
                                class="flex flex-col md:flex-row gap-6 md:items-start justify-between"
                            >
                                <div class="flex items-start gap-4">
                                    <!-- Icono -->
                                    <div class="shrink-0 mt-1">
                                        {#if item.type === 'bug'}
                                            <div
                                                class="w-12 h-12 bg-red-500 border-4 border-black text-white flex items-center justify-center shadow-neo-sm hover:-translate-y-1 hover:-translate-x-1 transition-transform"
                                            >
                                                <Bug class="w-6 h-6" />
                                            </div>
                                        {:else if item.type === 'idea'}
                                            <div
                                                class="w-12 h-12 bg-yellow-400 border-4 border-black text-black flex items-center justify-center shadow-neo-sm hover:-translate-y-1 hover:-translate-x-1 transition-transform"
                                            >
                                                <Lightbulb class="w-6 h-6" />
                                            </div>
                                        {:else if item.type === 'question'}
                                            <div
                                                class="w-12 h-12 bg-blue-400 border-4 border-black text-black flex items-center justify-center shadow-neo-sm hover:-translate-y-1 hover:-translate-x-1 transition-transform"
                                            >
                                                <HelpCircle class="w-6 h-6" />
                                            </div>
                                        {:else if item.type === 'kudos'}
                                            <div
                                                class="w-12 h-12 bg-green-400 border-4 border-black text-black flex items-center justify-center shadow-neo-sm hover:-translate-y-1 hover:-translate-x-1 transition-transform"
                                            >
                                                <Heart class="w-6 h-6" />
                                            </div>
                                        {:else}
                                            <div
                                                class="w-12 h-12 bg-primary border-4 border-black text-white flex items-center justify-center shadow-neo-sm hover:-translate-y-1 hover:-translate-x-1 transition-transform"
                                            >
                                                <MessageSquare class="w-6 h-6" />
                                            </div>
                                        {/if}
                                    </div>

                                    <!-- Contenido -->
                                    <div class="min-w-0">
                                        <div class="flex items-center gap-2 mb-2 flex-wrap">
                                            {#if item.status === 'unread'}
                                            <span class="inline-block px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-widest mr-2">
                                                NUEVO
                                            </span>
                                            {/if}
                                            <span
                                                class="text-lg font-black text-black truncate max-w-[200px]"
                                                >{item.userName}</span
                                            >
                                            <span
                                                class="text-xs text-slate-500 font-bold truncate"
                                                title={item.userEmail}>({item.userEmail})</span
                                            >
                                            <span
                                                class="px-2 py-0.5 text-[9px] font-black bg-primary text-white border-2 border-black uppercase tracking-widest shrink-0"
                                                ><Crown
                                                    class="w-3 h-3 inline align-text-bottom mr-1"
                                                /> PRO</span
                                            >
                                            {#if item.type === 'bug' && item.priority}
                                                <span
                                                    class="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest shrink-0 border-2 border-black {item.priority === 'high' ? 'bg-red-500 text-white' : item.priority === 'medium' ? 'bg-yellow-400 text-black' : 'bg-blue-400 text-black'}"
                                                >
                                                    {item.priority === 'high' ? 'CRÍTICO' : item.priority === 'medium' ? 'PRIO MEDIA' : 'BAJA'}
                                                </span>
                                            {/if}
                                            <span
                                                class="text-[10px] uppercase font-black text-slate-400 ml-2 whitespace-nowrap"
                                                >{getRelativeTime(item.createdAt)}</span
                                            >
                                        </div>

                                        <div
                                            class="bg-slate-100 border-4 border-black p-4 mt-3 text-sm text-black font-medium whitespace-pre-wrap leading-relaxed shadow-neo-sm"
                                        >
                                            {item.message}
                                        </div>
                                    </div>
                                </div>

                                <!-- Acciones -->
                                <div
                                    class="flex items-center gap-3 pt-2 md:pt-0 shrink-0 self-end md:self-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {#if item.status === 'unread'}
                                        <button
                                            on:click={() => markAsRead(item.id)}
                                            class="flex items-center gap-2 px-3 py-2 bg-primary border-4 border-black text-white text-[11px] font-black uppercase tracking-wider shadow-neo-sm hover:-translate-y-1 hover:-translate-x-1 transition-transform active:translate-x-0 active:translate-y-0 active:shadow-none"
                                        >
                                            <CheckCircle2 class="w-4 h-4" /> Marcar Leído
                                        </button>
                                    {:else}
                                        <span
                                            class="px-3 py-2 bg-slate-200 border-4 border-black text-slate-500 text-[11px] font-black uppercase tracking-wider"
                                        >
                                            Leído
                                        </span>
                                    {/if}
                                    <button
                                        on:click={() => deleteFeedback(item.id)}
                                        class="p-2 bg-red-500 border-4 border-black text-white shadow-neo-sm hover:-translate-y-1 hover:-translate-x-1 transition-transform active:translate-x-0 active:translate-y-0 active:shadow-none"
                                        title="Eliminar permanentemente"
                                    >
                                        <Trash2 class="w-5 h-5" />
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
