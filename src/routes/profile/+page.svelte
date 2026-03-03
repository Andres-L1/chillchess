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
    import toast from 'svelte-french-toast';

    onMount(() => {
        pageHeader.set({
            title: 'Mi Perfil',
            description: 'Gestiona tu cuenta, facturación y preferencias',
            category: 'Ajustes',
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
            toast.error('Error al cerrar sesión');
        }
    }

    async function handleSaveName() {
        if (!auth.currentUser) return;
        isUpdatingName = true;
        try {
            await updateProfile(auth.currentUser, {
                displayName: newDisplayName,
            });
            if ($authStore.user) {
                $authStore.user.displayName = newDisplayName;
            }
            toast.success('Nombre actualizado correctamente');
        } catch (error) {
            console.error('Update name error:', error);
            toast.error('Error al actualizar el nombre');
        } finally {
            isUpdatingName = false;
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
    <title>Mi Perfil | MultiTool</title>
    <meta
        name="description"
        content="Gestiona tu cuenta, nombres, facturación y preferencias en MultiTool."
    />
</svelte:head>

<div class="space-y-8">
    <!-- User summary top card -->
    <div
        class="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-black/10 border border-slate-700/50 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden"
    >
        <div
            class="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/2 -translate-y-1/2"
        ></div>

        <div class="relative shrink-0">
            <div
                class="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-bold text-3xl md:text-4xl shadow-xl ring-4 ring-slate-800"
            >
                {initials}
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
            <h2 class="text-2xl font-black text-white mb-1">
                {$authStore.user?.displayName || 'Usuario de MultiTool'}
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
                        Acceso Root Admin
                    </div>
                {:else if $authStore.user?.isPro}
                    <div
                        class="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-400 rounded-lg text-xs font-bold border border-brand-500/20"
                    >
                        <Crown class="w-3.5 h-3.5" />
                        Suscripción Pro Activa
                    </div>
                {:else}
                    <div
                        class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-xs font-bold border border-slate-600/50"
                    >
                        <User class="w-3.5 h-3.5" />
                        Cuenta Básica Gratis
                    </div>
                {/if}
            </div>
        </div>

        <div class="shrink-0 w-full md:w-auto mt-4 md:mt-0">
            <button
                on:click={handleLogout}
                class="w-full md:w-auto px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-red-500/20"
            >
                <LogOut class="w-5 h-5" />
                Cerrar Sesión
            </button>
        </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
        <!-- Account Settings Form -->
        <div
            class="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-black/10 border border-slate-700/50"
        >
            <div class="flex items-center justify-between mb-8">
                <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <Settings class="w-5 h-5 text-brand-400" />
                    Datos Personales
                </h3>
            </div>

            <div class="space-y-6">
                <div>
                    <label for="display-name" class="block text-sm font-bold text-slate-300 mb-2"
                        >Nombre Público</label
                    >
                    <div class="flex items-center gap-3">
                        <input
                            id="display-name"
                            type="text"
                            bind:value={newDisplayName}
                            placeholder="Ej. Juan Pérez"
                            class="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium text-white placeholder:text-slate-600"
                        />
                        <button
                            on:click={handleSaveName}
                            disabled={isUpdatingName ||
                                newDisplayName === $authStore.user?.displayName}
                            class="px-6 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all h-[50px] whitespace-nowrap"
                        >
                            {#if isUpdatingName}
                                <RefreshCw class="w-5 h-5 animate-spin mx-auto" />
                            {:else}
                                Guardar
                            {/if}
                        </button>
                    </div>
                </div>

                <div>
                    <label for="email" class="block text-sm font-bold text-slate-300 mb-2"
                        >Correo Electrónico</label
                    >
                    <input
                        id="email"
                        type="email"
                        value={$authStore.user?.email}
                        disabled
                        class="w-full bg-slate-900/30 border border-slate-700/30 rounded-xl px-4 py-3 text-slate-500 font-medium cursor-not-allowed"
                    />
                    <p class="text-xs text-slate-500 mt-2">
                        No es posible cambiar tu correo directamente por motivos de seguridad.
                    </p>
                </div>
            </div>
        </div>

        <!-- Plan and Security -->
        <div class="space-y-8">
            <div
                class="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-black/10 border border-slate-700/50"
            >
                <h3 class="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    <CreditCard class="w-5 h-5 text-emerald-400" />
                    Facturación y Suscripción
                </h3>

                {#if $authStore.user?.isAdmin}
                    <div
                        class="p-4 bg-amber-400/10 rounded-xl border border-amber-400/20 text-amber-300 mb-6"
                    >
                        <h4 class="font-bold mb-1 flex items-center gap-2">
                            <ShieldAlert class="w-4 h-4" /> Admin Bypass
                        </h4>
                        <p class="text-sm opacity-90">
                            Tu cuenta tiene pase libre a todo el sistema. No necesitas pagar nada.
                        </p>
                    </div>
                {:else if $authStore.user?.isPro}
                    <div
                        class="p-4 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-300 mb-6"
                    >
                        <h4 class="font-bold mb-1 flex items-center gap-2">
                            <Crown class="w-4 h-4" /> Plan Pro Activo
                        </h4>
                        <p class="text-sm opacity-90">
                            Cuentas con acceso ilimitado a todas las herramientas de la suite.
                        </p>
                    </div>
                {:else}
                    <div
                        class="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 text-slate-400 mb-6"
                    >
                        <h4 class="font-bold text-slate-300 mb-1">Sin Suscripción</h4>
                        <p class="text-sm opacity-90">
                            Actualmente no puedes acceder a la suite completa de herramientas.
                        </p>
                    </div>
                {/if}

                <div class="flex flex-col sm:flex-row gap-3">
                    {#if !$authStore.user?.isPro && !$authStore.user?.isAdmin}
                        <button
                            on:click={() => goto('/pricing')}
                            class="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
                        >
                            <Crown class="w-4 h-4" />
                            Mejorar Plan a PRO
                        </button>
                    {/if}
                    <a
                        href="https://billing.stripe.com/p/login/test_123"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        title="Ir al portal del cliente en Stripe"
                    >
                        Gestionar Pagos
                        <ExternalLink class="w-4 h-4 text-slate-500" />
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
