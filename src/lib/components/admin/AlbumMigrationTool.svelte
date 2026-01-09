<script lang="ts">
    import { db } from '$lib/firebase';
    import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
    import { toast } from '$lib/stores/notificationStore';

    let fixing = false;
    let fixLog: string[] = [];
    let albumsFixed = 0;

    async function fixAllAlbums() {
        if (
            !confirm(
                'Esto actualizará TODOS los álbumes para corregir artistId y covers. ¿Continuar?'
            )
        )
            return;

        fixing = true;
        fixLog = [];
        albumsFixed = 0;

        try {
            fixLog.push('🔍 Buscando todos los álbumes...');
            const albumsSnap = await getDocs(collection(db, 'albums'));
            const totalAlbums = albumsSnap.size;
            fixLog.push(`📊 Encontrados ${totalAlbums} álbumes`);

            for (const albumDoc of albumsSnap.docs) {
                const album = albumDoc.data();
                const updates: any = {};
                let needsUpdate = false;

                // Fix 1: Verify artistId matches submission owner
                if (album.submissionId) {
                    try {
                        const submissionSnap = await getDocs(
                            query(
                                collection(db, 'musicSubmissions'),
                                where('__name__', '==', album.submissionId)
                            )
                        );

                        if (!submissionSnap.empty) {
                            const submission = submissionSnap.docs[0].data();
                            if (album.artistId !== submission.artistId) {
                                updates.artistId = submission.artistId;
                                needsUpdate = true;
                                fixLog.push(
                                    `🔧 "${album.title}": Corrigiendo artistId de ${album.artistId} → ${submission.artistId}`
                                );
                            }
                        }
                    } catch (err) {
                        fixLog.push(`⚠️ "${album.title}": No se encontró submission`);
                    }
                }

                // Fix 2: Add albumCover to tracks if missing
                if (album.tracks && Array.isArray(album.tracks)) {
                    const coverKey = album.r2CoverKey || album.cover;
                    if (coverKey) {
                        const updatedTracks = album.tracks.map((track: any) => {
                            if (!track.albumCover && !track.cover) {
                                return { ...track, albumCover: coverKey };
                            }
                            return track;
                        });

                        // Check if any track was updated
                        const hasChanges = updatedTracks.some(
                            (t: any, i: number) => t.albumCover && !album.tracks[i].albumCover
                        );

                        if (hasChanges) {
                            updates.tracks = updatedTracks;
                            needsUpdate = true;
                            fixLog.push(
                                `🖼️ "${album.title}": Agregando cover a ${updatedTracks.length} tracks`
                            );
                        }
                    }
                }

                // Apply updates
                if (needsUpdate) {
                    await updateDoc(doc(db, 'albums', albumDoc.id), updates);
                    albumsFixed++;
                }
            }

            fixLog.push(
                `✅ Migración completa: ${albumsFixed}/${totalAlbums} álbumes actualizados`
            );
            toast.success(`✅ ${albumsFixed} álbumes corregidos`);
        } catch (error: any) {
            fixLog.push(`❌ Error: ${error.message}`);
            toast.error('Error en la migración');
            console.error(error);
        } finally {
            fixing = false;
        }
    }

    async function fixSpecificAlbum(submissionId: string) {
        if (!submissionId.trim()) {
            toast.warning('Introduce un Submission ID');
            return;
        }

        fixing = true;
        fixLog = [];

        try {
            fixLog.push(`🔍 Buscando álbum con submissionId: ${submissionId}`);

            const albumsSnap = await getDocs(
                query(collection(db, 'albums'), where('submissionId', '==', submissionId.trim()))
            );

            if (albumsSnap.empty) {
                fixLog.push('❌ No se encontró el álbum');
                toast.error('Álbum no encontrado');
                return;
            }

            const albumDoc = albumsSnap.docs[0];
            const album = albumDoc.data();
            const updates: any = {};

            // Get submission data
            const submissionSnap = await getDocs(
                query(
                    collection(db, 'musicSubmissions'),
                    where('__name__', '==', submissionId.trim())
                )
            );

            if (submissionSnap.empty) {
                fixLog.push('⚠️ Submission no encontrada, solo corrigiendo covers');
            } else {
                const submission = submissionSnap.docs[0].data();
                updates.artistId = submission.artistId;
                fixLog.push(`🔧 Corrigiendo artistId → ${submission.artistId}`);
            }

            // Add covers to tracks
            if (album.tracks) {
                const coverKey = album.r2CoverKey || album.cover;
                if (coverKey) {
                    updates.tracks = album.tracks.map((track: any) => ({
                        ...track,
                        albumCover: coverKey,
                    }));
                    fixLog.push(`🖼️ Agregando cover a ${album.tracks.length} tracks`);
                }
            }

            await updateDoc(doc(db, 'albums', albumDoc.id), updates);
            fixLog.push(`✅ Álbum "${album.title}" actualizado`);
            toast.success('Álbum corregido');
        } catch (error: any) {
            fixLog.push(`❌ Error: ${error.message}`);
            toast.error('Error: ' + error.message);
        } finally {
            fixing = false;
        }
    }

    let specificSubmissionId = '';
