<script lang="ts">
    import { Check, Star, Loader2, ArrowLeft, ArrowRight } from 'lucide-svelte';
    import { authStore } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { addToast } from '$lib/stores/toasts';

    let isCheckingOut = false;

    async function handleSubscribe() {
        if (!$authStore.user) {
            goto('/landing');
            return;
        }

        isCheckingOut = true;
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: $authStore.user.uid }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No URL returned from Stripe');
            }
        } catch (error) {
            console.error(error);
            addToast('Error al iniciar la suscripción. Intenta de nuevo.', 'error');
            isCheckingOut = false;
        }
    }

    const features = [
        'Dashboard todo en uno',
        'Generador de Facturas Ilimitado',
        'Calculadora Freelance Avanzada',
        'Pomodoro Timer Personalizable',
        'Generador de VCard QR',
        'Gestor de Tareas Kanban',
        'Sin anuncios publicitarios',
        'Soporte prioritario 24/7',
    ];
</script>

<svelte:head>
    <title>Planes y Precios | MultiTool</title>
    <meta
        name="description"
        content="Desbloquea todo tu potencial con el Plan Pro de MultiTool. Accede a todas las herramientas premium por solo 1€/mes."
    />
</svelte:head>

<div
    class="min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center p-4 xl:p-0 relative overflow-x-hidden font-sans selection:bg-brand-500/30"
>
    <!-- Back Button -->
    <div class="absolute top-6 left-6 z-50">
        <button
            on:click={() => goto('/landing')}
            class="flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-700/50 shadow-sm text-slate-300 hover:text-brand-400 px-4 py-2 rounded-xl transition-all font-medium hover:-translate-y-0.5"
        >
            <ArrowLeft class="w-4 h-4" />
            Volver
        </button>
    </div>

    <!-- Premium Background Effects -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
            class="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-gradient-to-b from-brand-900/40 via-brand-800/10 to-transparent blur-3xl opacity-60"
        ></div>
        <div
            class="absolute top-20 right-[5%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"
        ></div>
        <div
            class="absolute bottom-20 left-[10%] w-[500px] h-[500px] bg-brand-500/15 rounded-full blur-[120px] mix-blend-screen"
        ></div>
    </div>

    <div
        class="w-full max-w-5xl mx-auto flex flex-col items-center z-10 relative mt-24 sm:mt-20 md:mt-12 mb-12"
    >
        <!-- Header -->
        <div class="text-center mb-12 sm:mb-16 px-4">
            <h1
                class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight leading-tight drop-shadow-sm mb-6"
            >
                Desbloquea Todo tu Potencial
            </h1>
            <p class="text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Elige el plan PRO y accede a todas nuestras herramientas premium diseñadas para
                potenciar tu productividad y organizar tu trabajo.
            </p>
        </div>

        <!-- Pricing Card -->
        <div class="w-full max-w-lg group relative px-4 sm:px-0">
            <div
                class="absolute -inset-1 bg-gradient-to-r from-brand-600 to-indigo-600 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"
            ></div>
            <div
                class="relative bg-slate-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-700/50 overflow-hidden transform transition-all group-hover:border-slate-600 p-8 sm:p-10"
            >
                <!-- Most Popular Badge -->
                <div
                    class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600"
                ></div>

                <div class="absolute top-6 right-6">
                    <span
                        class="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(14,165,233,0.2)]"
                    >
                        <Star class="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
                        Premium
                    </span>
                </div>

                <div>
                    <h3 class="text-2xl font-bold text-white mb-2">Plan Pro Mensual</h3>
                    <p class="text-slate-400 text-sm mb-6 pb-6 border-b border-slate-800">
                        Todo lo que necesitas para tu día a día.
                    </p>

                    <div class="flex items-baseline mb-8">
                        <span class="text-5xl font-black text-white tracking-tight">1€</span>
                        <span class="text-xl text-slate-500 font-medium ml-2">/mes</span>
                    </div>

                    <ul class="space-y-4 mb-8">
                        {#each features as feature}
                            <li class="flex items-center gap-3 text-slate-300">
                                <div
                                    class="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 border border-brand-500/30"
                                >
                                    <Check class="w-3.5 h-3.5 text-brand-400" />
                                </div>
                                <span class="font-medium text-sm sm:text-base">{feature}</span>
                            </li>
                        {/each}
                    </ul>

                    {#if $authStore.loading}
                        <button
                            disabled
                            class="w-full bg-slate-800 text-slate-500 font-bold py-4 rounded-xl flex justify-center border border-slate-700/50"
                        >
                            <Loader2 class="w-6 h-6 animate-spin" />
                        </button>
                    {:else if !$authStore.user}
                        <button
                            on:click={() => goto('/landing')}
                            class="w-full relative overflow-hidden bg-white hover:bg-slate-100 text-slate-950 rounded-xl py-4 px-6 flex items-center justify-between font-bold transition-all disabled:opacity-70 focus:outline-none group/btn shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                        >
                            <span class="relative z-10 text-lg">Regístrate Primero</span>
                            <ArrowRight
                                class="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform"
                            />
                        </button>
                    {:else if $authStore.user.isAdmin}
                        <div
                            class="w-full text-center p-4 bg-brand-500/10 border border-brand-500/30 text-brand-400 rounded-xl font-medium"
                        >
                            ✓ Eres Administrador. Ya tienes acceso total.
                        </div>
                        <button
                            on:click={() => goto('/freelance')}
                            class="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 px-6 shadow-[0_0_20px_rgba(14,165,233,0.2)] rounded-xl transition-all mt-4 text-center block"
                        >
                            Ir a mis Herramientas
                        </button>
                    {:else if $authStore.user.isPro}
                        <div
                            class="w-full text-center p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-medium flex justify-center items-center gap-2"
                        >
                            <Check class="w-5 h-5" /> Tu suscripción está activa.
                        </div>
                        <button
                            on:click={() => goto('/freelance')}
                            class="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 px-6 shadow-[0_0_20px_rgba(14,165,233,0.2)] rounded-xl transition-all mt-4 text-center block"
                        >
                            Ir a mis Herramientas
                        </button>
                    {:else}
                        <button
                            on:click={handleSubscribe}
                            disabled={isCheckingOut}
                            class="w-full relative overflow-hidden bg-brand-600 hover:bg-brand-500 text-white rounded-xl py-4 px-6 flex items-center justify-between font-bold transition-all disabled:opacity-70 focus:outline-none group/btn shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] border border-brand-500/50"
                        >
                            <span class="relative z-10 text-lg">
                                {#if isCheckingOut}
                                    Procesando pago...
                                {:else}
                                    Suscribirse Ahora
                                {/if}
                            </span>
                            {#if isCheckingOut}
                                <Loader2 class="w-5 h-5 relative z-10 animate-spin" />
                            {:else}
                                <ArrowRight
                                    class="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform"
                                />
                            {/if}
                        </button>
                    {/if}
                </div>
            </div>

            <p class="text-center text-slate-500 text-sm mt-8 opacity-80">
                Pagos seguros y cifrados procesados por <span class="font-semibold text-slate-400"
                    >Stripe</span
                >. Cancela cuando quieras.
            </p>
        </div>
    </div>
</div>
