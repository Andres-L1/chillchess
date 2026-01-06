<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { db } from '$lib/firebase';
    import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
    import { slide, fade } from 'svelte/transition';
    import { toast } from 'svelte-french-toast';

    // --- TYPES ---
    type LogMode = 'system' | 'audit';
    type LogLevel = 'info' | 'warn' | 'error' | 'audit';

    interface LogEntry {
        id: string;
        message?: string; // System logs
        action?: string; // Audit logs
        level?: LogLevel;
        timestamp: Date;
        details?: any;
        userId?: string; // System logs
        adminId?: string; // Audit logs
        targetId?: string;
        source?: string;
        url?: string;
    }

    // --- STATE ---
    let mode: LogMode = 'system';
    let logs: LogEntry[] = [];
    let displayedLogs: LogEntry[] = [];
    let loading = true;
    let searchTerm = '';
    let unsubscribe: () => void;

    // Pagination / Limit
    let logLimit = 100;

    // Expanded rows (for mobile cards and desktop details)
    let expandedIds = new Set<string>();

    // --- EFFECTS ---
    $: if (mode) {
        subscribeToLogs();
        searchTerm = ''; // Reset search on mode switch
    }

    $: filterLogs(searchTerm, logs);

    function subscribeToLogs() {
        if (unsubscribe) unsubscribe();
        loading = true;

        const collectionName = mode === 'audit' ? 'audit_logs' : 'system_logs';

        try {
            const q = query(
                collection(db, collectionName),
                orderBy('timestamp', 'desc'),
                limit(logLimit)
            );

            unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    logs = snapshot.docs.map((doc) => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            timestamp: data.timestamp?.toDate() || new Date(),
                        } as LogEntry;
                    });
                    loading = false;
                    filterLogs(searchTerm, logs);
                },
                (err) => {
                    console.error('Logs error:', err);
                    toast.error('Error suscribiendo a logs');
                    loading = false;
                }
            );
        } catch (e) {
            console.error(e);
            loading = false;
        }
    }

    function filterLogs(term: string, sourceLogs: LogEntry[]) {
        if (!term.trim()) {
            displayedLogs = sourceLogs;
            return;
        }

        const lower = term.toLowerCase();
        displayedLogs = sourceLogs.filter((log) => {
            return (
                log.id.toLowerCase().includes(lower) ||
                log.message?.toLowerCase().includes(lower) ||
                log.action?.toLowerCase().includes(lower) ||
                log.userId?.toLowerCase().includes(lower) ||
                log.adminId?.toLowerCase().includes(lower) ||
                JSON.stringify(log.details || {})
                    .toLowerCase()
                    .includes(lower)
            );
        });
    }

    function toggleDetails(id: string) {
        if (expandedIds.has(id)) {
            expandedIds.delete(id);
        } else {
            expandedIds.add(id);
        }
        expandedIds = expandedIds;
    }

    function loadMore() {
        logLimit += 50;
        subscribeToLogs();
    }

    // --- HELPERS ---
    function formatTime(date: Date) {
        return new Intl.DateTimeFormat('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    }

    function formatDate(date: Date) {
        return new Intl.DateTimeFormat('es-ES', {
            month: 'short',
            day: 'numeric',
        }).format(date);
    }

    function getLevelColor(level: string = 'info') {
        switch (level) {
            case 'error':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'warn':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'audit':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default:
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    }

    // Actionable: Quick Filter
    function quickFilter(text: string) {
        searchTerm = text;
        toast.success(`Filtrando por: ${text}`);
    }

    // Export to CSV
    function exportCSV() {
        const headers = ['ID', 'Timestamp', 'Level/Action', 'Message', 'User', 'Details'];
        const csvContent = [
            headers.join(','),
            ...displayedLogs.map((log) =>
                [
                    log.id,
                    log.timestamp.toISOString(),
                    mode === 'audit' ? log.action : log.level,
                    `"${(log.message || '').replace(/"/g, '""')}"`,
                    log.userId || log.adminId || 'System',
                    `"${JSON.stringify(log.details || '').replace(/"/g, '""')}"`,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${mode}_logs_${new Date().toISOString()}.csv`;
        link.click();
    }

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });
</script>

<div class="animate-fade-in space-y-6">
    <!-- HEADER & CONTROLS -->
    <div
        class="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gradient-to-r from-[#131b2e] to-[#0f1524] p-6 rounded-3xl border border-white/5 shadow-2xl"
    >
        <div>
            <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                <span>🛡️</span> Centro de Comando
            </h2>
            <p class="text-slate-400 text-sm mt-1">Monitoreo de sistema y auditoría de acciones.</p>
        </div>

        <div class="flex items-center gap-3">
            <div class="flex bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                    class="px-4 py-2 rounded-lg text-sm font-bold transition-all {mode === 'system'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'}"
                    on:click={() => (mode = 'system')}
                >
                    System
                </button>
                <button
                    class="px-4 py-2 rounded-lg text-sm font-bold transition-all {mode === 'audit'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'}"
                    on:click={() => (mode = 'audit')}
                >
                    Audit
                </button>
            </div>

            <button
                on:click={exportCSV}
                class="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
                title="Exportar CSV"
            >
                ⬇️
            </button>
        </div>
    </div>

    <!-- SEARCH BAR -->
    <div class="relative group">
        <span
            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-400 text-lg"
            >🔍</span
        >
        <input
            type="text"
            bind:value={searchTerm}
            placeholder={mode === 'system'
                ? 'Buscar por error, usuario, mensaje...'
                : 'Buscar por admin, acción, objetivo...'}
            class="w-full bg-[#131b2e]/60 border border-white/10 focus:border-primary-500/50 rounded-2xl py-4 pl-12 pr-4 text-white outline-none transition-all shadow-inner"
        />
        {#if searchTerm}
            <button
                on:click={() => (searchTerm = '')}
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
                ✕
            </button>
        {/if}
    </div>

    <!-- MAIN LIST (Responsive) -->
    <div
        class="bg-[#131b2e]/40 border border-white/5 rounded-3xl overflow-hidden min-h-[500px] relative"
    >
        {#if loading && logs.length === 0}
            <div class="absolute inset-0 flex items-center justify-center">
                <div
                    class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
                ></div>
            </div>
        {:else if displayedLogs.length === 0}
            <div
                class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 opacity-50"
            >
                <span class="text-4xl mb-4">💤</span>
                <p>No se encontraron registros</p>
            </div>
        {:else}
            <!-- DESKTOP TABLE -->
            <div class="hidden md:block">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr
                            class="text-xs text-slate-500 uppercase border-b border-white/5 bg-black/20"
                        >
                            <th class="p-4 w-24 text-center">Nivel</th>
                            <th class="p-4 w-32">Tiempo</th>
                            <th class="p-4">{mode === 'audit' ? 'Acción' : 'Mensaje'}</th>
                            <th class="p-4 w-40">{mode === 'audit' ? 'Admin' : 'Usuario'}</th>
                            <th class="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5 text-sm">
                        {#each displayedLogs as log (log.id)}
                            {@const isExpanded = expandedIds.has(log.id)}
                            <tr
                                class="hover:bg-white/[0.02] transition-colors group {isExpanded
                                    ? 'bg-white/[0.04]'
                                    : ''}"
                            >
                                <td class="p-4 text-center align-top">
                                    <span
                                        class="px-2 py-1 rounded text-[10px] font-bold uppercase border {getLevelColor(
                                            mode === 'audit' ? 'audit' : log.level
                                        )}"
                                    >
                                        {mode === 'audit' ? 'AUDIT' : log.level || 'INFO'}
                                    </span>
                                </td>
                                <td class="p-4 text-slate-400 text-xs font-mono align-top">
                                    {formatDate(log.timestamp)} <br />
                                    <span class="text-white">{formatTime(log.timestamp)}</span>
                                </td>
                                <td class="p-4 align-top">
                                    <div class="text-slate-200 font-medium">
                                        {mode === 'audit' ? log.action : log.message}
                                    </div>
                                    {#if log.targetId}
                                        <button
                                            class="text-xs text-primary-400 hover:underline mt-1 flex items-center gap-1"
                                            on:click={() => quickFilter(log.targetId || '')}
                                        >
                                            🎯 {log.targetId}
                                        </button>
                                    {/if}
                                    {#if isExpanded && log.details}
                                        <div
                                            transition:slide
                                            class="mt-4 bg-black/40 rounded-xl p-4 border border-white/10 font-mono text-xs text-indigo-300 overflow-x-auto"
                                        >
                                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                            {#if log.url}
                                                <div
                                                    class="mt-2 pt-2 border-t border-white/5 text-slate-500"
                                                >
                                                    URL: {log.url}
                                                </div>
                                            {/if}
                                        </div>
                                    {/if}
                                </td>
                                <td class="p-4 align-top">
                                    {#if log.userId || log.adminId}
                                        <button
                                            class="flex items-center gap-2 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group/user"
                                            on:click={() =>
                                                quickFilter(log.userId || log.adminId || '')}
                                        >
                                            <span class="text-slate-300 font-mono text-xs">
                                                {(log.userId || log.adminId)?.slice(0, 6)}...
                                            </span>
                                            <span
                                                class="opacity-0 group-hover/user:opacity-100 text-[10px]"
                                                >🔎</span
                                            >
                                        </button>
                                    {:else}
                                        <span class="text-slate-600 text-xs italic">System</span>
                                    {/if}
                                </td>
                                <td class="p-4 align-top text-right">
                                    <button
                                        on:click={() => toggleDetails(log.id)}
                                        class="p-2 text-slate-500 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        {isExpanded ? '▲' : '▼'}
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- MOBILE CARDS -->
            <div class="md:hidden divide-y divide-white/5">
                {#each displayedLogs as log (log.id)}
                    {@const isExpanded = expandedIds.has(log.id)}
                    <div class="p-4 hover:bg-white/[0.02] transition-colors">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-2">
                                <span
                                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border {getLevelColor(
                                        mode === 'audit' ? 'audit' : log.level
                                    )}"
                                >
                                    {mode === 'audit'
                                        ? log.action?.slice(0, 3)
                                        : log.level?.slice(0, 1)}
                                </span>
                                <span class="text-xs text-slate-400 font-mono">
                                    {formatTime(log.timestamp)}
                                </span>
                            </div>
                            <button
                                on:click={() => toggleDetails(log.id)}
                                class="text-slate-500 hover:text-white"
                            >
                                {isExpanded ? '▲' : '▼'}
                            </button>
                        </div>

                        <div class="mb-2">
                            <span class="text-white font-medium block mb-1">
                                {mode === 'audit' ? log.action : log.message}
                            </span>
                            {#if log.targetId}
                                <button
                                    class="text-xs text-primary-400 hover:underline"
                                    on:click={() => quickFilter(log.targetId || '')}
                                >
                                    Target: {log.targetId.slice(0, 8)}...
                                </button>
                            {/if}
                        </div>

                        {#if isExpanded}
                            <div
                                transition:slide
                                class="space-y-3 mt-3 pt-3 border-t border-white/5"
                            >
                                <div
                                    class="bg-black/30 rounded-lg p-3 text-xs font-mono text-slate-300"
                                >
                                    {JSON.stringify(log.details, null, 2)}
                                </div>
                                <div
                                    class="flex justify-between items-center bg-white/5 p-2 rounded-lg"
                                >
                                    <span class="text-xs text-slate-400">Actor:</span>
                                    <button
                                        class="text-xs font-mono text-primary-300"
                                        on:click={() =>
                                            quickFilter(log.userId || log.adminId || '')}
                                    >
                                        {log.userId || log.adminId || 'System'}
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>

            <!-- LOAD MORE -->
            {#if logs.length >= logLimit}
                <div class="p-4 flex justify-center border-t border-white/5">
                    <button
                        on:click={loadMore}
                        class="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider py-2 px-4 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        Cargar más
                    </button>
                </div>
            {/if}
        {/if}
    </div>
</div>
