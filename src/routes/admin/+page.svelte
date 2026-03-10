<script lang="ts">
    import { authStore } from '$lib/stores/authStore';
    import {
        Users,
        Activity,
        Crown,
        CreditCard,
        Search,
        ShieldAlert,
        Trash2,
        Sparkles,
        ChevronLeft,
        ChevronRight,
        TrendingUp,
        UserX,
        Download,
        Copy,
        Check,
        Zap,
        Clock,
        Filter,
        X,
        MoreVertical,
        ExternalLink,
        CalendarDays,
        Activity as ActivityIcon,
        Settings,
        Bell,
        MessageSquare,
    } from 'lucide-svelte';
    import { onMount, onDestroy } from 'svelte';
    import { db } from '$lib/firebase';
    import {
        collection,
        onSnapshot,
        query,
        doc,
        updateDoc,
        deleteDoc,
        addDoc,
        setDoc,
        serverTimestamp,
        orderBy,
        limit,
        getDocs,
    } from 'firebase/firestore';
    import { addToast } from '$lib/stores/toasts';
    import { currencyStore } from '$lib/stores/currencyStore';

    // --- State ---
    let totalUsers = 0;
    let proUsers = 0;
    let freeUsers = 0;
    let newUsersThisWeek = 0;
    let itemsPerPage = 10;
    let currentPage = 1;
    let usersList: any[] = [];
    let activityFeed: any[] = [];
    let searchQuery = '';
    let statusFilter: 'all' | 'pro' | 'free' | 'admin' = 'all';
    let feedFilter: 'all' | 'PRO_GRANTED' | 'USER_DELETED' = 'all';
    let sortBy: string = 'email';
    let copiedId: string | null = null;
    let unsubscribeUsers: () => void;
    let unsubscribeLogs: () => void;
    let proPrice = 1;

    // New State for Advanced Features
    let selectedUsers: Set<string> = new Set();
    let selectedUserForModal: any = null;
    let sparklineData: number[] = [0, 0, 0, 0, 0, 0, 0];

    // Global Settings State
    let maintenanceMode = false;
    let globalMessageActive = false;
    let globalMessageText = '';
    let unsubscribeSettings: () => void;

    // --- Derived ---
    $: conversionRate = totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0;
    $: estimatedMRR = proUsers * proPrice;

    $: filteredUsers = usersList
        .filter((u) => {
            const matchesSearch =
                (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.id || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter =
                statusFilter === 'all' ||
                (statusFilter === 'pro' && u.isPro) ||
                (statusFilter === 'free' && !u.isPro && !u.isAdmin) ||
                (statusFilter === 'admin' && u.isAdmin);
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            const s = sortBy;
            if (s === 'status') {
                if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
                if (a.isPro !== b.isPro) return a.isPro ? -1 : 1;
                return 0;
            }
            if (s === 'joined') {
                const ta = a.createdAt?.toMillis?.() || 0;
                const tb = b.createdAt?.toMillis?.() || 0;
                return tb - ta;
            }
            return (a.email || '').localeCompare(b.email || '');
        });

    $: totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
    $: paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    $: if (searchQuery || statusFilter) currentPage = 1;

    $: filteredActivityFeed = activityFeed.filter((log) => {
        if (feedFilter === 'all') return true;
        return log.action === feedFilter;
    });

    $: allSelected =
        paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUsers.has(u.id));
    $: someSelected = selectedUsers.size > 0;

    // --- Helpers ---
    function relativeTime(ts: any): string {
        if (!ts) return 'Desconocido';
        const ms = ts?.toMillis ? ts.toMillis() : new Date(ts).getTime();
        const diff = Date.now() - ms;
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'Ahora mismo';
        if (m < 60) return `hace ${m}m`;
        const h = Math.floor(m / 60);
        if (h < 24) return `hace ${h}h`;
        const d = Math.floor(h / 24);
        if (d < 30) return `hace ${d}d`;
        return `hace ${Math.floor(d / 30)}mes`;
    }

    function formatDate(ts: any): string {
        if (!ts) return 'Desconocido';
        const date = new Date(ts?.toMillis ? ts.toMillis() : ts);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    async function logAction(action: string, targetEmail: string, targetId: string) {
        try {
            await addDoc(collection(db, 'adminLogs'), {
                action,
                adminEmail: $authStore.user?.email || 'admin',
                targetEmail,
                targetId,
                timestamp: serverTimestamp(),
            });
        } catch (e) {
            console.warn('Could not write adminLog:', e);
        }
    }

    // --- Actions ---
    async function toggleUserPro(user: any) {
        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, { isPro: !user.isPro });
            await logAction(user.isPro ? 'PRO_REMOVED' : 'PRO_GRANTED', user.email, user.id);
            addToast(`Pro ${!user.isPro ? 'activado' : 'quitado'} para ${user.email}`, 'success');
            if (selectedUserForModal && selectedUserForModal.id === user.id) {
                selectedUserForModal.isPro = !user.isPro;
            }
        } catch (e) {
            addToast('Error al actualizar usuario', 'error');
        }
    }

    async function handleDeleteUser(user: any) {
        if (!confirm(`¿Eliminar a ${user.email}? Esta acción no se puede deshacer.`)) return;
        try {
            await deleteDoc(doc(db, 'users', user.id));
            await logAction('USER_DELETED', user.email, user.id);
            addToast('Usuario eliminado', 'success');
            if (selectedUserForModal && selectedUserForModal.id === user.id) {
                selectedUserForModal = null;
            }
            selectedUsers.delete(user.id);
            selectedUsers = selectedUsers;
        } catch (e) {
            addToast('Error al eliminar usuario', 'error');
        }
    }

    async function updateGlobalSettings(field: string, value: any) {
        try {
            const settingsRef = doc(db, 'settings', 'global');
            await updateDoc(settingsRef, { [field]: value });
            addToast('Ajuste actualizado');
        } catch (error: any) {
            if (error.code === 'not-found' || error.message?.includes('No document to update')) {
                const settingsRef = doc(db, 'settings', 'global');
                await setDoc(settingsRef, { [field]: value }, { merge: true });
                addToast('Ajuste guardado');
            } else {
                addToast('Error al actualizar');
            }
        }
    }

    function copyToClipboard(text: string, id: string) {
        navigator.clipboard.writeText(text);
        copiedId = id;
        setTimeout(() => (copiedId = null), 2000);
    }

    // --- Lifecycle ---
    onMount(() => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        unsubscribeUsers = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
            totalUsers = users.length;
            proUsers = users.filter((u) => u.isPro === true).length;
            freeUsers = totalUsers - proUsers;
            const now = Date.now();
            const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
            let dailyCounts = new Array(7).fill(0);
            users.forEach((u) => {
                const ts = u.createdAt?.toMillis?.();
                if (ts && ts > oneWeekAgo) {
                    const daysAgo = Math.floor((now - ts) / (24 * 60 * 60 * 1000));
                    if (daysAgo >= 0 && daysAgo < 7) dailyCounts[6 - daysAgo]++;
                }
            });
            sparklineData = dailyCounts;
            newUsersThisWeek = dailyCounts.reduce((a, b) => a + b, 0);
            usersList = users;
        });

        const logsQ = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(50));
        unsubscribeLogs = onSnapshot(logsQ, (snapshot) => {
            activityFeed = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        });

        const settingsRef = doc(db, 'settings', 'global');
        unsubscribeSettings = onSnapshot(settingsRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                maintenanceMode = data.maintenanceMode || false;
                globalMessageActive = data.globalMessageActive || false;
                globalMessageText = data.globalMessageText || '';
            }
        });
    });

    onDestroy(() => {
        if (unsubscribeUsers) unsubscribeUsers();
        if (unsubscribeLogs) unsubscribeLogs();
        if (unsubscribeSettings) unsubscribeSettings();
    });
