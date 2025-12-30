<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import { db } from "$lib/firebase";
    import {
        collection,
        query,
        getDocs,
        doc,
        updateDoc,
        orderBy,
        getDoc,
    } from "firebase/firestore";

    const dispatch = createEventDispatcher();

    interface Submission {
        id: string;
        artistId: string;
        artistName: string;
        artistEmail: string;
        releaseTitle: string;
        genre: string;
        coverUrl: string;
        // New fields
        downloadLink?: string;
        tracklist?: string;
        submissionType?: "link";
        // Legacy fallback
        tracks?: any[];

        status: "pending" | "approved" | "rejected";
        submittedAt: any;
    }

    let submissions: Submission[] = [];
    let loading = true;
    let statusMessage = "";

    onMount(async () => {
        await loadSubmissions();
    });

    async function loadSubmissions() {
        loading = true;
        try {
            const submissionsRef = collection(db, "musicSubmissions");
            const q = query(submissionsRef, orderBy("submittedAt", "desc"));
            const snapshot = await getDocs(q);

            submissions = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Submission[];
        } catch (e: any) {
            console.error(e);
            statusMessage = "❌ Error al cargar envíos: " + e.message;
        } finally {
            loading = false;
        }
    }

    function getDomain(url: string) {
        try {
            return new URL(url).hostname;
        } catch {
            return "url-invalida";
        }
    }

    function isKnownSafe(url: string) {
        if (!url) return false;
        const domain = getDomain(url).toLowerCase();
        return (
            domain.includes("mega.nz") ||
            domain.includes("drive.google.com") ||
            domain.includes("dropbox.com") ||
            domain.includes("wetransfer.com") ||
            domain.includes("transfer.it")
        );
    }

    function analyzeLink(url: string) {
        // Open Google Transparency Report for Safety Check
        window.open(
            `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(url)}`,
            "_blank",
        );
    }

    async function approveSubmission(submission: Submission) {
        if (
            !confirm(
                `¿Aprobar "${submission.releaseTitle}" de ${submission.artistName}?`,
            )
        )
            return;

        try {
            const subRef = doc(db, "musicSubmissions", submission.id);
            await updateDoc(subRef, {
                status: "approved",
                reviewedAt: Date.now(),
            });

            const userRef = doc(db, "users", submission.artistId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                await updateDoc(userRef, {
                    isVerified: true,
                    updatedAt: Date.now(),
                });

                const artistRef = doc(db, "artists", submission.artistId);
                const artistSnap = await getDoc(artistRef);
                if (artistSnap.exists()) {
                    await updateDoc(artistRef, { isVerified: true });
                }
            }

            submission.status = "approved";
            submissions = submissions;

            statusMessage = `✅ Envío aprobado y artista ${submission.artistName} verificado`;
            dispatch("approved");

            setTimeout(() => (statusMessage = ""), 5000);
        } catch (e: any) {
            statusMessage = "❌ Error: " + e.message;
        }
    }

    async function rejectSubmission(submission: Submission) {
        if (!confirm(`¿Rechazar "${submission.releaseTitle}"?`)) return;

        try {
            const subRef = doc(db, "musicSubmissions", submission.id);
            await updateDoc(subRef, {
                status: "rejected",
                reviewedAt: Date.now(),
            });

            submission.status = "rejected";
            submissions = submissions;

            statusMessage = `❌ Envío rechazado`;
            dispatch("approved");

            setTimeout(() => (statusMessage = ""), 3000);
        } catch (e: any) {
            statusMessage = "❌ Error: " + e.message;
        }
    }
</script>

