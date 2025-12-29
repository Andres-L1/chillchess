import { db } from '$lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { ArtistProfile } from '$lib/types/artist';
import { error } from '@sveltejs/kit';

export async function load({ params }: { params: { id: string } }) {
    try {
        const artistRef = doc(db, 'artists', params.id);
        const artistSnap = await getDoc(artistRef);

        if (!artistSnap.exists()) {
            throw error(404, 'Artista no encontrado');
        }

        const artistProfile = artistSnap.data() as ArtistProfile;

        return {
            artistProfile
        };
    } catch (err) {
        console.error('Error loading artist profile:', err);
        throw error(404, 'Artista no encontrado');
    }
}
