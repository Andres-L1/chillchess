<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { addToast } from '$lib/stores/toasts';
    import { ArrowLeftRight, RefreshCw, Loader2, TrendingUp } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';
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
    <title>Conversor de Divisas | ChillChess</title>
    <meta
        name="description"
        content="Convierte entre las principales monedas del mundo con tasas de cambio en tiempo real."
    />
</svelte:head>

<ProGate>
    <div class="max-w-3xl mx-auto space-y-8 py-10 px-4">
        <!-- Main Converter Card -->
        <div class="relative space-y-8">
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-12 space-y-10 shadow-neo"
            >
                <!-- Amount -->
                <div class="space-y-4">
                    <label
                        for="amount"
                        class="block text-xs font-black text-black dark:text-white uppercase tracking-widest ml-1"
                        >Cantidad a convertir</label
                    >
                    <div class="relative">
                        <input
                            id="amount"
                            type="number"
                            bind:value={amount}
                            min="0"
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-6 text-4xl font-black text-black dark:text-white focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all font-mono text-center placeholder:text-slate-300 dark:placeholder:text-slate-600"
                        />
                    </div>
                </div>

                <!-- Currency Selectors -->
                <div class="space-y-6">
                    <!-- From -->
                    <div class="space-y-4">
                        <span
                            class="flex items-center gap-2 text-xs font-black text-black dark:text-white uppercase tracking-widest ml-1"
                        >
                            <span class="w-3 h-3 bg-emerald-500 border-2 border-black"></span> Origen
                        </span>
                        <div
                            class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
                            role="group"
                            aria-label="Seleccionar moneda de origen"
                        >
                            {#each POPULAR_CURRENCIES as cur}
                                <button
                                    on:click={() => {
                                        fromCurrency = cur;
                                        fetchRates();
                                    }}
                                    class="p-3 border-2 border-black text-[10px] font-black transition-all flex flex-col items-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none {fromCurrency ===
                                    cur
                                        ? 'bg-emerald-500 text-white shadow-neo-sm'
                                        : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700'}"
                                >
                                    <span class="text-2xl">{CURRENCY_FLAGS[cur] || ''}</span>
                                    <span class="tracking-tighter uppercase">{cur}</span>
                                </button>
                            {/each}
                        </div>
                    </div>

                    <!-- Swap Button -->
                    <div class="flex justify-center relative z-10 -my-4 sm:-my-6">
                        <button
                            on:click={swapCurrencies}
                            class="p-4 bg-white dark:bg-slate-800 border-4 border-black text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90 shadow-neo-sm group"
                            title="Intercambiar divisas"
                        >
                            <ArrowLeftRight
                                class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
                            />
                        </button>
                    </div>

                    <!-- To -->
                    <div class="space-y-4">
                        <span
                            class="flex items-center gap-2 text-xs font-black text-black dark:text-white uppercase tracking-widest ml-1"
                        >
                            <span class="w-3 h-3 bg-primary border-2 border-black"></span> Destino
                        </span>
                        <div
                            class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
                            role="group"
                            aria-label="Seleccionar moneda de destino"
                        >
                            {#each POPULAR_CURRENCIES as cur}
                                <button
                                    on:click={() => (toCurrency = cur)}
                                    class="p-3 border-2 border-black text-[10px] font-black transition-all flex flex-col items-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none {toCurrency ===
                                    cur
                                        ? 'bg-primary text-white shadow-neo-sm'
                                        : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700'}"
                                >
                                    <span class="text-2xl">{CURRENCY_FLAGS[cur] || ''}</span>
                                    <span class="tracking-tighter uppercase">{cur}</span>
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Result Area -->
            <div
                class="bg-primary border-4 border-black p-10 flex flex-col items-center text-center shadow-neo"
            >
                {#if loading}
                    <div
                        class="flex flex-col items-center justify-center py-6 relative z-10 text-white"
                    >
                        <Loader2 class="w-10 h-10 animate-spin mb-4" />
                        <p class="text-lg font-black uppercase tracking-widest animate-pulse">
                            Obteniendo Tasas...
                        </p>
                    </div>
                {:else}
                    <div class="relative z-10 w-full space-y-8">
                        <p class="text-white/80 text-xs font-black uppercase tracking-widest">
                            Resultado de la conversión
                        </p>

                        <div class="flex flex-col gap-2">
                            <div
                                class="text-5xl sm:text-7xl font-black text-white tracking-tighter tabular-nums"
                            >
                                {convertedAmount.toLocaleString('es-ES', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                                <span
                                    class="bg-white text-black px-2 ml-2 uppercase text-2xl sm:text-3xl border-2 border-black shadow-neo-sm"
                                >
                                    {toCurrency}
                                </span>
                            </div>
                            <p class="text-white font-bold uppercase tracking-tight">
                                {amount}
                                {fromCurrency} = {convertedAmount.toFixed(2)}
                                {toCurrency}
                            </p>
                        </div>

                        <div
                            class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t-4 border-black/20"
                        >
                            <div
                                class="bg-black text-white px-4 py-2 border-2 border-black flex items-center gap-3"
                            >
                                <div class="w-2 h-2 bg-emerald-400"></div>
                                <span class="text-[10px] font-black uppercase tracking-widest">
                                    1 {fromCurrency} = {rate.toFixed(4)}
                                    {toCurrency}
                                </span>
                            </div>
                            <span
                                class="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2 bg-black/20 px-3 py-1 border-2 border-black/40"
                            >
                                <RefreshCw class="w-3 h-3" />
                                ACTUALIZADO: {lastUpdated}
                            </span>
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Refresh Button -->
        <div class="flex justify-center">
            <button
                on:click={fetchRates}
                disabled={loading}
                class="flex items-center gap-3 bg-white dark:bg-slate-800 border-2 border-black py-2 px-6 text-xs font-black text-black dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all uppercase tracking-widest shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none group"
            >
                <RefreshCw
                    class="w-4 h-4 transition-transform group-hover:rotate-180 duration-700 {loading
                        ? 'animate-spin'
                        : ''}"
                />
                ACTUALIZAR TASAS EN VIVO
            </button>
        </div>
    </div>
</ProGate>
