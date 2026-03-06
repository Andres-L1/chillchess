<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { onMount } from 'svelte';
    import { Calculator, DollarSign, Clock, ArrowRight, Briefcase, BarChart3 } from 'lucide-svelte';
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
    <div class="relative max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
        <!-- Ambient Background Glows -->
        <div
            class="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
        ></div>
        <div
            class="absolute bottom-[-200px] left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
        ></div>

        <!-- Left Column: Inputs -->
        <div class="flex-1 space-y-6">
            <!-- Monthly Expenses Card -->
            <div
                class="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-sm relative overflow-hidden group/panel"
            >
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                ></div>

                <div class="flex items-center justify-between mb-6 relative z-10">
                    <h3
                        class="text-sm font-bold text-white tracking-wide flex items-center gap-3 relative z-10"
                    >
                        <div
                            class="p-2 bg-white/5 text-slate-300 rounded-lg shadow-sm border border-white/10"
                        >
                            <DollarSign class="w-4 h-4" />
                        </div>
                        Gastos Mensuales Fijos
                    </h3>
                    <button
                        on:click={addExpense}
                        class="text-xs font-medium text-white px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 shadow-sm active:scale-95 flex items-center gap-1"
                    >
                        <span>+</span> Añadir
                    </button>
                </div>

                <div class="relative z-10 space-y-4">
                    {#each expenses as expense, i}
                        <div class="flex items-center gap-2 sm:gap-3 group/row">
                            <div class="flex-1 relative group">
                                <div
                                    class="absolute -inset-0.5 bg-white rounded-xl blur opacity-0 group-focus-within:opacity-10 transition duration-500 pointer-events-none"
                                ></div>
                                <input
                                    type="text"
                                    bind:value={expense.label}
                                    placeholder="Concepto"
                                    class="relative w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 focus:bg-white/10 shadow-sm transition-all"
                                />
                            </div>
                            <div class="relative w-28 sm:w-36 group">
                                <span
                                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold z-10"
                                    >{$currencyStore}</span
                                >
                                <div
                                    class="absolute -inset-0.5 bg-white rounded-xl blur opacity-0 group-focus-within:opacity-10 transition duration-500 pointer-events-none"
                                ></div>
                                <input
                                    type="number"
                                    bind:value={expense.amount}
                                    min="0"
                                    class="relative w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center pl-8 sm:pl-10 pr-4 py-3.5 text-sm sm:text-base font-bold text-white focus:outline-none focus:border-white/30 focus:bg-white/10 shadow-sm transition-all"
                                />
                            </div>
                            <button
                                on:click={() => removeExpense(i)}
                                class="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-red-400 bg-white/5 hover:bg-red-500/20 rounded-xl border border-white/10 hover:border-red-500/30 transition-all active:scale-90 shadow-sm group/btn"
                                title="Eliminar gasto"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="group-hover/btn:scale-110 transition-transform"
                                    ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
                                >
                            </button>
                        </div>
                    {/each}
                </div>

                <div
                    class="pt-6 mt-6 border-t border-white/10 flex justify-between items-center relative z-10"
                >
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest"
                        >Total Mensual</span
                    >
                    <span class="text-2xl sm:text-3xl font-black text-white drop-shadow-md"
                        >{totalMonthlyExpenses.toFixed(0)}<span
                            class="text-slate-400 font-medium ml-1">{$currencyStore}</span
                        ></span
                    >
                </div>
            </div>

            <!-- Parameters Card -->
            <div
                class="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-sm relative overflow-hidden group/panel"
            >
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                ></div>

                <h3
                    class="text-sm font-bold text-white tracking-wide mb-6 flex items-center gap-3 relative z-10"
                >
                    <div
                        class="p-2 bg-white/5 text-slate-300 rounded-lg shadow-sm border border-white/10"
                    >
                        <BarChart3 class="w-4 h-4" />
                    </div>
                    Configuración de Parámetros
                </h3>

                <div class="space-y-6 relative z-10">
                    <div
                        class="bg-black/20 p-4 sm:p-5 rounded-2xl border border-white/10 shadow-sm"
                    >
                        <label
                            for="profit-margin"
                            class="flex justify-between text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider"
                        >
                            <span class="flex items-center gap-2"
                                ><Briefcase class="w-3.5 h-3.5 text-emerald-400" /> Margen de beneficio</span
                            >
                            <span
                                class="bg-white/10 px-2 py-0.5 rounded-md font-mono text-emerald-400 border border-white/10"
                                >{profitMarginPercent}%</span
                            >
                        </label>
                        <input
                            id="profit-margin"
                            type="range"
                            min="0"
                            max="100"
                            bind:value={profitMarginPercent}
                            class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-colors shadow-inner"
                        />
                    </div>

                    <div
                        class="bg-black/20 p-4 sm:p-5 rounded-2xl border border-white/10 shadow-sm"
                    >
                        <label
                            for="hours-week"
                            class="flex justify-between text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider"
                        >
                            <span class="flex items-center gap-2"
                                ><Clock class="w-3.5 h-3.5 text-brand-400" /> Horas facturables / semana</span
                            >
                            <span
                                class="bg-white/10 px-2 py-0.5 rounded-md font-mono text-brand-400 border border-white/10"
                                >{hoursPerWeek}h</span
                            >
                        </label>
                        <input
                            id="hours-week"
                            type="range"
                            min="0"
                            max="60"
                            bind:value={hoursPerWeek}
                            class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-400 transition-colors shadow-inner"
                        />
                    </div>

                    <div
                        class="bg-black/20 p-4 sm:p-5 rounded-2xl border border-white/10 shadow-sm"
                    >
                        <label
                            for="vacation-weeks"
                            class="flex justify-between text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider"
                        >
                            <span class="flex items-center gap-2"
                                ><svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="text-orange-400"
                                    ><path
                                        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                    /></svg
                                > Semanas de vacaciones / año</span
                            >
                            <span
                                class="bg-white/10 px-2 py-0.5 rounded-md font-mono text-orange-400 border border-white/10"
                                >{vacationWeeks}</span
                            >
                        </label>
                        <input
                            id="vacation-weeks"
                            type="range"
                            min="0"
                            max="12"
                            bind:value={vacationWeeks}
                            class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-colors shadow-inner"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Results -->
        <div class="w-full lg:w-96 flex flex-col gap-6 lg:shrink-0 lg:sticky lg:top-24 h-max">
            <!-- Main Rate Card -->
            <div
                class="relative w-full rounded-3xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-3xl border border-white/20 text-white p-8 sm:p-10 flex flex-col group transition-all duration-500 hover:scale-[1.01]"
            >
                <!-- Background animations -->
                <div
                    class="absolute -right-20 -top-20 w-80 h-80 bg-white rounded-full blur-[80px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700"
                ></div>
                <div
                    class="absolute -left-20 -bottom-20 w-60 h-60 bg-white rounded-full blur-[60px] opacity-5 pointer-events-none group-hover:opacity-15 transition-opacity duration-700"
                ></div>
                <div
                    class="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"
                ></div>

                <div class="relative z-10 flex-1 flex flex-col items-center text-center">
                    <div
                        class="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-inner border border-white/20"
                    >
                        <Calculator class="w-6 h-6 text-slate-200" />
                    </div>

                    <p
                        class="text-slate-300 text-xs sm:text-sm font-bold mb-3 uppercase tracking-widest drop-shadow-sm"
                    >
                        Tu Tarifa Ideal
                    </p>

                    <div
                        class="flex items-start justify-center text-6xl sm:text-7xl font-light tracking-tighter text-white drop-shadow-sm mb-1"
                    >
                        <span class="text-3xl mt-2 mr-1 opacity-60">{$currencyStore}</span>
                        <span>{hourlyRate.toFixed(2)}</span>
                    </div>

                    <p class="text-slate-400 text-sm font-medium mt-1 mb-8">por hora</p>
                </div>

                <div
                    class="relative z-10 bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-sm w-full"
                >
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center sm:text-left">
                            <p
                                class="text-slate-400 text-[10px] sm:text-xs font-bold mb-1.5 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1"
                            >
                                Tarifa Diaria <span class="opacity-70">(8h)</span>
                            </p>
                            <p class="text-xl sm:text-2xl font-light text-white drop-shadow-sm">
                                {dailyRate.toFixed(0)}<span class="text-slate-400 text-lg ml-0.5"
                                    >{$currencyStore}</span
                                >
                            </p>
                        </div>
                        <div
                            class="h-10 w-px bg-white/10 absolute left-1/2 top-1/2 -translate-y-1/2 hidden sm:block"
                        ></div>
                        <div class="text-center sm:text-right">
                            <p
                                class="text-slate-400 text-[10px] sm:text-xs font-bold mb-1.5 uppercase tracking-widest flex items-center justify-center sm:justify-end gap-1"
                            >
                                Proyecto <span class="opacity-70">(40h)</span>
                            </p>
                            <p class="text-xl sm:text-2xl font-light text-white drop-shadow-sm">
                                {projectRate.toFixed(0)}<span class="text-slate-400 text-lg ml-0.5"
                                    >{$currencyStore}</span
                                >
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Annual Summary -->
            <div
                class="bg-black/40 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-sm relative overflow-hidden"
            >
                <div
                    class="absolute inset-x-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                ></div>

                <h4
                    class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10"
                >
                    Resumen Anual
                </h4>

                <div class="space-y-4 relative z-10">
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-slate-300 flex items-center gap-2"
                            ><DollarSign class="w-4 h-4 text-slate-400" /> Gastos Anuales</span
                        >
                        <span class="text-sm font-bold text-white font-mono"
                            >{totalAnnualExpenses.toLocaleString()}
                            <span class="text-slate-400">{$currencyStore}</span></span
                        >
                    </div>

                    <div class="h-px w-full bg-white/10"></div>

                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-slate-300 flex items-center gap-2"
                            ><ArrowRight class="w-4 h-4 text-white" /> Objetivo + Beneficio</span
                        >
                        <span class="text-base font-bold text-white font-mono"
                            >{annualTarget.toLocaleString('es-ES', {
                                maximumFractionDigits: 0,
                            })}
                            <span class="opacity-70 text-slate-400">{$currencyStore}</span></span
                        >
                    </div>

                    <div class="h-px w-full bg-white/10"></div>

                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm font-medium text-slate-300 flex items-center gap-2"
                            ><Clock class="w-4 h-4 text-slate-400" /> Horas Facturables</span
                        >
                        <span class="text-sm font-bold text-white font-mono"
                            >{annualBillableHours}<span class="text-slate-400 ml-0.5">h</span></span
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</ProGate>
