<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import BoltIcon from "$lib/components/icons/BoltIcon.svelte";

    let status = {
        firebase: "checking",
        r2: "checking",
    };

    let interval: any;
    let loading = true;

    async function checkHealth() {
        loading = true;
        try {
            const res = await fetch("/api/health");
            if (res.ok) {
                const data = await res.json();
                status = data;
            } else {
                status = { firebase: "error", r2: "error" };
            }
        } catch (e) {
            status = { firebase: "error", r2: "error" };
        } finally {
            loading = false;
        }
    }

    let cleaning = false;
    async function cleanTempFiles() {
        if (!confirm("¿Limpiar archivos temporales de R2 (más de 3 días)?"))
            return;
        cleaning = true;
        try {
            const res = await fetch("/api/admin/cleanup-r2", {
                method: "POST",
            });
            const data = await res.json();
            alert(data.message || "Limpieza completada");
        } catch (e) {
            alert("Error en limpieza");
        } finally {
            cleaning = false;
        }
    }

    onMount(() => {
        checkHealth();
        // Check every 30 seconds
        interval = setInterval(checkHealth, 30000);
    });

    onDestroy(() => {
        if (interval) clearInterval(interval);
    });
</script>

<div
    class="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md"
>
    <div class="flex items-center gap-2">
        <div
            class="w-2 h-2 rounded-full {status.firebase === 'connected'
                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse'
                : status.firebase === 'checking'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'}"
        ></div>
        <span class="text-xs font-mono text-slate-400 font-bold tracking-wide"
            >FIREBASE</span
        >
    </div>

    <div class="w-px h-4 bg-white/10"></div>

    <div class="flex items-center gap-2">
        <div
            class="w-2 h-2 rounded-full {status.r2 === 'connected'
                ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse'
                : status.r2 === 'checking'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'}"
        ></div>
        <span class="text-xs font-mono text-slate-400 font-bold tracking-wide"
            >CLOUDFLARE R2</span
        >
    </div>

    <div class="w-px h-4 bg-white/10"></div>

    <button
        on:click={cleanTempFiles}
        disabled={cleaning}
        class="text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        title="Eliminar archivos temporales > 3 días"
    >
        {cleaning ? "🧹..." : "🧹 Limpiar Temp"}
    </button>
</div>
