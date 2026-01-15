import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { adminDB } from '$lib/server/admin';
import { migrateSubmissionFiles } from '$lib/server/r2-migration';
import { validateArtistName, validateAlbumTitle } from '$lib/server/validation';
import { requireAuth } from '$lib/server/auth';
import { handleAPIError, logAudit } from '$lib/server/errors';
// import admin from 'firebase-admin';

/**
 * Auto-publish endpoint for VERIFIED artists only
 * Bypasses admin approval and publishes album immediately
 */
export async function POST({ request, locals }: RequestEvent) {
    try {
        // SECURITY: Require authentication
        const user = await requireAuth(locals);

        // Ensure adminDB is initialized
        if (!adminDB) {
            throw new Error('Database not initialized');
        }

        // Get request data
        const { albumData, files } = await request.json();

        // SECURITY: Verify user is VERIFIED
        const userDoc = await adminDB.collection('users').doc(user.uid).get();
        const userData = userDoc.data();

        if (!userData?.isVerified) {
            logAudit({
                action: 'auto_publish_rejected',
                userId: user.uid,
                details: { reason: 'Not verified' },
            });

            return json(
                {
                    error: 'Solo artistas verificados pueden auto-publicar',
                    code: 'NOT_VERIFIED',
                    requiresReview: true,
                },
                { status: 403 }
            );
        }

        // SECURITY: Rate limiting (5 albums per hour for verified)
        const recentAlbumsQuery = await adminDB.collection('users').doc(user.uid).get();
        const lastPublishTime = recentAlbumsQuery.data()?.lastAutoPublish || 0;
        const hourAgo = Date.now() - 60 * 60 * 1000;

        if (lastPublishTime > hourAgo) {
            const publishCount = recentAlbumsQuery.data()?.autoPublishCountHour || 0;
            if (publishCount >= 5) {
                return json(
                    {
                        error: 'Límite de publicaciones alcanzado (5 por hora)',
                        code: 'RATE_LIMIT',
                    },
                    { status: 429 }
                );
            }
        }

        // Validate and sanitize data
        let safeArtist: string;
        let safeAlbum: string;

        try {
            safeArtist = validateArtistName(albumData.artistName);
            safeAlbum = validateAlbumTitle(albumData.albumTitle);
        } catch (validationErr: any) {
            return json(
                {
                    error: 'Datos inválidos',
                    detail: validationErr.message,
                },
                { status: 400 }
            );
        }

        let migratedFiles = [];
        let secureCoverKey: string | null = null;
        let tracksForAlbum = [];

        // PHASE 1: Migrate R2 files if this is R2 upload
        if (files && files.length > 0) {
            try {
                const migrationResult = await migrateSubmissionFiles(files, safeArtist, safeAlbum);

                migratedFiles = migrationResult.migratedFiles;

                // Extract cover
                const coverFile =
                    migratedFiles.find((f: any) => f.name.startsWith('cover_')) ||
                    migratedFiles.find((f: any) => f.name.match(/\.(jpg|jpeg|png|webp)$/i));
                secureCoverKey = coverFile ? coverFile.key : null;

                // Create tracks
                const audioFiles = migratedFiles.filter(
                    (f: any) => f.key !== secureCoverKey
                );

                tracksForAlbum = audioFiles.map((f: any, idx: number) => ({
                    id: `track-${idx + 1}`,
                    title: f.name.replace(/\.(mp3|wav|m4a)$/i, ''),
                    r2Key: f.key,
                    albumCover: secureCoverKey,
                    artist: albumData.artistName,
                    duration: 0,
                }));
            } catch (migrationErr: any) {
                // FALLBACK: If migration fails, don't auto-publish
                console.error('❌ R2 Migration failed for auto-publish:', migrationErr);

                return json(
                    {
                        error: 'Error al migrar archivos',
                        detail: migrationErr.message,
                        requiresReview: true,
                        fallbackMessage:
                            'Tu envío requiere revisión manual debido a un error técnico.',
                    },
                    { status: 500 }
                );
            }
        } else {
            // External link uploads
            tracksForAlbum = albumData.tracks || [];
        }

        // PHASE 2: Create album directly in Firestore
        const finalAlbumData: any = {
            title: albumData.albumTitle,
            artist: albumData.artistName,
            artistId: user.uid,
            cover: albumData.coverUrl || null,
            r2CoverKey: secureCoverKey,
            category: albumData.genre || 'Chill',
            albumCategory: albumData.albumCategory || 'album',
            tracks: tracksForAlbum,
            releaseDate: Date.now(),
            createdAt: Date.now(),
            autoPublished: true, // Mark as auto-published
            storageProvider: files && files.length > 0 ? 'cloudflare_r2' : 'external_link',
        };

        const albumRef = await adminDB.collection('albums').add(finalAlbumData);

        // PHASE 3: Update user stats
        await adminDB.collection('users').doc(user.uid).update({
            lastAutoPublish: Date.now(),
            autoPublishCountHour: (userData.autoPublishCountHour || 0) + 1,
            totalAlbumsPublished: (userData.totalAlbumsPublished || 0) + 1,
            updatedAt: Date.now(),
        });

        // Audit log
        logAudit({
            action: 'auto_publish_success',
            userId: user.uid,
            targetId: albumRef.id,
            details: {
                artist: albumData.artistName,
                album: albumData.albumTitle,
                tracksCount: tracksForAlbum.length,
            },
        });

        return json({
            success: true,
            albumId: albumRef.id,
            autoPublished: true,
            message: '🎉 ¡Álbum publicado exitosamente!',
        });
    } catch (err: any) {
        console.error('Auto-publish error:', err);
        return handleAPIError(err);
    }
}
