<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { addToast } from '$lib/stores/toasts';
    import { onMount } from 'svelte';
    import QRCode from 'qrcode';
    import { QrCode, Link, Type, Wifi, Download, Palette } from 'lucide-svelte';

    pageHeader.set({
        title: 'Generador QR',
        description: 'Crea códigos QR para URLs, texto y credenciales WiFi.',
        category: 'Utilidades',
    });

    type QRMode = 'url' | 'text' | 'wifi';

    let mode: QRMode = 'url';
    let urlInput = '';
    let textInput = '';
    let wifiSSID = '';
    let wifiPassword = '';
    let wifiEncryption: 'WPA' | 'WEP' | 'nopass' = 'WPA';
    let fgColor = '#ffffff';
    let bgColor = '#0f172a';
    let qrDataUrl = '';

    const modes = [
        { id: 'url' as QRMode, label: 'URL', icon: Link },
        { id: 'text' as QRMode, label: 'Texto', icon: Type },
        { id: 'wifi' as QRMode, label: 'WiFi', icon: Wifi },
    ];

    function getQRContent(): string {
        if (mode === 'url') return urlInput || 'https://example.com';
        if (mode === 'text') return textInput || 'Hello World';
        return `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`;
    }

    $: qrContent = getQRContent();

    $: if (qrContent) {
        QRCode.toDataURL(qrContent, {
            width: 256,
            margin: 2,
            color: { dark: fgColor, light: bgColor },
        })
            .then((url: string) => (qrDataUrl = url))
            .catch(() => {});
    }

    function downloadQR() {
        if (!qrDataUrl) return;
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = 'qr-code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast('QR descargado', 'success');
    }
</script>

<svelte:head>
    <title>Generador QR | MultiTool</title>
    <meta
        name="description"
        content="Genera códigos QR personalizados para URLs, texto plano y credenciales WiFi. Descarga en PNG."
    />
</svelte:head>

<div class="max-w-3xl mx-auto flex flex-col lg:flex-row gap-6">
    <!-- Left: Config -->
    <div class="flex-1 space-y-5">
        <!-- Mode Switcher -->
        <div
            class="flex bg-slate-800/80 rounded-2xl p-1.5 border border-slate-700/50 shadow-lg shadow-black/10"
        >
            {#each modes as m}
                <button
                    on:click={() => (mode = m.id)}
                    class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
                    class:bg-slate-700={mode === m.id}
                    class:text-white={mode === m.id}
                    class:shadow-md={mode === m.id}
                    class:text-slate-500={mode !== m.id}
                    class:hover:text-slate-300={mode !== m.id}
                >
                    <svelte:component this={m.icon} class="w-4 h-4" />
                    {m.label}
                </button>
            {/each}
        </div>

        <!-- Input Fields -->
        <div
            class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-lg shadow-black/10 space-y-4"
        >
            {#if mode === 'url'}
                <div>
                    <label
                        for="qr-url"
                        class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                        >URL</label
                    >
                    <input
                        id="qr-url"
                        type="url"
                        bind:value={urlInput}
                        placeholder="https://tu-sitio.com"
                        class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                </div>
            {:else if mode === 'text'}
                <div>
                    <label
                        for="qr-text"
                        class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                        >Texto</label
                    >
                    <textarea
                        id="qr-text"
                        bind:value={textInput}
                        placeholder="Escribe tu texto aquí..."
                        rows="4"
                        class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none"
                    ></textarea>
                </div>
            {:else}
                <div class="space-y-3">
                    <div>
                        <label
                            for="wifi-ssid"
                            class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                            >Nombre de Red (SSID)</label
                        >
                        <input
                            id="wifi-ssid"
                            type="text"
                            bind:value={wifiSSID}
                            placeholder="Mi WiFi"
                            class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                    </div>
                    <div>
                        <label
                            for="wifi-pass"
                            class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                            >Contraseña</label
                        >
                        <input
                            id="wifi-pass"
                            type="text"
                            bind:value={wifiPassword}
                            placeholder="Contraseña WiFi"
                            class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                    </div>
                    <div>
                        <label
                            for="wifi-enc"
                            class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                            >Encriptación</label
                        >
                        <select
                            id="wifi-enc"
                            bind:value={wifiEncryption}
                            class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        >
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">Sin contraseña</option>
                        </select>
                    </div>
                </div>
            {/if}
        </div>

        <!-- Color Config -->
        <div
            class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-lg shadow-black/10"
        >
            <h4
                class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"
            >
                <Palette class="w-3.5 h-3.5" /> Personalización
            </h4>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="fg-color" class="block text-xs text-slate-500 mb-1">Color QR</label>
                    <div class="flex items-center gap-2">
                        <input
                            id="fg-color"
                            type="color"
                            bind:value={fgColor}
                            class="w-10 h-10 rounded-lg cursor-pointer border border-slate-700"
                        />
                        <span class="text-xs font-mono text-slate-400">{fgColor}</span>
                    </div>
                </div>
                <div>
                    <label for="bg-color" class="block text-xs text-slate-500 mb-1">Fondo</label>
                    <div class="flex items-center gap-2">
                        <input
                            id="bg-color"
                            type="color"
                            bind:value={bgColor}
                            class="w-10 h-10 rounded-lg cursor-pointer border border-slate-700"
                        />
                        <span class="text-xs font-mono text-slate-400">{bgColor}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Right: Preview -->
    <div class="lg:w-72 flex flex-col gap-4">
        <div
            class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 flex flex-col items-center"
        >
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Vista Previa
            </p>
            {#if qrDataUrl}
                <div class="rounded-xl overflow-hidden shadow-lg">
                    <img src={qrDataUrl} alt="QR Code" class="w-[200px] h-[200px]" />
                </div>
            {:else}
                <div
                    class="w-[200px] h-[200px] bg-slate-700/30 rounded-xl flex items-center justify-center"
                >
                    <QrCode class="w-16 h-16 text-slate-600" />
                </div>
            {/if}
        </div>

        <button
            on:click={downloadQR}
            disabled={!qrDataUrl}
            class="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
        >
            <Download class="w-5 h-5" /> Descargar PNG
        </button>
    </div>
</div>