</script>

<div class="space-y-6">
    <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <h3 class="font-bold text-yellow-400 mb-2">⚠️ Herramienta de Migración</h3>
        <p class="text-sm text-slate-300">
            Esta herramienta corrige álbumes existentes que tienen problemas de ownership o covers.
        </p>
    </div>

    <!-- Fix All Albums -->
    <div class="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
        <h4 class="font-bold text-lg mb-3">Migración Masiva</h4>
        <p class="text-sm text-slate-400 mb-4">
            Actualiza TODOS los álbumes en la base de datos:
            <br />• Corrige <code class="bg-white/10 px-1 rounded">artistId</code> basándose en
            submission
            <br />• Agrega <code class="bg-white/10 px-1 rounded">albumCover</code> a todos los tracks
        </p>
        <button
            on:click={fixAllAlbums}
            disabled={fixing}
            class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all"
        >
            {fixing ? '⏳ Procesando...' : '🔧 Migrar Todos los Álbumes'}
        </button>
    </div>

    <!-- Fix Specific Album -->
    <div class="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
        <h4 class="font-bold text-lg mb-3">Migración Individual</h4>
        <p class="text-sm text-slate-400 mb-4">
            Corrige un álbum específico usando el Submission ID:
        </p>
        <div class="flex gap-3">
            <input
                type="text"
                bind:value={specificSubmissionId}
                placeholder="Submission ID (ej: abc123...)"
                class="flex-1 bg-[#0B1120] border border-white/10 rounded-xl px-4 py-3 text-sm"
                disabled={fixing}
            />
            <button
                on:click={() => fixSpecificAlbum(specificSubmissionId)}
                disabled={fixing || !specificSubmissionId.trim()}
                class="px-6 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all"
            >
                {fixing ? '⏳' : '🔧'} Migrar
            </button>
        </div>
    </div>

    <!-- Log Output -->
    {#if fixLog.length > 0}
        <div class="bg-[#0B1120] rounded-xl p-4 border border-white/10">
            <h4 class="font-bold mb-3 flex items-center justify-between">
                <span>📋 Log de Migración</span>
                <button
                    on:click={() => (fixLog = [])}
                    class="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg"
                >
                    Limpiar
                </button>
            </h4>
            <div class="space-y-1 max-h-96 overflow-y-auto font-mono text-xs">
                {#each fixLog as log}
                    <div class="text-slate-300">{log}</div>
                {/each}
            </div>
            <div class="mt-4 pt-3 border-t border-white/10 text-sm font-bold text-primary-400">
                Álbumes corregidos: {albumsFixed}
            </div>
        </div>
    {/if}
</div>
