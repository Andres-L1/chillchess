export interface Track {
    id?: string; // Optional for now
    title: string;
    artist: string;
    file: string;
    duration?: number;
}

export type AlbumCategory = 'musica' | 'juegos' | 'ambiente';

export interface Album {
    id: string;
    title: string;
    artist: string;
    cover: string;
    tracks?: Track[]; // Lista de canciones del álbum
    isVerified?: boolean; // Si el artista del álbum está verificado
    vibeId?: string;
    price: string;
    tag: string;
    description: string;
    isPremium?: boolean; // Requires Pro subscription
    category: AlbumCategory; // New field for categorization
}

export const ALBUMS: Album[] = [
    {
        id: 'asap-forever',
        title: 'ASAP is forever',
        artist: 'JULYACTV',
        cover: '/assets/images/covers/asap.jpg',
        price: 'Gratis',
        tag: 'Nuevo',
        description: 'Tributo a ASAP en FamilyRP',
        vibeId: 'asap-forever',
        isPremium: false, // Available for everyone
        category: 'juegos', // Gaming category

        tracks: [
            { id: 'asap-1', title: 'Above It All', artist: 'JULYACTV', file: '/audio/asap/Above It All.wav' },
            { id: 'asap-2', title: 'Run The Block', artist: 'JULYACTV', file: '/audio/asap/ASAP Run The Block.wav' },
            { id: 'asap-3', title: 'City On Lock', artist: 'JULYACTV', file: '/audio/asap/City On Lock.wav' },
            { id: 'asap-4', title: 'Family First', artist: 'JULYACTV', file: '/audio/asap/Family First.wav' },
            { id: 'asap-5', title: 'Feel Like GOD', artist: 'JULYACTV', file: '/audio/asap/Feel like GOD.wav' },
            { id: 'asap-6', title: 'Low Life', artist: 'JULYACTV', file: '/audio/asap/Low Life.wav' },
            { id: 'asap-7', title: "Never Stop Ballin'", artist: 'JULYACTV', file: "/audio/asap/Never Stop Ballin'.wav" },
            { id: 'asap-8', title: 'No Lie', artist: 'JULYACTV', file: '/audio/asap/No Lie.wav' },
            { id: 'asap-9', title: 'Run It', artist: 'JULYACTV', file: '/audio/asap/Run It.wav' },
            { id: 'asap-10', title: "Runnin' Thru' LS", artist: 'JULYACTV', file: "/audio/asap/Runnin' Thru' LS.wav" },
            { id: 'asap-11', title: 'Sacred (Remastered)', artist: 'JULYACTV', file: '/audio/asap/Sacred (Remastered).wav' },
            { id: 'asap-12', title: 'Watch Us Grow', artist: 'JULYACTV', file: '/audio/asap/Watch Us Grow.wav' },
            { id: 'asap-13', title: 'We Are One', artist: 'JULYACTV', file: '/audio/asap/We Are One.wav' },
            { id: 'asap-14', title: "We Gon' Take It All", artist: 'JULYACTV', file: "/audio/asap/We Gon' Take It All.wav" },
        ]
    }
];

export function getAlbumById(id: string): Album | undefined {
    return ALBUMS.find(album => album.id === id);
}

export function getAlbumsByCategory(category: AlbumCategory): Album[] {
    return ALBUMS.filter(album => album.category === category);
}

export const CATEGORY_LABELS = [
    { id: 'musica' as AlbumCategory, label: 'Música' },
    { id: 'juegos' as AlbumCategory, label: 'Gaming & Focus' },
    { id: 'ambiente' as AlbumCategory, label: 'Ambiente' }
];
