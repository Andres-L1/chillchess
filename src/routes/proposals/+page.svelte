<script lang="ts">
    import { userStore } from "$lib/auth/userStore";
    import { userSubscription } from "$lib/subscription/store";
    import { onMount } from "svelte";

    // Mock data - En producción esto vendría de Firestore
    interface Proposal {
        id: string;
        title: string;
        description: string;
        author: string;
        votes: number;
        status: "pending" | "approved" | "rejected" | "implemented";
        createdAt: Date;
        category: "album" | "feature" | "improvement";
    }

    let proposals: Proposal[] = [
        {
            id: "1",
            title: "Álbum de Jazz Nórdico",
            description:
                "Me encantaría tener un álbum de jazz nórdico con influencias de artistas como Nils Frahm.",
            author: "Usuario Pro",
            votes: 24,
            status: "pending",
            createdAt: new Date("2025-12-27"),
            category: "album",
        },
        {
            id: "2",
            title: "Modo Pomodoro Integrado",
            description:
                "Un temporizador Pomodoro (25min trabajo, 5min descanso) integrado directamente en la interfaz.",
            author: "Estudiante Pro",
            votes: 18,
            status: "approved",
            createdAt: new Date("2025-12-26"),
            category: "feature",
        },
        {
            id: "3",
            title: "Playlist de Lluvia Ambient",
            description:
                "Canciones ambient con sonidos de lluvia de fondo para máxima concentración.",
            author: "Desarrollador Pro",
            votes: 32,
            status: "pending",
            createdAt: new Date("2025-12-25"),
            category: "album",
        },
    ];

    let showNewProposal = false;
    let newTitle = "";
    let newDescription = "";
    let newCategory: "album" | "feature" | "improvement" = "feature";
    let sortBy: "votes" | "recent" = "votes";

    $: sortedProposals = [...proposals].sort((a, b) => {
        if (sortBy === "votes") return b.votes - a.votes;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

    $: isPro =
        $userSubscription.tier === "pro" ||
        $userSubscription.tier === "premium";

    function vote(proposalId: string, delta: number) {
        proposals = proposals.map((p) =>
            p.id === proposalId ? { ...p, votes: p.votes + delta } : p,
        );
    }

    function submitProposal() {
        if (!newTitle.trim() || !newDescription.trim()) return;

        const proposal: Proposal = {
            id: Date.now().toString(),
            title: newTitle,
            description: newDescription,
            author: $userStore.user?.displayName || "Usuario Pro",
            votes: 1,
            status: "pending",
            createdAt: new Date(),
            category: newCategory,
        };

        proposals = [proposal, ...proposals];
        newTitle = "";
        newDescription = "";
        showNewProposal = false;
    }

    function getStatusColor(status: Proposal["status"]) {
        switch (status) {
            case "approved":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            case "rejected":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            case "implemented":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            default:
                return "bg-slate-500/20 text-slate-300 border-slate-500/30";
        }
    }

    function getStatusLabel(status: Proposal["status"]) {
        switch (status) {
            case "approved":
                return "✓ Aprobada";
            case "rejected":
                return "✗ Rechazada";
            case "implemented":
                return "🎉 Implementada";
            default:
                return "⏳ Pendiente";
        }
    }

    function getCategoryIcon(category: Proposal["category"]) {
        switch (category) {
            case "album":
                return "🎵";
            case "feature":
                return "⚡";
            case "improvement":
                return "🔧";
        }
    }
</script>

<svelte:head>
    <title>Propuestas | ChillChess</title>
</svelte:head>

<div
    class="min-h-screen bg-[#0B1120] text-white font-poppins pb-32 pt-24 px-4 md:px-8"
>
    <div class="max-w-5xl mx-auto">
        <!-- Back Button -->
        <div class="mb-6">
            <a
                href="/"
                class="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
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
                    class="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-purple-900/50"
                >
                    💡
                </div>
                <div>
                    <h1
                        class="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
                    >
                        Propuestas de Comunidad
                    </h1>
                    <p class="text-slate-400 mt-2">
                        Vota y propone las próximas features • Solo usuarios Pro
                    </p>
                </div>
            </div>

            {#if !$userStore.isLoggedIn}
                <div
                    class="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mt-8"
                >
                    <p class="text-red-300">
                        Debes <a href="/" class="underline hover:text-red-200"
                            >iniciar sesión</a
                        > para ver y votar propuestas.
                    </p>
                </div>
            {:else if !isPro}
                <div
                    class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mt-8"
                >
                    <h3 class="font-bold text-amber-300 mb-2">
                        🔒 Exclusivo Pro
                    </h3>
                    <p class="text-amber-200/80 mb-4">
                        Necesitas una suscripción Pro para proponer y votar
                        features.
                    </p>
                    <a
                        href="/pricing"
                        class="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full inline-block transition-all hover:scale-105"
                    >
                        Hazte Pro
                    </a>
                </div>
            {/if}
        </div>

        {#if isPro}
            <!-- Controls -->
            <div
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
            >
                <div class="flex items-center gap-3">
                    <button
                        on:click={() => (sortBy = "votes")}
                        class="px-4 py-2 rounded-xl font-medium transition-all {sortBy ===
                        'votes'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                    >
                        🔥 Más Votadas
                    </button>
                    <button
                        on:click={() => (sortBy = "recent")}
                        class="px-4 py-2 rounded-xl font-medium transition-all {sortBy ===
                        'recent'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                    >
                        🆕 Recientes
                    </button>
                </div>

                <button
                    on:click={() => (showNewProposal = !showNewProposal)}
                    class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-blue-900/30 w-full sm:w-auto"
                >
                    + Nueva Propuesta
                </button>
            </div>

            <!-- New Proposal Form -->
            {#if showNewProposal}
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 animate-fade-in"
                >
                    <h3 class="text-xl font-bold mb-4">
                        Proponer Nueva Feature/Álbum
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label
                                class="block text-sm font-medium text-slate-400 mb-2"
                                >Categoría</label
                            >
                            <div class="flex gap-3">
                                <button
                                    on:click={() => (newCategory = "album")}
                                    class="px-4 py-2 rounded-xl transition-all {newCategory ===
                                    'album'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    🎵 Álbum
                                </button>
                                <button
                                    on:click={() => (newCategory = "feature")}
                                    class="px-4 py-2 rounded-xl transition-all {newCategory ===
                                    'feature'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    ⚡ Feature
                                </button>
                                <button
                                    on:click={() =>
                                        (newCategory = "improvement")}
                                    class="px-4 py-2 rounded-xl transition-all {newCategory ===
                                    'improvement'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    🔧 Mejora
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                class="block text-sm font-medium text-slate-400 mb-2"
                                >Título</label
                            >
                            <input
                                bind:value={newTitle}
                                type="text"
                                placeholder="Ej: Modo Pomodoro Integrado"
                                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                                maxlength="100"
                            />
                        </div>

                        <div>
                            <label
                                class="block text-sm font-medium text-slate-400 mb-2"
                                >Descripción</label
                            >
                            <textarea
                                bind:value={newDescription}
                                placeholder="Describe tu propuesta en detalle..."
                                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                                rows="4"
                                maxlength="500"
                            ></textarea>
                        </div>

                        <div class="flex gap-3">
                            <button
                                on:click={submitProposal}
                                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex-1"
                            >
                                Publicar Propuesta
                            </button>
                            <button
                                on:click={() => (showNewProposal = false)}
                                class="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Proposals List -->
            <div class="space-y-4">
                {#each sortedProposals as proposal}
                    <div
                        class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all"
                    >
                        <div class="flex flex-col md:flex-row gap-6">
                            <!-- Voting -->
                            <div
                                class="flex md:flex-col items-center gap-2 md:gap-3"
                            >
                                <button
                                    on:click={() => vote(proposal.id, 1)}
                                    class="w-10 h-10 rounded-lg bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-500/30 flex items-center justify-center transition-all active:scale-95"
                                    title="Votar a favor"
                                >
                                    ▲
                                </button>
                                <span
                                    class="text-2xl font-bold {proposal.votes >
                                    20
                                        ? 'text-blue-400'
                                        : 'text-white'}">{proposal.votes}</span
                                >
                                <button
                                    on:click={() => vote(proposal.id, -1)}
                                    class="w-10 h-10 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 flex items-center justify-center transition-all active:scale-95"
                                    title="Votar en contra"
                                >
                                    ▼
                                </button>
                            </div>

                            <!-- Content -->
                            <div class="flex-1 min-w-0">
                                <div
                                    class="flex flex-wrap items-start gap-3 mb-3"
                                >
                                    <span class="text-2xl"
                                        >{getCategoryIcon(
                                            proposal.category,
                                        )}</span
                                    >
                                    <div class="flex-1 min-w-0">
                                        <h3
                                            class="text-xl font-bold text-white mb-1"
                                        >
                                            {proposal.title}
                                        </h3>
                                        <p class="text-sm text-slate-400">
                                            Por {proposal.author} • {proposal.createdAt.toLocaleDateString(
                                                "es-ES",
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                },
                                            )}
                                        </p>
                                    </div>
                                    <span
                                        class="px-3 py-1 rounded-full text-xs font-bold border {getStatusColor(
                                            proposal.status,
                                        )}"
                                    >
                                        {getStatusLabel(proposal.status)}
                                    </span>
                                </div>

                                <p class="text-slate-300 leading-relaxed">
                                    {proposal.description}
                                </p>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
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
