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
    canCustomizeBoard: boolean;
}

export const TIERS: Record<SubscriptionTier, TierConfig> = {
    free: {
        id: 'free',
        name: 'Free',
        price: 'Gratis',
        priceValue: 0,
        billing: 'Para siempre',
        features: [
            '🎵 Acceso a selección rotativa',
            '🌅 Fondo Estándar',
            '👤 Perfil Básico',
        ],
        maxGamesDaily: 3,
        canAccessPremiumVibes: false,
        canCustomizeBoard: false,
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: '€19.99',
        priceValue: 19.99,
        billing: 'año',
        features: [
            '✨ Catálogo Musical Completo',
            '🎨 Fondos y Ambientes Exclusivos',
            '⛔ Experiencia Sin Interrupciones',
            '👀 Modo Inmersivo (Ocultar UI)',
            '🗳️ Votar en el Roadmap',
            '⭐ Insignia de Fundador',
        ],
        maxGamesDaily: Infinity,
        canAccessPremiumVibes: true,
        canCustomizeBoard: true,
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        price: '€19.99',
        priceValue: 19.99,
        billing: 'año',
        features: [
            '✨ Todo lo de PRO',
            '🎁 Badge de Fundador',
            '🎨 Personalización Total',
        ],
        maxGamesDaily: Infinity,
        canAccessPremiumVibes: true,
        canCustomizeBoard: true,
    },
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
