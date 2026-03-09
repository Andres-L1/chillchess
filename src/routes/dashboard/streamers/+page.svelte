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
    } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { fade, slide } from 'svelte/transition';

    pageHeader.set({
        title: 'WIDGETS PARA STREAMERS',
        description: 'Herramientas dinámicas para potenciar tu directo en tiempo real.',
        category: 'STREAMING',
    });

    let qrSettings = {
        targetUrl: '',
        fgColor: '#000000',
        bgColor: '#ffffff',
        title: '¡Escanea para entrar!',
    };

    let loading = true;
    let saving = false;
    let lastSaved = Date.now();
    let copied = false;

    $: widgetUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/widgets/qr/${$authStore.user?.uid}`
            : '';

    onMount(() => {
        if (!$authStore.user?.uid) return;

        const settingsRef = doc(db, 'users', $authStore.user.uid, 'streamerSettings', 'dynamic_qr');

        const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
                qrSettings = { ...qrSettings, ...docSnap.data() };
            }
            loading = false;
        });

        return () => unsubscribe();
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
                'dynamic_qr'
            );
            await setDoc(
                settingsRef,
                {
                    ...qrSettings,
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

    // Debounce manual save when inputs change
    let debounceTimer: any;
    $: if (qrSettings && !loading) {
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
    <title>Streamer Widgets | ChillChess</title>
</svelte:head>

<ProGate>
    <div class="max-w-6xl mx-auto space-y-12 pb-20">
        <!-- Hero Section OBS -->
        <div
            class="bg-black text-white border-4 border-black p-8 md:p-12 shadow-neo relative overflow-hidden group"
        >
            <div
                class="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"
            >
                <QrCode size={180} />
            </div>

            <div class="relative z-10 space-y-6 max-w-2xl">
                <div
                    class="inline-flex items-center gap-2 bg-primary text-black px-4 py-1 font-black text-xs uppercase tracking-widest shadow-neo-sm"
                >
                    First Widget
                </div>
                <h2 class="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                    Código QR <span class="text-primary italic text-6xl">Dinámico</span>
                </h2>
                <p class="text-lg text-slate-300 font-bold leading-tight">
                    Cambia el destino de tu QR en tiempo real mientras estás en directo. OBS se
                    actualizará automáticamente sin que tengas que tocar nada en el streaming.
                </p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <!-- Settings Panel -->
            <div class="lg:col-span-2 space-y-8">
                <section
                    class="bg-white dark:bg-slate-900 border-4 border-black p-8 shadow-neo relative"
                >
                    <div
                        class="absolute -top-5 -left-4 bg-yellow-300 border-2 border-black px-4 py-1 font-black text-xs flex items-center gap-2 shadow-neo-sm transform -rotate-1"
                    >
                        <Settings2 class="w-4 h-4" /> REGLAJE DEL WIDGET
                    </div>

                    <div class="space-y-8 mt-4">
                        <!-- URL Input -->
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
                            <p class="text-[10px] font-bold text-slate-400 italic">
                                Aquí es donde los espectadores irán al escanear el código.
                            </p>
                        </div>

                        <!-- Colors and Text -->
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
                                        <span class="block text-[10px] font-black text-center"
                                            >{qrSettings.fgColor}</span
                                        >
                                    </div>
                                    <div class="h-10 w-px bg-black opacity-20"></div>
                                    <div class="space-y-2">
                                        <input
                                            type="color"
                                            bind:value={qrSettings.bgColor}
                                            class="w-12 h-12 border-2 border-black cursor-pointer bg-transparent"
                                        />
                                        <span class="block text-[10px] font-black text-center"
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
                        class="mt-10 pt-6 border-t-2 border-black flex items-center justify-between"
                    >
                        <div
                            class="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"
                        >
                            {#if saving}
                                <div class="w-2 h-2 bg-primary animate-pulse rounded-full"></div>
                                Guardando en la nube...
                            {:else}
                                <Check class="w-3 h-3 text-green-500" />
                                Al día (Sincronizado)
                            {/if}
                        </div>
                        <span class="text-[9px] font-bold italic opacity-50"
                            >Cloud Sync: users/{$authStore.user?.uid}</span
                        >
                    </div>
                </section>
            </div>

            <!-- OBS Sidebar -->
            <div class="space-y-8">
                <section
                    class="bg-primary border-4 border-black p-8 shadow-neo-sm transform rotate-1"
                >
                    <h3
                        class="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3"
                    >
                        <ExternalLink class="w-6 h-6" /> Conexión OBS
                    </h3>

                    <div class="space-y-6">
                        <div class="bg-white p-4 border-2 border-black shadow-inner">
                            <p class="text-[10px] font-black uppercase mb-2">URL del Widget</p>
                            <div class="flex gap-2">
                                <input
                                    readonly
                                    value={widgetUrl}
                                    class="flex-1 bg-white text-black p-2 text-[10px] font-mono border-2 border-black focus:outline-none truncate"
                                />
                                <button
                                    on:click={copyToClipboard}
                                    class="p-2 bg-black text-white hover:bg-slate-800 transition-colors"
                                    title="Copiar URL"
                                >
                                    {#if copied}
                                        <Check class="w-4 h-4 text-primary" />
                                    {:else}
                                        <Copy class="w-4 h-4" />
                                    {/if}
                                </button>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <h4 class="text-xs font-black uppercase">Instrucciones:</h4>
                            <ol class="text-[10px] font-bold space-y-3 list-decimal pl-4">
                                <li>Copia la URL superior.</li>
                                <li>
                                    En OBS, añade una fuente de <span
                                        class="bg-white text-black px-1 border border-black font-black"
                                        >Navegador</span
                                    >.
                                </li>
                                <li>
                                    Pega la URL y ajusta el tamaño a <span
                                        class="bg-white text-black px-1 border border-black font-black"
                                        >300x400</span
                                    > (o similar).
                                </li>
                                <li>¡Listo! El QR se actualizará solo.</li>
                            </ol>
                        </div>

                        <a
                            href={widgetUrl}
                            target="_blank"
                            class="flex items-center justify-center gap-3 w-full py-4 bg-white border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-neo-sm active:translate-y-1"
                        >
                            Vista Previa <ExternalLink class="w-4 h-4" />
                        </a>
                    </div>
                </section>

                <div
                    class="bg-white dark:bg-slate-900 border-2 border-black p-4 text-[10px] font-bold italic text-slate-500"
                >
                    <p>
                        💡 Truco: Usa este widget para mostrar tu Discord, tu último vídeo o una
                        oferta flash sin tener que editar el overlay de OBS.
                    </p>
                </div>
            </div>
        </div>
    </div>
</ProGate>

<style>
    :global(input[type='color']) {
        padding: 0;
    }
</style>
