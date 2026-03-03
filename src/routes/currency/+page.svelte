<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { addToast } from '$lib/stores/toasts';
    import { ArrowLeftRight, RefreshCw, Loader2, TrendingUp } from 'lucide-svelte';
    import { onMount } from 'svelte';

    pageHeader.set({
        title: 'Conversor Divisas',
        description: 'Convierte entre las principales monedas del mundo en tiempo real.',
        category: 'Finanzas',
    });

    let amount = 100;
    let fromCurrency = 'EUR';
    let toCurrency = 'USD';
    let rates: Record<string, number> = {};
    let loading = true;
    let lastUpdated = '';

    const POPULAR_CURRENCIES = [
        'EUR',
        'USD',
        'GBP',
        'JPY',
        'CHF',
        'CAD',
        'AUD',
        'CNY',
        'MXN',
        'BRL',
        'ARS',
        'COP',
    ];

    const CURRENCY_NAMES: Record<string, string> = {
        EUR: 'Euro',
        USD: 'Dólar US',
        GBP: 'Libra',
        JPY: 'Yen',
        CHF: 'Franco',
        CAD: 'Dólar CA',
        AUD: 'Dólar AU',
        CNY: 'Yuan',
        MXN: 'Peso MX',
        BRL: 'Real',
        ARS: 'Peso AR',
        COP: 'Peso CO',
    };

    const CURRENCY_FLAGS: Record<string, string> = {
        EUR: '🇪🇺',
        USD: '🇺🇸',
        GBP: '🇬🇧',
        JPY: '🇯🇵',
        CHF: '🇨🇭',
        CAD: '🇨🇦',
        AUD: '🇦🇺',
        CNY: '🇨🇳',
        MXN: '🇲🇽',
        BRL: '🇧🇷',
        ARS: '🇦🇷',
        COP: '🇨🇴',
    };

    async function fetchRates() {
        loading = true;
        try {
            const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
            const data = await res.json();
            if (data.result === 'success') {
                rates = data.rates;
                lastUpdated = new Date(data.time_last_update_utc).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            } else throw new Error('API Error');
        } catch {
            addToast('Error al obtener tasas, usando datos de respaldo', 'error');
            rates = {
                EUR: 1,
                USD: 1.08,
                GBP: 0.86,
                JPY: 162.5,
                CHF: 0.94,
                CAD: 1.47,
                AUD: 1.66,
                CNY: 7.85,
                MXN: 18.5,
                BRL: 5.35,
                ARS: 920,
                COP: 4250,
            };
            lastUpdated = 'Datos de respaldo';
        }
        loading = false;
    }

    onMount(fetchRates);

    $: convertedAmount = rates[toCurrency] ? amount * rates[toCurrency] : 0;
    $: rate = rates[toCurrency] || 0;

    function swapCurrencies() {
        [fromCurrency, toCurrency] = [toCurrency, fromCurrency];
        fetchRates();
    }
</script>

<svelte:head>
    <title>Conversor de Divisas | MultiTool</title>
    <meta
        name="description"
        content="Convierte entre las principales monedas del mundo con tasas de cambio en tiempo real."
    />
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
    <!-- Main Converter Card -->
    <div
        class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-slate-700/50 shadow-lg shadow-black/10 space-y-6"
    >
        <!-- Amount -->
        <div>
            <label
                for="amount"
                class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                >Cantidad</label
            >
            <input
                id="amount"
                type="number"
                bind:value={amount}
                min="0"
                class="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-4 text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono"
            />
        </div>

        <!-- Currency Selectors -->
        <div class="flex items-center gap-3">
            <div class="flex-1">
                <label
                    for="from"
                    class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                    >De</label
                >
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {#each POPULAR_CURRENCIES as cur}
                        <button
                            on:click={() => {
                                fromCurrency = cur;
                                fetchRates();
                            }}
                            class="p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 {fromCurrency ===
                            cur
                                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                                : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:border-slate-600'}"
                        >
                            <span class="text-lg">{CURRENCY_FLAGS[cur] || ''}</span>
                            <span>{cur}</span>
                        </button>
                    {/each}
                </div>
            </div>
        </div>

        <!-- Swap Button -->
        <div class="flex justify-center">
            <button
                on:click={swapCurrencies}
                class="p-3 rounded-full bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-brand-400 hover:bg-slate-700 transition-all active:scale-95"
            >
                <ArrowLeftRight class="w-5 h-5" />
            </button>
        </div>

        <div>
            <label
                for="to"
                class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                >A</label
            >
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {#each POPULAR_CURRENCIES as cur}
                    <button
                        on:click={() => (toCurrency = cur)}
                        class="p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 {toCurrency ===
                        cur
                            ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                            : 'bg-slate-900/30 border-slate-700/50 text-slate-400 hover:border-slate-600'}"
                    >
                        <span class="text-lg">{CURRENCY_FLAGS[cur] || ''}</span>
                        <span>{cur}</span>
                    </button>
                {/each}
            </div>
        </div>
    </div>

    <!-- Result Card -->
    <div
        class="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden"
    >
        <div
            class="absolute -right-10 -top-10 w-40 h-40 bg-white rounded-full blur-3xl opacity-10 pointer-events-none"
        ></div>
        {#if loading}
            <div class="flex items-center justify-center py-4">
                <Loader2 class="w-8 h-8 animate-spin text-brand-200" />
            </div>
        {:else}
            <div class="relative z-10">
                <p class="text-brand-200/80 text-sm mb-1 flex items-center gap-2">
                    <TrendingUp class="w-4 h-4" />
                    {amount}
                    {fromCurrency} =
                </p>
                <div
                    class="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tighter tabular-nums break-all"
                >
                    {convertedAmount.toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                    {toCurrency}
                </div>
                <div class="mt-4 flex justify-between items-center text-brand-200/60 text-xs">
                    <span>1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</span>
                    <span>{lastUpdated}</span>
                </div>
            </div>
        {/if}
    </div>

    <!-- Refresh -->
    <div class="flex justify-center">
        <button
            on:click={fetchRates}
            disabled={loading}
            class="text-sm text-slate-500 hover:text-brand-400 transition-colors flex items-center gap-2 font-medium"
        >
            <span class="inline-flex" class:animate-spin={loading}
                ><RefreshCw class="w-4 h-4" /></span
            > Actualizar tasas
        </button>
    </div>
</div>
