<script lang="ts">
    import { userStore } from "$lib/auth/userStore";
    import { userSubscription } from "$lib/subscription/userSubscription";
    import { db } from "$lib/firebase";
    import {
        collection,
        addDoc,
        updateDoc,
        doc,
        onSnapshot,
        query,
        orderBy,
        increment,
        arrayUnion,
        arrayRemove,
        Timestamp,
    } from "firebase/firestore";
    import { onMount, onDestroy } from "svelte";

    interface Proposal {
        id: string;
        title: string;
        description: string;
        author: string;
        authorUid: string;
        votes: number;
        votersUp: string[];
        votersDown: string[];
        status: "pending" | "approved" | "rejected" | "implemented";
        createdAt: Date;
        category: "album" | "feature" | "improvement";
    }

    let proposals: Proposal[] = [];
    let unsubscribe: (() => void) | null = null;

    let showNewProposal = false;
    let newTitle = "";
    let newDescription = "";
    let newCategory: "album" | "feature" | "improvement" = "feature";
    let sortBy: "votes" | "recent" = "votes";
    let isSubmitting = false;

    $: sortedProposals = [...proposals].sort((a, b) => {
        if (sortBy === "votes") return b.votes - a.votes;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

    $: isPro =
        $userSubscription.tier === "pro" ||
        $userSubscription.tier === "premium";
    $: currentUserId = $userStore.user?.uid || "";

    onMount(() => {
        // Subscribe to proposals collection
        const proposalsRef = collection(db, "proposals");
        const q = query(proposalsRef, orderBy("createdAt", "desc"));

        unsubscribe = onSnapshot(q, (snapshot) => {
            proposals = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    title: data.title,
                    description: data.description,
                    author: data.author,
                    authorUid: data.authorUid,
                    votes: data.votes || 0,
                    votersUp: data.votersUp || [],
                    votersDown: data.votersDown || [],
                    status: data.status,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    category: data.category,
                } as Proposal;
            });
        });
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    async function vote(proposalId: string, direction: "up" | "down") {
        if (!currentUserId || !isPro) return;

        const proposalRef = doc(db, "proposals", proposalId);
        const proposal = proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        const hasVotedUp = proposal.votersUp.includes(currentUserId);
        const hasVotedDown = proposal.votersDown.includes(currentUserId);

        try {
            if (direction === "up") {
                if (hasVotedUp) {
                    // Remove upvote
                    await updateDoc(proposalRef, {
                        votes: increment(-1),
                        votersUp: arrayRemove(currentUserId),
                    });
                } else {
                    // Add upvote (remove downvote if exists)
                    const updates: any = {
                        votes: increment(hasVotedDown ? 2 : 1),
                        votersUp: arrayUnion(currentUserId),
                    };
                    if (hasVotedDown) {
                        updates.votersDown = arrayRemove(currentUserId);
                    }
                    await updateDoc(proposalRef, updates);
                }
            } else {
                if (hasVotedDown) {
                    // Remove downvote
                    await updateDoc(proposalRef, {
                        votes: increment(1),
                        votersDown: arrayRemove(currentUserId),
                    });
                } else {
                    // Add downvote (remove upvote if exists)
                    const updates: any = {
                        votes: increment(hasVotedUp ? -2 : -1),
                        votersDown: arrayUnion(currentUserId),
                    };
                    if (hasVotedUp) {
                        updates.votersUp = arrayRemove(currentUserId);
                    }
                    await updateDoc(proposalRef, updates);
                }
            }
        } catch (error) {
            console.error("Error voting:", error);
        }
    }

    async function submitProposal() {
        if (
            !newTitle.trim() ||
            !newDescription.trim() ||
            !currentUserId ||
            !isPro
        )
            return;

        isSubmitting = true;

        try {
            await addDoc(collection(db, "proposals"), {
                title: newTitle.trim(),
                description: newDescription.trim(),
                author: $userStore.user?.displayName || "Usuario Pro",
                authorUid: currentUserId,
                votes: 1,
                votersUp: [currentUserId],
                votersDown: [],
                status: "pending",
                createdAt: Timestamp.now(),
                category: newCategory,
            });

            newTitle = "";
            newDescription = "";
            showNewProposal = false;
        } catch (error) {
            console.error("Error creating proposal:", error);
        } finally {
            isSubmitting = false;
        }
    }

    function getStatusColor(status: Proposal["status"]) {
        switch (status) {
            case "approved":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            case "rejected":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            case "implemented":
                return "bg-primary-500/20 text-primary-300 border-primary-500/30";
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

    function getUserVoteState(proposal: Proposal): "up" | "down" | null {
        if (proposal.votersUp.includes(currentUserId)) return "up";
        if (proposal.votersDown.includes(currentUserId)) return "down";
        return null;
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
                    class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-primary-900/50"
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
                            ? 'bg-primary-500 text-white'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                    >
                        🔥 Más Votadas
                    </button>
                    <button
                        on:click={() => (sortBy = "recent")}
                        class="px-4 py-2 rounded-xl font-medium transition-all {sortBy ===
                        'recent'
                            ? 'bg-primary-500 text-white'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                    >
                        🆕 Recientes
                    </button>
                </div>

                <button
                    on:click={() => (showNewProposal = !showNewProposal)}
                    class="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-bold rounded-full transition-all hover:scale-105 shadow-lg shadow-primary-900/30 w-full sm:w-auto"
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
                            <p
                                class="block text-sm font-medium text-slate-400 mb-2"
                            >
                                Categoría
                            </p>
                            <div class="flex gap-3" role="group">
                                <button
                                    on:click={() => (newCategory = "album")}
                                    class="px-4 py-2 rounded-xl transition-all {newCategory ===
                                    'album'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    🎵 Álbum
                                </button>
                                <button
                                    on:click={() => (newCategory = "feature")}
                                    class="px-4 py-2 rounded-xl transition-all {newCategory ===
                                    'feature'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    ⚡ Feature
                                </button>
                                <button
                                    on:click={() =>
                                        (newCategory = "improvement")}
                                    class="px-4 py-2 rounded-xl transition-all {newCategory ===
                                    'improvement'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                                >
                                    🔧 Mejora
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                for="proposal-title"
                                class="block text-sm font-medium text-slate-400 mb-2"
                                >Título</label
                            >
                            <input
                                id="proposal-title"
                                bind:value={newTitle}
                                type="text"
                                placeholder="Ej: Modo Pomodoro Integrado"
                                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
                                maxlength="100"
                            />
                        </div>

                        <div>
                            <label
                                for="proposal-description"
                                class="block text-sm font-medium text-slate-400 mb-2"
                                >Descripción</label
                            >
                            <textarea
                                id="proposal-description"
                                bind:value={newDescription}
                                placeholder="Describe tu propuesta en detalle..."
                                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition-colors resize-none"
                                rows="4"
                                maxlength="500"
                            ></textarea>
                        </div>

                        <div class="flex gap-3">
                            <button
                                on:click={submitProposal}
                                disabled={isSubmitting}
                                class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting
                                    ? "Publicando..."
                                    : "Publicar Propuesta"}
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
                {#if proposals.length === 0}
                    <div
                        class="text-center py-20 bg-white/5 rounded-2xl border border-white/5"
                    >
                        <span class="text-4xl block mb-4">💡</span>
                        <p class="text-slate-400">
                            No hay propuestas aún. ¡Sé el primero en proponer
                            algo!
                        </p>
                    </div>
                {/if}

                {#each sortedProposals as proposal}
                    {@const userVote = getUserVoteState(proposal)}
                    <div
                        class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all"
                    >
                        <div class="flex flex-col md:flex-row gap-6">
                            <!-- Voting -->
                            <div
                                class="flex md:flex-col items-center gap-2 md:gap-3"
                            >
                                <button
                                    on:click={() => vote(proposal.id, "up")}
                                    class="w-10 h-10 rounded-lg border transition-all active:scale-95 {userVote ===
                                    'up'
                                        ? 'bg-green-500/30 border-green-500/50 text-green-400'
                                        : 'bg-white/5 hover:bg-green-500/20 border-white/10 hover:border-green-500/30'}"
                                    title="Votar a favor"
                                    aria-label="Votar a favor"
                                >
                                    ▲
                                </button>
                                <span
                                    class="text-2xl font-bold {proposal.votes >
                                    20
                                        ? 'text-blue-400'
                                        : 'text-slate-100'}">{proposal.votes}</span
                                >
                                <button
                                    on:click={() => vote(proposal.id, "down")}
                                    class="w-10 h-10 rounded-lg border transition-all active:scale-95 {userVote ===
                                    'down'
                                        ? 'bg-red-500/30 border-red-500/50 text-red-400'
                                        : 'bg-white/5 hover:bg-red-500/20 border-white/10 hover:border-red-500/30'}"
                                    title="Votar en contra"
                                    aria-label="Votar en contra"
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
                                            class="text-xl font-bold text-slate-100 mb-1"
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
