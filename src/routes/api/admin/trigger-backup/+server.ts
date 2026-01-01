import { json } from '@sveltejs/kit';
import { adminAuth, adminDB } from '$lib/server/admin';
import { env } from '$env/dynamic/private';

export const POST = async ({ locals }) => {
    // 1. Verify Admin
    if (!locals.user || !locals.user.isAdmin) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!adminDB) {
        return json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    try {
        // 2. Trigger Export via Firestore Admin SDK
        // Note: This requires the App Engine default service account to have 
        // 'Cloud Datastore Import Export Admin' role.

        const projectId = env.GCP_PROJECT || process.env.GCP_PROJECT || 'chillchess';
        const bucket = 'gs://chillchess-backups';
        const date = new Date().toISOString().split('T')[0];

        // Access internal GAPIC client (needed for exportDocuments)
        const firestore = adminDB;
        const client = (firestore as any)._firestoreClient || (firestore as any)._client;
        if (client) {
            // Depending on the client version, method might be different, but usually it's this or via REST
            // We try to reuse the same logic as the Cloud Function

            const databaseName = client.databasePath(projectId, '(default)');
            // Use the client to export
            await client.exportDocuments({
                name: databaseName,
                outputUriPrefix: `${bucket}/firestore/manual_${date}_${Date.now()}`,
                collectionIds: ['users', 'albums', 'proposals', 'bug_reports', 'artistProfiles']
            });
        } else {
            console.warn("Could not find inner Firestore client for export.");
            throw new Error("Manual backup unavailable: Internal client not found.");
        }

        return json({ success: true, message: 'Backup initiated' });

    } catch (error: any) {
        console.error('Backup trigger error:', error);
        return json({ error: error.message }, { status: 500 });
    }
};
