<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { onMount, tick } from 'svelte';
    import { Calculator, DollarSign, Clock, ArrowRight, Briefcase, BarChart3 } from 'lucide-svelte';

    pageHeader.set({
        title: 'Valor de mi Hora',
        description: 'Calcula automáticamente tu tarifa ideal como freelancer.',
        category: 'Negocios',
    });

    // ------ Reactive state ------
    let expenses = [
        { label: 'Alquiler / Hipoteca', amount: 800 },
        { label: 'Luz / Agua / Internet', amount: 150 },
        { label: 'Comida', amount: 300 },
        { label: 'Transporte', amount: 100 },
        { label: 'Seguros', amount: 60 },
        { label: 'Software & Herramientas', amount: 50 },
    ];

    let profitMarginPercent = 25;
    let hoursPerWeek = 30;
    let vacationWeeks = 4;

    // Load saved values from localStorage
    onMount(() => {
        try {
            const saved = localStorage.getItem('freelance_data');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.expenses) expenses = data.expenses;
                if (data.profitMarginPercent) profitMarginPercent = data.profitMarginPercent;
                if (data.hoursPerWeek) hoursPerWeek = data.hoursPerWeek;
                if (data.vacationWeeks) vacationWeeks = data.vacationWeeks;
            }
        } catch {}
    });

    // Save to localStorage reactively
    $: if (typeof window !== 'undefined') {
        localStorage.setItem(
            'freelance_data',
            JSON.stringify({ expenses, profitMarginPercent, hoursPerWeek, vacationWeeks })
        );
    }

    // -------- Derived calculations --------
    $: totalMonthlyExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    $: totalAnnualExpenses = totalMonthlyExpenses * 12;
    $: annualBillableHours = hoursPerWeek * (52 - vacationWeeks);
    $: annualTarget = totalAnnualExpenses * (1 + profitMarginPercent / 100);
    $: hourlyRate = annualBillableHours > 0 ? annualTarget / annualBillableHours : 0;
    $: dailyRate = hourlyRate * 8;
    $: projectRate = hourlyRate * 40;

    function addExpense() {
        expenses = [...expenses, { label: '', amount: 0 }];
    }
    function removeExpense(index: number) {
        expenses = expenses.filter((_, i) => i !== index);
    }
</script>

<svelte:head>
    <title>Calculadora Freelance | MultiTool</title>
    <meta
        name="description"
        content="Calcula tu tarifa por hora como freelancer basándote en tus gastos fijos, margen de beneficio e impuestos."
    />
</svelte:head>

