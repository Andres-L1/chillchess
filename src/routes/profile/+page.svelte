<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/authStore';
    import {
        User,
        Mail,
        Crown,
        ShieldAlert,
        CreditCard,
        ExternalLink,
        LogOut,
        Settings,
        Camera,
        RefreshCw,
    } from 'lucide-svelte';
    import { auth } from '$lib/firebase';
    import { signOut, updateProfile } from 'firebase/auth';
    import { goto } from '$app/navigation';
    import { addToast } from '$lib/stores/toasts';

    onMount(() => {
        pageHeader.set({
            title: 'GESTOR DE PERFIL',
            description: 'Configuración de cuenta, suscripción y preferencias de usuario.',
            category: 'SISTEMA',
        });
    });

    let isUpdatingName = false;
    let newDisplayName = '';

    $: {
        if ($authStore.user && newDisplayName === '') {
            newDisplayName = $authStore.user.displayName || '';
        }
    }

    async function handleLogout() {
        try {
            await signOut(auth);
            goto('/landing');
        } catch (e) {
            console.error('Logout error:', e);
            addToast('Error al cerrar sesión', 'error');
        }
    }

    async function handleSaveName() {
        if (!auth.currentUser) return;
        isUpdatingName = true;
        try {
            await updateProfile(auth.currentUser, {
                displayName: newDisplayName,
            });
            addToast('Nombre actualizado correctamente', 'success');
        } catch (error) {
            console.error('Update name error:', error);
            addToast('Error al actualizar el nombre', 'error');
        } finally {
            isUpdatingName = false;
        }
    }

    async function handleManagePayments() {
        if (!$authStore.user) return;
        try {
            // First, we need the Stripe customer ID from Firestore
            // For now, redirect to pricing if no subscription info available
            addToast('Redirigiendo al portal de pagos...', 'info');
            // Try to open portal session via API
            const res = await fetch('/api/stripe/create-portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: $authStore.user.uid }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                // Fallback to pricing page
                goto('/pricing');
            }
        } catch {
            addToast('No se pudo abrir el portal de pagos. Contacta al soporte.', 'error');
        }
    }

    $: initials = (() => {
        if (!$authStore.user) return 'U';
        if ($authStore.user.displayName)
            return $authStore.user.displayName.substring(0, 2).toUpperCase();
        if ($authStore.user.email) return $authStore.user.email.substring(0, 2).toUpperCase();
        return 'U';
    })();
</script>

<svelte:head>
    <title>Mi Perfil | ChillChess</title>
    <meta
        name="description"
        content="Gestiona tu cuenta, nombres, facturación y preferencias en ChillChess."
    />
</svelte:head>

