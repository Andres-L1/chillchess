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
    <div class="relative max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
        <!-- Ambient Background Glows -->
        <div
            class="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
        ></div>
        <div
            class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
        ></div>

        <!-- Left: Config -->
        <div class="flex-1 space-y-6">
            <!-- Mode Switcher -->
            <div
                class="bg-black/40 backdrop-blur-2xl border border-white/10 shadow-sm rounded-2xl p-2 relative overflow-hidden"
            >
                <div
                    class="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"
                ></div>
                <div class="flex relative z-10 gap-1 sm:gap-2">
                    {#each modes as m}
                        <button
                            on:click={() => (mode = m.id)}
                            class="flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group {mode ===
                            m.id
                                ? 'text-white shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}"
                        >
                            {#if mode === m.id}
                                <div
                                    class="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                                ></div>
                            {/if}
                            <div class="relative z-10 flex items-center gap-2">
                                <svelte:component
                                    this={m.icon}
                                    class="w-4 h-4 {mode === m.id
                                        ? 'animate-pulse'
                                        : 'group-hover:scale-110 transition-transform'}"
                                />
                                <span>{m.label}</span>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- Input Fields -->
            <div
                class="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-sm relative overflow-hidden group/panel"
            >
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                ></div>

                <div class="space-y-5 relative z-10">
                    {#if mode === 'url'}
                        <div class="space-y-2">
                            <label
                                for="qr-url"
                                class="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                            >
                                <Link class="w-3.5 h-3.5 text-white" />
                                Dirección URL
                            </label>
                            <div class="relative group">
                                <div
                                    class="absolute -inset-0.5 bg-white/5 rounded-xl blur opacity-20 group-focus-within:opacity-50 transition duration-500 pointer-events-none"
                                ></div>
                                <input
                                    id="qr-url"
                                    type="url"
                                    bind:value={urlInput}
                                    placeholder="https://tu-sitio.com"
                                    class="relative w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 shadow-inner transition-all"
                                />
                            </div>
                        </div>
                    {:else if mode === 'text'}
                        <div class="space-y-2">
                            <label
                                for="qr-text"
                                class="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                            >
                                <Type class="w-3.5 h-3.5 text-white" />
                                Mensaje de Texto
                            </label>
                            <div class="relative group">
                                <div
                                    class="absolute -inset-0.5 bg-white/5 rounded-xl blur opacity-20 group-focus-within:opacity-50 transition duration-500 pointer-events-none"
                                ></div>
                                <textarea
                                    id="qr-text"
                                    bind:value={textInput}
                                    placeholder="Escribe tu texto aquí..."
                                    rows="4"
                                    class="relative w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 shadow-inner transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    {:else}
                        <div class="space-y-5">
                            <div class="space-y-2">
                                <label
                                    for="wifi-ssid"
                                    class="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                                >
                                    <Wifi class="w-3.5 h-3.5 text-white" />
                                    Nombre de Red (SSID)
                                </label>
                                <input
                                    id="wifi-ssid"
                                    type="text"
                                    bind:value={wifiSSID}
                                    placeholder="Mi WiFi"
                                    class="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 shadow-inner transition-all"
                                />
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div class="space-y-2">
                                    <label
                                        for="wifi-pass"
                                        class="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                                        >Contraseña</label
                                    >
                                    <input
                                        id="wifi-pass"
                                        type="text"
                                        bind:value={wifiPassword}
                                        placeholder="Contraseña WiFi"
                                        class="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 shadow-inner transition-all"
                                    />
                                </div>
                                <div class="space-y-2">
                                    <label
                                        for="wifi-enc"
                                        class="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                                        >Encriptación</label
                                    >
                                    <div class="relative">
                                        <select
                                            id="wifi-enc"
                                            bind:value={wifiEncryption}
                                            class="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 shadow-inner appearance-none transition-all cursor-pointer"
                                        >
                                            <option value="WPA" class="bg-black">WPA/WPA2</option>
                                            <option value="WEP" class="bg-black">WEP</option>
                                            <option value="nopass" class="bg-black"
                                                >Sin contraseña</option
                                            >
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Color Config -->
                <div
                    class="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-sm relative overflow-hidden flex flex-col h-full"
                >
                    <div
                        class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    ></div>

                    <h4
                        class="text-sm font-bold text-white tracking-wide mb-6 flex items-center gap-3 relative z-10"
                    >
                        <div
                            class="p-2 bg-white/10 text-white rounded-lg shadow-inner border border-white/20"
                        >
                            <Palette class="w-4 h-4" />
                        </div>
                        Personalizar Colores
                    </h4>

                    <div class="grid grid-cols-2 gap-4 flex-1 relative z-10">
                        <div class="space-y-2">
                            <label
                                for="fg-color"
                                class="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                                >Color QR</label
                            >
                            <div
                                class="bg-black/40 p-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-inner group"
                            >
                                <div
                                    class="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-sm transition-colors"
                                >
                                    <input
                                        id="fg-color"
                                        type="color"
                                        bind:value={fgColor}
                                        class="absolute inset-[-10px] w-20 h-20 cursor-pointer pointer-events-auto"
                                    />
                                </div>
                                <span class="text-xs font-mono text-slate-300 uppercase"
                                    >{fgColor}</span
                                >
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label
                                for="bg-color"
                                class="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                                >Fondo</label
                            >
                            <div
                                class="bg-black/40 p-2 rounded-2xl border border-white/10 flex items-center gap-3 shadow-inner group"
                            >
                                <div
                                    class="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-sm transition-colors"
                                >
                                    <input
                                        id="bg-color"
                                        type="color"
                                        bind:value={bgColor}
                                        class="absolute inset-[-10px] w-20 h-20 cursor-pointer pointer-events-auto"
                                    />
                                </div>
                                <span class="text-xs font-mono text-slate-300 uppercase"
                                    >{bgColor}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Logo / Custom Image -->
                <div
                    class="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-sm relative overflow-hidden flex flex-col h-full"
                >
                    <div
                        class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    ></div>

                    <h4
                        class="text-sm font-bold text-white tracking-wide mb-6 flex items-center gap-3 relative z-10"
                    >
                        <div
                            class="p-2 bg-white/10 text-white rounded-lg shadow-inner border border-white/20"
                        >
                            <Image class="w-4 h-4" />
                        </div>
                        Logo Central
                    </h4>

                    <div class="flex-1 relative z-10 flex flex-col justify-center">
                        {#if logoDataUrl}
                            <div class="space-y-5">
                                <!-- Logo preview -->
                                <div
                                    class="flex items-center gap-4 bg-black/40 p-3 rounded-2xl border border-white/10 shadow-inner"
                                >
                                    <div class="relative group">
                                        <div
                                            class="w-14 h-14 bg-white/5 backdrop-blur-md rounded-xl p-1.5 border border-white/10 shadow-sm flex items-center justify-center"
                                        >
                                            <img
                                                src={logoDataUrl}
                                                alt="Logo"
                                                class="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <button
                                            on:click={removeLogo}
                                            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all active:scale-90 border border-white/20"
                                            title="Eliminar logo"
                                        >
                                            <X class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div class="flex-1 overflow-hidden">
                                        <p
                                            class="text-sm text-slate-200 font-medium truncate"
                                            title={logoFile?.name}
                                        >
                                            {logoFile?.name}
                                        </p>
                                        <p class="text-xs font-mono text-slate-500 mt-0.5">
                                            {logoFile
                                                ? (logoFile.size / 1024).toFixed(1) + ' KB'
                                                : ''}
                                        </p>
                                    </div>
                                </div>

                                <!-- Logo size slider -->
                                <div class="space-y-3">
                                    <div class="flex items-center justify-between">
                                        <label
                                            for="logo-size"
                                            class="text-xs font-bold text-slate-400 uppercase tracking-wider"
                                            >Tamaño Logo</label
                                        >
                                        <span
                                            class="text-xs font-mono text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/20"
                                            >{logoSize}%</span
                                        >
                                    </div>
                                    <input
                                        id="logo-size"
                                        type="range"
                                        min="10"
                                        max="35"
                                        step="1"
                                        bind:value={logoSize}
                                        class="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-white border border-white/10 shadow-inner"
                                    />
                                    <div
                                        class="flex justify-between text-[10px] uppercase font-bold text-slate-600"
                                    >
                                        <span>Pequeño</span>
                                        <span>Grande</span>
                                    </div>
                                </div>
                            </div>
                        {:else}
                            <!-- Upload area -->
                            <label
                                for="logo-upload"
                                class="flex flex-col items-center justify-center gap-3 py-6 border border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all group bg-black/20 backdrop-blur-sm h-full max-h-[160px]"
                            >
                                <div
                                    class="w-12 h-12 rounded-xl bg-black/40 group-hover:bg-white/10 flex items-center justify-center transition-colors shadow-inner border border-white/10"
                                >
                                    <Upload
                                        class="w-5 h-5 text-slate-400 group-hover:text-white transition-colors group-hover:-translate-y-0.5 duration-300"
                                    />
                                </div>
                                <div class="text-center">
                                    <p
                                        class="text-sm font-bold text-slate-300 group-hover:text-white transition-colors"
                                    >
                                        Seleccionar Logo
                                    </p>
                                    <p
                                        class="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-semibold"
                                    >
                                        PNG, JPG, SVG • Máx 2MB
                                    </p>
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
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: Preview -->
        <div class="w-full lg:w-80 flex flex-col gap-6 lg:shrink-0 sticky top-24 pt-1 lg:pt-0">
            <div
                class="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-sm relative overflow-hidden flex flex-col items-center"
            >
                <div
                    class="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"
                ></div>
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                ></div>

                <p
                    class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10 flex items-center gap-2"
                >
                    <QrCode class="w-4 h-4 text-white" /> Vista Previa
                </p>

                <div class="relative z-10 flex flex-col items-center w-full">
                    {#if qrDataUrl}
                        <div class="relative group">
                            <div
                                class="absolute -inset-4 bg-gradient-to-br from-white/10 to-transparent rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500 pointer-events-none"
                            ></div>
                            <div
                                class="relative bg-white p-3 sm:p-4 rounded-2xl shadow-lg border border-white/20 overflow-hidden group-hover:scale-[1.02] transition-transform duration-300"
                            >
                                <img
                                    src={qrDataUrl}
                                    alt="QR Code"
                                    class="w-48 h-48 sm:w-56 sm:h-56 object-contain render-pixelated"
                                    style="image-rendering: pixelated;"
                                />
                            </div>
                        </div>

                        {#if logoDataUrl}
                            <div
                                class="flex items-center gap-2 mt-6 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-sm"
                            >
                                <div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                <span
                                    class="text-[11px] font-bold text-slate-300 uppercase tracking-wider"
                                    >Corrección H (Alta)</span
                                >
                            </div>
                        {/if}
                    {:else}
                        <div
                            class="w-48 h-48 sm:w-56 sm:h-56 bg-black/40 rounded-2xl flex flex-col items-center justify-center border border-dashed border-white/10 shadow-inner group/empty transition-colors hover:border-white/30"
                        >
                            <RotateCcw
                                class="w-12 h-12 text-slate-600 group-hover/empty:text-white/50 transition-colors group-hover/empty:animate-spin-slow mb-3"
                            />
                            <span
                                class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                                >Generando...</span
                            >
                        </div>
                    {/if}
                </div>
            </div>

            <button
                on:click={downloadQR}
                disabled={!qrDataUrl}
                class="w-full relative overflow-hidden group bg-white/10 hover:bg-white/20 disabled:bg-black/40 disabled:text-slate-500 text-white font-medium py-4 rounded-2xl transition-all shadow-sm active:scale-[0.98] border border-white/20 disabled:border-white/5 backdrop-blur-md"
            >
                {#if qrDataUrl}
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                    ></div>
                {/if}
                <div class="relative z-10 flex items-center justify-center gap-3 tracking-wide">
                    <Download class="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Descargar Imagen QR</span>
                </div>
            </button>
        </div>
    </div>
</ProGate>
