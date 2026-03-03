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
    <title>Generador QR | MultiTool</title>
    <meta
        name="description"
        content="Genera códigos QR personalizados para URLs, texto plano y credenciales WiFi. Añade tu logo y descarga en PNG."
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
                <Palette class="w-3.5 h-3.5" /> Colores
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

        <!-- Logo / Custom Image -->
        <div
            class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-lg shadow-black/10"
        >
            <h4
                class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"
            >
                <Image class="w-3.5 h-3.5" /> Logo Personalizado
            </h4>

            {#if logoDataUrl}
                <!-- Logo preview -->
                <div class="flex items-center gap-4 mb-4">
                    <div class="relative group">
                        <img
                            src={logoDataUrl}
                            alt="Logo"
                            class="w-16 h-16 object-contain rounded-xl border border-slate-700/50 bg-white/5 p-1"
                        />
                        <button
                            on:click={removeLogo}
                            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-90"
                        >
                            <X class="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm text-white font-medium truncate">{logoFile?.name}</p>
                        <p class="text-xs text-slate-500">
                            {logoFile ? (logoFile.size / 1024).toFixed(1) + ' KB' : ''}
                        </p>
                    </div>
                </div>

                <!-- Logo size slider -->
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <label for="logo-size" class="text-xs text-slate-500">Tamaño del logo</label
                        >
                        <span class="text-xs font-mono text-slate-400">{logoSize}%</span>
                    </div>
                    <input
                        id="logo-size"
                        type="range"
                        min="10"
                        max="35"
                        step="1"
                        bind:value={logoSize}
                        class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                    <div class="flex justify-between mt-1">
                        <span class="text-[10px] text-slate-600">Pequeño</span>
                        <span class="text-[10px] text-slate-600">Grande</span>
                    </div>
                </div>
            {:else}
                <!-- Upload area -->
                <label
                    for="logo-upload"
                    class="flex flex-col items-center justify-center gap-3 py-6 border-2 border-dashed border-slate-700/50 rounded-xl cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group"
                >
                    <div
                        class="w-12 h-12 rounded-xl bg-slate-700/40 group-hover:bg-brand-500/20 flex items-center justify-center transition-colors"
                    >
                        <Upload
                            class="w-5 h-5 text-slate-500 group-hover:text-brand-400 transition-colors"
                        />
                    </div>
                    <div class="text-center">
                        <p
                            class="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors"
                        >
                            Subir logo o imagen
                        </p>
                        <p class="text-xs text-slate-600 mt-1">PNG, JPG, SVG • Máx. 2MB</p>
                    </div>
                </label>
                <input
                    id="logo-upload"
                    bind:this={fileInput}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    on:change={handleLogoUpload}
                    class="hidden"
                />
            {/if}

            {#if logoDataUrl}
                <p class="text-[11px] text-slate-600 mt-3 leading-relaxed">
                    💡 Se usa corrección de errores alta (H) para que el QR siga siendo legible con
                    el logo encima. Si el logo es muy grande, reduce su tamaño.
                </p>
            {/if}
        </div>
    </div>

    <!-- Right: Preview -->
    <div class="w-full lg:w-72 flex flex-col gap-4">
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
                {#if logoDataUrl}
                    <div class="flex items-center gap-1.5 mt-3">
                        <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        <span class="text-[11px] text-slate-500">Corrección alta activa</span>
                    </div>
                {/if}
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
