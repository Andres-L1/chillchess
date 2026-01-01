import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize the app if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

export const scheduledFirestoreBackup = functions
    .pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || 'chillchess';
        const bucket = 'gs://chillchess-backups';
        const date = new Date().toISOString().split('T')[0];

        try {
            // Access the Firestore Admin Client exposed by firebase-admin's underlying dependency
            // We cast to 'any' here because the standard types don't always expose the v1/GAPIC client layer
            // cleanly on the default namespace, but it is available.
            const firestore = admin.firestore();
            const client = (firestore as any)._firestoreClient || (firestore as any)._client; // Internal client access

            if (client && typeof client.exportDocuments === 'function') {
                await client.exportDocuments({
                    name: client.databasePath(projectId, '(default)'),
                    outputUriPrefix: `${bucket}/firestore/${date}`,
                    collectionIds: ['users', 'albums', 'proposals', 'bug_reports', 'artistProfiles']
                });
                functions.logger.info(`✅ Backup (Native Export) completed successfully for date: ${date}`);
            } else {
                // Fallback: Using the REST API via googleapis would be better, but we don't have it.
                // We will log a warning that native export is unavailable and doing nothing is safer than a bad script.
                // Actually, in Cloud Functions environment, we can use:
                const { FirestoreAdminClient } = require('@google-cloud/firestore/build/src/v1');
                const adminClient = new FirestoreAdminClient();

                const databaseName = adminClient.databasePath(projectId, '(default)');
                await adminClient.exportDocuments({
                    name: databaseName,
                    outputUriPrefix: `${bucket}/firestore/${date}`,
                    collectionIds: ['users', 'albums', 'proposals', 'bug_reports', 'artistProfiles']
                });
                functions.logger.info(`✅ Backup (AdminClient) completed successfully for date: ${date}`);
            }
        } catch (error) {
            functions.logger.error('❌ Backup failed:', error);
            throw error;
        }
    });
