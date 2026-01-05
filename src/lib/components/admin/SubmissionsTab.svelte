<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { slide } from 'svelte/transition';
    import { db } from '$lib/firebase';
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
        where,
        addDoc,
    } from 'firebase/firestore';
    import { toast } from '$lib/stores/notificationStore';

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
        status: 'pending' | 'approved' | 'rejected';
        submittedAt: any;

        // New R2 Fields
        submissionType?: 'link' | 'direct' | 'r2_direct' | 'firebase_direct';
        r2CoverKey?: string;
        r2AudioKeys?: { key: string; name: string; size: number }[];
        audioFiles?: any[]; // Legacy direct upload
    }

    let submissions: Submission[] = [];
    let loading = true;
    let statusMessage = '';
    let playingAudio: HTMLAudioElement | null = null;
    let playingKey = '';
    let unsubscribe: () => void;
    let coverUrls = new Map<string, string>(); // Cache for R2 cover URLs

    async function loadR2CoverUrl(key: string): Promise<string | null> {
        if (coverUrls.has(key)) {
            return coverUrls.get(key) || null;
        }

        try {
            const res = await fetch('/api/r2/get-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
            });

            if (!res.ok) {
                console.error('Failed to get R2 cover URL:', res.status);
                return null;
            }

            const { url } = await res.json();
            coverUrls.set(key, url);
            coverUrls = coverUrls; // Trigger reactivity
            return url;
        } catch (e) {
            console.error('Error loading R2 cover:', e);
            return null;
        }
    }

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
            const res = await fetch('/api/r2/get-url', {
                method: 'POST',
                body: JSON.stringify({ key }),
            });
            const { url } = await res.json();

            playingAudio = new Audio(url);
            playingAudio.play();
            playingKey = key;
        } catch (e) {
            console.error('Error playing audio:', e);
            statusMessage = 'Error al reproducir audio';
        }
    }

    function playDirectAudio(url: string, id: string) {
        if (playingKey === id && playingAudio) {
            playingAudio.paused ? playingAudio.play() : playingAudio.pause();
            return;
        }

        if (playingAudio) {
            playingAudio.pause();
            playingAudio = null;
        }

        playingAudio = new Audio(url);
        playingAudio.play();
        playingKey = id;
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
            const submissionsRef = collection(db, 'musicSubmissions');
            const q = query(submissionsRef, orderBy('submittedAt', 'desc'), limit(50));

            unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    submissions = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Submission[];
                    loading = false;

                    // Pre-load cover URLs for pending submissions
                    submissions
                        .filter((s) => s.status === 'pending' && s.r2CoverKey)
                        .forEach((s) => {
                            if (s.r2CoverKey) {
                                loadR2CoverUrl(s.r2CoverKey);
                            }
                        });
                },
                (error) => {
                    console.error('Error realtime:', error);
                    statusMessage = '❌ Error en conexión tiempo real';
                    loading = false;
                }
            );
        } catch (e: any) {
            console.error(e);
            statusMessage = '❌ Error al iniciar listener: ' + e.message;
            loading = false;
        }
    }

    // Removed manual loadSubmissions as it's replaced by snapshot logic

    function getDomain(url: string) {
        try {
            return new URL(url).hostname;
        } catch {
            return 'url-invalida';
        }
    }

    function isKnownSafe(url: string) {
        if (!url) return false;
        const domain = getDomain(url).toLowerCase();
        return (
            domain.includes('mega.nz') ||
            domain.includes('drive.google.com') ||
            domain.includes('dropbox.com') ||
            domain.includes('wetransfer.com') ||
            domain.includes('transfer.it')
        );
    }

    function analyzeLink(url: string) {
        // Open Google Transparency Report for Safety Check
        window.open(
            `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(url)}`,
            '_blank'
        );
    }

    async function approveSubmission(submission: Submission) {
        if (!confirm(`¿Aprobar "${submission.releaseTitle}" de ${submission.artistName}?`)) return;

        try {
            const subRef = doc(db, 'musicSubmissions', submission.id);
            await updateDoc(subRef, {
                status: 'approved',
                reviewedAt: Date.now(),
            });

            const userRef = doc(db, 'users', submission.artistId);
            const userSnap = await getDoc(userRef);

            // --- RESOLVE TRUE ARTIST PROFILE (Fix for Split Brain/Custom IDs) ---
            // The submission has the UserID. We need to find the Public Profile ID.
            let targetProfileId = submission.artistId; // Default fallback to UID

            try {
                const artistsRef = collection(db, 'artists');
                const q = query(artistsRef, where('userId', '==', submission.artistId));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    // Prefer Verified profile or Custom ID profile
                    const profiles = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                    const best =
                        profiles.find((p: any) => p.isVerified) ||
                        profiles.find((p) => p.id !== submission.artistId) ||
                        profiles[0];
                    targetProfileId = best.id;
                    console.log(
                        `✅ Resolved Public Profile ID: ${targetProfileId} (instead of UID ${submission.artistId})`
                    );
                }
            } catch (err) {
                console.error('Error resolving profile:', err);
            }

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const currentApprovedCount = userData.approvedSubmissionsCount || 0;
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

                    // Update the RESOLVED artist profile
                    const artistRef = doc(db, 'artists', targetProfileId);
                    const artistSnap = await getDoc(artistRef);
                    if (artistSnap.exists()) {
                        await updateDoc(artistRef, {
                            isVerified: true,
                            verifiedAt: Date.now(),
                        });
                    } else if (targetProfileId !== submission.artistId) {
                        // Fallback check if resolved profile didn't exist for some reason
                        const uidRef = doc(db, 'artists', submission.artistId);
                        const uidSnap = await getDoc(uidRef);
                        if (uidSnap.exists()) {
                            await updateDoc(uidRef, { isVerified: true, verifiedAt: Date.now() });
                        }
                    }

                    statusMessage = `✅ Envío aprobado. ${submission.artistName} ahora es VERIFICADO ✓ (${newApprovedCount} aprobaciones)`;
                } else if (newApprovedCount >= 2) {
                    statusMessage = `✅ Envío aprobado (artista ya verificado, ${newApprovedCount} aprobaciones totales)`;
                } else {
                    statusMessage = `✅ Envío aprobado (${newApprovedCount}/2 para verificación automática)`;
                }

                // ✨ CREATE ALBUM IN COLLECTION (Auto-publish)
                const { addDoc, collection } = await import('firebase/firestore');

                let tracksForAlbum = [];
                let secureCoverKey = submission.r2CoverKey;

                if (submission.submissionType === 'r2_direct') {
                    // 🚀 R2 Migration (Move files to permanent folder)
                    statusMessage = '⏳ Migrando archivos en Cloudflare R2...';

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

                    const moveRes = await fetch('/api/r2/approve', {
                        method: 'POST',
                        body: JSON.stringify({
                            submissionId: submission.id,
                            artistVerifiedName: submission.artistName,
                            albumTitle: submission.releaseTitle,
                            files: filesToMigrate,
                        }),
                    });

                    if (!moveRes.ok) throw new Error('Error moviendo archivos en R2');

                    const { migratedFiles } = await moveRes.json();

                    // Map back to tracks
                    // Robustly find cover (starts with cover_) or fallback to first file if logic differs,
                    // but safer to find by name prefix as per backend logic
                    const newCover =
                        migratedFiles.find((f: any) => f.name.startsWith('cover_')) ||
                        migratedFiles[0];
                    secureCoverKey = newCover ? newCover.key : null;

                    // Audio files are the rest
                    const audioFiles = migratedFiles.filter((f: any) => f.key !== secureCoverKey);

                    tracksForAlbum = audioFiles.map((f: any, idx: number) => ({
                        id: `track-${idx + 1}`,
                        title: f.name.replace(/\.(mp3|wav|m4a)$/i, ''),
                        r2Key: f.key, // Store Private Key
                        duration: 0,
                    }));
                } else {
                    // Legacy (Link based)
                    tracksForAlbum = submission.tracklist
                        ? submission.tracklist
                              .split('\n')
                              .filter((t) => t.trim())
                              .map((line, idx) => ({
                                  id: `track-${idx + 1}`,
                                  title: line.replace(/^\d+\.\s*/, '').trim(),
                                  url: submission.downloadLink,
                              }))
                        : [];
                }

                const albumData = {
                    title: submission.releaseTitle,
                    artist: submission.artistName,
                    artistId: targetProfileId, // Use the RESOLVED profile ID (e.g. 'julyactv-official')
                    cover: submission.coverUrl ?? null, // STRICTLY ensure null if undefined
                    r2CoverKey: secureCoverKey ?? null, // STRICTLY ensure null if undefined
                    category: submission.genre || 'Chill',
                    tracks: tracksForAlbum,
                    releaseDate: Date.now(),
                    createdAt: Date.now(),
                    submissionId: submission.id,
                    storageProvider:
                        submission.submissionType === 'r2_direct'
                            ? 'cloudflare_r2'
                            : 'external_link',
                };

                await addDoc(collection(db, 'albums'), albumData);

                statusMessage = `✅ ¡Publicado! Archivos migrados y álbum creado.`;
            }

            submission.status = 'approved';
            submissions = submissions;

            dispatch('approved');

            setTimeout(() => (statusMessage = ''), 6000);
        } catch (e: any) {
            statusMessage = '❌ Error: ' + e.message;
        }
    }

    async function reprocessSubmission(submission: Submission) {
        if (!confirm('¿Re-procesar este envío? Esto generará el álbum de nuevo.')) return;

        console.log('🚀 Starting reprocess for submission:', submission);

        // DEFENSIVE CHECKS
        if (!db) {
            console.error('❌ Firebase DB is not initialized');
            // Assuming 'toast' is available globally or imported elsewhere
            // If not, you'd need to add: import { toast } from 'svelte-french-toast'; or similar
            toast.error('Error interno de conexión (DB missing)');
            return;
        }
        if (!submission || !submission.artistId) {
            console.error('❌ Missing artistId in submission:', submission);
            toast.error('Error: Datos del envío corruptos (Falta Artist ID)');
            return;
        }

        try {
            statusMessage = '⏳ Re-procesando envío...';

            const userRef = doc(db, 'users', submission.artistId);
            const userSnap = await getDoc(userRef);

            // --- RESOLVE TRUE ARTIST PROFILE (Fix for Split Brain/Custom IDs) ---
            let targetProfileId = submission.artistId;

            try {
                const artistsRef = collection(db, 'artists');
                const q = query(artistsRef, where('userId', '==', submission.artistId));
                const snapshot = await getDocs(q);

                if (!snapshot.empty) {
                    const profiles = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                    const best =
                        profiles.find((p: any) => p.isVerified) ||
                        profiles.find((p) => p.id !== submission.artistId) ||
                        profiles[0];
                    targetProfileId = best.id;
                    console.log(`✅ Re-process: Resolved Profile ID: ${targetProfileId}`);
                }
            } catch (err) {
                console.error('Error resolving profile:', err);
            }

            // ✨ CREATE ALBUM IN COLLECTION
            // Removed dynamic import completely
            // const { addDoc } = await import('firebase/firestore');

            let tracksForAlbum = [];
            let secureCoverKey = submission.r2CoverKey;

            console.log('🔄 Logic: Processing tracks...');

            if (submission.submissionType === 'r2_direct') {
                // 🚀 R2 Migration (Move files to permanent folder)
                statusMessage = '⏳ Migrando archivos en Cloudflare R2...';

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

                // Validate files
                if (!filesToMigrate.every((f) => f.key)) {
                    console.error('Missing keys in filesToMigrate:', filesToMigrate);
                    throw new Error('Faltan claves de archivo en la metadata del envío');
                }

                const moveRes = await fetch('/api/r2/approve', {
                    method: 'POST',
                    body: JSON.stringify({
                        submissionId: submission.id,
                        artistVerifiedName: submission.artistName,
                        albumTitle: submission.releaseTitle,
                        files: filesToMigrate,
                    }),
                });

                if (!moveRes.ok) {
                    const errData = await moveRes.json().catch(() => ({}));
                    throw new Error(errData.error || 'Error moviendo archivos en R2');
                }

                const { migratedFiles } = await moveRes.json();

                // Find cover in migrated files (it starts with 'cover_')
                const newCover = migratedFiles.find((f: any) => f.name.startsWith('cover_'));
                secureCoverKey = newCover ? newCover.key : null;

                // Identify audio files (everything that is NOT the cover)
                const audioFiles = migratedFiles.filter((f: any) => !f.name.startsWith('cover_'));

                tracksForAlbum = audioFiles.map((f: any, idx: number) => ({
                    id: `track-${idx + 1}`,
                    title: f.name.replace(/\.(mp3|wav|m4a)$/i, ''),
                    r2Key: f.key,
                    duration: 0,
                }));
            } else {
                // Legacy (Link based)
                tracksForAlbum = submission.tracklist
                    ? submission.tracklist
                          .split('\n')
                          .filter((t) => t.trim())
                          .map((line, idx) => ({
                              id: `track-${idx + 1}`,
                              title: line.replace(/^\d+\.\s*/, '').trim(),
                              url: submission.downloadLink,
                          }))
                    : [];
            }

            if (!targetProfileId) {
                throw new Error('Target Profile ID is undefined');
            }

            const albumData = {
                title: submission.releaseTitle || 'Untitled Album',
                artist: submission.artistName || 'Unknown Artist',
                artistId: targetProfileId,
                cover: submission.coverUrl ?? null, // Ensure not undefined (STRICT)
                r2CoverKey: secureCoverKey ?? null, // Ensure not undefined (STRICT)
                category: submission.genre || 'Chill',
                tracks: tracksForAlbum,
                releaseDate: Date.now(),
                createdAt: Date.now(),
                submissionId: submission.id,
                storageProvider:
                    submission.submissionType === 'r2_direct' ? 'cloudflare_r2' : 'external_link',
            };

            console.log('💾 Saving album to Firestore:', albumData);

            await addDoc(collection(db, 'albums'), albumData);
            console.log('✅ Album created in Firestore');

            statusMessage = `✅ ¡Re-procesado exitosamente! Álbum creado.`;
            dispatch('approved');

            setTimeout(() => (statusMessage = ''), 6000);
        } catch (e: any) {
            statusMessage = '❌ Error al re-procesar: ' + e.message;
            console.error('Reprocess error:', e);
        }
    }

    async function rejectSubmission(submission: Submission) {
        if (!confirm(`¿Rechazar "${submission.releaseTitle}"?`)) return;

        try {
            const subRef = doc(db, 'musicSubmissions', submission.id);
            await updateDoc(subRef, {
                status: 'rejected',
                reviewedAt: Date.now(),
            });

            submission.status = 'rejected';
            submissions = submissions;

            statusMessage = `❌ Envío rechazado`;
            dispatch('approved');

            setTimeout(() => (statusMessage = ''), 3000);
        } catch (e: any) {
            statusMessage = '❌ Error: ' + e.message;
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
            <p class="mt-4 text-slate-400">Cargando envíos recientes (max 50)...</p>
        </div>
    {:else if submissions.length === 0}
        <div class="text-center py-12 text-slate-400">
            <p>No hay envíos pendientes</p>
        </div>
    {:else}
        {@const pendingSubmissions = submissions.filter((s) => s.status === 'pending')}
        {@const processedSubmissions = submissions.filter((s) => s.status !== 'pending')}

        <div class="space-y-8">
            <!-- SECTION 1: PENDING (Detailed Card View) -->
            {#if pendingSubmissions.length > 0}
                <div class="space-y-4">
                    <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                        Pendientes de Revisión ({pendingSubmissions.length})
                    </h3>

                    {#each pendingSubmissions as sub (sub.id)}
                        <div
                            class="bg-slate-800/50 border border-white/10 rounded-2xl p-6 transition-all hover:border-primary-500/50 relative overflow-hidden group"
                            transition:slide|local
                        >
                            <!-- Status Badge Overlay -->
                            <div class="absolute top-4 right-4 flex gap-2 z-10">
                                {#if sub.submissionType === 'r2_direct'}
                                    <span
                                        class="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold border border-blue-500/30 flex items-center gap-1"
                                        >☁️ R2</span
                                    >
                                {:else}
                                    <span
                                        class="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-xs font-bold border border-orange-500/30 flex items-center gap-1"
                                        >🔥 Base</span
                                    >
                                {/if}
                                <span
                                    class="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-bold uppercase tracking-wider"
                                    >Pendiente</span
                                >
                            </div>

                            <div class="flex flex-col md:flex-row gap-6 mb-6">
                                <!-- Cover Art -->
                                <div
                                    class="w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-black/50 relative shadow-2xl"
                                >
                                    {#if sub.coverUrl}
                                        <img
                                            src={sub.coverUrl}
                                            alt={sub.releaseTitle}
                                            class="w-full h-full object-cover"
                                        />
                                    {:else if sub.r2CoverKey}
                                        {#await loadR2CoverUrl(sub.r2CoverKey)}
                                            <div
                                                class="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 p-2 text-center animate-pulse"
                                            >
                                                <span class="text-3xl mb-2">⏳</span>
                                                <span class="text-xs">Cargando...</span>
                                            </div>
                                        {:then coverUrl}
                                            {#if coverUrl}
                                                <img
                                                    src={coverUrl}
                                                    alt={sub.releaseTitle}
                                                    class="w-full h-full object-cover"
                                                />
                                            {:else}
                                                <div
                                                    class="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 p-2 text-center"
                                                >
                                                    <span class="text-3xl mb-2">⚠️</span>
                                                    <span class="text-xs">Error cargando</span>
                                                </div>
                                            {/if}
                                        {/await}
                                    {:else}
                                        <div
                                            class="w-full h-full flex items-center justify-center text-4xl"
                                        >
                                            💿
                                        </div>
                                    {/if}
                                </div>

                                <div class="flex-1 min-w-0 pt-2">
                                    <h3 class="text-2xl font-bold text-white mb-1 truncate">
                                        {sub.releaseTitle}
                                    </h3>
                                    <p class="text-lg text-slate-300 mb-4">{sub.artistName}</p>

                                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div
                                            class="bg-black/20 p-3 rounded-lg border border-white/5"
                                        >
                                            <p
                                                class="text-[10px] text-slate-500 uppercase font-bold mb-1"
                                            >
                                                Género
                                            </p>
                                            <p class="text-sm text-white truncate">
                                                🎵 {sub.genre || 'N/A'}
                                            </p>
                                        </div>
                                        <div
                                            class="bg-black/20 p-3 rounded-lg border border-white/5"
                                        >
                                            <p
                                                class="text-[10px] text-slate-500 uppercase font-bold mb-1"
                                            >
                                                Email
                                            </p>
                                            <p
                                                class="text-sm text-white truncate"
                                                title={sub.artistEmail}
                                            >
                                                📧 {sub.artistEmail}
                                            </p>
                                        </div>
                                        <div
                                            class="bg-black/20 p-3 rounded-lg border border-white/5"
                                        >
                                            <p
                                                class="text-[10px] text-slate-500 uppercase font-bold mb-1"
                                            >
                                                Enviado
                                            </p>
                                            <p class="text-sm text-white truncate">
                                                📅 {new Date(
                                                    sub.submittedAt?.seconds * 1000
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div
                                            class="bg-black/20 p-3 rounded-lg border border-white/5"
                                        >
                                            <p
                                                class="text-[10px] text-slate-500 uppercase font-bold mb-1"
                                            >
                                                Tipo
                                            </p>
                                            <p class="text-sm text-white truncate">
                                                {sub.submissionType === 'r2_direct'
                                                    ? 'Large File (R2)'
                                                    : 'Standard'}
                                            </p>
                                        </div>
                                    </div>

                                    <div class="flex gap-3">
                                        <button
                                            on:click={() => approveSubmission(sub)}
                                            class="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-green-500/20 flex items-center gap-2"
                                        >
                                            <span>✓</span> Aprobar
                                        </button>
                                        <button
                                            on:click={() => rejectSubmission(sub)}
                                            class="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl font-bold text-sm transition-all border border-red-500/20"
                                        >
                                            ✗ Rechazar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Audio Preview Section -->
                            <div class="bg-black/20 rounded-xl p-4 border border-white/5">
                                <h4
                                    class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3"
                                >
                                    Previsualización de Audio
                                </h4>
                                {#if sub.submissionType === 'r2_direct' && sub.r2AudioKeys}
                                    <div class="space-y-2">
                                        {#each sub.r2AudioKeys as track}
                                            <button
                                                type="button"
                                                class="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/track w-full text-left"
                                                on:click={() => playR2Audio(track.key)}
                                            >
                                                <div
                                                    class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover/track:scale-110 transition-transform"
                                                >
                                                    {#if playingKey === track.key && playingAudio && !playingAudio.paused}⏸{:else}▶{/if}
                                                </div>
                                                <div class="flex-1">
                                                    <p class="text-sm font-bold text-white">
                                                        {track.name}
                                                    </p>
                                                    <p class="text-[10px] text-slate-400">
                                                        {(track.size / 1024 / 1024).toFixed(1)} MB
                                                    </p>
                                                </div>
                                            </button>
                                        {/each}
                                    </div>
                                {:else if sub.audioFiles}
                                    <div class="space-y-2">
                                        {#each sub.audioFiles as track}
                                            <button
                                                type="button"
                                                class="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/track w-full text-left"
                                                on:click={() =>
                                                    playDirectAudio(track.key, track.key)}
                                            >
                                                <div
                                                    class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover/track:scale-110 transition-transform"
                                                >
                                                    {#if playingKey === track.key && playingAudio && !playingAudio.paused}⏸{:else}▶{/if}
                                                </div>
                                                <div class="flex-1">
                                                    <p class="text-sm font-bold text-white">
                                                        Track de Audio
                                                    </p>
                                                </div>
                                            </button>
                                        {/each}
                                    </div>
                                {:else}
                                    <a
                                        href={sub.downloadLink}
                                        target="_blank"
                                        class="block w-full text-center py-3 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors font-bold border border-blue-500/20"
                                    >
                                        🔗 Abrir Enlace Externo
                                    </a>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div
                    class="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10"
                >
                    <div class="text-4xl mb-3">✅</div>
                    <h3 class="text-xl font-bold text-white mb-1">¡Todo limpio!</h3>
                    <p class="text-slate-400">
                        No hay envíos pendientes de revisión en este momento.
                    </p>
                </div>
            {/if}

            <!-- SECTION 2: PROCESSED (Compact Table View) -->
            {#if processedSubmissions.length > 0}
                <div class="pt-8 border-t border-white/10">
                    <h3 class="text-lg font-bold text-slate-400 mb-6 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            /></svg
                        >
                        Historial Reciente
                    </h3>
                    <div
                        class="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden shadow-xl"
                    >
                        <table class="w-full text-sm text-left text-slate-400">
                            <thead
                                class="text-xs text-slate-500 uppercase bg-black/40 border-b border-white/5"
                            >
                                <tr>
                                    <th class="px-6 py-4 font-bold tracking-wider">Estado</th>
                                    <th class="px-6 py-4 font-bold tracking-wider">Lanzamiento</th>
                                    <th class="px-6 py-4 font-bold tracking-wider">Artista</th>
                                    <th class="px-6 py-4 font-bold tracking-wider">Fecha</th>
                                    <th class="px-6 py-4 font-bold tracking-wider text-right"
                                        >Acciones</th
                                    >
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                {#each processedSubmissions as sub (sub.id)}
                                    <tr class="hover:bg-white/5 transition-colors group">
                                        <td class="px-6 py-4">
                                            {#if sub.status === 'approved'}
                                                <span
                                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20"
                                                >
                                                    <span
                                                        class="w-1.5 h-1.5 rounded-full bg-green-500"
                                                    ></span> Aprobado
                                                </span>
                                            {:else}
                                                <span
                                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"
                                                >
                                                    <span
                                                        class="w-1.5 h-1.5 rounded-full bg-red-500"
                                                    ></span> Rechazado
                                                </span>
                                            {/if}
                                        </td>
                                        <td
                                            class="px-6 py-4 font-medium text-white group-hover:text-primary-400 transition-colors"
                                        >
                                            {sub.releaseTitle}
                                        </td>
                                        <td class="px-6 py-4">
                                            {sub.artistName}
                                        </td>
                                        <td class="px-6 py-4">
                                            {new Date(
                                                sub.submittedAt?.seconds * 1000
                                            ).toLocaleDateString()}
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            {#if sub.status === 'approved'}
                                                <button
                                                    on:click={() => reprocessSubmission(sub)}
                                                    class="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-all border border-blue-500/20 hover:border-blue-500"
                                                >
                                                    <svg
                                                        class="w-3.5 h-3.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        ><path
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                        /></svg
                                                    >
                                                    Re-procesar
                                                </button>
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>
