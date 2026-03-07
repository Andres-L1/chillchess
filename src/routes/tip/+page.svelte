<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { Calculator, Users, Receipt, Percent } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';
    import { currencyStore } from '$lib/stores/currencyStore';

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
    <title>Calculadora de Propina | ChillChess</title>
    <meta
        name="description"
        content="Divide la cuenta y calcula propinas fácilmente entre varias personas."
    />
</svelte:head>

<ProGate>
    <div class="relative max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">
        <!-- Ambient Background Glows -->
        <div
            class="absolute top-0 right-0 w-[600px] h-[600px] bg-neat-accent/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
        ></div>
        <div
            class="absolute bottom-[-200px] left-0 w-[500px] h-[500px] bg-slate-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"
        ></div>

        <!-- Left Column: Inputs -->
        <div class="flex-1 space-y-8">
            <!-- Bill Amount Card -->
            <div class="glass-card p-8 sm:p-10 space-y-8">
                <h3
                    class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"
                >
                    <div
                        class="p-2.5 bg-neat-accent/10 text-neat-accent rounded-xl border border-neat-accent/20"
                    >
                        <Receipt class="w-4 h-4" />
                    </div>
                    Total de la Cuenta
                </h3>

                <div class="relative group">
                    <div
                        class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xl uppercase"
                    >
                        {$currencyStore}
                    </div>
                    <input
                        id="billAmount"
                        type="number"
                        bind:value={billAmount}
                        min="0"
                        placeholder="0.00"
                        class="w-full bg-black/20 border border-white/5 rounded-3xl pl-14 pr-6 py-6 text-4xl font-black text-white placeholder-slate-800 focus:outline-none focus:border-neat-accent/30 transition-all tabular-nums shadow-inner"
                    />
                </div>
            </div>

            <!-- Tip Percentage Card -->
            <div class="glass-card p-8 sm:p-10 space-y-8">
                <div class="flex items-center justify-between">
                    <h3
                        class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"
                    >
                        <div
                            class="p-2.5 bg-neat-accent/10 text-neat-accent rounded-xl border border-neat-accent/20"
                        >
                            <Percent class="w-4 h-4" />
                        </div>
                        Propina Seleccionada
                    </h3>
                    <div
                        class="px-4 py-2 bg-neat-accent/10 rounded-xl border border-neat-accent/20"
                    >
                        <span class="text-xl font-black text-neat-accent tabular-nums"
                            >{tipPercentage}%</span
                        >
                    </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {#each [10, 15, 20, 25] as pct}
                        <button
                            on:click={() => (tipPercentage = pct)}
                            class="py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 {tipPercentage ===
                            pct
                                ? 'bg-neat-accent text-black shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                                : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}"
                        >
                            {pct}%
                        </button>
                    {/each}
                </div>

                <div class="pt-4">
                    <input
                        id="tipPercentage-range"
                        type="range"
                        min="0"
                        max="50"
                        bind:value={tipPercentage}
                        class="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-neat-accent"
                    />
                </div>
            </div>

            <!-- Split Card -->
            <div class="glass-card p-8 sm:p-10 space-y-8">
                <h3
                    class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"
                >
                    <div
                        class="p-2.5 bg-neat-accent/10 text-neat-accent rounded-xl border border-neat-accent/20"
                    >
                        <Users class="w-4 h-4" />
                    </div>
                    Dividir Cuenta
                </h3>

                <div class="flex items-center gap-4">
                    <button
                        on:click={() => (numPeople = Math.max(1, numPeople - 1))}
                        class="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                        <div class="w-5 h-1 bg-current rounded-full"></div>
                    </button>

                    <div class="flex-1 relative">
                        <input
                            id="numPeople"
                            type="number"
                            bind:value={numPeople}
                            min="1"
                            class="w-full bg-black/20 border border-white/5 rounded-2xl py-5 text-3xl font-black text-white focus:outline-none focus:border-neat-accent/30 transition-all text-center tabular-nums"
                        />
                    </div>

                    <button
                        on:click={() => numPeople++}
                        class="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 relative"
                    >
                        <div class="absolute w-5 h-1 bg-current rounded-full"></div>
                        <div class="absolute h-5 w-1 bg-current rounded-full"></div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Right Column: Result -->
        <div class="w-full lg:w-[400px] lg:shrink-0">
            <div
                class="glass-card !bg-neat-accent p-10 flex flex-col items-center text-center text-black overflow-hidden relative group h-full justify-center"
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
                    Total Por Persona
                </p>

                <div class="flex items-start justify-center relative z-10 mb-2">
                    <span class="text-2xl font-black mt-2 mr-2">{$currencyStore}</span>
                    <span class="text-8xl font-black tracking-tighter leading-none tabular-nums">
                        {perPerson.toFixed(0)}
                    </span>
                    <span class="text-2xl font-black mt-2 ml-1"
                        >.{perPerson.toFixed(2).split('.')[1]}</span
                    >
                </div>

                <div
                    class="w-full grid grid-cols-2 gap-4 mt-12 pt-10 border-t border-black/10 relative z-10"
                >
                    <div class="space-y-1">
                        <p
                            class="text-[10px] font-black uppercase tracking-widest opacity-60 text-black/60"
                        >
                            Propina Total
                        </p>
                        <p class="text-2xl font-black tabular-nums">
                            {$currencyStore}{tipAmount.toFixed(0)}
                        </p>
                    </div>
                    <div class="space-y-1">
                        <p
                            class="text-[10px] font-black uppercase tracking-widest opacity-60 text-black/60"
                        >
                            Cuenta Total
                        </p>
                        <p class="text-2xl font-black tabular-nums">
                            {$currencyStore}{totalAmount.toFixed(0)}
                        </p>
                    </div>
                </div>

                <div class="mt-8 p-4 bg-black/5 rounded-2xl relative z-10 w-full">
                    <p class="text-[10px] font-black uppercase tracking-widest opacity-50">
                        Propina por persona
                    </p>
                    <p class="text-lg font-black">{$currencyStore}{tipPerPerson.toFixed(2)}</p>
                </div>
            </div>
        </div>
    </div>
</ProGate>
