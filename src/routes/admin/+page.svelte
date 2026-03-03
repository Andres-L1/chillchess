<script lang="ts">
    import { authStore } from '$lib/stores/authStore';
    import { Users, Activity, Crown, CreditCard, ArrowLeft } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
    import { db } from '$lib/firebase';
    import { collection, onSnapshot, query } from 'firebase/firestore';

    let totalUsers = 0;
    let proUsers = 0;
    let unsubscribe: () => void;

    onMount(() => {
        // Fetch users stats from Firestore
        const usersRef = collection(db, 'users');
        const q = query(usersRef);

        unsubscribe = onSnapshot(q, (snapshot) => {
            totalUsers = snapshot.docs.length;
            proUsers = snapshot.docs.filter((doc) => doc.data().isPro === true).length;
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });
</script>

<svelte:head>
    <title>Admin Dashboard | ChillChess</title>
</svelte:head>

<div
    class="min-h-screen bg-slate-950 text-slate-200 selection:bg-brand-500/30 font-sans p-6 md:p-12"
>
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <header
            class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 border-b border-slate-800 pb-8"
        >
            <div>
                <button
                    on:click={() => goto('/freelance')}
                    class="flex items-center gap-2 text-slate-500 hover:text-brand-400 font-medium mb-4 group transition-colors"
                >
                    <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Volver a app
                </button>
                <h1 class="text-3xl md:text-4xl font-black text-white flex items-center gap-4">
                    <Crown class="w-8 h-8 text-amber-400" />
                    Panel de Control Admin
                </h1>
                <p class="text-slate-400 mt-2">Bienvenido, {$authStore.user?.email}</p>
            </div>
            <div
                class="bg-brand-500/10 border border-brand-500/20 text-brand-400 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-brand-500/10"
            >
                <Activity class="w-4 h-4" />
                Sistemas en línea
            </div>
        </header>

        <!-- Stats Grid -->
        <div class="grid md:grid-cols-3 gap-6 mb-12">
            <div
                class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center"
            >
                <div
                    class="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-4"
                >
                    <Users class="w-6 h-6" />
                </div>
                <h3 class="text-slate-400 font-medium mb-1">Usuarios Totales</h3>
                <span class="text-4xl font-black text-white">{totalUsers}</span>
            </div>

            <div
                class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden"
            >
                <div
                    class="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent"
                ></div>
                <div
                    class="w-12 h-12 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-full flex items-center justify-center mb-4 relative z-10"
                >
                    <Crown class="w-6 h-6" />
                </div>
                <h3 class="text-slate-400 font-medium mb-1 relative z-10">Usuarios Pro</h3>
                <span class="text-4xl font-black text-brand-400 relative z-10">{proUsers}</span>
            </div>

            <div
                class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center"
            >
                <div
                    class="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4"
                >
                    <CreditCard class="w-6 h-6" />
                </div>
                <h3 class="text-slate-400 font-medium mb-1">Pagos Procesados (Estimado)</h3>
                <span class="text-4xl font-black text-emerald-400">€{proUsers * 1}</span>
            </div>
        </div>

        <div
            class="w-full bg-slate-900/50 border border-slate-800/80 rounded-3xl p-8 backdrop-blur text-center"
        >
            <h2 class="text-xl font-bold text-white mb-4">Gestiona tu negocio</h2>
            <p class="text-slate-400 max-w-2xl mx-auto mb-8">
                Este panel es privado y solo accesible para root. En versiones futuras aquí podrás
                ver una tabla detallada de cada usuario, cancelar suscripciones o enviar avisos
                globales.
            </p>
            <div class="flex justify-center gap-4">
                <a
                    href="https://dashboard.stripe.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                    <CreditCard class="w-5 h-5" />
                    Abrir Dashboard de Stripe
                </a>
            </div>
        </div>
    </div>
</div>
