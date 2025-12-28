export type SubscriptionTier = 'free' | 'pro' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;

    // Subscription Info
    subscriptionTier: SubscriptionTier;
    subscriptionStatus: SubscriptionStatus;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionEndDate?: number; // Timestamp

    // Usage Stats
    gamesPlayedToday: number;
    lastGamePlayed: number; // Timestamp
    lastResetDate: string; // YYYY-MM-DD format

    // Admin Access
    isAdmin?: boolean;

    // Created/Updated
    createdAt: number; // Timestamp
    updatedAt: number; // Timestamp
}

export interface SubscriptionFeatures {
    vibes: string[];
    gamesPerDay: number; // -1 = unlimited
    aiAnalysis: boolean;
    exclusiveThemes: boolean;
    offlineMode: boolean;
}

export interface SubscriptionTierConfig {
    name: string;
    price: number;
    priceId?: string; // Stripe Price ID
    features: SubscriptionFeatures;
    color: string;
    description: string;
}
