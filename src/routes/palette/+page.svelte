<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { Palette, Upload, Image as ImageIcon, Copy, Check, RefreshCw } from 'lucide-svelte';
    import { onMount } from 'svelte';

    pageHeader.set({
        title: 'Paleta de Colores',
        description:
            'Genera paletas a partir de un color base o extrae los colores principales de una imagen.',
        category: 'Utilidades',
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
    <!-- Background glows -->
    <div class="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div
            class="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen"
        ></div>
        <div
            class="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-rose-500/10 rounded-full blur-[100px] mix-blend-screen"
        ></div>
    </div>

    <div class="max-w-4xl mx-auto space-y-8">
        <!-- Tab 1: Base Color Generator -->
        <div
            class="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
        >
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            ></div>

            <div class="flex items-center gap-3 mb-6">
                <div class="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                    <Palette class="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h2 class="text-xl font-light text-white tracking-wide">Generador Armónico</h2>
                    <p class="text-sm text-slate-400">
                        Introduce un color Hex y obtén variaciones.
                    </p>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-6 items-center">
                <div
                    class="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl p-2 w-full sm:w-auto shadow-inner"
                >
                    <input
                        type="color"
                        bind:value={baseColor}
                        class="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                    />
                    <input
                        type="text"
                        bind:value={baseColor}
                        class="bg-transparent border-none text-white font-mono text-lg focus:outline-none focus:ring-0 w-28 uppercase"
                        maxlength="7"
                    />
                </div>

                <div class="flex-1 w-full grid grid-cols-5 gap-2 h-24">
                    {#each generatedPalette as color, i}
                        <div
                            class="relative rounded-xl overflow-hidden group cursor-pointer border border-white/10 shadow-lg transition-transform hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center"
                            style="background-color: {color}"
                            on:click={() => copyToClipboard(color)}
                            role="button"
                            tabindex="0"
                            on:keydown={(e) => e.key === 'Enter' && copyToClipboard(color)}
                        >
                            {#if copiedColor === color}
                                <div
                                    class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
                                >
                                    <Check class="w-6 h-6" />
                                </div>
                            {:else}
                                <div
                                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-sm"
                                >
                                    <Copy class="w-5 h-5" />
                                </div>
                                <span
                                    class="absolute bottom-2 text-[10px] font-mono font-bold uppercase tracking-wider text-white mix-blend-difference drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >{color}</span
                                >
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Tab 2: Image Color Extractor -->
        <div
            class="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
        >
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            ></div>

            <div class="flex items-center gap-3 mb-6">
                <div class="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                    <ImageIcon class="w-6 h-6 text-rose-400" />
                </div>
                <div>
                    <h2 class="text-xl font-light text-white tracking-wide">
                        Extractor de Imágenes
                    </h2>
                    <p class="text-sm text-slate-400">
                        Sube una foto y obtén su paleta predominante.
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <!-- Dropzone -->
                <div
                    class="border-2 border-dashed border-white/10 hover:border-white/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/5 hover:bg-white/10 h-64 relative group overflow-hidden"
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
                            class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                        />
                        <div
                            class="relative z-10 flex flex-col items-center bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10"
                        >
                            <Upload class="w-8 h-8 text-white mb-2" />
                            <span class="text-sm font-medium text-white">Cambiar imagen</span>
                        </div>
                    {:else}
                        <Upload
                            class="w-10 h-10 text-slate-400 group-hover:text-white transition-colors mb-4 group-hover:-translate-y-1 duration-300"
                        />
                        <span class="text-sm font-medium text-slate-300">Sube una imagen</span>
                        <span class="text-xs text-slate-500 mt-1">JPG, PNG, GIF (Max 5MB)</span>
                    {/if}
                </div>

                <!-- Extracted Palette -->
                <div class="flex flex-col gap-4">
                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                        Colores Extraídos
                    </h3>
                    {#if isExtracting}
                        <div
                            class="h-40 flex flex-col items-center justify-center text-slate-400 bg-black/20 rounded-2xl border border-white/5"
                        >
                            <RefreshCw class="w-6 h-6 animate-spin mb-3 text-rose-400" />
                            <span class="text-sm font-medium">Analizando píxeles...</span>
                        </div>
                    {:else if extractedColors.length > 0}
                        <div class="flex flex-col gap-2">
                            {#each extractedColors as color}
                                <div
                                    class="h-12 rounded-xl flex items-center justify-between px-4 group cursor-pointer border border-white/10 hover:border-white/30 transition-all overflow-hidden relative shadow-sm"
                                    on:click={() => copyToClipboard(color)}
                                    role="button"
                                    tabindex="0"
                                    on:keydown={(e) => e.key === 'Enter' && copyToClipboard(color)}
                                >
                                    <div
                                        class="absolute inset-0 right-1/2"
                                        style="background-color: {color}"
                                    ></div>
                                    <div
                                        class="absolute inset-0 left-1/2 bg-black/40 backdrop-blur-xl"
                                    ></div>

                                    <div
                                        class="relative z-10 flex w-full justify-between items-center mix-blend-difference text-white"
                                    >
                                        <div
                                            class="w-8 h-8 rounded-lg shadow-sm border border-white/20"
                                            style="background-color: {color}"
                                        ></div>
                                        <div class="flex items-center gap-3">
                                            <span
                                                class="font-mono text-sm tracking-wider uppercase font-bold"
                                                >{color}</span
                                            >
                                            {#if copiedColor === color}
                                                <Check class="w-4 h-4 text-emerald-400" />
                                            {:else}
                                                <Copy
                                                    class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                                />
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div
                            class="h-40 flex items-center justify-center text-slate-500 bg-black/20 rounded-2xl border border-white/5 text-sm italic"
                        >
                            Aún no se ha subido imagen
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</ProGate>
