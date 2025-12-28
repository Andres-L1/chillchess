import type { SubscriptionTier } from '$lib/types/subscription';

export interface TierConfig {
    id: SubscriptionTier;
    name: string;
    price: string;
    priceValue: number;
    billing: string;
    features: string[];
    maxGamesDaily: number;
    canAccessPremiumVibes: boolean;
}

export const TIERS: Record<SubscriptionTier, TierConfig> = {
    free: {
        id: 'free',
        name: 'Free',
        price: 'Gratis',
        priceValue: 0,
        billing: 'Para siempre',
        features: [
            '2 álbumes básicos',
            'Audio estándar (128kbps)',
            'Tablero clásico',
            'Acceso al ambiente básico'
        ],
        maxGamesDaily: 0,
        canAccessPremiumVibes: false
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: '€19.99',
        priceValue: 19.99,
        billing: 'anual',
        features: [
            '✨ Todos los álbumes ilimitados',
            '❌ Sin anuncios',
            '🎵 Audio de alta calidad',
            '🎨 Tableros personalizables (próximamente)',
            '🌧️ Fondos animados premium (próximamente)',
            '📥 Descargas offline (próximamente)',
            '🎯 Acceso anticipado (próximamente)',
            '👑 Badge exclusivo (próximamente)',
            '🗳️ Vota en la Roadmap (próximamente)'
        ],
        maxGamesDaily: Infinity,
        canAccessPremiumVibes: true
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        price: '€19.99',
        priceValue: 19.99,
        billing: 'anual',
        features: [
            '✨ Todos los álbumes ilimitados',
            '🎵 Audio HD (320kbps)',
            '🎨 Tableros personalizables',
            '🌧️ Fondos animados premium',
            '📥 Descargas offline (próximamente)',
            '🎯 Acceso anticipado a nuevos álbumes',
            '❌ Sin anuncios',
            '👑 Badge exclusivo',
            '🗳️ Vota en la Roadmap'
        ],
        maxGamesDaily: Infinity,
        canAccessPremiumVibes: true
    }
};

// Helper: Check if user can access a specific vibe
export function canAccessVibe(tier: SubscriptionTier, vibeId: string): boolean {
    // Free users can only access basic vibes
    const freeVibes = ['none', 'asap-forever'];

    if (tier === 'free') {
        return freeVibes.includes(vibeId);
    }

    // Pro users can access everything
    return true;
}

// Helper: Check games remaining today
export function checkGamesAccess(tier: SubscriptionTier, gamesPlayedToday: number): {
    canPlay: boolean;
    remaining: number;
} {
    const limit = TIERS[tier].maxGamesDaily;

    if (limit === Infinity) {
        return { canPlay: true, remaining: Infinity };
    }

    const remaining = Math.max(0, limit - gamesPlayedToday);
    return {
        canPlay: remaining > 0,
        remaining
    };
}
