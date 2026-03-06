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
            const brandColor: [number, number, number] = [14, 165, 233]; // brand-500
            const darkText: [number, number, number] = [30, 41, 59]; // slate-800
            const lightText: [number, number, number] = [100, 116, 139]; // slate-500
            const lineColor: [number, number, number] = [226, 232, 240]; // slate-200

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
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Row: Invoice number + date -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
                class="bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden group"
            >
                <!-- Subtle glow -->
                <div
                    class="absolute -right-10 -top-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>
                <label
                    for="invoiceNumber"
                    class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2"
                >
                    <Hash class="w-4 h-4 text-brand-400" />
                    Nº Factura
                </label>
                <input
                    id="invoiceNumber"
                    type="number"
                    bind:value={invoiceNumber}
                    min="1"
                    class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all relative z-10"
                />
            </div>
            <div
                class="bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden group"
            >
                <!-- Subtle glow -->
                <div
                    class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>
                <label
                    for="invoiceDate"
                    class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2"
                >
                    <Calendar class="w-4 h-4 text-brand-400" />
                    Fecha
                </label>
                <input
                    id="invoiceDate"
                    type="date"
                    bind:value={invoiceDate}
                    class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all relative z-10 [color-scheme:dark]"
                />
            </div>
        </div>

        <!-- Row: Emitter + Client -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Emitter -->
            <div
                class="bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
            >
                <div
                    class="absolute -left-16 -bottom-16 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"
                ></div>
                <h3 class="flex items-center gap-2 text-base font-bold text-white">
                    <Building2 class="w-5 h-5 text-brand-400" />
                    Datos del Emisor
                </h3>
                <div class="space-y-3 mt-4">
                    <input
                        type="text"
                        bind:value={emitter.name}
                        placeholder="Nombre o empresa"
                        class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all relative z-10"
                    />
                    <input
                        type="text"
                        bind:value={emitter.nif}
                        placeholder="NIF / CIF"
                        class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all relative z-10"
                    />
                    <input
                        type="text"
                        bind:value={emitter.address}
                        placeholder="Dirección"
                        class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all relative z-10"
                    />
                    <div class="grid grid-cols-2 gap-3">
                        <input
                            type="email"
                            bind:value={emitter.email}
                            placeholder="Email"
                            class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all relative z-10"
                        />
                        <input
                            type="tel"
                            bind:value={emitter.phone}
                            placeholder="Teléfono"
                            class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all relative z-10"
                        />
                    </div>
                </div>
            </div>

            <!-- Client -->
            <div
                class="bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
            >
                <div
                    class="absolute -right-16 -bottom-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
                ></div>
                <h3 class="flex items-center gap-2 text-base font-bold text-white">
                    <UserRound class="w-5 h-5 text-brand-400" />
                    Datos del Cliente
                </h3>
                <div class="space-y-3 mt-4">
                    <input
                        type="text"
                        bind:value={client.name}
                        placeholder="Nombre o empresa"
                        class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all relative z-10"
                    />
                    <input
                        type="text"
                        bind:value={client.nif}
                        placeholder="NIF / CIF"
                        class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all relative z-10"
                    />
                    <input
                        type="text"
                        bind:value={client.address}
                        placeholder="Dirección"
                        class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all relative z-10"
                    />
                </div>
            </div>
        </div>

        <!-- Lines -->
        <div
            class="bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden group"
        >
            <!-- Subtle glow -->
            <div
                class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"
            ></div>
            <div class="flex items-center justify-between mb-4 relative z-10">
                <h3 class="flex items-center gap-2 text-base font-bold text-white m-0">
                    <FileText class="w-5 h-5 text-brand-400" />
                    Conceptos
                </h3>
                <button
                    on:click={addLine}
                    class="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-3 py-2 rounded-lg border border-white/10 transition-all backdrop-blur-md"
                >
                    <Plus class="w-4 h-4" />
                    Añadir
                </button>
            </div>

            <!-- Table header (desktop) -->
            <div
                class="hidden sm:grid grid-cols-[1fr_80px_100px_100px_40px] gap-3 text-xs font-black text-slate-500 uppercase tracking-widest mb-2 px-1 relative z-10"
            >
                <span>Concepto</span>
                <span class="text-center">Cant.</span>
                <span class="text-right">Precio</span>
                <span class="text-right">Subtotal</span>
                <span></span>
            </div>

            <div class="space-y-3 relative z-10">
                {#each lines as line, i}
                    <div
                        class="grid grid-cols-1 sm:grid-cols-[1fr_80px_100px_100px_40px] gap-3 items-center bg-black/20 p-3 sm:p-2 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors"
                    >
                        <input
                            type="text"
                            bind:value={line.concept}
                            placeholder="Descripción del servicio"
                            class="w-full bg-transparent border-none px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 transition-all"
                        />
                        <input
                            type="number"
                            bind:value={line.qty}
                            min="1"
                            class="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-center"
                        />
                        <input
                            type="number"
                            bind:value={line.price}
                            min="0"
                            step="0.01"
                            class="w-full bg-black/40 border border-white/5 shadow-inner rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-right"
                        />
                        <div
                            class="text-sm font-bold text-brand-300 text-right tabular-nums drop-shadow-[0_0_8px_rgba(14,165,233,0.3)]"
                        >
                            {fmt(subtotals[i] || 0)}
                        </div>
                        <button
                            on:click={() => removeLine(i)}
                            disabled={lines.length <= 1}
                            class="p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors rounded-lg hover:bg-red-500/10 mx-auto"
                        >
                            <Trash2 class="w-4 h-4" />
                        </button>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Taxes + Totals Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Taxes -->
            <div
                class="bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden group"
            >
                <div
                    class="absolute -left-16 -top-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>
                <h3 class="flex items-center gap-2 text-base font-bold text-white relative z-10">
                    Impuestos
                </h3>
                <div class="space-y-4 mt-4 relative z-10">
                    <div>
                        <label
                            for="vatRate"
                            class="text-xs font-black tracking-widest text-slate-400 mb-1.5 block uppercase"
                            >IVA</label
                        >
                        <select
                            id="vatRate"
                            bind:value={vatRate}
                            class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all outline-none appearance-none"
                        >
                            <option value={21} class="bg-slate-900 text-white">21% — General</option
                            >
                            <option value={10} class="bg-slate-900 text-white"
                                >10% — Reducido</option
                            >
                            <option value={4} class="bg-slate-900 text-white"
                                >4% — Superreducido</option
                            >
                            <option value={0} class="bg-slate-900 text-white">0% — Exento</option>
                        </select>
                    </div>
                    <div>
                        <label
                            for="irpfRate"
                            class="text-xs font-black tracking-widest text-slate-400 mb-1.5 block uppercase"
                            >Retención IRPF</label
                        >
                        <select
                            id="irpfRate"
                            bind:value={irpfRate}
                            class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all outline-none appearance-none"
                        >
                            <option value={0} class="bg-slate-900 text-white">Sin retención</option>
                            <option value={7} class="bg-slate-900 text-white"
                                >7% — Nuevo autónomo</option
                            >
                            <option value={15} class="bg-slate-900 text-white">15% — General</option
                            >
                        </select>
                    </div>
                </div>
            </div>

            <!-- Summary -->
            <div
                class="bg-brand-500/10 backdrop-blur-xl border border-brand-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
            >
                <div
                    class="absolute -right-20 -bottom-20 w-48 h-48 bg-brand-500 rounded-full blur-3xl opacity-20 pointer-events-none"
                ></div>

                <h3 class="flex items-center gap-2 text-base font-bold text-white relative z-10">
                    Resumen
                </h3>
                <div class="space-y-4 mt-4 relative z-10">
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-400 font-medium">Base imponible</span>
                        <span class="font-bold text-white tabular-nums">{fmt(baseImponible)}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-400 font-medium">IVA ({vatRate}%)</span>
                        <span
                            class="font-bold text-white tabular-nums drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]"
                            >+{fmt(vatAmount)}</span
                        >
                    </div>
                    {#if irpfRate > 0}
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-400 font-medium">IRPF ({irpfRate}%)</span>
                            <span
                                class="font-bold text-rose-400 tabular-nums drop-shadow-[0_0_5px_rgba(251,113,133,0.3)]"
                                >-{fmt(irpfAmount)}</span
                            >
                        </div>
                    {/if}
                    <div
                        class="border-t border-white/10 pt-4 mt-4 flex justify-between items-center"
                    >
                        <span class="text-base font-black text-white tracking-widest uppercase"
                            >TOTAL</span
                        >
                        <div
                            class="text-3xl font-black font-mono tracking-tighter text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        >
                            <span class="text-xl text-brand-400 mr-1">{$currencyStore}</span
                            >{total.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Notes -->
        <div
            class="bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden"
        >
            <h3 class="flex items-center gap-2 text-base font-bold text-white mb-4 relative z-10">
                Observaciones
            </h3>
            <textarea
                bind:value={notes}
                placeholder="Notas o condiciones de pago..."
                rows="3"
                class="w-full bg-black/20 border border-white/5 shadow-inner rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all resize-none relative z-10"
            ></textarea>
        </div>

        <!-- Download Button -->
        <button
            on:click={generatePDF}
            disabled={isGenerating}
            class="w-full bg-brand-600 hover:bg-brand-500 text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] border border-brand-400/20 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
        >
            {#if isGenerating}
                <div
                    class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></div>
                Generando...
            {:else}
                <Download class="w-5 h-5" />
                Descargar Factura PDF
            {/if}
        </button>
    </div>
</ProGate>
