// Script para verificar al artista JULYACTV y crear su perfil
// Ejecutar esto UNA VEZ desde la consola del navegador en chillchess.app

// INSTRUCCIONES:
// 1. Abre https://chillchess.app
// 2. Abre la consola del navegador (F12)
// 3. Copia y pega todo este código
// 4. Presiona Enter

(async function verifyArtistJULYACTV() {
    console.log('🎨 Verificando artista JULYACTV...');

    const userId = 'rOLscSZKfLcBm3f4YNR2oCd88em1';
    const artistName = 'JULYACTV';

    try {
        // Importar Firebase desde el bundle de la app
        const { db } = await import('/src/lib/firebase');
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

        // Crear perfil de artista
        const artistProfile = {
            userId: userId,
            artistName: artistName,
            bio: 'Productor de música Lo-Fi y Chillhop. Creador del álbum ASAP is forever.',
            avatarUrl: '',
            bannerUrl: '',

            // Social Links (actualizar con los reales si los tiene)
            socialLinks: [],

            // Stats
            totalPlays: 0,
            followerCount: 0,

            // Verificación
            isVerified: true, // ← ARTISTA VERIFICADO
            verifiedAt: Date.now(),

            // Timestamps
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // Guardar en Firestore
        const artistRef = doc(db, 'artists', userId);
        await setDoc(artistRef, artistProfile, { merge: true });

        console.log('✅ Perfil de artista creado exitosamente!');
        console.log('📊 Datos:', artistProfile);
        console.log('');
        console.log('🎉 JULYACTV es ahora un artista verificado!');
        console.log('El álbum ASAP is forever ahora le pertenece.');

    } catch (error) {
        console.error('❌ Error al verificar artista:', error);
    }
})();
