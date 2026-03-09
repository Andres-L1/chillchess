<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { currencyStore } from '$lib/stores/currencyStore';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { Landmark, Percent, Calendar, Calculator, PieChart } from 'lucide-svelte';

    pageHeader.set({
        title: 'SIMULADOR DE PRÉSTAMOS',
        description: 'Proyecta el coste real de tus créditos con precisión absoluta.',
        category: 'FINANZAS',
    });

    let loanAmount = 150000;
    let annualInterestRate = 4.5;
    let loanTermYears = 25;

    // Computed values
    $: monthlyInterestRate = annualInterestRate / 100 / 12;
    $: totalPayments = loanTermYears * 12;

    $: monthlyPayment = (function () {
        if (!loanAmount || !annualInterestRate || !loanTermYears) return 0;
        if (annualInterestRate === 0) return loanAmount / totalPayments;
        return (
            (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments)) /
            (Math.pow(1 + monthlyInterestRate, totalPayments) - 1)
        );
    })();

    $: totalAmountPaid = monthlyPayment * totalPayments;
    $: totalInterestPaid = totalAmountPaid - loanAmount;

    function formatCurrency(amount: number) {
        if (!amount || isNaN(amount) || amount === Infinity) return `0 ${$currencyStore}`;
        return (
            new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(amount) +
            ` ${$currencyStore}`
        );
    }
</script>

<svelte:head>
    <title>Calculadora de Préstamos | ChillChess</title>
    <meta name="description" content="Calcula la cuota mensual de tu hipoteca o préstamo." />
</svelte:head>

