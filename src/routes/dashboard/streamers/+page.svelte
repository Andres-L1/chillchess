<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { addToast } from '$lib/stores/toasts';
    import { authStore } from '$lib/stores/authStore';
    import { db } from '$lib/firebase';
    import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
    import { onMount } from 'svelte';
    import {
        QrCode,
        Link,
        Palette,
        Copy,
        ExternalLink,
        Settings2,
        Info,
        Check,
        Trophy,
        Bell,
        MessageSquare,
        LayoutDashboard,
        MonitorUp,
        Sparkles,
        Instagram,
        Twitter,
        Globe,
        Timer,
        Trash2,
        Plus,
        Cat
    } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import StreamIntroEditor from '$lib/components/streamers/StreamIntroEditor.svelte';
    import { fade, slide } from 'svelte/transition';

    pageHeader.set({
        title: 'CENTRO DE STREAMERS',
        description: 'Gestiona todas tus herramientas dinámicas para OBS en un solo lugar.',
        category: 'STREAMING Hub',
    });

    // Widget Management
    let selectedWidgetId = 'dynamic_qr';

    // Manejar el cambio de tab por URL
    $: {
        const tab = $page.url.searchParams.get('tab');
        if (tab === 'chat') selectedWidgetId = 'chat_overlay';
        else if (tab === 'social') selectedWidgetId = 'social_showcase';
        else if (tab === 'countdown') selectedWidgetId = 'neo_countdown';
        else if (tab === 'intro') selectedWidgetId = 'stream_intro';
        else if (tab === 'qr') selectedWidgetId = 'dynamic_qr';
        else selectedWidgetId = 'hub';
    }

    function selectWidget(id: string) {
        const tabMap: Record<string, string> = {
            'dynamic_qr': 'qr',
            'chat_overlay': 'chat',
            'social_showcase': 'social',
            'neo_countdown': 'countdown',
            'stream_intro': 'intro',
            'bongo_cat': 'bongo'
        };
        const tab = tabMap[id];
        if (tab) {
            const url = new URL($page.url);
            url.searchParams.set('tab', tab);
            goto(url.toString(), { replaceState: true });
        } else {
            selectedWidgetId = id;
        }
    }

    const widgets = [
        {
            id: 'stream_intro',
            name: 'Overlay Editor',
            icon: MonitorUp,
            description: 'Pizarrón Neo-Brutal para tu inicio de Stream.',
            active: true,
        },
        {
            id: 'dynamic_qr',
            name: 'Código QR Dinámico',
            icon: QrCode,
            description: 'Cambia el destino de tu QR en tiempo real.',
            active: true,
        },
        {
            id: 'chat_overlay',
            name: 'Chat Neo-Brutal',
            icon: MessageSquare,
            description: 'Muestra tu chat con estilo rompedor.',
            active: true,
        },
        {
            id: 'social_showcase',
            name: 'Social Media Showcase',
            icon: Instagram,
            description: 'Muestra tus redes sociales con estilo.',
            active: true,
        },
        {
            id: 'neo_countdown',
            name: 'Neo-Countdown',
            icon: Timer,
            description: 'Cuenta regresiva para tus directos.',
            active: true,
        },
        {
            id: 'sub_goal',
            name: 'Meta de Suscriptores',
            icon: Trophy,
            description: 'Barra de progreso para tus metas de subs.',
            active: false,
        },
        {
            id: 'alerts',
            name: 'Alertas Neo-Brutalistas',
            icon: Bell,
            description: 'Notificaciones con diseño rompedor.',
            active: false,
        },
        {
            id: 'bongo_cat',
            name: 'Bongo Cat',
            icon: Cat,
            description: 'Tu mascota virtual interactiva para el escritorio.',
            active: true,
            adminOnly: true
        }
    ];

    let qrSettings = {
        targetUrl: '',
        fgColor: '#000000',
        bgColor: '#ffffff',
        title: '¡Escanea para entrar!',
    };

    let chatSettings = {
        platform: 'twitch', // 'twitch' | 'kick'
        channel: '',
        fontSize: 16,
        theme: 'light',
        showBadges: true,
        fontColor: '#000000',
        borderColor: '#000000',
        bgColor: '#ffffff',
        shadowColor: '#000000',
    };

    let socialSettings = {
        items: [
            { platform: 'instagram', handle: '@chillchess', icon: 'Instagram' },
            { platform: 'twitter', handle: '@chillchess', icon: 'Twitter' }
        ],
        interval: 10, // seconds
        bgColor: '#ffffff',
        accentColor: '#FFDD00',
        fontColor: '#000000',
        borderColor: '#000000'
    };

    let countdownSettings = {
        duration: 300,
        title: '¡Ya volvemos!',
        isActive: false,
        lastUpdated: Date.now(),
        timeLeft: 300,
        bgColor: '#ffffff',
        barColor: '#FFDD00',
        borderColor: '#000000'
    };

    let introSettings: any = undefined; // Will be set by component if left undefined or populated from Firebase

    let loading = true;
    let saving = false;
    let lastSaved = Date.now();
    let copied = false;

    $: ready = $authStore.user?.uid ? true : false;
    
    $: widgetUrl = ready
        ? `${window.location.origin}/widgets/${
            selectedWidgetId === 'dynamic_qr' ? 'qr' : 
            selectedWidgetId === 'chat_overlay' ? 'chat' :
            selectedWidgetId === 'social_showcase' ? 'social' :
            selectedWidgetId === 'neo_countdown' ? 'countdown' : 
            selectedWidgetId === 'stream_intro' ? 'intro' : 'unknown'
        }/${$authStore.user?.uid}`
        : 'Cargando URL...';

    onMount(() => {
        if (!$authStore.user?.uid) return;

        // Track how many snapshots we've loaded
        let loadedSnapshots = 0;
        const totalSnapshots = 4;

        function checkLoading() {
            loadedSnapshots++;
            if (loadedSnapshots >= totalSnapshots) {
                loading = false;
            }
        }

        // Subscribe to QR settings
        const qrRef = doc(db, 'users', $authStore.user.uid, 'streamerSettings', 'dynamic_qr');
        const unsubQr = onSnapshot(qrRef, (docSnap) => {
            if (docSnap.exists()) {
                qrSettings = { ...qrSettings, ...docSnap.data() };
            }
            if (loading) checkLoading();
        });

        // Subscribe to Chat settings
        const chatRef = doc(db, 'users', $authStore.user.uid, 'streamerSettings', 'chat_overlay');
        const unsubChat = onSnapshot(chatRef, (docSnap) => {
            if (docSnap.exists()) {
                chatSettings = { ...chatSettings, ...docSnap.data() };
            }
            if (loading) checkLoading();
        });

        // Subscribe to Social settings
        const socialRef = doc(db, 'users', $authStore.user.uid, 'streamerSettings', 'social_showcase');
        const unsubSocial = onSnapshot(socialRef, (docSnap) => {
            if (docSnap.exists()) {
                socialSettings = { ...socialSettings, ...docSnap.data() };
            }
            if (loading) checkLoading();
        });

        // Subscribe to Countdown settings
        const countdownRef = doc(db, 'users', $authStore.user.uid, 'streamerSettings', 'neo_countdown');
        const unsubCountdown = onSnapshot(countdownRef, (docSnap) => {
            if (docSnap.exists()) {
                countdownSettings = { ...countdownSettings, ...docSnap.data() };
            }
            if (loading) checkLoading();
        });

        // Subscribe to Intro settings
        const introRef = doc(db, 'users', $authStore.user.uid, 'streamerSettings', 'stream_intro');
        const unsubIntro = onSnapshot(introRef, (docSnap) => {
            if (docSnap.exists()) {
                introSettings = { ...introSettings, ...docSnap.data() };
            }
        });

        return () => {
            unsubQr();
            unsubChat();
            unsubSocial();
            unsubCountdown();
            unsubIntro();
        };
    });

    async function saveSettings(id: string, settings: any) {
        if (!$authStore.user?.uid) return;
        saving = true;
        try {
            const settingsRef = doc(
                db,
                'users',
                $authStore.user.uid,
                'streamerSettings',
                id
            );
            const promise = setDoc(
                settingsRef,
                {
                    ...settings,
                    updatedAt: new Date(),
                },
                { merge: true }
            );
            await promise;
            lastSaved = Date.now();
            return promise; // Return the promise for cascading awaits
        } catch (error) {
            console.error('Error saving settings:', error);
            addToast('Error al guardar los ajustes', 'error');
            throw error;
        } finally {
            saving = false;
        }
    }

    async function triggerTestMessage(widgetId: string) {
        if (!$authStore.user?.uid) return;
        try {
            const settingsRef = doc(db, 'users', $authStore.user.uid, 'streamerSettings', widgetId);
            await setDoc(settingsRef, { testTrigger: Date.now() }, { merge: true });
            addToast('Mensaje de prueba enviado', 'success');
        } catch (error) {
            console.error('Error sending test message:', error);
            addToast('Error al enviar prueba', 'error');
        }
    }

    let debounceTimer: any;
    $: if ((qrSettings || chatSettings || socialSettings || countdownSettings) && !loading) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (selectedWidgetId === 'dynamic_qr') saveSettings('dynamic_qr', qrSettings);
            if (selectedWidgetId === 'chat_overlay') saveSettings('chat_overlay', chatSettings);
            if (selectedWidgetId === 'social_showcase') saveSettings('social_showcase', socialSettings);
            if (selectedWidgetId === 'neo_countdown') saveSettings('neo_countdown', countdownSettings);
        }, 1000);
    }

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(widgetUrl);
            copied = true;
            addToast('¡URL copiada con éxito!', 'success');
            setTimeout(() => (copied = false), 2000);
        } catch (err) {
            addToast('Error al copiar la URL', 'error');
        }
    }

    function addSocialItem() {
        socialSettings.items = [...socialSettings.items, { platform: 'instagram', handle: '@nuevo', icon: 'Instagram' }];
    }

    function removeSocialItem(index: number) {
        socialSettings.items = socialSettings.items.filter((_, i) => i !== index);
    }

    function toggleCountdown() {
        countdownSettings.isActive = !countdownSettings.isActive;
        countdownSettings.lastUpdated = Date.now();
        if (countdownSettings.isActive) {
            countdownSettings.timeLeft = countdownSettings.duration;
        }
    }
