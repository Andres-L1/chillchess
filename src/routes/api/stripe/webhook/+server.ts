import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe, STRIPE_WEBHOOK_SECRET } from '$lib/stripe/config';
import { db } from '$lib/firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type Stripe from 'stripe';

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Stripe webhook received:', event.type);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdate(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentSucceeded(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(invoice);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return json({ received: true });
    } catch (error: any) {
        console.error('Error processing webhook:', error);
        return json({ error: error.message }, { status: 500 });
    }
};

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.client_reference_id || session.metadata?.userId;
    if (!userId) {
        console.error('No userId in checkout session');
        return;
    }

    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    // Update user document with Stripe customer ID
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: serverTimestamp(),
    });

    console.log(`Checkout completed for user ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) {
        console.error('No userId in subscription metadata');
        return;
    }

    const status = subscription.status;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

    // Determine tier from price
    const priceId = subscription.items.data[0]?.price.id;
    let tier: 'free' | 'pro' | 'premium' = 'free';

    // You'll need to map price IDs to tiers
    // This is a simplified version - adjust based on your actual price IDs
    if (priceId?.includes('pro')) {
        tier = 'pro';
    } else if (priceId?.includes('premium')) {
        tier = 'premium';
    }

    const isActive = status === 'active' || status === 'trialing';

    // Update subscription document
    const subscriptionRef = doc(db, 'subscriptions', userId);
    await setDoc(
        subscriptionRef,
        {
            tier: isActive ? tier : 'free',
            status,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );

    console.log(`Subscription updated for user ${userId}: ${tier} (${status})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) {
        console.error('No userId in subscription metadata');
        return;
    }

    // Downgrade to free tier
    const subscriptionRef = doc(db, 'subscriptions', userId);
    await updateDoc(subscriptionRef, {
        tier: 'free',
        status: 'canceled',
        canceledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    console.log(`Subscription deleted for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    // Optionally log successful payment
    console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    // Optionally handle failed payment (send email, etc)
    console.log(`Payment failed for subscription ${subscriptionId}`);
}