<ProGate>
    <!-- No glows for Neo-Brutalism -->

    <div class="max-w-4xl mx-auto flex flex-col gap-8">
        <!-- Main Calculator Card -->
        <div
            class="bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-10 space-y-10 shadow-neo relative overflow-hidden"
        >
            <div class="flex items-center gap-4 mb-2">
                <div class="p-3 bg-primary text-white border-4 border-black shadow-neo-sm">
                    <Calculator class="w-6 h-6" />
                </div>
                <div>
                    <h2
                        class="text-xs font-black text-black dark:text-white uppercase tracking-[0.3em]"
                    >
                        CONFIGURACIÓN DEL PRÉSTAMO
                    </h2>
                    <p class="text-[10px] text-slate-500 font-black uppercase tracking-tight">
                        AJUSTA LOS PARÁMETROS PARA VER EL IMPACTO EN TUS CUOTAS. <span
                            class="text-primary">SIN SORPRESAS.</span
                        >
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Loan Amount Input -->
                <div class="space-y-4">
                    <label
                        for="loanAmount"
                        class="block text-[10px] font-black text-black dark:text-white uppercase tracking-widest ml-1"
                    >
                        CAPITAL SOLICITADO
                    </label>
                    <div class="relative group">
                        <div
                            class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neat-accent transition-colors"
                        >
                            <Landmark class="w-5 h-5" />
                        </div>
                        <input
                            id="loanAmount"
                            type="number"
                            min="0"
                            bind:value={loanAmount}
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-14 py-5 text-black dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all font-black text-xl tabular-nums"
                        />
                        <div
                            class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-primary font-black text-sm"
                        >
                            {$currencyStore}
                        </div>
                    </div>
                </div>

                <!-- Interest Rate Input -->
                <div class="space-y-4">
                    <label
                        for="annualInterestRate"
                        class="block text-[10px] font-black text-black dark:text-white uppercase tracking-widest ml-1"
                    >
                        TIPO DE INTERÉS (TIN)
                    </label>
                    <div class="relative group">
                        <div
                            class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neat-accent transition-colors"
                        >
                            <Percent class="w-5 h-5" />
                        </div>
                        <input
                            id="annualInterestRate"
                            type="number"
                            min="0"
                            step="0.01"
                            bind:value={annualInterestRate}
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-14 py-5 text-black dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all font-black text-xl tabular-nums"
                        />
                        <div
                            class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-primary font-black text-sm"
                        >
                            %
                        </div>
                    </div>
                </div>

                <!-- Loan Term Input -->
                <div class="space-y-4">
                    <label
                        for="loanTermYears"
                        class="block text-[10px] font-black text-black dark:text-white uppercase tracking-widest ml-1"
                    >
                        PLAZO DE AMORTIZACIÓN
                    </label>
                    <div class="relative group">
                        <div
                            class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neat-accent transition-colors"
                        >
                            <Calendar class="w-5 h-5" />
                        </div>
                        <input
                            id="loanTermYears"
                            type="number"
                            min="1"
                            bind:value={loanTermYears}
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-14 py-5 text-black dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all font-black text-xl tabular-nums"
                        />
                        <div
                            class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-primary font-black text-xs uppercase tracking-tighter"
                        >
                            AÑOS
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Results Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Monthly Payment -->
            <div
                class="md:col-span-1 bg-primary border-4 border-black p-10 flex flex-col justify-center relative group overflow-hidden shadow-neo"
            >
                <div
                    class="absolute -top-12 -right-12 w-48 h-48 bg-neat-accent/10 blur-[60px] rounded-full pointer-events-none"
                ></div>

                <h3
                    class="text-[10px] font-black text-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2"
                >
                    <div class="w-1.5 h-1.5 rounded-full bg-black"></div>
                    CUOTA MENSUAL
                </h3>

                <div
                    class="text-6xl font-black text-white tracking-tighter tabular-nums mb-4 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]"
                >
                    {formatCurrency(monthlyPayment)}
                </div>

                <p class="text-[11px] text-black font-bold leading-relaxed">
                    Estimación de pago mensual fijo por un total de <span class="text-white"
                        >{totalPayments} cuotas</span
                    >.
                </p>
            </div>

            <!-- Breakdown -->
            <div
                class="md:col-span-2 bg-white dark:bg-slate-900 border-4 border-black p-10 space-y-8 shadow-neo"
            >
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div
                            class="p-2.5 bg-primary text-white border-2 border-black shadow-neo-sm"
                        >
                            <PieChart class="w-5 h-5" />
                        </div>
                        <h3
                            class="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.3em]"
                        >
                            ANÁLISIS DEL RESULTADO
                        </h3>
                    </div>
                    <div
                        class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest"
                    >
                        TOTAL A DEVOLVER: {formatCurrency(totalAmountPaid)}
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div
                        class="bg-slate-50 dark:bg-slate-800 p-6 border-4 border-black shadow-neo-sm space-y-1"
                    >
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            TOTAL INTERESES
                        </p>
                        <p class="text-3xl font-black text-red-500/90 tabular-nums">
                            {formatCurrency(totalInterestPaid)}
                        </p>
                        <p class="text-[10px] text-red-500/50 font-black">
                            +{((totalInterestPaid / loanAmount) * 100).toFixed(1)}% sobre el capital
                        </p>
                    </div>

                    <div
                        class="bg-slate-50 dark:bg-slate-800 p-6 border-4 border-black shadow-neo-sm space-y-1"
                    >
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            IMPORTE PRINCIPAL
                        </p>
                        <p class="text-3xl font-black text-primary tabular-nums">
                            {formatCurrency(loanAmount)}
                        </p>
                        <p class="text-[10px] text-primary font-black uppercase">
                            100% CAPITAL BASE
                        </p>
                    </div>
                </div>

                <!-- Visual Bar -->
                <div class="space-y-4 pt-2">
                    <div
                        class="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest"
                    >
                        <span>CAPITAL AMORTIZADO</span>
                        <span>COSTE DE INTERESES</span>
                    </div>
                    <div
                        class="h-3 bg-slate-200 dark:bg-slate-700 border-2 border-black overflow-hidden flex shadow-neo-sm"
                    >
                        <div
                            class="h-full bg-primary border-r-2 border-black transition-all duration-1000"
                            style="width: {(loanAmount / totalAmountPaid) * 100 || 0}%"
                        ></div>
                        <div
                            class="h-full bg-red-500/60 transition-all duration-1000"
                            style="width: {(totalInterestPaid / totalAmountPaid) * 100 || 0}%"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</ProGate>
