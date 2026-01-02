<script lang="ts">
    import { userStore } from '$lib/auth/userStore';
    import { db } from '$lib/firebase';
    import {
        collection,
        addDoc,
        onSnapshot,
        query,
        orderBy,
        where,
        serverTimestamp,
    } from 'firebase/firestore';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { scale, fade } from 'svelte/transition';
    import { clickOutside } from '$lib/actions/clickOutside';

    interface BugReport {
        id: string;
        title: string;
        description: string;
        steps: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        browser: string;
        os: string;
        author: string;
        authorUid: string | null;
        status: 'reported' | 'reviewing' | 'fixed' | 'not-a-bug';
        createdAt: Date;
        resolvedAt?: Date;
        adminNotes?: string;
    }

    let bugs: BugReport[] = [];
    let unsubscribe: (() => void) | null = null;

    let showNewReport = false;
    let newTitle = '';
    let newDescription = '';
    let newSteps = '';
    let newSeverity: BugReport['severity'] = 'medium';
    let newBrowser = '';
    let newOS = '';
    let filterStatus: 'all' | BugReport['status'] = 'all';
    let filterSeverity: 'all' | BugReport['severity'] = 'all';
    let isSubmitting = false;

    // Dropdown States
    let openStatusMenu = false;
    let openSeverityMenu = false;

    // Typed Options
    const statusOptions: (BugReport['status'] | 'all')[] = [
        'all',
        'reported',
        'reviewing',
        'fixed',
        'not-a-bug',
    ];
    const severityOptions: (BugReport['severity'] | 'all')[] = [
        'all',
        'critical',
        'high',
        'medium',
        'low',
    ];

    $: currentUserId = $userStore.user?.uid || null;
    $: filteredBugs = bugs.filter((bug) => {
        if (filterStatus !== 'all' && bug.status !== filterStatus) return false;
        if (filterSeverity !== 'all' && bug.severity !== filterSeverity) return false;
        return true;
    });

    onMount(() => {
        // Auto-detect browser and OS
        if (browser) {
            detectUserAgent();
        }

        // Subscribe to bug reports
        const bugsRef = collection(db, 'bug_reports');
        const q = query(bugsRef, orderBy('createdAt', 'desc'));

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

    function detectUserAgent() {
        const ua = navigator.userAgent;

        // Detect Browser
        if (ua.includes('Chrome') && !ua.includes('Edg')) newBrowser = 'Chrome';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) newBrowser = 'Safari';
        else if (ua.includes('Firefox')) newBrowser = 'Firefox';
        else if (ua.includes('Edg')) newBrowser = 'Edge';
        else newBrowser = 'Otro';

        // Detect OS
        if (ua.includes('Win')) newOS = 'Windows';
        else if (ua.includes('Mac')) newOS = 'macOS';
        else if (ua.includes('Linux')) newOS = 'Linux';
        else if (ua.includes('iPhone') || ua.includes('iPad')) newOS = 'iOS';
        else if (ua.includes('Android')) newOS = 'Android';
        else newOS = 'Otro';
    }

    async function submitBugReport() {
        const title = newTitle.trim();
        const description = newDescription.trim();

        if (title.length < 5) {
            alert('El título es muy corto (mínimo 5 caracteres).');
            return;
        }
        if (description.length < 10) {
            alert('Por favor detalla más el problema (mínimo 10 caracteres).');
            return;
        }

        isSubmitting = true;

        try {
            await addDoc(collection(db, 'bug_reports'), {
                title: title,
                description: description,
                steps: newSteps.trim(),
                severity: newSeverity,
                browser: newBrowser,
                os: newOS,
                author: $userStore.user?.displayName || 'Usuario Anónimo',
                authorUid: currentUserId,
                status: 'reported',
                createdAt: serverTimestamp(),
            });

            newTitle = '';
            newDescription = '';
            newSteps = '';
            newSeverity = 'medium';
            showNewReport = false;

            alert('✅ Bug reportado. ¡Gracias por tu ayuda!');
        } catch (error: any) {
            console.error('Error reporting bug:', error);
            if (error.code === 'permission-denied') {
                alert(
                    'Error de permisos. Asegúrate de estar conectado o que los datos sean válidos.'
                );
            } else {
                alert('Error al enviar reporte: ' + error.message);
            }
        } finally {
            isSubmitting = false;
        }
    }

    function getSeverityColor(severity: BugReport['severity']) {
        switch (severity) {
            case 'critical':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'high':
                return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
            case 'medium':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
            case 'low':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        }
    }

    function getSeverityLabel(severity: BugReport['severity']) {
        switch (severity) {
            case 'critical':
                return '🔴 Crítico';
            case 'high':
                return '🟠 Alto';
            case 'medium':
                return '🟡 Medio';
            case 'low':
                return '🔵 Bajo';
        }
    }

    function getStatusColor(status: BugReport['status']) {
        switch (status) {
            case 'fixed':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'reviewing':
                return 'bg-primary-500/20 text-primary-300 border-primary-500/30';
            case 'not-a-bug':
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
            default:
                return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        }
    }

    function getStatusLabel(status: BugReport['status']) {
        switch (status) {
            case 'fixed':
                return '✅ Solucionado';
            case 'reviewing':
                return '🔍 En Revisión';
            case 'not-a-bug':
                return '❌ No es un Bug';
            default:
                return '📝 Reportado';
        }
    }
</script>

<svelte:head>
    <title>Reportar Bugs | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-[#0B1120] text-white font-poppins pb-32 pt-24 px-4 md:px-8">
    <div class="max-w-5xl mx-auto">
        <!-- Back Button -->
        <div class="mb-6">
            <a
                href="/"
                class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
                Volver al Inicio
            </a>
        </div>

        <!-- Header -->
        <div class="mb-12">
            <div class="flex items-center gap-4 mb-4">
                <div
                    class="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-red-900/50"
                >
                    🐛
                </div>
                <div>
                    <h1
                        class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
                    >
                        Reporte de Bugs
                    </h1>
                    <p class="text-slate-400 mt-2">
                        Ayúdanos a mejorar ChillChess reportando problemas
                    </p>
                </div>
            </div>
        </div>

        <!-- Controls -->
        <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
            <!-- Filters -->
            <div class="flex flex-wrap items-center gap-3 relative z-20">
                <!-- Status Filter -->
                <div
                    class="relative"
                    use:clickOutside
                    on:click_outside={() => (openStatusMenu = false)}
                >
                    <button
                        on:click={() => (openStatusMenu = !openStatusMenu)}
                        class="flex items-center gap-2 px-4 py-2.5 bg-[#131b2e] hover:bg-[#1e2a45] border border-white/10 rounded-xl transition-all min-w-[180px] justify-between group {openStatusMenu
                            ? 'ring-1 ring-primary-500 border-primary-500'
                            : ''}"
                    >
                        <span class="text-sm font-medium text-slate-200">
                            {filterStatus === 'all'
                                ? 'Todos los Estados'
                                : getStatusLabel(filterStatus)}
                        </span>
                        <svg
                            class="w-4 h-4 text-slate-500 transition-transform duration-300 {openStatusMenu
                                ? 'rotate-180 text-primary-500'
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

                    {#if openStatusMenu}
                        <div
                            transition:scale={{ duration: 150, start: 0.95 }}
                            class="absolute top-full left-0 mt-2 w-full bg-[#131b2e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 flex flex-col"
                        >
                            {#each statusOptions as status}
                                <button
                                    on:click={() => {
                                        filterStatus = status;
                                        openStatusMenu = false;
                                    }}
                                    class="text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2 {filterStatus ===
                                    status
                                        ? 'text-primary-400 bg-primary-500/10'
                                        : 'text-slate-300'}"
                                >
                                    {#if status === 'all'}
                                        Todos los Estados
                                    {:else}
                                        {getStatusLabel(status)}
                                    {/if}
                                    {#if filterStatus === status}
                                        <div
                                            class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"
                                        ></div>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>

                <!-- Severity Filter -->
                <div
                    class="relative"
                    use:clickOutside
                    on:click_outside={() => (openSeverityMenu = false)}
                >
                    <button
                        on:click={() => (openSeverityMenu = !openSeverityMenu)}
                        class="flex items-center gap-2 px-4 py-2.5 bg-[#131b2e] hover:bg-[#1e2a45] border border-white/10 rounded-xl transition-all min-w-[180px] justify-between group {openSeverityMenu
                            ? 'ring-1 ring-primary-500 border-primary-500'
                            : ''}"
                    >
                        <span class="text-sm font-medium text-slate-200">
                            {filterSeverity === 'all'
                                ? 'Todas las Severidades'
                                : getSeverityLabel(filterSeverity)}
                        </span>
                        <svg
                            class="w-4 h-4 text-slate-500 transition-transform duration-300 {openSeverityMenu
                                ? 'rotate-180 text-primary-500'
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

                    {#if openSeverityMenu}
                        <div
                            transition:scale={{ duration: 150, start: 0.95 }}
                            class="absolute top-full left-0 mt-2 w-full bg-[#131b2e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 flex flex-col"
                        >
                            {#each severityOptions as severity}
                                <button
                                    on:click={() => {
                                        filterSeverity = severity;
                                        openSeverityMenu = false;
                                    }}
                                    class="text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2 {filterSeverity ===
                                    severity
                                        ? 'text-primary-400 bg-primary-500/10'
                                        : 'text-slate-300'}"
                                >
                                    {#if severity === 'all'}
                                        Todas las Severidades
                                    {:else}
                                        {getSeverityLabel(severity)}
                                    {/if}
                                    {#if filterSeverity === severity}
                                        <div
                                            class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"
                                        ></div>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Submit Button -->
            <button
                on:click={() => (showNewReport = !showNewReport)}
                class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-red-900/30 w-full sm:w-auto"
            >
                + Reportar Bug
            </button>
        </div>

        <!-- New Bug Report Form (Floating Modal) -->
        {#if showNewReport}
            <div
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm focus:outline-none"
                transition:fade={{ duration: 200 }}
                on:click={() => (showNewReport = false)}
                on:keydown={(e) => e.key === 'Escape' && (showNewReport = false)}
                role="button"
                tabindex="0"
                aria-label="Cerrar modal"
            >
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div
                    class="bg-[#131b2e] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative overflow-y-auto max-h-[90vh] cursor-default"
                    on:click|stopPropagation
                    on:keydown|stopPropagation
                    role="dialog"
                    aria-modal="true"
                    tabindex="-1"
                    transition:scale={{ duration: 200, start: 0.95 }}
                >
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold text-white">Nuevo Reporte de Bug</h3>
                        <button
                            on:click={() => (showNewReport = false)}
                            class="text-slate-400 hover:text-white"
                        >
                            <svg
                                class="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                                /></svg
                            >
                        </button>
                    </div>

                    <div class="space-y-4">
                        <!-- Severity -->
                        <div>
                            <p class="block text-sm font-medium text-slate-400 mb-2">Severidad</p>
                            <div class="flex flex-wrap gap-3" role="group">
                                <button
                                    on:click={() => (newSeverity = 'low')}
                                    class="px-4 py-2 rounded-xl transition-all {newSeverity ===
                                    'low'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    🔵 Bajo
                                </button>
                                <button
                                    on:click={() => (newSeverity = 'medium')}
                                    class="px-4 py-2 rounded-xl transition-all {newSeverity ===
                                    'medium'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    🟡 Medio
                                </button>
                                <button
                                    on:click={() => (newSeverity = 'high')}
                                    class="px-4 py-2 rounded-xl transition-all {newSeverity ===
                                    'high'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    🟠 Alto
                                </button>
                                <button
                                    on:click={() => (newSeverity = 'critical')}
                                    class="px-4 py-2 rounded-xl transition-all {newSeverity ===
                                    'critical'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    🔴 Crítico
                                </button>
                            </div>
                        </div>

                        <!-- Title -->
                        <div>
                            <label
                                for="bug-title"
                                class="block text-sm font-medium text-slate-400 mb-2">Título</label
                            >
                            <input
                                id="bug-title"
                                bind:value={newTitle}
                                type="text"
                                placeholder="Ej: Reproductor no pausa en móvil"
                                class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-red-500 focus:outline-none transition-colors"
                                maxlength="100"
                            />
                        </div>

                        <!-- Description -->
                        <div>
                            <label
                                for="bug-description"
                                class="block text-sm font-medium text-slate-400 mb-2"
                                >Descripción del Problema</label
                            >
                            <textarea
                                id="bug-description"
                                bind:value={newDescription}
                                placeholder="Describe qué sucede exactamente..."
                                class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-red-500 focus:outline-none transition-colors resize-none"
                                rows="3"
                                maxlength="500"
                            ></textarea>
                        </div>

                        <!-- Steps to Reproduce -->
                        <div>
                            <label
                                for="bug-steps"
                                class="block text-sm font-medium text-slate-400 mb-2"
                                >Pasos para Reproducir (Opcional)</label
                            >
                            <textarea
                                id="bug-steps"
                                bind:value={newSteps}
                                placeholder="1. Ir a...&#10;2. Hacer clic en...&#10;3. Observar..."
                                class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-red-500 focus:outline-none transition-colors resize-none font-mono text-sm"
                                rows="3"
                                maxlength="300"
                            ></textarea>
                        </div>

                        <!-- Browser & OS -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    for="bug-browser"
                                    class="block text-sm font-medium text-slate-400 mb-2"
                                    >Navegador</label
                                >
                                <input
                                    id="bug-browser"
                                    bind:value={newBrowser}
                                    type="text"
                                    placeholder="Chrome, Firefox, Safari..."
                                    class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-red-500 focus:outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label
                                    for="bug-os"
                                    class="block text-sm font-medium text-slate-400 mb-2"
                                    >Sistema Operativo</label
                                >
                                <input
                                    id="bug-os"
                                    bind:value={newOS}
                                    type="text"
                                    placeholder="Windows, Mac, iOS..."
                                    class="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-red-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-3 pt-2">
                            <button
                                on:click={submitBugReport}
                                disabled={isSubmitting}
                                class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all flex-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/30"
                            >
                                {isSubmitting ? 'Enviando...' : '📩 Enviar Reporte'}
                            </button>
                            <button
                                on:click={() => (showNewReport = false)}
                                class="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Bug Reports List -->
        <div class="space-y-4">
            {#if filteredBugs.length === 0}
                <div class="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                    <span class="text-4xl block mb-4">🐛</span>
                    <p class="text-slate-400">
                        {bugs.length === 0
                            ? 'No hay bugs reportados aún. ¡Esperemos que siga así!'
                            : 'No hay bugs con los filtros seleccionados.'}
                    </p>
                </div>
            {/if}

            {#each filteredBugs as bug}
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all"
                >
                    <div class="flex flex-col gap-4">
                        <!-- Header -->
                        <div class="flex flex-wrap items-start gap-3">
                            <div class="flex-1 min-w-0">
                                <h3 class="text-xl font-bold text-slate-100 mb-1">
                                    {bug.title}
                                </h3>
                                <p class="text-sm text-slate-400">
                                    Por {bug.author} • {bug.createdAt.toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    class="px-3 py-1 rounded-full text-xs font-bold border {getSeverityColor(
                                        bug.severity
                                    )}"
                                >
                                    {getSeverityLabel(bug.severity)}
                                </span>
                                <span
                                    class="px-3 py-1 rounded-full text-xs font-bold border {getStatusColor(
                                        bug.status
                                    )}"
                                >
                                    {getStatusLabel(bug.status)}
                                </span>
                            </div>
                        </div>

                        <!-- Description -->
                        <p class="text-slate-300 leading-relaxed">
                            {bug.description}
                        </p>

                        <!-- Steps (if provided) -->
                        {#if bug.steps}
                            <div class="bg-black/20 rounded-xl p-4 border border-white/5">
                                <p class="text-xs text-slate-500 uppercase font-bold mb-2">
                                    Pasos para Reproducir:
                                </p>
                                <pre
                                    class="text-sm text-slate-300 whitespace-pre-wrap font-mono">{bug.steps}</pre>
                            </div>
                        {/if}

                        <!-- Environment -->
                        <div class="flex flex-wrap gap-4 text-sm text-slate-500">
                            <div class="flex items-center gap-2">
                                🌐 <span>{bug.browser}</span>
                            </div>
                            <div class="flex items-center gap-2">
                                💻 <span>{bug.os}</span>
                            </div>
                            {#if bug.resolvedAt}
                                <div class="flex items-center gap-2 text-green-400">
                                    ✅ Solucionado el {bug.resolvedAt.toLocaleDateString()}
                                </div>
                            {/if}
                        </div>

                        <!-- Admin Notes (if exists) -->
                        {#if bug.adminNotes}
                            <div
                                class="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4"
                            >
                                <p class="text-xs text-primary-300 uppercase font-bold mb-1">
                                    📝 Nota del equipo:
                                </p>
                                <p class="text-sm text-primary-200">
                                    {bug.adminNotes}
                                </p>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }
</style>
