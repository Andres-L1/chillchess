<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { Calculator, Users, Receipt, Percent } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { currencyStore } from '$lib/stores/currencyStore';

    pageHeader.set({
        title: 'CÁLCULO DE PROPINAS',
        description: 'Distribución precisa y gestión de gratificaciones.',
        category: 'FINANZAS',
    });

    let billAmount = 50;
    let tipPercentage = 15;
    let numPeople = 2;

    $: tipAmount = billAmount * (tipPercentage / 100);
    $: totalAmount = billAmount + tipAmount;
    $: perPerson = totalAmount / numPeople;
    $: tipPerPerson = tipAmount / numPeople;
</script>

<svelte:head>
    <title>Calculadora de Propina | ChillChess</title>
    <meta
        name="description"
        content="Divide la cuenta y calcula propinas fácilmente entre varias personas."
    />
</svelte:head>

<ProGate>
    <div class="relative max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 py-10 px-4">
        <!-- Left Column: Inputs -->
        <div class="flex-1 space-y-8">
            <!-- Bill Amount Card -->
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-10 space-y-8 shadow-neo"
            >
                <h3
                    class="text-xs font-black text-black dark:text-white uppercase tracking-widest flex items-center gap-3"
                >
                    <div class="p-2 border-2 border-black bg-primary text-white">
                        <Receipt class="w-4 h-4" />
                    </div>
                    TOTAL DE LA CUENTA
                </h3>

                <div class="relative">
                    <div
                        class="absolute left-6 top-1/2 -translate-y-1/2 text-black dark:text-white font-black text-2xl"
                    >
                        {$currencyStore}
                    </div>
                    <input
                        id="billAmount"
                        type="number"
                        bind:value={billAmount}
                        min="0"
                        placeholder="0.00"
                        class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black rounded-none pl-14 pr-6 py-6 text-4xl font-black text-black dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all tabular-nums"
                    />
                </div>
            </div>

            <!-- Tip Percentage Card -->
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-10 space-y-8 shadow-neo"
            >
                <div class="flex items-center justify-between">
                    <h3
                        class="text-xs font-black text-black dark:text-white uppercase tracking-widest flex items-center gap-3"
                    >
                        <div class="p-2 border-2 border-black bg-black text-white">
                            <Percent class="w-4 h-4" />
                        </div>
                        PROPINA
                    </h3>
                    <div class="px-4 py-2 bg-primary border-4 border-black shadow-neo-sm">
                        <span class="text-xl font-black text-white tabular-nums"
                            >{tipPercentage}%</span
                        >
                    </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {#each [10, 15, 20, 25] as pct}
                        <button
                            on:click={() => (tipPercentage = pct)}
                            class="py-4 border-4 border-black font-black text-sm uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none {tipPercentage ===
                            pct
                                ? 'bg-primary text-white shadow-neo-sm'
                                : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-neo-sm'}"
                        >
                            {pct}%
                        </button>
                    {/each}
                </div>

                <div class="pt-4 relative h-8 flex items-center">
                    <input
                        id="tipPercentage-range"
                        type="range"
                        min="0"
                        max="50"
                        bind:value={tipPercentage}
                        class="w-full h-4 bg-slate-200 dark:bg-slate-700 border-2 border-black appearance-none cursor-pointer accent-primary"
                    />
                </div>
            </div>

            <!-- Split Card -->
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-10 space-y-8 shadow-neo"
            >
                <h3
                    class="text-xs font-black text-black dark:text-white uppercase tracking-widest flex items-center gap-3"
                >
                    <div class="p-2 border-2 border-black bg-primary text-white">
                        <Users class="w-4 h-4" />
                    </div>
                    DIVIDIR ENTRE
                </h3>

                <div class="flex items-center gap-4">
                    <button
                        on:click={() => (numPeople = Math.max(1, numPeople - 1))}
                        class="w-16 h-16 border-4 border-black bg-white dark:bg-slate-800 flex items-center justify-center text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                        <div class="w-6 h-1 bg-current"></div>
                    </button>

                    <div class="flex-1">
                        <input
                            id="numPeople"
                            type="number"
                            bind:value={numPeople}
                            min="1"
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black py-5 text-3xl font-black text-black dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all text-center tabular-nums"
                        />
                    </div>

                    <button
                        on:click={() => numPeople++}
                        class="w-16 h-16 border-4 border-black bg-white dark:bg-slate-800 flex items-center justify-center text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none relative"
                    >
                        <div class="absolute w-6 h-1 bg-current"></div>
                        <div class="absolute h-6 w-1 bg-current"></div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Right Column: Result -->
        <div class="w-full lg:w-[400px] lg:shrink-0 lg:pt-0 pt-8">
            <div
                class="bg-primary border-4 border-black p-10 flex flex-col items-center text-center text-white shadow-neo relative overflow-hidden group h-full justify-center"
            >
                <!-- Decorative pattern -->
                <div
                    class="absolute top-0 left-0 w-24 h-24 bg-white/10 rotate-12 -translate-x-4 -translate-y-4 pointer-events-none"
                ></div>

                <div
                    class="w-16 h-16 bg-white border-4 border-black flex items-center justify-center mb-10 shadow-neo-sm transform -rotate-3 group-hover:rotate-0 transition-transform"
                >
                    <Calculator class="w-8 h-8 text-black" />
                </div>

                <p class="text-xs font-black uppercase tracking-widest mb-4 text-black">
                    TOTAL POR PERSONA
                </p>

                <div class="flex items-start justify-center mb-4">
                    <span class="text-3xl font-black mt-3 mr-2 text-black">{$currencyStore}</span>
                    <span
                        class="text-[100px] font-black tracking-tighter leading-none tabular-nums drop-shadow-[4px_4px_0_rgba(0,0,0,1)]"
                    >
                        {perPerson.toFixed(0)}
                    </span>
                    <span class="text-3xl font-black mt-3 ml-1 text-black/60"
                        >.{perPerson.toFixed(2).split('.')[1]}</span
                    >
                </div>

                <div class="w-full grid grid-cols-2 gap-4 mt-12 pt-10 border-t-4 border-black/20">
                    <div class="space-y-1">
                        <p class="text-[10px] font-black uppercase tracking-widest text-black/60">
                            PROPINA TOTAL
                        </p>
                        <p class="text-3xl font-black tabular-nums">
                            {$currencyStore}{tipAmount.toFixed(0)}
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-[10px] font-black uppercase tracking-widest text-black/60">
                            CUENTA TOTAL
                        </p>
                        <p class="text-3xl font-black tabular-nums">
                            {$currencyStore}{totalAmount.toFixed(0)}
                        </p>
                    </div>
                </div>

                <div
                    class="mt-10 p-6 bg-black text-white border-4 border-white shadow-neo-sm w-full"
                >
                    <p class="text-xs font-black uppercase tracking-widest mb-2 opacity-60">
                        Propina por persona
                    </p>
                    <p class="text-2xl font-black">{$currencyStore}{tipPerPerson.toFixed(2)}</p>
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
