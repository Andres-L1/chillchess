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
    tracks: Track[];
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
        description: 'Tributo chillhop a la leyenda del gaming. Álbum completo por JULYACTV.',
        vibeId: 'asap-forever',
        isPremium: false, // Available for everyone
        category: 'juegos', // Gaming category
        tracks: [
            { id: 'asap-1', title: 'Above It All', artist: 'ASAP Rocky', file: '/audio/asap/Above It All.wav' },
            { id: 'asap-2', title: 'ASAP Run The Block', artist: 'ASAP Rocky', file: '/audio/asap/ASAP Run The Block.wav' },
            { id: 'asap-3', title: 'City On Lock', artist: 'ASAP Rocky', file: '/audio/asap/City On Lock.wav' },
            { id: 'asap-4', title: 'Family First', artist: 'ASAP Rocky', file: '/audio/asap/Family First.wav' },
            { id: 'asap-5', title: 'Feel like GOD', artist: 'ASAP Rocky', file: '/audio/asap/Feel like GOD.wav' },
            { id: 'asap-6', title: 'Low Life', artist: 'ASAP Rocky', file: '/audio/asap/Low Life.wav' },
            { id: 'asap-7', title: "Never Stop Ballin'", artist: 'ASAP Rocky', file: "/audio/asap/Never Stop Ballin'.wav" },
            { id: 'asap-8', title: 'No Lie', artist: 'ASAP Rocky', file: '/audio/asap/No Lie.wav' },
            { id: 'asap-9', title: 'Run It', artist: 'ASAP Rocky', file: '/audio/asap/Run It.wav' },
            { id: 'asap-10', title: "Runnin' Thru' LS", artist: 'ASAP Rocky', file: "/audio/asap/Runnin' Thru' LS.wav" },
            { id: 'asap-11', title: 'Sacred (Remastered)', artist: 'ASAP Rocky', file: '/audio/asap/Sacred (Remastered).wav' },
            { id: 'asap-12', title: 'Watch Us Grow', artist: 'ASAP Rocky', file: '/audio/asap/Watch Us Grow.wav' },
            { id: 'asap-13', title: 'We Are One', artist: 'ASAP Rocky', file: '/audio/asap/We Are One.wav' },
            { id: 'asap-14', title: "We Gon' Take It All", artist: 'ASAP Rocky', file: "/audio/asap/We Gon' Take It All.wav" },
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
