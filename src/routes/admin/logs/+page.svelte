<script lang="ts">
    import { onMount } from "svelte";
    import { userSubscription } from "$lib/subscription/userSubscription";
    // @ts-ignore
    import { goto } from "$app/navigation";
    import { db } from "$lib/firebase";
    import {
        collection,
        query,
        orderBy,
        limit,
        getDocs,
    } from "firebase/firestore";
    import { fade, slide } from "svelte/transition";

    let logs: any[] = [];
    let displayedLogs: any[] = [];
    let loading = true;
    let error: string | null = null;

    // Filters
    let filterLevel: "all" | "error" | "warn" | "info" = "all";
    let searchTerm = "";

    // Expanded rows state
    let expandedRows = new Set<string>();

    onMount(() => {
        const unsubscribe = userSubscription.subscribe(async ($sub) => {
            if (!$sub.loading) {
                if (!$sub.profile?.isAdmin) {
                    goto("/");
                    return;
                }
                await loadLogs();
                loading = false;
            }
        });
        return unsubscribe;
    });

    async function loadLogs() {
        try {
            loading = true;
            const q = query(
                collection(db, "system_logs"),
                orderBy("timestamp", "desc"),
                limit(100),
            );

            const querySnapshot = await getDocs(q);
            logs = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate(),
            }));
            filterLogs();
        } catch (e: any) {
            console.error("Error loading logs:", e);
            error = e.message;
        } finally {
            loading = false;
        }
    }

    function filterLogs() {
        let temp = [...logs];

        if (filterLevel !== "all") {
            temp = temp.filter((l) => l.level === filterLevel);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            temp = temp.filter(
                (l) =>
                    l.message.toLowerCase().includes(term) ||
                    (l.details && l.details.toLowerCase().includes(term)),
            );
        }

        displayedLogs = temp;
    }

    // Reactive filtering
    $: {
        filterLevel;
        searchTerm;
        if (logs.length) filterLogs();
    }

    function toggleRow(id: string) {
        if (expandedRows.has(id)) {
            expandedRows.delete(id);
        } else {
            expandedRows.add(id);
        }
        expandedRows = expandedRows; // trigger update
    }

    function getLevelIcon(level: string) {
        switch (level) {
            case "error":
                return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
            case "warn":
                return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
            default:
                return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
        }
    }

    function getLevelStyles(level: string) {
        switch (level) {
            case "error":
                return "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(251,113,133,0.2)]";
            case "warn":
                return "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]";
            default:
                return "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(96,165,250,0.2)]";
        }
    }

    function formatDate(date: Date) {
        if (!date) return "-";
        return new Intl.DateTimeFormat("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "short",
        }).format(date);
    }

    function setFilter(level: string) {
        filterLevel = level as "all" | "error" | "warn" | "info";
    }
</script>

<div
    class="min-h-screen bg-[#0B1120] text-slate-300 font-sans p-6 md:p-12 pb-24"
