<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    // Esta tab es principalmente informativa y de monitoreo
    // La configuración real de backups se hace en Google Cloud Platform

    interface BackupStatus {
        firestore: {
            lastBackup: string | null;
            nextBackup: string | null;
            status: "active" | "inactive" | "error";
            backupCount: number;
        };
        r2: {
            versioningEnabled: boolean;
            status: "active" | "inactive";
        };
        rejectedFiles: {
            count: number;
            oldestDate: string | null;
        };
    }

    let backupStatus: BackupStatus = {
        firestore: {
            lastBackup: null,
            nextBackup: null,
            status: "inactive",
            backupCount: 0,
        },
        r2: {
            versioningEnabled: false,
            status: "inactive",
        },
        rejectedFiles: {
            count: 0,
            oldestDate: null,
        },
    };

    let loading = true;
    let cleaningRejected = false;

    onMount(async () => {
        await loadBackupStatus();
    });

    async function loadBackupStatus() {
        loading = true;
        try {
            // TODO: Implement API calls to check backup status
            // For now, showing placeholder data

            // In production, this would call:
            // const res = await fetch('/api/admin/backup-status');
            // const data = await res.json();

            // Placeholder
            backupStatus = {
                firestore: {
                    lastBackup: "2025-12-30 23:00:00",
                    nextBackup: "2025-12-31 23:00:00",
                    status: "active",
                    backupCount: 7,
                },
                r2: {
                    versioningEnabled: true,
                    status: "active",
                },
                rejectedFiles: {
                    count: 0,
                    oldestDate: null,
                },
            };
        } catch (error) {
            console.error("Error loading backup status:", error);
        } finally {
            loading = false;
        }
    }

    async function cleanupRejectedFiles() {
        if (!confirm("¿Eliminar archivos rechazados > 30 días?")) return;

        cleaningRejected = true;
        try {
            const res = await fetch("/api/admin/cleanup-rejected", {
                method: "POST",
            });

            if (res.ok) {
                const data = await res.json();
                alert(`✅ ${data.deletedCount || 0} archivos eliminados`);
                await loadBackupStatus();
            } else {
                throw new Error("Failed to cleanup");
            }
        } catch (error) {
            console.error("Error cleaning up:", error);
            alert("Error al limpiar archivos rechazados");
        } finally {
            cleaningRejected = false;
        }
    }

    async function triggerManualBackup() {
        if (
            !confirm(
                "¿Iniciar backup manual de Firestore? Esto puede tardar varios minutos.",
            )
        )
            return;

        try {
            const res = await fetch("/api/admin/trigger-backup", {
                method: "POST",
            });

            if (res.ok) {
                alert(
                    "✅ Backup iniciado. Revisa Google Cloud Console para el progreso.",
                );
            } else {
                throw new Error("Failed to trigger backup");
            }
        } catch (error) {
            console.error("Error triggering backup:", error);
            alert("Error al iniciar backup manual");
        }
    }

    function getStatusColor(status: "active" | "inactive" | "error") {
        switch (status) {
            case "active":
                return "text-green-400";
            case "inactive":
                return "text-slate-500";
            case "error":
                return "text-red-400";
        }
    }

    function getStatusIcon(status: "active" | "inactive" | "error") {
        switch (status) {
            case "active":
                return "✅";
            case "inactive":
                return "⏸️";
            case "error":
                return "❌";
        }
    }
</script>

