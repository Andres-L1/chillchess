import { json } from '@sveltejs/kit';
import { adminAuth, adminDB } from '$lib/server/admin';
// @ts-ignore
import { env } from '$env/dynamic/private';

export const POST = async ({ locals }) => {
    if (!adminDB) {
        return json({ error: 'Firebase Admin not initialized' }, { status: 500 });
    }

    // 1. Verify Admin (Claims or Firestore Fallback)
    let isAdmin = locals.user && locals.user.isAdmin;

    // Fallback: Check Firestore if claims fail but user is authenticated
    if (!isAdmin && locals.user?.uid) {
        try {
            const userDoc = await adminDB.collection('users').doc(locals.user.uid).get();
            if (userDoc.exists && userDoc.data()?.isAdmin === true) {
                isAdmin = true;
            }
        } catch (e) {
            console.error('Admin fallback check failed:', e);
        }
    }

    if (!isAdmin) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Trigger Export via Google Cloud Firestore REST API
        // This is more robust than accessing internal private properties of the SDK

        const projectId = env.GCP_PROJECT || process.env.GCP_PROJECT || 'chillchess-57365';
        const bucket = 'gs://chillchess-backups';
        const date = new Date().toISOString().split('T')[0];
        const outputUriPrefix = `${bucket}/firestore/manual_${date}_${Date.now()}`;

        // Get Access Token using the initialized Admin SDK credentials
        // Use imports dynamically to access the global admin app instance safely
        const admin = (await import('firebase-admin')).default;

        if (!admin.apps.length) {
            throw new Error("Firebase Admin app not initialized");
        }

        const credential = admin.app().options.credential;
        if (!credential || typeof credential.getAccessToken !== 'function') {
            throw new Error("Service account credential missing or invalid. Cannot generate access token.");
        }

        const tokenObj = await credential.getAccessToken();
        const accessToken = tokenObj.access_token;

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default):exportDocuments`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                outputUriPrefix: outputUriPrefix,
                collectionIds: ['users', 'albums', 'proposals', 'bug_reports', 'artistProfiles']
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GCP Backup API Error:', errorText);
            throw new Error(`Backup API failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Response body contains the Operation details
        const operation = await response.json();

        return json({
            success: true,
            message: 'Backup initiated successfully via GCP API',
            operation: operation.name
        });

    } catch (error: any) {
        console.error('Backup trigger error:', error);
        return json({ error: error.message }, { status: 500 });
    }
};
