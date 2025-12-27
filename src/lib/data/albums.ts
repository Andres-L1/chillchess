export interface Track {
    title: string;
    artist?: string;
    file: string; // ruta relativa desde static (ej: /audio/album1/cancion.mp3)
    duration?: string;
}

export interface Album {
    id: string;
    title: string;
    artist: string;
    cover: string;
    tracks: Track[];
    vibeId?: string; // Si está asociado a un vibe (ej: noir)
    price?: string;
    tag?: string;
    description?: string;
}

export const ALBUMS: Album[] = [
    {
        id: "asap-is-forever",
        title: "ASAP is forever",
        artist: "ASAP Rocky Tribute",
        cover: "/assets/images/covers/asap.jpg", // ✅ PORTADA ACTUALIZADA
        tag: "Exclusivo",
        price: "Gratis",
        description: "Tributo chillhop a la leyenda. Álbum completo.",
        tracks: [
            { title: "Above It All", file: "/audio/ASAP is forever/Above It All.wav" },
            { title: "A$AP Run The Block", file: "/audio/ASAP is forever/AAP Run The Block.wav" },
            { title: "City On Lock", file: "/audio/ASAP is forever/City On Lock.wav" },
            { title: "Family First", file: "/audio/ASAP is forever/Family First.wav" },
            { title: "Feel like GOD", file: "/audio/ASAP is forever/Feel like GOD.wav" },
            { title: "Low Life", file: "/audio/ASAP is forever/Low Life.wav" },
            { title: "Never Stop Ballin'", file: "/audio/ASAP is forever/Never Stop Ballin'.wav" },
            { title: "No Lie", file: "/audio/ASAP is forever/No Lie.wav" },
            { title: "Run It", file: "/audio/ASAP is forever/Run It.wav" },
            { title: "Runnin' Thru' LS", file: "/audio/ASAP is forever/Runnin' Thru' LS.wav" },
            { title: "Sacred (Remastered)", file: "/audio/ASAP is forever/Sacred (Remastered).wav" },
            { title: "Watch Us Grow", file: "/audio/ASAP is forever/Watch Us Grow.wav" },
            { title: "We Are One", file: "/audio/ASAP is forever/We Are One.wav" },
            { title: "We Gon' Take It All", file: "/audio/ASAP is forever/We Gon' Take It All.wav" }
        ]
    },
    {
        id: "noir-city",
        title: "Ciudad Noir",
        artist: "ChillChess Originals",
        cover: "/assets/images/covers/noir.png",
        tag: "Clásico",
        price: "Pro",
        description: "Lluvia y neón para concentración máxima.",
        vibeId: "noir",
        tracks: [
            {
                title: "Night Rain Jazz",
                file: "/assets/audio/music/jazz.mp3",
            }
        ]
    }
];

export function getAlbumById(id: string): Album | undefined {
    return ALBUMS.find(a => a.id === id);
}
