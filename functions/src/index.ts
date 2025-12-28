import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Rate Limiting para Artist Profiles
 * Límite: 5 creaciones/actualizaciones por usuario por día
 */
export const rateLimitArtistProfile = functions.firestore
    .document('artistProfiles/{profileId}')
    .onWrite(async (change, context) => {
        const profileId = context.params.profileId;
        const userId = context.auth?.uid;

        // Skip si es delete o no está autenticado
        if (!change.after.exists || !userId) {
            return null;
        }

        // Verificar rate limit
        const rateLimitRef = admin.firestore()
            .collection('rateLimits')
            .doc(`artistProfile_${userId}`);

        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000);

        try {
            await admin.firestore().runTransaction(async (transaction) => {
                const doc = await transaction.get(rateLimitRef);

                let count = 0;
                let lastReset = now;

                if (doc.exists) {
                    const data = doc.data()!;
                    // Reset contador si pasaron 24 horas
                    if (data.lastReset < oneDayAgo) {
                        count = 1;
                        lastReset = now;
                    } else {
                        count = data.count + 1;
                        lastReset = data.lastReset;

                        // Si excede el límite, cancelar la operación
                        if (count > 5) {
                            throw new functions.https.HttpsError(
                                'resource-exhausted',
                                'Has excedido el límite de 5 actualizaciones de perfil por día. Intenta mañana.'
                            );
                        }
                    }
                } else {
                    count = 1;
                }

                transaction.set(rateLimitRef, {
                    count,
                    lastReset,
                    userId,
                    lastUpdate: now
                });
            });

            functions.logger.info(`Rate limit check passed for user ${userId}, count: ${count}`);
            return null;

        } catch (error) {
            functions.logger.error(`Rate limit error for user ${userId}:`, error);

            // Si se excedió el límite, revertir el cambio
            if (error instanceof functions.https.HttpsError) {
                await change.after.ref.delete();
                throw error;
            }

            return null;
        }
    });

/**
 * Cleanup de rate limits antiguos
 * Corre cada día a medianoche
 */
export const cleanupRateLimits = functions.pubsub
    .schedule('0 0 * * *')
    .timeZone('Europe/Madrid')
    .onRun(async (context) => {
        const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);

        const batch = admin.firestore().batch();
        const oldLimits = await admin.firestore()
            .collection('rateLimits')
            .where('lastUpdate', '<', threeDaysAgo)
            .get();

        oldLimits.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        functions.logger.info(`Cleaned up ${oldLimits.size} old rate limit records`);

        return null;
    });

/**
 * Validación adicional server-side
 * Se ejecuta antes de que Firestore Rules permita la escritura
 */
export const validateArtistProfile = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
    }

    const userId = context.auth.uid;
    const profileData = data.profile;

    // Validaciones
    const errors: string[] = [];

    if (!profileData.artistName || profileData.artistName.length < 2 || profileData.artistName.length > 50) {
        errors.push('Nombre de artista debe tener entre 2 y 50 caracteres');
    }

    if (profileData.bio && profileData.bio.length > 200) {
        errors.push('Bio no puede exceder 200 caracteres');
    }

    if (profileData.socialLinks && profileData.socialLinks.length > 10) {
        errors.push('Máximo 10 enlaces de redes sociales');
    }

    // Validar URLs
    if (profileData.avatarUrl && !isValidUrl(profileData.avatarUrl)) {
        errors.push('Avatar URL inválida');
    }

    if (profileData.bannerUrl && !isValidUrl(profileData.bannerUrl)) {
        errors.push('Banner URL inválida');
    }

    if (errors.length > 0) {
        throw new functions.https.HttpsError('invalid-argument', errors.join(', '));
    }

    return { valid: true, message: 'Perfil válido' };
});

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
