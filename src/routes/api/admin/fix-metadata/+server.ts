import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { requireAdmin } from '$lib/server/auth';
import { handleAPIError } from '$lib/server/errors';
import { adminDB } from '$lib/server/admin';

// Helper to get MIME type from extension
function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'm4a': 'audio/mp4',
        'aac': 'audio/aac',
        'flac': 'audio/flac',
    };
    return mimeTypes[ext || ''] || 'audio/mpeg'; // Default to audio/mpeg
}

export async function POST({ request, locals }: RequestEvent) {
    try {
        // Require admin authentication
        const user = requireAdmin(locals);

        console.log('[FIX-METADATA] Starting metadata fix process...');

        // Check if Firebase Admin is initialized
        if (!adminDB) {
            return json({
                error: 'Firebase Admin not initialized',
                code: 'NO_ADMIN_DB'
            }, { status: 500 });
        }

        // 1. Get all albums from Firestore
        const albumsSnapshot = await adminDB.collection('albums').get();
        const results: any = {
            total: 0,
            fixed: 0,
            errors: [],
            skipped: 0
        };

        for (const albumDoc of albumsSnapshot.docs) {
            const album = albumDoc.data();
            const tracks = album.tracks || [];

            for (const track of tracks) {
                if (!track.r2Key) continue;

                results.total++;
                console.log(`[FIX-METADATA] Processing: ${track.r2Key}`);

                try {
                    // Check current metadata
                    const headCommand = new HeadObjectCommand({
                        Bucket: R2_BUCKET,
                        Key: track.r2Key,
                    });

                    const headResult = await r2.send(headCommand);
                    const currentContentType = headResult.ContentType || '';

                    // Skip if already correct
                    if (currentContentType === 'audio/mpeg' ||
                        currentContentType === 'audio/wav' ||
                        currentContentType === 'audio/mp4') {
                        console.log(`[FIX-METADATA] Already correct: ${track.r2Key}`);
                        results.skipped++;
                        continue;
                    }

                    // Determine correct content type from filename
                    const correctContentType = getMimeType(track.r2Key);

                    console.log(`[FIX-METADATA] Fixing ${track.r2Key}: ${currentContentType} → ${correctContentType}`);

                    // Re-copy object with correct metadata
                    const copyCommand = new CopyObjectCommand({
                        Bucket: R2_BUCKET,
                        CopySource: `${R2_BUCKET}/${track.r2Key}`,
                        Key: track.r2Key,
                        MetadataDirective: 'REPLACE',
                        ContentType: correctContentType,
                    });

                    await r2.send(copyCommand);
                    results.fixed++;
                    console.log(`[FIX-METADATA] ✅ Fixed: ${track.r2Key}`);

                } catch (error: any) {
                    console.error(`[FIX-METADATA] ❌ Error fixing ${track.r2Key}:`, error);
                    results.errors.push({
                        key: track.r2Key,
                        error: error.message
                    });
                }
            }
        }

        console.log('[FIX-METADATA] Results:', results);

        return json({
            success: true,
            message: `Processed ${results.total} tracks. Fixed ${results.fixed}, skipped ${results.skipped}, errors: ${results.errors.length}`,
            details: results
        });

    } catch (err: any) {
        console.error('[FIX-METADATA] Fatal error:', err);
        return handleAPIError(err);
    }
}
