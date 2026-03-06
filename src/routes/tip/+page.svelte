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
    <div
        class="max-w-3xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8 border border-white/5 bg-black/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
    >
        <!-- Glassmorphism ambient glow -->
        <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
            <div
                class="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl mix-blend-screen"
            ></div>
            <div
                class="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl mix-blend-screen"
            ></div>
        </div>

        <div class="flex-1 space-y-8 relative z-10">
            <!-- Bill Amount -->
            <div class="group">
                <label
                    for="billAmount"
                    class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 group-focus-within:text-brand-400 transition-colors"
                    >Total de la Cuenta</label
                >
                <div class="relative">
                    <div
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-lg"
                    >
                        {$currencyStore}
                    </div>
                    <input
                        id="billAmount"
                        type="number"
                        bind:value={billAmount}
                        min="0"
                        placeholder="0.00"
                        class="w-full bg-black/20 border border-white/5 rounded-2xl pl-10 pr-4 py-4 text-2xl font-black text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all shadow-inner"
                    />
                </div>
            </div>

            <!-- Tip Percentage -->
            <div class="group">
                <label
                    for="tipPercentage"
                    class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-brand-400 transition-colors"
                    >Propina (%)</label
                >
                <div class="grid grid-cols-4 gap-2 mb-4 relative z-10">
                    {#each [10, 15, 20, 25] as pct}
                        <button
                            on:click={() => (tipPercentage = pct)}
                            class="py-3 rounded-xl font-bold text-sm transition-all duration-300 {tipPercentage ===
                            pct
                                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-[0_0_15px_rgba(14,165,233,0.15)]'
                                : 'bg-black/20 border border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'}"
                        >
                            {pct}%
                        </button>
                    {/each}
                </div>

                <div class="flex items-center gap-4 relative z-10">
                    <input
                        id="tipPercentage"
                        type="range"
                        min="0"
                        max="50"
                        bind:value={tipPercentage}
                        class="flex-1 h-2 bg-black/40 border border-white/5 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                    <div
                        class="w-16 bg-black/40 border border-white/5 shadow-inner rounded-xl px-2 py-2 flex items-center justify-center"
                    >
                        <span class="font-black text-brand-400 text-lg">{tipPercentage}%</span>
                    </div>
                </div>
            </div>

            <!-- Number of People -->
            <div class="group">
                <label
                    for="numPeople"
                    class="flex text-xs font-black text-slate-400 uppercase tracking-widest mb-2 justify-between group-focus-within:text-brand-400 transition-colors"
                >
                    <span>Número de Personas</span>
                    <span
                        class="bg-black/40 border border-white/5 text-brand-400 px-2 py-0.5 rounded font-bold"
                        >{numPeople}</span
                    >
                </label>
                <div class="flex items-center gap-3 relative z-10">
                    <button
                        on:click={() => (numPeople = Math.max(1, numPeople - 1))}
                        class="w-14 h-14 rounded-2xl bg-black/20 border border-white/5 shadow-inner flex items-center justify-center text-slate-500 hover:bg-white/5 hover:text-white hover:border-white/10 transition-all active:scale-95"
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
                            class="w-full bg-black/20 border border-white/5 shadow-inner rounded-2xl pl-12 pr-4 py-4 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 focus:bg-white/5 transition-all text-center"
                        />
                    </div>

                    <button
                        on:click={() => numPeople++}
                        class="w-14 h-14 rounded-2xl bg-black/20 border border-white/5 shadow-inner flex items-center justify-center text-slate-500 hover:bg-white/5 hover:text-white hover:border-white/10 transition-all relative active:scale-95"
                    >
                        <div class="absolute w-4 h-0.5 bg-current rounded-full"></div>
                        <div class="absolute h-4 w-0.5 bg-current rounded-full"></div>
                    </button>
                </div>
            </div>
        </div>

        <div
            class="w-full md:w-80 lg:w-[320px] bg-black/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden z-10"
        >
            <div
                class="absolute -right-20 -top-20 w-48 h-48 bg-brand-500 rounded-full blur-[60px] opacity-20 pointer-events-none"
            ></div>
            <div
                class="absolute -left-20 -bottom-20 w-48 h-48 bg-purple-500 rounded-full blur-[60px] opacity-20 pointer-events-none"
            ></div>

            <div class="space-y-8 relative z-10">
                <div>
                    <p
                        class="text-slate-400 text-sm font-black tracking-widest uppercase mb-2 flex items-center gap-2"
                    >
                        <Receipt class="w-4 h-4" /> Total p/p
                    </p>
                    <div
                        class="text-5xl md:text-6xl font-black font-mono tracking-tighter text-white tabular-nums flex items-baseline drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                        <span class="text-3xl text-slate-500 mr-1">{$currencyStore}</span
                        >{perPerson.toFixed(2)}
                    </div>
                </div>

                <div class="h-px bg-white/10 w-full"></div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p
                            class="text-slate-400 text-xs font-black tracking-widest uppercase mb-1 flex items-center gap-1"
                        >
                            <Percent class="w-3 h-3" /> Propina
                        </p>
                        <div
                            class="text-xl font-black font-mono text-brand-400 drop-shadow-[0_0_10px_rgba(14,165,233,0.3)] tabular-nums"
                        >
                            {$currencyStore}{tipAmount.toFixed(2)}
                        </div>
                        <p class="text-xs text-slate-500 mt-1 font-medium">
                            {$currencyStore}{tipPerPerson.toFixed(2)}/persona
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="text-slate-400 text-xs font-black tracking-widest uppercase mb-1">
                            Total
                        </p>
                        <div
                            class="text-xl font-black font-mono text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        >
                            {$currencyStore}{totalAmount.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</ProGate>
