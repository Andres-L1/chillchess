<script lang="ts">
    import { Check, Star, Loader2, ArrowLeft, ArrowRight } from 'lucide-svelte';
    import { authStore } from '$lib/stores/authStore';
    import { goto } from '$app/navigation';
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

<div class="min-h-[100dvh] bg-background-light dark:bg-background-dark flex flex-col items-center justify-center px-4 py-16 sm:px-6 relative">

    <!-- Back Button -->
    <div class="absolute top-6 left-6 z-10">
        <button
            on:click={() => goto('/landing')}
            class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border-4 border-black text-black dark:text-white font-black text-[10px] uppercase tracking-widest shadow-neo-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all group"
        >
            <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            VOLVER
        </button>
    </div>

    <div class="w-full max-w-2xl flex flex-col items-center gap-12">

        <!-- Header -->
        <div class="text-center space-y-6">
            <div class="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-white dark:bg-slate-800 shadow-neo-sm">
                <span class="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Plan Pro</span>
            </div>
            <h1
                class="text-[clamp(3rem,9vw,8rem)] font-black text-black dark:text-white tracking-tighter leading-[0.85] uppercase italic"
            >
                IMPULSA TU <br /><span class="text-primary">POTENCIAL.</span>
            </h1>
            <p class="text-xl font-bold text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-tight uppercase">
                Accede a todas las herramientas premium.<br/>
                <span class="text-black dark:text-white">Sin límites. Por solo 1€ al mes.</span>
            </p>
        </div>

        <!-- Pricing Card -->
        <div class="w-full bg-white dark:bg-slate-900 border-4 border-black shadow-neo relative overflow-hidden">

            <!-- Top accent strip -->
            <div class="h-2 bg-primary border-b-4 border-black"></div>

            <div class="p-10 md:p-14 space-y-10">
                <!-- Badge + Price -->
                <div class="flex items-start justify-between gap-4">
                    <div class="space-y-3">
                        <div class="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-primary text-white shadow-neo-sm">
                            <Star class="w-3.5 h-3.5 fill-white" />
                            <span class="text-[10px] font-black uppercase tracking-[0.2em]">PREMIUM</span>
                        </div>
                        <div class="flex items-baseline gap-2">
                            <span class="text-8xl md:text-9xl font-black text-black dark:text-white tracking-tighter italic leading-none">1€</span>
                            <span class="text-base font-black text-slate-500 uppercase tracking-widest">/mes</span>
                        </div>
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">SUSCRIPCIÓN MENSUAL — CANCELA CUANDO QUIERAS</p>
                    </div>
                    <div class="w-20 h-20 bg-black text-white border-4 border-black flex items-center justify-center shrink-0 shadow-neo transform -rotate-3">
                        <span class="text-2xl font-black italic">PRO</span>
                    </div>
                </div>

                <div class="h-1 w-full bg-black"></div>

                <!-- Features List -->
                <ul class="space-y-4">
                    {#each features as feature}
                        <li class="flex items-center gap-4">
                            <div class="w-6 h-6 bg-primary border-2 border-black flex items-center justify-center shrink-0 shadow-neo-sm">
                                <Check class="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                            <span class="text-xs font-black uppercase tracking-widest text-black dark:text-white">{feature}</span>
                        </li>
                    {/each}
                </ul>

                <div class="h-1 w-full bg-black/10 dark:bg-white/10"></div>

                <!-- CTA Button -->
                <div class="space-y-4">
                    {#if $authStore.loading}
                        <button disabled class="w-full py-6 border-4 border-black bg-slate-200 dark:bg-slate-700 text-slate-500 font-black flex items-center justify-center gap-3 opacity-50 cursor-not-allowed">
                            <Loader2 class="w-6 h-6 animate-spin" />
                        </button>
                    {:else if !$authStore.user}
                        <button
                            on:click={() => goto('/landing')}
                            class="w-full py-6 border-4 border-black bg-black text-white font-black uppercase tracking-widest text-lg shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4 italic group"
                        >
                            <span>REGÍSTRATE PRIMERO</span>
                            <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    {:else if $authStore.user.isAdmin}
                        <div class="w-full text-center p-5 border-4 border-black bg-black text-white font-black text-xs uppercase tracking-widest shadow-neo-sm">
                            ✓ CUENTA DE ADMINISTRADOR ACTIVA
                        </div>
                        <button
                            on:click={() => goto('/dashboard')}
                            class="w-full py-5 border-4 border-black bg-white dark:bg-slate-800 text-black dark:text-white font-black uppercase tracking-widest shadow-neo-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-3 italic"
                        >
                            IR A HERRAMIENTAS
                            <ArrowRight class="w-5 h-5" />
                        </button>
                    {:else if $authStore.user.isPro}
                        <div class="w-full text-center p-5 border-4 border-primary bg-primary/10 text-primary font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-neo-sm">
                            <Check class="w-4 h-4" />
                            SUSCRIPCIÓN ACTIVA — DISFRUTA EL ACCESO
                        </div>
                        <button
                            on:click={() => goto('/dashboard')}
                            class="w-full py-5 border-4 border-black bg-white dark:bg-slate-800 text-black dark:text-white font-black uppercase tracking-widest shadow-neo-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-3 italic"
                        >
                            VOLVER AL PANEL
                            <ArrowRight class="w-5 h-5" />
                        </button>
                    {:else}
                        <button
                            on:click={handleSubscribe}
                            disabled={isCheckingOut}
                            class="w-full py-6 border-4 border-black bg-primary text-white font-black uppercase tracking-widest text-lg shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4 disabled:opacity-60 disabled:cursor-not-allowed italic group"
                        >
                            {#if isCheckingOut}
                                <Loader2 class="w-6 h-6 animate-spin" />
                                <span>PROCESANDO...</span>
                            {:else}
                                <span>SUSCRIBIRSE AHORA</span>
                                <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            {/if}
                        </button>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Trust Footer -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6 w-full px-2">
            <div class="flex items-center gap-4">
                <div class="flex -space-x-2">
                    {#each [1, 2, 3] as i}
                        <div class="w-8 h-8 border-2 border-black bg-black text-white flex items-center justify-center text-[8px] font-black uppercase tracking-tighter shadow-neo-sm">
                            U{i}
                        </div>
                    {/each}
                </div>
                <p class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    +5k usuarios ya son <span class="text-black dark:text-white">PRO</span>
                </p>
            </div>
            <p class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
                Pagos cifrados vía <span class="text-slate-700 dark:text-slate-300 not-italic font-black">Stripe</span>
            </p>
        </div>

    </div>
</div>
