<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { onMount } from 'svelte';
    import {
        FileText,
        Plus,
        Trash2,
        Download,
        Building2,
        UserRound,
        Hash,
        Calendar,
    } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { addToast } from '$lib/stores/toasts';
    import { currencyStore } from '$lib/stores/currencyStore';

    pageHeader.set({
        title: 'FACTURACIÓN',
        description: 'Genera documentos profesionales con precisión quirúrgica.',
        category: 'FINANZAS',
    });

    // ---- Types ----
    interface InvoiceLine {
        concept: string;
        qty: number;
        price: number;
    }

    interface EmitterData {
        name: string;
        nif: string;
        address: string;
        email: string;
        phone: string;
    }

    interface ClientData {
        name: string;
        nif: string;
        address: string;
    }

    // ---- State ----
    let emitter: EmitterData = { name: '', nif: '', address: '', email: '', phone: '' };
    let client: ClientData = { name: '', nif: '', address: '' };
    let lines: InvoiceLine[] = [{ concept: '', qty: 1, price: 0 }];
    let invoiceNumber = 1;
    let invoiceDate = new Date().toISOString().split('T')[0];
    let vatRate = 21;
    let irpfRate = 0;
    let notes = '';
    let isGenerating = false;

    // ---- Persistence ----
    onMount(() => {
        try {
            const saved = localStorage.getItem('invoice_emitter');
            if (saved) emitter = JSON.parse(saved);
            const savedNum = localStorage.getItem('invoice_number');
            if (savedNum) invoiceNumber = parseInt(savedNum, 10);
        } catch {}
    });

    $: if (typeof window !== 'undefined') {
        localStorage.setItem('invoice_emitter', JSON.stringify(emitter));
    }

    // ---- Calculations ----
    $: subtotals = lines.map((l) => (l.qty || 0) * (l.price || 0));
    $: baseImponible = subtotals.reduce((sum, s) => sum + s, 0);
    $: vatAmount = baseImponible * (vatRate / 100);
    $: irpfAmount = baseImponible * (irpfRate / 100);
    $: total = baseImponible + vatAmount - irpfAmount;

    // ---- Line management ----
    function addLine() {
        lines = [...lines, { concept: '', qty: 1, price: 0 }];
    }

    function removeLine(i: number) {
        if (lines.length <= 1) return;
        lines = lines.filter((_, idx) => idx !== i);
    }

    // ---- Format helpers ----
    function fmt(n: number): string {
        return n.toFixed(2).replace('.', ',') + ' ' + $currencyStore;
    }

    function padNum(n: number): string {
        return String(n).padStart(4, '0');
    }

    // ---- PDF Generation ----
    async function generatePDF() {
        if (!emitter.name || !client.name) {
            addToast('Rellena al menos el nombre del emisor y del cliente.', 'error');
            return;
        }
        if (lines.every((l) => !l.concept)) {
            addToast('Añade al menos un concepto a la factura.', 'error');
            return;
        }

        isGenerating = true;

        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });
            const pageWidth = 210;
            const margin = 20;
            const contentWidth = pageWidth - margin * 2;
            let y = margin;

            // ---- Colors ----
            const brandColor: [number, number, number] = [255, 62, 0]; // primary rose/red (#FF3E00)
            const darkText: [number, number, number] = [0, 0, 0]; // black for brutalist feel
            const lightText: [number, number, number] = [100, 116, 139]; // slate-500
            const lineColor: [number, number, number] = [0, 0, 0]; // black for brutalist feel

            // ---- Header bar ----
            doc.setFillColor(...brandColor);
            doc.rect(0, 0, pageWidth, 8, 'F');

            y = 22;

            // ---- FACTURA title ----
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(28);
            doc.setTextColor(...darkText);
            doc.text('FACTURA', margin, y);

            // ---- Invoice number + date (right aligned) ----
            doc.setFontSize(10);
            doc.setTextColor(...lightText);
            doc.text(`Nº ${padNum(invoiceNumber)}`, pageWidth - margin, y - 8, { align: 'right' });
            doc.text(`Fecha: ${invoiceDate}`, pageWidth - margin, y - 2, { align: 'right' });

            y += 12;

            // ---- Emitter and Client boxes ----
            const boxWidth = (contentWidth - 10) / 2;

            // Emitter box
            doc.setFillColor(255, 213, 79); // #FFD54F (amber/yellow)
            doc.rect(margin, y, boxWidth, 38, 'F');
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1);
            doc.rect(margin, y, boxWidth, 38, 'D');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('EMISOR', margin + 5, y + 7);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...darkText);
            doc.text(emitter.name || '—', margin + 5, y + 14);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...lightText);
            if (emitter.nif) doc.text(`NIF/CIF: ${emitter.nif}`, margin + 5, y + 20);
            if (emitter.address) doc.text(emitter.address, margin + 5, y + 25);
            if (emitter.email) doc.text(emitter.email, margin + 5, y + 30);
            if (emitter.phone) doc.text(emitter.phone, margin + 5, y + 35);

            // Client box
            const clientX = margin + boxWidth + 10;
            doc.setFillColor(179, 157, 219); // #B39DDB (purple)
            doc.rect(clientX, y, boxWidth, 38, 'F');
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1);
            doc.rect(clientX, y, boxWidth, 38, 'D');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('CLIENTE', clientX + 5, y + 7);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...darkText);
            doc.text(client.name || '—', clientX + 5, y + 14);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(...lightText);
            if (client.nif) doc.text(`NIF/CIF: ${client.nif}`, clientX + 5, y + 20);
            if (client.address) doc.text(client.address, clientX + 5, y + 25);

            y += 48;

            // ---- Table header ----
            doc.setFillColor(...brandColor);
            doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);

            const col1 = margin + 4;
            const col2 = margin + contentWidth * 0.55;
            const col3 = margin + contentWidth * 0.7;
            const col4 = margin + contentWidth - 4;

            doc.text('CONCEPTO', col1, y + 6);
            doc.text('CANT.', col2, y + 6);
            doc.text('PRECIO', col3, y + 6);
            doc.text('SUBTOTAL', col4, y + 6, { align: 'right' });

            y += 12;

            // ---- Table rows ----
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);

            lines.forEach((line, i) => {
                const sub = (line.qty || 0) * (line.price || 0);
                const isEven = i % 2 === 0;

                if (isEven) {
                    doc.setFillColor(248, 250, 252);
                    doc.rect(margin, y - 4, contentWidth, 8, 'F');
                }

                doc.setTextColor(...darkText);
                doc.text(line.concept || '—', col1, y);
                doc.text(String(line.qty || 0), col2, y);
                doc.text(fmt(line.price || 0), col3, y);
                doc.setFont('helvetica', 'bold');
                doc.text(fmt(sub), col4, y, { align: 'right' });
                doc.setFont('helvetica', 'normal');

                y += 8;
            });

            // ---- Separator ----
            y += 2;
            doc.setDrawColor(...lineColor);
            doc.setLineWidth(0.5);
            doc.line(margin, y, margin + contentWidth, y);
            y += 8;

            // ---- Totals box ----
            const totalsX = margin + contentWidth * 0.55;
            const totalsW = contentWidth * 0.45;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...lightText);
            doc.text('Base Imponible', totalsX, y);
            doc.setTextColor(...darkText);
            doc.text(fmt(baseImponible), margin + contentWidth - 4, y, { align: 'right' });

            y += 7;
            doc.setTextColor(...lightText);
            doc.text(`IVA (${vatRate}%)`, totalsX, y);
            doc.setTextColor(...darkText);
            doc.text(fmt(vatAmount), margin + contentWidth - 4, y, { align: 'right' });

            if (irpfRate > 0) {
                y += 7;
                doc.setTextColor(...lightText);
                doc.text(`IRPF (-${irpfRate}%)`, totalsX, y);
                doc.setTextColor(...darkText);
                doc.text(`-${fmt(irpfAmount)}`, margin + contentWidth - 4, y, { align: 'right' });
            }

            y += 10;
            doc.setFillColor(...brandColor);
            doc.roundedRect(totalsX - 4, y - 6, totalsW + 4, 12, 2, 2, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text('TOTAL', totalsX, y + 2);
            doc.text(fmt(total), margin + contentWidth - 4, y + 2, { align: 'right' });

            // ---- Notes ----
            if (notes.trim()) {
                y += 22;
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...lightText);
                doc.text('OBSERVACIONES', margin, y);
                y += 5;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(...darkText);
                const splitNotes = doc.splitTextToSize(notes, contentWidth);
                doc.text(splitNotes, margin, y);
            }

            // ---- Footer ----
            doc.setFontSize(7);
            doc.setTextColor(...lightText);
            doc.text('Generado con ChillChess — chillchess.app', pageWidth / 2, 290, {
                align: 'center',
            });

            // ---- Save ----
            doc.save(`factura-${padNum(invoiceNumber)}.pdf`);

            // Increment invoice number
            invoiceNumber += 1;
            localStorage.setItem('invoice_number', String(invoiceNumber));

            addToast('Factura descargada correctamente.', 'success');
        } catch (err) {
            console.error('PDF generation error:', err);
            addToast('Error al generar el PDF.', 'error');
        } finally {
            isGenerating = false;
        }
    }
