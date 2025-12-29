<script lang="ts">
    import { onMount } from "svelte";

    // In a real app, these would come from a logging service or Firestore collection
    // For now we'll simulate some system logs based on local storage or session

    interface Log {
        id: string;
        type: "info" | "success" | "warning" | "error";
        message: string;
        timestamp: number;
        module: string;
    }

    let logs: Log[] = [];
    let filterType: "all" | "error" | "warning" = "all";

    onMount(() => {
        // Mock data for demonstration - in production connect to Firestore 'system_logs'
        logs = [
            {
                id: "1",
                type: "info",
                message: "Admin panel initialized",
                timestamp: Date.now(),
                module: "System",
            },
            {
                id: "2",
                type: "success",
                message: "User database connected",
                timestamp: Date.now() - 1000,
                module: "Database",
            },
            {
                id: "3",
                type: "info",
                message: "Checked 145 users status",
                timestamp: Date.now() - 5000,
                module: "Users",
            },
        ];
    });

    $: filteredLogs =
        filterType === "all" ? logs : logs.filter((l) => l.type === filterType);

    function getTypeColor(type: string) {
        switch (type) {
            case "success":
                return "text-green-400 border-green-500/50";
            case "error":
                return "text-red-400 border-red-500/50";
            case "warning":
                return "text-yellow-400 border-yellow-500/50";
            default:
                return "text-blue-400 border-blue-500/50";
        }
    }
</script>

<div class="animate-fade-in">
    <div class="flex items-center justify-between mb-6">
        <div>
            <h2 class="text-2xl font-bold text-white mb-2">Logs del Sistema</h2>
            <p class="text-slate-400">Registro de actividad y errores</p>
        </div>

        <div class="flex gap-2">
            <button
                on:click={() => (filterType = "all")}
                class="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm {filterType ===
                'all'
                    ? 'text-white bg-white/10'
                    : 'text-slate-400'}"
            >
                Todos
            </button>
            <button
                on:click={() => (filterType = "error")}
                class="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm {filterType ===
                'error'
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-slate-400'}"
            >
                Errores
            </button>
        </div>
    </div>

    <div
        class="bg-[#0F172A] border border-white/10 rounded-2xl p-4 font-mono text-sm h-[600px] overflow-y-auto custom-scrollbar"
    >
        {#each filteredLogs as log}
            <div
                class="flex gap-4 p-2 hover:bg-white/5 rounded border-l-2 {getTypeColor(
                    log.type,
                )} mb-1"
            >
                <span class="text-slate-500 w-24 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                    class="font-bold w-24 flex-shrink-0 flex items-center gap-2"
                >
                    [{log.module}]
                </span>
                <span class="text-slate-300">
                    {log.message}
                </span>
            </div>
        {/each}

        {#if filteredLogs.length === 0}
            <div class="text-center py-12 text-slate-500">
                No hay logs para mostrar
            </div>
        {/if}
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #0f172a;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #334155;
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #475569;
    }
</style>