<div class="animate-fade-in">
    <div class="mb-6">
        <h2 class="text-2xl font-bold text-white mb-2">Envíos Musicales</h2>
        <p class="text-slate-400">
            Revisa enlaces de descarga y verifica artistas. Analiza la seguridad
            antes de descargar.
        </p>
    </div>

    {#if statusMessage}
        <div class="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl">
            {statusMessage}
        </div>
    {/if}

    {#if loading}
        <div class="text-center py-12">
            <div
                class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"
            ></div>
            <p class="mt-4 text-slate-400">Cargando envíos...</p>
        </div>
    {:else if submissions.length === 0}
        <div class="text-center py-12 text-slate-400">
            <p>No hay envíos pendientes</p>
        </div>
    {:else}
        <div class="space-y-6">
            {#each submissions as sub}
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors relative overflow-hidden"
                >
                    <div class="absolute top-4 right-4">
                        {#if sub.status === "pending"}
                            <span
                                class="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold uppercase tracking-wider"
                                >Pendiente</span
                            >
                        {:else if sub.status === "approved"}
                            <span
                                class="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold uppercase tracking-wider"
                                >Aprobado</span
                            >
                        {:else}
                            <span
                                class="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold uppercase tracking-wider"
                                >Rechazado</span
                            >
                        {/if}
                    </div>

                    <div class="flex flex-col md:flex-row gap-6 mb-6">
                        <div
                            class="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-black/50"
                        >
                            {#if sub.coverUrl}
                                <img
                                    src={sub.coverUrl}
                                    alt={sub.releaseTitle}
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                <div
                                    class="w-full h-full flex items-center justify-center text-4xl"
                                >
                                    💿
                                </div>
                            {/if}
                        </div>

                        <div class="flex-1">
                            <h3 class="text-2xl font-bold text-white mb-1">
                                {sub.releaseTitle}
                            </h3>
                            <p class="text-lg text-slate-300 mb-2">
                                {sub.artistName}
                            </p>

                            <div
                                class="flex flex-wrap gap-4 text-sm text-slate-400 mb-4"
                            >
                                <span class="flex items-center gap-1">
                                    🎵 {sub.genre}
                                </span>
                                <span class="flex items-center gap-1">
                                    📧 {sub.artistEmail}
                                </span>
                                <span class="flex items-center gap-1">
                                    📅 {new Date(
                                        sub.submittedAt?.seconds * 1000,
                                    ).toLocaleDateString()}
                                </span>
                            </div>

                            {#if sub.status === "pending"}
                                <div class="flex gap-3">
                                    <button
                                        on:click={() => approveSubmission(sub)}
                                        class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-green-500/20"
                                    >
                                        ✓ Aprobar
                                    </button>
                                    <button
                                        on:click={() => rejectSubmission(sub)}
                                        class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-sm transition-colors"
                                    >
                                        ✗ Rechazar
                                    </button>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- Link Security & Downloads -->
                    <div class="bg-black/20 rounded-xl p-6">
                        <h4
                            class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between"
                        >
                            <span>Material para Revisión</span>
                            {#if sub.downloadLink && isKnownSafe(sub.downloadLink)}
                                <span
                                    class="text-green-400 text-xs flex items-center gap-1 border border-green-500/30 px-2 py-1 rounded bg-green-500/10"
                                >
                                    🛡️ Dominio Confiable ({getDomain(
                                        sub.downloadLink,
                                    )})
                                </span>
                            {:else if sub.downloadLink}
                                <span
                                    class="text-yellow-400 text-xs flex items-center gap-1 border border-yellow-500/30 px-2 py-1 rounded bg-yellow-500/10"
                                >
                                    ⚠️ Check Domain: {getDomain(
                                        sub.downloadLink,
                                    )}
                                </span>
                            {/if}
                        </h4>

                        {#if sub.downloadLink}
                            <div
                                class="flex flex-col sm:flex-row items-center gap-3 mb-6 bg-white/5 p-4 rounded-lg border border-white/5"
                            >
                                <div class="flex-1 w-full overflow-hidden">
                                    <p class="text-xs text-slate-500 mb-1">
                                        Enlace de Descarga
                                    </p>
                                    <a
                                        href={sub.downloadLink}
                                        target="_blank"
                                        class="text-blue-400 hover:text-blue-300 hover:underline truncate block font-mono text-sm transition-colors"
                                    >
                                        {sub.downloadLink}
                                    </a>
                                </div>
                                <div class="flex gap-2 w-full sm:w-auto">
                                    <button
                                        on:click={() =>
                                            analyzeLink(sub.downloadLink || "")}
                                        class="flex-1 sm:flex-none px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center justify-center gap-2"
                                    >
                                        🔍 Analizar (Google Safety)
                                    </button>
                                    <a
                                        href={sub.downloadLink}
                                        target="_blank"
                                        class="flex-1 sm:flex-none px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-colors shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2"
                                    >
                                        ⬇️ Abrir Enlace
                                    </a>
                                </div>
                            </div>
                        {:else if sub.tracks}
                            <!-- Fallback for legacy uploads -->
                            <div
                                class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-4"
                            >
                                <p class="text-yellow-200 text-sm">
                                    ⚠️ Envío antiguo (Archivos directos)
                                </p>
                            </div>
                        {/if}

                        <div>
                            <p class="text-xs text-slate-500 mb-2">
                                Tracklist Declarado
                            </p>
                            <pre
                                class="text-xs text-slate-300 font-mono bg-black/40 border border-white/5 p-4 rounded-lg whitespace-pre-wrap leading-relaxed">{sub.tracklist ||
                                    "No especificado por el artista."}</pre>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
