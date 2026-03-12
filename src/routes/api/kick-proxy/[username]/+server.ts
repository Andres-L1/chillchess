import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const { username } = params;

    if (!username) {
        return json({ error: 'Username is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://kick.com/api/v2/channels/${username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        
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
