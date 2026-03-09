<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
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
        Sparkles,
    } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { fade, slide } from 'svelte/transition';

    pageHeader.set({
        title: 'CENTRO DE STREAMERS',
        description: 'Gestiona todas tus herramientas dinámicas para OBS en un solo lugar.',
        category: 'STREAMING Hub',
    });

    // Widget Management
    let selectedWidgetId = 'dynamic_qr';
    const widgets = [
        {
            id: 'dynamic_qr',
            name: 'Código QR Dinámico',
            icon: QrCode,
            description: 'Cambia el destino de tu QR en tiempo real.',
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
            id: 'chat_overlay',
            name: 'Chat Neo-Brutal',
            icon: MessageSquare,
            description: 'Muestra tu chat con estilo rompedor.',
            active: true,
        },
    ];

    let qrSettings = {
        targetUrl: '',
        fgColor: '#000000',
        bgColor: '#ffffff',
        title: '¡Escanea para entrar!',
    };

    let chatSettings = {
        channel: '',
        fontSize: 16,
        theme: 'light',
        showBadges: true,
        fontColor: '#000000',
        borderColor: '#000000',
        bgColor: '#ffffff',
        shadowColor: '#000000',
    };

    let loading = true;
    let saving = false;
    let lastSaved = Date.now();
    let copied = false;

    $: ready = $authStore.user?.uid ? true : false;
    $: widgetUrl = ready
        ? `${window.location.origin}/widgets/${selectedWidgetId === 'dynamic_qr' ? 'qr' : 'chat'}/${$authStore.user?.uid}`
        : 'Cargando URL...';

    onMount(() => {
        if (!$authStore.user?.uid) return;

        // Subscribe to QR settings
        const qrRef = doc(db, 'users', $authStore.user.uid, 'streamerSettings', 'dynamic_qr');
        const unsubQr = onSnapshot(qrRef, (docSnap) => {
            if (docSnap.exists()) {
                qrSettings = { ...qrSettings, ...docSnap.data() };
            }
        });

        // Subscribe to Chat settings
        const chatRef = doc(db, 'users', $authStore.user.uid, 'streamerSettings', 'chat_overlay');
        const unsubChat = onSnapshot(chatRef, (docSnap) => {
            if (docSnap.exists()) {
                chatSettings = { ...chatSettings, ...docSnap.data() };
            }
            loading = false;
        });

        return () => {
            unsubQr();
            unsubChat();
        };
    });

    async function saveSettings() {
        if (!$authStore.user?.uid) return;
        saving = true;
        try {
            const settingsRef = doc(
                db,
                'users',
                $authStore.user.uid,
                'streamerSettings',
                selectedWidgetId
            );
            const dataToSave = selectedWidgetId === 'dynamic_qr' ? qrSettings : chatSettings;
            await setDoc(
                settingsRef,
                {
                    ...dataToSave,
                    updatedAt: new Date(),
                },
                { merge: true }
            );
            lastSaved = Date.now();
        } catch (error) {
            console.error('Error saving settings:', error);
            addToast('Error al guardar los ajustes', 'error');
        } finally {
            saving = false;
        }
    }

    let debounceTimer: any;
    $: if ((qrSettings || chatSettings) && !loading) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            saveSettings();
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
</script>

<svelte:head>
    <title>Streamer Hub | ChillChess</title>
</svelte:head>

<ProGate>
    <div class="max-w-7xl mx-auto pb-20 px-4 md:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            <!-- Sidebar Selector -->
            <div class="lg:col-span-1 space-y-6">
                <div class="bg-black text-white border-4 border-black p-4 shadow-neo-sm">
                    <h3
                        class="flex items-center gap-2 font-black uppercase text-sm tracking-widest"
                    >
                        <LayoutDashboard class="w-4 h-4 text-primary" /> Tus Widgets
                    </h3>
                </div>

                <nav
                    class="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide"
                >
                    {#each widgets as widget}
                        <button
                            on:click={() => widget.active && (selectedWidgetId = widget.id)}
                            class="flex-shrink-0 group relative flex items-center gap-3 p-4 border-4 border-black transition-all w-64 lg:w-full text-left
                            {selectedWidgetId === widget.id
                                ? 'bg-primary shadow-neo translate-x-1 translate-y-1'
                                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-neo-sm'}
                            {!widget.active
                                ? 'opacity-50 cursor-not-allowed grayscale'
                                : 'cursor-pointer'}"
                        >
                            <div
                                class="p-2 bg-black text-white group-hover:bg-primary group-hover:text-black transition-colors"
                            >
                                <svelte:component this={widget.icon} size={20} />
                            </div>
                            <div class="flex-1">
                                <p class="font-black uppercase text-xs leading-none">
                                    {widget.name}
                                </p>
                                {#if !widget.active}
                                    <p class="text-[9px] font-bold text-slate-500 mt-1 italic">
                                        PRÓXIMAMENTE
                                    </p>
                                {:else}
                                    <p
                                        class="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1 line-clamp-1"
                                    >
                                        {widget.description}
                                    </p>
                                {/if}
                            </div>
                            {#if selectedWidgetId === widget.id}
                                <div class="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Sparkles class="w-4 h-4 text-black animate-pulse" />
                                </div>
                            {/if}
                        </button>
                    {/each}
                </nav>

                <div
                    class="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-dashed border-black p-4 text-[10px] font-bold italic text-yellow-800 dark:text-yellow-200"
                >
                    <p>
                        💡 Estamos construyendo más herramientas. ¿Alguna sugerencia? Escríbenos en
                        Discord.
                    </p>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="lg:col-span-3 space-y-8">
                {#if selectedWidgetId === 'dynamic_qr'}
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
                                        <div class="space-y-3">
                                            <label
                                                for="twitch-channel"
                                                class="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500"
                                            >
                                                <Sparkles class="w-4 h-4 text-primary" /> Canal de Twitch
                                            </label>
                                            <input
                                                id="twitch-channel"
                                                type="text"
                                                bind:value={chatSettings.channel}
                                                placeholder="nombre_del_canal"
                                                class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black p-5 text-lg font-black focus:outline-none focus:border-primary shadow-inner"
                                            />
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
                {:else}
                    <div
                        in:fade={{ duration: 200 }}
                        class="flex flex-col items-center justify-center min-h-[400px] border-4 border-dashed border-black opacity-40 bg-slate-50 dark:bg-slate-900/50"
                    >
                        <Sparkles size={48} class="mb-4 text-primary" />
                        <h3 class="text-2xl font-black uppercase tracking-tighter">Próximamente</h3>
                        <p class="font-bold text-sm">Estamos horneando nuevos widgets.</p>
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
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
