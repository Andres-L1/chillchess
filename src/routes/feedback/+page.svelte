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

<div class="max-w-2xl mx-auto space-y-8">
    {#if !$authStore.user?.isPro}
        <div class="flex flex-col items-center justify-center py-20 text-center relative">
            <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"
                ></div>
            </div>

            <div
                class="relative z-10 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 mb-6 shadow-inner drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
                <Crown class="w-12 h-12 text-amber-400" />
                <div
                    class="absolute -bottom-2 -right-2 bg-black/60 p-1.5 rounded-full border border-white/10"
                >
                    <LockKeyhole class="w-4 h-4 text-slate-400" />
                </div>
            </div>

            <h2 class="text-2xl font-bold text-white mb-3">Acceso Exclusivo PRO</h2>
            <p class="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                El canal directo de feedback y sugerencias está reservado para miembros PRO.
                Actualiza tu cuenta para influir directamente en el desarrollo de la plataforma.
            </p>

            <a
                href="/pricing"
                class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-95"
            >
                <Crown class="w-4 h-4" />
                Hacerse PRO
            </a>
        </div>
    {:else}
        <!-- Formulario para usuarios PRO -->
        <div
            class="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 relative overflow-hidden"
        >
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            ></div>

            <div class="flex items-center gap-4 mb-8">
                <div class="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-inner">
                    <MessageSquare class="w-6 h-6 text-brand-400" />
                </div>
                <div>
                    <h2 class="text-xl font-bold text-white tracking-tight">
                        Envíanos tu Feedback
                    </h2>
                    <p class="text-sm text-slate-400 mt-1">
                        Tu opinión moldea el futuro de ChillChess.
                    </p>
                </div>
            </div>

            <form on:submit|preventDefault={handleSubmit} class="space-y-6">
                <!-- Selector de Tipo -->
                <div class="space-y-3">
                    <p class="block text-sm font-semibold text-slate-300 ml-1">¿De qué se trata?</p>
                    <div class="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            on:click={() => (feedbackType = 'suggestion')}
                            class="flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-[0.98] {feedbackType ===
                            'suggestion'
                                ? 'bg-brand-500/10 border-brand-500/50 shadow-[0_0_15px_rgba(var(--color-brand-500),0.15)] text-brand-100'
                                : 'bg-black/40 border-white/10 hover:bg-white/5 text-slate-400 hover:text-slate-200'}"
                        >
                            <Lightbulb
                                class="w-6 h-6 mb-2 {feedbackType === 'suggestion'
                                    ? 'text-brand-400'
                                    : 'opacity-60'}"
                            />
                            <span class="font-medium text-sm">Sugerencia</span>
                        </button>

                        <button
                            type="button"
                            on:click={() => (feedbackType = 'bug')}
                            class="flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-[0.98] {feedbackType ===
                            'bug'
                                ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)] text-red-100'
                                : 'bg-black/40 border-white/10 hover:bg-white/5 text-slate-400 hover:text-slate-200'}"
                        >
                            <Bug
                                class="w-6 h-6 mb-2 {feedbackType === 'bug'
                                    ? 'text-red-400'
                                    : 'opacity-60'}"
                            />
                            <span class="font-medium text-sm">Reportar Bug</span>
                        </button>
                    </div>
                </div>

                <!-- Mensaje -->
                <div class="space-y-3">
                    <label
                        for="feedbackMessage"
                        class="block text-sm font-semibold text-slate-300 ml-1"
                    >
                        Tu Mensaje
                        <span class="text-xs font-normal text-slate-500 ml-2"
                            >(Detalla qué añadirías o dónde está el error)</span
                        >
                    </label>
                    <textarea
                        id="feedbackMessage"
                        bind:value={message}
                        rows="5"
                        placeholder="Ej: Me gustaría que añadieran una calculadora de..."
                        class="w-full bg-black/40 border {feedbackType === 'bug'
                            ? 'focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                            : 'focus:border-brand-500/50 focus:shadow-[0_0_15px_rgba(var(--color-brand-500),0.1)]'} border-white/10 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none transition-all resize-none shadow-inner"
                    ></textarea>
                </div>

                <!-- Footer / Acción -->
                <div class="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        class="relative inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-bold text-sm uppercase tracking-wider rounded-xl transition-all hover:bg-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                    >
                        <div
                            class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"
                        ></div>
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
    {/if}
</div>
