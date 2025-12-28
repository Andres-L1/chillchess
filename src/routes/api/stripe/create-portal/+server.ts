import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createPortalSession } from '$lib/stripe/config';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const body = await request.json();
        const { customerId } = body;

        if (!customerId) {
            return json({ error: 'Customer ID required' }, { status: 400 });
        }

        const session = await createPortalSession(
            customerId,
            `${request.headers.get('origin')}/pricing`
        );

        return json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating portal session:', error);
        return json({ error: error.message }, { status: 500 });
    }
};
