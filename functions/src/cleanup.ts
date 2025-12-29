import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * LIMPIEZA DE ARCHIVOS HUÉRFANOS (Storage)
 * Ejecución semanal: Domingos 04:00 AM
 * 
 * Esta función escanea el bucket de Storage buscando archivos en 'submissions/'
 * que no estén referenciados en la base de datos 'musicSubmissions'.
 * 
 * PRECAUCIÓN: Esta operación puede ser costosa en lecturas si hay muchos documentos.
 * Actualmente configurada en modo DRY RUN (Solo Log) para seguridad.
 * Cambiar DRY_RUN = false para activar el borrado real.
 */
export const cleanupOrphanedSubmissions = functions.pubsub
    .schedule('every sunday 04:00')
    .timeZone('Europe/Madrid')
    .onRun(async (context) => {
        const DRY_RUN = true; // <--- CAMBIAR A FALSE PARA ACTIVAR BORRADO

        const bucket = admin.storage().bucket();
        const db = admin.firestore();

        functions.logger.info('Iniciando limpieza de submissions huérfanas...');

        try {
            // 1. Recopilar todas las URLs válidas (conocidas) de Firestore
            const snapshot = await db.collection('musicSubmissions').select('coverUrl', 'tracks').get();

            const validFileNames = new Set<string>();

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.coverUrl) extractPathFromUrl(data.coverUrl, validFileNames);

                if (data.tracks && Array.isArray(data.tracks)) {
                    data.tracks.forEach((t: any) => {
                        if (t.url) extractPathFromUrl(t.url, validFileNames);
                    });
                }
            });

            functions.logger.info(`Encontrados ${validFileNames.size} archivos referenciados en DB.`);

            // 2. Listar archivos reales en el bucket
            const [files] = await bucket.getFiles({ prefix: 'submissions/' });

            let orphanCount = 0;
            const expiryDate = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 días de gracia

            for (const file of files) {
                // Chequeo de seguridad: No borrar archivos recientes (< 7 días)
                const meta = file.metadata;
                const createdTime = new Date(meta.timeCreated || '').getTime();

                if (createdTime > expiryDate) continue;

                // Verificar si este archivo está en nuestro Set de validos
                if (!validFileNames.has(file.name)) {
                    orphanCount++;
                    if (!DRY_RUN) {
                        // await file.delete(); // DESCOMENTAR PARA BORRAR
                        functions.logger.info(`[DELETE] Borrado archivo huérfano: ${file.name}`);
                    } else {
                        functions.logger.info(`[DRY RUN] Se borraría: ${file.name}`);
                    }
                }
            }

            functions.logger.info(`Análisis completado. Huérfanos detectados: ${orphanCount} (Dry Run: ${DRY_RUN})`);

        } catch (error) {
            functions.logger.error('Error en cleanupOrphanedSubmissions:', error);
        }

        return null;
    });

/**
 * Utilería para extraer path aproximado de una URL de Firebase Storage
 */
function extractPathFromUrl(url: string, set: Set<string>) {
    try {
        if (url.includes('/o/')) {
            const parts = url.split('/o/');
            if (parts.length > 1) {
                const pathAndParams = parts[1].split('?')[0];
                const decodedPath = decodeURIComponent(pathAndParams);
                set.add(decodedPath);
            }
        }
    } catch (e) {
        console.warn('Error parseando URL:', url);
    }
}