<div class="space-y-8">
    <!-- User summary top card -->
    <div
        class="bg-white dark:bg-slate-900 border-4 border-black p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden group shadow-neo"
    >
        <div
            class="absolute top-0 right-0 w-64 h-64 bg-neat-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-50 -z-10 translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000"
        ></div>

        <div class="relative shrink-0">
            <div
                class="w-24 h-24 md:w-28 md:h-28 rounded-none bg-slate-900 border-4 border-black text-white flex items-center justify-center font-black text-3xl md:text-5xl shadow-neo-sm relative overflow-hidden"
            >
                <div
                    class="absolute inset-0 bg-gradient-to-br from-neat-accent/20 to-transparent opacity-50"
                ></div>
                <span class="relative z-10">{initials}</span>
            </div>
            {#if $authStore.user?.isAdmin || $authStore.user?.isPro}
                <div
                    class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 border-4 border-slate-800 flex items-center justify-center text-amber-900 shadow-lg"
                >
                    <Crown class="w-4 h-4" />
                </div>
            {/if}
        </div>

        <div class="flex-1 text-center md:text-left">
            <h2
                class="text-2xl font-black text-black dark:text-white mb-1 uppercase tracking-tighter italic"
            >
                {$authStore.user?.displayName || 'USUARIO DE CHILLCHESS'} /
            </h2>
            <div
                class="flex items-center justify-center md:justify-start gap-2 text-slate-400 text-sm mb-4"
            >
                <Mail class="w-4 h-4" />
                <span>{$authStore.user?.email || 'Sin correo asociado'}</span>
            </div>

            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {#if $authStore.user?.isAdmin}
                    <div
                        class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 text-amber-400 rounded-lg text-xs font-bold border border-amber-400/20"
                    >
                        <ShieldAlert class="w-3.5 h-3.5" />
                        ADMINISTRADOR DEL SISTEMA
                    </div>
                {:else if $authStore.user?.isPro}
                    <div
                        class="inline-flex items-center gap-1.5 px-3 py-1 bg-neat-accent/10 text-neat-accent rounded-lg text-[10px] font-black uppercase tracking-wider border border-neat-accent/20"
                    >
                        <Crown class="w-3.5 h-3.5" />
                        SUSCRIPCIÓN PRO ACTIVA
                    </div>
                {:else}
                    <div
                        class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-xs font-bold border border-slate-600/50"
                    >
                        <User class="w-3.5 h-3.5" />
                        CUENTA BÁSICA
                    </div>
                {/if}
            </div>
        </div>

        <div class="shrink-0 w-full md:w-auto mt-4 md:mt-0">
            <button
                on:click={handleLogout}
                class="w-full md:w-auto px-6 py-4 bg-white dark:bg-slate-900 border-4 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 shadow-neo-sm font-black uppercase text-xs tracking-[0.2em]"
            >
                <LogOut class="w-5 h-5 text-red-500" />
                CERRAR SESIÓN /
            </button>
        </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
        <!-- Account Settings Form -->
        <div class="bg-white dark:bg-slate-900 border-4 border-black p-6 md:p-8 shadow-neo">
            <div class="flex items-center justify-between mb-10">
                <h3
                    class="text-xl font-black text-black dark:text-white flex items-center gap-3 uppercase tracking-tighter italic"
                >
                    <Settings class="w-6 h-6 text-primary" />
                    IDENTIDAD DE USUARIO /
                </h3>
            </div>

            <div class="space-y-6">
                <div>
                    <label
                        for="display-name"
                        class="block text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest ml-1"
                        >NOMBRE PÚBLICO</label
                    >
                    <div class="flex items-center gap-3">
                        <input
                            id="display-name"
                            type="text"
                            bind:value={newDisplayName}
                            placeholder="Ej. Juan Pérez"
                            class="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-neat-accent/50 transition-all font-black text-white placeholder:text-slate-700 tracking-tight"
                        />
                        <button
                            on:click={handleSaveName}
                            disabled={isUpdatingName ||
                                newDisplayName === $authStore.user?.displayName}
                            class="px-8 py-4 bg-primary text-white border-4 border-black hover:bg-black transition-all h-[58px] whitespace-nowrap uppercase text-xs font-black tracking-widest shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                            {#if isUpdatingName}
                                <RefreshCw class="w-5 h-5 animate-spin mx-auto" />
                            {:else}
                                ACTUALIZAR
                            {/if}
                        </button>
                    </div>
                </div>

                <div>
                    <label
                        for="email"
                        class="block text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest ml-1"
                        >DIRECCIÓN DE CORREO</label
                    >
                    <input
                        id="email"
                        type="email"
                        value={$authStore.user?.email}
                        disabled
                        class="w-full bg-slate-900/30 border border-slate-700/30 rounded-xl px-4 py-3 text-slate-500 font-medium cursor-not-allowed"
                    />
                    <p class="text-[10px] text-slate-500 mt-4 uppercase tracking-tight">
                        EL CORREO ELECTRÓNICO NO PUEDE SER MODIFICADO DIRECTAMENTE.
                    </p>
                </div>
            </div>
        </div>

        <!-- Plan and Security -->
        <div class="space-y-8">
            <div class="glass-card p-6 md:p-8">
                <h3
                    class="text-xl font-black text-white flex items-center gap-3 mb-10 uppercase tracking-tighter"
                >
                    <CreditCard class="w-6 h-6 text-neat-accent" />
                    ESTADO DE FACTURACIÓN
                </h3>

                {#if $authStore.user?.isAdmin}
                    <div
                        class="p-4 bg-amber-400/10 rounded-xl border border-amber-400/20 text-amber-300 mb-6"
                    >
                        <h4
                            class="font-black mb-1 flex items-center gap-2 uppercase text-xs tracking-wider"
                        >
                            <ShieldAlert class="w-4 h-4" /> ADMIN BYPASS
                        </h4>
                        <p class="text-[11px] font-bold opacity-70 tracking-tight">
                            Tu cuenta tiene acceso sin restricciones a todo el sistema.
                        </p>
                    </div>
                {:else if $authStore.user?.isPro}
                    <div
                        class="p-5 bg-neat-accent/5 rounded-2xl border border-neat-accent/10 text-neat-accent mb-8"
                    >
                        <h4
                            class="font-black mb-2 flex items-center gap-2 uppercase text-xs tracking-wider"
                        >
                            <Crown class="w-4 h-4 text-neat-accent" /> SUSCRIPCIÓN PRO ACTIVA
                        </h4>
                        <p class="text-[11px] font-bold opacity-70 tracking-tight">
                            Acceso ilimitado a todas las herramientas de la suite creativa.
                        </p>
                    </div>
                {:else}
                    <div
                        class="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 text-slate-400 mb-6"
                    >
                        <h4 class="font-black text-slate-300 mb-2 uppercase text-xs tracking-wider">
                            ESTADO: GRATUITO
                        </h4>
                        <p class="text-[11px] font-bold opacity-70 tracking-tight">
                            Actualiza para desbloquear el potencial completo de la suite.
                        </p>
                    </div>
                {/if}

                <div class="flex flex-col sm:flex-row gap-3">
                    {#if !$authStore.user?.isPro && !$authStore.user?.isAdmin}
                        <button
                            on:click={() => goto('/pricing')}
                            class="flex-1 bg-neat-accent hover:bg-white text-black font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
                        >
                            <Crown class="w-4 h-4" />
                            ADQUIRIR PLAN PRO
                        </button>
                    {/if}
                    <button
                        on:click={handleManagePayments}
                        class="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        title="Ir al portal del cliente en Stripe"
                    >
                        GESTIONAR PAGOS
                        <ExternalLink class="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
