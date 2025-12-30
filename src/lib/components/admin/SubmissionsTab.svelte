<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    import { db } from "$lib/firebase";
    import {
        collection,
        query,
        orderBy,
        onSnapshot,
        doc,
        updateDoc,
        getDoc,
        getDocs,
        limit,
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
        tracklist: string;
        status: "pending" | "approved" | "rejected";
        submittedAt: any;

        // New R2 Fields
        submissionType?: "link" | "direct" | "r2_direct";
        r2CoverKey?: string;
        r2AudioKeys?: { key: string; name: string; size: number }[];
        audioFiles?: any[]; // Legacy direct upload
    }

    let submissions: Submission[] = [];
    let loading = true;
    let statusMessage = "";
    let playingAudio: HTMLAudioElement | null = null;
    let playingKey = "";
    let unsubscribe: () => void;

    async function playR2Audio(key: string) {
        if (playingKey === key && playingAudio) {
            playingAudio.paused ? playingAudio.play() : playingAudio.pause();
            return;
        }

        if (playingAudio) {
            playingAudio.pause();
            playingAudio = null;
        }

        try {
            const res = await fetch("/api/r2/get-url", {
                method: "POST",
                body: JSON.stringify({ key }),
            });
            const { url } = await res.json();

            playingAudio = new Audio(url);
            playingAudio.play();
            playingKey = key;
        } catch (e) {
            console.error("Error playing audio:", e);
            statusMessage = "Error al reproducir audio";
        }
    }

    onMount(() => {
        subscribeToSubmissions();
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
        if (playingAudio) {
            playingAudio.pause();
            playingAudio = null;
        }
    });

    function subscribeToSubmissions() {
        loading = true;
        try {
            const submissionsRef = collection(db, "musicSubmissions");
            const q = query(
                submissionsRef,
                orderBy("submittedAt", "desc"),
                limit(50),
            );

            unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    submissions = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Submission[];
                    loading = false;
                },
                (error) => {
                    console.error("Error realtime:", error);
                    statusMessage = "❌ Error en conexión tiempo real";
                    loading = false;
                },
            );
        } catch (e: any) {
            console.error(e);
            statusMessage = "❌ Error al iniciar listener: " + e.message;
            loading = false;
        }
    }

    // Removed manual loadSubmissions as it's replaced by snapshot logic

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
                const userData = userSnap.data();
                const currentApprovedCount =
                    userData.approvedSubmissionsCount || 0;
                const newApprovedCount = currentApprovedCount + 1;

                // Update approved count
                await updateDoc(userRef, {
                    approvedSubmissionsCount: newApprovedCount,
                    updatedAt: Date.now(),
                });

                // Auto-verify after 2nd approval
                if (newApprovedCount >= 2 && !userData.isVerified) {
                    await updateDoc(userRef, {
                        isVerified: true,
                        verifiedAt: Date.now(),
                    });

                    const artistRef = doc(db, "artists", submission.artistId);
                    const artistSnap = await getDoc(artistRef);
                    if (artistSnap.exists()) {
                        await updateDoc(artistRef, {
                            isVerified: true,
                            verifiedAt: Date.now(),
                        });
                    }

                    statusMessage = `✅ Envío aprobado. ${submission.artistName} ahora es VERIFICADO ✓ (${newApprovedCount} aprobaciones)`;
                } else if (newApprovedCount >= 2) {
                    statusMessage = `✅ Envío aprobado (artista ya verificado, ${newApprovedCount} aprobaciones totales)`;
                } else {
                    statusMessage = `✅ Envío aprobado (${newApprovedCount}/2 para verificación automática)`;
                }

                // ✨ CREATE ALBUM IN COLLECTION (Auto-publish)
                const { addDoc, collection } = await import(
                    "firebase/firestore"
                );

                let tracksForAlbum = [];
                let secureCoverKey = submission.r2CoverKey;

                if (submission.submissionType === "r2_direct") {
                    // 🚀 R2 Migration (Move files to permanent folder)
                    statusMessage = "⏳ Migrando archivos en Cloudflare R2...";

                    const filesToMigrate = [
                        {
                            key: submission.r2CoverKey,
                            name: `cover_${Date.now()}.jpg`,
                        },
                        ...(submission.r2AudioKeys || []).map((f) => ({
                            key: f.key,
                            name: f.name,
                        })),
                    ];

                    const moveRes = await fetch("/api/r2/approve", {
                        method: "POST",
                        body: JSON.stringify({
                            submissionId: submission.id,
                            artistVerifiedName: submission.artistName,
                            albumTitle: submission.releaseTitle,
                            files: filesToMigrate,
                        }),
                    });

                    if (!moveRes.ok)
                        throw new Error("Error moviendo archivos en R2");

                    const { migratedFiles } = await moveRes.json();

                    // Map back to tracks
                    const newCover = migratedFiles[0]; // First one was cover
                    secureCoverKey = newCover.key;

                    const audioFiles = migratedFiles.slice(1);
                    tracksForAlbum = audioFiles.map((f: any, idx: number) => ({
                        id: `track-${idx + 1}`,
                        title: f.name.replace(/\.(mp3|wav|m4a)$/i, ""),
                        r2Key: f.key, // Store Private Key
                        duration: 0, // TODO: Extract metadata if possible
                    }));
                } else {
                    // Legacy (Link based)
                    tracksForAlbum = submission.tracklist
                        ? submission.tracklist
                              .split("\n")
                              .filter((t) => t.trim())
                              .map((line, idx) => ({
                                  id: `track-${idx + 1}`,
                                  title: line.replace(/^\d+\.\s*/, "").trim(),
                                  url: submission.downloadLink,
                              }))
                        : [];
                }

                const albumData = {
                    title: submission.releaseTitle,
                    artist: submission.artistName,
                    artistId: submission.artistId,
                    cover: submission.coverUrl, // Keep original URL for display if available, or fetch from key
                    r2CoverKey: secureCoverKey,
                    category: submission.genre || "Chill",
                    tracks: tracksForAlbum,
                    releaseDate: Date.now(),
                    createdAt: Date.now(),
                    submissionId: submission.id,
                    storageProvider:
                        submission.submissionType === "r2_direct"
                            ? "cloudflare_r2"
                            : "external_link",
                };

                await addDoc(collection(db, "albums"), albumData);

                statusMessage = `✅ ¡Publicado! Archivos migrados y álbum creado.`;
            }

            submission.status = "approved";
            submissions = submissions;

            dispatch("approved");

            setTimeout(() => (statusMessage = ""), 6000);
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
            Escucha y verifica el material subido directamente a Cloudflare R2.
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
            <p class="mt-4 text-slate-400">
                Cargando envíos recientes (max 50)...
            </p>
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
                    <div class="absolute top-4 right-4 flex gap-2">
                        {#if sub.submissionType === "r2_direct"}
                            <span
                                class="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold border border-blue-500/30 flex items-center gap-1"
                            >
                                ☁️ R2 Direct
                            </span>
                        {/if}

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
                            {:else if sub.r2CoverKey}
                                <!-- Placeholder for R2 Cover (would need signed URL to view) -->
                                <div
                                    class="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 p-2 text-center"
                                >
                                    <span class="text-2xl mb-1">🖼️</span>
                                    <span class="text-[10px]">Cover en R2</span>
                                </div>
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

                    <!-- Material Inspector -->
                    <div class="bg-black/20 rounded-xl p-6">
                        <h4
                            class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between"
                        >
                            <span>Material de Audio</span>
                        </h4>

                        {#if sub.submissionType === "r2_direct" && sub.r2AudioKeys}
                            <div class="space-y-2">
                                {#each sub.r2AudioKeys as track, i}
                                    <div
                                        class="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-all"
                                    >
                                        <button
                                            on:click={() =>
                                                playR2Audio(track.key)}
                                            class="w-10 h-10 rounded-full flex items-center justify-center transition-all {playingKey ===
                                            track.key
                                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                                : 'bg-white/10 text-white hover:bg-white/20'}"
                                        >
                                            {#if playingKey === track.key && playingAudio && !playingAudio.paused}
                                                ⏸
                                            {:else}
                                                ▶
                                            {/if}
                                        </button>
                                        <div class="flex-1 overflow-hidden">
                                            <p
                                                class="font-bold text-sm truncate text-white"
                                            >
                                                {track.name}
                                            </p>
                                            <p class="text-xs text-slate-400">
                                                {(
                                                    track.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else if sub.downloadLink}
                            <!-- Legacy Link View -->
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
                                        on:click={() => {
                                            navigator.clipboard.writeText(
                                                sub.downloadLink || "",
                                            );
                                            statusMessage = "📋 URL copiada";
                                        }}
                                        class="flex-1 sm:flex-none px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold whitespace-nowrap transition-colors"
                                    >
                                        📋 Copiar
                                    </button>
                                    <a
                                        href={sub.downloadLink}
                                        target="_blank"
                                        class="flex-1 sm:flex-none px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-colors shadow-lg shadow-primary-900/20"
                                    >
                                        ⬇️ Abrir
                                    </a>
                                </div>
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
