<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { Palette, Upload, Image as ImageIcon, Copy, Check, RefreshCw } from 'lucide-svelte';
    import { onMount } from 'svelte';

    pageHeader.set({
        title: 'ESTUDIO DE COLOR',
        description: 'Generación de paletas armónicas y extracción de espectro visual.',
        category: 'DISEÑO',
    });

    let baseColor = '#3b82f6';
    let generatedPalette: string[] = [];
    let imageSrc: string | null = null;
    let extractedColors: string[] = [];
    let isExtracting = false;
    let copiedColor: string | null = null;
    let fileInput: HTMLInputElement;

    // --- Color Generation Logic (Hex -> HSL variations) ---
    function hexToHSL(hex: string) {
        let r = 0,
            g = 0,
            b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        if (delta == 0) h = 0;
        else if (cmax == r) h = ((g - b) / delta) % 6;
        else if (cmax == g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;

        h = Math.round(h * 60);
        if (h < 0) h += 360;
        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return { h, s, l };
    }

    function HSLToHex(h: number, s: number, l: number) {
        s /= 100;
        l /= 100;
        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
            m = l - c / 2,
            r = 0,
            g = 0,
            b = 0;

        if (0 <= h && h < 60) {
            r = c;
            g = x;
            b = 0;
        } else if (60 <= h && h < 120) {
            r = x;
            g = c;
            b = 0;
        } else if (120 <= h && h < 180) {
            r = 0;
            g = c;
            b = x;
        } else if (180 <= h && h < 240) {
            r = 0;
            g = x;
            b = c;
        } else if (240 <= h && h < 300) {
            r = x;
            g = 0;
            b = c;
        } else if (300 <= h && h < 360) {
            r = c;
            g = 0;
            b = x;
        }

        let rHex = Math.round((r + m) * 255)
            .toString(16)
            .padStart(2, '0');
        let gHex = Math.round((g + m) * 255)
            .toString(16)
            .padStart(2, '0');
        let bHex = Math.round((b + m) * 255)
            .toString(16)
            .padStart(2, '0');

        return `#${rHex}${gHex}${bHex}`;
    }

    function generatePalette() {
        const { h, s, l } = hexToHSL(baseColor);
        generatedPalette = [
            HSLToHex(h, s, Math.max(l - 30, 10)),
            HSLToHex(h, s, Math.max(l - 15, 20)),
            baseColor,
            HSLToHex(h, Math.max(s - 20, 10), Math.min(l + 15, 90)),
            HSLToHex((h + 180) % 360, s, l), // Complementary
        ];
    }

    $: baseColor && generatePalette();

    // --- Image Extraction Logic ---
    function handleImageUpload(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        isExtracting = true;
        const reader = new FileReader();
        reader.onload = (event) => {
            imageSrc = event.target?.result as string;
            extractColorsFromImage(imageSrc);
        };
        reader.readAsDataURL(file);
    }

    function extractColorsFromImage(src: string) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Resize to max 200x200 to speed up processing
            const maxDim = 200;
            let width = img.width;
            let height = img.height;
            if (width > height) {
                if (width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                }
            } else {
                if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height).data;
            const colorCounts: Record<string, number> = {};

            // Sample pixels (every 4th pixel for speed)
            for (let i = 0; i < imageData.length; i += 16) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const a = imageData[i + 3];

                if (a < 128) continue; // Ignore transparent

                // Quantize colors to reduce exact matches (Bucket by 32)
                const qR = Math.round(r / 32) * 32;
                const qG = Math.round(g / 32) * 32;
                const qB = Math.round(b / 32) * 32;

                const hex = `#${qR.toString(16).padStart(2, '0')}${qG.toString(16).padStart(2, '0')}${qB.toString(16).padStart(2, '0')}`;
                // Keep true color for the bucket
                const trueHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

                if (!colorCounts[trueHex]) {
                    colorCounts[trueHex] = 0;
                }
                colorCounts[trueHex]++;
            }

            // Sort by frequency and take top 5
            extractedColors = Object.entries(colorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map((c) => c[0]);

            isExtracting = false;

            // If less than 5, clear
            if (extractedColors.length < 5) {
                extractedColors = [
                    ...extractedColors,
                    ...Array(5 - extractedColors.length).fill('#1e293b'),
                ];
            }
        };
    }

    async function copyToClipboard(color: string) {
        try {
            await navigator.clipboard.writeText(color);
            copiedColor = color;
            setTimeout(() => {
                copiedColor = null;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }

    onMount(() => {
        generatePalette();
    });
</script>

<svelte:head>
    <title>Paleta de Colores | ChillChess</title>
</svelte:head>

<ProGate>
    <!-- No glows for Neo-Brutalism -->

    <div class="max-w-4xl mx-auto flex flex-col gap-10">
        <!-- Section 1: Base Color Generator -->
        <div
            class="bg-white dark:bg-slate-900 border-4 border-black p-10 space-y-10 shadow-neo relative overflow-hidden"
        >
            <div class="flex items-center gap-4">
                <div class="p-3 bg-primary text-white border-4 border-black shadow-neo-sm">
                    <Palette class="w-6 h-6" />
                </div>
                <div>
                    <h2
                        class="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.3em]"
                    >
                        GENERADOR ARMÓNICO
                    </h2>
                    <p class="text-xs text-slate-500 font-bold tracking-tight">
                        Variaciones cromáticas perfectas desde un color base
                    </p>
                </div>
            </div>

            <div class="flex flex-col lg:flex-row gap-10 items-stretch">
                <!-- Color Input Box -->
                <div class="lg:w-1/3 flex flex-col gap-4">
                    <label
                        for="base-color-text"
                        class="text-[10px] font-black text-black dark:text-white uppercase tracking-widest ml-1"
                        >COLOR DE ORIGEN</label
                    >
                    <div
                        class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 border-4 border-black p-3 shadow-neo-sm group focus-within:border-primary transition-colors"
                    >
                        <div
                            class="relative w-16 h-16 border-2 border-black shrink-0 overflow-hidden"
                        >
                            <label for="base-color-picker" class="sr-only"
                                >Seleccionar color base</label
                            >
                            <input
                                id="base-color-picker"
                                type="color"
                                bind:value={baseColor}
                                class="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] cursor-pointer bg-transparent border-none p-0"
                            />
                        </div>
                        <div class="flex-1 px-2">
                            <label for="base-color-text" class="sr-only">CÓDIGO HEXADECIMAL</label>
                            <input
                                id="base-color-text"
                                type="text"
                                bind:value={baseColor}
                                class="w-full bg-transparent border-none text-black dark:text-white font-black text-2xl focus:outline-none focus:ring-0 uppercase tracking-tighter tabular-nums"
                                maxlength="7"
                            />
                        </div>
                    </div>
                </div>

                <!-- Generated Palette Row -->
                <div class="flex-1 flex flex-col gap-4">
                    <h3
                        class="text-[10px] font-black text-black dark:text-white uppercase tracking-widest ml-1"
                    >
                        PALETA GENERADA
                    </h3>
                    <div class="grid grid-cols-5 gap-3 h-24">
                        {#each generatedPalette as color}
                            <button
                                class="relative border-4 border-black shadow-neo-sm transition-all hover:-translate-y-1 hover:translate-x-1 hover:shadow-none active:translate-x-0 active:translate-y-0 active:shadow-neo-sm flex items-center justify-center"
                                style="background-color: {color}"
                                on:click={() => copyToClipboard(color)}
                            >
                                <div
                                    class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"
                                >
                                    {#if copiedColor === color}
                                        <Check class="w-6 h-6 scale-110" />
                                    {:else}
                                        <Copy
                                            class="w-5 h-5 group-hover:scale-110 transition-transform"
                                        />
                                    {/if}
                                </div>
                                <span
                                    class="absolute bottom-2 text-[9px] font-black uppercase tracking-tighter text-white mix-blend-difference drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {color}
                                </span>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 2: Image Color Extractor -->
        <div
            class="bg-white dark:bg-slate-900 border-4 border-black p-10 space-y-10 shadow-neo relative overflow-hidden"
        >
            <div class="flex items-center gap-4">
                <div class="p-3 bg-black text-white border-4 border-black shadow-neo-sm">
                    <ImageIcon class="w-6 h-6" />
                </div>
                <div>
                    <h2
                        class="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.3em]"
                    >
                        EXTRACTOR CROMÁTICO
                    </h2>
                    <p class="text-xs text-slate-500 font-bold tracking-tight">
                        Análisis espectral de imágenes mediante procesamiento visual
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
                <!-- Dropzone High Premium -->
                <div
                    class="border-4 border-dashed border-black dark:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-800 p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[300px] relative group overflow-hidden shadow-neo-sm active:shadow-none translate-x-[-4px] translate-y-[-4px] active:translate-x-0 active:translate-y-0"
                    on:click={() => fileInput.click()}
                    role="button"
                    tabindex="0"
                    on:keydown={(e) => e.key === 'Enter' && fileInput.click()}
                >
                    <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        bind:this={fileInput}
                        on:change={handleImageUpload}
                    />

                    {#if imageSrc}
                        <img
                            src={imageSrc}
                            alt="Preview"
                            class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-700"
                        />
                        <div
                            class="relative z-10 flex flex-col items-center bg-white dark:bg-slate-900 p-6 border-4 border-black shadow-neo-sm scale-90 group-hover:scale-100 transition-transform"
                        >
                            <Upload class="w-8 h-8 text-primary mb-3" />
                            <span
                                class="text-xs font-black text-black dark:text-white uppercase tracking-widest"
                                >Cambiar Imagen</span
                            >
                        </div>
                    {:else}
                        <div
                            class="p-6 bg-slate-100 dark:bg-slate-800 border-4 border-black mb-6 group-hover:scale-110 transition-transform"
                        >
                            <Upload
                                class="w-10 h-10 text-black dark:text-white group-hover:text-primary transition-colors"
                            />
                        </div>
                        <span
                            class="text-sm font-black text-black dark:text-white uppercase tracking-[0.2em] mb-2"
                            >Sube tu imagen</span
                        >
                        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest"
                            >MAX 5MB • PNG / JPG / WEBP</span
                        >
                    {/if}
                </div>

                <!-- Extracted Palette Vertical list -->
                <div class="flex flex-col gap-6">
                    <div class="flex justify-between items-center px-2">
                        <h3 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            ESPECTRO DETECTADO
                        </h3>
                        {#if extractedColors.length > 0}
                            <button
                                on:click={() => {}}
                                class="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                            >
                                DESCARGAR .ASE
                            </button>
                        {/if}
                    </div>

                    {#if isExtracting}
                        <div
                            class="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800 border-4 border-black min-h-[200px]"
                        >
                            <div class="relative w-12 h-12">
                                <div
                                    class="absolute inset-0 border-4 border-primary/20 rounded-full"
                                ></div>
                                <div
                                    class="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"
                                ></div>
                            </div>
                            <span
                                class="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse"
                                >Analizando espectro visual...</span
                            >
                        </div>
                    {:else if extractedColors.length > 0}
                        <div class="space-y-3">
                            {#each extractedColors as color}
                                <button
                                    class="w-full h-16 flex items-center justify-between px-6 group border-4 border-black bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all overflow-hidden relative shadow-neo-sm active:shadow-none translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0"
                                    on:click={() => copyToClipboard(color)}
                                >
                                    <div class="flex items-center gap-5 relative z-10 w-full">
                                        <div
                                            class="w-10 h-10 border-2 border-black shrink-0 group-hover:scale-110 transition-transform"
                                            style="background-color: {color}"
                                        ></div>
                                        <div class="flex justify-between items-center flex-1">
                                            <span
                                                class="font-black text-lg text-black dark:text-white tracking-tighter tabular-nums uppercase"
                                                >{color}</span
                                            >

                                            <div class="flex items-center gap-3">
                                                {#if copiedColor === color}
                                                    <span
                                                        class="text-[10px] font-black text-primary uppercase tracking-widest"
                                                        >COPIADO</span
                                                    >
                                                    <Check class="w-4 h-4 text-primary" />
                                                {:else}
                                                    <Copy
                                                        class="w-4 h-4 text-black dark:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    />
                                                {/if}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Subtle background hit -->
                                    <div
                                        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-white/[0.02] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"
                                    ></div>
                                </button>
                            {/each}
                        </div>
                    {:else}
                        <div
                            class="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800 border-4 border-dashed border-black min-h-[200px]"
                        >
                            <Palette class="w-8 h-8 text-black dark:text-white" />
                            <p
                                class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center max-w-[200px]"
                            >
                                El espectro aparecerá aquí tras subir una imagen
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</ProGate>
