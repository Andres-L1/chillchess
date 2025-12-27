import type { SubscriptionTierConfig } from '$lib/types/subscription';

export const SUBSCRIPTION_TIERS: Record<'free' | 'pro' | 'premium', SubscriptionTierConfig> = {
    free: {
        name: 'Gratis',
        price: 0,
        features: {
            vibes: ['noir'], // Solo Ciudad Noir
            gamesPerDay: 5,
            aiAnalysis: false,
            exclusiveThemes: false,
            offlineMode: false,
        },
        color: 'slate',
        description: 'Para probar ChillChess'
    },
    pro: {
        name: 'Pro',
        price: 4.99,
        priceId: '', // TODO: Añadir Stripe Price ID cuando se cree
        features: {
            vibes: ['noir', 'library', 'zen'], // Todos los actuales
            gamesPerDay: -1, // Ilimitado
            aiAnalysis: false,
            exclusiveThemes: false,
            offlineMode: true,
        },
        color: 'orange',
        description: 'Todos los ambientes, partidas infinitas'
    },
    premium: {
        name: 'Premium',
        price: 9.99,
        priceId: '', // TODO: Añadir Stripe Price ID cuando se cree
        features: {
            vibes: ['noir', 'library', 'zen', 'lofi-cafe'], // Incluye futuros
            gamesPerDay: -1,
            aiAnalysis: true, // Análisis con Stockfish
            exclusiveThemes: true, // Temas de tablero premium
            offlineMode: true,
        },
        color: 'purple',
        description: 'Todo incluido + análisis IA'
    }
} as const;

// Helper para verificar acceso a un vibe
export function canAccessVibe(tier: 'free' | 'pro' | 'premium', vibeId: string): boolean {
    return SUBSCRIPTION_TIERS[tier].features.vibes.includes(vibeId);
}

// Helper para verificar si puede jugar
export function canPlayGame(tier: 'free' | 'pro' | 'premium', gamesPlayedToday: number): boolean {
    const limit = SUBSCRIPTION_TIERS[tier].features.gamesPerDay;
    return limit === -1 || gamesPlayedToday < limit;
}
