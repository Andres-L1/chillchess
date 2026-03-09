<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { authStore } from '$lib/stores/authStore';
    import { onMount, onDestroy } from 'svelte';
    import {
        Send,
        Bug,
        Lightbulb,
        LockKeyhole,
        Crown,
        Loader2,
        MessageSquare,
    } from 'lucide-svelte';
    import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
    import { db } from '$lib/firebase';
    import { addToast } from '$lib/stores/toasts';
    import ProGate from '$lib/components/ui/ProGate.svelte';

    // Configuración del Header
    onMount(() => {
        pageHeader.set({
            title: 'Sugerencias y Bugs',
            description: 'Ayúdanos a mejorar la plataforma',
            category: 'Comunidad',
        });
    });

    onDestroy(() => {
        pageHeader.set({ title: '', description: '', category: '' });
    });

    let feedbackType: 'bug' | 'suggestion' = 'suggestion';
    let message = '';
    let isSubmitting = false;

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
            await addDoc(collection(db, 'feedback'), {
                type: feedbackType,
                message: message.trim(),
                userId: $authStore.user.uid,
                userEmail: $authStore.user.email,
                userName: $authStore.user.displayName || 'Usuario',
                status: 'unread',
                createdAt: serverTimestamp(),
            });

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
    <title>Sugerencias y Bugs | ChillChess</title>
</svelte:head>

<ProGate>
    <div class="max-w-2xl mx-auto py-10">
        <!-- Formulario para usuarios PRO -->
        <div
            class="bg-white dark:bg-slate-900 border-4 border-black p-4 md:p-8 shadow-neo relative overflow-hidden"
        >
            <div class="flex items-center gap-4 mb-8">
                <div class="p-3 bg-black text-white border-4 border-black shadow-neo-sm">
                    <MessageSquare class="w-6 h-6" />
                </div>
                <div>
                    <h2
                        class="text-xl font-black text-black dark:text-white tracking-tight uppercase"
                    >
                        Envíanos tu Feedback
                    </h2>
                    <p class="text-xs text-slate-500 font-bold mt-1">
                        Tu opinión moldea el futuro de ChillChess.
                    </p>
                </div>
            </div>

            <form on:submit|preventDefault={handleSubmit} class="space-y-6">
                <!-- Selector de Tipo -->
                <div class="space-y-3">
                    <p
                        class="block text-[10px] font-black text-black dark:text-white uppercase tracking-widest ml-1"
                    >
                        ¿De qué se trata?
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            type="button"
                            on:click={() => (feedbackType = 'suggestion')}
                            class="flex flex-col items-center justify-center p-4 border-4 border-black transition-all active:translate-x-0 active:translate-y-0 {feedbackType ===
                            'suggestion'
                                ? 'bg-primary text-white shadow-none translate-x-[2px] translate-y-[2px]'
                                : 'bg-white dark:bg-slate-800 text-black dark:text-white shadow-neo-sm -translate-x-[2px] -translate-y-[2px] hover:-translate-y-1 hover:translate-x-0 hover:shadow-neo'}"
                        >
                            <Lightbulb class="w-6 h-6 mb-2" />
                            <span class="font-black text-xs uppercase">Sugerencia</span>
                        </button>

                        <button
                            type="button"
                            on:click={() => (feedbackType = 'bug')}
                            class="flex flex-col items-center justify-center p-4 border-4 border-black transition-all active:translate-x-0 active:translate-y-0 {feedbackType ===
                            'bug'
                                ? 'bg-red-500 text-white shadow-none translate-x-[2px] translate-y-[2px]'
                                : 'bg-white dark:bg-slate-800 text-black dark:text-white shadow-neo-sm -translate-x-[2px] -translate-y-[2px] hover:-translate-y-1 hover:translate-x-0 hover:shadow-neo'}"
                        >
                            <Bug class="w-6 h-6 mb-2" />
                            <span class="font-black text-xs uppercase">Reportar Bug</span>
                        </button>
                    </div>
                </div>

                <!-- Mensaje -->
                <div class="space-y-3">
                    <label
                        for="feedbackMessage"
                        class="block text-[10px] font-black text-black dark:text-white uppercase tracking-widest ml-1"
                    >
                        Tu Mensaje
                        <span class="text-[8px] font-bold text-slate-500 ml-2 italic"
                            >(Detalla qué añadirías o dónde está el error)</span
                        >
                    </label>
                    <textarea
                        id="feedbackMessage"
                        bind:value={message}
                        rows="5"
                        placeholder="Ej: Me gustaría que añadieran una calculadora de..."
                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black p-4 text-black dark:text-white placeholder-slate-500 focus:outline-none transition-all resize-none shadow-neo-sm focus:shadow-neo"
                    ></textarea>
                </div>

                <!-- Footer / Acción -->
                <div class="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        class="group relative inline-flex items-center gap-2 px-8 py-4 bg-primary text-white border-4 border-black font-black text-xs uppercase tracking-widest shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:translate-x-0 active:translate-y-0 active:shadow-neo disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {#if isSubmitting}
                            <Loader2 class="w-4 h-4 animate-spin" />
                            <span>Enviando...</span>
                        {:else}
                            <Send
                                class="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
                            />
                            <span>Enviar Mensaje</span>
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
</ProGate>
