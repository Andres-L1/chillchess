<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { db } from '$lib/firebase';
    import { 
        Instagram, 
        Twitter, 
        Youtube, 
        Twitch, 
        MessageSquare, 
        Share2 
    } from 'lucide-svelte';
    import { fade, fly } from 'svelte/transition';

    const { uid } = $page.params;

    interface SocialItem {
        platform: string;
        handle: string;
    }

    interface SocialSettings {
        items: SocialItem[];
        interval: number;
        bgColor: string;
        borderColor: string;
        fontColor: string;
        accentColor: string;
    }

    let settings: SocialSettings = {
        items: [],
        interval: 10,
        bgColor: '#ffffff',
        borderColor: '#000000',
        fontColor: '#000000',
        accentColor: '#FFDD00'
    };

    let currentIndex = 0;
    let loading = true;

    const platforms = {
        instagram: { icon: Instagram, color: '#E1306C', label: 'Instagram' },
        twitter: { icon: Twitter, color: '#1DA1F2', label: 'Twitter' },
        youtube: { icon: Youtube, color: '#FF0000', label: 'YouTube' },
        twitch: { icon: Twitch, color: '#9146FF', label: 'Twitch' },
        tiktok: { icon: Share2, color: '#000000', label: 'TikTok' },
        discord: { icon: MessageSquare, color: '#5865F2', label: 'Discord' }
    };

    onMount(() => {
        if (!uid) return;

        const settingsRef = doc(db, 'users', uid, 'streamerSettings', 'social_showcase');
        const unsub = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as Partial<SocialSettings>;
                settings = {
                    items: data.items || [],
                    interval: data.interval ?? 10,
                    bgColor: data.bgColor || '#ffffff',
                    borderColor: data.borderColor || '#000000',
                    fontColor: data.fontColor || '#000000',
                    accentColor: data.accentColor || '#FFDD00'
                };
                if (settings.items.length > 0 && currentIndex >= settings.items.length) {
                    currentIndex = 0;
                }
            }
            loading = false;
        });

        const timer = setInterval(() => {
            if (settings.items.length > 1) {
                currentIndex = (currentIndex + 1) % settings.items.length;
            }
        }, settings.interval * 1000);

        return () => {
            unsub();
            clearInterval(timer);
        };
    });

    $: currentItem = settings.items[currentIndex] as SocialItem | undefined;
    $: platformInfo = currentItem ? platforms[currentItem.platform as keyof typeof platforms] : null;
</script>

<svelte:head>
    <title>Social Showcase | ChillChess</title>
</svelte:head>

{#if !loading && settings.items.length > 0}
    <div 
        class="w-full h-full flex items-center justify-center p-4 overflow-hidden"
        style="background: transparent;"
    >
        {#key currentIndex}
            <div 
                in:fly={{ y: 20, duration: 400 }}
                out:fade={{ duration: 200 }}
                class="flex items-center gap-6 p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative min-w-[300px]"
                style="background-color: {settings.bgColor}; border-color: {settings.borderColor}; color: {settings.fontColor};"
            >
                <!-- Platform Icon Box -->
                <div 
                    class="w-16 h-16 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                    style="background-color: {settings.accentColor};"
                >
                    {#if platformInfo}
                        <svelte:component this={platformInfo.icon} size={32} strokeWidth={3} />
                    {:else}
                        <Share2 size={32} strokeWidth={3} />
                    {/if}
                </div>

                <!-- Text Content -->
                <div class="flex flex-col">
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                        {platformInfo?.label || 'SOCIAL'}
                    </span>
                    <span class="text-3xl font-black uppercase tracking-tighter leading-none truncate max-w-[250px]">
                        {currentItem?.handle || ''}
                    </span>
                </div>

                <!-- Decorative Element -->
                <div 
                    class="absolute -top-2 -right-2 w-4 h-4 border-2 border-black"
                    style="background-color: {settings.accentColor};"
                ></div>
            </div>
        {/key}
    </div>
{:else if !loading && settings.items.length === 0}
    <div class="w-full h-full flex items-center justify-center font-black text-xs uppercase opacity-20">
        No hay redes configuradas
    </div>
{/if}

<style>
    :global(body) {
        background: transparent !important;
        margin: 0;
        padding: 0;
        overflow: hidden;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
