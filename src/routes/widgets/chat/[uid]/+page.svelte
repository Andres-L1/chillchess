<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { page } from '$app/stores';
    import { db } from '$lib/firebase';
    import { doc, onSnapshot } from 'firebase/firestore';
    import tmi from 'tmi.js';
    import Pusher from 'pusher-js';
    import { fade, fly } from 'svelte/transition';

    const uid = $page.params.uid;
    let settings = {
        platform: 'twitch',
        channel: '',
        fontSize: 24,
        textWeight: 400,
        usernameWeight: 600,
        maxWidth: 400,
        hideAfter: 0, // 0 = never hide
        theme: 'light',
        showBadges: true,
        fontColor: '#000000',
        borderColor: '#000000',
        bgColor: '#ffffff',
        shadowColor: '#000000',
    };

    interface Message {
        id: string;
        username: string;
        color: string;
        text: string;
        badges: any;
        timestamp: number;
    }

    let messages: Message[] = [];
    let twitchClient: tmi.Client | null = null;
    let kickPusher: Pusher | null = null;
    let container: HTMLElement;

    async function scrollToBottom() {
        await tick();
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth',
            });
        }
    }

    async function connectTwitch(channel: string) {
        if (twitchClient) {
            try {
                await twitchClient.disconnect();
            } catch (e) {}
        }

        if (!channel) return;

        twitchClient = new tmi.Client({
            connection: { secure: true, reconnect: true },
            channels: [channel],
        });

        twitchClient.on('message', (chan: string, tags: any, message: string, self: boolean) => {
            const newMessage: Message = {
                id: tags.id || Math.random().toString(36).substr(2, 9),
                username: tags['display-name'] || tags.username || 'Anon',
                color: tags.color || '#6366f1',
                text: message,
                badges: tags.badges,
                timestamp: Date.now(),
            };
            addMessage(newMessage);
        });

        try {
            await twitchClient.connect();
        } catch (err) {
            console.error('Twitch error:', err);
        }
    }

    async function connectKick(username: string) {
        if (kickPusher) {
            kickPusher.disconnect();
            kickPusher = null;
        }

        if (!username) return;

        try {
            // Use server-side proxy to avoid CORS
            const response = await fetch(`/api/kick-proxy/${username}`);
            if (!response.ok) {
                console.error('Kick proxy error:', await response.text());
                return;
            }
            const data = await response.json();
            const chatroomId = data.chatroomId;

            if (!chatroomId) {
                console.error('No chatroomId found for:', username);
                return;
            }

            kickPusher = new Pusher('32cbd69e4b950bf97679', {
                cluster: 'us2',
            });

            const channel = kickPusher.subscribe(`chatrooms.${chatroomId}.v2`);

            channel.bind('App\\Events\\ChatMessageEvent', (data: any) => {
                const newMessage: Message = {
                    id: data.id,
                    username: data.sender.username,
                    color: data.sender.identity.color || '#00E701',
                    text: data.content,
                    badges: null,
                    timestamp: Date.now(),
                };
                addMessage(newMessage);
            });
        } catch (err) {
            console.error('Kick connection error:', err);
        }
    }

    function addMessage(msg: Message) {
        messages = [...messages, msg].slice(-30);
        scrollToBottom();
    }

    let lastTestTrigger = 0;

    function simulateMessage() {
        const mockNames = ['PixelWarrior', 'NeoBrutalist', 'DesignAddict', 'StreamMaster', 'ChillGamer'];
        const mockMessages = [
            '¡El diseño neo-brutalista mola un montón! 🚀',
            'Streaming con ChillChess es otra liga.',
            '¿Visteis ese jaque mate? Increíble.',
            'Me encanta cómo se ve el chat ahora.',
            'Support from the community is everything! 💎',
        ];
        const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#00E701'];

        const randomMsg: Message = {
            id: 'mock-' + Math.random().toString(36).substr(2, 9),
            username: mockNames[Math.floor(Math.random() * mockNames.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            text: mockMessages[Math.floor(Math.random() * mockMessages.length)],
            badges: null,
            timestamp: Date.now(),
        };
        addMessage(randomMsg);
    }

    onMount(() => {
        // Auto-hide interval
        const hideInterval = setInterval(() => {
            if (settings.hideAfter > 0) {
                const now = Date.now();
                messages = messages.filter(m => (now - m.timestamp) < (settings.hideAfter * 1000));
            }
        }, 1000);

        if (!uid) return () => clearInterval(hideInterval);

        const settingsRef = doc(db, 'users', uid, 'streamerSettings', 'chat_overlay');
        const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const oldChannel = settings.channel;
                const oldPlatform = settings.platform;

                // Handle Test Trigger
                if (data.testTrigger && data.testTrigger > lastTestTrigger) {
                    if (lastTestTrigger !== 0) {
                        simulateMessage();
                    }
                    lastTestTrigger = data.testTrigger;
                }

                settings = { ...settings, ...data };

                if (
                    settings.channel &&
                    (settings.channel.toLowerCase() !== (oldChannel || '').toLowerCase() ||
                        settings.platform !== oldPlatform)
                ) {
                    if (settings.platform === 'kick') {
                        if (twitchClient) {
                            twitchClient.disconnect().catch(() => {});
                            twitchClient = null;
                        }
                        connectKick(settings.channel);
                    } else {
                        if (kickPusher) {
                            kickPusher.disconnect();
                            kickPusher = null;
                        }
                        connectTwitch(settings.channel);
                    }
                }
            }
        });

        return () => {
            clearInterval(hideInterval);
            unsubSettings();
            if (twitchClient) twitchClient.disconnect();
            if (kickPusher) kickPusher.disconnect();
        };
    });
