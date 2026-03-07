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
        title: 'Valor de mi Hora',
        description: 'Calcula automáticamente tu tarifa ideal como freelancer.',
        category: 'Negocios',
    });

    // ------ Reactive state ------
    const DEFAULT_EXPENSES = [
        { label: 'Alquiler / Hipoteca', amount: 700 },
        { label: 'Internet + Móvil', amount: 60 },
        { label: 'Seguros', amount: 80 },
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
    <div class="relative max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
        <!-- Ambient Background Glows -->
        <div
            class="absolute top-0 right-0 w-[600px] h-[600px] bg-neat-accent/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
        ></div>
        <div
            class="absolute bottom-[-200px] left-0 w-[500px] h-[500px] bg-slate-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
        ></div>

        <!-- Left Column: Inputs -->
        <div class="flex-1 space-y-8">
            <!-- Monthly Expenses Card -->
            <div class="glass-card p-8 sm:p-10 space-y-8">
                <div class="flex items-center justify-between">
                    <h3
                        class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"
                    >
                        <div
                            class="p-2.5 bg-neat-accent/10 text-neat-accent rounded-xl border border-neat-accent/20"
                        >
                            <DollarSign class="w-4 h-4" />
                        </div>
                        Gastos Mensuales Fijos
                    </h3>
                    <button
                        on:click={addExpense}
                        class="text-[10px] font-black text-white px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                    >
                        <Plus class="w-4 h-4" /> Añadir Gasto
                    </button>
                </div>

                <div class="space-y-4">
                    {#each expenses as expense, i}
                        <div class="flex items-center gap-3 group/row" transition:fade>
                            <div class="flex-1 relative">
                                <input
                                    type="text"
                                    bind:value={expense.label}
                                    placeholder="Concepto (ej. Alquiler)"
                                    class="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all"
                                />
                            </div>
                            <div class="relative w-32 sm:w-40">
                                <span
                                    class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-black uppercase"
                                    >{$currencyStore}</span
                                >
                                <input
                                    type="number"
                                    bind:value={expense.amount}
                                    min="0"
                                    class="w-full bg-black/20 border border-white/5 rounded-2xl pl-10 pr-5 py-4 text-sm font-black text-white focus:outline-none focus:border-neat-accent/30 transition-all tabular-nums"
                                />
                            </div>
                            <button
                                on:click={() => removeExpense(i)}
                                class="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white bg-white/5 hover:bg-red-500/20 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all active:scale-90 shadow-sm"
                            >
                                <X class="w-5 h-5" />
                            </button>
                        </div>
                    {/each}
                </div>

                <div class="pt-8 border-t border-white/5 flex justify-between items-center">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
                        >Total Gastos</span
                    >
                    <div
                        class="text-3xl font-black text-white tracking-tighter tabular-nums drop-shadow-xl"
                    >
                        {totalMonthlyExpenses.toLocaleString('es-ES')}
                        <span class="text-neat-accent text-lg ml-1 uppercase">{$currencyStore}</span
                        >
                    </div>
                </div>
            </div>

            <!-- Parameters Card -->
            <div class="glass-card p-8 sm:p-10 space-y-10">
                <h3
                    class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"
                >
                    <div
                        class="p-2.5 bg-neat-accent/10 text-neat-accent rounded-xl border border-neat-accent/20"
                    >
                        <BarChart3 class="w-4 h-4" />
                    </div>
                    Configuración de Parámetros
                </h3>

                <div class="space-y-12">
                    <!-- Profit Margin -->
                    <div class="space-y-6">
                        <div class="flex justify-between items-end">
                            <label for="profit-margin" class="space-y-1">
                                <span
                                    class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
                                    >Margen de beneficio</span
                                >
                                <span class="block text-xs text-slate-400 font-medium"
                                    >Porcentaje extra para ahorros e inversión</span
                                >
                            </label>
                            <span class="text-2xl font-black text-neat-accent tabular-nums"
                                >{profitMarginPercent}%</span
                            >
                        </div>
                        <input
                            id="profit-margin"
                            type="range"
                            min="0"
                            max="100"
                            bind:value={profitMarginPercent}
                            class="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-neat-accent"
                        />
                    </div>

                    <!-- Hours per Week -->
                    <div class="space-y-6">
                        <div class="flex justify-between items-end">
                            <label for="hours-week" class="space-y-1">
                                <span
                                    class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
                                    >Horas Facturables</span
                                >
                                <span class="block text-xs text-slate-400 font-medium"
                                    >Horas reales que puedes cobrar por semana</span
                                >
                            </label>
                            <span class="text-2xl font-black text-neat-accent tabular-nums"
                                >{hoursPerWeek}h</span
                            >
                        </div>
                        <input
                            id="hours-week"
                            type="range"
                            min="0"
                            max="60"
                            bind:value={hoursPerWeek}
                            class="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-neat-accent"
                        />
                    </div>

                    <!-- Vacation Weeks -->
                    <div class="space-y-6">
                        <div class="flex justify-between items-end">
                            <label for="vacation-weeks" class="space-y-1">
                                <span
                                    class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"
                                    >Vacaciones</span
                                >
                                <span class="block text-xs text-slate-400 font-medium"
                                    >Semanas de descanso al año (no cobradas)</span
                                >
                            </label>
                            <span class="text-2xl font-black text-neat-accent tabular-nums"
                                >{vacationWeeks} sem</span
                            >
                        </div>
                        <input
                            id="vacation-weeks"
                            type="range"
                            min="0"
                            max="12"
                            bind:value={vacationWeeks}
                            class="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-neat-accent"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Results -->
        <div class="w-full lg:w-[400px] flex flex-col gap-8 lg:shrink-0">
            <!-- Main Rate Card -->
            <div
                class="glass-card !bg-neat-accent p-10 flex flex-col items-center text-center text-black overflow-hidden relative group"
            >
                <!-- Decorative Circle -->
                <div
                    class="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"
                ></div>

                <div class="p-4 bg-black/10 rounded-[2rem] mb-8 relative z-10">
                    <Calculator class="w-8 h-8" />
                </div>

                <p
                    class="text-[10px] font-black uppercase tracking-[0.4em] mb-4 relative z-10 opacity-70"
                >
                    Tu Tarifa Ideal
                </p>

                <div class="flex items-start justify-center relative z-10 mb-2">
                    <span class="text-2xl font-black mt-2 mr-2">{$currencyStore}</span>
                    <span class="text-8xl font-black tracking-tighter leading-none">
                        {hourlyRate.toFixed(0)}
                    </span>
                    <span class="text-2xl font-black mt-2 ml-1"
                        >.{hourlyRate.toFixed(2).split('.')[1]}</span
                    >
                </div>
                <p class="text-sm font-black uppercase tracking-widest opacity-60 relative z-10">
                    Por Hora
                </p>

                <div
                    class="w-full grid grid-cols-2 gap-4 mt-12 pt-10 border-t border-black/10 relative z-10"
                >
                    <div class="space-y-1">
                        <p
                            class="text-[10px] font-black uppercase tracking-widest opacity-60 text-black/60"
                        >
                            Día (8h)
                        </p>
                        <p class="text-2xl font-black tabular-nums">
                            {$currencyStore}{dailyRate.toFixed(0)}
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p
                            class="text-[10px] font-black uppercase tracking-widest opacity-60 text-black/60"
                        >
                            Semana
                        </p>
                        <p class="text-2xl font-black tabular-nums">
                            {$currencyStore}{projectRate.toFixed(0)}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Annual Summary -->
            <div class="glass-card p-8 sm:p-10 space-y-8 relative overflow-hidden">
                <div
                    class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"
                ></div>

                <h4
                    class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 relative z-10"
                >
                    Resumen Anual
                </h4>

                <div class="space-y-6 relative z-10">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3 text-slate-300">
                            <div class="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                            <span class="text-xs font-bold uppercase tracking-widest">Gastos</span>
                        </div>
                        <span class="text-sm font-black text-white tabular-nums">
                            {totalAnnualExpenses.toLocaleString('es-ES')}
                            {$currencyStore}
                        </span>
                    </div>

                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3 text-slate-300">
                            <div class="w-1.5 h-1.5 rounded-full bg-neat-accent"></div>
                            <span class="text-xs font-bold uppercase tracking-widest">Objetivo</span
                            >
                        </div>
                        <span class="text-sm font-black text-neat-accent tabular-nums">
                            {annualTarget.toLocaleString('es-ES')}
                            {$currencyStore}
                        </span>
                    </div>

                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3 text-slate-300">
                            <div class="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                            <span class="text-xs font-bold uppercase tracking-widest">Horas</span>
                        </div>
                        <span class="text-sm font-black text-indigo-400 tabular-nums">
                            {annualBillableHours}h
                            <span class="text-[10px] text-slate-600 ml-1">COBRABLES</span>
                        </span>
                    </div>
                </div>

                <div class="p-5 bg-white/5 rounded-2xl border border-white/5 relative z-10 mt-4">
                    <p class="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Tarifa calculada para cubrir tus gastos fijos anuales ajustados con un
                        margen de beneficio del {profitMarginPercent}%.
                    </p>
                </div>
            </div>
        </div>
    </div>
</ProGate>