</script>

<svelte:head>
    <title>Generador de Facturas | ChillChess</title>
    <meta
        name="description"
        content="Genera facturas profesionales en PDF de forma rápida y sencilla. Calcula IVA e IRPF automáticamente."
    />
</svelte:head>

<ProGate>
    <div class="max-w-5xl mx-auto space-y-8 pb-12">
        <!-- Row: Title section for the page -->
        <div class="flex flex-col gap-4 mb-10">
            <h2
                class="text-6xl md:text-8xl font-black text-black dark:text-white tracking-tighter uppercase leading-none italic"
            >
                FACTURACIÓN <br />
                <span class="bg-primary text-white px-4 dark:bg-primary dark:text-white"
                    >PROFESIONAL</span
                >
            </h2>
            <p
                class="text-slate-600 dark:text-slate-400 font-black text-xl tracking-tighter uppercase max-w-xl"
            >
                CREA DOCUMENTOS PROFESIONALES EN SEGUNDOS. <span class="text-black dark:text-white"
                    >SIN ERRORES.</span
                >
            </p>
        </div>

        <!-- Row: Invoice number + date -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 shadow-neo relative overflow-hidden group transform -rotate-1 hover:rotate-0 transition-transform"
            >
                <label
                    for="invoiceNumber"
                    class="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4"
                >
                    <Hash class="w-4 h-4 text-primary" />
                    NÚMERO DE FACTURA
                </label>
                <input
                    id="invoiceNumber"
                    type="number"
                    bind:value={invoiceNumber}
                    min="1"
                    class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black rounded-none px-6 py-4 text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-black text-xl shadow-neo-sm"
                />
            </div>
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 shadow-neo relative overflow-hidden group transform rotate-1 hover:rotate-0 transition-transform"
            >
                <label
                    for="invoiceDate"
                    class="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4"
                >
                    <Calendar class="w-4 h-4 text-primary" />
                    FECHA DE EMISIÓN
                </label>
                <input
                    id="invoiceDate"
                    type="date"
                    bind:value={invoiceDate}
                    class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black rounded-none px-6 py-4 text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all [color-scheme:dark] font-black text-xl shadow-neo-sm"
                />
            </div>
        </div>

        <!-- Row: Emitter + Client -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Emitter -->
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-10 shadow-neo relative overflow-hidden"
            >
                <div
                    class="absolute -left-16 -bottom-16 w-48 h-48 bg-primary border-4 border-black opacity-10 rounded-none transform rotate-12"
                ></div>
                <h3
                    class="flex items-center gap-3 text-xs font-black text-black dark:text-white uppercase tracking-[0.3em]"
                >
                    <Building2 class="w-5 h-5 text-primary" />
                    DATOS DEL EMISOR
                </h3>
                <div class="space-y-4 mt-8 relative z-10">
                    <input
                        type="text"
                        bind:value={emitter.name}
                        placeholder="NOMBRE O EMPRESA"
                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-base text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-black"
                    />
                    <input
                        type="text"
                        bind:value={emitter.nif}
                        placeholder="NIF / CIF"
                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-base text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-black"
                    />
                    <input
                        type="text"
                        bind:value={emitter.address}
                        placeholder="DIRECCIÓN FISCAL"
                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-base text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-black"
                    />
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="email"
                            bind:value={emitter.email}
                            placeholder="EMAIL"
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-base text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-black"
                        />
                        <input
                            type="tel"
                            bind:value={emitter.phone}
                            placeholder="TELÉFONO"
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-base text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-black"
                        />
                    </div>
                </div>
            </div>

            <!-- Client -->
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-10 shadow-neo relative overflow-hidden transform lg:rotate-1"
            >
                <div
                    class="absolute -right-16 -bottom-16 w-48 h-48 bg-slate-100 dark:bg-slate-800 border-4 border-black opacity-20 rounded-none transform -rotate-6"
                ></div>
                <h3
                    class="flex items-center gap-3 text-xs font-black text-black dark:text-white uppercase tracking-[0.3em]"
                >
                    <UserRound class="w-5 h-5 text-primary" />
                    DATOS DEL CLIENTE
                </h3>
                <div class="space-y-4 mt-8 relative z-10">
                    <input
                        type="text"
                        bind:value={client.name}
                        placeholder="NOMBRE O EMPRESA CLIENTE"
                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-base text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-black"
                    />
                    <input
                        type="text"
                        bind:value={client.nif}
                        placeholder="NIF / CIF CLIENTE"
                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-base text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-black"
                    />
                    <input
                        type="text"
                        bind:value={client.address}
                        placeholder="DIRECCIÓN DEL CLIENTE"
                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-base text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-black"
                    />
                </div>
            </div>
        </div>

        <!-- Lines -->
        <div
            class="bg-white dark:bg-slate-900 border-4 border-black p-8 lg:p-10 shadow-neo relative"
        >
            <div
                class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 relative z-10"
            >
                <h3
                    class="flex items-center gap-3 text-xs font-black text-black dark:text-white uppercase tracking-[0.3em] m-0"
                >
                    <FileText class="w-5 h-5 text-primary" />
                    CONCEPTOS DE FACTURA
                </h3>
                <button
                    on:click={addLine}
                    class="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-[11px] font-black uppercase tracking-widest px-8 py-5 text-white border-4 border-black shadow-neo-sm hover:-translate-y-1 hover:shadow-neo active:translate-y-0.5 active:shadow-none transition-all"
                >
                    <Plus class="w-6 h-6" />
                    AÑADIR LÍNEA
                </button>
            </div>

            <!-- Table header (desktop) -->
            <div
                class="hidden lg:grid grid-cols-[1fr_100px_140px_140px_60px] gap-4 text-[10px] font-black text-black dark:text-white uppercase tracking-widest mb-6 px-6 bg-slate-100 dark:bg-slate-800 border-4 border-black py-4"
            >
                <span>CONCEPTO</span>
                <span class="text-center border-l-4 border-black">CANT.</span>
                <span class="text-right border-l-4 border-black pr-2">PRECIO</span>
                <span class="text-right border-l-4 border-black pr-2">SUBTOTAL</span>
                <span></span>
            </div>

            <div class="space-y-6 relative z-10">
                {#each lines as line, i}
                    <div
                        class="grid grid-cols-1 lg:grid-cols-[1fr_100px_140px_140px_60px] gap-6 lg:gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-6 lg:p-4 border-4 border-black shadow-neo-sm transform transition-all hover:-translate-y-1 hover:shadow-neo"
                    >
                        <div class="space-y-1">
                            <label
                                for="concept-{i}"
                                class="block lg:hidden text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                                >CONCEPTO</label
                            >
                            <input
                                id="concept-{i}"
                                type="text"
                                bind:value={line.concept}
                                placeholder="EJ: DISEÑO DE LOGO"
                                class="w-full bg-white dark:bg-slate-800 border-4 border-black px-4 py-4 text-base text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all font-black shadow-neo-sm"
                            />
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:contents gap-4">
                            <div>
                                <label
                                    for="qty-{i}"
                                    class="block lg:hidden text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                                    >CANT.</label
                                >
                                <input
                                    id="qty-{i}"
                                    type="number"
                                    bind:value={line.qty}
                                    min="1"
                                    class="w-full bg-white dark:bg-slate-800 border-4 border-black px-4 py-4 text-base text-black dark:text-white focus:outline-none focus:border-primary transition-all text-center font-black shadow-neo-sm"
                                />
                            </div>
                            <div>
                                <label
                                    for="price-{i}"
                                    class="block lg:hidden text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right sm:text-left"
                                    >PRECIO</label
                                >
                                <input
                                    id="price-{i}"
                                    type="number"
                                    bind:value={line.price}
                                    min="0"
                                    step="0.01"
                                    class="w-full bg-white dark:bg-slate-800 border-4 border-black px-4 py-4 text-base text-black dark:text-white focus:outline-none focus:border-primary transition-all text-right font-black shadow-neo-sm"
                                />
                            </div>
                            <div class="flex flex-col justify-end lg:justify-center">
                                <span
                                    class="block lg:hidden text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right"
                                    >SUBTOTAL</span
                                >
                                <div
                                    class="text-2xl font-black text-primary text-right tabular-nums tracking-tighter"
                                >
                                    {fmt(subtotals[i] || 0)}
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex justify-end lg:justify-center border-t-4 border-black/10 lg:border-none pt-4 lg:pt-0 mt-2 lg:mt-0"
                        >
                            <button
                                on:click={() => removeLine(i)}
                                disabled={lines.length <= 1}
                                class="p-4 text-black dark:text-white hover:bg-red-500 hover:text-white border-4 border-transparent hover:border-black disabled:opacity-20 transition-all active:scale-95 shadow-none hover:shadow-neo-sm"
                            >
                                <Trash2 class="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Taxes + Totals Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Taxes -->
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 lg:p-10 shadow-neo relative overflow-hidden group"
            >
                <div
                    class="absolute -left-16 -top-16 w-38 h-38 bg-primary border-4 border-black opacity-10 rounded-none transform -rotate-45"
                ></div>
                <h3
                    class="flex items-center gap-3 text-xs font-black text-black dark:text-white uppercase tracking-[0.3em] relative z-10"
                >
                    IMPUESTOS Y RETENCIONES
                </h3>
                <div class="space-y-8 mt-10 relative z-10">
                    <div>
                        <label
                            for="vatRate"
                            class="text-[10px] font-black tracking-widest text-slate-500 mb-4 block uppercase"
                            >IVA APLICABLE</label
                        >
                        <div class="relative">
                            <select
                                id="vatRate"
                                bind:value={vatRate}
                                class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-5 text-base text-black dark:text-white focus:outline-none focus:border-primary transition-all outline-none appearance-none font-black shadow-neo-sm"
                            >
                                <option
                                    value={21}
                                    class="bg-white text-black dark:bg-slate-900 dark:text-white"
                                    >21% — GENERAL</option
                                >
                                <option
                                    value={10}
                                    class="bg-white text-black dark:bg-slate-900 dark:text-white"
                                    >10% — REDUCIDO</option
                                >
                                <option
                                    value={4}
                                    class="bg-white text-black dark:bg-slate-900 dark:text-white"
                                    >4% — SUPERREDUCIDO</option
                                >
                                <option
                                    value={0}
                                    class="bg-white text-black dark:bg-slate-900 dark:text-white"
                                    >0% — EXENTO</option
                                >
                            </select>
                            <div
                                class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none"
                            >
                                <div
                                    class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-black dark:border-t-white"
                                ></div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label
                            for="irpfRate"
                            class="text-[10px] font-black tracking-widest text-slate-500 mb-4 block uppercase"
                            >RETENCIÓN IRPF</label
                        >
                        <div class="relative">
                            <select
                                id="irpfRate"
                                bind:value={irpfRate}
                                class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-5 text-base text-black dark:text-white focus:outline-none focus:border-primary transition-all outline-none appearance-none font-black shadow-neo-sm"
                            >
                                <option
                                    value={0}
                                    class="bg-white text-black dark:bg-slate-900 dark:text-white"
                                    >SIN RETENCIÓN</option
                                >
                                <option
                                    value={7}
                                    class="bg-white text-black dark:bg-slate-900 dark:text-white"
                                    >7% — NUEVO AUTÓNOMO</option
                                >
                                <option
                                    value={15}
                                    class="bg-white text-black dark:bg-slate-900 dark:text-white"
                                    >15% — GENERAL</option
                                >
                            </select>
                            <div
                                class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none"
                            >
                                <div
                                    class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-black dark:border-t-white"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary -->
            <div
                class="bg-primary dark:bg-blue-700 border-4 border-black p-8 lg:p-10 shadow-neo relative overflow-hidden text-white transform -rotate-1"
            >
                <div
                    class="absolute -right-20 -bottom-20 w-64 h-64 bg-black border-4 border-black opacity-20 rounded-none transform rotate-45"
                ></div>

                <h3
                    class="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] relative z-10 italic"
                >
                    RESUMEN TOTAL
                </h3>
                <div class="space-y-6 mt-10 relative z-10">
                    <div class="flex justify-between items-center text-xl">
                        <span class="font-black uppercase tracking-widest text-white/90"
                            >BASE IMPONIBLE</span
                        >
                        <span class="font-black tabular-nums tracking-tight"
                            >{fmt(baseImponible)}</span
                        >
                    </div>
                    <div class="flex justify-between items-center text-xl">
                        <span class="font-black uppercase tracking-widest text-white/90"
                            >IVA ({vatRate}%)</span
                        >
                        <span class="font-black tabular-nums tracking-tight">{fmt(vatAmount)}</span>
                    </div>
                    {#if irpfRate > 0}
                        <div class="flex justify-between items-center text-xl">
                            <span class="font-black uppercase tracking-widest text-white/90"
                                >IRPF ({irpfRate}%)</span
                            >
                            <span class="font-black tabular-nums tracking-tight"
                                >-{fmt(irpfAmount)}</span
                            >
                        </div>
                    {/if}
                    <div
                        class="border-t-4 border-black pt-10 mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                        <span class="text-xs font-black tracking-[0.3em] uppercase opacity-80"
                            >TOTAL FACTURA</span
                        >
                        <div
                            class="text-6xl md:text-7xl font-black tracking-tighter tabular-nums drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] italic"
                        >
                            {total.toFixed(2)}<span class="text-3xl ml-2 uppercase opacity-90"
                                >{$currencyStore}</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Notes -->
        <div
            class="bg-white dark:bg-slate-900 border-4 border-black p-8 lg:p-10 shadow-neo relative"
        >
            <h3
                class="flex items-center gap-3 text-xs font-black text-black dark:text-white uppercase tracking-[0.3em] mb-6 relative z-10"
            >
                OBSERVACIONES ADICIONALES
            </h3>
            <textarea
                bind:value={notes}
                placeholder="INCLUYE INFORMACIÓN DE PAGO, PLAZOS O TÉRMINOS Y CONDICIONES..."
                rows="4"
                class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-6 text-base text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-all resize-none relative z-10 font-bold shadow-neo-sm"
            ></textarea>
        </div>

        <!-- Download Button -->
        <button
            on:click={generatePDF}
            disabled={isGenerating}
            class="w-full py-10 bg-black dark:bg-white text-white dark:text-black border-4 border-black flex items-center justify-center gap-8 text-2xl font-black uppercase tracking-[0.2em] shadow-neo hover:-translate-y-1 hover:translate-x-1 hover:shadow-none active:translate-y-1 active:translate-x-1 active:shadow-none transition-all disabled:opacity-50 italic group"
        >
            {#if isGenerating}
                <div
                    class="w-10 h-10 border-4 border-slate-400 border-t-white dark:border-t-black rounded-none animate-spin"
                ></div>
                GENERANDO PDF...
            {:else}
                <Download
                    class="w-10 h-10 group-hover:scale-110 group-hover:-rotate-3 transition-transform"
                />
                DESCARGAR FACTURA
            {/if}
        </button>
    </div>
</ProGate>
