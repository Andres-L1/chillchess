<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { addToast } from '$lib/stores/toasts';
    import { onMount, tick } from 'svelte';
    import QRCode from 'qrcode';
    import {
        QrCode,
        Link,
        Type,
        Wifi,
        Download,
        Palette,
        Image,
        Upload,
        X,
        RotateCcw,
    } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';

    pageHeader.set({
        title: 'GENERADOR DE CÓDIGOS QR',
        description: 'Vínculos físicos y digitales. Diseñados con precisión quirúrgica.',
        category: 'UTILIDADES',
    });

    type QRMode = 'url' | 'text' | 'wifi';

    let mode: QRMode = 'url';
    let urlInput = '';
    let textInput = '';
    let wifiSSID = '';
    let wifiPassword = '';
    let wifiEncryption: 'WPA' | 'WEP' | 'nopass' = 'WPA';
    let fgColor = '#000000';
    let bgColor = '#ffffff';
    let qrDataUrl = '';

    // Logo / custom image
    let logoFile: File | null = null;
    let logoDataUrl: string | null = null;
    let logoSize = 20; // percentage of QR size
    let fileInput: HTMLInputElement;
    let canvas: HTMLCanvasElement;

    const modes = [
        { id: 'url' as QRMode, label: 'URL', icon: Link },
        { id: 'text' as QRMode, label: 'Texto', icon: Type },
        { id: 'wifi' as QRMode, label: 'WiFi', icon: Wifi },
    ];

    $: qrContent =
        mode === 'url'
            ? urlInput || 'https://example.com'
            : mode === 'text'
              ? textInput || 'Hello World'
              : `WIFI:T:${wifiEncryption};S:${wifiSSID};P:${wifiPassword};;`;

    // Regenerate QR when content, colors, or logo changes
    $: if (qrContent || fgColor || bgColor || logoDataUrl || logoSize) {
        generateQR();
    }

    async function generateQR() {
        try {
            // Use higher error correction when logo is present
            const errorCorrectionLevel = logoDataUrl ? 'H' : 'M';
            const size = 512; // Higher res for quality

            const dataUrl = await QRCode.toDataURL(qrContent, {
                width: size,
                margin: 2,
                color: { dark: fgColor, light: bgColor },
                errorCorrectionLevel,
            });

            if (logoDataUrl) {
                // Composite QR + logo on canvas
                qrDataUrl = await compositeQRWithLogo(dataUrl, logoDataUrl, size);
            } else {
                qrDataUrl = dataUrl;
            }
        } catch {
            // silently fail
        }
    }

    function compositeQRWithLogo(qrUrl: string, logoUrl: string, size: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const qrImg = new window.Image();
            qrImg.onload = () => {
                const logoImg = new window.Image();
                logoImg.onload = () => {
                    const offscreen = document.createElement('canvas');
                    offscreen.width = size;
                    offscreen.height = size;
                    const ctx = offscreen.getContext('2d');
                    if (!ctx) return reject('No canvas context');

                    // Draw QR
                    ctx.drawImage(qrImg, 0, 0, size, size);

                    // Calculate logo dimensions
                    const logoW = size * (logoSize / 100);
                    const logoH = logoW * (logoImg.height / logoImg.width);
                    const logoX = (size - logoW) / 2;
                    const logoY = (size - logoH) / 2;

                    // Draw white background behind logo (rounded rect)
                    const padding = logoW * 0.12;
                    const radius = logoW * 0.15;
                    ctx.fillStyle = bgColor;
                    ctx.beginPath();
                    const rx = logoX - padding;
                    const ry = logoY - padding;
                    const rw = logoW + padding * 2;
                    const rh = logoH + padding * 2;
                    ctx.moveTo(rx + radius, ry);
                    ctx.lineTo(rx + rw - radius, ry);
                    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
                    ctx.lineTo(rx + rw, ry + rh - radius);
                    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
                    ctx.lineTo(rx + radius, ry + rh);
                    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
                    ctx.lineTo(rx, ry + radius);
                    ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
                    ctx.closePath();
                    ctx.fill();

                    // Draw logo
                    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

                    resolve(offscreen.toDataURL('image/png'));
                };
                logoImg.onerror = () => reject('Logo load error');
                logoImg.src = logoUrl;
            };
            qrImg.onerror = () => reject('QR load error');
            qrImg.src = qrUrl;
        });
    }

    function handleLogoUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            addToast('Solo se permiten imágenes', 'error');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            addToast('La imagen no debe superar 2MB', 'error');
            return;
        }

        logoFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            logoDataUrl = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }

    function removeLogo() {
        logoFile = null;
        logoDataUrl = null;
        if (fileInput) fileInput.value = '';
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
    <title>Generador QR | ChillChess</title>
    <meta
        name="description"
        content="Genera códigos QR personalizados para URLs, texto plano y credenciales WiFi. Añade tu logo y descarga en PNG."
    />
</svelte:head>

<ProGate>
    <div class="relative max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">
        <!-- Left: Config -->
        <div class="flex-1 space-y-8">
            <!-- Mode Switcher -->
            <div class="bg-white dark:bg-slate-900 border-4 border-black p-2 shadow-neo-sm">
                <div class="flex gap-2">
                    {#each modes as m}
                        <button
                            on:click={() => (mode = m.id)}
                            class="flex-1 flex items-center justify-center gap-3 py-5 text-sm font-black transition-all relative group {mode ===
                            m.id
                                ? 'text-white'
                                : 'text-slate-500 hover:text-black dark:hover:text-white'}"
                        >
                            {#if mode === m.id}
                                <div
                                    class="absolute inset-0 bg-primary border-2 border-black shadow-neo-sm"
                                ></div>
                            {/if}
                            <div class="relative z-10 flex items-center gap-2">
                                <svelte:component
                                    this={m.icon}
                                    class="w-5 h-5 {mode === m.id
                                        ? 'text-white'
                                        : 'group-hover:scale-110 transition-transform'}"
                                />
                                <span class="uppercase tracking-widest">{m.label}</span>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Input Fields -->
            <div class="bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-10 shadow-neo">
                <div class="space-y-8">
                    {#if mode === 'url'}
                        <div class="space-y-4">
                            <label
                                for="qr-url"
                                class="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em]"
                            >
                                <Link class="w-4 h-4 text-primary" />
                                ENLACE URL
                            </label>
                            <input
                                id="qr-url"
                                type="url"
                                bind:value={urlInput}
                                placeholder="https://tu-sitio.com"
                                class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black px-6 py-5 text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary transition-all font-black text-lg shadow-inner"
                            />
                        </div>
                    {:else if mode === 'text'}
                        <div class="space-y-4">
                            <label
                                for="qr-text"
                                class="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em]"
                            >
                                <Type class="w-4 h-4 text-primary" />
                                CONTENIDO DE TEXTO
                            </label>
                            <textarea
                                id="qr-text"
                                bind:value={textInput}
                                placeholder="Escribe tu texto aquí..."
                                rows="5"
                                class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black px-6 py-5 text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary transition-all font-black text-lg shadow-inner resize-none"
                            ></textarea>
                        </div>
                    {:else}
                        <div class="space-y-8">
                            <div class="space-y-4">
                                <label
                                    for="wifi-ssid"
                                    class="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-[0.2em]"
                                >
                                    <Wifi class="w-4 h-4 text-primary" />
                                    IDENTIFICADOR DE RED (SSID)
                                </label>
                                <input
                                    id="wifi-ssid"
                                    type="text"
                                    bind:value={wifiSSID}
                                    placeholder="Mi WiFi"
                                    class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black px-6 py-5 text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary transition-all font-black text-lg shadow-inner"
                                />
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div class="space-y-4">
                                    <label
                                        for="wifi-pass"
                                        class="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]"
                                        >CONTRASEÑA</label
                                    >
                                    <input
                                        id="wifi-pass"
                                        type="text"
                                        bind:value={wifiPassword}
                                        placeholder="Contraseña WiFi"
                                        class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black px-6 py-5 text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-primary transition-all font-black text-lg shadow-inner"
                                    />
                                </div>
                                <div class="space-y-4">
                                    <label
                                        for="wifi-enc"
                                        class="block text-xs font-black text-slate-500 uppercase tracking-[0.2em]"
                                        >ENCRIPTACIÓN</label
                                    >
                                    <div class="relative">
                                        <select
                                            id="wifi-enc"
                                            bind:value={wifiEncryption}
                                            class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black px-6 py-5 text-black dark:text-white focus:outline-none focus:border-primary transition-all font-black text-lg shadow-inner appearance-none"
                                        >
                                            <option value="WPA">WPA/WPA2</option>
                                            <option value="WEP">WEP</option>
                                            <option value="nopass">SIN SEGURIDAD</option>
                                        </select>
                                        <div
                                            class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                        >
                                            <div
                                                class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-black dark:border-t-white"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <!-- Color Config -->
                <div
                    class="bg-white dark:bg-slate-900 border-4 border-black p-8 flex flex-col shadow-neo transform -rotate-1"
                >
                    <h4
                        class="text-xs font-black text-black dark:text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3"
                    >
                        <Palette class="w-5 h-5 text-primary" />
                        ESTÉTICA DEL CÓDIGO
                    </h4>

                    <div class="grid grid-cols-2 gap-8 flex-1">
                        <div class="space-y-4">
                            <label
                                for="fg-color"
                                class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
                                >PRIMARIO</label
                            >
                            <div class="flex items-center gap-4">
                                <input
                                    id="fg-color"
                                    type="color"
                                    bind:value={fgColor}
                                    class="w-14 h-14 border-4 border-black cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none shadow-neo-sm"
                                />
                                <span
                                    class="font-black text-sm text-black dark:text-white uppercase tabular-nums"
                                    >{fgColor}</span
                                >
                            </div>
                        </div>

                        <div class="space-y-4">
                            <label
                                for="bg-color"
                                class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
                                >FONDO</label
                            >
                            <div class="flex items-center gap-4">
                                <input
                                    id="bg-color"
                                    type="color"
                                    bind:value={bgColor}
                                    class="w-14 h-14 border-4 border-black cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none shadow-neo-sm"
                                />
                                <span
                                    class="font-black text-sm text-black dark:text-white uppercase tabular-nums"
                                    >{bgColor}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Logo / Custom Image -->
                <div
                    class="bg-white dark:bg-slate-900 border-4 border-black p-8 flex flex-col shadow-neo transform rotate-1"
                >
                    <h4
                        class="text-xs font-black text-black dark:text-white uppercase tracking-[0.2em] mb-10 flex items-center gap-3"
                    >
                        <Image class="w-5 h-5 text-primary" />
                        IDENTIDAD VISUAL
                    </h4>

                    <div class="flex-1 flex flex-col justify-center">
                        {#if logoDataUrl}
                            <div class="space-y-8">
                                <div
                                    class="flex items-center gap-6 bg-slate-50 dark:bg-slate-800 p-5 border-2 border-black shadow-neo-sm"
                                >
                                    <div class="relative group">
                                        <div
                                            class="w-20 h-20 bg-white border-2 border-black p-3 flex items-center justify-center"
                                        >
                                            <img
                                                src={logoDataUrl}
                                                alt="Logo"
                                                class="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <button
                                            on:click={removeLogo}
                                            class="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white border-2 border-black flex items-center justify-center transition-all active:scale-90"
                                        >
                                            <X class="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p
                                            class="text-base text-black dark:text-white font-black truncate uppercase tracking-tighter"
                                        >
                                            {logoFile?.name}
                                        </p>
                                        <p
                                            class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1"
                                        >
                                            {logoFile
                                                ? (logoFile.size / 1024).toFixed(1) + ' KB'
                                                : ''}
                                        </p>
                                    </div>
                                </div>

                                <div class="space-y-4">
                                    <div class="flex items-center justify-between">
                                        <label
                                            for="logo-scale"
                                            class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
                                            >Escala del Logo</label
                                        >
                                        <span class="text-sm font-black text-primary italic"
                                            >{logoSize}%</span
                                        >
                                    </div>
                                    <input
                                        id="logo-scale"
                                        type="range"
                                        min="10"
                                        max="35"
                                        step="1"
                                        bind:value={logoSize}
                                        class="w-full h-3 bg-slate-200 dark:bg-slate-700 border-2 border-black appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            </div>
                        {:else}
                            <label
                                for="logo-upload"
                                class="flex flex-col items-center justify-center w-full h-44 border-4 border-dashed border-black/20 dark:border-white/20 hover:border-primary/50 hover:bg-primary/5 transition-all group bg-slate-50 dark:bg-slate-800"
                            >
                                <div class="flex flex-col items-center justify-center">
                                    <div
                                        class="p-5 bg-white border-2 border-black shadow-neo-sm mb-5 group-hover:scale-110 transition-transform"
                                    >
                                        <Upload class="w-8 h-8 text-primary" />
                                    </div>
                                    <span
                                        class="text-sm font-black text-black dark:text-white uppercase tracking-widest"
                                        >Elegir Logo</span
                                    >
                                    <span
                                        class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3 italic"
                                        >PNG o SVG (Max 1MB)</span
                                    >
                                </div>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    class="hidden"
                                    accept="image/*"
                                    on:change={handleLogoUpload}
                                    bind:this={fileInput}
                                />
                            </label>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: Preview -->
        <div class="w-full lg:w-96 flex flex-col gap-10 lg:shrink-0">
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-10 flex flex-col items-center sticky top-24 shadow-neo"
            >
                <p
                    class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-12 flex items-center gap-3"
                >
                    <QrCode class="w-5 h-5 text-primary" /> VISTA PREVIA
                </p>

                <div class="relative flex flex-col items-center w-full">
                    {#if qrDataUrl}
                        <div class="relative group">
                            <div
                                class="relative bg-white p-8 border-4 border-black shadow-neo transform group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform"
                            >
                                <img
                                    src={qrDataUrl}
                                    alt="QR Code"
                                    class="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                                    style="image-rendering: auto;"
                                />
                            </div>
                        </div>

                        {#if logoDataUrl}
                            <div
                                class="flex items-center gap-3 mt-12 bg-primary text-white border-2 border-black px-5 py-3 shadow-neo-sm transform -rotate-1"
                            >
                                <div class="w-2.5 h-2.5 bg-white animate-pulse"></div>
                                <span
                                    class="text-[10px] font-black uppercase tracking-widest italic"
                                    >Corrección Máxima Activada</span
                                >
                            </div>
                        {/if}
                    {:else}
                        <div
                            class="w-56 h-56 sm:w-64 sm:h-64 bg-slate-100 dark:bg-slate-800 border-4 border-dashed border-black/20 flex flex-col items-center justify-center animate-pulse"
                        >
                            <RotateCcw class="w-12 h-12 text-slate-400 mb-5" />
                            <span
                                class="text-[10px] font-black text-slate-500 uppercase tracking-widest"
                                >Generando...</span
                            >
                        </div>
                    {/if}
                </div>

                <div class="w-full mt-16 space-y-6">
                    <button
                        on:click={downloadQR}
                        disabled={!qrDataUrl}
                        class="w-full py-6 bg-primary text-white border-4 border-black flex items-center justify-center gap-4 shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:shadow-none transition-all disabled:opacity-50"
                    >
                        <Download class="w-6 h-6" />
                        <span class="text-base font-black uppercase tracking-widest"
                            >Descargar QR</span
                        >
                    </button>

                    <p
                        class="text-[10px] text-center text-slate-500 font-black uppercase tracking-widest italic"
                    >
                        Formato: PNG • Alta Resolución
                    </p>
                </div>
            </div>
        </div>
    </div>
</ProGate>
