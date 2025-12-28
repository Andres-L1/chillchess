// Stripe configuration
import Stripe from 'stripe';

// Server-side Stripe instance (only use on server)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia',
});

// Price IDs from Stripe Dashboard
export const STRIPE_PRICE_IDS = {
    pro_monthly: process.env.PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
    pro_yearly: process.env.PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
    premium_monthly: process.env.PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
    premium_yearly: process.env.PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
} as const;

// Webhook secret for verifying Stripe events
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Helper to create checkout session
export async function createCheckoutSession(params: {
    priceId: string;
    userId: string;
    userEmail: string;
    successUrl: string;
    cancelUrl: string;
}) {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: params.priceId,
                quantity: 1,
            },
        ],
        customer_email: params.userEmail,
        client_reference_id: params.userId,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
            userId: params.userId,
        },
        subscription_data: {
            metadata: {
                userId: params.userId,
            },
        },
    });

    return session;
}

// Helper to create customer portal session
export async function createPortalSession(customerId: string, returnUrl: string) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session;
}
