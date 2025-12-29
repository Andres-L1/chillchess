import type { PageLoad } from './$types';
import { db } from '$lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { ArtistProfile } from '$lib/types/artist';

export const load: PageLoad = async () => {
    try {
        // Query verified artists from Firebase
        const artistsRef = collection(db, 'artists');
        const q = query(artistsRef, where('isVerified', '==', true));
        const querySnapshot = await getDocs(q);

        const verifiedArtists: ArtistProfile[] = [];
        querySnapshot.forEach((doc) => {
            verifiedArtists.push({ ...doc.data() } as ArtistProfile);
        });

        return {
            verifiedArtists
        };
    } catch (error) {
        console.error('Error loading verified artists:', error);
        return {
            verifiedArtists: []
        };
    }
};
