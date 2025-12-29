<script lang="ts">
    import { onMount } from "svelte";
    import { db } from "$lib/firebase";
    import {
        collection,
        query,
        getDocs,
        doc,
        updateDoc,
        deleteDoc,
        orderBy,
        where,
    } from "firebase/firestore";

    interface Proposal {
        id: string;
        title: string;
        description: string;
        author: string;
        authorEmail: string;
        votes: number;
        status: "pending" | "approved" | "rejected" | "implemented";
        createdAt: any;
        category: "album" | "feature" | "improvement";
    }

    let proposals: Proposal[] = [];
    let filteredProposals: Proposal[] = [];
    let loading = true;
    let filterStatus: "all" | "pending" | "approved" | "implemented" = "all";
    let statusMessage = "";

    onMount(async () => {
        await loadProposals();
    });

    async function loadProposals() {
        loading = true;
        try {
            const proposalsRef = collection(db, "proposals");
            const q = query(proposalsRef, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);

            proposals = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Proposal[];

            applyFilters();
        } catch (e: any) {
            console.error(e);
            statusMessage = "❌ Error al cargar propuestas: " + e.message;
        } finally {
            loading = false;
        }
    }

    function applyFilters() {
        filteredProposals = proposals.filter((proposal) => {
            if (filterStatus === "all") return true;
            return proposal.status === filterStatus;
        });
    }

    $: {
        filterStatus;
        applyFilters();
    }

    async function updateStatus(
        proposal: Proposal,
        newStatus: Proposal["status"],
    ) {
        try {
            const proposalRef = doc(db, "proposals", proposal.id);
            await updateDoc(proposalRef, {
                status: newStatus,
                updatedAt: Date.now(),
            });

            proposal.status = newStatus;
            proposals = proposals;
            applyFilters();

            statusMessage = `✅ Propuesta "${proposal.title}" marcada como ${newStatus}`;
            setTimeout(() => (statusMessage = ""), 3000);
        } catch (e: any) {
            statusMessage = "❌ Error: " + e.message;
        }
    }

    async function deleteProposal(proposal: Proposal) {
        if (!confirm(`¿Eliminar propuesta "${proposal.title}"?`)) return;

        try {
            await deleteDoc(doc(db, "proposals", proposal.id));
            proposals = proposals.filter((p) => p.id !== proposal.id);
            applyFilters();

            statusMessage = `✅ Propuesta eliminada`;
            setTimeout(() => (statusMessage = ""), 3000);
        } catch (e: any) {
            statusMessage = "❌ Error: " + e.message;
        }
    }

    function getCategoryIcon(category: string) {
        if (category === "album") return "🎵";
        if (category === "feature") return "⚡";
        return "🔧";
    }

    function getStatusColor(status: string) {
        if (status === "approved") return "text-green-400 bg-green-500/20";
        if (status === "rejected") return "text-red-400 bg-red-500/20";
        if (status === "implemented") return "text-blue-400 bg-blue-500/20";
        return "text-yellow-400 bg-yellow-500/20";
    }
</script>

<div class="animate-fade-in">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-white mb-2">
            Propuestas de Usuarios PRO
        </h2>
        <p class="text-slate-400">Gestiona las propuestas de la comunidad</p>
    </div>

    {#if statusMessage}
        <div class="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl">
            {statusMessage}
        </div>
    {/if}

    <!-- Filters -->
    <div class="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
            on:click={() => (filterStatus = "all")}
            class="px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all {filterStatus ===
            'all'
                ? 'bg-primary-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
        >
            Todas ({proposals.length})
        </button>
        <button
            on:click={() => (filterStatus = "pending")}
            class="px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all {filterStatus ===
            'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
        >
            Pendientes ({proposals.filter((p) => p.status === "pending")
                .length})
        </button>
        <button
            on:click={() => (filterStatus = "approved")}
            class="px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all {filterStatus ===
            'approved'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
        >
            Aprobadas ({proposals.filter((p) => p.status === "approved")
                .length})
        </button>
        <button
            on:click={() => (filterStatus = "implemented")}
            class="px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all {filterStatus ===
            'implemented'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
        >
            Implementadas ({proposals.filter((p) => p.status === "implemented")
                .length})
        </button>
    </div>

    <!-- Proposals List -->
    {#if loading}
        <div class="text-center py-12">
            <div
                class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"
            ></div>
            <p class="mt-4 text-slate-400">Cargando propuestas...</p>
        </div>
    {:else if filteredProposals.length === 0}
        <div class="text-center py-12 text-slate-400">
            <svg
                class="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
            </svg>
            <p>
                No hay propuestas {filterStatus !== "all" ? filterStatus : ""}
            </p>
        </div>
    {:else}
        <div class="space-y-4">
            {#each filteredProposals as proposal}
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                >
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <span class="text-2xl"
                                    >{getCategoryIcon(proposal.category)}</span
                                >
                                <h3 class="text-lg font-bold text-white">
                                    {proposal.title}
                                </h3>
                            </div>
                            <p class="text-slate-300 mb-3">
                                {proposal.description}
                            </p>
                            <div
                                class="flex items-center gap-4 text-sm text-slate-400"
                            >
                                <span>Por: {proposal.author}</span>
                                <span>•</span>
                                <span>👍 {proposal.votes} votos</span>
                                <span>•</span>
                                <span
                                    >{new Date(
                                        proposal.createdAt?.seconds * 1000,
                                    ).toLocaleDateString()}</span
                                >
                            </div>
                        </div>
                        <span
                            class="px-3 py-1 rounded-lg text-xs font-bold {getStatusColor(
                                proposal.status,
                            )}"
                        >
                            {proposal.status.toUpperCase()}
                        </span>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2 flex-wrap">
                        {#if proposal.status === "pending"}
                            <button
                                on:click={() =>
                                    updateStatus(proposal, "approved")}
                                class="px-4 py-2 bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-lg font-medium text-sm transition-colors"
                            >
                                ✓ Aprobar
                            </button>
                            <button
                                on:click={() =>
                                    updateStatus(proposal, "rejected")}
                                class="px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg font-medium text-sm transition-colors"
                            >
                                ✗ Rechazar
                            </button>
                        {/if}
                        {#if proposal.status === "approved"}
                            <button
                                on:click={() =>
                                    updateStatus(proposal, "implemented")}
                                class="px-4 py-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg font-medium text-sm transition-colors"
                            >
                                🎉 Marcar como Implementada
                            </button>
                        {/if}
                        <button
                            on:click={() => deleteProposal(proposal)}
                            class="px-4 py-2 bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 rounded-lg font-medium text-sm transition-colors"
                        >
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
