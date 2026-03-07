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
    <title>Generador QR | ChillChess</title>
    <meta
        name="description"
        content="Genera códigos QR personalizados para URLs, texto plano y credenciales WiFi. Añade tu logo y descarga en PNG."
    />
</svelte:head>

<ProGate>
    <div class="relative max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
        <!-- Ambient Background Glows -->
        <div
            class="absolute top-0 left-0 w-[500px] h-[500px] bg-neat-accent/5 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
        ></div>
        <div
            class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
        ></div>

        <!-- Left: Config -->
        <div class="flex-1 space-y-8">
            <!-- Mode Switcher -->
            <div class="glass-card p-2">
                <div class="flex gap-1.5">
                    {#each modes as m}
                        <button
                            on:click={() => (mode = m.id)}
                            class="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black transition-all duration-300 relative group {mode ===
                            m.id
                                ? 'text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                        >
                            {#if mode === m.id}
                                <div
                                    class="absolute inset-0 bg-neat-accent/10 border border-neat-accent/20 rounded-xl"
                                ></div>
                            {/if}
                            <div class="relative z-10 flex items-center gap-2">
                                <svelte:component
                                    this={m.icon}
                                    class="w-4 h-4 {mode === m.id
                                        ? 'text-neat-accent'
                                        : 'group-hover:scale-110 transition-transform'}"
                                />
                                <span class="uppercase tracking-tighter">{m.label}</span>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Input Fields -->
            <div class="glass-card p-8">
                <div class="space-y-6">
                    {#if mode === 'url'}
                        <div class="space-y-3">
                            <label
                                for="qr-url"
                                class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1"
                            >
                                <Link class="w-3.5 h-3.5 text-neat-accent" />
                                Dirección URL
                            </label>
                            <input
                                id="qr-url"
                                type="url"
                                bind:value={urlInput}
                                placeholder="https://tu-sitio.com"
                                class="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-neat-accent/30 transition-all font-medium"
                            />
                        </div>
                    {:else if mode === 'text'}
                        <div class="space-y-3">
                            <label
                                for="qr-text"
                                class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1"
                            >
                                <Type class="w-3.5 h-3.5 text-neat-accent" />
                                Mensaje de Texto
                            </label>
                            <textarea
                                id="qr-text"
                                bind:value={textInput}
                                placeholder="Escribe tu texto aquí..."
                                rows="4"
                                class="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-neat-accent/30 transition-all font-medium resize-none"
                            ></textarea>
                        </div>
                    {:else}
                        <div class="space-y-6">
                            <div class="space-y-3">
                                <label
                                    for="wifi-ssid"
                                    class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1"
                                >
                                    <Wifi class="w-3.5 h-3.5 text-neat-accent" />
                                    Nombre de Red (SSID)
                                </label>
                                <input
                                    id="wifi-ssid"
                                    type="text"
                                    bind:value={wifiSSID}
                                    placeholder="Mi WiFi"
                                    class="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-neat-accent/30 transition-all font-medium"
                                />
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div class="space-y-3">
                                    <label
                                        for="wifi-pass"
                                        class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1"
                                        >Contraseña</label
                                    >
                                    <input
                                        id="wifi-pass"
                                        type="text"
                                        bind:value={wifiPassword}
                                        placeholder="Contraseña WiFi"
                                        class="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-neat-accent/30 transition-all font-medium"
                                    />
                                </div>
                                <div class="space-y-3">
                                    <label
                                        for="wifi-enc"
                                        class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1"
                                        >Encriptación</label
                                    >
                                    <select
                                        id="wifi-enc"
                                        bind:value={wifiEncryption}
                                        class="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-neat-accent/30 transition-all font-medium cursor-pointer appearance-none"
                                    >
                                        <option value="WPA" class="bg-slate-900">WPA/WPA2</option>
                                        <option value="WEP" class="bg-slate-900">WEP</option>
                                        <option value="nopass" class="bg-slate-900"
                                            >Sin contraseña</option
                                        >
                                    </select>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Color Config -->
                <div class="glass-card p-8 flex flex-col">
                    <h4
                        class="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3"
                    >
                        <Palette class="w-4 h-4 text-neat-accent" />
                        Personalizar Colores
                    </h4>

                    <div class="grid grid-cols-2 gap-6 flex-1">
                        <div class="space-y-3">
                            <label
                                for="fg-color"
                                class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1"
                                >Color QR</label
                            >
                            <div class="flex items-center gap-3">
                                <input
                                    id="fg-color"
                                    type="color"
                                    bind:value={fgColor}
                                    class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                                />
                                <span class="font-mono text-xs text-white uppercase">{fgColor}</span
                                >
                            </div>
                        </div>

                        <div class="space-y-3">
                            <label
                                for="bg-color"
                                class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1"
                                >Fondo</label
                            >
                            <div class="flex items-center gap-3">
                                <input
                                    id="bg-color"
                                    type="color"
                                    bind:value={bgColor}
                                    class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 cursor-pointer overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
                                />
                                <span class="font-mono text-xs text-white uppercase">{bgColor}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Logo / Custom Image -->
                <div class="glass-card p-8 flex flex-col">
                    <h4
                        class="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3"
                    >
                        <Image class="w-4 h-4 text-neat-accent" />
                        Logo Central
                    </h4>

                    <div class="flex-1 flex flex-col justify-center">
                        {#if logoDataUrl}
                            <div class="space-y-6">
                                <div
                                    class="flex items-center gap-5 bg-black/20 p-4 rounded-2xl border border-white/5"
                                >
                                    <div class="relative group">
                                        <div
                                            class="w-16 h-16 bg-white/5 rounded-xl p-2 border border-white/10 flex items-center justify-center"
                                        >
                                            <img
                                                src={logoDataUrl}
                                                alt="Logo"
                                                class="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <button
                                            on:click={removeLogo}
                                            class="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white transition-all active:scale-90 border-2 border-slate-900"
                                        >
                                            <X class="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p
                                            class="text-sm text-white font-black truncate tracking-tighter"
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
                                        <span class="text-xs font-black text-neat-accent"
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
                                        class="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-neat-accent"
                                    />
                                </div>
                            </div>
                        {:else}
                            <label
                                for="logo-upload"
                                class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-neat-accent/30 hover:bg-neat-accent/5 transition-all group bg-black/10"
                            >
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div
                                        class="p-4 bg-neat-accent/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform"
                                    >
                                        <Upload class="w-6 h-6 text-neat-accent" />
                                    </div>
                                    <span
                                        class="text-xs font-black text-white uppercase tracking-widest"
                                        >Elegir Logo</span
                                    >
                                    <span class="text-[10px] text-slate-500 mt-2"
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
        <div class="w-full lg:w-96 flex flex-col gap-8 lg:shrink-0">
            <div class="glass-card p-8 flex flex-col items-center sticky top-24">
                <p
                    class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-2"
                >
                    <QrCode class="w-4 h-4 text-neat-accent" /> Vista Previa
                </p>

                <div class="relative flex flex-col items-center w-full">
                    {#if qrDataUrl}
                        <div class="relative group">
                            <!-- Glow effect -->
                            <div
                                class="absolute -inset-8 bg-neat-accent/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"
                            ></div>

                            <div
                                class="relative bg-white p-6 rounded-[2.5rem] shadow-2xl overflow-hidden group-hover:scale-[1.05] transition-transform duration-500"
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
                                class="flex items-center gap-3 mt-10 bg-neat-accent/10 border border-neat-accent/20 px-4 py-2 rounded-2xl"
                            >
                                <div
                                    class="w-2 h-2 rounded-full bg-neat-accent animate-pulse"
                                ></div>
                                <span
                                    class="text-[10px] font-black text-neat-accent uppercase tracking-widest"
                                    >Corrección Alta</span
                                >
                            </div>
                        {/if}
                    {:else}
                        <div
                            class="w-56 h-56 sm:w-64 sm:h-64 bg-black/20 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-white/5 animate-pulse"
                        >
                            <RotateCcw class="w-10 h-10 text-slate-700 mb-4" />
                            <span
                                class="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]"
                                >Generando...</span
                            >
                        </div>
                    {/if}
                </div>

                <div class="w-full mt-12 space-y-4">
                    <button
                        on:click={downloadQR}
                        disabled={!qrDataUrl}
                        class="w-full relative overflow-hidden group neat-button-primary py-5 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download class="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                        <span class="text-sm font-black uppercase tracking-tighter"
                            >Descargar QR</span
                        >
                    </button>

                    <p
                        class="text-[9px] text-center text-slate-500 font-black uppercase tracking-[0.2em]"
                    >
                        Format: PNG • High Resolution
                    </p>
                </div>
            </div>
        </div>
    </div>
</ProGate>
