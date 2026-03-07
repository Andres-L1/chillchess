<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { currencyStore } from '$lib/stores/currencyStore';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { Landmark, Percent, Calendar, Calculator, PieChart } from 'lucide-svelte';

    pageHeader.set({
        title: 'Calculadora de Préstamos',
        description:
            'Calcula la cuota mensual y el cuadro de amortización de tu hipoteca o préstamo personal.',
        category: 'Finanzas',
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
    <!-- Background glows -->
    <div class="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div
            class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neat-accent/10 rounded-full blur-[120px] mix-blend-screen"
        ></div>
        <div
            class="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen"
        ></div>
    </div>

    <div class="max-w-4xl mx-auto flex flex-col gap-8">
        <!-- Main Calculator Card -->
        <div class="glass-card p-8 sm:p-10 space-y-10 relative overflow-hidden">
            <div class="flex items-center gap-4 mb-2">
                <div
                    class="p-3 bg-neat-accent/10 text-neat-accent rounded-2xl border border-neat-accent/20"
                >
                    <Calculator class="w-6 h-6" />
                </div>
                <div>
                    <h2 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                        Configuración del Préstamo
                    </h2>
                    <p class="text-xs text-slate-400 font-medium">
                        Ajusta los parámetros para ver el impacto en tus cuotas
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Loan Amount Input -->
                <div class="space-y-4">
                    <label
                        for="loanAmount"
                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"
                    >
                        Monto del Crédito
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
                            class="w-full bg-black/40 border border-white/10 rounded-3xl pl-14 pr-14 py-5 text-white focus:outline-none focus:border-neat-accent focus:ring-1 focus:ring-neat-accent/50 transition-all font-black text-xl shadow-inner tabular-nums"
                        />
                        <div
                            class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-neat-accent font-black text-sm"
                        >
                            {$currencyStore}
                        </div>
                    </div>
                </div>

                <!-- Interest Rate Input -->
                <div class="space-y-4">
                    <label
                        for="annualInterestRate"
                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"
                    >
                        Interés Anual (%)
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
                            class="w-full bg-black/40 border border-white/10 rounded-3xl pl-14 pr-14 py-5 text-white focus:outline-none focus:border-neat-accent focus:ring-1 focus:ring-neat-accent/50 transition-all font-black text-xl shadow-inner tabular-nums"
                        />
                        <div
                            class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-neat-accent font-black text-sm"
                        >
                            %
                        </div>
                    </div>
                </div>

                <!-- Loan Term Input -->
                <div class="space-y-4">
                    <label
                        for="loanTermYears"
                        class="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"
                    >
                        Plazo (Años)
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
                            class="w-full bg-black/40 border border-white/10 rounded-3xl pl-14 pr-14 py-5 text-white focus:outline-none focus:border-neat-accent focus:ring-1 focus:ring-neat-accent/50 transition-all font-black text-xl shadow-inner tabular-nums"
                        />
                        <div
                            class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-neat-accent font-black text-xs uppercase tracking-tighter"
                        >
                            Años
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Results Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Monthly Payment -->
            <div
                class="md:col-span-1 glass-card p-10 flex flex-col justify-center relative group overflow-hidden border-neat-accent/30 bg-neat-accent/5"
            >
                <div
                    class="absolute -top-12 -right-12 w-48 h-48 bg-neat-accent/10 blur-[60px] rounded-full pointer-events-none"
                ></div>

                <h3
                    class="text-[10px] font-black text-neat-accent uppercase tracking-[0.3em] mb-4 flex items-center gap-2"
                >
                    <div
                        class="w-1.5 h-1.5 rounded-full bg-neat-accent shadow-[0_0_10px_#00E5FF]"
                    ></div>
                    CUOTA MENSUAL
                </h3>

                <div class="text-6xl font-black text-white tracking-tighter tabular-nums mb-4">
                    {formatCurrency(monthlyPayment)}
                </div>

                <p class="text-[11px] text-slate-400 font-medium leading-relaxed">
                    Estimación de pago mensual fijo por un total de <span class="text-white"
                        >{totalPayments} cuotas</span
                    >.
                </p>
            </div>

            <!-- Breakdown -->
            <div class="md:col-span-2 glass-card p-10 space-y-8">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="p-2.5 bg-white/5 rounded-xl border border-white/10">
                            <PieChart class="w-5 h-5 text-neat-accent" />
                        </div>
                        <h3 class="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                            Análisis del Crédito
                        </h3>
                    </div>
                    <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Total a devolver: {formatCurrency(totalAmountPaid)}
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-1">
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Suma de Intereses
                        </p>
                        <p class="text-3xl font-black text-red-500/90 tabular-nums">
                            {formatCurrency(totalInterestPaid)}
                        </p>
                        <p class="text-[10px] text-red-500/50 font-black">
                            +{((totalInterestPaid / loanAmount) * 100).toFixed(1)}% sobre el capital
                        </p>
                    </div>

                    <div class="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-1">
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Capital Solicitado
                        </p>
                        <p class="text-3xl font-black text-neat-accent tabular-nums">
                            {formatCurrency(loanAmount)}
                        </p>
                        <p class="text-[10px] text-neat-accent/50 font-black">100% Importe Base</p>
                    </div>
                </div>

                <!-- Visual Bar -->
                <div class="space-y-4 pt-2">
                    <div
                        class="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest"
                    >
                        <span>Capital Reembolsado</span>
                        <span>Costo de Intereses</span>
                    </div>
                    <div
                        class="h-3 bg-black/60 rounded-full overflow-hidden flex border border-white/5 shadow-inner"
                    >
                        <div
                            class="h-full bg-neat-accent shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-1000"
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
