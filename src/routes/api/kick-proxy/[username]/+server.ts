import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const { username } = params;

    if (!username) {
        return json({ error: 'Username is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://kick.com/api/v2/channels/${username}`);
        
        if (!response.ok) {
            return json({ error: `Kick API error: ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        const chatroomId = data.chatroom?.id;

        if (!chatroomId) {
            return json({ error: 'Chatroom ID not found' }, { status: 404 });
        }

        return json({ chatroomId });
    } catch (err) {
        console.error('Kick proxy error:', err);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