<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-2xl font-bold text-white mb-1">
                Sistema de Backups
            </h2>
            <p class="text-slate-400">
                Monitoreo y gestión de respaldos automáticos
            </p>
        </div>
    </div>

    <!-- Warning Banner (if not configured) -->
    {#if backupStatus.firestore.status === "inactive"}
        <div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <div class="flex items-start gap-4">
                <div class="text-3xl">⚠️</div>
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-red-300 mb-2">
                        Backups No Configurados
                    </h3>
                    <p class="text-red-200 mb-4">
                        Los backups automáticos de Firestore no están activos.
                        Esto pone en riesgo los datos del proyecto.
                    </p>
                    <a
                        href="https://console.cloud.google.com/firestore"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all"
                    >
                        Configurar en Google Cloud
                        <svg
                            class="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    {/if}

    <!-- Backup Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Firestore Backups -->
        <div
            class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
            <div class="flex items-start justify-between mb-4">
                <div>
                    <div class="text-3xl mb-2">🔥</div>
                    <h3 class="text-lg font-bold text-white">Firestore</h3>
                </div>
                <span
                    class="px-3 py-1 rounded-full text-xs font-bold {getStatusColor(
                        backupStatus.firestore.status,
                    )} bg-current/10"
                >
                    {getStatusIcon(backupStatus.firestore.status)}
                    {backupStatus.firestore.status.toUpperCase()}
                </span>
            </div>

            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-slate-400">Último Backup:</span>
                    <span class="text-white font-medium">
                        {backupStatus.firestore.lastBackup || "N/A"}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-400">Próximo:</span>
                    <span class="text-white font-medium">
                        {backupStatus.firestore.nextBackup || "N/A"}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-400">Backups Totales:</span>
                    <span class="text-white font-medium">
                        {backupStatus.firestore.backupCount}
                    </span>
                </div>
            </div>

            <button
                on:click={triggerManualBackup}
                class="w-full mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-all"
            >
                Backup Manual
            </button>
        </div>

        <!-- R2 Versioning -->
        <div
            class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
            <div class="flex items-start justify-between mb-4">
                <div>
                    <div class="text-3xl mb-2">☁️</div>
                    <h3 class="text-lg font-bold text-white">R2 Versioning</h3>
                </div>
                <span
                    class="px-3 py-1 rounded-full text-xs font-bold {getStatusColor(
                        backupStatus.r2.status,
                    )} bg-current/10"
                >
                    {getStatusIcon(backupStatus.r2.status)}
                    {backupStatus.r2.status.toUpperCase()}
                </span>
            </div>

            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-slate-400">Versionado:</span>
                    <span class="text-white font-medium">
                        {backupStatus.r2.versioningEnabled
                            ? "Habilitado ✓"
                            : "Deshabilitado"}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-400">Retención:</span>
                    <span class="text-white font-medium">5 versiones</span>
                </div>
            </div>

            <a
                href="https://dash.cloudflare.com/r2"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all inline-flex items-center justify-center gap-2"
            >
                Configurar R2
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                </svg>
            </a>
        </div>

        <!-- Rejected Files -->
        <div
            class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6"
        >
            <div class="flex items-start justify-between mb-4">
                <div>
                    <div class="text-3xl mb-2">🗑️</div>
                    <h3 class="text-lg font-bold text-white">
                        Archivos Rechazados
                    </h3>
                </div>
            </div>

            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-slate-400">Pendientes:</span>
                    <span class="text-white font-medium">
                        {backupStatus.rejectedFiles.count}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-400">Más Antiguo:</span>
                    <span class="text-white font-medium">
                        {backupStatus.rejectedFiles.oldestDate || "N/A"}
                    </span>
                </div>
            </div>

            <button
                on:click={cleanupRejectedFiles}
                disabled={cleaningRejected ||
                    backupStatus.rejectedFiles.count === 0}
                class="w-full mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {cleaningRejected ? "Limpiando..." : "Limpiar > 30 días"}
            </button>
        </div>
    </div>

    <!-- Documentation Link -->
    <div class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
        <div class="flex items-start gap-4">
            <div class="text-3xl">📘</div>
            <div class="flex-1">
                <h3 class="text-lg font-bold text-blue-300 mb-2">
                    Configuración de Backups
                </h3>
                <p class="text-blue-200 mb-4 text-sm">
                    Para configurar backups automáticos de Firestore, sigue la
                    documentación en <code class="px-2 py-1 bg-black/20 rounded"
                        >.agent/PENDING_FIXES.md</code
                    > sección 5.
                </p>
                <p class="text-blue-200 text-sm">
                    Requiere acceso a Google Cloud Platform y configuración de
                    Cloud Scheduler.
                </p>
            </div>
        </div>
    </div>
</div>
