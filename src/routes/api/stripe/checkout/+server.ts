import { json } from '@sveltejs/kit';
import { createCheckoutSession } from '$lib/stripe/config';
// @ts-ignore
import { env } from '$env/dynamic/private';
// @ts-ignore
import { env as publicEnv } from '$env/dynamic/public';

export async function POST({ request, url }) {
    try {
        const { uid, email } = await request.json();

        if (!uid) {
            return json({ error: 'Falta el ID del usuario.' }, { status: 400 });
        }

        // Se usa una variable de entorno para el precio, si no hay, fallará el session create
        const priceId = env.STRIPE_PRICE_ID || publicEnv.PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ID || process.env.PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID;

        if (!priceId) {
            console.warn("Falta configurar STRIPE_PRICE_ID o PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID");
        }

        const session = await createCheckoutSession({
            priceId: priceId || 'price_mock_123',
            userId: uid,
            userEmail: email || undefined, // Omitting if no email
            successUrl: `${url.origin}/freelance?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${url.origin}/landing`,
        });

        return json({ url: session.url });
    } catch (error: any) {
        console.error('Error al iniciar checkout:', error);
        return json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
