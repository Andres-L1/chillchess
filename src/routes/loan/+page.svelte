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
            class="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px] mix-blend-screen"
        ></div>
        <div
            class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"
        ></div>
    </div>

    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Main Calculator Card -->
        <div
            class="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
        >
            <!-- Subtle Highlight -->
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            ></div>

            <div class="flex items-center gap-3 mb-8">
                <div class="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                    <Calculator class="w-6 h-6 text-sky-400" />
                </div>
                <div>
                    <h2 class="text-xl font-light text-white tracking-wide">Datos del Préstamo</h2>
                    <p class="text-sm text-slate-400">
                        Introduce los detalles para calcular tu cuota mensual y el total a pagar.
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Loan Amount Input -->
                <div class="space-y-2">
                    <label
                        for="loanAmount"
                        class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                    >
                        Capital del Préstamo
                    </label>
                    <div class="relative group">
                        <div
                            class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors"
                        >
                            <Landmark class="w-5 h-5" />
                        </div>
                        <input
                            id="loanAmount"
                            type="number"
                            min="0"
                            bind:value={loanAmount}
                            class="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/50 transition-all font-medium text-lg shadow-inner"
                        />
                        <div
                            class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 font-medium"
                        >
                            {$currencyStore}
                        </div>
                    </div>
                    <p class="text-[11px] text-slate-500 ml-1">
                        El monto total que solicitas prestado.
                    </p>
                </div>

                <!-- Interest Rate Input -->
                <div class="space-y-2">
                    <label
                        for="annualInterestRate"
                        class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                    >
                        Tasa de Interés Anual
                    </label>
                    <div class="relative group">
                        <div
                            class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors"
                        >
                            <Percent class="w-5 h-5" />
                        </div>
                        <input
                            id="annualInterestRate"
                            type="number"
                            min="0"
                            step="0.01"
                            bind:value={annualInterestRate}
                            class="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/50 transition-all font-medium text-lg shadow-inner"
                        />
                        <div
                            class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 font-medium"
                        >
                            %
                        </div>
                    </div>
                    <p class="text-[11px] text-slate-500 ml-1">T.A.E. o Tipo de Interés Nominal.</p>
                </div>

                <!-- Loan Term Input -->
                <div class="space-y-2">
                    <label
                        for="loanTermYears"
                        class="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                    >
                        Plazo del Préstamo
                    </label>
                    <div class="relative group">
                        <div
                            class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors"
                        >
                            <Calendar class="w-5 h-5" />
                        </div>
                        <input
                            id="loanTermYears"
                            type="number"
                            min="1"
                            bind:value={loanTermYears}
                            class="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/50 transition-all font-medium text-lg shadow-inner"
                        />
                        <div
                            class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 font-medium"
                        >
                            Años
                        </div>
                    </div>
                    <p class="text-[11px] text-slate-500 ml-1">
                        Duración total del préstamo en años.
                    </p>
                </div>
            </div>
        </div>

        <!-- Results Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Monthly Payment -->
            <div
                class="md:col-span-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col justify-center"
            >
                <div
                    class="absolute top-0 right-0 w-32 h-32 bg-sky-400/20 blur-[50px] rounded-full mix-blend-screen pointer-events-none"
                ></div>

                <h3
                    class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2"
                >
                    <span
                        class="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                    ></span>
                    Cuota Mensual
                </h3>
                <div
                    class="text-4xl sm:text-5xl font-light text-white tracking-tight break-words mb-2"
                >
                    {formatCurrency(monthlyPayment)}
                </div>
                <p class="text-sm text-slate-400">
                    Total a pagar cada mes durante {totalPayments} meses.
                </p>
            </div>

            <!-- Breakdown -->
            <div
                class="md:col-span-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
            >
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-2.5 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                        <PieChart class="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 class="text-lg font-light text-white tracking-wide">Desglose Total</h3>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                    <div class="bg-black/30 rounded-2xl p-5 border border-white/5 shadow-inner">
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Total Intereses (+{((totalInterestPaid / loanAmount) * 100).toFixed(
                                1
                            )}%)
                        </p>
                        <p class="text-2xl font-light text-red-400/90">
                            {formatCurrency(totalInterestPaid)}
                        </p>
                    </div>
                    <div class="bg-black/30 rounded-2xl p-5 border border-white/5 shadow-inner">
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Pago Total
                        </p>
                        <p class="text-2xl font-light text-emerald-400/90">
                            {formatCurrency(totalAmountPaid)}
                        </p>
                    </div>
                </div>

                <!-- Simple Visual Bar -->
                <div class="mt-8 flex flex-col gap-2">
                    <div
                        class="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-1"
                    >
                        <span>Capital</span>
                        <span>Intereses</span>
                    </div>
                    <div
                        class="relative w-full h-3 bg-black/50 rounded-full overflow-hidden flex border border-white/10"
                    >
                        <div
                            class="h-full bg-brand-500 shadow-[0_0_10px_var(--tw-colors-brand-500)]"
                            style="width: {(loanAmount / totalAmountPaid) * 100 || 0}%"
                        ></div>
                        <div
                            class="h-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            style="width: {(totalInterestPaid / totalAmountPaid) * 100 || 0}%"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</ProGate>
