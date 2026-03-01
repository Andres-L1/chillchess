<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { onMount } from 'svelte';
    import { Receipt, PiggyBank, Clock, Palmtree, Save, ArrowRight } from 'lucide-svelte';

    pageHeader.set({
        title: 'Valor de mi Hora',
        description: 'Calcula cuánto debes cobrar como Freelancer para ser rentable.',
        category: 'Negocios',
    });

    let expenses = 300;
    let profit = 1500;
    let hours = 30;
    let vacation = 4;
    let projHours = 0;

    let currentHourlyRate = 0;
    let annualBillableHours = 0;

    $: {
        const annualRevenueNeeded = (expenses + profit) * 12;
        const weeksWorked = Math.max(1, 52 - vacation);
        annualBillableHours = weeksWorked * hours;

        if (annualBillableHours > 0) {
            currentHourlyRate = annualRevenueNeeded / annualBillableHours;
        } else {
            currentHourlyRate = 0;
        }
    }

    $: monthlyTotal = expenses + profit;
    $: totalHoursMonthly = Math.round(annualBillableHours / 12);
    $: projTotal = currentHourlyRate * projHours;

    onMount(() => {
        const saved = localStorage.getItem('freelanceData_v1');
        if (saved) {
            const data = JSON.parse(saved);
            expenses = parseFloat(data.expenses) || 300;
            profit = parseFloat(data.profit) || 1500;
            hours = parseFloat(data.hours) || 30;
            vacation = parseFloat(data.vacation) || 4;
        }
    });

    function saveData() {
        const data = { expenses, profit, hours, vacation };
        localStorage.setItem('freelanceData_v1', JSON.stringify(data));
    }
</script>

<svelte:head>
    <title>Valor de mi Hora | MultiTool</title>
</svelte:head>

<div class="flex flex-col lg:flex-row gap-8">
    <div class="flex-1 space-y-6">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3
                class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2"
            >
                Tus Finanzas y Tiempo
            </h3>
            <div>
                <label
                    for="expenses"
                    class="flex text-xs font-bold text-slate-400 mb-1 justify-between"
                >
                    <span>Gastos Fijos Mensuales</span>
                    <span class="text-slate-400 font-normal text-[10px]"
                        >(Software, internet...)</span
                    >
                </label>
                <div class="relative">
                    <Receipt
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    />
                    <input
                        id="expenses"
                        type="number"
                        bind:value={expenses}
                        on:input={saveData}
                        placeholder="500"
                        min="0"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>
            </div>
            <div>
                <label
                    for="profit"
                    class="flex text-xs font-bold text-slate-400 mb-1 justify-between"
                >
                    <span>Beneficio Deseado Mensual</span>
                    <span class="text-slate-400 font-normal text-[10px]">(Limpio para ti)</span>
                </label>
                <div class="relative">
                    <PiggyBank
                        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    />
                    <input
                        id="profit"
                        type="number"
                        bind:value={profit}
                        on:input={saveData}
                        placeholder="1500"
                        min="0"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="hours" class="block text-xs font-bold text-slate-400 mb-1"
                        >Horas Facturables/Semana</label
                    >
                    <div class="relative">
                        <Clock
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                        />
                        <input
                            id="hours"
                            type="number"
                            bind:value={hours}
                            on:input={saveData}
                            placeholder="25"
                            min="1"
                            max="168"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>
                <div>
                    <label for="vacation" class="block text-xs font-bold text-slate-400 mb-1"
                        >Semanas Vacaciones/Año</label
                    >
                    <div class="relative">
                        <Palmtree
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                        />
                        <input
                            id="vacation"
                            type="number"
                            bind:value={vacation}
                            on:input={saveData}
                            placeholder="4"
                            min="0"
                            max="52"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>
            </div>
        </div>
        <p class="text-xs text-slate-400 flex items-center gap-1">
            <Save class="w-3 h-3" /> Tus datos se guardan automáticamente.
        </p>
    </div>

    <div class="lg:w-[340px] flex flex-col gap-4">
        <div
            class="bg-gradient-to-br from-brand-600 to-brand-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden"
        >
            <div
                class="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-10 pointer-events-none"
            ></div>
            <p class="text-brand-100 text-sm font-medium mb-1">Para ser rentable, tu hora vale:</p>
            <div class="flex items-end gap-1 mb-4">
                <span class="text-5xl font-black font-mono tracking-tighter"
                    >${currentHourlyRate.toFixed(2)}</span
                >
            </div>
            <div class="h-px bg-brand-500/50 w-full mb-4"></div>
            <div class="flex justify-between items-end">
                <div>
                    <p class="text-brand-200 text-xs">Debes facturar al mes</p>
                    <p class="text-xl font-bold font-mono">
                        ${monthlyTotal.toLocaleString('en-US')}
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-brand-200 text-xs">Horas reales/mes</p>
                    <p class="text-xl font-bold font-mono">{totalHoursMonthly}</p>
                </div>
            </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mt-2">
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                Cotizar Proyecto
            </h3>
            <div class="flex items-center gap-3">
                <div class="flex-1 relative">
                    <label for="projHours" class="sr-only">Horas estimadas del proyecto</label>
                    <input
                        id="projHours"
                        type="number"
                        bind:value={projHours}
                        placeholder="Horas estimadas"
                        class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>
                <div class="w-8 flex justify-center text-slate-400"><ArrowRight /></div>
                <div class="flex-1 bg-brand-50 rounded-lg border border-brand-100 p-2 text-center">
                    <span class="text-lg font-bold text-brand-700 font-mono"
                        >${projTotal.toFixed(2)}</span
                    >
                </div>
            </div>
        </div>
    </div>
</div>
