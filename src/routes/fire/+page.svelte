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
    <div
        class="max-w-4xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 glass-card p-6 lg:p-8 relative overflow-hidden group"
    >
        <!-- Glassmorphism ambient glow -->
        <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
            <div
                class="absolute -top-32 -right-32 w-[500px] h-[500px] bg-neat-accent/10 rounded-full blur-[100px] mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
            ></div>
            <div
                class="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen"
            ></div>
        </div>

        <div class="flex-1 space-y-8 relative z-10 w-full max-w-lg lg:max-w-none mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Current Age -->
                <div class="group">
                    <label
                        for="currentAge"
                        class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-focus-within:text-neat-accent transition-colors"
                        >Tu Edad Actual</label
                    >
                    <p class="text-[11px] text-slate-500 mb-3 font-medium leading-tight">
                        Desde cuándo comenzamos a calcular.
                    </p>
                    <input
                        id="currentAge"
                        type="number"
                        bind:value={currentAge}
                        min="0"
                        class="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xl font-black text-white focus:outline-none focus:border-neat-accent/50 transition-all shadow-inner tracking-tight"
                    />
                </div>

                <!-- Initial Savings -->
                <div class="group">
                    <label
                        for="currentSavings"
                        class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-focus-within:text-neat-accent transition-colors"
                        >Ahorro Inicial</label
                    >
                    <p class="text-[11px] text-slate-500 mb-3 font-medium leading-tight">
                        Capital o inversiones que ya tienes.
                    </p>
                    <div class="relative">
                        <div
                            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black"
                        >
                            {$currencyStore}
                        </div>
                        <input
                            id="currentSavings"
                            type="number"
                            bind:value={currentSavings}
                            min="0"
                            class="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-xl font-black text-white focus:outline-none focus:border-neat-accent/50 transition-all shadow-inner tracking-tight"
                        />
                    </div>
                </div>
            </div>

            <!-- Monthly Contribution -->
            <div class="group">
                <label
                    for="monthlyContribution"
                    class="flex text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-focus-within:text-neat-accent transition-colors items-center gap-2"
                >
                    Aportación Mensual
                </label>
                <p class="text-[11px] text-slate-500 mb-3 font-medium leading-tight">
                    Dinero nuevo que invertirás de forma periódica.
                </p>
                <div class="relative">
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">
                        {$currencyStore}
                    </div>
                    <input
                        id="monthlyContribution"
                        type="number"
                        bind:value={monthlyContribution}
                        min="0"
                        class="w-full bg-black/40 border border-white/10 rounded-2xl pl-10 pr-16 py-5 text-3xl font-black text-white focus:outline-none focus:border-neat-accent/50 transition-all shadow-inner tracking-tighter"
                    />
                    <div
                        class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-black uppercase tracking-widest"
                    >
                        /mes
                    </div>
                </div>
            </div>

            <div class="h-px bg-white/10 w-full my-6"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Target Monthly Income -->
                <div class="group">
                    <label
                        for="targetMonthlyIncome"
                        class="block text-xs font-black text-amber-400/80 uppercase tracking-widest mb-1 group-focus-within:text-amber-400 transition-colors"
                        >Ingreso Mensual Jubilación</label
                    >
                    <p class="text-[11px] text-amber-500/50 mb-3 font-medium leading-tight">
                        Dinero que necesitarás cada mes.
                    </p>
                    <div class="relative">
                        <div
                            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black"
                        >
                            {$currencyStore}
                        </div>
                        <input
                            id="targetMonthlyIncome"
                            type="number"
                            bind:value={targetMonthlyIncome}
                            on:input={handleMonthlyIncome}
                            min="0"
                            class="w-full bg-black/20 border border-white/5 rounded-2xl pl-9 pr-4 py-3 text-lg font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-white/5 transition-all shadow-inner"
                        />
                    </div>
                </div>

                <!-- Target Total Corpus (Calculated via 4% rule) -->
                <div class="group">
                    <label
                        for="targetTotalCorpus"
                        class="block text-xs font-black text-amber-400/80 uppercase tracking-widest mb-1 group-focus-within:text-amber-400 transition-colors"
                        >Objetivo Total (Regla 4%)</label
                    >
                    <p class="text-[11px] text-amber-500/50 mb-3 font-medium leading-tight">
                        Patrimonio que debes alcanzar.
                    </p>
                    <div class="relative">
                        <div
                            class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black"
                        >
                            {$currencyStore}
                        </div>
                        <input
                            id="targetTotalCorpus"
                            type="number"
                            bind:value={targetTotalCorpus}
                            on:input={handleTotalCorpus}
                            min="0"
                            class="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl pl-9 pr-4 py-3 text-lg font-black text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 focus:bg-amber-500/10 transition-all shadow-inner"
                        />
                    </div>
                </div>
            </div>

            <!-- Expected Return Rate -->
            <div class="group">
                <label
                    for="annualReturn"
                    class="flex text-xs font-black text-slate-400 uppercase tracking-widest mb-3 justify-between group-focus-within:text-neat-accent transition-colors"
                >
                    <span>Rentabilidad Anual Esperada</span>
                    <span
                        class="text-neat-accent bg-neat-accent/10 px-3 py-1 rounded-lg border border-neat-accent/20 font-black text-[10px] uppercase tracking-widest"
                        >{annualReturn}%</span
                    >
                </label>
                <div class="flex items-center gap-4 relative z-10">
                    <input
                        id="annualReturn"
                        type="range"
                        min="1"
                        max="15"
                        step="0.1"
                        bind:value={annualReturn}
                        class="flex-1 h-1.5 bg-black/60 border border-white/5 rounded-full appearance-none cursor-pointer accent-neat-accent"
                    />
                </div>
                <p class="text-xs text-slate-500 mt-2">
                    La media histórica del S&P 500 es ~7-10% (sin ajustar a inflación).
                </p>
            </div>
        </div>

        <!-- Glass Card Results -->
        <div
            class="w-full lg:w-[380px] bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-white shadow-2xl flex flex-col relative overflow-hidden z-10"
        >
            <div
                class="absolute -right-20 -top-20 w-48 h-48 bg-neat-accent rounded-full blur-[60px] opacity-20 pointer-events-none"
            ></div>
            <div
                class="absolute -left-20 -bottom-20 w-48 h-48 bg-emerald-500 rounded-full blur-[60px] opacity-20 pointer-events-none"
            ></div>

            <div class="space-y-8 relative z-10 flex-1 flex flex-col justify-center">
                {#if isAlreadyRetired}
                    <div class="text-center space-y-4">
                        <div
                            class="inline-flex w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center border border-emerald-500/30 mb-2"
                        >
                            <Flame class="w-8 h-8" />
                        </div>
                        <h3 class="text-2xl font-black tracking-tight">¡Libertad Alcanzada!</h3>
                        <p class="text-emerald-400 font-medium">
                            Tus ahorros actuales ya superan tu objetivo de independencia financiera.
                        </p>
                    </div>
                {:else if isNeverRetiring}
                    <div class="text-center space-y-4">
                        <div
                            class="inline-flex w-16 h-16 rounded-full bg-red-500/20 text-red-400 items-center justify-center border border-red-500/30 mb-2"
                        >
                            <Target class="w-8 h-8" />
                        </div>
                        <h3 class="text-xl font-black tracking-tight text-slate-300">
                            Objetivo Inalcanzable
                        </h3>
                        <p class="text-red-400 font-medium text-sm">
                            Con estas condiciones y sin aportaciones, el crecimiento no logrará
                            alcanzar el objetivo en 100 años.
                        </p>
                    </div>
                {:else}
                    <div>
                        <p
                            class="text-slate-400 text-xs font-black tracking-widest uppercase mb-2 flex items-center gap-2"
                        >
                            <Calendar class="w-4 h-4 text-neat-accent" /> Tiempo Requerido
                        </p>
                        <div
                            class="text-5xl md:text-6xl font-black font-mono tracking-tighter text-white tabular-nums flex items-baseline drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        >
                            {yearsToRetire}<span class="text-2xl text-slate-500 ml-1">años</span>
                        </div>
                        {#if extraMonths > 0}
                            <div
                                class="text-neat-accent font-black text-xs uppercase tracking-widest mt-2 px-1"
                            >
                                y {extraMonths} meses
                            </div>
                        {/if}
                    </div>

                    <div class="h-px bg-white/10 w-full my-2"></div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p
                                class="text-slate-400 text-xs font-black tracking-widest uppercase mb-1"
                            >
                                Edad Retiro
                            </p>
                            <div
                                class="text-3xl font-black font-mono text-neat-accent drop-shadow-[0_0_15px_rgba(0,229,255,0.3)] tabular-nums tracking-tighter"
                            >
                                {retirementAge}
                            </div>
                        </div>
                        <div class="text-right">
                            <p
                                class="text-slate-400 text-xs font-black tracking-widest uppercase mb-1"
                            >
                                Total Acumulado
                            </p>
                            <div
                                class="text-xl font-black font-mono text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                            >
                                {$currencyStore}{formatCurrency(finalCorpus)}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <div class="pt-6 border-t border-white/10 mt-6 relative z-10">
                <p
                    class="text-[10px] text-slate-500 uppercase tracking-wider text-center font-bold"
                >
                    La proyección asume rentabilidad final compuesta constante y no garantiza
                    rendimientos futuros.
                </p>
            </div>
        </div>
    </div>
</ProGate>
