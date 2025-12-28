export interface SocialLink {
    platform: 'spotify' | 'soundcloud' | 'youtube' | 'instagram' | 'twitter' | 'tiktok' | 'website';
    url: string;
    label?: string;
}

export interface ArtistProfile {
    userId: string;
    artistName: string;
    bio: string;
    avatarUrl?: string;
    bannerUrl?: string;

    // Customization (PRO only)
    themeColor?: string;
    accentColor?: string;
    bannerStyle?: 'gradient' | 'image' | 'solid';
    cardLayout?: 'default' | 'modern' | 'minimal';

    // Social Links
    socialLinks: SocialLink[];

    // Stats
    totalPlays?: number;
    followerCount?: number;

    // Timestamps
    createdAt: number;
    updatedAt: number;
}

export const SOCIAL_PLATFORMS = [
    { id: 'spotify', label: 'Spotify', icon: '🎵', color: '#1DB954' },
    { id: 'soundcloud', label: 'SoundCloud', icon: '☁️', color: '#FF5500' },
    { id: 'youtube', label: 'YouTube', icon: '📺', color: '#FF0000' },
    { id: 'instagram', label: 'Instagram', icon: '📷', color: '#E4405F' },
    { id: 'twitter', label: 'Twitter/X', icon: '𝕏', color: '#1DA1F2' },
    { id: 'tiktok', label: 'TikTok', icon: '🎬', color: '#000000' },
    { id: 'website', label: 'Website', icon: '🌐', color: '#6366F1' },
] as const;

export const DEFAULT_THEME_COLORS = [
    { name: 'Purple Haze', primary: '#9333EA', accent: '#A855F7' },
    { name: 'Ocean Blue', primary: '#0EA5E9', accent: '#38BDF8' },
    { name: 'Sunset Orange', primary: '#F97316', accent: '#FB923C' },
    { name: 'Forest Green', primary: '#10B981', accent: '#34D399' },
    { name: 'Rose Pink', primary: '#EC4899', accent: '#F472B6' },
    { name: 'Gold', primary: '#EAB308', accent: '#FACC15' },
];
