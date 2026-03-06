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
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: 'pro',
                    interval: 'monthly',
                    userId: $authStore.user.uid,
                    userEmail: $authStore.user.email,
                }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'No URL returned from Stripe');
            }
        } catch (error) {
            console.error(error);
            addToast('Error al iniciar la suscripción. Intenta de nuevo.', 'error');
            isCheckingOut = false;
        }
    }

    const features = [
        'Calculadora Freelance Avanzada',
        'Generador de Facturas PDF',
        'Generador de Claves Seguras',
        'Pomodoro Timer Personalizable',
        'Generador de VCard y QR',
        'Tablero Kanban de Tareas',
        'Conversor de Divisas en Tiempo Real',
        'Calculadora de Propinas',
        'Sin anuncios publicitarios',
    ];
</script>

<svelte:head>
    <title>Planes y Precios | ChillChess</title>
    <meta
        name="description"
        content="Desbloquea todo tu potencial con el Plan Pro de ChillChess. Accede a todas las herramientas premium por solo 1€/mes."
    />
</svelte:head>

<div
    class="min-h-[100dvh] w-full bg-black flex flex-col items-center justify-center px-4 py-8 sm:px-6 relative overflow-x-hidden font-sans selection:bg-white/20"
>
    <!-- Back Button -->
    <div class="absolute top-6 left-6 z-50">
        <button
            on:click={() => goto('/landing')}
            class="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 shadow-sm text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all font-medium hover:-translate-y-0.5"
        >
            <ArrowLeft class="w-4 h-4" />
            Volver
        </button>
    </div>

    <!-- Premium Background Effects -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
            class="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-gradient-to-b from-slate-800/20 via-black to-transparent blur-3xl opacity-50"
        ></div>
        <div
            class="absolute top-20 right-[5%] w-[400px] h-[400px] bg-slate-800/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"
        ></div>
        <div
            class="absolute bottom-20 left-[10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] mix-blend-screen"
        ></div>
    </div>

    <div class="w-full max-w-lg flex flex-col items-center z-10 relative">
        <!-- Header -->
        <div class="text-center mb-6 sm:mb-8 mt-12 sm:mt-0">
            <h1
                class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight leading-tight drop-shadow-sm mb-3 sm:mb-5"
            >
                Desbloquea Todo tu Potencial
            </h1>
            <p class="text-base sm:text-lg text-slate-400 font-medium leading-relaxed">
                Accede a todas nuestras herramientas premium por solo 1€ al mes.
            </p>
        </div>

        <!-- Pricing Card -->
        <div class="w-full group relative">
            <div
                class="absolute -inset-1 bg-white/10 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-500"
            ></div>
            <div
                class="relative bg-black/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden transform transition-all group-hover:border-white/20 p-6 md:p-8"
            >
                <div class="absolute top-6 right-6">
                    <span
                        class="inline-flex items-center gap-1.5 bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm"
                    >
                        <Star class="w-3.5 h-3.5 text-white" />
                        Premium
                    </span>
                </div>

                <div>
                    <h3 class="text-2xl font-bold text-white mb-1.5">Plan Pro Mensual</h3>
                    <p class="text-slate-400 text-sm mb-4 pb-4 border-b border-white/10">
                        Todo lo que necesitas para tu día a día.
                    </p>

                    <div class="flex items-baseline mb-6">
                        <span class="text-5xl font-light text-white tracking-tight">1€</span>
                        <span class="text-xl text-slate-500 font-medium ml-2">/mes</span>
                    </div>

                    <ul class="space-y-3 mb-6">
                        {#each features as feature}
                            <li class="flex items-center gap-3 text-slate-300">
                                <div
                                    class="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10"
                                >
                                    <Check class="w-3 h-3 text-slate-300" />
                                </div>
                                <span class="font-light text-sm">{feature}</span>
                            </li>
                        {/each}
                    </ul>

                    {#if $authStore.loading}
                        <button
                            disabled
                            class="w-full bg-white/5 text-slate-500 font-bold py-4 rounded-xl flex justify-center border border-white/10"
                        >
                            <Loader2 class="w-6 h-6 animate-spin" />
                        </button>
                    {:else if !$authStore.user}
                        <button
                            on:click={() => goto('/landing')}
                            class="w-full relative overflow-hidden bg-white hover:bg-slate-100 text-black rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-medium transition-all disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-white/20 group/btn"
                        >
                            <span class="relative z-10 text-lg">Regístrate Primero</span>
                            <ArrowRight
                                class="w-5 h-5 relative z-10 opacity-0 -ml-5 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all delay-75"
                            />
                        </button>
                    {:else if $authStore.user.isAdmin}
                        <div
                            class="w-full text-center p-4 bg-white/5 border border-white/10 text-white rounded-xl font-medium backdrop-blur-sm"
                        >
                            ✓ Eres Administrador. Ya tienes acceso total.
                        </div>
                        <button
                            on:click={() => goto('/dashboard')}
                            class="w-full bg-white hover:bg-slate-100 text-black font-medium py-4 px-6 rounded-xl transition-all mt-4 text-center block"
                        >
                            Ir a mis Herramientas
                        </button>
                    {:else if $authStore.user.isPro}
                        <div
                            class="w-full text-center p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-medium flex justify-center items-center gap-2 backdrop-blur-sm shadow-inner"
                        >
                            <Check class="w-5 h-5" /> Tu suscripción está activa.
                        </div>
                        <button
                            on:click={() => goto('/dashboard')}
                            class="w-full bg-white hover:bg-slate-100 text-black font-medium py-4 px-6 rounded-xl transition-all mt-4 text-center block"
                        >
                            Ir a mis Herramientas
                        </button>
                    {:else}
                        <button
                            on:click={handleSubscribe}
                            disabled={isCheckingOut}
                            class="w-full relative overflow-hidden bg-white hover:bg-slate-100 text-black rounded-xl py-4 flex items-center justify-center gap-3 font-medium transition-all disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-white/20 group/btn"
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
                                    class="w-5 h-5 relative z-10 opacity-0 -ml-5 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all delay-75"
                                />
                            {/if}
                        </button>
                    {/if}
                </div>
            </div>

            <p class="text-center text-slate-500 text-xs mt-6 opacity-80">
                Pagos seguros y cifrados procesados por <span class="font-semibold text-slate-400"
                    >Stripe</span
                >. Cancela cuando quieras.
            </p>
        </div>
    </div>
</div>
