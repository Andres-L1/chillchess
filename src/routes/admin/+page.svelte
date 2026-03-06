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
        AlertTriangle,
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
    let sortBy: 'email' | 'status' | 'joined' = 'email';
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
            if (sortBy === 'status') {
                if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
                if (a.isPro !== b.isPro) return a.isPro ? -1 : 1;
                return 0;
            }
            if (sortBy === 'joined') {
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

    // --- Sparkline Helper ---
    function generateSparklinePoints(data: number[], width: number = 100, height: number = 30) {
        if (data.length === 0) return '';
        const max = Math.max(...data, 1);
        const min = 0;
        const range = max - min;

        return data
            .map((val, i) => {
                const x = (i / (data.length - 1)) * width;
                const y = height - ((val - min) / range) * height;
                return `${x},${y}`;
            })
            .join(' ');
    }

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

    function activityColor(action: string): string {
        if (action === 'PRO_GRANTED') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        if (action === 'PRO_REMOVED') return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        if (action === 'USER_DELETED') return 'text-red-400 bg-red-500/10 border-red-500/20';
        return 'text-white bg-white/10 border-white/20';
    }

    function activityLabel(action: string): string {
        if (action === 'PRO_GRANTED') return 'Pro Activado';
        if (action === 'PRO_REMOVED') return 'Pro Quitado';
        if (action === 'USER_DELETED') return 'Eliminado';
        return action;
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
            selectedUsers = selectedUsers; // trigger reactivity
        } catch (e) {
            addToast('Error al eliminar usuario', 'error');
        }
    }

    // Bulk Actions
    function toggleSelectAll() {
        if (allSelected) {
            paginatedUsers.forEach((u) => selectedUsers.delete(u.id));
        } else {
            paginatedUsers.forEach((u) => selectedUsers.add(u.id));
        }
        selectedUsers = selectedUsers;
    }

    function toggleSelectUser(id: string) {
        if (selectedUsers.has(id)) {
            selectedUsers.delete(id);
        } else {
            selectedUsers.add(id);
        }
        selectedUsers = selectedUsers;
    }

    async function bulkDelete() {
        if (
            !confirm(
                `¿Eliminar ${selectedUsers.size} usuarios seleccionados? Esta acción es irreversible.`
            )
        )
            return;

        let successCount = 0;
        for (const id of selectedUsers) {
            const user = usersList.find((u) => u.id === id);
            if (user && !user.isAdmin) {
                try {
                    await deleteDoc(doc(db, 'users', id));
                    await logAction('USER_DELETED', user.email, id);
                    successCount++;
                } catch (e) {
                    console.error('Failed to delete', id, e);
                }
            }
        }
        addToast(`${successCount} usuarios eliminados`, 'success');
        selectedUsers.clear();
        selectedUsers = selectedUsers;
    }

    function bulkExport() {
        const usersToExport = usersList.filter((u) => selectedUsers.has(u.id));
        const blob = new Blob([JSON.stringify(usersToExport, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chillchess-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addToast(`${usersToExport.length} usuarios exportados`, 'success');
        selectedUsers.clear();
        selectedUsers = selectedUsers;
    }

    function exportUsersJSON() {
        const blob = new Blob([JSON.stringify(usersList, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chillchess-users-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addToast('Exportación completa', 'success');
    }

    function nextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            selectedUsers.clear();
            selectedUsers = selectedUsers;
        }
    }
    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            selectedUsers.clear();
            selectedUsers = selectedUsers;
        }
    }

    async function copyToClipboard(text: string, id: string) {
        try {
            await navigator.clipboard.writeText(text);
            copiedId = id;
            setTimeout(() => (copiedId = null), 2000);
        } catch {
            /* noop */
        }
    }

    const filterOptions: { val: 'all' | 'pro' | 'free' | 'admin'; label: string }[] = [
        { val: 'all', label: 'Todos' },
        { val: 'pro', label: 'Pro' },
        { val: 'free', label: 'Free' },
        { val: 'admin', label: 'Admin' },
    ];

    const feedFilterOptions: { val: 'all' | 'PRO_GRANTED' | 'USER_DELETED'; label: string }[] = [
        { val: 'all', label: 'Todo' },
        { val: 'PRO_GRANTED', label: 'Upgrades' },
        { val: 'USER_DELETED', label: 'Bajas' },
    ];

    async function updateGlobalSettings(field: string, value: any) {
        try {
            const settingsRef = doc(db, 'settings', 'global');
            await updateDoc(settingsRef, { [field]: value });
            addToast('Ajuste actualizado');
        } catch (error: any) {
            console.error(error);
            // If the document doesn't exist yet, setDoc will create it
            if (error.code === 'not-found' || error.message?.includes('No document to update')) {
                const settingsRef = doc(db, 'settings', 'global');
                await setDoc(settingsRef, { [field]: value }, { merge: true });
                addToast('Ajuste guardado (creado)');
            } else {
                addToast('Error al actualizar');
            }
        }
    }

    function handleRowClick(e: MouseEvent, user: any) {
        const target = e.target as HTMLElement;
        if (
            target &&
            (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('button'))
        )
            return;
        selectedUserForModal = user;
    }

    // --- Lifecycle ---
    onMount(() => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);

        unsubscribeUsers = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map((d) => ({
                id: d.id,
                ...(d.data() as any),
            }));

            totalUsers = users.length;
            proUsers = users.filter((u) => u.isPro === true).length;
            freeUsers = totalUsers - proUsers;

            const now = Date.now();
            const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

            // Calculate sparkline data (last 7 days counts)
            let dailyCounts = new Array(7).fill(0);

            users.forEach((u) => {
                const ts = u.createdAt?.toMillis?.();
                if (ts && ts > oneWeekAgo) {
                    const daysAgo = Math.floor((now - ts) / (24 * 60 * 60 * 1000));
                    if (daysAgo >= 0 && daysAgo < 7) {
                        dailyCounts[6 - daysAgo]++;
                    }
                }
            });
            sparklineData = dailyCounts;
            newUsersThisWeek = dailyCounts.reduce((a, b) => a + b, 0);

            usersList = users.sort((a, b) => {
                if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
                if (a.isPro !== b.isPro) return a.isPro ? -1 : 1;
                return (a.email || '').localeCompare(b.email || '');
            });
        });

        // Subscribe to admin logs feed
        const logsQ = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'), limit(50));
        unsubscribeLogs = onSnapshot(logsQ, (snapshot) => {
            activityFeed = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        });

        // Subscribe to Global Settings
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
    <title>Admin Dashboard | ChillChess</title>
    <meta name="description" content="Panel de administración de ChillChess." />
    <meta name="robots" content="noindex,nofollow" />
