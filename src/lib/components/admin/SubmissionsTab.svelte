<script lang="ts">
    import { onMount } from "svelte";
    import { db } from "$lib/firebase";
    import {
        collection,
        getDocs,
        doc,
        updateDoc,
        writeBatch,
        serverTimestamp,
        query,
        orderBy,
    } from "firebase/firestore";

    interface Track {
        title: string;
        url: string;
        duration?: number;
        fileName: string;
    }

    interface Submission {
        id: string;
        artistId: string;
        artistName: string;
        artistEmail: string;
        releaseTitle: string;
        genre: string;
        coverUrl: string;
        tracks: Track[];
        status: "pending" | "approved" | "rejected";
        submittedAt: any;
    }

    let submissions: Submission[] = [];
    let loading = true;
    let filter: "all" | "pending" | "approved" | "rejected" = "pending";

    $: filteredSubmissions = submissions.filter((s) => {
        if (filter === "all") return true;
        return s.status === filter;
    });

    onMount(() => {
        fetchSubmissions();
    });

    async function fetchSubmissions() {
        loading = true;
        try {
            const q = query(
                collection(db, "musicSubmissions"),
                orderBy("submittedAt", "desc"),
            );
            const snap = await getDocs(q);
            submissions = snap.docs.map(
                (d) => ({ id: d.id, ...d.data() }) as Submission,
            );
        } catch (e) {
            console.error("Error fetching submissions:", e);
            alert("Error al cargar envíos");
        } finally {
            loading = false;
        }
    }

    async function approveSubmission(submission: Submission) {
        if (
            !confirm(
                `¿Aprobar "${submission.releaseTitle}" de ${submission.artistName}? Esto lo publicará en la app.`,
            )
        )
            return;

        try {
            const batch = writeBatch(db);

            const subRef = doc(db, "musicSubmissions", submission.id);
            batch.update(subRef, { status: "approved" });

            const artistRef = doc(db, "artistProfiles", submission.artistId);
            batch.update(artistRef, { isVerified: true });

            const newAlbumRef = doc(collection(db, "albums"));
            const newAlbumData = {
                id: newAlbumRef.id,
                title: submission.releaseTitle,
                artist: submission.artistName,
                cover: submission.coverUrl,
                category: "musica",
                tags: [submission.genre.toLowerCase(), "new"],
                tracks: submission.tracks.map((t, i) => ({
                    id: i + 1,
                    title: t.title,
                    artist: submission.artistName,
                    duration: t.duration || 180,
                    src: t.url,
                    cover: submission.coverUrl,
                })),
                createdAt: serverTimestamp(),
            };
            batch.set(newAlbumRef, newAlbumData);

            await batch.commit();

            submissions = submissions.map((s) =>
                s.id === submission.id ? { ...s, status: "approved" } : s,
            );
            alert("✅ Lanzamiento aprobado y artista verificado.");
        } catch (e: any) {
            console.error(e);
            alert("Error al aprobar: " + e.message);
        }
    }

    async function rejectSubmission(id: string) {
        if (!confirm("¿Rechazar este envío?")) return;

        try {
            const subRef = doc(db, "musicSubmissions", id);
            await updateDoc(subRef, { status: "rejected" });

            submissions = submissions.map((s) =>
                s.id === id ? { ...s, status: "rejected" } : s,
            );
            alert("Envío rechazado");
        } catch (e: any) {
            console.error(e);
            alert("Error: " + e.message);
        }
    }
</script>

