import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { adminDB } from '$lib/server/admin';
import { migrateSubmissionFiles } from '$lib/server/r2-migration';
import { requireAdmin } from '$lib/server/auth';
import { handleAPIError, logAudit } from '$lib/server/errors';
import { validateArtistName, validateAlbumTitle } from '$lib/server/validation';

export async function POST({ request, locals }: RequestEvent) {
    try {
        // SECURITY: Require admin authentication
        const admin = await requireAdmin(locals);

        const { submissionId, artistVerifiedName, albumTitle, files } = await request.json();

        if (!files || !Array.isArray(files) || files.length === 0) {
            return json({
                error: 'No hay archivos para migrar',
                code: 'NO_FILES',
                detail: 'El envío no tiene archivos R2 para procesar'
            }, { status: 400 });
        }

        // SECURITY: Validate and sanitize artist name and album title
        let safeArtist: string;
        let safeAlbum: string;

        try {
            safeArtist = validateArtistName(artistVerifiedName);
            safeAlbum = validateAlbumTitle(albumTitle);
        } catch (validationErr: any) {
            return json({
                error: 'Datos inválidos',
                code: 'VALIDATION_ERROR',
                detail: validationErr.message
            }, { status: 400 });
        }

        const { migratedFiles, errors } = await migrateSubmissionFiles(files, safeArtist, safeAlbum);
        const finalPath = `music/${safeArtist}/${safeAlbum}`;

        // SECURITY: Log approval for audit trail
        logAudit({
            action: 'submission_approved',
            userId: admin.uid,
            targetId: submissionId,
            details: {
                artistName: artistVerifiedName,
                albumTitle,
                migratedCount: migratedFiles.length,
                errorCount: errors.length,
                finalPath
            }
        });

        return json({
            success: true,
            migratedFiles,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (err: any) {
        console.error('R2 Approve Error:', err);
        return handleAPIError(err);
    }
}