<div class="flex flex-col lg:flex-row gap-8">
    <!-- Left Column: Inputs -->
    <div class="flex-1 space-y-6">
        <!-- Monthly Expenses Card -->
        <div
            class="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 shadow-lg shadow-black/10 space-y-4"
        >
            <div class="flex items-center justify-between mb-2">
                <h3
                    class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2"
                >
                    <DollarSign class="w-4 h-4 text-brand-400" />
                    Gastos Mensuales Fijos
                </h3>
                <button
                    on:click={addExpense}
                    class="text-xs font-bold text-brand-400 hover:text-brand-300 px-3 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-colors border border-brand-500/20"
                >
                    + Añadir
                </button>
            </div>

            {#each expenses as expense, i}
                <div class="flex items-center gap-2 sm:gap-3 group">
                    <input
                        type="text"
                        bind:value={expense.label}
                        placeholder="Concepto"
                        class="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                    />
                    <div class="relative w-24 sm:w-28">
                        <span
                            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold"
                            >€</span
                        >
                        <input
                            type="number"
                            bind:value={expense.amount}
                            min="0"
                            class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-7 pr-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                    </div>
                    <button
                        on:click={() => removeExpense(i)}
                        class="text-slate-600 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all text-xs font-bold flex-shrink-0 p-1"
                    >
                        ✕
                    </button>
                </div>
            {/each}

            <div class="pt-3 border-t border-slate-700/50 flex justify-between items-center">
                <span class="text-sm font-bold text-slate-400">Total Mensual</span>
                <span class="text-xl font-black text-white font-mono"
                    >{totalMonthlyExpenses.toFixed(0)}€</span
                >
            </div>
        </div>

        <!-- Parameters Card -->
        <div
            class="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 shadow-lg shadow-black/10 space-y-5"
        >
            <h3
                class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2"
            >
                <BarChart3 class="w-4 h-4 text-brand-400" />
                Parámetros
            </h3>

            <div>
                <label
                    for="profit-margin"
                    class="flex justify-between text-xs font-bold text-slate-400 mb-2"
                >
                    <span>Margen de beneficio</span>
                    <span class="bg-slate-700/50 px-2 py-0.5 rounded font-bold text-brand-400"
                        >{profitMarginPercent}%</span
                    >
                </label>
                <input
                    id="profit-margin"
                    type="range"
                    min="0"
                    max="100"
                    bind:value={profitMarginPercent}
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
            </div>

            <div>
                <label
                    for="hours-week"
                    class="flex justify-between text-xs font-bold text-slate-400 mb-2"
                >
                    <span>Horas facturables / semana</span>
                    <span class="bg-slate-700/50 px-2 py-0.5 rounded font-bold text-brand-400"
                        >{hoursPerWeek}h</span
                    >
                </label>
                <input
                    id="hours-week"
                    type="range"
                    min="10"
                    max="60"
                    bind:value={hoursPerWeek}
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
            </div>

            <div>
                <label
                    for="vacation-weeks"
                    class="flex justify-between text-xs font-bold text-slate-400 mb-2"
                >
                    <span>Semanas de vacaciones / año</span>
                    <span class="bg-slate-700/50 px-2 py-0.5 rounded font-bold text-brand-400"
                        >{vacationWeeks} sem</span
                    >
                </label>
                <input
                    id="vacation-weeks"
                    type="range"
                    min="0"
                    max="12"
                    bind:value={vacationWeeks}
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
            </div>
        </div>
    </div>

    <!-- Right Column: Results -->
    <div class="w-full lg:w-80 flex flex-col gap-6">
        <!-- Main Rate Card -->
        <div
            class="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-6 flex flex-col justify-between"
        >
            <div
                class="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-10 pointer-events-none"
            ></div>
            <div class="relative z-10">
                <p class="text-brand-200 text-sm font-medium mb-1 flex items-center gap-2">
                    <Clock class="w-4 h-4" /> Tu Tarifa Ideal
                </p>
                <div class="text-5xl font-black font-mono tracking-tighter text-white tabular-nums">
                    {hourlyRate.toFixed(2)}€
                </div>
                <p class="text-brand-300 text-sm font-medium mt-1">por hora</p>
            </div>
            <div class="h-px bg-white/10 my-5"></div>
            <div class="grid grid-cols-2 gap-4 relative z-10">
                <div>
                    <p class="text-brand-200/70 text-xs mb-1">Tarifa Diaria (8h)</p>
                    <p class="text-xl font-bold font-mono">{dailyRate.toFixed(0)}€</p>
                </div>
                <div class="text-right">
                    <p class="text-brand-200/70 text-xs mb-1">Proyecto (40h)</p>
                    <p class="text-xl font-bold font-mono">{projectRate.toFixed(0)}€</p>
                </div>
            </div>
        </div>

        <!-- Annual Summary -->
        <div
            class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-lg shadow-black/10 space-y-4"
        >
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Resumen Anual</h4>
            <div class="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span class="text-sm text-slate-400">Gastos Anuales</span>
                <span class="text-sm font-bold text-white font-mono"
                    >{totalAnnualExpenses.toLocaleString()}€</span
                >
            </div>
            <div class="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span class="text-sm text-slate-400">Objetivo + Beneficio</span>
                <span class="text-sm font-bold text-brand-400 font-mono"
                    >{annualTarget.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€</span
                >
            </div>
            <div class="flex justify-between items-center py-2">
                <span class="text-sm text-slate-400">Horas Facturables</span>
                <span class="text-sm font-bold text-white font-mono">{annualBillableHours}h</span>
            </div>
        </div>
    </div>
</div>
