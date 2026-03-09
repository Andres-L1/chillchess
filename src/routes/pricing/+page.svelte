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
    class="min-h-[100dvh] w-full bg-black flex flex-col items-center justify-center px-4 py-12 sm:px-6 relative overflow-x-hidden font-sans selection:bg-neat-accent/30"
>
    <!-- Back Button -->
    <div class="absolute top-8 left-8 z-50">
        <button
            on:click={() => goto('/landing')}
            class="group flex items-center gap-2.5 bg-white/5 backdrop-blur-3xl border border-white/10 text-slate-400 hover:text-white px-5 py-2.5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest hover:-translate-x-1 active:scale-95 shadow-inner"
        >
            <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            VOLVER
        </button>
    </div>

    <!-- Premium Background Effects -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
            class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-neat-accent/5 via-transparent to-transparent blur-3xl opacity-50"
        ></div>
        <div
            class="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-neat-accent/5 rounded-full blur-[120px] mix-blend-screen"
        ></div>
    </div>

    <div class="w-full max-w-2xl flex flex-col items-center z-10 relative px-4">
        <!-- Header -->
        <div class="text-center mb-24 mt-16 sm:mt-0">
            <h1
                class="text-[clamp(3.5rem,8vw,8rem)] font-black text-white tracking-tighter leading-[0.8] mb-12 uppercase italic"
            >
                IMPULSA TU <br /><span class="text-white/40">PRODUCTIVIDAD.</span>
            </h1>
            <p class="text-lg md:text-xl font-bold text-white/40 max-w-xl mx-auto leading-relaxed">
                Accede a todas las herramientas premium <br />
                <span class="text-white">SIN LÍMITES POR SOLO 1€ AL MES.</span>
            </p>
        </div>

        <!-- Pricing Card -->
        <div class="w-full group relative max-w-xl">
            <!-- Glow effect -->
            <div
                class="absolute -inset-10 bg-neat-accent/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition duration-1000 pointer-events-none"
            ></div>

            <div
                class="relative glass-card !p-12 md:!p-16 overflow-hidden transform transition-all"
            >
                <div class="absolute top-12 right-12">
                    <span
                        class="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md"
                    >
                        <Star class="w-3.5 h-3.5 fill-neat-accent text-neat-accent" />
                        PREMIUM
                    </span>
                </div>

                <div class="space-y-12">
                    <div>
                        <h3
                            class="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 italic"
                        >
                            Suscripción Mensual
                        </h3>
                        <div class="flex items-baseline gap-3">
                            <span
                                class="text-7xl md:text-8xl font-black text-white tracking-tighter italic"
                                >1€</span
                            >
                            <span
                                class="text-base font-black text-white/20 uppercase tracking-widest"
                                >/ Mes</span
                            >
                        </div>
                    </div>

                    <div class="h-px bg-white/5 w-full"></div>

                    <ul class="space-y-6">
                        {#each features as feature}
                            <li class="flex items-center gap-4 text-white">
                                <div
                                    class="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10"
                                >
                                    <Check class="w-3.5 h-3.5 text-neat-accent" />
                                </div>
                                <span
                                    class="text-xs font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors"
                                    >{feature}</span
                                >
                            </li>
                        {/each}
                    </ul>

                    <div class="pt-8">
                        {#if $authStore.loading}
                            <button disabled class="neat-button-secondary w-full opacity-50">
                                <Loader2 class="w-6 h-6 animate-spin" />
                            </button>
                        {:else if !$authStore.user}
                            <button
                                on:click={() => goto('/landing')}
                                class="neat-button-primary w-full"
                            >
                                <span>REGÍSTRATE PRIMERO</span>
                                <ArrowRight
                                    class="w-5 h-5 transition-transform group-hover:translate-x-1"
                                />
                            </button>
                        {:else if $authStore.user.isAdmin}
                            <div
                                class="w-full text-center p-6 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest mb-4"
                            >
                                ✓ CUENTA DE ADMINISTRADOR ACTIVA
                            </div>
                            <button
                                on:click={() => goto('/dashboard')}
                                class="neat-button-primary w-full"
                            >
                                IR A HERRAMIENTAS
                            </button>
                        {:else if $authStore.user.isPro}
                            <div
                                class="w-full text-center p-6 bg-neat-accent/10 border border-neat-accent/20 text-neat-accent rounded-3xl font-black text-[10px] uppercase tracking-widest flex justify-center items-center gap-3 backdrop-blur-sm mb-4"
                            >
                                <Check class="w-4 h-4" /> SUSCRIPCIÓN ACTIVA
                            </div>
                            <button
                                on:click={() => goto('/dashboard')}
                                class="neat-button-primary w-full"
                            >
                                VOLVER AL PANEL
                            </button>
                        {:else}
                            <button
                                on:click={handleSubscribe}
                                disabled={isCheckingOut}
                                class="neat-button-primary w-full shadow-[0_30px_60px_rgba(255,255,255,0.1)]"
                            >
                                <span>
                                    {#if isCheckingOut}
                                        PROCESANDO...
                                    {:else}
                                        SUSCRIBIRSE AHORA
                                    {/if}
                                </span>
                                {#if isCheckingOut}
                                    <Loader2 class="w-5 h-5 animate-spin" />
                                {:else}
                                    <ArrowRight class="w-5 h-5" />
                                {/if}
                            </button>
                        {/if}
                    </div>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 px-4">
                <div class="flex items-center gap-4">
                    <div class="flex -space-x-2">
                        {#each [1, 2, 3] as i}
                            <div
                                class="w-6 h-6 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center text-[8px] font-black text-white uppercase tracking-tighter"
                            >
                                U{i}
                            </div>
                        {/each}
                    </div>
                    <p class="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        +5k usuarios ya son <span class="text-white">PRO</span>
                    </p>
                </div>
                <p class="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">
                    Pagos cifrados vía <span class="text-slate-500 not-italic">stripe</span>
                </p>
            </div>
        </div>
    </div>
</div>
