import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createCheckoutSession, STRIPE_PRICE_IDS } from '$lib/stripe/config';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // Get authenticated user (you may need to adjust based on your auth setup)
        const body = await request.json();
        const { plan, interval, userId, userEmail } = body;

        if (!userId || !userEmail) {
            return json({ error: 'User not authenticated' }, { status: 401 });
        }

        // Determine price ID based on plan and interval
        let priceId: string;
        if (plan === 'pro' && interval === 'monthly') {
            priceId = STRIPE_PRICE_IDS.pro_monthly;
        } else if (plan === 'pro' && interval === 'yearly') {
            priceId = STRIPE_PRICE_IDS.pro_yearly;
        } else {
            return json({ error: 'Invalid plan or interval' }, { status: 400 });
        }

        if (!priceId) {
            return json(
                { error: 'Price ID not configured for this plan' },
                { status: 500 }
            );
        }

        // Create checkout session
        const session = await createCheckoutSession({
            priceId,
            userId,
            userEmail,
            successUrl: `${request.headers.get('origin')}/pricing?success=true`,
            cancelUrl: `${request.headers.get('origin')}/pricing?canceled=true`,
        });

        return json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        return json({ error: error.message }, { status: 500 });
    }
};