</script>

<svelte:head>
    <title>Streamer Hub | ChillChess</title>
</svelte:head>

<ProGate>
    <div class="max-w-7xl mx-auto pb-20 px-4 md:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            <!-- Main Content Area -->
            <div class="lg:col-span-4 space-y-8">
                {#if selectedWidgetId === 'stream_intro'}
                    <div in:fade={{ duration: 200 }} class="space-y-8 h-full">
                        <StreamIntroEditor bind:settings={introSettings} {saving} {widgetUrl} on:save={async (e) => {introSettings = e.detail; await saveSettings('stream_intro', introSettings);}} />
                    </div>
                {:else if selectedWidgetId === 'dynamic_qr'}
                    <div in:fade={{ duration: 200 }} class="space-y-8">
                        <!-- Header Card -->
                        <div
                            class="bg-black text-white border-4 border-black p-8 shadow-neo relative overflow-hidden group"
                        >
                            <div
                                class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"
                            >
                                <QrCode size={140} />
                            </div>
                            <div class="relative z-10 space-y-3">
                                <h2
                                    class="text-3xl font-black uppercase tracking-tighter leading-none"
                                >
                                    QR <span class="text-primary italic">Dinámico</span>
                                </h2>
                                <p class="text-sm text-slate-400 font-bold max-w-lg leading-tight">
                                    Controla el destino de tu QR desde aquí. OBS se refrescará al
                                    instante sin pausas en tu directo.
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                            <!-- Config Column -->
                            <div class="xl:col-span-2 space-y-8">
                                <section
                                    class="bg-white dark:bg-slate-900 border-4 border-black p-8 shadow-neo-sm relative"
                                >
                                    <div
                                        class="absolute -top-5 -left-4 bg-yellow-300 border-2 border-black px-4 py-1 font-black text-xs flex items-center gap-2 shadow-neo-sm transform -rotate-1"
                                    >
                                        <Settings2 class="w-4 h-4" /> CONFIGURACIÓN
                                    </div>

                                    <div class="space-y-8 mt-4">
                                        <div class="space-y-3">
                                            <label
                                                for="target-url"
                                                class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500"
                                            >
                                                <Link class="w-4 h-4 text-primary" /> Enlace de destino
                                            </label>
                                            <input
                                                id="target-url"
                                                type="url"
                                                bind:value={qrSettings.targetUrl}
                                                placeholder="https://discord.gg/tu-comunidad"
                                                class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black p-5 text-lg font-black focus:outline-none focus:border-primary shadow-inner"
                                            />
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div class="space-y-3">
                                                <div
                                                    class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500"
                                                >
                                                    <Palette class="w-4 h-4 text-primary" /> Estética
                                                </div>
                                                <div
                                                    class="flex items-center gap-6 p-4 border-2 border-black bg-slate-50 dark:bg-slate-800 shadow-neo-sm"
                                                >
                                                    <div class="space-y-2">
                                                        <input
                                                            type="color"
                                                            bind:value={qrSettings.fgColor}
                                                            class="w-12 h-12 border-2 border-black cursor-pointer bg-transparent"
                                                        />
                                                        <span
                                                            class="block text-[10px] font-black text-center"
                                                            >{qrSettings.fgColor}</span
                                                        >
                                                    </div>
                                                    <div
                                                        class="h-10 w-px bg-black opacity-20"
                                                    ></div>
                                                    <div class="space-y-2">
                                                        <input
                                                            type="color"
                                                            bind:value={qrSettings.bgColor}
                                                            class="w-12 h-12 border-2 border-black cursor-pointer bg-transparent"
                                                        />
                                                        <span
                                                            class="block text-[10px] font-black text-center"
                                                            >{qrSettings.bgColor}</span
                                                        >
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="space-y-3">
                                                <label
                                                    for="qr-title"
                                                    class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500"
                                                >
                                                    <Info class="w-4 h-4 text-primary" /> Texto auxiliar
                                                </label>
                                                <input
                                                    id="qr-title"
                                                    type="text"
                                                    bind:value={qrSettings.title}
                                                    placeholder="¡Escanea aquí!"
                                                    class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black p-5 text-base font-black focus:outline-none focus:border-primary shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        class="mt-8 pt-6 border-t-2 border-black/10 flex items-center justify-between"
                                    >
                                        <div
                                            class="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"
                                        >
                                            {#if saving}
                                                <div
                                                    class="w-2 h-2 bg-primary animate-pulse rounded-full"
                                                ></div>
                                                Sincronizando...
                                            {:else}
                                                <Check class="w-3 h-3 text-green-500" /> Todo listo
                                            {/if}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <!-- OBS Column -->
                            <div class="xl:col-span-1 space-y-6">
                                <section class="bg-primary border-4 border-black p-6 shadow-neo-sm">
                                    <h3
                                        class="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2"
                                    >
                                        <ExternalLink class="w-5 h-5" /> Fuente OBS
                                    </h3>

                                    <div class="space-y-4">
                                        <div class="bg-white p-3 border-2 border-black">
                                            <p class="text-[9px] font-black uppercase mb-2">
                                                Pegar en navegador
                                            </p>
                                            <div class="flex gap-2">
                                                <input
                                                    readonly
                                                    value={widgetUrl}
                                                    class="flex-1 bg-white text-black p-2 text-[10px] font-mono border-2 border-black truncate"
                                                />
                                                <button
                                                    on:click={copyToClipboard}
                                                    class="p-2 bg-black text-white hover:bg-slate-800"
                                                >
                                                    <Copy class="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            class="bg-white/50 p-4 border-2 border-black text-[10px] font-bold space-y-2"
                                        >
                                            <p>1. Crea fuente "Navegador"</p>
                                            <p>2. Tamaño sugerido: 400x600</p>
                                            <p>3. Activa "Actualizar cuando sea visible"</p>
                                        </div>

                                        <a
                                            href={widgetUrl}
                                            target="_blank"
                                            class="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-black font-black text-xs uppercase hover:bg-black hover:text-white transition-all shadow-neo-sm"
                                        >
                                            Previsualizar <ExternalLink class="w-3 h-3" />
                                        </a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                {:else if selectedWidgetId === 'chat_overlay'}
                    <div in:fade={{ duration: 200 }} class="space-y-8">
                        <!-- Header Card -->
                        <div
                            class="bg-black text-white border-4 border-black p-8 shadow-neo relative overflow-hidden group"
                        >
                            <div
                                class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"
                            >
                                <MessageSquare size={140} />
                            </div>
                            <div class="relative z-10 space-y-3">
                                <h2
                                    class="text-3xl font-black uppercase tracking-tighter leading-none"
                                >
                                    Chat <span class="text-primary italic">Neo-Brutal</span>
                                </h2>
                                <p class="text-sm text-slate-400 font-bold max-w-lg leading-tight">
                                    Muestra los mensajes de tu comunidad con el estilo más agresivo
                                    y limpio.
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                            <!-- Config Column -->
                            <div class="xl:col-span-2 space-y-8">
                                <section
                                    class="bg-white dark:bg-slate-900 border-4 border-black p-8 shadow-neo-sm relative"
                                >
                                    <div
                                        class="absolute -top-5 -left-4 bg-primary border-2 border-black px-4 py-1 font-black text-xs flex items-center gap-2 shadow-neo-sm transform -rotate-1"
                                    >
                                        <Settings2 class="w-4 h-4" /> CONFIGURACIÓN CHAT
                                    </div>

                                    <div class="space-y-8 mt-4">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div class="space-y-3">
                                                <label for="platform-select" class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                                    <Sparkles class="w-4 h-4 text-primary" /> Plataforma
                                                </label>
                                                <select
                                                    id="platform-select"
                                                    bind:value={chatSettings.platform}
                                                    class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black p-5 text-lg font-black focus:outline-none focus:border-primary shadow-inner appearance-none cursor-pointer"
                                                >
                                                    <option value="twitch">Twitch</option>
                                                    <option value="kick">Kick</option>
                                                </select>
                                            </div>

                                            <div class="space-y-3">
                                                <label
                                                    for="channel-name"
                                                    class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500"
                                                >
                                                    <MessageSquare class="w-4 h-4 text-primary" /> Nombre del canal
                                                </label>
                                                <input
                                                    id="channel-name"
                                                    type="text"
                                                    bind:value={chatSettings.channel}
                                                    placeholder="tucanal..."
                                                    class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black p-5 text-lg font-black focus:outline-none focus:border-primary shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div class="space-y-3">
                                                <label
                                                    for="font-size"
                                                    class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500"
                                                >
                                                    <Palette class="w-4 h-4 text-primary" /> Tamaño de
                                                    fuente
                                                </label>
                                                <div class="flex items-center gap-4">
                                                    <input
                                                        id="font-size"
                                                        type="range"
                                                        min="12"
                                                        max="48"
                                                        bind:value={chatSettings.fontSize}
                                                        class="flex-1 accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                    <span class="font-black text-lg w-12"
                                                        >{chatSettings.fontSize}px</span
                                                    >
                                                </div>
                                            </div>

                                            <div class="space-y-3">
                                                <div
                                                    class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500"
                                                >
                                                    <Palette class="w-4 h-4 text-primary" /> Colores
                                                    base
                                                </div>
                                                <div class="flex gap-4">
                                                    <div class="flex flex-col items-center gap-1">
                                                        <input
                                                            type="color"
                                                            bind:value={chatSettings.fontColor}
                                                            class="w-10 h-10 border-2 border-black cursor-pointer bg-transparent"
                                                        />
                                                        <span class="text-[8px] font-black"
                                                            >TEXTO</span
                                                        >
                                                    </div>
                                                    <div class="flex flex-col items-center gap-1">
                                                        <input
                                                            type="color"
                                                            bind:value={chatSettings.borderColor}
                                                            class="w-10 h-10 border-2 border-black cursor-pointer bg-transparent"
                                                        />
                                                        <span class="text-[8px] font-black"
                                                            >BORDE</span
                                                        >
                                                    </div>
                                                    <div class="flex flex-col items-center gap-1">
                                                        <input
                                                            type="color"
                                                            bind:value={chatSettings.bgColor}
                                                            class="w-10 h-10 border-2 border-black cursor-pointer bg-transparent"
                                                        />
                                                        <span class="text-[8px] font-black"
                                                            >FONDO</span
                                                        >
                                                    </div>
                                                    <div class="flex flex-col items-center gap-1">
                                                        <input
                                                            type="color"
                                                            bind:value={chatSettings.shadowColor}
                                                            class="w-10 h-10 border-2 border-black cursor-pointer bg-transparent"
                                                        />
                                                        <span class="text-[8px] font-black"
                                                            >SOMBRA</span
                                                        >
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            on:click={() => triggerTestMessage('chat_overlay')}
                                            class="w-full py-6 font-black uppercase text-xl border-4 border-black transition-all hover:translate-x-1 hover:translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none bg-primary text-black hover:bg-yellow-400 mt-6"
                                        >
                                            Enviar Mensaje de Prueba
                                        </button>
                                    </div>
                                </section>
                            </div>

                            <!-- OBS Column -->
                            <div class="xl:col-span-1 space-y-6">
                                <section class="bg-primary border-4 border-black p-6 shadow-neo-sm">
                                    <h3
                                        class="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2"
                                    >
                                        <ExternalLink class="w-5 h-5" /> Fuente OBS
                                    </h3>

                                    <div class="space-y-4">
                                        <div class="bg-white p-3 border-2 border-black">
                                            <p class="text-[9px] font-black uppercase mb-2">
                                                Pegar en navegador
                                            </p>
                                            <div class="flex gap-2">
                                                <input
                                                    readonly
                                                    value={widgetUrl}
                                                    class="flex-1 bg-white text-black p-2 text-[10px] font-mono border-2 border-black truncate"
                                                />
                                                <button
                                                    on:click={copyToClipboard}
                                                    class="p-2 bg-black text-white hover:bg-slate-800"
                                                >
                                                    <Copy class="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            class="bg-white/50 p-4 border-2 border-black text-[10px] font-bold space-y-2"
                                        >
                                            <p>1. Crea fuente "Navegador"</p>
                                            <p>2. Tamaño sugerido: 400x800 (Vertical)</p>
                                            <p>3. Deja el CSS personalizado vacío</p>
                                        </div>

                                        <a
                                            href={widgetUrl}
                                            target="_blank"
                                            class="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-black font-black text-xs uppercase hover:bg-black hover:text-white transition-all shadow-neo-sm"
                                        >
                                            Previsualizar <ExternalLink class="w-3 h-3" />
                                        </a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                {:else if selectedWidgetId === 'social_showcase'}
                    <div in:fade={{ duration: 200 }} class="space-y-8">
                        <div class="bg-black text-white border-4 border-black p-8 shadow-neo relative overflow-hidden group">
                            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Instagram size={140} />
                            </div>
                            <div class="relative z-10 space-y-3">
                                <h2 class="text-3xl font-black uppercase tracking-tighter leading-none">
                                    Social <span class="text-primary italic">Showcase</span>
                                </h2>
                                <p class="text-sm text-slate-400 font-bold max-w-lg leading-tight">
                                    Rota tus redes sociales automáticamente en tu stream con diseño Neo-Brutalista.
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                            <div class="xl:col-span-2 space-y-8">
                                <section class="bg-white dark:bg-slate-900 border-4 border-black p-8 shadow-neo-sm relative">
                                    <div class="absolute -top-5 -left-4 bg-primary border-2 border-black px-4 py-1 font-black text-xs flex items-center gap-2 shadow-neo-sm transform -rotate-1">
                                        <Settings2 class="w-4 h-4" /> GESTIONAR REDES
                                    </div>

                                    <div class="space-y-4 mt-6">
                                        {#each socialSettings.items as item, i}
                                            <div class="flex gap-4 items-end bg-slate-50 dark:bg-slate-800 p-4 border-2 border-black">
                                                <div class="flex-1 space-y-2">
                                                    <label for={`plataforma-${i}`} class="text-[10px] font-black uppercase">Plataforma</label>
                                                    <select id={`plataforma-${i}`} bind:value={item.platform} class="w-full bg-white dark:bg-slate-700 border-2 border-black p-2 font-bold">
                                                        <option value="instagram">Instagram</option>
                                                        <option value="twitter">Twitter / X</option>
                                                        <option value="twitch">Twitch</option>
                                                        <option value="youtube">YouTube</option>
                                                        <option value="discord">Discord</option>
                                                        <option value="web">Sitio Web</option>
                                                    </select>
                                                </div>
                                                <div class="flex-[2] space-y-2">
                                                    <label for={`handle-${i}`} class="text-[10px] font-black uppercase">Usuario / Enlace</label>
                                                    <input id={`handle-${i}`} type="text" bind:value={item.handle} class="w-full bg-white dark:bg-slate-700 border-2 border-black p-2 font-bold" />
                                                </div>
                                                <button on:click={() => removeSocialItem(i)} class="p-3 bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        {/each}
                                        <button
                                            on:click={addSocialItem}
                                            class="w-full py-4 border-4 border-black bg-white hover:bg-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-black uppercase flex items-center justify-center gap-2 mt-4"
                                        >
                                            <Plus size={24} /> AÑADIR RED SOCIAL
                                        </button>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                        <div class="space-y-3">
                                            <label for="social-interval" class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                                <Timer class="w-4 h-4" /> Intervalo (segundos)
                                            </label>
                                            <input id="social-interval" type="number" bind:value={socialSettings.interval} min="5" max="60" class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black p-4 font-black" />
                                        </div>
                                        <div class="space-y-3">
                                            <label for="social-bg-color" class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                                <Palette class="w-4 h-4" /> Colores
                                            </label>
                                            <div class="flex gap-4">
                                                <input id="social-bg-color" type="color" bind:value={socialSettings.bgColor} class="w-10 h-10 border-2 border-black" />
                                                <input type="color" bind:value={socialSettings.accentColor} class="w-10 h-10 border-2 border-black" />
                                                <input type="color" bind:value={socialSettings.fontColor} class="w-10 h-10 border-2 border-black" />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div class="xl:col-span-1 space-y-6">
                                <section class="bg-primary border-4 border-black p-6 shadow-neo-sm">
                                    <h3 class="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                                        <ExternalLink class="w-5 h-5" /> Fuente OBS
                                    </h3>
                                    <div class="space-y-4">
                                        <div class="bg-white p-3 border-2 border-black">
                                            <p class="text-[9px] font-black uppercase mb-2">Pegar en navegador</p>
                                            <div class="flex gap-2">
                                                <input readonly value={widgetUrl} class="flex-1 bg-white text-black p-2 text-[10px] font-mono border-2 border-black truncate" />
                                                <button on:click={copyToClipboard} class="p-2 bg-black text-white hover:bg-slate-800"><Copy class="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div class="bg-white/50 p-4 border-2 border-black text-[10px] font-bold">
                                            <p>Tamaño sugerido: 400x120</p>
                                        </div>
                                        <a href={widgetUrl} target="_blank" class="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-black font-black text-xs uppercase hover:bg-black hover:text-white transition-all shadow-neo-sm">
                                            Previsualizar <ExternalLink class="w-3 h-3" />
                                        </a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                {:else if selectedWidgetId === 'neo_countdown'}
                    <div in:fade={{ duration: 200 }} class="space-y-8">
                        <div class="bg-black text-white border-4 border-black p-8 shadow-neo relative overflow-hidden group">
                            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Timer size={140} />
                            </div>
                            <div class="relative z-10 space-y-3">
                                <h2 class="text-3xl font-black uppercase tracking-tighter leading-none">
                                    Neo <span class="text-primary italic">Countdown</span>
                                </h2>
                                <p class="text-sm text-slate-400 font-bold max-w-lg leading-tight">
                                    Cuenta regresiva de alto impacto para tus introducciones o descansos.
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                            <div class="xl:col-span-2 space-y-8">
                                <section class="bg-white dark:bg-slate-900 border-4 border-black p-8 shadow-neo-sm relative">
                                    <div class="absolute -top-5 -left-4 bg-primary border-2 border-black px-4 py-1 font-black text-xs flex items-center gap-2 shadow-neo-sm transform -rotate-1">
                                        <Settings2 class="w-4 h-4" /> CONFIGURACIÓN CONTADOR
                                    </div>

                                    <div class="space-y-6 mt-6">
                                        <div class="space-y-3">
                                            <label for="countdown-title" class="text-xs font-black uppercase">Título del Contador</label>
                                            <input id="countdown-title" type="text" bind:value={countdownSettings.title} class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black p-4 text-xl font-black" />
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div class="space-y-3">
                                                <label for="countdown-duration" class="text-xs font-black uppercase">Duración (segundos)</label>
                                                <input id="countdown-duration" type="number" bind:value={countdownSettings.duration} class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black p-4 font-black" />
                                            </div>
                                            <div class="space-y-3">
                                                <label for="countdown-bar-color" class="text-xs font-black uppercase">Colores</label>
                                                <div class="flex gap-4">
                                                    <div class="flex flex-col items-center">
                                                        <input id="countdown-bar-color" type="color" bind:value={countdownSettings.barColor} class="w-10 h-10 border-2 border-black" />
                                                        <span class="text-[8px] font-black underline">BARRA</span>
                                                    </div>
                                                    <div class="flex flex-col items-center">
                                                        <input type="color" bind:value={countdownSettings.bgColor} class="w-10 h-10 border-2 border-black" />
                                                        <span class="text-[8px] font-black underline">FONDO</span>
                                                    </div>
                                                    <div class="flex flex-col items-center">
                                                        <input type="color" bind:value={countdownSettings.borderColor} class="w-10 h-10 border-2 border-black" />
                                                        <span class="text-[8px] font-black underline">BORDE</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            on:click={toggleCountdown}
                                            class="w-full py-6 font-black uppercase text-xl border-4 border-black transition-all hover:translate-x-1 hover:translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none mt-6 {countdownSettings.isActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary text-black hover:bg-yellow-400'}"
                                        >
                                            {countdownSettings.isActive ? 'Detener Contador' : 'Iniciar / Reiniciar Contador'}
                                        </button>
                                    </div>
                                </section>
                            </div>

                            <div class="xl:col-span-1 space-y-6">
                                <section class="bg-primary border-4 border-black p-6 shadow-neo-sm">
                                    <h3 class="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                                        <ExternalLink class="w-5 h-5" /> Fuente OBS
                                    </h3>
                                    <div class="space-y-4">
                                        <div class="bg-white p-3 border-4 border-black">
                                            <p class="text-[9px] font-black uppercase mb-2">Pegar en navegador</p>
                                            <div class="flex gap-2">
                                                <input readonly value={widgetUrl} class="flex-1 bg-white text-black p-2 text-[10px] font-mono border-2 border-black truncate" />
                                                <button on:click={copyToClipboard} class="px-4 py-2 font-black uppercase bg-black text-white hover:bg-slate-800 transition-colors border-2 border-black"><Copy class="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <div class="bg-white/90 p-4 border-4 border-black text-[10px] font-bold">
                                            <p>Tamaño sugerido: <span class="bg-amber-200 px-1 border border-black">800x400</span></p>
                                        </div>
                                        <a href={widgetUrl} target="_blank" class="flex items-center justify-center gap-2 w-full py-4 bg-white border-4 border-black font-black text-sm uppercase hover:bg-black hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                                            Previsualizar <ExternalLink class="w-4 h-4" />
                                        </a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                {:else if selectedWidgetId === 'bongo_cat' && $authStore.user?.isAdmin}
                    <div in:fade={{ duration: 200 }} class="space-y-8">
                        <div class="bg-black text-white border-4 border-black p-8 shadow-neo relative overflow-hidden group">
                            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Cat size={140} />
                            </div>
                            <div class="relative z-10 space-y-3">
                                <h2 class="text-3xl font-black uppercase tracking-tighter leading-none">
                                    Bongo <span class="text-primary italic">Cat</span>
                                </h2>
                                <p class="text-sm text-slate-400 font-bold max-w-lg leading-tight">
                                    El clásico gatito de escritorio, rediseñado con pura estética Neo-Brutalista exclusiva para administradores.
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                            <div class="xl:col-span-2 space-y-8">
                                <section class="bg-white dark:bg-slate-900 border-4 border-black p-8 shadow-neo-sm relative">
                                    <div class="absolute -top-5 -left-4 bg-[#FFDD00] border-2 border-black px-4 py-1 font-black text-xs flex items-center gap-2 shadow-neo-sm transform -rotate-1 text-black">
                                        <Cat class="w-4 h-4" /> DESCARGA
                                    </div>

                                    <div class="space-y-6 mt-6">
                                        <p class="font-bold">
                                            Bongo Cat es una aplicación de escritorio que captura las pulsaciones de tu teclado y ratón. Hemos adaptado la interfaz para que encaje al 100% con ChillChess.
                                        </p>
                                        <div class="bg-black text-[#FFDD00] p-4 border-4 border-black font-mono text-sm">
                                            <p class="font-black mb-2">A T E N C I Ó N:</p>
                                            <ul class="list-disc pl-5 space-y-1">
                                                <li>Esta aplicación está restringida a administradores.</li>
                                                <li>No se transmite ninguna pulsación de teclado por internet. Todo es local.</li>
                                            </ul>
                                        </div>

                                        <!-- 
                                            NOTA: Aquí se descargará directamente el ejecutable que vamos a compilar y alojar en tu propia web.
                                        -->
                                        <a 
                                            href="/downloads/BongoCat.exe"
                                            download="BongoCat.exe"
                                            target="_blank"
                                            data-sveltekit-reload
                                            class="inline-flex items-center justify-center gap-2 w-full py-6 font-black uppercase text-xl border-4 border-black transition-all hover:translate-x-1 hover:translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none bg-[#FFDD00] text-black hover:bg-yellow-400 mt-6"
                                        >
                                            <ExternalLink class="w-6 h-6" /> Descargar Bongo Cat Neo (.exe)
                                        </a>
                                    </div>
                                </section>
                            </div>

                            <div class="xl:col-span-1 space-y-6">
                                <section class="bg-[#FFDD00] text-black border-4 border-black p-6 shadow-neo-sm">
                                    <h3 class="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                                        <Info class="w-5 h-5" /> Instrucciones
                                    </h3>
                                    <div class="space-y-4">
                                        <div class="bg-white p-4 border-4 border-black text-xs font-bold space-y-2">
                                            <p>1. Descarga el código fuente (Próximamente ejecutable precompilado).</p>
                                            <p>2. Abre OBS.</p>
                                            <p>3. Agrega una Captura de Ventana y selecciona BongoCat.</p>
                                            <p>4. Aplica filtro de 'Clave de color' para quitar el fondo rojo/verde.</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                {:else if selectedWidgetId === 'hub'}
                    <div in:fade={{ duration: 200 }} class="space-y-12">
                        <!-- Hub Header -->
                        <div class="relative bg-white dark:bg-slate-900 border-4 border-black p-10 md:p-16 shadow-neo overflow-hidden">
                            <div class="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                            <div class="relative z-10 max-w-2xl space-y-6">
                                <div class="inline-flex items-center gap-2 bg-yellow-300 border-2 border-black px-4 py-1.5 font-black text-xs uppercase tracking-widest shadow-neo-sm transform -rotate-1">
                                    <Sparkles class="w-4 h-4" /> Centro de Control Alpha
                                </div>
                                <h1 class="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                                    STREAMER <span class="text-primary italic">HUB</span>
                                </h1>
                                <p class="text-xl font-bold text-slate-500 dark:text-slate-400 leading-tight">
                                    Tus herramientas de streaming, reinventadas con diseño Neo-Brutalista. 
                                    Potencia tu directo con widgets dinámicos únicos.
                                </p>
                            </div>
                        </div>

                        <!-- Hub Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {#each widgets as widget}
                                {#if !widget.adminOnly || (widget.adminOnly && $authStore.user?.isAdmin)}
                                <button 
                                    on:click={() => selectWidget(widget.id)}
                                    class="group relative bg-white dark:bg-slate-900 border-4 border-black p-8 text-left transition-all hover:-translate-y-2 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_var(--primary)] {!widget.active ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer shadow-neo'}"
                                >
                                    {#if widget.active}
                                        <div class="absolute top-4 right-4 bg-green-400 border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase">Activo</div>
                                    {:else}
                                        <div class="absolute top-4 right-4 bg-slate-300 border-2 border-black px-2 py-0.5 text-[8px] font-black uppercase">Próximamente</div>
                                    {/if}

                                    <div class="w-16 h-16 bg-slate-50 dark:bg-slate-800 border-4 border-black flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors shadow-neo-sm">
                                        <svelte:component this={widget.icon} class="w-8 h-8" />
                                    </div>

                                    <h3 class="text-2xl font-black uppercase tracking-tighter mb-2 group-hover:text-primary transition-colors">{widget.name}</h3>
                                    <p class="text-sm font-bold text-slate-500 dark:text-slate-400 leading-snug">{widget.description}</p>
                                    
                                    <div class="mt-6 pt-6 border-t-2 border-black/10 flex items-center justify-between">
                                        <span class="text-[10px] font-black uppercase tracking-widest text-primary">Configurar Herramienta</span>
                                        <div class="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                            <ExternalLink class="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {:else}
                    <div
                        in:fade={{ duration: 200 }}
                        class="flex flex-col items-center justify-center min-h-[400px] border-4 border-dashed border-black opacity-40 bg-slate-50 dark:bg-slate-900/50"
                    >
                        <Sparkles size={48} class="mb-4 text-primary" />
                        <h3 class="text-2xl font-black uppercase tracking-tighter">Próximamente</h3>
                        <p class="font-bold text-sm">Estamos horneando nuevos widgets.</p>
                        <button 
                            on:click={() => selectWidget('hub')}
                            class="mt-6 px-4 py-2 bg-black text-white font-black uppercase text-xs border-2 border-black hover:bg-primary hover:text-black transition-colors"
                        >
                            Volver al Hub
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</ProGate>

<style>
    :global(input[type='color']) {
        padding: 0;
    }
</style>