</script>

<svelte:head>
    <title>CONTROL | Neo-Brutalist Admin</title>
</svelte:head>

<div class="min-h-screen text-slate-900 selection:bg-primary/30 font-sans pb-20">
    <!-- MODAL -->
    {#if selectedUserForModal}
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <button
                class="absolute inset-0 bg-black/40 backdrop-blur-sm"
                on:click={() => (selectedUserForModal = null)}
            ></button>
            <div
                class="relative bg-white border-4 border-black shadow-neo p-8 w-full max-w-xl animate-in zoom-in-95 duration-300"
            >
                <div class="flex flex-col gap-6">
                    <div class="flex items-center justify-between">
                        <div
                            class="px-3 py-1 bg-slate-100 border-2 border-black font-black text-[10px] uppercase tracking-wider"
                        >
                            Detalles de Usuario
                        </div>
                        <button
                            on:click={() => (selectedUserForModal = null)}
                            class="p-2 hover:bg-slate-100 border-2 border-transparent hover:border-black transition-all"
                        >
                            <X class="w-6 h-6" />
                        </button>
                    </div>

                    <div>
                        <h2 class="text-3xl font-black tracking-tight mb-2">
                            {selectedUserForModal.email}
                        </h2>
                        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            ID: {selectedUserForModal.id}
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="p-6 bg-slate-50 border-2 border-black shadow-neo-sm">
                            <p
                                class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1"
                            >
                                Registrado
                            </p>
                            <p class="text-sm font-black">
                                {formatDate(selectedUserForModal.createdAt)}
                            </p>
                        </div>
                        <div class="p-6 bg-slate-50 border-2 border-black shadow-neo-sm">
                            <p
                                class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1"
                            >
                                Plan
                            </p>
                            <p
                                class="text-sm font-black {selectedUserForModal.isPro
                                    ? 'text-primary'
                                    : 'text-slate-900'}"
                            >
                                {selectedUserForModal.isPro ? 'PREMIUM PRO' : 'FREE USER'}
                            </p>
                        </div>
                    </div>

                    <div class="flex gap-4 pt-4">
                        <button
                            on:click={() => toggleUserPro(selectedUserForModal)}
                            class="flex-1 py-4 bg-primary text-white border-4 border-black font-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-wider text-sm"
                        >
                            {selectedUserForModal.isPro ? 'REVOCAR PRO' : 'ACTIVAR PRO'}
                        </button>
                        <button
                            on:click={() => handleDeleteUser(selectedUserForModal)}
                            class="px-6 bg-red-500 text-white border-4 border-black font-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-wider text-sm"
                        >
                            <Trash2 class="w-5 h-5 transition-transform group-hover:scale-110" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <div class="max-w-[1400px] mx-auto space-y-16 py-8">
        <!-- HEADER -->
        <header class="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
                <h1 class="text-6xl font-black tracking-tight uppercase leading-none">
                    CONTROL<br /><span class="text-primary">CENTER.</span>
                </h1>
                <div
                    class="mt-6 flex items-center gap-3 px-4 py-2 bg-white border-4 border-black shadow-neo-sm w-fit"
                >
                    <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <p class="text-[10px] font-black uppercase tracking-widest">LIVE SYNC ACTIVE</p>
                </div>
            </div>

            <div class="flex flex-col items-end gap-2">
                <div
                    class="bg-white border-4 border-black px-6 py-3 shadow-neo-sm font-black text-sm"
                >
                    ADMIN: {$authStore.user?.email?.split('@')[0]}
                </div>
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                    {new Date().toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </div>
            </div>
        </header>

        <!-- KPI GRID -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
                class="bg-white border-4 border-black p-8 shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all group"
            >
                <p
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 group-hover:text-primary transition-colors"
                >
                    Total Usuarios
                </p>
                <div class="text-6xl font-black tracking-tight mb-4">
                    {totalUsers}
                </div>
                <div
                    class="text-[10px] font-bold bg-slate-100 border-2 border-black px-3 py-1 w-fit uppercase"
                >
                    Platform Total
                </div>
            </div>

            <div
                class="bg-white border-4 border-black p-8 shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all group"
            >
                <p
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 group-hover:text-primary transition-colors"
                >
                    Pro Users
                </p>
                <div class="text-6xl font-black tracking-tight mb-4 text-primary">
                    {proUsers}
                </div>
                <div class="flex items-center gap-2 font-black text-[10px] uppercase">
                    <TrendingUp class="w-4 h-4" />
                    <span>{conversionRate}% Conv.</span>
                </div>
            </div>

            <div
                class="bg-white border-4 border-black p-8 shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all group"
            >
                <p
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 group-hover:text-primary transition-colors"
                >
                    MRR Est.
                </p>
                <div class="text-6xl font-black tracking-tight mb-4">
                    {$currencyStore}{estimatedMRR}
                </div>
                <div
                    class="text-[10px] font-bold bg-emerald-100 text-emerald-700 border-2 border-black px-3 py-1 w-fit uppercase"
                >
                    Monthly Revenue
                </div>
            </div>

            <div
                class="bg-white border-4 border-black p-8 shadow-neo hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all group relative overflow-hidden"
            >
                <p
                    class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 group-hover:text-primary transition-colors"
                >
                    New (7d)
                </p>
                <div class="text-6xl font-black tracking-tight mb-4">
                    +{newUsersThisWeek}
                </div>
                <div
                    class="absolute bottom-0 left-0 right-0 h-4 border-t-4 border-black bg-slate-100"
                >
                    <div
                        class="h-full bg-primary transition-all duration-1000"
                        style="width: {Math.min((newUsersThisWeek / totalUsers || 0) * 100, 100)}%;"
                    ></div>
                </div>
            </div>
        </section>

        <!-- SYSTEM SETTINGS -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div class="bg-white border-4 border-black p-8 shadow-neo">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h3 class="text-2xl font-black tracking-tight uppercase mb-1">
                            Mantenimiento
                        </h3>
                        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                            Estado Global
                        </p>
                    </div>
                    <button
                        on:click={() => updateGlobalSettings('maintenanceMode', !maintenanceMode)}
                        class="w-20 h-10 border-4 border-black relative transition-all {maintenanceMode
                            ? 'bg-primary'
                            : 'bg-slate-200'}"
                    >
                        <div
                            class="absolute top-1 left-1 w-6 h-6 border-4 border-black bg-white transition-all {maintenanceMode
                                ? 'translate-x-10'
                                : 'translate-x-0'}"
                        ></div>
                    </button>
                </div>
                <p
                    class="text-sm text-slate-500 font-bold leading-relaxed border-l-4 border-primary pl-4"
                >
                    Restringe el acceso a la plataforma para todos los usuarios no administradores.
                    Ideal para despliegues complejos o actualizaciones de base de datos.
                </p>
            </div>

            <div class="bg-white border-4 border-black p-8 shadow-neo">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-6">
                        <div class="p-4 bg-primary text-white border-4 border-black shadow-neo-sm">
                            <Bell class="w-6 h-6" />
                        </div>
                        <div>
                            <h3 class="text-2xl font-black tracking-tight uppercase mb-1">
                                Banner Global
                            </h3>
                            <p
                                class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400"
                            >
                                Broadcast Message
                            </p>
                        </div>
                    </div>
                    <button
                        on:click={() =>
                            updateGlobalSettings('globalMessageActive', !globalMessageActive)}
                        class="w-20 h-10 border-4 border-black relative transition-all {globalMessageActive
                            ? 'bg-primary'
                            : 'bg-slate-200'}"
                    >
                        <div
                            class="absolute top-1 left-1 w-6 h-6 border-4 border-black bg-white transition-all {globalMessageActive
                                ? 'translate-x-10'
                                : 'translate-x-0'}"
                        ></div>
                    </button>
                </div>
                <div class="flex gap-4">
                    <input
                        type="text"
                        bind:value={globalMessageText}
                        class="flex-1 bg-slate-50 border-4 border-black px-6 py-4 font-black text-slate-900 placeholder-slate-300 focus:outline-none focus:bg-white transition-all text-xs tracking-widest uppercase"
                        placeholder="MENSAJE DEL SISTEMA..."
                    />
                    <button
                        on:click={() =>
                            updateGlobalSettings('globalMessageText', globalMessageText)}
                        class="bg-black text-white px-8 py-4 font-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-xs uppercase"
                    >
                        PUBLICAR
                    </button>
                </div>
            </div>
        </section>

        <!-- USER LISTING -->
        <section class="space-y-8">
            <div class="flex flex-col md:flex-row items-baseline justify-between gap-6">
                <div>
                    <h2 class="text-5xl font-black tracking-tight uppercase leading-none">
                        Gestión
                    </h2>
                    <p
                        class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4"
                    >
                        Directorio Maestro de Usuarios
                    </p>
                </div>
                <div class="relative w-full md:w-96 group">
                    <input
                        type="text"
                        bind:value={searchQuery}
                        class="w-full bg-white border-4 border-black px-8 py-4 font-black text-slate-900 placeholder-slate-300 focus:outline-none shadow-neo-sm focus:shadow-neo transition-all rounded-none"
                        placeholder="BUSCAR USUARIO..."
                    />
                    <Search
                        class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-black transition-colors"
                    />
                </div>
            </div>

            <div class="bg-white border-4 border-black shadow-neo overflow-hidden">
                <div
                    class="hidden lg:grid grid-cols-12 gap-4 px-10 py-6 bg-slate-50 border-b-4 border-black"
                >
                    <div
                        class="col-span-1 text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                        Avatar
                    </div>
                    <div
                        class="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                        Identidad
                    </div>
                    <div
                        class="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400"
                    >
                        Nivel de Acceso
                    </div>
                    <div
                        class="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right"
                    >
                        Fecha Registro
                    </div>
                </div>

                <div class="divide-y-4 divide-black">
                    {#each paginatedUsers as user (user.id)}
                        <button
                            on:click={() => (selectedUserForModal = user)}
                            class="w-full grid lg:grid-cols-12 gap-4 px-10 py-8 items-center hover:bg-slate-50 transition-colors text-left group"
                        >
                            <div class="lg:col-span-1 flex justify-center lg:justify-start">
                                <div
                                    class="w-12 h-12 bg-white border-4 border-black flex items-center justify-center font-black text-primary text-xl group-hover:shadow-neo-sm transition-all group-hover:-translate-x-1 group-hover:-translate-y-1"
                                >
                                    {(user.email?.[0] ?? '?').toUpperCase()}
                                </div>
                            </div>
                            <div class="col-span-4">
                                <p
                                    class="text-xl font-black tracking-tight group-hover:text-primary transition-colors"
                                >
                                    {user.email}
                                </p>
                                <p
                                    class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1"
                                >
                                    {user.id}
                                </p>
                            </div>
                            <div class="col-span-4">
                                <div class="flex items-center gap-2">
                                    {#if user.isAdmin}
                                        <span
                                            class="px-3 py-1 bg-red-100 text-red-600 border-2 border-black font-black text-[10px] uppercase"
                                        >
                                            PLATFORM ADMIN
                                        </span>
                                    {:else if user.isPro}
                                        <span
                                            class="px-3 py-1 bg-primary text-white border-2 border-black font-black text-[10px] uppercase"
                                        >
                                            PREMIUM PRO
                                        </span>
                                    {:else}
                                        <span
                                            class="px-3 py-1 bg-slate-100 text-slate-400 border-2 border-black font-black text-[10px] uppercase"
                                        >
                                            FREE USER
                                        </span>
                                    {/if}
                                </div>
                            </div>
                            <div class="col-span-3 text-right">
                                <p class="text-sm font-black italic text-slate-400">
                                    {formatDate(user.createdAt)}
                                </p>
                            </div>
                        </button>
                    {/each}

                    {#if paginatedUsers.length === 0}
                        <div class="p-20 text-center">
                            <ShieldAlert class="w-16 h-16 text-slate-200 mx-auto mb-6" />
                            <p class="font-black text-slate-400 uppercase tracking-widest">
                                No se han encontrado usuarios
                            </p>
                        </div>
                    {/if}
                </div>

                <!-- PAGINATION -->
                <div
                    class="px-10 py-8 bg-slate-50 border-t-4 border-black flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                    <p
                        class="text-[10px] font-black uppercase tracking-widest text-slate-400 italic"
                    >
                        Mostrando {paginatedUsers.length} de {filteredUsers.length} usuarios indexados
                    </p>
                    <div class="flex gap-4">
                        <button
                            on:click={() => (currentPage = Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            class="px-6 py-3 bg-white border-4 border-black font-black text-xs uppercase shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neo-sm"
                        >
                            ANTERIOR
                        </button>
                        <button
                            on:click={() => (currentPage = Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            class="px-6 py-3 bg-white border-4 border-black font-black text-xs uppercase shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neo-sm"
                        >
                            SIGUIENTE
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>
