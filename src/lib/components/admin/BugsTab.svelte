<script lang="ts">
    import { db } from "$lib/firebase";
    import {
        collection,
        query,
        orderBy,
        onSnapshot,
        doc,
        updateDoc,
        Timestamp,
    } from "firebase/firestore";
    import { onMount, onDestroy } from "svelte";

    interface BugReport {
        id: string;
        title: string;
        description: string;
        steps: string;
        severity: "low" | "medium" | "high" | "critical";
        browser: string;
        os: string;
        author: string;
        authorUid: string | null;
        status: "reported" | "reviewing" | "fixed" | "not-a-bug";
        createdAt: Date;
        resolvedAt?: Date;
        adminNotes?: string;
    }

    let bugs: BugReport[] = [];
    let unsubscribe: (() => void) | null = null;
    let filterStatus: "all" | BugReport["status"] = "all";
    let filterSeverity: "all" | BugReport["severity"] = "all";
    let expandedBug: string | null = null;
    let editingNotes: string | null = null;
    let notesText = "";

    $: filteredBugs = bugs.filter((bug) => {
        if (filterStatus !== "all" && bug.status !== filterStatus) return false;
        if (filterSeverity !== "all" && bug.severity !== filterSeverity)
            return false;
        return true;
    });

    $: stats = {
        total: bugs.length,
        reported: bugs.filter((b) => b.status === "reported").length,
        reviewing: bugs.filter((b) => b.status === "reviewing").length,
        fixed: bugs.filter((b) => b.status === "fixed").length,
        critical: bugs.filter((b) => b.severity === "critical").length,
    };

    onMount(() => {
        const bugsRef = collection(db, "bug_reports");
        const q = query(bugsRef, orderBy("createdAt", "desc"));

        unsubscribe = onSnapshot(q, (snapshot) => {
            bugs = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    title: data.title,
                    description: data.description,
                    steps: data.steps,
                    severity: data.severity,
                    browser: data.browser,
                    os: data.os,
                    author: data.author,
                    authorUid: data.authorUid,
                    status: data.status,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    resolvedAt: data.resolvedAt?.toDate(),
                    adminNotes: data.adminNotes,
                } as BugReport;
            });
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    async function updateBugStatus(
        bugId: string,
        newStatus: BugReport["status"],
    ) {
        try {
            const updates: any = {
                status: newStatus,
            };

            if (newStatus === "fixed" || newStatus === "not-a-bug") {
                updates.resolvedAt = Timestamp.now();
            }

            await updateDoc(doc(db, "bug_reports", bugId), updates);
        } catch (error) {
            console.error("Error updating bug status:", error);
            alert("Error al actualizar estado");
        }
    }

    async function saveAdminNotes(bugId: string) {
        try {
            await updateDoc(doc(db, "bug_reports", bugId), {
                adminNotes: notesText.trim(),
            });
            editingNotes = null;
            notesText = "";
        } catch (error) {
            console.error("Error saving notes:", error);
            alert("Error al guardar notas");
        }
    }

    function toggleExpand(bugId: string) {
        expandedBug = expandedBug === bugId ? null : bugId;
    }

    function startEditNotes(bug: BugReport) {
        editingNotes = bug.id;
        notesText = bug.adminNotes || "";
    }

    function getSeverityColor(severity: BugReport["severity"]) {
        switch (severity) {
            case "critical":
                return "bg-red-500";
            case "high":
                return "bg-orange-500";
            case "medium":
                return "bg-yellow-500";
            case "low":
                return "bg-blue-500";
        }
    }

    function getStatusColor(status: BugReport["status"]) {
        switch (status) {
            case "fixed":
                return "bg-green-500 text-white";
            case "reviewing":
                return "bg-primary-500 text-white";
            case "not-a-bug":
                return "bg-slate-500 text-white";
            default:
                return "bg-amber-500 text-white";
        }
    }
</script>

<div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-2xl font-bold text-white mb-1">Gestión de Bugs</h2>
            <p class="text-slate-400">
                Revisa y gestiona reportes de problemas
            </p>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div
            class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4"
        >
            <div class="text-2xl font-bold text-white">{stats.total}</div>
            <div class="text-xs text-slate-400">Total</div>
        </div>
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
            <div class="text-2xl font-bold text-amber-300">
                {stats.reported}
            </div>
            <div class="text-xs text-amber-400">Reportados</div>
        </div>
        <div
            class="bg-primary-500/10 border border-primary-500/30 rounded-2xl p-4"
        >
            <div class="text-2xl font-bold text-primary-300">
                {stats.reviewing}
            </div>
            <div class="text-xs text-primary-400">En Revisión</div>
        </div>
        <div class="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
            <div class="text-2xl font-bold text-green-300">{stats.fixed}</div>
            <div class="text-xs text-green-400">Solucionados</div>
        </div>
        <div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <div class="text-2xl font-bold text-red-300">{stats.critical}</div>
            <div class="text-xs text-red-400">Críticos</div>
        </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
        <select
            bind:value={filterStatus}
            class="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
        >
            <option value="all">Todos los Estados</option>
            <option value="reported">Reportados</option>
            <option value="reviewing">En Revisión</option>
            <option value="fixed">Solucionados</option>
            <option value="not-a-bug">No es Bug</option>
        </select>

        <select
            bind:value={filterSeverity}
            class="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:outline-none appearance-none cursor-pointer"
        >
            <option value="all">Todas las Severidades</option>
            <option value="critical">Crítico</option>
            <option value="high">Alto</option>
            <option value="medium">Medio</option>
            <option value="low">Bajo</option>
        </select>
    </div>

    <!-- Bug List -->
    <div class="space-y-3">
        {#if filteredBugs.length === 0}
            <div
                class="text-center py-12 bg-white/5 rounded-2xl border border-white/10"
            >
                <p class="text-slate-400">
                    {bugs.length === 0
                        ? "No hay bugs reportados"
                        : "No hay bugs con los filtros seleccionados"}
                </p>
            </div>
        {/if}

        {#each filteredBugs as bug}
            <div
                class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
            >
                <!-- Bug Header (Clickable) -->
                <button
                    on:click={() => toggleExpand(bug.id)}
                    class="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-white/5 transition-colors"
                >
                    <!-- Severity Indicator -->
                    <div
                        class="w-1.5 h-12 rounded-full {getSeverityColor(
                            bug.severity,
                        )} flex-shrink-0"
                    ></div>

                    <div class="flex-1 min-w-0">
                        <div class="flex items-start gap-3 mb-2">
                            <h3 class="text-lg font-bold text-white flex-1">
                                {bug.title}
                            </h3>
                            <div class="flex gap-2 flex-shrink-0">
                                <span
                                    class="px-2 py-1 rounded-lg text-xs font-bold {getSeverityColor(
                                        bug.severity,
                                    )} text-white"
                                >
                                    {bug.severity.toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div
                            class="flex flex-wrap gap-3 text-xs text-slate-400"
                        >
                            <span>{bug.author}</span>
                            <span>•</span>
                            <span>{bug.browser} / {bug.os}</span>
                            <span>•</span>
                            <span>
                                {bug.createdAt.toLocaleDateString("es-ES")}
                            </span>
                        </div>
                    </div>

                    <!-- Expand Icon -->
                    <svg
                        class="w-5 h-5 text-slate-400 transition-transform {expandedBug ===
                        bug.id
                            ? 'rotate-180'
                            : ''}"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                <!-- Expanded Content -->
                {#if expandedBug === bug.id}
                    <div
                        class="px-6 pb-6 space-y-4 border-t border-white/10 pt-4"
                    >
                        <!-- Description -->
                        <div>
                            <p
                                class="text-xs text-slate-500 uppercase font-bold mb-2"
                            >
                                Descripción:
                            </p>
                            <p class="text-slate-300 leading-relaxed">
                                {bug.description}
                            </p>
                        </div>

                        <!-- Steps -->
                        {#if bug.steps}
                            <div>
                                <p
                                    class="text-xs text-slate-500 uppercase font-bold mb-2"
                                >
                                    Pasos para Reproducir:
                                </p>
                                <pre
                                    class="bg-black/20 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap font-mono">{bug.steps}</pre>
                            </div>
                        {/if}

                        <!-- Status Management -->
                        <div>
                            <p
                                class="text-xs text-slate-500 uppercase font-bold mb-2"
                            >
                                Estado:
                            </p>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    on:click={() =>
                                        updateBugStatus(bug.id, "reported")}
                                    class="px-4 py-2 rounded-xl transition-all {bug.status ===
                                    'reported'
                                        ? getStatusColor('reported')
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    📝 Reportado
                                </button>
                                <button
                                    on:click={() =>
                                        updateBugStatus(bug.id, "reviewing")}
                                    class="px-4 py-2 rounded-xl transition-all {bug.status ===
                                    'reviewing'
                                        ? getStatusColor('reviewing')
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    🔍 En Revisión
                                </button>
                                <button
                                    on:click={() =>
                                        updateBugStatus(bug.id, "fixed")}
                                    class="px-4 py-2 rounded-xl transition-all {bug.status ===
                                    'fixed'
                                        ? getStatusColor('fixed')
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    ✅ Solucionado
                                </button>
                                <button
                                    on:click={() =>
                                        updateBugStatus(bug.id, "not-a-bug")}
                                    class="px-4 py-2 rounded-xl transition-all {bug.status ===
                                    'not-a-bug'
                                        ? getStatusColor('not-a-bug')
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    ❌ No es Bug
                                </button>
                            </div>
                        </div>

                        <!-- Admin Notes -->
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <p
                                    class="text-xs text-slate-500 uppercase font-bold"
                                >
                                    Notas del Admin:
                                </p>
                                {#if editingNotes !== bug.id}
                                    <button
                                        on:click={() => startEditNotes(bug)}
                                        class="text-xs text-primary-400 hover:text-primary-300"
                                    >
                                        {bug.adminNotes ? "Editar" : "Añadir"}
                                    </button>
                                {/if}
                            </div>

                            {#if editingNotes === bug.id}
                                <div class="space-y-2">
                                    <textarea
                                        bind:value={notesText}
                                        placeholder="Añade notas visibles para los usuarios..."
                                        class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none resize-none"
                                        rows="3"
                                    ></textarea>
                                    <div class="flex gap-2">
                                        <button
                                            on:click={() =>
                                                saveAdminNotes(bug.id)}
                                            class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium"
                                        >
                                            Guardar
                                        </button>
                                        <button
                                            on:click={() =>
                                                (editingNotes = null)}
                                            class="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            {:else if bug.adminNotes}
                                <div
                                    class="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4"
                                >
                                    <p class="text-sm text-primary-200">
                                        {bug.adminNotes}
                                    </p>
                                </div>
                            {:else}
                                <p class="text-sm text-slate-500 italic">
                                    Sin notas
                                </p>
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>
