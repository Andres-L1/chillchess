import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

// Note: This endpoint is a placeholder for manual backup triggering
// Actual implementation requires Google Cloud Functions and proper IAM setup
// See .agent/PENDING_FIXES.md for complete setup instructions

export const POST = async ({ locals }: RequestEvent) => {
    // Check admin auth
    // @ts-ignore
    const user = locals.user;

    // TODO: Reemplazar con tu UID real para bypass de emergencia si los claims fallan
    const OWNER_UID = "tu-uid-aqui";

    if (!user) {
        return json({
            error: 'Unauthorized',
            details: 'No se pudo verificar la sesión. Revisa las variables de entorno del servidor (FB_PRIVATE_KEY).'
        }, { status: 403 });
    }

    if (!user.isAdmin && user.uid !== OWNER_UID) {
        return json({
            error: 'Forbidden',
            details: `El usuario ${user.email} (${user.uid}) no tiene permisos de administrador.`,
            debug: user
        }, { status: 403 });
    }

    try {
        // TODO: Implement actual backup trigger
        // This would typically call a Cloud Function that executes:
        //
        // const admin = require('firebase-admin');
        // const client = admin.firestore();
        // 
        // const outputUriPrefix = `gs://chillchess-backups/firestore/${new Date().toISOString().split('T')[0]}`;
        // 
        // await client.exportDocuments({
        //     collectionIds: ['users', 'albums', 'proposals', 'bug_reports', 'musicSubmissions', 'listenRooms'],
        //     outputUriPrefix
        // });

        // For now, return a message indicating manual setup needed
        return json({
            message: 'Manual backup trigger not yet configured. Please use Google Cloud Console to trigger backups manually, or configure Cloud Functions as per documentation.',
            documentation: '.agent/PENDING_FIXES.md Section 5.D Phase 1',
            consoleUrl: 'https://console.cloud.google.com/firestore',
        }, { status: 501 }); // 501 = Not Implemented
    } catch (error) {
        console.error('Error triggering backup:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
