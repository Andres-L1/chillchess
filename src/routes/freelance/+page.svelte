<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { onMount } from 'svelte';
    import {
        Calculator,
        DollarSign,
        Clock,
        ArrowRight,
        Briefcase,
        BarChart3,
        Plus,
        X,
    } from 'lucide-svelte';
    import { fade } from 'svelte/transition';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { currencyStore } from '$lib/stores/currencyStore';
    import { browser } from '$app/environment';

    pageHeader.set({
        title: 'TARIFA FREELANCE',
        description: 'Calcula tu tasa horaria profesional con precisión absoluta.',
        category: 'TRABAJO',
    });

    // ------ Reactive state ------
    const DEFAULT_EXPENSES = [
        { label: 'ALQUILER / HIPOTECA', amount: 700 },
        { label: 'INTERNET + MÓVIL', amount: 60 },
        { label: 'SEGUROS', amount: 80 },
    ];

    let expenses: { label: string; amount: number }[] = DEFAULT_EXPENSES;
    let profitMarginPercent = 30;
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

    // Save to localStorage reactively (only in browser)
    $: if (browser) {
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
    <title>Calculadora Freelance | ChillChess</title>
    <meta
        name="description"
        content="Calcula tu tarifa por hora como freelancer basándote en tus gastos fijos, margen de beneficio e impuestos."
    />
</svelte:head>

<ProGate>
    <div class="relative max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 py-10 px-4">
        <!-- Left Column: Inputs -->
        <div class="flex-1 space-y-12">
            <!-- Header Section -->
            <div class="space-y-4">
                <h2
                    class="text-6xl md:text-8xl font-black text-black dark:text-white tracking-tighter uppercase leading-none"
                >
                    CALCULA <br />
                    <span
                        class="bg-primary text-white px-4 border-4 border-black shadow-neo-sm inline-block transform -rotate-1"
                        >TU TARIFA</span
                    >
                </h2>
                <p
                    class="text-black dark:text-slate-400 font-bold text-xl tracking-tighter uppercase max-w-xl"
                >
                    DEFINE TUS TARIFAS CON <span class="bg-primary text-white px-2 italic"
                        >PRECISIÓN PROFESIONAL /</span
                    > SIN ADIVINAR.
                </p>
            </div>

            <!-- Monthly Expenses Card -->
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 md:p-12 shadow-neo space-y-10"
            >
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div class="flex items-center gap-4">
                        <div class="w-3 h-10 bg-primary border-2 border-black"></div>
                        <h3 class="text-lg font-black text-black uppercase tracking-tight">
                            GASTOS FIJOS MENSUALES
                        </h3>
                    </div>
                    <button
                        on:click={addExpense}
                        class="bg-white dark:bg-slate-800 border-4 border-black px-6 py-3 text-xs font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-neo-sm dark:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 dark:text-white"
                    >
                        <Plus class="w-4 h-4" /> AÑADIR GASTO
                    </button>
                </div>

                <div class="space-y-6">
                    {#each expenses as expense, i}
                        <div
                            class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 group/row"
                            transition:fade
                        >
                            <div class="flex-1">
                                <input
                                    type="text"
                                    bind:value={expense.label}
                                    placeholder="CONCEPTO (EJ. ALQUILER)"
                                    class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-sm font-black text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all uppercase tracking-tight"
                                />
                            </div>
                            <div class="relative flex-1 sm:max-w-[200px]">
                                <div
                                    class="absolute left-4 top-1/2 -translate-y-1/2 text-black text-xs font-black uppercase pointer-events-none"
                                >
                                    {$currencyStore}
                                </div>
                                <input
                                    type="number"
                                    bind:value={expense.amount}
                                    min="0"
                                    class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black pl-12 pr-6 py-4 text-lg font-black text-black dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all tabular-nums"
                                />
                            </div>
                            <button
                                on:click={() => removeExpense(i)}
                                class="aspect-square w-14 flex items-center justify-center bg-white dark:bg-slate-800 border-4 border-black hover:bg-red-500 hover:text-white transition-colors shadow-neo-sm dark:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none dark:text-white"
                            >
                                <X class="w-6 h-6" />
                            </button>
                        </div>
                    {/each}
                </div>

                <div
                    class="pt-10 border-t-4 border-black flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                    <span class="text-sm font-black text-slate-500 uppercase tracking-widest"
                        >TOTAL GASTOS MENSUALES</span
                    >
                    <div
                        class="text-5xl font-black text-black dark:text-white tracking-tighter tabular-nums drop-shadow-[2px_2px_0_rgba(255,62,0,0.3)]"
                    >
                        <span class="text-primary mr-2">{$currencyStore} /</span
                        >{totalMonthlyExpenses.toLocaleString('es-ES')}
                    </div>
                </div>
            </div>

            <!-- Parameters Card -->
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 md:p-12 shadow-neo space-y-14"
            >
                <div class="flex items-center gap-4">
                    <div class="w-3 h-10 bg-black dark:bg-white border-2 border-black"></div>
                    <h3
                        class="text-lg font-black text-black dark:text-white uppercase tracking-tight"
                    >
                        CONFIGURACIÓN DE PARÁMETROS
                    </h3>
                </div>

                <div class="space-y-16">
                    <!-- Profit Margin -->
                    <div class="space-y-6">
                        <div class="flex justify-between items-end">
                            <label for="profit-margin" class="space-y-1">
                                <span
                                    class="block text-sm font-black text-black dark:text-white uppercase"
                                    >BENEFICIO NETO</span
                                >
                                <span class="block text-xs text-slate-500 font-bold uppercase"
                                    >PORCENTAJE DESTINADO A AHORRO E INVERSIÓN</span
                                >
                            </label>
                            <span
                                class="bg-black dark:bg-white text-white dark:text-black px-4 py-1 text-2xl font-black tabular-nums border-2 border-black"
                            >
                                {profitMarginPercent}%
                            </span>
                        </div>
                        <div class="relative h-8 flex items-center">
                            <input
                                id="profit-margin"
                                type="range"
                                min="0"
                                max="100"
                                bind:value={profitMarginPercent}
                                class="w-full h-4 bg-slate-200 dark:bg-slate-700 border-2 border-black appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    <!-- Hours per Week -->
                    <div class="space-y-6">
                        <div class="flex justify-between items-end">
                            <label for="hours-week" class="space-y-1">
                                <span
                                    class="block text-sm font-black text-black dark:text-white uppercase"
                                    >HORAS COBRABLES / SEMANA</span
                                >
                                <span class="block text-xs text-slate-500 font-bold uppercase"
                                    >TIEMPO REAL DEDICADO A PROYECTOS</span
                                >
                            </label>
                            <span
                                class="bg-primary text-white px-4 py-1 text-2xl font-black tabular-nums border-2 border-black"
                            >
                                {hoursPerWeek}H
                            </span>
                        </div>
                        <div class="relative h-8 flex items-center">
                            <input
                                id="hours-week"
                                type="range"
                                min="0"
                                max="60"
                                bind:value={hoursPerWeek}
                                class="w-full h-4 bg-slate-200 dark:bg-slate-700 border-2 border-black appearance-none cursor-pointer accent-black dark:accent-white"
                            />
                        </div>
                    </div>

                    <!-- Vacation Weeks -->
                    <div class="space-y-6">
                        <div class="flex justify-between items-end">
                            <label for="vacation-weeks" class="space-y-1">
                                <span
                                    class="block text-sm font-black text-black dark:text-white uppercase"
                                    >DESCANSO ANUAL</span
                                >
                                <span class="block text-xs text-slate-500 font-bold uppercase"
                                    >SEMANAS DE VACACIONES NO PAGADAS</span
                                >
                            </label>
                            <span
                                class="bg-white dark:bg-slate-900 text-black dark:text-white px-4 py-1 text-2xl font-black tabular-nums border-2 border-black"
                            >
                                {vacationWeeks} SEM
                            </span>
                        </div>
                        <div class="relative h-8 flex items-center">
                            <input
                                id="vacation-weeks"
                                type="range"
                                min="0"
                                max="12"
                                bind:value={vacationWeeks}
                                class="w-full h-4 bg-slate-200 dark:bg-slate-700 border-2 border-black appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Results -->
        <div class="w-full lg:w-[450px] flex flex-col gap-10 lg:shrink-0 lg:pt-32">
            <!-- Main Rate Card -->
            <div
                class="bg-primary border-4 border-black p-12 flex flex-col items-center text-center text-white shadow-neo relative overflow-hidden group"
            >
                <!-- Decorative pattern -->
                <div
                    class="absolute top-0 right-0 w-32 h-32 bg-white/10 -rotate-12 translate-x-8 -translate-y-8 pointer-events-none"
                ></div>

                <div
                    class="w-16 h-16 bg-white dark:bg-slate-900 border-4 border-black flex items-center justify-center mb-8 shadow-neo-sm transform -rotate-3 group-hover:rotate-0 transition-transform"
                >
                    <Calculator class="w-8 h-8 text-black" />
                </div>

                <p class="text-xs font-black uppercase tracking-[0.3em] mb-4 text-black">
                    TU TARIFA IDEAL
                </p>

                <div class="flex items-start justify-center mb-6">
                    <span class="text-4xl font-black mt-4 mr-2 text-black">{$currencyStore}</span>
                    <span
                        class="text-[120px] font-black tracking-tighter leading-none text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]"
                    >
                        {hourlyRate.toFixed(0)}
                    </span>
                    <div class="flex flex-col items-start mt-4 ml-1">
                        <span class="text-3xl font-black text-black/60"
                            >.{hourlyRate.toFixed(2).split('.')[1]}</span
                        >
                    </div>
                </div>

                <p
                    class="bg-black text-white px-8 py-2 text-sm font-black uppercase tracking-widest shadow-neo-sm border-2 border-white"
                >
                    POR HORA
                </p>

                <div class="w-full grid grid-cols-2 gap-8 mt-12 pt-10 border-t-4 border-black/20">
                    <div class="space-y-1">
                        <p class="text-xs font-black uppercase tracking-widest text-black/50">
                            DÍA (8H)
                        </p>
                        <p class="text-3xl font-black tabular-nums tracking-tighter">
                            {$currencyStore}{dailyRate.toFixed(0)}
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-xs font-black uppercase tracking-widest text-black/50">
                            PROYECTO
                        </p>
                        <p class="text-3xl font-black tabular-nums tracking-tighter">
                            {$currencyStore}{projectRate.toFixed(0)}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Annual Summary -->
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-10 space-y-10 shadow-neo"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-2 h-2 bg-black dark:bg-white border border-black dark:border-white"
                    ></div>
                    <h4
                        class="text-sm font-black text-black dark:text-white uppercase tracking-widest"
                    >
                        RESUMEN ANUAL
                    </h4>
                </div>

                <div class="space-y-8">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-black text-slate-500 uppercase"
                            >GASTOS TOTALES</span
                        >
                        <span
                            class="text-2xl font-black text-black dark:text-white tabular-nums tracking-tighter"
                        >
                            {totalAnnualExpenses.toLocaleString('es-ES')}
                            {$currencyStore}
                        </span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-xs font-black text-slate-500 uppercase"
                            >OBJETIVO DE FACTURACIÓN</span
                        >
                        <span
                            class="text-2xl font-black text-primary tabular-nums tracking-tighter"
                        >
                            {annualTarget.toLocaleString('es-ES')}
                            {$currencyStore}
                        </span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-xs font-black text-slate-500 uppercase"
                            >HORAS COBRABLES</span
                        >
                        <span
                            class="text-2xl font-black text-black dark:text-white tabular-nums tracking-tighter"
                        >
                            {annualBillableHours} H
                        </span>
                    </div>
                </div>

                <div
                    class="p-6 bg-slate-50 dark:bg-slate-800 border-4 border-black dark:border-white/20 border-dashed"
                >
                    <p
                        class="text-xs text-black dark:text-white font-bold uppercase leading-relaxed"
                    >
                        TARIFA CALCULADA PARA CUBRIR GASTOS CON UN MARGEN DE BENEFICIO DEL <span
                            class="bg-primary text-white px-1">{profitMarginPercent}%</span
                        >.
                    </p>
                </div>
            </div>
        </div>
    </div>
</ProGate>

<style>
    input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 24px;
        height: 24px;
        background: white;
        border: 4px solid black;
        cursor: pointer;
        box-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
    }

    input[type='range']::-moz-range-thumb {
        width: 24px;
        height: 24px;
        background: white;
        border: 4px solid black;
        cursor: pointer;
        box-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
    }

    input[type='number']::-webkit-inner-spin-button,
    input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
