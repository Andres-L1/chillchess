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
            const resultCount = await admin.firestore().runTransaction(async (transaction: admin.firestore.Transaction) => {
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

                return count;
            });

            functions.logger.info(`Rate limit check passed for user ${userId}, count: ${resultCount}`);
            return null;

        } catch (error) {
            functions.logger.error(`Rate limit error for user ${userId}:`, error);

            // Si se excedió el límite, revertir el cambio
            if (error instanceof functions.https.HttpsError) {
                // Borrar el documento creado si excedió el límite y era una creación nueva,
                // o revertir si era update (esto es más complejo, por ahora delete es drástico pero efectivo para spam)
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
    .onRun(async (_context) => {
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
export const validateArtistProfile = functions.https.onCall(async (data: any, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
    }

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

/**
 * Generar Audio con IA (Hugging Face Inference API)
 * Modelo: facebook/musicgen-small
 */
export const generateAudio = functions.runWith({ timeoutSeconds: 300 }).https.onCall(async (data: any, context) => {
    // 1. Verificar Auth
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar logueado.');
    }

    const { prompt, duration } = data;

    // Validar input
    if (!prompt) throw new functions.https.HttpsError('invalid-argument', 'El prompt es requerido');

    // IMPORTANTE: Configurar tu token de Hugging Face aquí o en variables de entorno:
    // firebase functions:config:set hf.key="TU_TOKEN"
    // const HF_TOKEN = functions.config().hf?.key; 

    // Para desarrollo rápido, usaremos fetch dinámico
    const fetch = (await import('node-fetch')).default;

    // Usar variable de entorno (Local) o Firebase Config (Producción)
    const HF_TOKEN = process.env.HF_API_TOKEN || functions.config().hf?.token;

    if (!HF_TOKEN) {
        throw new functions.https.HttpsError('failed-precondition', 'El token de Hugging Face no está configurado (HF_API_TOKEN).');
    }

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/musicgen-small",
            {
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        duration: parseInt(duration) || 10 // Duración en segundos (limitado en free tier)
                    }
                }),
            }
        );

        if (!response.ok) {
            const err = await response.text();
            console.error("HF Error:", err);
            throw new Error(`Error de Hugging Face: ${response.statusText}`);
        }

        const result = await response.blob();
        const buffer = await result.arrayBuffer();

        // Convertir a Base64 para devolver al cliente (simple approach)
        // En producción idealmente se subiría a Storage y devolvería URL
        const base64Audio = Buffer.from(buffer).toString('base64');

        return {
            success: true,
            audioBase64: base64Audio,
            format: 'audio/flac' // MusicGen suele devolver FLAC o WAV
        };

    } catch (error: any) {
        console.error("AI Gen Error:", error);
        throw new functions.https.HttpsError('internal', error.message || 'Error generando audio');
    }
});
