<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { addToast } from '$lib/stores/toasts';
    import { onMount } from 'svelte';
    import {
        ArrowRightLeft,
        DollarSign,
        Euro,
        PoundSterling,
        Activity,
        RefreshCw,
    } from 'lucide-svelte';

    pageHeader.set({
        title: 'Conversor Divisas',
        description: 'Tipos de cambio actualizados al instante.',
        category: 'Finanzas',
    });

    // We'll use a free/open API for fetching rates based on USD
    const API_URL = 'https://open.er-api.com/v6/latest/USD';

    let rates: Record<string, number> = {};
    let lastUpdated = '';
    let isLoading = true;

    // Supported common currencies for the simple UI
    const currencies = [
        { code: 'USD', name: 'Dólar Estadounidense', icon: DollarSign },
        { code: 'EUR', name: 'Euro', icon: Euro },
        { code: 'GBP', name: 'Libra Esterlina', icon: PoundSterling },
        { code: 'MXN', name: 'Peso Mexicano', icon: Activity },
        { code: 'COP', name: 'Peso Colombiano', icon: Activity },
        { code: 'ARS', name: 'Peso Argentino', icon: Activity },
        { code: 'CLP', name: 'Peso Chileno', icon: Activity },
        { code: 'JPY', name: 'Yen Japonés', icon: Activity },
    ];

    let fromAmount = 1;
    let fromCurrency = 'USD';
    let toCurrency = 'EUR';

    $: toAmount =
        Object.keys(rates).length > 0 ? (fromAmount / rates[fromCurrency]) * rates[toCurrency] : 0;

    async function fetchRates() {
        isLoading = true;
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data && data.rates) {
                rates = data.rates;
                lastUpdated = new Date(data.time_last_update_unix * 1000).toLocaleString('es-ES', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                });
                addToast('Tipos de cambio actualizados', 'success');
            } else {
                throw new Error('Formato inválido');
            }
        } catch (err) {
            console.error(err);
            addToast('Error al cargar divisas', 'error');
            // Mock data fallback if offline or errored
            rates = {
                USD: 1,
                EUR: 0.92,
                GBP: 0.79,
                MXN: 17.05,
                COP: 3900,
                ARS: 850,
                CLP: 980,
                JPY: 150,
            };
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        fetchRates();
    });

    function swapCurrencies() {
        const temp = fromCurrency;
        fromCurrency = toCurrency;
        toCurrency = temp;
    }
</script>

<svelte:head>
    <title>Conversor Divisas | MultiTool</title>
</svelte:head>

<div class="max-w-2xl mx-auto flex flex-col gap-6">
    <div
        class="bg-gradient-to-br from-brand-600 to-brand-800 p-8 rounded-3xl shadow-lg relative overflow-hidden text-white"
    >
        <div
            class="absolute -right-20 -top-20 w-64 h-64 bg-white rounded-full blur-3xl opacity-10 pointer-events-none"
        ></div>

        <div class="flex flex-col md:flex-row gap-6 items-center relative z-10">
            <!-- Amount -->
            <div
                class="flex-1 w-full bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20"
            >
                <label
                    for="fromAmount"
                    class="block text-brand-100 text-xs font-bold uppercase tracking-wider mb-2"
                    >Cantidad</label
                >
                <div class="flex items-center">
                    <span class="text-2xl font-black mr-2 opacity-50">$</span>
                    <input
                        id="fromAmount"
                        type="number"
                        bind:value={fromAmount}
                        class="w-full bg-transparent text-4xl font-black focus:outline-none placeholder-white/30"
                        placeholder="0.00"
                        min="0"
                    />
                </div>
            </div>

            <!-- Result -->
            <div class="flex-1 w-full text-right md:-mt-4">
                <div
                    class="inline-flex items-center gap-2 bg-brand-900/30 px-4 py-2 rounded-full border border-brand-500/50 mb-2"
                >
                    <span class="text-sm font-bold text-brand-100 uppercase tracking-widest"
                        >{toCurrency}</span
                    >
                </div>
                <div
                    class="text-5xl font-black font-mono tracking-tighter tabular-nums break-words"
                >
                    {isLoading
                        ? '...'
                        : toAmount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                          })}
                </div>
            </div>
        </div>
    </div>

    <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative">
        <div
            class="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-[45%] z-20 hidden md:block"
        >
            <button
                on:click={swapCurrencies}
                class="w-12 h-12 bg-white rounded-full border-2 border-slate-200 shadow-md flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all hover:rotate-180 duration-500"
            >
                <ArrowRightLeft class="w-5 h-5" />
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10">
            <div>
                <div class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    De (Moneda Origen)
                </div>
                <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {#each currencies as cur}
                        <button
                            on:click={() => (fromCurrency = cur.code)}
                            class="w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all {fromCurrency ===
                            cur.code
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'}"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs {fromCurrency ===
                                    cur.code
                                        ? 'bg-brand-100 text-brand-600'
                                        : ''}"
                                >
                                    {cur.code.substring(0, 2)}
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-800 leading-none"
                                        >{cur.code}</span
                                    >
                                    <span class="text-xs text-slate-400 mt-1">{cur.name}</span>
                                </div>
                            </div>
                            {#if fromCurrency === cur.code}
                                <div class="w-2 h-2 rounded-full bg-brand-500"></div>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <div>
                <div
                    class="flex text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 justify-between items-center"
                >
                    A (Moneda Destino)
                    <button
                        on:click={swapCurrencies}
                        class="md:hidden text-brand-600 bg-brand-50 p-1.5 rounded-lg"
                    >
                        <ArrowRightLeft class="w-4 h-4" />
                    </button>
                </div>
                <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {#each currencies as cur}
                        <button
                            on:click={() => (toCurrency = cur.code)}
                            class="w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all {toCurrency ===
                            cur.code
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'}"
                        >
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs {toCurrency ===
                                    cur.code
                                        ? 'bg-brand-100 text-brand-600'
                                        : ''}"
                                >
                                    {cur.code.substring(0, 2)}
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-800 leading-none"
                                        >{cur.code}</span
                                    >
                                    <span class="text-xs text-slate-400 mt-1">{cur.name}</span>
                                </div>
                            </div>
                            {#if toCurrency === cur.code}
                                <div class="w-2 h-2 rounded-full bg-brand-500"></div>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <div class="flex items-center justify-between text-xs font-medium text-slate-400 px-2">
        <p>
            1 {fromCurrency} = {rates[fromCurrency] && rates[toCurrency]
                ? (rates[toCurrency] / rates[fromCurrency]).toFixed(4)
                : '...'}
            {toCurrency}
        </p>
        <button
            on:click={fetchRates}
            class="flex items-center gap-1 hover:text-slate-800 transition-colors"
            class:animate-spin={isLoading}
        >
            <RefreshCw class="w-3 h-3" />
            {lastUpdated ? `Act: ${lastUpdated}` : 'Actualizar'}
        </button>
    </div>
</div>