</script>

<div
    class="h-screen w-screen bg-transparent overflow-hidden flex flex-col justify-end p-6 font-poppins"
>
    <div bind:this={container} class="flex flex-col gap-4 overflow-y-auto scrollbar-hide pr-2">
        {#each messages as msg (msg.id)}
            <div
                in:fly={{ x: -20, duration: 400 }}
                out:fade={{ duration: 400 }}
                class="flex flex-col border-[4px] border-black p-4 shadow-neo relative bg-white w-fit transition-all duration-300"
                style="
                    background-color: {settings.bgColor};
                    border-color: {settings.borderColor};
                    box-shadow: 6px 6px 0px 0px {settings.shadowColor};
                    max-width: {settings.maxWidth || 400}px;
                "
            >
                <div class="flex items-center gap-2 mb-2">
                    <span
                        class="px-2 py-0.5 border-2 border-black uppercase text-[10px] shadow-neo-sm"
                        style="
                            background-color: {msg.color}; 
                            color: white; 
                            border-color: {settings.borderColor};
                            font-weight: {settings.usernameWeight || 600};
                        "
                    >
                        {msg.username}
                    </span>

                    <span class="text-[8px] font-black opacity-30 ml-auto">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>

                <p
                    class="leading-tight break-words"
                    style="
                        font-size: {settings.fontSize}px; 
                        color: {settings.fontColor};
                        font-weight: {settings.textWeight || 400};
                    "
                >
                    {msg.text}
                </p>
            </div>
        {/each}

        {#if messages.length === 0}
            <div
                class="bg-primary border-4 border-black p-4 shadow-neo text-center animate-pulse"
                style="border-color: {settings.borderColor}; box-shadow: 6px 6px 0px 0px {settings.shadowColor};"
            >
                <p class="font-black uppercase text-xs">Esperando mensajes...</p>
                {#if !settings.channel}
                    <p class="text-[10px] font-bold mt-1 text-black/60">
                        Configura tu canal en el dashboard
                    </p>
                {:else}
                    <p class="text-[10px] font-bold mt-1 text-black/60">
                        Canal: {settings.channel}
                    </p>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    :global(body) {
        background-color: transparent !important;
        overflow: hidden;
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .shadow-neo {
        box-shadow: 6px 6px 0px 0px #000;
    }

    .shadow-neo-sm {
        box-shadow: 2px 2px 0px 0px #000;
    }
</style>