<div class="space-y-6 p-4 md:p-6">
    <!-- Header -->
    <div class="space-y-4">
        <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
            <div>
                <h2 class="text-2xl md:text-3xl font-bold">
                    Envíos de Música (A&R)
                </h2>
                <p class="text-slate-400 text-sm md:text-base mt-1">
                    Revisa y aprueba nueva música de artistas PRO.
                </p>
            </div>
            <button
                on:click={fetchSubmissions}
                class="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all self-end md:self-auto"
                title="Recargar"
            >
                🔄
            </button>
        </div>

        <!-- Filter Pills -->
        <div class="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            <button
                on:click={() => (filter = "pending")}
                class="px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap {filter ===
                'pending'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-900/20'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}"
            >
                🕐 Pendientes ({submissions.filter(
                    (s) => s.status === "pending",
                ).length})
            </button>
            <button
                on:click={() => (filter = "approved")}
                class="px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap {filter ===
                'approved'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}"
            >
                ✅ Aprobadas ({submissions.filter(
                    (s) => s.status === "approved",
                ).length})
            </button>
            <button
                on:click={() => (filter = "rejected")}
                class="px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap {filter ===
                'rejected'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}"
            >
                ✕ Rechazadas ({submissions.filter(
                    (s) => s.status === "rejected",
                ).length})
            </button>
            <button
                on:click={() => (filter = "all")}
                class="px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap {filter ===
                'all'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}"
            >
                📋 Todas ({submissions.length})
            </button>
        </div>
    </div>

    <!-- Loading State -->
    {#if loading}
        <div class="text-center py-20">
            <div
                class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-primary-500 mb-4"
            ></div>
            <p class="text-slate-400">Cargando envíos...</p>
        </div>
        <!-- Empty State -->
    {:else if filteredSubmissions.length === 0}
        <div
            class="bg-[#1a1a1a] rounded-2xl border border-dashed border-white/10 p-12 md:p-16 text-center"
        >
            <div class="text-6xl mb-4">📭</div>
            <p class="text-xl text-slate-300 mb-2">
                {#if filter === "pending"}
                    ¡Sin envíos pendientes!
                {:else if filter === "approved"}
                    Sin envíos aprobados aún
                {:else if filter === "rejected"}
                    Sin envíos rechazados
                {:else}
                    No hay envíos todavía
                {/if}
            </p>
            <p class="text-sm text-slate-500">
                {#if filter === "pending"}
                    Todo el trabajo está al día 🎉
                {:else}
                    Los artistas PRO pueden enviar música desde su perfil.
                {/if}
            </p>
        </div>
        <!-- Submissions List -->
    {:else}
        <div class="space-y-4">
            {#each filteredSubmissions as sub (sub.id)}
                <div
                    class="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden hover:border-primary-500/30 transition-all {sub.status !==
                    'pending'
                        ? 'opacity-70'
                        : ''}"
                >
                    <div class="p-4 md:p-6">
                        <!-- Mobile Layout -->
                        <div class="md:hidden space-y-4">
                            <div class="flex gap-4">
                                <img
                                    src={sub.coverUrl}
                                    alt={sub.releaseTitle}
                                    class="w-24 h-24 rounded-lg object-cover shadow-lg flex-shrink-0"
                                />
                                <div class="flex-1 min-w-0">
                                    <h3
                                        class="font-bold text-lg leading-tight truncate"
                                    >
                                        {sub.releaseTitle}
                                    </h3>
                                    <p
                                        class="text-primary-400 text-sm truncate"
                                    >
                                        {sub.artistName}
                                    </p>
                                    <div
                                        class="flex items-center gap-2 mt-2 flex-wrap"
                                    >
                                        <span
                                            class="text-xs bg-white/10 px-2 py-1 rounded"
                                        >
                                            {sub.genre}
                                        </span>
                                        <span class="text-xs text-slate-500">
                                            {new Date(
                                                sub.submittedAt?.toMillis?.() ||
                                                    Date.now(),
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Tracks -->
                            <div class="space-y-2">
                                <h4
                                    class="text-xs font-bold text-slate-500 uppercase"
                                >
                                    Pistas ({sub.tracks.length})
                                </h4>
                                {#each sub.tracks as track, i}
                                    <div
                                        class="bg-[#0B1120] p-3 rounded-lg border border-white/5 space-y-2"
                                    >
                                        <div class="flex items-center gap-2">
                                            <span
                                                class="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold"
                                            >
                                                {i + 1}
                                            </span>
                                            <span
                                                class="font-medium text-sm flex-1 truncate"
                                            >
                                                {track.title}
                                            </span>
                                        </div>
                                        <audio
                                            controls
                                            src={track.url}
                                            class="w-full h-8"
                                            preload="none"
                                        ></audio>
                                    </div>
                                {/each}
                            </div>

                            <!-- Actions -->
                            {#if sub.status === "pending"}
                                <div class="flex gap-2">
                                    <button
                                        on:click={() => approveSubmission(sub)}
                                        class="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        ✅ Aprobar
                                    </button>
                                    <button
                                        on:click={() =>
                                            rejectSubmission(sub.id)}
                                        class="flex-1 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-bold text-sm transition-colors"
                                    >
                                        ✕ Rechazar
                                    </button>
                                </div>
                            {:else}
                                <div
                                    class="text-center p-3 bg-white/5 rounded-xl"
                                >
                                    <p
                                        class="font-bold {sub.status ===
                                        'approved'
                                            ? 'text-green-400'
                                            : 'text-red-400'} uppercase text-sm"
                                    >
                                        {sub.status === "approved"
                                            ? "✅ Aprobado"
                                            : "✕ Rechazado"}
                                    </p>
                                </div>
                            {/if}
                        </div>

                        <!-- Desktop Layout -->
                        <div
                            class="hidden md:grid grid-cols-12 gap-6 items-start"
                        >
                            <!-- Cover -->
                            <div class="col-span-2">
                                <img
                                    src={sub.coverUrl}
                                    alt={sub.releaseTitle}
                                    class="w-full aspect-square rounded-xl object-cover shadow-lg"
                                />
                            </div>

                            <!-- Info -->
                            <div class="col-span-3 space-y-2">
                                <h3 class="font-bold text-xl leading-tight">
                                    {sub.releaseTitle}
                                </h3>
                                <p class="text-primary-400">{sub.artistName}</p>
                                <div class="flex flex-col gap-2">
                                    <span
                                        class="inline-block text-xs bg-white/10 px-3 py-1 rounded-lg w-fit"
                                    >
                                        🎵 {sub.genre}
                                    </span>
                                    <span class="text-xs text-slate-500">
                                        📅
                                        {new Date(
                                            sub.submittedAt?.toMillis?.() ||
                                                Date.now(),
                                        ).toLocaleDateString("es-ES", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </span>
                                    <span
                                        class="text-xs text-slate-500 truncate"
                                    >
                                        📧 {sub.artistEmail}
                                    </span>
                                </div>
                            </div>

                            <!-- Tracks -->
                            <div class="col-span-5 space-y-2">
                                <h4
                                    class="text-xs font-bold text-slate-500 uppercase mb-3"
                                >
                                    Pistas · {sub.tracks.length} total{sub
                                        .tracks.length !== 1
                                        ? "es"
                                        : ""}
                                </h4>
                                <div
                                    class="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar"
                                >
                                    {#each sub.tracks as track, i}
                                        <div
                                            class="bg-[#0B1120] p-3 rounded-lg border border-white/5 flex items-center gap-3"
                                        >
                                            <div
                                                class="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0"
                                            >
                                                {i + 1}
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <div
                                                    class="font-medium text-sm truncate"
                                                >
                                                    {track.title}
                                                </div>
                                            </div>
                                            <audio
                                                controls
                                                src={track.url}
                                                class="h-8 w-52"
                                                preload="none"
                                            ></audio>
                                        </div>
                                    {/each}
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="col-span-2 flex flex-col gap-3">
                                {#if sub.status === "pending"}
                                    <button
                                        on:click={() => approveSubmission(sub)}
                                        class="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                    >
                                        ✅ Aprobar
                                    </button>
                                    <button
                                        on:click={() =>
                                            rejectSubmission(sub.id)}
                                        class="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-bold text-sm transition-colors"
                                    >
                                        ✕ Rechazar
                                    </button>
                                {:else}
                                    <div
                                        class="text-center p-4 bg-white/5 rounded-xl"
                                    >
                                        <p
                                            class="font-bold {sub.status ===
                                            'approved'
                                                ? 'text-green-400'
                                                : 'text-red-400'} text-sm"
                                        >
                                            {sub.status === "approved"
                                                ? "✅ APROBADO"
                                                : "✕ RECHAZADO"}
                                        </p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 123, 61, 0.5);
        border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 123, 61, 0.7);
    }
</style>
