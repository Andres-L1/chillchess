<script lang="ts">
    import { page } from '$app/stores';
    import { db } from '$lib/firebase';
    import { doc, onSnapshot } from 'firebase/firestore';
    import { onMount, tick } from 'svelte';
    import QRCode from 'qrcode';
    import { Loader2 } from 'lucide-svelte';
    import { fade } from 'svelte/transition';

    const { uid } = $page.params;

    let qrSettings = {
        targetUrl: '',
        fgColor: '#000000',
        bgColor: '#ffffff',
        title: '',
    };

    let qrDataUrl = '';
    let loading = true;
    let error = false;

    async function generateQR() {
        if (!qrSettings.targetUrl) {
            qrDataUrl = '';
            return;
        }
        try {
            const dataUrl = await QRCode.toDataURL(qrSettings.targetUrl, {
                width: 512,
                margin: 2,
                color: {
                    dark: qrSettings.fgColor,
                    light: qrSettings.bgColor,
                },
                errorCorrectionLevel: 'H',
            });
            qrDataUrl = dataUrl;
        } catch (e) {
            console.error('Error generating QR:', e);
        }
    }

    $: if (qrSettings.targetUrl || qrSettings.fgColor || qrSettings.bgColor) {
        generateQR();
    }

    onMount(() => {
        if (!uid) {
            error = true;
            loading = false;
            return;
        }

        const settingsRef = doc(db, 'users', uid, 'streamerSettings', 'dynamic_qr');

        const unsubscribe = onSnapshot(
            settingsRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    qrSettings = { ...qrSettings, ...docSnap.data() };
                } else {
                    // Default settings if none exist
                    qrSettings = {
                        targetUrl: 'https://chillchess.app',
                        fgColor: '#000000',
                        bgColor: '#ffffff',
                        title: '¡Escanea para entrar!',
                    };
                }
                loading = false;
            },
            (err) => {
                console.error('Firestore listener error:', err);
                error = true;
                loading = false;
            }
        );

        return () => unsubscribe();
    });
</script>

<svelte:head>
    <title>QR Widget | ChillChess</title>
</svelte:head>

<div class="h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
    {#if loading}
        <div in:fade class="flex flex-col items-center gap-4">
            <Loader2 class="w-12 h-12 text-black dark:text-white animate-spin" />
            <p
                class="font-black text-[10px] uppercase tracking-widest text-black dark:text-white bg-white/10 px-2 py-1"
            >
                Conectando...
            </p>
        </div>
    {:else if error}
        <div
            in:fade
            class="text-red-500 font-black text-xs uppercase text-center p-4 bg-white border-2 border-black"
        >
            Error: Widget no disponible
        </div>
    {:else if qrDataUrl}
        <div in:fade={{ duration: 300 }} class="flex flex-col items-center gap-4 group">
            {#if qrSettings.title}
                <div
                    class="bg-black text-white px-6 py-2 border-4 border-black shadow-neo-sm transform -rotate-1"
                >
                    <span class="text-lg font-black uppercase tracking-widest whitespace-nowrap">
                        {qrSettings.title}
                    </span>
                </div>
            {/if}

            <div
                class="relative bg-white p-6 border-[6px] border-black shadow-neo transform group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform overflow-hidden"
            >
                <img
                    src={qrDataUrl}
                    alt="Dynamic QR"
                    class="w-72 h-72 object-contain relative z-10"
                    style="image-rendering: auto;"
                />
                <!-- Ensure background is purely white for scanners -->
                <div class="absolute inset-0 bg-white -z-10"></div>
            </div>

            <!-- Neo-Brutalist Watermark -->
            <div class="flex flex-col items-center gap-2 mt-2">
                <div
                    class="bg-primary border-2 border-black px-3 py-0.5 shadow-neo-sm transform rotate-1"
                >
                    <span class="text-[10px] font-black uppercase tracking-tighter text-black">
                        chillchess.app
                    </span>
                </div>

                <div class="flex items-center gap-1.5 opacity-50">
                    <div class="w-1.5 h-1.5 bg-black rounded-full animate-ping"></div>
                    <span class="text-[7px] font-black uppercase tracking-[0.2em] text-black"
                        >Live Sync</span
                    >
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        background-color: transparent !important;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
</style>
