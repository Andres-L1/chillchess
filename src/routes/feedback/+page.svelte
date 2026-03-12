<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { authStore } from '$lib/stores/authStore';
    import { onMount, onDestroy } from 'svelte';
    import {
        Send,
        Bug,
        Lightbulb,
        HelpCircle,
        Heart,
        MessageSquare,
        Loader2,
        Clock,
        ShieldAlert,
        Zap,
        Info
    } from 'lucide-svelte';
    import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
    import { db } from '$lib/firebase';
    import { addToast } from '$lib/stores/toasts';
    import ProGate from '$lib/components/ui/ProGate.svelte';

    // Configuración del Header
    onMount(() => {
        pageHeader.set({
            title: 'Feedback',
            description: 'Ayúdanos a mejorar ChillChess',
            category: 'Comunidad',
        });
    });

    onDestroy(() => {
        pageHeader.set({ title: '', description: '', category: '' });
    });

    type FeedbackType = 'idea' | 'bug' | 'question' | 'kudos';
    type BugPriority = 'low' | 'medium' | 'high';

    let feedbackType: FeedbackType = 'idea';
    let bugPriority: BugPriority = 'medium';
    let message = '';
    let isSubmitting = false;

    function setFeedbackType(typeId: string) {
        feedbackType = typeId as FeedbackType;
    }

    function setBugPriority(priorityId: string) {
        bugPriority = priorityId as BugPriority;
    }

    const feedbackTypes = [
        { id: 'idea', icon: Lightbulb, label: 'Idea Brillante', color: 'bg-yellow-400', textColor: 'text-black' },
        { id: 'bug', icon: Bug, label: 'Error Crítico', color: 'bg-red-500', textColor: 'text-white' },
        { id: 'question', icon: HelpCircle, label: 'Duda Rápida', color: 'bg-blue-400', textColor: 'text-black' },
        { id: 'kudos', icon: Heart, label: 'Apoyo', color: 'bg-green-400', textColor: 'text-black' }
    ];

    const priorities = [
        { id: 'high', label: 'Alta (Me impide usar la app)', icon: ShieldAlert, color: 'bg-red-500' },
        { id: 'medium', label: 'Media (Es molesto pero puedo seguir)', icon: Zap, color: 'bg-yellow-400' },
        { id: 'low', label: 'Baja (Detalle visual o menor)', icon: Info, color: 'bg-blue-400' }
    ];

    async function handleSubmit() {
        if (!message.trim()) {
            addToast('Por favor, escribe un mensaje.', 'error');
            return;
        }

        if (!$authStore.user?.isPro) {
            addToast('Esta función es exclusiva para usuarios PRO.', 'error');
            return;
        }

        isSubmitting = true;

        try {
            const docData: any = {
                type: feedbackType,
                message: message.trim(),
                userId: $authStore.user.uid,
                userEmail: $authStore.user.email,
                userName: $authStore.user.displayName || 'Usuario',
                status: 'unread',
                createdAt: serverTimestamp(),
            };

            if (feedbackType === 'bug') {
                docData.priority = bugPriority;
            }

            await addDoc(collection(db, 'feedback'), docData);

            addToast('¡Gracias por tu mensaje! Lo revisaremos pronto.', 'success');
            message = '';
            
            // Haptic feedback de éxito
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([30, 50, 30]);
            }
        } catch (error) {
            console.error('Error enviando feedback:', error);
            addToast('Hubo un error al enviar tu mensaje. Inténtalo más tarde.', 'error');
        } finally {
            isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Feedback | ChillChess</title>
</svelte:head>

<ProGate>
    <!-- Layout con panel lateral en desktop -->
    <div class="max-w-6xl mx-auto py-6 md:py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Columna Principal: Formulario -->
        <div class="lg:col-span-2 space-y-8">
            <div class="bg-white dark:bg-slate-900 border-4 border-black p-6 md:p-8 shadow-neo relative overflow-hidden">
                <div class="flex items-start gap-4 mb-8">
                    <div class="p-4 bg-primary text-white border-4 border-black shadow-neo-sm shrink-0">
                        <MessageSquare class="w-8 h-8" />
                    </div>
                    <div>
                        <h2 class="text-2xl md:text-3xl font-black text-black dark:text-white tracking-tight uppercase">
                            Buzón Directo
                        </h2>
                        <p class="text-sm text-slate-600 dark:text-slate-400 font-bold mt-2">
                            Tu opinión llega directamente a los desarrolladores. Moldea el futuro de ChillChess.
                        </p>
                    </div>
                </div>

                <form on:submit|preventDefault={handleSubmit} class="space-y-8">
                    <!-- Selector de Tipo -->
                    <div class="space-y-4">
                        <p class="inline-block text-xs font-black uppercase tracking-widest ml-1 bg-black text-white px-2 py-1">
                            1. ¿De qué se trata?
                        </p>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {#each feedbackTypes as type}
                                <button
                                    type="button"
                                    on:click={() => setFeedbackType(type.id)}
                                    class="flex flex-col items-center justify-center p-4 border-4 border-black transition-all active:translate-x-0 active:translate-y-0 relative overflow-hidden group 
                                    {feedbackType === type.id
                                        ? `${type.color} ${type.textColor} shadow-none translate-x-[2px] translate-y-[2px]`
                                        : 'bg-white dark:bg-slate-800 text-black dark:text-white shadow-neo-sm -translate-x-[2px] -translate-y-[2px] hover:-translate-y-1 hover:translate-x-0 hover:shadow-neo'}"
                                >
                                    <!-- Decorative pattern for selected -->
                                    {#if feedbackType === type.id}
                                        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle, currentColor 2px, transparent 2px); background-size: 10px 10px;"></div>
                                    {/if}
                                    <svelte:component this={type.icon} class="w-8 h-8 mb-3 z-10" />
                                    <span class="font-black text-xs uppercase z-10">{type.label}</span>
                                </button>
                            {/each}
                        </div>
                    </div>

                    <!-- Selector de Prioridad (Sólo para Bugs) -->
                    {#if feedbackType === 'bug'}
                        <div class="space-y-4 p-4 md:p-6 bg-slate-100 dark:bg-slate-800 border-4 border-black border-dashed">
                            <p class="inline-block text-xs font-black uppercase tracking-widest bg-red-500 text-white px-2 py-1">
                                Ouch. ¿Qué tan grave es?
                            </p>
                            <div class="flex flex-col gap-3">
                                {#each priorities as priority}
                                    <button
                                        type="button"
                                        on:click={() => setBugPriority(priority.id)}
                                        class="flex items-center gap-4 p-3 border-4 border-black transition-all text-left
                                        {bugPriority === priority.id
                                            ? `${priority.color} text-black shadow-none translate-x-[2px] translate-y-[2px]`
                                            : 'bg-white dark:bg-slate-900 text-black dark:text-white shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5'}"
                                    >
                                        <div class="p-2 bg-black text-white shrink-0">
                                            <svelte:component this={priority.icon} class="w-5 h-5" />
                                        </div>
                                        <span class="font-black text-sm uppercase">{priority.label}</span>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Mensaje -->
                    <div class="space-y-4">
                        <label
                            for="feedbackMessage"
                            class="inline-block text-xs font-black uppercase tracking-widest ml-1 bg-black text-white px-2 py-1"
                        >
                            2. Cuenta todos los detalles
                        </label>
                        <textarea
                            id="feedbackMessage"
                            bind:value={message}
                            rows="6"
                            placeholder={feedbackType === 'bug' ? "Pasos para reproducir el error..." : "Me gustaría que la plataforma tuviera..."}
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black p-4 text-black dark:text-white placeholder-slate-400 font-medium focus:outline-none transition-all resize-none shadow-neo-sm focus:shadow-neo focus:-translate-y-1"
                        ></textarea>
                    </div>

                    <!-- Footer / Acción -->
                    <div class="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting || !message.trim()}
                            class="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-black text-white border-4 border-black w-full md:w-auto
                            font-black text-sm md:text-base uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] dark:shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:translate-x-2 active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {#if isSubmitting}
                                <Loader2 class="w-6 h-6 animate-spin" />
                                <span>Procesando...</span>
                            {:else}
                                <Send
                                    class="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"
                                />
                                <span>Enviar Ahora</span>
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Columna Secundaria: Panel de Información (Desktop) -->
        <div class="space-y-6 lg:mt-0">
            <!-- Card 1: Tiempos -->
            <div class="bg-blue-400 border-4 border-black p-6 shadow-neo transform lg:rotate-1 hover:rotate-0 transition-transform">
                <div class="flex items-center gap-3 mb-4">
                    <Clock class="w-6 h-6 text-black" />
                    <h3 class="font-black text-black uppercase tracking-widest text-sm">Tiempos Estimados</h3>
                </div>
                <ul class="space-y-3 font-bold text-black text-sm">
                    <li class="flex justify-between border-b-2 border-black/20 pb-2">
                        <span>Errores Críticos</span>
                        <span class="bg-black text-white px-2 py-0.5 text-xs">24h</span>
                    </li>
                    <li class="flex justify-between border-b-2 border-black/20 pb-2">
                        <span>Dudas Rápidas</span>
                        <span class="bg-black text-white px-2 py-0.5 text-xs">1-2 Días</span>
                    </li>
                    <li class="flex justify-between pb-2">
                        <span>Nuevas Ideas</span>
                        <span class="bg-black text-white px-2 py-0.5 text-xs">Revisión Semanal</span>
                    </li>
                </ul>
            </div>

            <!-- Card 2: FAQ -->
            <div class="bg-yellow-400 border-4 border-black p-6 shadow-neo transform lg:-rotate-1 hover:rotate-0 transition-transform">
                <div class="flex items-center gap-3 mb-4">
                    <Lightbulb class="w-6 h-6 text-black" />
                    <h3 class="font-black text-black uppercase tracking-widest text-sm">Consejos</h3>
                </div>
                <div class="space-y-4 font-bold text-black text-sm">
                    <div>
                        <p class="uppercase text-xs font-black bg-white inline-block px-1 border-2 border-black mb-1">Para Bugs</p>
                        <p>Intenta describir los pasos exactos que hiciste antes de que ocurriera el error.</p>
                    </div>
                    <div>
                        <p class="uppercase text-xs font-black bg-white inline-block px-1 border-2 border-black mb-1">Para Ideas</p>
                        <p>Cuéntanos no solo QUÉ quieres, sino POR QUÉ lo necesitas. ¡El contexto ayuda mucho!</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</ProGate>
