<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { Flame, Target, PiggyBank, Calendar, TrendingUp } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { currencyStore } from '$lib/stores/currencyStore';

    pageHeader.set({
        title: 'Libertad Financiera (FIRE)',
        description: 'Calcula exactamente cuándo podrás retirarte o vivir de tus inversiones.',
        category: 'Finanzas',
    });

    let currentAge = 30;
    let currentSavings = 10000;
    let monthlyContribution = 500;
    let annualReturn = 7;
    let targetMonthlyIncome = 2000;
    let targetTotalCorpus = targetMonthlyIncome * 300; // Regla del 4%

    // Sincronizar inputs
    function handleMonthlyIncome() {
        targetTotalCorpus = targetMonthlyIncome * 300;
    }

    function handleTotalCorpus() {
        targetMonthlyIncome = Math.round(targetTotalCorpus / 300);
    }

    let monthsToRetire = 0;
    let finalCorpus = 0;

    // Lógica de cálculo
    $: {
        let current = currentSavings;
        let months = 0;
        let monthlyRate = annualReturn / 100 / 12;

        if (current >= targetTotalCorpus) {
            months = 0;
            current = currentSavings;
        } else if (monthlyContribution <= 0 && annualReturn <= 0) {
            months = 1200; // Nunca llegará
        } else {
            // Iteración mes a mes
            while (current < targetTotalCorpus && months < 1200) {
                // max 100 years
                current += current * monthlyRate;
                current += monthlyContribution;
                months++;
            }
        }

        monthsToRetire = months;
        finalCorpus = current;
    }

    $: yearsToRetire = Math.floor(monthsToRetire / 12);
    $: extraMonths = monthsToRetire % 12;
    $: retirementAge = currentAge + yearsToRetire + (extraMonths > 0 ? 1 : 0);
    $: isNeverRetiring = monthsToRetire >= 1200;
    $: isAlreadyRetired = monthsToRetire === 0 && currentSavings >= targetTotalCorpus;

    function formatCurrency(value: number) {
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
</script>

<svelte:head>
    <title>Calculadora Libertad Financiera FIRE | ChillChess</title>
    <meta
        name="description"
        content="Descubre en qué año podrás retirarte basándote en la regla del 4% y tus inversiones actuales."
    />
</svelte:head>

<ProGate>
    <div class="max-w-5xl mx-auto grid lg:grid-cols-[1fr_400px] gap-8 py-8 px-4">
        <!-- Input Section -->
        <div class="neo-card p-8 md:p-10 space-y-10 bg-white dark:bg-slate-900 transition-colors">
            <div class="flex items-center gap-4">
                <div class="w-2 h-10 bg-primary border-2 border-black"></div>
                <h2 class="text-xl font-black uppercase tracking-tighter theme-text">
                    CONFIGURACIÓN FIRE
                </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Current Age -->
                <div class="space-y-3">
                    <label
                        for="currentAge"
                        class="block text-sm font-black uppercase tracking-widest theme-text opacity-60"
                        >Tu Edad Actual</label
                    >
                    <input
                        id="currentAge"
                        type="number"
                        bind:value={currentAge}
                        min="0"
                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-4 text-xl font-black theme-text focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all shadow-neo-sm"
                    />
                    <p
                        class="text-[10px] theme-text opacity-40 font-bold uppercase tracking-wider leading-tight"
                    >
                        Desde cuándo comenzamos a calcular.
                    </p>
                </div>

                <!-- Initial Savings -->
                <div class="space-y-3">
                    <label
                        for="currentSavings"
                        class="block text-sm font-black uppercase tracking-widest theme-text opacity-60"
                        >Ahorro Inicial</label
                    >
                    <div class="relative">
                        <div
                            class="absolute left-5 top-1/2 -translate-y-1/2 theme-text font-black text-xl"
                        >
                            {$currencyStore}
                        </div>
                        <input
                            id="currentSavings"
                            type="number"
                            bind:value={currentSavings}
                            min="0"
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black pl-12 pr-6 py-4 text-xl font-black theme-text focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all shadow-neo-sm tabular-nums"
                        />
                    </div>
                    <p
                        class="text-[10px] theme-text opacity-40 font-bold uppercase tracking-wider leading-tight"
                    >
                        Capital o inversiones que ya tienes.
                    </p>
                </div>
            </div>

            <!-- Monthly Contribution -->
            <div class="space-y-4">
                <label
                    for="monthlyContribution"
                    class="flex items-center gap-2 text-sm font-black uppercase tracking-widest theme-text opacity-60"
                    >Aportación Mensual</label
                >
                <div class="relative">
                    <div
                        class="absolute left-6 top-1/2 -translate-y-1/2 theme-text font-black text-2xl"
                    >
                        {$currencyStore}
                    </div>
                    <input
                        id="monthlyContribution"
                        type="number"
                        bind:value={monthlyContribution}
                        min="0"
                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black pl-14 pr-20 py-6 text-4xl font-black theme-text focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all shadow-neo tabular-nums"
                    />
                    <div
                        class="absolute right-6 top-1/2 -translate-y-1/2 font-black text-sm uppercase tracking-widest opacity-40"
                    >
                        /mes
                    </div>
                </div>
                <p
                    class="text-[10px] theme-text opacity-40 font-bold uppercase tracking-wider leading-tight"
                >
                    Dinero nuevo que invertirás de forma periódica.
                </p>
            </div>

            <div class="h-1 bg-black/10 dark:bg-white/10 w-full rounded-full"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Target Monthly Income -->
                <div class="space-y-3">
                    <label
                        for="targetMonthlyIncome"
                        class="block text-sm font-black uppercase tracking-widest text-primary"
                        >Ingreso Retiro</label
                    >
                    <div class="relative">
                        <div class="absolute left-4 top-1/2 -translate-y-1/2 theme-text font-black">
                            {$currencyStore}
                        </div>
                        <input
                            id="targetMonthlyIncome"
                            type="number"
                            bind:value={targetMonthlyIncome}
                            on:input={handleMonthlyIncome}
                            min="0"
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black pl-10 pr-4 py-4 text-xl font-black theme-text focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all shadow-neo-sm"
                        />
                    </div>
                    <p
                        class="text-[10px] theme-text opacity-40 font-bold uppercase tracking-wider leading-tight"
                    >
                        Dinero que necesitarás cada mes.
                    </p>
                </div>

                <!-- Target Total Corpus -->
                <div class="space-y-3">
                    <label
                        for="targetTotalCorpus"
                        class="block text-sm font-black uppercase tracking-widest text-emerald-500"
                        >Objetivo Total</label
                    >
                    <div class="relative">
                        <div class="absolute left-4 top-1/2 -translate-y-1/2 theme-text font-black">
                            {$currencyStore}
                        </div>
                        <input
                            id="targetTotalCorpus"
                            type="number"
                            bind:value={targetTotalCorpus}
                            on:input={handleTotalCorpus}
                            min="0"
                            class="w-full bg-emerald-500/5 dark:bg-emerald-500/10 border-4 border-emerald-500/50 px-10 py-4 text-xl font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:bg-emerald-500/10 dark:focus:bg-emerald-500/20 transition-all shadow-neo-sm tabular-nums"
                        />
                    </div>
                    <p
                        class="text-[10px] theme-text opacity-40 font-bold uppercase tracking-wider leading-tight"
                    >
                        Patrimonio total (Regla del 4%).
                    </p>
                </div>
            </div>

            <!-- Expected Return Rate -->
            <div class="space-y-6">
                <div class="flex justify-between items-end">
                    <label
                        for="annualReturn"
                        class="block text-sm font-black uppercase tracking-widest theme-text opacity-60"
                        >Rentabilidad Anual</label
                    >
                    <span
                        class="bg-black dark:bg-slate-800 text-white dark:text-primary px-4 py-1 border-2 border-black font-black tabular-nums"
                        >{annualReturn}%</span
                    >
                </div>
                <input
                    id="annualReturn"
                    type="range"
                    min="1"
                    max="15"
                    step="0.1"
                    bind:value={annualReturn}
                    class="w-full h-4 bg-slate-200 dark:bg-slate-800 border-2 border-black appearance-none cursor-pointer accent-primary"
                />
                <p class="text-xs theme-text opacity-50 font-bold lowercase italic">
                    La media histórica del S&P 500 es ~7-10% (nominal).
                </p>
            </div>
        </div>

        <!-- Result Column -->
        <div class="space-y-8">
            <div
                class="neo-card bg-primary p-10 flex flex-col items-center text-center text-white space-y-8 relative overflow-hidden group"
            >
                <div
                    class="absolute top-0 right-0 w-32 h-32 bg-white/10 -rotate-12 translate-x-8 -translate-y-8 pointer-events-none"
                ></div>

                <div
                    class="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-neo-sm transform -rotate-3 transition-transform group-hover:rotate-0"
                >
                    <Flame class="w-8 h-8 text-black" />
                </div>

                {#if isAlreadyRetired}
                    <div class="space-y-4">
                        <h3 class="text-3xl font-black uppercase tracking-tighter">
                            ¡ESTÁS RETIRADO!
                        </h3>
                        <p class="font-bold text-black/80">Tus ahorros superan tu objetivo.</p>
                    </div>
                {:else if isNeverRetiring}
                    <div class="space-y-4">
                        <h3 class="text-2xl font-black uppercase tracking-tighter">
                            FUERA DE ALCANCE
                        </h3>
                        <p class="font-bold text-black/80">
                            Ajusta tus aportaciones o rentabilidad.
                        </p>
                    </div>
                {:else}
                    <div class="space-y-2">
                        <p class="text-xs font-black uppercase tracking-[0.2em] text-black/60">
                            TIEMPO PARA EL RETIRO
                        </p>
                        <div
                            class="text-7xl font-black tracking-tighter tabular-nums drop-shadow-[4px_4px_0_rgba(0,0,0,1)]"
                        >
                            {yearsToRetire}<span
                                class="text-2xl text-black/50 ml-1 italic leading-none">AÑOS</span
                            >
                        </div>
                        {#if extraMonths > 0}
                            <p class="text-lg font-black uppercase tracking-widest text-black">
                                Y {extraMonths} MESES
                            </p>
                        {/if}
                    </div>

                    <div class="w-full h-1 bg-black/20 rounded-full"></div>

                    <div class="w-full grid grid-cols-2 gap-4">
                        <div class="text-left">
                            <p
                                class="text-[10px] font-black uppercase text-black/50 tracking-widest"
                            >
                                EDAD RETIRO
                            </p>
                            <p class="text-4xl font-black tabular-nums">{retirementAge}</p>
                        </div>
                        <div class="text-right">
                            <p
                                class="text-[10px] font-black uppercase text-black/50 tracking-widest"
                            >
                                TOTAL FINAL
                            </p>
                            <p class="text-2xl font-black tabular-nums">
                                {$currencyStore}{formatCurrency(finalCorpus)}
                            </p>
                        </div>
                    </div>
                {/if}
            </div>

            <div class="neo-card bg-white dark:bg-slate-900 p-8 space-y-6">
                <div class="flex items-center gap-3">
                    <Target class="w-5 h-5 text-primary" />
                    <h3 class="text-sm font-black uppercase tracking-widest theme-text">
                        ANÁLISIS FIRE
                    </h3>
                </div>
                <div class="space-y-4">
                    <p
                        class="text-sm font-bold theme-text opacity-70 leading-relaxed uppercase italic"
                    >
                        La regla del 4% sugiere que si puedes vivir con el 4% de tu capital al año,
                        tus ahorros durarán al menos 30 años.
                    </p>
                    <div
                        class="p-4 bg-slate-50 dark:bg-slate-800 border-2 border-black border-dashed"
                    >
                        <p
                            class="text-[10px] theme-text opacity-50 uppercase font-black leading-tight"
                        >
                            La proyección asume rentabilidad final compuesta constante y no
                            garantiza rendimientos futuros.
                        </p>
                    </div>
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
