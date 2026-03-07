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
        title: 'Generador de Facturas',
        description: 'Crea y descarga facturas profesionales en PDF.',
        category: 'Negocios',
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
            const brandColor: [number, number, number] = [0, 229, 255]; // neat-accent (#00E5FF)
            const darkText: [number, number, number] = [11, 14, 20]; // neat-bg-dark
            const lightText: [number, number, number] = [100, 116, 139]; // slate-500
            const lineColor: [number, number, number] = [30, 41, 59]; // slate-800

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
            doc.setFillColor(248, 250, 252); // slate-50
            doc.roundedRect(margin, y, boxWidth, 38, 2, 2, 'F');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...brandColor);
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
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(clientX, y, boxWidth, 38, 2, 2, 'F');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...brandColor);
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
        <div class="flex flex-col gap-2 mb-4">
            <h2
                class="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none"
            >
                FACTURACIÓN <span class="hero-text-gradient italic">PRO</span>
            </h2>
            <p class="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
                Crea documentos profesionales en segundos
            </p>
        </div>

        <!-- Row: Invoice number + date -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
                class="glass-card !bg-black/20 !rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group"
            >
                <!-- Subtle glow -->
                <div
                    class="absolute -right-10 -top-10 w-32 h-32 bg-neat-accent/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>
                <label
                    for="invoiceNumber"
                    class="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4"
                >
                    <Hash class="w-4 h-4 text-neat-accent" />
                    Nº Factura
                </label>
                <input
                    id="invoiceNumber"
                    type="number"
                    bind:value={invoiceNumber}
                    min="1"
                    class="w-full bg-white/5 border border-white/5 shadow-inner rounded-2xl px-6 py-4 text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all relative z-10 font-bold text-lg"
                />
            </div>
            <div
                class="glass-card !bg-black/20 !rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group"
            >
                <!-- Subtle glow -->
                <div
                    class="absolute -right-10 -top-10 w-32 h-32 bg-neat-accent/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>
                <label
                    for="invoiceDate"
                    class="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4"
                >
                    <Calendar class="w-4 h-4 text-neat-accent" />
                    Fecha de emisión
                </label>
                <input
                    id="invoiceDate"
                    type="date"
                    bind:value={invoiceDate}
                    class="w-full bg-white/5 border border-white/5 shadow-inner rounded-2xl px-6 py-4 text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all relative z-10 [color-scheme:dark] font-bold text-lg"
                />
            </div>
        </div>

        <!-- Row: Emitter + Client -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Emitter -->
            <div
                class="glass-card !bg-black/20 !rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden"
            >
                <div
                    class="absolute -left-16 -bottom-16 w-48 h-48 bg-neat-accent/10 rounded-full blur-3xl pointer-events-none"
                ></div>
                <h3
                    class="flex items-center gap-3 text-sm font-black text-white uppercase tracking-[0.3em]"
                >
                    <Building2 class="w-5 h-5 text-neat-accent" />
                    Datos del Emisor
                </h3>
                <div class="space-y-4 mt-8">
                    <input
                        type="text"
                        bind:value={emitter.name}
                        placeholder="Nombre completo o Empresa"
                        class="w-full bg-white/5 border border-white/5 shadow-inner rounded-2xl px-6 py-4 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all relative z-10 font-bold"
                    />
                    <input
                        type="text"
                        bind:value={emitter.nif}
                        placeholder="NIF / CIF"
                        class="w-full bg-white/5 border border-white/5 shadow-inner rounded-2xl px-6 py-4 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all relative z-10 font-bold"
                    />
                    <input
                        type="text"
                        bind:value={emitter.address}
                        placeholder="Dirección fiscal"
                        class="w-full bg-white/5 border border-white/5 shadow-inner rounded-2xl px-6 py-4 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all relative z-10 font-bold"
                    />
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="email"
                            bind:value={emitter.email}
                            placeholder="Email"
                            class="w-full bg-white/5 border border-white/5 shadow-inner rounded-2xl px-6 py-4 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all relative z-10 font-bold"
                        />
                        <input
                            type="tel"
                            bind:value={emitter.phone}
                            placeholder="Teléfono"
                            class="w-full bg-white/5 border border-white/5 shadow-inner rounded-2xl px-6 py-4 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all relative z-10 font-bold"
                        />
                    </div>
                </div>
            </div>

            <!-- Client -->
            <div
                class="glass-card !bg-black/20 !rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden"
            >
                <div
                    class="absolute -right-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"
                ></div>
                <h3
                    class="flex items-center gap-3 text-sm font-black text-white uppercase tracking-[0.3em]"
                >
                    <UserRound class="w-5 h-5 text-neat-accent" />
                    Datos del Cliente
                </h3>
                <div class="space-y-4 mt-8">
                    <input
                        type="text"
                        bind:value={client.name}
                        placeholder="Nombre o Empresa cliente"
                        class="w-full bg-white/5 border border-white/5 shadow-inner rounded-2xl px-6 py-4 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all relative z-10 font-bold"
                    />
                    <input
                        type="text"
                        bind:value={client.nif}
                        placeholder="NIF / CIF Cliente"
                        class="w-full bg-white/5 border border-white/5 shadow-inner rounded-2xl px-6 py-4 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all relative z-10 font-bold"
                    />
                    <input
                        type="text"
                        bind:value={client.address}
                        placeholder="Dirección del cliente"
                        class="w-full bg-white/5 border border-white/5 shadow-inner rounded-2xl px-6 py-4 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all relative z-10 font-bold"
                    />
                </div>
            </div>
        </div>

        <!-- Lines -->
        <div
            class="glass-card !bg-black/20 !rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden group"
        >
            <div class="flex items-center justify-between mb-8 relative z-10">
                <h3
                    class="flex items-center gap-3 text-sm font-black text-white uppercase tracking-[0.3em] m-0"
                >
                    <FileText class="w-5 h-5 text-neat-accent" />
                    Conceptos de Factura
                </h3>
                <button
                    on:click={addLine}
                    class="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl border border-white/10 transition-all active:scale-95 shadow-xl"
                >
                    <Plus class="w-4 h-4" />
                    Añadir Línea
                </button>
            </div>

            <!-- Table header (desktop) -->
            <div
                class="hidden lg:grid grid-cols-[1fr_100px_140px_140px_60px] gap-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-2 relative z-10"
            >
                <span>Concepto</span>
                <span class="text-center">Cant.</span>
                <span class="text-right">Precio</span>
                <span class="text-right">Subtotal</span>
                <span></span>
            </div>

            <div class="space-y-4 relative z-10">
                {#each lines as line, i}
                    <div
                        class="grid grid-cols-1 lg:grid-cols-[1fr_100px_140px_140px_60px] gap-6 lg:gap-4 items-center bg-white/[0.03] p-6 lg:p-4 rounded-3xl border border-white/5 group-hover:border-white/10 transition-all duration-500"
                    >
                        <div class="space-y-1">
                            <label
                                for="concept-{i}"
                                class="block lg:hidden text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                                >Concepto</label
                            >
                            <input
                                id="concept-{i}"
                                type="text"
                                bind:value={line.concept}
                                placeholder="P. ej: Diseño de interfaz"
                                class="w-full bg-black/20 lg:bg-transparent border border-white/5 lg:border-none rounded-2xl px-4 py-3 text-base text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-neat-accent/30 lg:focus:ring-0 transition-all font-bold"
                            />
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:contents gap-4">
                            <div>
                                <label
                                    for="qty-{i}"
                                    class="block lg:hidden text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2"
                                    >Cant.</label
                                >
                                <input
                                    id="qty-{i}"
                                    type="number"
                                    bind:value={line.qty}
                                    min="1"
                                    class="w-full bg-black/40 border border-white/10 shadow-inner rounded-xl px-4 py-3 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/50 transition-all text-center font-bold"
                                />
                            </div>
                            <div>
                                <label
                                    for="price-{i}"
                                    class="block lg:hidden text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right sm:text-left"
                                    >Precio</label
                                >
                                <input
                                    id="price-{i}"
                                    type="number"
                                    bind:value={line.price}
                                    min="0"
                                    step="0.01"
                                    class="w-full bg-black/40 border border-white/10 shadow-inner rounded-xl px-4 py-3 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/50 transition-all text-right font-bold"
                                />
                            </div>
                            <div class="flex flex-col justify-end lg:justify-center">
                                <span
                                    class="block lg:hidden text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-right"
                                    >Subtotal</span
                                >
                                <div
                                    class="text-lg font-black text-neat-accent text-right tabular-nums tracking-tighter"
                                >
                                    {fmt(subtotals[i] || 0)}
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex justify-end lg:justify-center border-t border-white/5 lg:border-none pt-4 lg:pt-0 mt-2 lg:mt-0"
                        >
                            <button
                                on:click={() => removeLine(i)}
                                disabled={lines.length <= 1}
                                class="p-3 text-slate-600 hover:text-red-500 disabled:opacity-20 transition-all rounded-2xl hover:bg-red-500/10 active:scale-95"
                            >
                                <Trash2 class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Taxes + Totals Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Taxes -->
            <div
                class="glass-card !bg-black/20 !rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden group"
            >
                <div
                    class="absolute -left-16 -top-16 w-32 h-32 bg-neat-accent/10 rounded-full blur-2xl pointer-events-none"
                ></div>
                <h3
                    class="flex items-center gap-3 text-sm font-black text-white uppercase tracking-[0.3em] relative z-10"
                >
                    Impuestos y Retenciones
                </h3>
                <div class="space-y-6 mt-8 relative z-10">
                    <div>
                        <label
                            for="vatRate"
                            class="text-[10px] font-black tracking-[0.2em] text-slate-500 mb-3 block uppercase"
                            >IVA Aplicable</label
                        >
                        <select
                            id="vatRate"
                            bind:value={vatRate}
                            class="w-full bg-white/5 border border-white/10 shadow-inner rounded-2xl px-6 py-4 text-base text-white focus:outline-none focus:border-neat-accent/30 transition-all outline-none appearance-none font-bold"
                        >
                            <option value={21} class="bg-[#0B0E14] text-white">21% — General</option
                            >
                            <option value={10} class="bg-[#0B0E14] text-white"
                                >10% — Reducido</option
                            >
                            <option value={4} class="bg-[#0B0E14] text-white"
                                >4% — Superreducido</option
                            >
                            <option value={0} class="bg-[#0B0E14] text-white">0% — Exento</option>
                        </select>
                    </div>
                    <div>
                        <label
                            for="irpfRate"
                            class="text-[10px] font-black tracking-[0.2em] text-slate-500 mb-3 block uppercase"
                            >Retención IRPF (Autónomos)</label
                        >
                        <select
                            id="irpfRate"
                            bind:value={irpfRate}
                            class="w-full bg-white/5 border border-white/10 shadow-inner rounded-2xl px-6 py-4 text-base text-white focus:outline-none focus:border-neat-accent/30 transition-all outline-none appearance-none font-bold"
                        >
                            <option value={0} class="bg-[#0B0E14] text-white">Sin retención</option>
                            <option value={7} class="bg-[#0B0E14] text-white"
                                >7% — Nuevo autónomo</option
                            >
                            <option value={15} class="bg-[#0B0E14] text-white">15% — General</option
                            >
                        </select>
                    </div>
                </div>
            </div>

            <!-- Summary -->
            <div
                class="glass-card !bg-neat-accent/5 !border-neat-accent/20 !rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden group"
            >
                <div
                    class="absolute -right-20 -bottom-20 w-48 h-48 bg-neat-accent rounded-full blur-3xl opacity-10 pointer-events-none"
                ></div>

                <h3
                    class="flex items-center gap-3 text-sm font-black text-white uppercase tracking-[0.3em] relative z-10"
                >
                    Resumen Total
                </h3>
                <div class="space-y-6 mt-8 relative z-10">
                    <div class="flex justify-between items-center text-base">
                        <span class="text-slate-500 font-bold uppercase tracking-wider"
                            >Base imponible</span
                        >
                        <span class="font-black text-white tabular-nums tracking-tight"
                            >{fmt(baseImponible)}</span
                        >
                    </div>
                    <div class="flex justify-between items-center text-base">
                        <span class="text-slate-500 font-bold uppercase tracking-wider"
                            >IVA ({vatRate}%)</span
                        >
                        <span class="font-black text-neat-accent tabular-nums tracking-tight"
                            >+{fmt(vatAmount)}</span
                        >
                    </div>
                    {#if irpfRate > 0}
                        <div class="flex justify-between items-center text-base">
                            <span class="text-slate-500 font-bold uppercase tracking-wider"
                                >IRPF ({irpfRate}%)</span
                            >
                            <span class="font-black text-red-500 tabular-nums tracking-tight"
                                >-{fmt(irpfAmount)}</span
                            >
                        </div>
                    {/if}
                    <div
                        class="border-t border-white/10 pt-8 mt-4 flex justify-between items-center"
                    >
                        <span class="text-xs font-black text-white tracking-[0.3em] uppercase"
                            >TOTAL FACTURA</span
                        >
                        <div
                            class="text-4xl md:text-5xl font-black tracking-tighter text-white tabular-nums drop-shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                        >
                            {total.toFixed(2)}<span class="text-xl text-neat-accent ml-2 uppercase"
                                >{$currencyStore}</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Notes -->
        <div
            class="glass-card !bg-black/20 !rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden"
        >
            <h3
                class="flex items-center gap-3 text-sm font-black text-white uppercase tracking-[0.3em] mb-6 relative z-10"
            >
                Observaciones Adicionales
            </h3>
            <textarea
                bind:value={notes}
                placeholder="Incluye aquí información de pago, plazos, etc..."
                rows="4"
                class="w-full bg-white/5 border border-white/10 shadow-inner rounded-3xl px-6 py-5 text-base text-white placeholder-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all resize-none relative z-10 font-medium"
            ></textarea>
        </div>

        <!-- Download Button -->
        <button
            on:click={generatePDF}
            disabled={isGenerating}
            class="neat-button-primary w-full py-6 group"
        >
            {#if isGenerating}
                <div
                    class="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin"
                ></div>
                GENERANDO PDF...
            {:else}
                <Download class="w-6 h-6 group-hover:scale-110 transition-transform" />
                DESCARGAR FACTURA PROFESIONAL
            {/if}
        </button>
    </div>
</ProGate>
