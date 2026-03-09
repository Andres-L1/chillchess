<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { page } from '$app/stores';
    import { db } from '$lib/firebase';
    import { doc, onSnapshot } from 'firebase/firestore';
    import tmi from 'tmi.js';
    import { fade, fly } from 'svelte/transition';

    const uid = $page.params.uid;
    let settings = {
        channel: '',
        fontSize: 18,
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
    let client: tmi.Client | null = null;
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
        if (client) {
            try {
                await client.disconnect();
            } catch (e) {
                console.error('Error disconnecting:', e);
            }
        }

        if (!channel) return;

        client = new tmi.Client({
            connection: {
                secure: true,
                reconnect: true,
            },
            channels: [channel],
        });

        client.on(
            'message',
            (chan: string, tags: tmi.ChatUserstate, message: string, self: boolean) => {
                const newMessage: Message = {
                    id: tags.id || Math.random().toString(36).substr(2, 9),
                    username: tags['display-name'] || tags.username || 'Anon',
                    color: tags.color || '#6366f1',
                    text: message,
                    badges: tags.badges,
                    timestamp: Date.now(),
                };

                messages = [...messages, newMessage].slice(-30);
                scrollToBottom();
            }
        );

        try {
            await client.connect();
            console.log('Connected to Twitch channel:', channel);
        } catch (err) {
            console.error('Twitch connection error:', err);
        }
    }

    onMount(() => {
        if (!uid) return;

        const settingsRef = doc(db, 'users', uid, 'streamerSettings', 'chat_overlay');
        const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const oldChannel = settings.channel;
                settings = { ...settings, ...data };

                if (
                    settings.channel &&
                    settings.channel.toLowerCase() !== oldChannel.toLowerCase()
                ) {
                    connectTwitch(settings.channel);
                }
            }
        });

        return () => {
            unsubSettings();
            if (client) client.disconnect();
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
                class="flex flex-col border-[4px] border-black p-4 shadow-neo relative bg-white"
                style="
                    background-color: {settings.bgColor};
                    border-color: {settings.borderColor};
                    box-shadow: 6px 6px 0px 0px {settings.shadowColor};
                "
            >
                <div class="flex items-center gap-2 mb-2">
                    <span
                        class="px-2 py-0.5 border-2 border-black font-black uppercase text-[10px] shadow-neo-sm"
                        style="background-color: {msg.color}; color: white; border-color: {settings.borderColor};"
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
                    class="font-black leading-tight break-words"
                    style="font-size: {settings.fontSize}px; color: {settings.fontColor};"
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
