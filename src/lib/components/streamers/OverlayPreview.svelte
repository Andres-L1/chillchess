<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import {
        Instagram,
        Twitter,
        Twitch,
        Youtube,
        MessageSquare, // Use for Discord
        Video, // Use for TikTok since we don't have dedicated icon in lucide
        Globe,
        MonitorPlay
    } from 'lucide-svelte';

    export let settings = {
        streamer: {
            channel: '',
            category: '',
            mainText: '',
            subText: '',
            topBadge: '',
            extraTag: ''
        },
        logo: {
            url: '',
            animation: 'none', // none, pulse, vibrate, float
            glow: false
        },
        countdown: {
            active: true,
            targetTime: Date.now() + 600000, // 10 minutes from now
            textAbove: '',
            textZero: ''
        },
        platforms: {
            twitch: { active: false, user: '' },
            kick: { active: false, user: '' },
            youtube: { active: false, user: '' },
            discord: { active: false, user: '' },
            tiktok: { active: false, user: '' },
            instagram: { active: false, user: '' }
        },
        effects: {
            particles: 25,
            type: 'circles', // circles, lines, none
            vignette: true,
            glow: true
        },
        theme: 'neo-brutal', // neo-brutal, cyber, arcade, matrix
        platformInterval: 5
    };

    // Countdown Logic
    let timeLeft = '00:00';
    let timeInterval: any;

    function updateTimer() {
        if (!settings.countdown.active) return;
        const now = Date.now();
        const diff = settings.countdown.targetTime - now;

        if (diff <= 0) {
            timeLeft = '00:00';
        } else {
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            timeLeft = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
    }

    // Carousel for Platforms
    let activePlatformIndex = 0;
    let activePlatforms: { id: string, user: string, icon: any, color: string, bg: string }[] = [];
    let platformInterval: any;

    const platformConfig: Record<string, { icon: any, color: string, bg: string }> = {
        twitch: { icon: Twitch, color: '#a07cf8', bg: '#6441a5' },
        kick: { icon: MonitorPlay, color: '#53fc18', bg: '#000000' },
        youtube: { icon: Youtube, color: '#ff0000', bg: '#000000' },
        discord: { icon: MessageSquare, color: '#5865F2', bg: '#000000' },
        tiktok: { icon: Video, color: '#00f2fe', bg: '#000000' },
        instagram: { icon: Instagram, color: '#e1306c', bg: '#000000' }
    };

    $: {
        activePlatforms = Object.entries(settings.platforms)
            .filter(([_, data]) => data.active && data.user)
            .map(([id, data]) => ({
                id,
                user: data.user,
                icon: platformConfig[id]?.icon || Globe,
                color: platformConfig[id]?.color || '#ffffff',
                bg: platformConfig[id]?.bg || '#000000'
            }));
        
        if (activePlatforms.length > 0 && activePlatformIndex >= activePlatforms.length) {
            activePlatformIndex = 0;
        }

        if (platformInterval) clearInterval(platformInterval);
        
        let intervalSecs = settings.platformInterval || 5;
        if (intervalSecs < 1) intervalSecs = 1;

        platformInterval = setInterval(() => {
            if (activePlatforms.length > 1) {
                activePlatformIndex = (activePlatformIndex + 1) % activePlatforms.length;
            }
        }, intervalSecs * 1000);
    }

    onMount(() => {
        updateTimer();
        timeInterval = setInterval(updateTimer, 1000);

        platformInterval = setInterval(() => {
            if (activePlatforms.length > 1) {
                activePlatformIndex = (activePlatformIndex + 1) % activePlatforms.length;
            }
        }, 5000); // Rotate every 5 seconds
    });

    onDestroy(() => {
        clearInterval(timeInterval);
        clearInterval(platformInterval);
    });

    // Theme configuration mappings
    $: themeStyles = getThemeStyles(settings.theme);

    function getThemeStyles(theme: string) {
        switch (theme) {
            case 'cyber':
                return {
                    bg: 'bg-slate-950',
                    font: 'font-sans',
                    mainText: 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]',
                    subText: 'text-slate-400 tracking-[0.2em]',
                    accent: 'text-cyan-400',
                    border: 'border-cyan-500/50',
                    badge: 'bg-red-500 text-white',
                    timerText: 'text-fuchsia-400 drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]',
                    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.2)]'
                };
            case 'arcade':
                return {
                    bg: 'bg-black',
                    font: 'font-mono',
                    mainText: 'text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]',
                    subText: 'text-orange-300/70 tracking-widest',
                    accent: 'text-yellow-400',
                    border: 'border-orange-500',
                    badge: 'bg-red-600 text-white',
                    timerText: 'text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,1)]',
                    glow: 'shadow-[0_0_40px_rgba(249,115,22,0.3)]'
                };
            case 'matrix':
                return {
                    bg: 'bg-[#050505]',
                    font: 'font-mono',
                    mainText: 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]',
                    subText: 'text-green-700 tracking-widest',
                    accent: 'text-green-400',
                    border: 'border-green-500/50',
                    badge: 'bg-green-600 text-black',
                    timerText: 'text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,1)]',
                    glow: 'shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                };
            case 'neo-brutal':
            default:
                return {
                    bg: 'bg-slate-900',
                    font: 'font-sans',
                    mainText: 'text-white outline-text drop-shadow-[4px_4px_0px_#eab308]',
                    subText: 'text-slate-900 font-black bg-white px-2 py-1',
                    accent: 'text-slate-900 bg-[#eab308] px-1',
                    border: 'border-4 border-white',
                    badge: 'bg-[#eab308] text-slate-900 border-2 border-white',
                    timerText: 'text-slate-900 bg-[#eab308] border-4 border-white px-4 py-2 drop-shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]',
                    glow: ''
                };
        }
    }
