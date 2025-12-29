import { db } from '$lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { ArtistProfile } from '$lib/types/artist';

export async function load() {
    try {
        // Query verified artists from Firebase
        const artistsRef = collection(db, 'artists');
        const q = query(artistsRef, where('isVerified', '==', true));
        const querySnapshot = await getDocs(q);

        const verifiedArtists: ArtistProfile[] = [];
        querySnapshot.forEach((doc) => {
            verifiedArtists.push({ ...doc.data() } as ArtistProfile);
        });

        // Inject Manual Artists (JULYACTV)
        const manualArtists: ArtistProfile[] = [
            {
                userId: 'julyactv-official',
                artistName: 'JULYACTV',
                bio: 'Visionario del sonido urbano y creador de atmósferas inmersivas. La voz de una generación en ChillChess.',
                avatarUrl: '/assets/images/covers/asap.jpg', // Using album cover as fallback avatar
                isVerified: true,
                followerCount: 12500,
                socialLinks: [
                    { platform: 'twitter', url: 'https://twitter.com/julyactv' },
                    { platform: 'instagram', url: 'https://instagram.com/julyactv' }
                ],
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ];

        // Merge Firebase results with manual artists, avoiding duplicates if possible
        const combinedArtists = [...manualArtists, ...verifiedArtists.filter(a => a.artistName !== 'JULYACTV')];

        return {
            verifiedArtists: combinedArtists
        };
    } catch (error) {
        console.error('Error loading verified artists:', error);
        return {
            verifiedArtists: []
        };
    }
}
