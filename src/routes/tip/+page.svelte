<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { Calculator, Users, Receipt, Percent } from 'lucide-svelte';

    pageHeader.set({
        title: 'Calculadora Propina',
        description: 'Divide la cuenta y calcula propinas fácilmente.',
        category: 'Finanzas',
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
    <title>Calculadora de Propina | MultiTool</title>
    <meta
        name="description"
        content="Divide la cuenta y calcula propinas fácilmente entre varias personas."
    />
</svelte:head>

<div
    class="max-w-2xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8 border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg shadow-black/10"
>
    <div class="flex-1 space-y-8">
        <!-- Bill Amount -->
        <div>
            <label
                for="billAmount"
                class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                >Total de la Cuenta</label
            >
            <div class="relative">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    $
                </div>
                <input
                    id="billAmount"
                    type="number"
                    bind:value={billAmount}
                    min="0"
                    placeholder="0.00"
                    class="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl pl-8 pr-4 py-4 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                />
            </div>
        </div>

        <!-- Tip Percentage -->
        <div>
            <label
                for="tipPercentage"
                class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3"
                >Propina (%)</label
            >
            <div class="grid grid-cols-4 gap-2 mb-4">
                {#each [10, 15, 20, 25] as pct}
                    <button
                        on:click={() => (tipPercentage = pct)}
                        class="py-3 rounded-xl font-bold text-sm transition-all {tipPercentage ===
                        pct
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                            : 'bg-slate-900/50 border border-slate-700/50 text-slate-400 hover:bg-slate-700/50'}"
                    >
                        {pct}%
                    </button>
                {/each}
            </div>

            <div class="flex items-center gap-4">
                <input
                    id="tipPercentage"
                    type="range"
                    min="0"
                    max="50"
                    bind:value={tipPercentage}
                    class="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <div
                    class="w-16 bg-slate-900/50 border border-slate-700/50 rounded-xl px-2 py-2 flex items-center justify-center"
                >
                    <span class="font-bold text-brand-400">{tipPercentage}%</span>
                </div>
            </div>
        </div>

        <!-- Number of People -->
        <div>
            <label
                for="numPeople"
                class="flex text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 justify-between"
            >
                <span>Número de Personas</span>
                <span class="bg-slate-700/50 text-brand-400 px-2 py-0.5 rounded font-bold"
                    >{numPeople}</span
                >
            </label>
            <div class="flex items-center gap-3">
                <button
                    on:click={() => (numPeople = Math.max(1, numPeople - 1))}
                    class="w-12 h-12 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-center text-slate-500 hover:bg-slate-700/50 hover:text-white transition-colors"
                >
                    <div class="w-4 h-0.5 bg-current rounded-full"></div>
                </button>

                <div class="flex-1 relative">
                    <Users
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
                    />
                    <input
                        id="numPeople"
                        type="number"
                        bind:value={numPeople}
                        min="1"
                        class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-center"
                    />
                </div>

                <button
                    on:click={() => numPeople++}
                    class="w-12 h-12 rounded-xl bg-slate-900/50 border border-slate-700/50 flex items-center justify-center text-slate-500 hover:bg-slate-700/50 hover:text-white transition-colors relative"
                >
                    <div class="absolute w-4 h-0.5 bg-current rounded-full"></div>
                    <div class="absolute h-4 w-0.5 bg-current rounded-full"></div>
                </button>
            </div>
        </div>
    </div>

    <div
        class="w-full md:w-72 lg:w-[300px] bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden border border-slate-700/50"
    >
        <div
            class="absolute -right-20 -top-20 w-48 h-48 bg-brand-500 rounded-full blur-3xl opacity-20 pointer-events-none"
        ></div>
        <div
            class="absolute -left-20 -bottom-20 w-48 h-48 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"
        ></div>

        <div class="space-y-6 relative z-10">
            <div>
                <p class="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                    <Receipt class="w-4 h-4" /> Total por Persona
                </p>
                <div
                    class="text-4xl md:text-5xl font-black font-mono tracking-tighter text-white tabular-nums"
                >
                    ${perPerson.toFixed(2)}
                </div>
            </div>

            <div class="h-px bg-slate-800 w-full"></div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
                        <Percent class="w-3 h-3" /> Propina Total
                    </p>
                    <div class="text-xl font-bold font-mono text-brand-400">
                        ${tipAmount.toFixed(2)}
                    </div>
                    <p class="text-[10px] text-slate-500 mt-1">
                        ${tipPerPerson.toFixed(2)}/persona
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-slate-400 text-xs font-medium mb-1">Total a Pagar</p>
                    <div class="text-xl font-bold font-mono text-white">
                        ${totalAmount.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