>
    <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div
            class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
            <div>
                <h1
                    class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tight mb-2"
                >
                    System Logs
                </h1>
                <p
                    class="text-slate-400 font-mono text-sm flex items-center gap-2"
                >
                    <span
                        class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                    ></span>
                    Sistema en línea • Monitoreo activo
                </p>
            </div>

            <div class="flex gap-3">
                <button
                    on:click={loadLogs}
                    class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-sm font-medium flex items-center gap-2 active:scale-95"
                    disabled={loading}
                >
                    <svg
                        class="w-4 h-4 {loading ? 'animate-spin' : ''}"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        /></svg
                    >
                    Refresh
                </button>
            </div>
        </div>

        <!-- Controls Bar -->
        <div
            class="bg-[#131B2D] border border-white/5 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 shadow-xl"
        >
            <!-- Search -->
            <div class="relative flex-1">
                <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                    <svg
                        class="h-4 w-4 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    bind:value={searchTerm}
                    placeholder="Buscar en logs..."
                    class="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-black/20 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 sm:text-sm transition-all"
                />
            </div>

            <!-- Filters -->
            <div class="flex p-1 bg-black/20 rounded-xl border border-white/5">
                {#each ["all", "error", "warn", "info"] as level}
                    <button
                        on:click={() => setFilter(level)}
                        class="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all {filterLevel ===
                        level
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300'}"
                    >
                        {level}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Logs Terminal -->
        <div
            class="bg-[#0f1623] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative min-h-[400px]"
        >
            {#if loading && logs.length === 0}
                <div
                    class="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-sm"
                >
                    <div class="flex flex-col items-center">
                        <div
                            class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"
                        ></div>
                        <span
                            class="text-indigo-400 font-mono text-sm animate-pulse"
                            >Cargando datos...</span
                        >
                    </div>
                </div>
            {:else if displayedLogs.length === 0}
                <div
                    class="flex flex-col items-center justify-center py-24 text-slate-500"
                >
                    <svg
                        class="w-16 h-16 mb-4 opacity-20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        /></svg
                    >
                    <p class="font-mono text-sm">No se encontraron registros</p>
                </div>
            {:else}
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-white/5 bg-[#131B2D]">
                            <th
                                class="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24"
                                >Nivel</th
                            >
                            <th
                                class="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-40"
                                >Tiempo</th
                            >
                            <th
                                class="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                                >Mensaje</th
                            >
                        </tr>
                    </thead>
                    <tbody class="text-sm font-mono divide-y divide-white/5">
                        {#each displayedLogs as log (log.id)}
                            {@const isExpanded = expandedRows.has(log.id)}
                            <tr
                                class="hover:bg-white/[0.02] transition-colors cursor-pointer group {isExpanded
                                    ? 'bg-white/[0.02]'
                                    : ''}"
                                on:click={() => toggleRow(log.id)}
                            >
                                <td
                                    class="py-3 px-6 whitespace-nowrap align-top"
                                >
                                    <div
                                        class="flex items-center gap-2 {getLevelStyles(
                                            log.level,
                                        )} px-2 py-1 rounded w-fit border text-[10px] font-bold uppercase tracking-wider"
                                    >
                                        {@html getLevelIcon(log.level)}
                                        {log.level}
                                    </div>
                                </td>
                                <td
                                    class="py-4 px-6 whitespace-nowrap text-slate-500 align-top text-xs"
                                >
                                    {formatDate(log.timestamp)}
                                </td>
                                <td class="py-4 px-6 text-slate-300 align-top">
                                    <div
                                        class="flex items-start justify-between gap-4"
                                    >
                                        <span
                                            class="break-all {log.level ===
                                            'error'
                                                ? 'text-rose-200'
                                                : ''}">{log.message}</span
                                        >
                                        {#if log.details}
                                            <svg
                                                class="w-4 h-4 text-slate-600 transform transition-transform {isExpanded
                                                    ? 'rotate-180'
                                                    : ''}"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                ><path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M19 9l-7 7-7-7"
                                                /></svg
                                            >
                                        {/if}
                                    </div>

                                    {#if isExpanded && log.details}
                                        <div
                                            transition:slide={{ duration: 200 }}
                                            class="mt-4 bg-black/40 rounded-lg p-4 border border-white/5 overflow-x-auto"
                                        >
                                            <div
                                                class="text-[10px] text-slate-500 mb-2 uppercase tracking-wide"
                                            >
                                                Detalles Técnicos
                                            </div>
                                            <pre
                                                class="text-xs text-indigo-300 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">{log.details}</pre>

                                            <div
                                                class="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-4 text-xs"
                                            >
                                                <div>
                                                    <span
                                                        class="text-slate-500 block"
                                                        >Usuario ID</span
                                                    >
                                                    <span
                                                        class="text-slate-300 font-mono"
                                                        >{log.userId ||
                                                            "N/A"}</span
                                                    >
                                                </div>
                                                <div>
                                                    <span
                                                        class="text-slate-500 block"
                                                        >User Agent</span
                                                    >
                                                    <span
                                                        class="text-slate-300 font-mono truncate block"
                                                        title={log.userAgent}
                                                        >{log.userAgent ||
                                                            "N/A"}</span
                                                    >
                                                </div>
                                            </div>
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
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
</style>