</script>

<div class="w-full h-full relative overflow-hidden flex flex-col {themeStyles.bg} {themeStyles.font}">
    <!-- Background Effects -->
    {#if settings.effects.vignette && settings.theme !== 'neo-brutal'}
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-0"></div>
    {/if}

    <!-- Scanlines -->
    {#if settings.theme === 'matrix' || settings.theme === 'arcade'}
        <div class="absolute inset-0 pointer-events-none z-0 opacity-10" style="background: repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px);"></div>
    {/if}

    <!-- Grid for Arcade -->
    {#if settings.theme === 'arcade'}
        <div class="absolute inset-0 pointer-events-none z-0 opacity-20" style="background-image: linear-gradient(rgba(249, 115, 22, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.3) 1px, transparent 1px); background-size: 40px 40px;"></div>
    {/if}

    <!-- Content Container -->
    <div class="relative z-10 w-full h-full flex flex-col p-8 md:p-12">
        <!-- Top Bar -->
        <div class="flex justify-between items-start w-full">
            <div class="flex items-center gap-4">
                {#if settings.streamer.topBadge}
                    <div class="px-4 py-2 text-sm md:text-xl font-black uppercase flex items-center gap-3 {themeStyles.badge} {settings.theme === 'neo-brutal' ? 'shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]' : ''}">
                        <div class="w-3 h-3 rounded-full {settings.theme === 'neo-brutal' ? 'bg-red-500' : 'bg-current animate-pulse'}"></div>
                        {settings.streamer.topBadge}
                    </div>
                {/if}
                {#if settings.streamer.category}
                    <div class="text-sm md:text-xl font-bold uppercase {settings.theme === 'neo-brutal' ? 'bg-white text-slate-900 px-4 py-2 border-[3px] border-white shadow-[6px_6px_0px_0px_rgba(234,179,8,1)]' : themeStyles.accent}">
                        {settings.streamer.category}
                    </div>
                {/if}
            </div>

            <!-- Optional Extra Tag (e.g. Server Info) Top Right -->
            {#if settings.streamer.extraTag && settings.theme === 'arcade'}
                <div class="text-sm md:text-xl font-bold uppercase text-orange-400">
                    + {settings.streamer.extraTag} +
                </div>
            {:else if settings.streamer.extraTag}
                <div class="text-sm md:text-xl font-bold uppercase {settings.theme === 'neo-brutal' ? 'bg-[#eab308] text-slate-900 border-[3px] border-white px-4 py-2 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]' : 'text-slate-400'}">
                    {settings.streamer.extraTag}
                </div>
            {/if}
        </div>

        <!-- Center Area (Logo & Titles) -->
        <div class="flex-1 flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 mt-10">
            {#if settings.logo.url}
                <div class="relative {settings.logo.animation === 'pulse' ? 'animate-pulse' : settings.logo.animation === 'vibrate' ? 'animate-bounce' : ''}">
                    <img 
                        src={settings.logo.url} 
                        alt="Logo" 
                        class="h-24 md:h-32 xl:h-48 object-contain {settings.logo.glow && settings.theme !== 'neo-brutal' ? themeStyles.glow : ''} {settings.theme === 'neo-brutal' && settings.logo.glow ? 'drop-shadow-[8px_8px_0px_rgba(234,179,8,1)]' : ''}" 
                    />
                </div>
            {/if}

            <div class="space-y-2 md:space-y-4">
                {#if settings.streamer.channel && !settings.logo.url}
                    <h1 class="text-4xl md:text-6xl xl:text-8xl font-black uppercase tracking-tighter {themeStyles.mainText}">
                        {settings.streamer.channel}
                    </h1>
                {/if}

                {#if settings.streamer.mainText}
                    <h2 class="text-2xl md:text-4xl xl:text-6xl font-black uppercase {themeStyles.mainText}">
                        {settings.streamer.mainText}
                    </h2>
                {/if}

                {#if settings.streamer.subText}
                    <p class="text-sm md:text-lg xl:text-xl uppercase inline-block {themeStyles.subText}">
                        {settings.streamer.subText}
                    </p>
                {/if}
            </div>

            <!-- Countdown -->
            {#if settings.countdown.active}
                <div class="mt-8 md:mt-12 flex flex-col items-center gap-2">
                    {#if settings.countdown.textAbove}
                        <div class="text-3xl md:text-5xl xl:text-6xl font-black uppercase {themeStyles.accent} {settings.theme === 'neo-brutal' ? 'shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-white px-3 py-1 mb-2' : ''}">
                            {settings.countdown.textAbove}
                        </div>
                    {/if}
                    <div class="text-5xl md:text-7xl xl:text-9xl font-black tracking-tighter {themeStyles.timerText}">
                        {timeLeft === '00:00' && settings.countdown.textZero ? settings.countdown.textZero : timeLeft}
                    </div>
                </div>
            {/if}
        </div>

        <!-- Bottom Bar -->
        <div class="flex justify-between items-end w-full mt-auto">
            <!-- Platform Carousel (Left) -->
            <div class="flex-1">
                {#if activePlatforms.length > 0}
                    {#key activePlatformIndex}
                        <div 
                            in:fade={{ duration: 300, delay: 150 }} 
                            out:fade={{ duration: 150 }}
                            class="inline-flex items-center gap-6 px-6 py-4 md:px-8 md:py-6 {settings.theme === 'neo-brutal' ? 'bg-slate-800 border-4 md:border-[6px] border-white shadow-[12px_12px_0px_0px_rgba(234,179,8,1)]' : `border-[3px] ${themeStyles.border} rounded-2xl bg-black/50 backdrop-blur-sm ${themeStyles.glow}`}"
                        >
                            <div 
                                class="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center {settings.theme === 'neo-brutal' ? 'bg-white text-slate-900' : 'rounded-xl'}"
                                style={settings.theme !== 'neo-brutal' ? `background-color: ${activePlatforms[activePlatformIndex].bg}` : ''}
                            >
                                <svelte:component 
                                    this={activePlatforms[activePlatformIndex].icon} 
                                    class="w-6 h-6 md:w-10 md:h-10"
                                    color={settings.theme !== 'neo-brutal' ? activePlatforms[activePlatformIndex].color : 'currentColor'} 
                                />
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm md:text-2xl xl:text-3xl font-black uppercase {settings.theme === 'neo-brutal' ? 'text-[#eab308]' : themeStyles.subText}">
                                    {settings.theme === 'neo-brutal' ? 'SÍGUEME EN' : `TAMBIÉN EN`} {activePlatforms[activePlatformIndex].id}
                                </span>
                                <span class="text-3xl md:text-5xl xl:text-6xl font-black uppercase {settings.theme === 'neo-brutal' ? 'text-white' : 'text-white'}">
                                    {activePlatforms[activePlatformIndex].user}
                                </span>
                            </div>
                        </div>
                    {/key}
                {/if}
            </div>

            <!-- Info Bar (Right/Bottom) -->
            <div class="flex gap-8 md:gap-16 items-end">
                <div class="flex flex-col">
                    <span class="text-xl md:text-3xl xl:text-4xl font-black uppercase {settings.theme === 'neo-brutal' ? 'text-white' : themeStyles.accent}">
                        {settings.streamer.channel}
                    </span>
                    <span class="text-xs md:text-xl xl:text-2xl font-black uppercase {settings.theme === 'neo-brutal' ? 'text-[#eab308]' : themeStyles.subText}">
                        CANAL
                    </span>
                </div>
                {#if settings.streamer.category}
                <div class="flex flex-col">
                    <span class="text-xl md:text-3xl xl:text-4xl font-black uppercase {settings.theme === 'neo-brutal' ? 'text-white' : themeStyles.accent}">
                        {settings.streamer.category}
                    </span>
                    <span class="text-xs md:text-xl xl:text-2xl font-black uppercase {settings.theme === 'neo-brutal' ? 'text-[#eab308]' : themeStyles.subText}">
                        CATEGORÍA
                    </span>
                </div>
                {/if}
                <div class="flex flex-col items-end">
                    <div class="flex items-center gap-3">
                        <div class="w-4 h-4 md:w-6 md:h-6 rounded-full {settings.theme === 'neo-brutal' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,1)]'} animate-pulse"></div>
                        <span class="text-xl md:text-3xl xl:text-4xl font-black uppercase {settings.theme === 'neo-brutal' ? 'text-white' : themeStyles.accent}">
                            ONLINE
                        </span>
                    </div>
                    <span class="text-xs md:text-xl xl:text-2xl font-black uppercase {settings.theme === 'neo-brutal' ? 'text-[#eab308]' : themeStyles.subText}">
                        ESTADO
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .outline-text {
        -webkit-text-stroke: 2px black;
        color: white;
    }
</style>
