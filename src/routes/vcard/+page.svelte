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
    <title>Tarjeta de Contacto | MultiTool</title>
    <meta
        name="description"
        content="Genera tarjetas de contacto digitales vCard, códigos QR y graba en NFC. Comparte tu información al instante."
    />
</svelte:head>

<div class="flex flex-col lg:flex-row gap-8">
    <div class="flex-1 space-y-6">
        <div
            class="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 shadow-lg shadow-black/10 space-y-4"
        >
            <h3
                class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2"
            >
                Datos Personales
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="vcName" class="block text-xs font-bold text-slate-400 mb-1"
                        >Nombre Completo</label
                    >
                    <div class="relative">
                        <User
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                        />
                        <input
                            id="vcName"
                            type="text"
                            bind:value={vcName}
                            placeholder="Ej. Ana García"
                            class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label for="vcPhone" class="block text-xs font-bold text-slate-400 mb-1"
                        >Teléfono</label
                    >
                    <div class="relative">
                        <Phone
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                        />
                        <input
                            id="vcPhone"
                            type="tel"
                            bind:value={vcPhone}
                            placeholder="+34 600 000 000"
                            class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="vcCompany" class="block text-xs font-bold text-slate-400 mb-1"
                        >Empresa</label
                    >
                    <div class="relative">
                        <Building2
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                        />
                        <input
                            id="vcCompany"
                            type="text"
                            bind:value={vcCompany}
                            placeholder="Ej. TechCorp"
                            class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label for="vcTitle" class="block text-xs font-bold text-slate-400 mb-1"
                        >Cargo / Puesto</label
                    >
                    <div class="relative">
                        <Briefcase
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                        />
                        <input
                            id="vcTitle"
                            type="text"
                            bind:value={vcTitle}
                            placeholder="Ej. Desarrollador Web"
                            class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                    </div>
                </div>
            </div>
            <div>
                <label for="vcEmail" class="block text-xs font-bold text-slate-400 mb-1"
                    >Correo Electrónico</label
                >
                <div class="relative">
                    <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        id="vcEmail"
                        type="email"
                        bind:value={vcEmail}
                        placeholder="ana@ejemplo.com"
                        class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                </div>
            </div>
        </div>
    </div>

    <div class="w-full lg:w-80 flex flex-col gap-6">
        <div
            class="relative w-full aspect-[1.58/1] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 sm:p-5 flex flex-col justify-between transition-all"
        >
            <div
                class="absolute -right-10 -top-10 w-40 h-40 bg-brand-500 rounded-full blur-3xl opacity-20 pointer-events-none"
            ></div>
            <div class="relative z-10 flex justify-between items-start">
                <div
                    class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20"
                >
                    <User class="w-5 h-5 text-white/80" />
                </div>
                <Contact class="w-6 h-6 text-white/30" />
            </div>
            <div class="relative z-10 mt-auto">
                <h4 class="font-bold text-xl tracking-wide truncate">{vcName || 'Tu Nombre'}</h4>
                <p class="text-brand-300 text-sm font-medium truncate mb-2">
                    {vcTitle || 'Tu Cargo'}
                </p>
                <div class="flex flex-col gap-1 mt-3">
                    <div class="flex items-center gap-2 text-xs text-white/70">
                        <Building2 class="w-3 h-3" />
                        <span class="truncate">{vcCompany || 'Empresa'}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-white/70">
                        <Phone class="w-3 h-3" />
                        <span class="truncate">{vcPhone || '+00 000 000 000'}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <button
                on:click={downloadVCF}
                class="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md border border-slate-700/50 flex flex-col items-center justify-center gap-1 text-xs"
            >
                <Download class="w-5 h-5 mb-1" /> Guardar .vcf
            </button>
            <button
                on:click={toggleQR}
                class="bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex flex-col items-center justify-center gap-1 text-xs"
            >
                <QrCode class="w-5 h-5 mb-1" />
                {qrVisible ? 'Ocultar QR' : 'Mostrar QR'}
            </button>
            <button
                on:click={writeNFC}
                disabled={!nfcSupported || isWritingNfc}
                class="col-span-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                class:animate-pulse={isWritingNfc}
            >
                {#if isWritingNfc}
                    <Loader2 class="w-5 h-5 animate-spin" /> Acercar al chip...
                {:else}
                    <Radio class="w-5 h-5" /> Escribir en Tag NFC
                {/if}
            </button>
            <p class="col-span-2 text-center text-xs text-slate-500 mt-1">{nfcStatusMsg}</p>
        </div>

        {#if qrVisible && qrDataUrl}
            <div
                class="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-700/50 shadow-lg shadow-black/10 flex flex-col items-center"
            >
                <p class="text-xs font-bold text-slate-500 uppercase mb-3 text-center">
                    Escanea para guardar
                </p>
                <div class="rounded-xl overflow-hidden">
                    <img src={qrDataUrl} alt="QR Code" class="w-[180px] h-[180px]" />
                </div>
            </div>
        {/if}
    </div>
</div>
