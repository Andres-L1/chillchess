<script lang="ts">
    import { onMount } from 'svelte';
    import { db } from '$lib/firebase';
    import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
    import { slide } from 'svelte/transition';

    let logs: any[] = [];
    let displayedLogs: any[] = [];
    let loading = true;
    let error: string | null = null;
    let filterLevel: 'all' | 'error' | 'warn' | 'info' = 'all';
    let expandedRows = new Set<string>();

    onMount(async () => {
        await loadLogs();
    });

    async function loadLogs() {
        try {
            loading = true;
            const q = query(
                collection(db, 'system_logs'),
                orderBy('timestamp', 'desc'),
                limit(100)
            );

            const querySnapshot = await getDocs(q);
            logs = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate(),
            }));
            filterLogs();
        } catch (e: any) {
            console.error('Error loading logs:', e);
            error = e.message;
        } finally {
            loading = false;
        }
    }

    function filterLogs() {
        if (filterLevel === 'all') {
            displayedLogs = logs;
        } else {
            displayedLogs = logs.filter((l) => l.level === filterLevel);
        }
    }

    $: if (filterLevel) filterLogs();

    function formatDate(date: Date) {
        if (!date) return '-';
        return new Intl.DateTimeFormat('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: 'short',
        }).format(date);
    }

    function toggleRow(id: string) {
        if (expandedRows.has(id)) {
            expandedRows.delete(id);
        } else {
            expandedRows.add(id);
        }
        expandedRows = expandedRows;
    }

    function getLevelStyles(level: string) {
        switch (level) {
            case 'error':
                return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'warn':
                return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            default:
                return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    }

    function setFilter(level: string) {
        filterLevel = level as 'all' | 'error' | 'warn' | 'info';
    }
</script>

<div class="animate-fade-in space-y-4">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-2xl font-bold text-white mb-2">System Logs</h2>
            <p class="text-slate-400">Monitoreo del sistema en tiempo real</p>
        </div>
        <div class="flex gap-2">
            <button
                on:click={loadLogs}
                class="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300"
            >
                🔄 Recargar
            </button>
        </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 mb-4">
        {#each ['all', 'error', 'warn', 'info'] as level}
            <button
                on:click={() => setFilter(level)}
                class="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all {filterLevel ===
                level
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
            >
                {level}
            </button>
        {/each}
    </div>

    <div
        class="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-xl min-h-[400px]"
    >
        {#if loading && logs.length === 0}
            <div class="p-12 text-center text-slate-500">Cargando logs...</div>
        {:else if displayedLogs.length === 0}
            <div class="p-12 text-center text-slate-500">No hay logs registrados.</div>
        {:else}
            <table class="w-full text-left border-collapse">
                <thead class="bg-black/20 text-xs text-slate-500 uppercase">
                    <tr>
                        <th class="p-4 w-24">Nivel</th>
                        <th class="p-4 w-40">Hora</th>
                        <th class="p-4">Mensaje</th>
                    </tr>
                </thead>
                <tbody class="text-sm font-mono divide-y divide-white/5">
                    {#each displayedLogs as log (log.id)}
                        {@const isExpanded = expandedRows.has(log.id)}
                        <tr
                            class="hover:bg-white/[0.02] cursor-pointer transition-colors"
                            on:click={() => toggleRow(log.id)}
                        >
                            <td class="p-4 align-top">
                                <span
                                    class="px-2 py-1 rounded text-[10px] font-bold uppercase border {getLevelStyles(
                                        log.level
                                    )}"
                                >
                                    {log.level}
                                </span>
                            </td>
                            <td class="p-4 text-slate-500 align-top text-xs">
                                {formatDate(log.timestamp)}
                            </td>
                            <td class="p-4 text-slate-300 align-top">
                                <div class="flex justify-between items-start">
                                    <span>{log.message}</span>
                                    {#if log.details}
                                        <span class="text-xs text-slate-600">
                                            {isExpanded ? '▲' : '▼'}
                                        </span>
                                    {/if}
                                </div>
                                {#if isExpanded && log.details}
                                    <div
                                        transition:slide
                                        class="mt-2 p-3 bg-black/40 rounded border border-white/5 text-xs text-indigo-300 overflow-x-auto"
                                    >
                                        <pre>{log.details}</pre>
                                        {#if log.userAgent}
                                            <div
                                                class="mt-2 text-slate-500 pt-2 border-t border-white/5"
                                            >
                                                UA: {log.userAgent} <br />
                                                User: {log.userId || 'Anon'}
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>

<style>
    /* Add scrollbar styles if needed */
</style>
