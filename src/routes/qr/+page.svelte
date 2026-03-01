<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import QRCode from 'qrcode';
    import { Link, Type, Wifi, Download } from 'lucide-svelte';

    pageHeader.set({
        title: 'Generador QR',
        description: 'Crea códigos QR personalizados para URLs, WiFi, emails.',
        category: 'Utilidades',
    });

    let currentType: 'url' | 'text' | 'wifi' = 'url';

    let qrUrl = '';
    let qrText = '';
    let qrSsid = '';
    let qrPass = '';

    let colorDark = '#0f172a';
    let colorLight = '#ffffff';

    let qrDataUrl = '';

    $: {
        let data = '';
        if (currentType === 'url') {
            data = qrUrl.trim();
            if (data && !/^https?:\/\//i.test(data)) data = 'https://' + data;
        } else if (currentType === 'text') {
            data = qrText.trim();
        } else if (currentType === 'wifi' && qrSsid.trim()) {
            data = `WIFI:T:${qrPass.trim() ? 'WPA' : 'nopass'};S:${qrSsid.trim()};P:${qrPass.trim()};H:false;;`;
        }

        if (data) {
            QRCode.toDataURL(data, {
                width: 256,
                margin: 2,
                color: {
                    dark: colorDark,
                    light: colorLight,
                },
            })
                .then((url: string) => (qrDataUrl = url))
                .catch((err: Error) => console.error(err));
        } else {
            qrDataUrl = '';
        }
    }

    function downloadQR() {
        if (!qrDataUrl) return;
        const link = document.createElement('a');
        link.download = `Código_QR.png`;
        link.href = qrDataUrl;
        link.click();
    }
</script>

<svelte:head>
    <title>Generador QR | MultiTool</title>
</svelte:head>

<div class="flex flex-col lg:flex-row gap-8">
    <div class="flex-1 space-y-6">
        <div
            class="bg-slate-50 p-1.5 rounded-xl border border-slate-200 flex flex-wrap md:flex-nowrap gap-1"
        >
            <button
                on:click={() => (currentType = 'url')}
                class="flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-1 transition-all
                {currentType === 'url'
                    ? 'bg-white shadow-sm text-brand-600 border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700'}"
            >
                <Link class="w-4 h-4" /> URL
            </button>
            <button
                on:click={() => (currentType = 'text')}
                class="flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-1 transition-all
                {currentType === 'text'
                    ? 'bg-white shadow-sm text-brand-600 border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700'}"
            >
                <Type class="w-4 h-4" /> Texto
            </button>
            <button
                on:click={() => (currentType = 'wifi')}
                class="flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-1 transition-all
                {currentType === 'wifi'
                    ? 'bg-white shadow-sm text-brand-600 border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700'}"
            >
                <Wifi class="w-4 h-4" /> WiFi
            </button>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm min-h-[200px]">
            {#if currentType === 'url'}
                <div class="space-y-4">
                    <div>
                        <label
                            for="qrUrl"
                            class="block text-xs font-bold text-slate-400 uppercase mb-2"
                            >Dirección Web (URL)</label
                        >
                        <input
                            id="qrUrl"
                            type="url"
                            bind:value={qrUrl}
                            placeholder="https://ejemplo.com"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>
            {:else if currentType === 'text'}
                <div class="space-y-4">
                    <div>
                        <label
                            for="qrText"
                            class="block text-xs font-bold text-slate-400 uppercase mb-2"
                            >Texto Libre</label
                        >
                        <textarea
                            id="qrText"
                            bind:value={qrText}
                            placeholder="Mensaje..."
                            class="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                        ></textarea>
                    </div>
                </div>
            {:else if currentType === 'wifi'}
                <div class="space-y-4">
                    <div>
                        <label
                            for="qrSsid"
                            class="block text-xs font-bold text-slate-400 uppercase mb-2"
                            >Nombre Red (SSID)</label
                        >
                        <input
                            id="qrSsid"
                            type="text"
                            bind:value={qrSsid}
                            placeholder="Mi_Red"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                        />
                    </div>
                    <div>
                        <label
                            for="qrPass"
                            class="block text-xs font-bold text-slate-400 uppercase mb-2"
                            >Contraseña</label
                        >
                        <input
                            id="qrPass"
                            type="text"
                            bind:value={qrPass}
                            placeholder="***"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
                        />
                    </div>
                </div>
            {/if}
        </div>

        <div
            class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6"
        >
            <div class="flex items-center gap-3">
                <div
                    class="relative w-8 h-8 rounded-full shadow-sm border border-slate-200 overflow-hidden shrink-0"
                >
                    <label for="colorDark" class="sr-only">Color QR</label>
                    <!-- Tailwind doesn't have default reset for color inputs easily cross-browser, handle via custom css classes or inline -->
                    <input
                        id="colorDark"
                        type="color"
                        bind:value={colorDark}
                        class="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0"
                        style="opacity: 0;"
                    />
                    <div
                        class="w-full h-full pointer-events-none"
                        style="background-color: {colorDark}"
                    ></div>
                </div>
                <span class="text-sm font-medium text-slate-600">Color QR</span>
            </div>
            <div class="flex items-center gap-3">
                <div
                    class="relative w-8 h-8 rounded-full shadow-sm border border-slate-200 overflow-hidden shrink-0"
                >
                    <label for="colorLight" class="sr-only">Fondo QR</label>
                    <input
                        id="colorLight"
                        type="color"
                        bind:value={colorLight}
                        class="absolute -top-2 -left-2 w-16 h-16 cursor-pointer opacity-0"
                        style="opacity: 0;"
                    />
                    <div
                        class="w-full h-full pointer-events-none border border-slate-200"
                        style="background-color: {colorLight}"
                    ></div>
                </div>
                <span class="text-sm font-medium text-slate-600">Fondo</span>
            </div>
        </div>
    </div>

    <div class="lg:w-80 flex flex-col gap-4">
        <div
            class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden"
        >
            <div
                class="absolute -right-10 -top-10 w-40 h-40 bg-brand-100 rounded-full blur-3xl opacity-50 pointer-events-none"
            ></div>

            {#if qrDataUrl}
                <div
                    class="bg-white p-2 rounded-xl shadow-md z-10 transition-transform hover:scale-105 duration-300"
                >
                    <img
                        src={qrDataUrl}
                        alt="QR Result"
                        class="w-full h-auto max-w-[250px] rounded-lg block"
                    />
                </div>
            {:else}
                <p class="text-slate-400 text-sm text-center px-4 mt-4 z-10">
                    Ingresa datos para generar
                </p>
            {/if}
        </div>

        <div class="flex gap-3">
            <button
                on:click={downloadQR}
                disabled={!qrDataUrl}
                class="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Download class="w-5 h-5" /> Guardar Imagen
            </button>
        </div>
    </div>
</div>
