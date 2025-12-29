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
        where,
        getDoc,
    } from "firebase/firestore";

    const dispatch = createEventDispatcher();

    interface Track {
        title: string;
        url: string;
        duration: number;
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
    let playingTrack: string | null = null;
    let audio: HTMLAudioElement | null = null;
    let statusMessage = "";

    onMount(async () => {
        await loadSubmissions();
    });

    async function loadSubmissions() {
        loading = true;
        try {
            const submissionsRef = collection(db, "musicSubmissions");
            // Show all, but sort by status (pending first) then date
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

    function togglePlay(url: string) {
        if (playingTrack === url) {
            audio?.pause();
            playingTrack = null;
        } else {
            if (audio) audio.pause();
            audio = new Audio(url);
            audio.play();
            playingTrack = url;
            audio.onended = () => (playingTrack = null);
        }
    }

    async function approveSubmission(submission: Submission) {
        if (
            !confirm(
                `¿Aprobar "${submission.releaseTitle}" de ${submission.artistName}?`,
            )
        )
            return;

        try {
            // 1. Update submission status
            const subRef = doc(db, "musicSubmissions", submission.id);
            await updateDoc(subRef, {
                status: "approved",
                reviewedAt: Date.now(),
            });

            // 2. Auto-verify artist
            const userRef = doc(db, "users", submission.artistId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                await updateDoc(userRef, {
                    isVerified: true,
                    updatedAt: Date.now(),
                });

                // Also update artist profile if it exists
                const artistRef = doc(db, "artists", submission.artistId);
                const artistSnap = await getDoc(artistRef);
                if (artistSnap.exists()) {
                    await updateDoc(artistRef, { isVerified: true });
                }
            }

            // Update local state
            submission.status = "approved";
            submissions = submissions;

            statusMessage = `✅ Envío aprobado y artista ${submission.artistName} verificado automáticamente`;
            dispatch("approved"); // Notify parent to update stats

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
            dispatch("approved"); // Notify parent

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
            Revisa música nueva y verifica artistas automáticamente
        </p>
    </div>

    <!-- Status Message -->
    {#if statusMessage}
        <div class="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl">
            {statusMessage}
        </div>
    {/if}

    <!-- List -->
    {#if loading}
        <div class="text-center py-12">
            <div
                class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"
            ></div>
            <p class="mt-4 text-slate-400">Cargando envíos...</p>
        </div>
    {:else if submissions.length === 0}
        <div class="text-center py-12 text-slate-400">
            <p>No hay envíos musicales</p>
        </div>
    {:else}
        <div class="space-y-6">
            {#each submissions as sub}
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors relative overflow-hidden"
                >
                    <!-- Status Badge -->
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
                        <!-- Cover -->
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

                        <!-- Info -->
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
                                    <svg
                                        class="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                        /></svg
                                    >
                                    {sub.genre}
                                </span>
                                <span class="flex items-center gap-1">
                                    <svg
                                        class="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        /></svg
                                    >
                                    {sub.artistEmail}
                                </span>
                                <span class="flex items-center gap-1">
                                    <svg
                                        class="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        /></svg
                                    >
                                    {new Date(
                                        sub.submittedAt?.seconds * 1000,
                                    ).toLocaleDateString()}
                                </span>
                            </div>

                            <!-- Actions -->
                            {#if sub.status === "pending"}
                                <div class="flex gap-3">
                                    <button
                                        on:click={() => approveSubmission(sub)}
                                        class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-green-500/20"
                                    >
                                        ✓ Aprobar y Verificar
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

                    <!-- Tracks -->
                    <div class="bg-black/20 rounded-xl p-4">
                        <h4
                            class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2"
                        >
                            Pistas ({sub.tracks.length})
                        </h4>
                        <div class="space-y-2">
                            {#each sub.tracks as track, i}
                                <div
                                    class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                                >
                                    <button
                                        on:click={() => togglePlay(track.url)}
                                        class="w-8 h-8 flex items-center justify-center rounded-full bg-primary-500 text-white hover:scale-105 transition-transform"
                                    >
                                        {#if playingTrack === track.url}
                                            <span class="text-xs">⏸</span>
                                        {:else}
                                            <span class="text-xs">▶</span>
                                        {/if}
                                    </button>
                                    <span
                                        class="text-sm text-slate-500 font-mono w-6 text-right"
                                        >{i + 1}</span
                                    >
                                    <span class="text-white font-medium flex-1"
                                        >{track.title}</span
                                    >
                                    <a
                                        href={track.url}
                                        target="_blank"
                                        class="p-2 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Descargar"
                                    >
                                        ⬇️
                                    </a>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
