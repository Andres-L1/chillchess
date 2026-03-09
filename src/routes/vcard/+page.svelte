<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { addToast } from '$lib/stores/toasts';
    import { onMount } from 'svelte';
    import QRCode from 'qrcode';
    import {
        User,
        Phone,
        Building2,
        Briefcase,
        Mail,
        Contact,
        Download,
        QrCode,
        Radio,
        Loader2,
    } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';

    pageHeader.set({
        title: 'Tarjeta Contacto',
        description: 'Genera una vCard (VCF), QR o graba en NFC.',
        category: 'Negocios',
    });

    let vcName = '';
    let vcPhone = '';
    let vcCompany = '';
    let vcTitle = '';
    let vcEmail = '';

    let qrVisible = false;
    let qrDataUrl = '';
    let nfcSupported = false;
    let isWritingNfc = false;
    let nfcStatusMsg = '';

    onMount(() => {
        if ('NDEFReader' in window) {
            nfcSupported = true;
            nfcStatusMsg = 'NFC Soportado.';
        } else {
            nfcSupported = false;
            nfcStatusMsg = 'NFC no soportado (Solo Android Chrome).';
        }
    });

    function generateVCFString() {
        const name = vcName.trim() || 'Contacto';
        const parts = name.split(' ');
        const lastName = parts.length > 1 ? parts.pop() : '';
        const firstName = parts.join(' ');

        let vcf = `BEGIN:VCARD\nVERSION:3.0\nN:${lastName};${firstName};;;\nFN:${name}\n`;
        if (vcCompany) vcf += `ORG:${vcCompany}\n`;
        if (vcTitle) vcf += `TITLE:${vcTitle}\n`;
        if (vcPhone) vcf += `TEL;TYPE=CELL,VOICE:${vcPhone}\n`;
        if (vcEmail) vcf += `EMAIL;TYPE=WORK,INTERNET:${vcEmail}\n`;
        vcf += `END:VCARD`;
        return vcf;
    }

    async function toggleQR() {
        if (!vcName && !vcPhone) {
            addToast('Escribe nombre o teléfono primero', 'error');
            return;
        }

        qrVisible = !qrVisible;
        if (qrVisible) {
            try {
                qrDataUrl = await QRCode.toDataURL(generateVCFString(), {
                    width: 180,
                    margin: 2,
                    color: { dark: '#ffffff', light: '#0f172a' },
                });
            } catch {
                addToast('Error al generar QR', 'error');
                qrVisible = false;
            }
        }
    }

    $: if (qrVisible && (vcName || vcPhone || vcCompany || vcTitle || vcEmail)) {
        QRCode.toDataURL(generateVCFString(), {
            width: 180,
            margin: 2,
            color: { dark: '#ffffff', light: '#0f172a' },
        }).then((url: string) => (qrDataUrl = url));
    }

    function downloadVCF() {
        if (!vcName) {
            addToast('Al menos escribe un nombre', 'error');
            return;
        }
        const blob = new Blob([generateVCFString()], { type: 'text/vcard;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${vcName.replace(/\s+/g, '_')}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    async function writeNFC() {
        if (!vcName) {
            addToast('Escribe un nombre', 'error');
            return;
        }
        try {
            isWritingNfc = true;
            // @ts-ignore NDEFReader is experimental
            const ndef = new NDEFReader();
            await ndef.write({
                records: [
                    {
                        recordType: 'mime',
                        mediaType: 'text/vcard',
                        data: new TextEncoder().encode(generateVCFString()),
                    },
                ],
            });
            addToast('Grabado en NFC', 'success');
        } catch (error: any) {
            if (error.name === 'NotAllowedError') addToast('Permiso denegado.', 'error');
            else addToast(`Error: ${error.message}`, 'error');
        } finally {
            isWritingNfc = false;
        }
    }
</script>

<svelte:head>
    <title>Tarjeta de Contacto | ChillChess</title>
    <meta
        name="description"
        content="Genera tarjetas de contacto digitales vCard, códigos QR y graba en NFC. Comparte tu información al instante."
    />
</svelte:head>

<ProGate>
    <div
        class="min-h-screen bg-background-light dark:bg-background-dark px-6 py-12 relative overflow-hidden"
    >
        <div class="max-w-7xl mx-auto">
            <!-- Hero Heading -->
            <div class="mb-16 text-center lg:text-left">
                <div
                    class="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-white dark:bg-slate-800 shadow-neo-sm mb-8"
                >
                    <span
                        class="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white"
                        >Identidad Digital</span
                    >
                </div>
                <h1
                    class="text-[clamp(3rem,8vw,8rem)] font-black tracking-tighter leading-[0.85] mb-8 text-black dark:text-white uppercase italic"
                >
                    Tu identidad. <br />
                    <span class="text-primary italic">En un código.</span>
                </h1>
                <p
                    class="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-bold max-w-xl leading-tight mx-auto lg:mx-0"
                >
                    Genera tu tarjeta de contacto definitiva.<br />
                    <span class="text-black dark:text-white">vCard, QR o NFC al instante.</span>
                </p>
            </div>

            <div class="flex flex-col lg:flex-row gap-8 items-stretch">
                <!-- Form Area -->
                <div class="flex-1">
                    <div
                        class="bg-white dark:bg-slate-900 border-4 border-black p-8 md:p-12 shadow-neo space-y-10"
                    >
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <!-- Input Groups -->
                            <div class="space-y-3">
                                <label
                                    for="vcName"
                                    class="text-xs font-black uppercase tracking-widest text-black dark:text-white block ml-1"
                                    >Nombre Completo</label
                                >
                                <div class="relative group">
                                    <input
                                        id="vcName"
                                        type="text"
                                        bind:value={vcName}
                                        placeholder="Ej. Ana García"
                                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-lg font-black text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all shadow-neo-sm"
                                    />
                                    <User
                                        class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black dark:text-white"
                                    />
                                </div>
                            </div>

                            <div class="space-y-3">
                                <label
                                    for="vcPhone"
                                    class="text-xs font-black uppercase tracking-widest text-black dark:text-white block ml-1"
                                    >Teléfono Móvil</label
                                >
                                <div class="relative group">
                                    <input
                                        id="vcPhone"
                                        type="tel"
                                        bind:value={vcPhone}
                                        placeholder="+34 600 000 000"
                                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-lg font-black text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all shadow-neo-sm"
                                    />
                                    <Phone
                                        class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black dark:text-white"
                                    />
                                </div>
                            </div>

                            <div class="space-y-3">
                                <label
                                    for="vcCompany"
                                    class="text-xs font-black uppercase tracking-widest text-black dark:text-white block ml-1"
                                    >Empresa</label
                                >
                                <div class="relative group">
                                    <input
                                        id="vcCompany"
                                        type="text"
                                        bind:value={vcCompany}
                                        placeholder="Ej. TechCorp"
                                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-lg font-black text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all shadow-neo-sm"
                                    />
                                    <Building2
                                        class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black dark:text-white"
                                    />
                                </div>
                            </div>

                            <div class="space-y-3">
                                <label
                                    for="vcTitle"
                                    class="text-xs font-black uppercase tracking-widest text-black dark:text-white block ml-1"
                                    >Cargo</label
                                >
                                <div class="relative group">
                                    <input
                                        id="vcTitle"
                                        type="text"
                                        bind:value={vcTitle}
                                        placeholder="Ej. Senior Developer"
                                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-lg font-black text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all shadow-neo-sm"
                                    />
                                    <Briefcase
                                        class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <label
                                for="vcEmail"
                                class="text-xs font-black uppercase tracking-widest text-black dark:text-white block ml-1"
                                >Email Profesional</label
                            >
                            <div class="relative group">
                                <input
                                    id="vcEmail"
                                    type="email"
                                    bind:value={vcEmail}
                                    placeholder="ana@corporacion.com"
                                    class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-lg font-black text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all shadow-neo-sm"
                                />
                                <Mail
                                    class="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black dark:text-white"
                                />
                            </div>
                        </div>

                        <div class="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <button
                                on:click={downloadVCF}
                                class="flex items-center justify-center gap-3 px-8 py-5 bg-white dark:bg-slate-800 border-4 border-black text-black dark:text-white font-black uppercase tracking-widest hover:-translate-y-1 active:translate-x-1 active:translate-y-1 transition-all shadow-neo group"
                            >
                                <Download
                                    class="w-5 h-5 text-primary group-hover:scale-110 transition-transform"
                                />
                                DESCARGAR VCF
                            </button>
                            <button
                                on:click={toggleQR}
                                class="flex items-center justify-center gap-3 px-8 py-5 border-4 border-black font-black uppercase tracking-widest hover:-translate-y-1 active:translate-x-1 active:translate-y-1 transition-all shadow-neo group {qrVisible
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-slate-800 text-black dark:text-white'}"
                            >
                                <QrCode
                                    class="w-5 h-5 {qrVisible
                                        ? 'text-white'
                                        : 'text-primary'} group-hover:rotate-12 transition-transform"
                                />
                                {qrVisible ? 'OCULTAR QR' : 'GENERAR QR'}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Preview Area -->
                <div class="w-full lg:w-96 flex flex-col gap-8">
                    <!-- Physical Card Preview -->
                    <div
                        class="relative w-full aspect-[1.58/1] bg-black border-4 border-black p-8 flex flex-col justify-between overflow-hidden shadow-neo transition-all duration-300 hover:-translate-y-2 group"
                    >
                        <!-- Digital Pattern Background -->
                        <div
                            class="absolute inset-0 opacity-10 pointer-events-none overflow-hidden"
                        >
                            <div
                                class="absolute inset-0"
                                style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"
                            ></div>
                        </div>

                        <div class="relative z-10 flex justify-between items-start">
                            <div
                                class="w-12 h-12 bg-white text-black border-2 border-black flex items-center justify-center shadow-neo-sm"
                            >
                                <User class="w-6 h-6" />
                            </div>
                            <div
                                class="text-[8px] font-black tracking-[0.5em] text-white/40 uppercase italic"
                            >
                                Digital ID
                            </div>
                        </div>

                        <div class="relative z-10">
                            <div
                                class="text-3xl font-black tracking-tighter truncate uppercase italic text-white"
                            >
                                {vcName || 'Tu Nombre'}
                            </div>
                            <div
                                class="text-[10px] font-black tracking-widest text-primary uppercase"
                            >
                                {vcTitle || 'Tu Cargo'}
                            </div>
                        </div>

                        <div
                            class="relative z-10 flex border-t-2 border-white/10 pt-6 mt-4 justify-between items-end"
                        >
                            <div class="space-y-1">
                                <div
                                    class="text-[8px] font-black text-white/50 uppercase tracking-widest"
                                >
                                    {vcCompany || 'Tu Empresa'}
                                </div>
                                <div
                                    class="text-[8px] font-black text-white/50 uppercase tracking-widest"
                                >
                                    {vcPhone || '+34 000 000 000'}
                                </div>
                            </div>
                            <div
                                class="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center animate-pulse"
                            >
                                <div class="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <!-- NFC Action -->
                    <div
                        class="bg-white dark:bg-slate-900 border-4 border-black p-8 shadow-neo space-y-6"
                    >
                        <button
                            on:click={writeNFC}
                            disabled={!nfcSupported || isWritingNfc}
                            class="w-full flex items-center justify-center gap-4 px-8 py-6 bg-black text-white dark:bg-white dark:text-black border-4 border-black font-black uppercase tracking-[0.2em] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 transition-all shadow-neo disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {#if isWritingNfc}
                                <Loader2 class="w-6 h-6 animate-spin text-primary" /> ESCRIBIENDO...
                            {:else}
                                <Radio
                                    class="w-6 h-6 text-primary group-hover:scale-110 transition-transform"
                                /> GRABAR EN NFC
                            {/if}
                        </button>

                        <div class="flex items-center justify-center gap-3">
                            <div
                                class="w-2 h-2 rounded-full {nfcSupported
                                    ? 'bg-primary'
                                    : 'bg-red-500'} shadow-sm"
                            ></div>
                            <span
                                class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest"
                                >{nfcStatusMsg}</span
                            >
                        </div>
                    </div>

                    <!-- QR Visualization -->
                    {#if qrVisible && qrDataUrl}
                        <div
                            class="bg-white border-4 border-black p-10 flex flex-col items-center gap-8 shadow-neo-lg animate-in zoom-in-95 duration-300"
                        >
                            <div class="bg-white p-6 border-4 border-black shadow-neo-sm">
                                <img src={qrDataUrl} alt="QR Code" class="w-48 h-48 image-pixels" />
                            </div>
                            <span
                                class="text-[10px] font-black text-black uppercase tracking-[0.4em] italic"
                                >Escaneo Seguro</span
                            >
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</ProGate>

<style>
    .image-pixels {
        image-rendering: pixelated;
    }
</style>