</svelte:head>

<!-- Modal Overlay -->
{#if selectedUserForModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <button
            type="button"
            class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            on:click={() => (selectedUserForModal = null)}
            on:keydown={(e) => e.key === 'Escape' && (selectedUserForModal = null)}
            aria-label="Cerrar modal"
        ></button>

        <!-- Modal Content -->
        <div
            class="relative bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            <!-- Header -->
            <div class="p-6 pb-0 flex justify-between items-start">
                <div>
                    <div
                        class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-medium text-white shadow-inner mb-4"
                    >
                        {selectedUserForModal.email
                            ? selectedUserForModal.email[0].toUpperCase()
                            : '?'}
                    </div>
                    <h2 class="text-xl font-semibold text-white truncate pr-4">
                        {selectedUserForModal.email}
                    </h2>
                    <p class="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
                        {selectedUserForModal.id}
                        <button
                            on:click={() => copyToClipboard(selectedUserForModal.id, 'modal-id')}
                            class="hover:text-white transition-colors"
                        >
                            {#if copiedId === 'modal-id'}<Check
                                    class="w-3 h-3 text-emerald-400"
                                />{:else}<Copy class="w-3 h-3" />{/if}
                        </button>
                    </p>
                </div>
                <button
                    on:click={() => (selectedUserForModal = null)}
                    class="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                    <X class="w-4 h-4" />
                </button>
            </div>

            <!-- Body -->
            <div class="p-6 space-y-6">
                <!-- Status Tags -->
                <div class="flex gap-2">
                    {#if selectedUserForModal.isPro}
                        <span
                            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        >
                            <Crown class="w-3.5 h-3.5" /> PRO
                        </span>
                    {:else}
                        <span
                            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10"
                        >
                            Free
                        </span>
                    {/if}
                    {#if selectedUserForModal.isAdmin}
                        <span
                            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20"
                        >
                            <ShieldAlert class="w-3.5 h-3.5" /> Admin
                        </span>
                    {/if}
                </div>

                <!-- Info Grid -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-black/40 border border-white/5 rounded-2xl p-4">
                        <p
                            class="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-1 flex items-center gap-1"
                        >
                            <CalendarDays class="w-3 h-3" /> Registro
                        </p>
                        <p class="text-xs text-slate-300 font-medium">
                            {formatDate(selectedUserForModal.createdAt)}
                        </p>
                    </div>
                    <div class="bg-black/40 border border-white/5 rounded-2xl p-4">
                        <p
                            class="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-1 flex items-center gap-1"
                        >
                            <ActivityIcon class="w-3 h-3" /> Status Act.
                        </p>
                        <p class="text-xs text-emerald-400 font-medium">Activo</p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="pt-2 border-t border-white/5 flex gap-2">
                    <button
                        on:click={() => toggleUserPro(selectedUserForModal)}
                        class="flex-1 py-2.5 rounded-xl text-xs font-semibold flex justify-center items-center gap-2 transition-all active:scale-95 {selectedUserForModal.isPro
                            ? 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                            : 'bg-white text-black hover:bg-slate-200'}"
                    >
                        <Sparkles class="w-4 h-4" />
                        {selectedUserForModal.isPro ? 'Revocar Pro' : 'Otorgar Pro'}
                    </button>
                    {#if !selectedUserForModal.isAdmin}
                        <button
                            on:click={() => handleDeleteUser(selectedUserForModal)}
                            class="px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all active:scale-95 flex items-center justify-center"
                            title="Eliminar usuario"
                        >
                            <Trash2 class="w-4 h-4" />
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<div class="w-full p-3 sm:p-5 lg:p-8 space-y-8 max-w-7xl mx-auto selection:bg-brand-500/30">
    <!-- ===== HEADER ===== -->
    <header
        class="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10"
    >
        <div class="flex items-center gap-4">
            <div
                class="w-12 h-12 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-inner"
            >
                <Crown class="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            </div>
            <div>
                <h1 class="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                    Panel Admin
                </h1>
                <p class="text-slate-400 text-sm">{$authStore.user?.email}</p>
            </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
            <!-- Live indicator -->
            <div
                class="flex items-center gap-2 bg-black/40 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest text-slate-300"
            >
                <span
                    class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"
                ></span>
                Sincronizado
            </div>
        </div>
    </header>

    <!-- ===== KPI STRIP ===== -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Users -->
        <div
            class="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 flex flex-col gap-1 shadow-2xl relative overflow-hidden group"
        >
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            ></div>
            <div
                class="flex items-center justify-between shadow-inner p-2 w-fit rounded-xl bg-white/5 border border-white/5 mb-2 group-hover:bg-white/10 transition-colors"
            >
                <Users class="w-4 h-4 text-slate-300" />
            </div>
            <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
                Total Usuarios
            </p>
            <div class="flex items-end justify-between">
                <span class="text-3xl font-medium text-white">{totalUsers}</span>
                <span class="text-xs text-slate-400 mb-1 border-b border-dashed border-slate-600"
                    >Lifetime</span
                >
            </div>
        </div>

        <!-- Pro Users -->
        <div
            class="bg-black/40 backdrop-blur-3xl border border-amber-500/20 rounded-3xl p-5 flex flex-col gap-1 shadow-2xl relative overflow-hidden group"
        >
            <div
                class="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none"
            ></div>
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
            ></div>
            <div
                class="flex items-center justify-between shadow-inner p-2 w-fit rounded-xl bg-amber-500/10 border border-amber-500/10 mb-2 relative z-10 group-hover:bg-amber-500/20 transition-colors"
            >
                <Crown class="w-4 h-4 text-amber-400" />
            </div>
            <p
                class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1 relative z-10"
            >
                Premium (Pro)
            </p>
            <div class="flex items-end justify-between relative z-10">
                <span
                    class="text-3xl font-medium text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                    >{proUsers}</span
                >
                <div
                    class="flex items-center gap-1 text-xs text-amber-400 font-medium mb-1 bg-amber-500/10 px-2 py-0.5 rounded-md"
                >
                    <TrendingUp class="w-3 h-3" />
                    {conversionRate}%
                </div>
            </div>
        </div>

        <!-- MRR -->
        <div
            class="bg-black/40 backdrop-blur-3xl border border-emerald-500/20 rounded-3xl p-5 flex flex-col gap-1 shadow-2xl relative overflow-hidden group"
        >
            <div
                class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none"
            ></div>
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
            ></div>
            <div
                class="flex items-center justify-between shadow-inner p-2 w-fit rounded-xl bg-emerald-500/10 border border-emerald-500/10 mb-2 relative z-10 group-hover:bg-emerald-500/20 transition-colors"
            >
                <CreditCard class="w-4 h-4 text-emerald-400" />
            </div>
            <p
                class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1 relative z-10"
            >
                MRR Estimado
            </p>
            <div class="flex items-end justify-between relative z-10">
                <span class="text-3xl font-medium text-white">{$currencyStore}{estimatedMRR}</span>
                <span class="text-xs text-emerald-400 font-medium mb-1">/mes</span>
            </div>
        </div>

        <!-- New This Week with Sparkline -->
        <div
            class="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 flex flex-col gap-1 shadow-2xl relative overflow-hidden group"
        >
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            ></div>
            <div class="flex items-start justify-between relative z-10 mb-2">
                <div
                    class="shadow-inner p-2 w-fit rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors"
                >
                    <Zap class="w-4 h-4 text-slate-300" />
                </div>
                <!-- Sparkline SVG -->
                <div class="w-16 h-8 opacity-70">
                    <svg viewBox="0 0 100 30" class="w-full h-full overflow-visible">
                        <polyline
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            class="text-brand-400"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            points={generateSparklinePoints(sparklineData, 100, 30)}
                        />
                    </svg>
                </div>
            </div>
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                Nuevos (7 Días)
            </p>
            <div class="flex items-end justify-between. relative z-10">
                <span class="text-3xl font-medium text-white">+{newUsersThisWeek}</span>
            </div>
        </div>
    </div>

    <!-- ===== GLOBAL SETTINGS ===== -->
    <div
        class="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
    >
        <div
            class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"
        ></div>
        <div class="flex items-center gap-3 mb-6">
            <Settings class="w-5 h-5 text-brand-400" />
            <h2 class="text-lg font-medium text-white">Ajustes Globales del Sistema</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Maintenance Mode -->
            <div
                class="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col gap-3 group relative overflow-hidden transition-colors hover:bg-white/10"
            >
                {#if maintenanceMode}
                    <div class="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                {/if}
                <div class="flex items-center justify-between relative z-10 w-full">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl {maintenanceMode
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-white/5 text-slate-400 border-white/10'} border flex items-center justify-center shadow-inner transition-colors"
                        >
                            <AlertTriangle class="w-5 h-5" />
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-white">Modo Mantenimiento</h3>
                            <p class="text-xs text-slate-400">Bloquea el acceso a no-admins.</p>
                        </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            class="sr-only peer"
                            checked={maintenanceMode}
                            on:change={(e) =>
                                updateGlobalSettings('maintenanceMode', e.currentTarget.checked)}
                        />
                        <div
                            class="w-11 h-6 bg-black/40 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500/50 peer-checked:border-red-500 shadow-inner"
                        ></div>
                    </label>
                </div>
            </div>

            <!-- Global Banner -->
            <div
                class="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden transition-colors hover:bg-white/10"
            >
                <div class="flex items-center justify-between relative z-10 w-full mb-1">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-xl {globalMessageActive
                                ? 'bg-brand-500/20 text-brand-400 border-brand-500/30'
                                : 'bg-white/5 text-slate-400 border-white/10'} border flex items-center justify-center shadow-inner transition-colors"
                        >
                            <MessageSquare class="w-5 h-5" />
                        </div>
                        <div>
                            <h3 class="text-sm font-medium text-white">Mensaje Global (Banner)</h3>
                            <p class="text-xs text-slate-400">Se mostrará a todos los usuarios.</p>
                        </div>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            class="sr-only peer"
                            checked={globalMessageActive}
                            on:change={(e) =>
                                updateGlobalSettings(
                                    'globalMessageActive',
                                    e.currentTarget.checked
                                )}
                        />
                        <div
                            class="w-11 h-6 bg-black/40 border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-slate-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500/50 peer-checked:border-brand-500 shadow-inner"
                        ></div>
                    </label>
                </div>
                <div class="flex gap-2">
                    <input
                        type="text"
                        bind:value={globalMessageText}
                        placeholder="Ej: Nueva herramienta de IA disponible..."
                        class="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all shadow-inner"
                    />
                    <button
                        on:click={() =>
                            updateGlobalSettings('globalMessageText', globalMessageText)}
                        class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ===== MAIN GRID: TABLE + ACTIVITY FEED ===== -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- USERS TABLE (2/3 width on xl) -->
        <div
            class="xl:col-span-2 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl flex flex-col relative overflow-hidden"
        >
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            ></div>

            <!-- Table Header & Toolbar -->
            <div class="p-6 border-b border-white/5 bg-white/[0.02]">
                <div
                    class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div class="flex items-center gap-3">
                        <Users class="w-5 h-5 text-slate-400" />
                        <h2 class="text-lg font-medium text-white">
                            Directorio (<span class="text-slate-400">{filteredUsers.length}</span>)
                        </h2>
                    </div>

                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <div class="relative flex-1 sm:w-64">
                            <Search
                                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                            />
                            <input
                                type="search"
                                bind:value={searchQuery}
                                placeholder="Buscar por email o ID..."
                                class="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all"
                            />
                        </div>
                    </div>
                </div>

                <!-- Filters & Bulk Actions Bar -->
                <div class="flex items-center justify-between mt-5 gap-4 flex-wrap">
                    <!-- Filters -->
                    <div
                        class="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5"
                    >
                        {#each filterOptions as opt}
                            <button
                                on:click={() => (statusFilter = opt.val)}
                                class="px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all {statusFilter ===
                                opt.val
                                    ? 'bg-white text-black hover:bg-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                            >
                                {opt.label}
                            </button>
                        {/each}
                    </div>

                    <!-- Bulk Actions -->
                    {#if someSelected}
                        <div
                            class="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300"
                        >
                            <span
                                class="text-xs font-medium text-amber-400 mr-2 border-r border-white/10 pr-4"
                                >{selectedUsers.size} seleccionados</span
                            >
                            <button
                                on:click={bulkExport}
                                class="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/5 transition-colors"
                                title="Exportar seleccionados"
                            >
                                <Download class="w-4 h-4" />
                            </button>
                            <button
                                on:click={bulkDelete}
                                class="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors"
                                title="Eliminar seleccionados"
                            >
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </div>
                    {:else}
                        <div class="flex items-center gap-2">
                            <button
                                on:click={() =>
                                    (sortBy =
                                        sortBy === 'email'
                                            ? 'status'
                                            : sortBy === 'status'
                                              ? 'joined'
                                              : 'email')}
                                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-all bg-white/5 text-slate-300 border border-white/5 hover:text-white hover:bg-white/10"
                            >
                                Orden: {sortBy === 'email'
                                    ? 'Email'
                                    : sortBy === 'status'
                                      ? 'Status'
                                      : 'Nuevo'}
                            </button>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto flex-1">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead
                        class="text-slate-500 bg-black/20 text-[10px] uppercase font-semibold tracking-wider border-b border-white/5"
                    >
                        <tr>
                            <th scope="col" class="px-5 py-3 w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    on:change={toggleSelectAll}
                                    class="w-4 h-4 rounded border-white/20 bg-black/40 text-brand-500 focus:ring-brand-500/50 cursor-pointer accent-white"
                                />
                            </th>
                            <th scope="col" class="px-2 py-3">Usuario</th>
                            <th scope="col" class="px-5 py-3">Status</th>
                            <th scope="col" class="px-5 py-3 hidden sm:table-cell">Registro</th>
                            <th scope="col" class="px-5 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        {#each paginatedUsers as user (user.id)}
                            <tr
                                class="group/row transition-colors cursor-pointer {selectedUsers.has(
                                    user.id
                                )
                                    ? 'bg-white/5'
                                    : 'hover:bg-white/[0.02]'}"
                                on:click={(e) => handleRowClick(e, user)}
                            >
                                <td class="px-5 py-3.5">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.has(user.id)}
                                        on:change={() => toggleSelectUser(user.id)}
                                        on:click|stopPropagation
                                        class="w-4 h-4 rounded border-white/20 bg-black/40 text-brand-500 focus:ring-brand-500/50 cursor-pointer accent-white"
                                    />
                                </td>
                                <td class="px-2 py-3.5">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center font-medium text-white shadow-inner flex-shrink-0"
                                        >
                                            {user.email ? user.email[0].toUpperCase() : '?'}
                                        </div>
                                        <div class="min-w-0">
                                            <p
                                                class="font-medium text-white text-sm truncate max-w-[150px] group-hover/row:text-emerald-300 transition-colors"
                                            >
                                                {user.email || 'Sin correo'}
                                            </p>
                                            <div class="flex items-center gap-1 mt-0.5 opacity-60">
                                                <p
                                                    class="text-[10px] text-slate-400 font-mono truncate max-w-[90px]"
                                                >
                                                    {user.id}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-5 py-3.5">
                                    <div class="flex gap-2">
                                        {#if user.isPro}
                                            <span
                                                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner"
                                            >
                                                <Crown class="w-2.5 h-2.5" /> PRO
                                            </span>
                                        {:else}
                                            <span
                                                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-400 border border-white/10"
                                            >
                                                Free
                                            </span>
                                        {/if}
                                        {#if user.isAdmin}
                                            <span
                                                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 shadow-inner"
                                            >
                                                Admin
                                            </span>
                                        {/if}
                                    </div>
                                </td>
                                <td class="px-5 py-3.5 hidden sm:table-cell">
                                    <span class="text-xs text-slate-400">
                                        {user.createdAt ? relativeTime(user.createdAt) : '—'}
                                    </span>
                                </td>
                                <td class="px-5 py-3.5 text-right w-24">
                                    <div
                                        class="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                    >
                                        <button
                                            on:click|stopPropagation={() => toggleUserPro(user)}
                                            class="p-1.5 rounded-lg transition-all active:scale-90 {user.isPro
                                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'}"
                                            title={user.isPro ? 'Quitar Pro' : 'Dar Pro'}
                                        >
                                            <Sparkles class="w-3.5 h-3.5" />
                                        </button>
                                        {#if !user.isAdmin}
                                            <button
                                                on:click|stopPropagation={() =>
                                                    handleDeleteUser(user)}
                                                class="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-90"
                                                title="Eliminar"
                                            >
                                                <Trash2 class="w-3.5 h-3.5" />
                                            </button>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {:else}
                            <tr>
                                <td
                                    colspan="5"
                                    class="px-5 py-16 text-center text-slate-500 text-sm font-medium"
                                >
                                    {#if searchQuery || statusFilter !== 'all'}
                                        Ningún usuario coincide con los filtros actuales.
                                    {:else}
                                        Cargando directorio...
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Pagination footer -->
            <div
                class="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between"
            >
                <p class="text-xs text-slate-500 font-medium">
                    Mostrando <span class="text-white"
                        >{Math.min(paginatedUsers.length, itemsPerPage)}</span
                    >
                    de <span class="text-white">{filteredUsers.length}</span>
                </p>
                {#if totalPages > 1}
                    <div
                        class="flex items-center gap-1 bg-black/40 rounded-xl border border-white/5 p-1"
                    >
                        <button
                            on:click={prevPage}
                            disabled={currentPage === 1}
                            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft class="w-4 h-4" />
                        </button>
                        <span class="px-3 text-xs font-semibold text-slate-300">
                            {currentPage} <span class="text-slate-600">/</span>
                            {totalPages}
                        </span>
                        <button
                            on:click={nextPage}
                            disabled={currentPage === totalPages}
                            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight class="w-4 h-4" />
                        </button>
                    </div>
                {/if}
            </div>
        </div>

        <!-- ACTIVITY FEED (1/3 width on xl) -->
        <div
            class="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
        >
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            ></div>

            <!-- Header -->
            <div class="p-6 border-b border-white/5 bg-white/[0.02]">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-lg font-medium text-white flex items-center gap-3">
                        <Activity class="w-5 h-5 text-slate-400" />
                        Actividad Reciente
                    </h2>
                </div>
                <!-- Filters -->
                <div class="flex gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 w-fit">
                    {#each feedFilterOptions as opt}
                        <button
                            on:click={() => (feedFilter = opt.val)}
                            class="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all {feedFilter ===
                            opt.val
                                ? 'bg-white/10 text-white shadow-inner'
                                : 'text-slate-500 hover:text-slate-300'}"
                        >
                            {opt.label}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Feed Content -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px] custom-scrollbar">
                {#if filteredActivityFeed.length === 0}
                    <div class="flex flex-col items-center justify-center h-full py-16 text-center">
                        <div
                            class="p-4 rounded-3xl bg-white/5 border border-white/5 mb-4 shadow-inner"
                        >
                            <Activity class="w-6 h-6 text-slate-600" />
                        </div>
                        <p class="text-slate-400 text-sm font-medium">Sin actividad registrada</p>
                        <p class="text-slate-500 text-xs mt-1">
                            Los eventos para este filtro aparecerán aquí.
                        </p>
                    </div>
                {:else}
                    {#each filteredActivityFeed as log}
                        <div
                            class="flex items-start gap-4 p-3 rounded-2xl bg-white/[(0.015)] border border-transparent hover:border-white/5 hover:bg-white/[0.03] transition-all group overflow-hidden relative"
                        >
                            <!-- Indicator line -->
                            <div
                                class="absolute left-0 top-0 bottom-0 w-[3px] {log.action ===
                                'PRO_GRANTED'
                                    ? 'bg-amber-500/50'
                                    : log.action === 'USER_DELETED'
                                      ? 'bg-red-500/50'
                                      : 'bg-white/20'} opacity-0 group-hover:opacity-100 transition-opacity"
                            ></div>

                            <div class="pt-1">
                                {#if log.action === 'PRO_GRANTED' || log.action === 'PRO_REMOVED'}
                                    <Crown
                                        class="w-4 h-4 {log.action === 'PRO_GRANTED'
                                            ? 'text-amber-400'
                                            : 'text-slate-500'}"
                                    />
                                {:else if log.action === 'USER_DELETED'}
                                    <Trash2 class="w-4 h-4 text-red-400" />
                                {:else}
                                    <ActivityIcon class="w-4 h-4 text-slate-400" />
                                {/if}
                            </div>

                            <div class="min-w-0 flex-1">
                                <p class="text-xs font-medium text-slate-200 truncate">
                                    <span class="font-semibold text-white"
                                        >{activityLabel(log.action)}</span
                                    >
                                    <span class="text-slate-400 mx-1">→</span>
                                    {log.targetEmail || log.targetId || 'Desconocido'}
                                </p>
                                <p
                                    class="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1.5"
                                >
                                    <Clock class="w-3 h-3 flex-shrink-0" />
                                    {relativeTime(log.timestamp)}
                                    <span class="mx-0.5">•</span>
                                    <span>{(log.adminEmail || 'Admin').split('@')[0]}</span>
                                </p>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>

    <!-- ===== QUICK ACTIONS FOOTER ===== -->
    <div
        class="flex flex-wrap items-center justify-center lg:justify-end gap-3 pt-4 border-t border-white/5"
    >
        <a
            href="/admin/feedback"
            class="group flex items-center gap-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 hover:text-brand-300 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border border-brand-500/20 shadow-inner"
        >
            <MessageSquare class="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            Ver Feedback
        </a>
        <button
            on:click={exportUsersJSON}
            class="group flex items-center gap-2 bg-black/40 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all active:scale-95"
        >
            <Download class="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            Descargar Base
        </button>
        <a
            href="https://dashboard.stripe.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center gap-2 bg-black/40 hover:bg-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all border border-white/10"
        >
            <span class="font-bold tracking-tighter text-indigo-400 text-sm">stripe</span>
            Dashboard <ExternalLink
                class="w-3 h-3 text-slate-500 group-hover:text-white transition-colors"
            />
        </a>
        <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center gap-2 bg-white hover:bg-slate-200 text-black px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
            <Zap class="w-4 h-4" />
            Firebase <ExternalLink class="w-3 h-3 text-slate-500 opacity-50" />
        </a>
    </div>
</div>

<style>
    /* Sleek scrollbar for the activity feed */
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
    }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
    }
</style>
