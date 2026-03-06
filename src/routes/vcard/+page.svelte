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
    <div class="flex flex-col lg:flex-row gap-8 relative max-w-5xl mx-auto">
        <!-- Ambient Background Glows -->
        <div
            class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] bg-brand-500/10 -z-10 mix-blend-screen pointer-events-none"
        ></div>
        <div
            class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] bg-purple-500/10 -z-10 mix-blend-screen pointer-events-none"
        ></div>

        <div class="flex-1 space-y-6">
            <div
                class="bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-700/50 shadow-2xl space-y-6 relative overflow-hidden"
            >
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
                ></div>

                <h3
                    class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6"
                >
                    <User class="w-4 h-4 text-brand-400" /> Datos Personales
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div
                        class="bg-slate-950/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner group"
                    >
                        <label
                            for="vcName"
                            class="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider"
                            >Nombre Completo</label
                        >
                        <div class="relative">
                            <div
                                class="absolute -inset-0.5 bg-brand-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"
                            ></div>
                            <User
                                class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10"
                            />
                            <input
                                id="vcName"
                                type="text"
                                bind:value={vcName}
                                placeholder="Ej. Ana García"
                                class="relative w-full bg-slate-900/80 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div
                        class="bg-slate-950/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner group"
                    >
                        <label
                            for="vcPhone"
                            class="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider"
                            >Teléfono</label
                        >
                        <div class="relative">
                            <div
                                class="absolute -inset-0.5 bg-brand-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"
                            ></div>
                            <Phone
                                class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10"
                            />
                            <input
                                id="vcPhone"
                                type="tel"
                                bind:value={vcPhone}
                                placeholder="+34 600 000 000"
                                class="relative w-full bg-slate-900/80 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div
                        class="bg-slate-950/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner group"
                    >
                        <label
                            for="vcCompany"
                            class="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider"
                            >Empresa</label
                        >
                        <div class="relative">
                            <div
                                class="absolute -inset-0.5 bg-brand-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"
                            ></div>
                            <Building2
                                class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10"
                            />
                            <input
                                id="vcCompany"
                                type="text"
                                bind:value={vcCompany}
                                placeholder="Ej. TechCorp"
                                class="relative w-full bg-slate-900/80 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div
                        class="bg-slate-950/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner group"
                    >
                        <label
                            for="vcTitle"
                            class="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider"
                            >Cargo / Puesto</label
                        >
                        <div class="relative">
                            <div
                                class="absolute -inset-0.5 bg-brand-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"
                            ></div>
                            <Briefcase
                                class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10"
                            />
                            <input
                                id="vcTitle"
                                type="text"
                                bind:value={vcTitle}
                                placeholder="Ej. Desarrollador Web"
                                class="relative w-full bg-slate-900/80 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                <div
                    class="bg-slate-950/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner group"
                >
                    <label
                        for="vcEmail"
                        class="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider"
                        >Correo Electrónico</label
                    >
                    <div class="relative">
                        <div
                            class="absolute -inset-0.5 bg-brand-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"
                        ></div>
                        <Mail
                            class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10"
                        />
                        <input
                            id="vcEmail"
                            type="email"
                            bind:value={vcEmail}
                            placeholder="ana@ejemplo.com"
                            class="relative w-full bg-slate-900/80 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all shadow-inner"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div class="w-full lg:w-96 flex flex-col gap-6">
            <!-- vCard Preview -->
            <div
                class="relative w-full aspect-[1.58/1] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col justify-between transition-all group border border-white/10"
            >
                <!-- Card Background -->
                <div class="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950"></div>
                <div
                    class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"
                ></div>

                <!-- Decorative Elements -->
                <div
                    class="absolute -right-16 -top-16 w-64 h-64 bg-brand-500 rounded-full blur-[80px] opacity-30 pointer-events-none group-hover:opacity-40 transition-opacity duration-700"
                ></div>
                <div
                    class="absolute -left-16 -bottom-16 w-48 h-48 bg-purple-500 rounded-full blur-[60px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-700"
                ></div>

                <div class="relative z-10 flex justify-between items-start">
                    <div
                        class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg"
                    >
                        <User class="w-7 h-7 text-white/90 drop-shadow-md" />
                    </div>
                    <div
                        class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm border border-white/10"
                    >
                        <Contact class="w-5 h-5 text-white/50" />
                    </div>
                </div>

                <div class="relative z-10 mt-auto">
                    <h4
                        class="font-black text-2xl tracking-wide truncate text-white drop-shadow-md"
                    >
                        {vcName || 'Tu Nombre'}
                    </h4>
                    <p
                        class="text-brand-300 text-sm font-bold truncate mb-4 drop-shadow-sm flex items-center gap-1.5 opacity-90"
                    >
                        {#if vcTitle}<Briefcase class="w-3.5 h-3.5" />{/if}
                        {vcTitle || 'Tu Cargo'}
                    </p>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2.5 text-xs text-white/80 font-medium">
                            <Building2 class="w-3.5 h-3.5 opacity-70" />
                            <span class="truncate">{vcCompany || 'Empresa'}</span>
                        </div>
                        <div class="flex items-center gap-2.5 text-xs text-white/80 font-medium">
                            <Phone class="w-3.5 h-3.5 opacity-70" />
                            <span class="truncate">{vcPhone || '+00 000 000 000'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div
                class="bg-slate-900/40 backdrop-blur-xl p-4 rounded-3xl border border-slate-700/50 shadow-xl relative overflow-hidden"
            >
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"
                ></div>

                <div class="grid grid-cols-2 gap-3 mb-3">
                    <button
                        on:click={downloadVCF}
                        class="bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-inner hover:shadow-lg border border-slate-700/50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider relative overflow-hidden group"
                    >
                        <div
                            class="absolute inset-0 bg-white/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"
                        ></div>
                        <Download class="w-4 h-4 text-brand-400 relative z-10" />
                        <span class="relative z-10">Guardar VCF</span>
                    </button>

                    <button
                        on:click={toggleQR}
                        class="bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-inner hover:shadow-lg border border-slate-700/50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider relative overflow-hidden group {qrVisible
                            ? 'ring-2 ring-brand-500/50 bg-slate-700'
                            : ''}"
                    >
                        <div
                            class="absolute inset-0 bg-white/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"
                        ></div>
                        <QrCode class="w-4 h-4 text-brand-400 relative z-10" />
                        <span class="relative z-10">{qrVisible ? 'Ocultar QR' : 'Mostrar QR'}</span>
                    </button>
                </div>

                <button
                    on:click={writeNFC}
                    disabled={!nfcSupported || isWritingNfc}
                    class="w-full relative overflow-hidden group bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700/50 active:scale-95 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] disabled:shadow-none flex items-center justify-center gap-3 text-sm tracking-widest uppercase border border-transparent disabled:cursor-not-allowed"
                    class:animate-pulse={isWritingNfc}
                >
                    {#if !(!nfcSupported || isWritingNfc)}
                        <div
                            class="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300"
                        ></div>
                    {/if}

                    <div class="relative z-10 flex items-center gap-2">
                        {#if isWritingNfc}
                            <Loader2 class="w-5 h-5 animate-spin" /> Acercar al chip...
                        {:else}
                            <Radio class="w-5 h-5" /> Escribir en NFC
                        {/if}
                    </div>
                </button>
                <p
                    class="text-center text-[10px] font-bold text-slate-500 mt-3 uppercase tracking-widest"
                >
                    {nfcStatusMsg}
                </p>
            </div>

            <!-- QR Display -->
            {#if qrVisible && qrDataUrl}
                <div
                    class="bg-slate-900/40 backdrop-blur-xl p-5 rounded-3xl border border-slate-700/50 shadow-xl flex flex-col items-center relative overflow-hidden animate-in slide-in-from-top-4 duration-300"
                >
                    <div
                        class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent"
                    ></div>
                    <p
                        class="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-4 flex items-center gap-2"
                    >
                        <QrCode class="w-3.5 h-3.5" /> Escanea para guardar
                    </p>
                    <div class="bg-white p-2 rounded-2xl shadow-inner border border-slate-700/30">
                        <img
                            src={qrDataUrl}
                            alt="QR Code"
                            class="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px]"
                        />
                    </div>
                </div>
            {/if}
        </div>
    </div>
</ProGate>
