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
    <div class="max-w-2xl mx-auto space-y-6">
        <!-- Main Converter Card -->
        <div class="relative max-w-2xl mx-auto space-y-6">
            <!-- Ambient Background Glows -->
            <div
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-brand-500/10 -z-10 mix-blend-screen pointer-events-none"
            ></div>

            <div
                class="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden space-y-8"
            >
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
                ></div>

                <!-- Amount -->
                <div
                    class="bg-slate-950/50 p-4 rounded-2xl border border-slate-700/50 shadow-inner group"
                >
                    <label
                        for="amount"
                        class="block text-[10px] font-bold text-brand-400 uppercase tracking-wider mb-2"
                        >Cantidad</label
                    >
                    <div class="relative">
                        <div
                            class="absolute -inset-0.5 bg-brand-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"
                        ></div>
                        <input
                            id="amount"
                            type="number"
                            bind:value={amount}
                            min="0"
                            class="relative w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-4 text-3xl font-black text-white focus:outline-none focus:border-brand-500/50 transition-all font-mono shadow-inner text-center"
                        />
                    </div>
                </div>

                <!-- Currency Selectors -->
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <div
                            class="flex-1 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-700/30 shadow-inner"
                        >
                            <label
                                for="from"
                                class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3"
                            >
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> De
                            </label>
                            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {#each POPULAR_CURRENCIES as cur}
                                    <button
                                        on:click={() => {
                                            fromCurrency = cur;
                                            fetchRates();
                                        }}
                                        class="p-2.5 rounded-xl border text-[10px] sm:text-xs font-bold transition-all duration-300 flex flex-col items-center gap-1.5 active:scale-95 {fromCurrency ===
                                        cur
                                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.15)] ring-1 ring-emerald-500/30'
                                            : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300'}"
                                    >
                                        <span class="text-xl drop-shadow-sm"
                                            >{CURRENCY_FLAGS[cur] || ''}</span
                                        >
                                        <span class="tracking-wider">{cur}</span>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    </div>

                    <!-- Swap Button -->
                    <div class="flex justify-center relative z-10 -my-7 sm:-my-8">
                        <button
                            on:click={swapCurrencies}
                            class="p-3.5 sm:p-4 rounded-full bg-slate-800 border-2 border-slate-700 text-slate-300 hover:text-brand-300 hover:bg-slate-700 transition-all active:scale-90 shadow-xl group relative overflow-hidden"
                            title="Intercambiar divisas"
                        >
                            <div
                                class="absolute inset-0 bg-brand-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"
                            ></div>
                            <ArrowLeftRight
                                class="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:rotate-180 transition-transform duration-500"
                            />
                        </button>
                    </div>

                    <div class="flex items-center gap-4">
                        <div
                            class="flex-1 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-700/30 shadow-inner"
                        >
                            <label
                                for="to"
                                class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3"
                            >
                                <span class="w-1.5 h-1.5 rounded-full bg-brand-400"></span> A
                            </label>
                            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {#each POPULAR_CURRENCIES as cur}
                                    <button
                                        on:click={() => (toCurrency = cur)}
                                        class="p-2.5 rounded-xl border text-[10px] sm:text-xs font-bold transition-all duration-300 flex flex-col items-center gap-1.5 active:scale-95 {toCurrency ===
                                        cur
                                            ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 shadow-[0_0_15px_rgba(14,165,233,0.15)] ring-1 ring-brand-500/30'
                                            : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-600 hover:bg-slate-800/50 hover:text-slate-300'}"
                                    >
                                        <span class="text-xl drop-shadow-sm"
                                            >{CURRENCY_FLAGS[cur] || ''}</span
                                        >
                                        <span class="tracking-wider">{cur}</span>
                                    </button>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Result Card -->
            <div
                class="relative w-full rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col justify-center items-center text-center transition-all group border border-white/10 mt-6 bg-slate-900/40 backdrop-blur-xl"
            >
                <!-- Decorative Elements -->
                <div
                    class="absolute inset-0 bg-gradient-to-br from-brand-900/40 to-indigo-900/40"
                ></div>
                <div
                    class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"
                ></div>
                <div
                    class="absolute -right-20 -top-20 w-64 h-64 bg-brand-500 rounded-full blur-[80px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-700"
                ></div>
                <div
                    class="absolute -left-20 -bottom-20 w-48 h-48 bg-emerald-500 rounded-full blur-[60px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700"
                ></div>

                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent"
                ></div>

                {#if loading}
                    <div
                        class="flex flex-col items-center justify-center py-10 relative z-10 w-full"
                    >
                        <Loader2 class="w-10 h-10 animate-spin text-brand-400 mb-4" />
                        <p
                            class="text-sm font-bold text-brand-200/50 uppercase tracking-widest animate-pulse"
                        >
                            Calculando...
                        </p>
                    </div>
                {:else}
                    <div class="relative z-10 w-full">
                        <p
                            class="text-slate-400 text-sm mb-3 flex items-center justify-center gap-2 font-medium"
                        >
                            <TrendingUp class="w-4 h-4 text-emerald-400" />
                            {amount} <span class="text-white font-bold">{fromCurrency}</span> es equivalente
                            a
                        </p>

                        <div
                            class="flex items-center justify-center bg-slate-950/40 rounded-2xl py-6 px-4 border border-white/5 shadow-inner mb-6 relative overflow-hidden group/result"
                        >
                            <div
                                class="absolute inset-0 bg-brand-500/5 opacity-0 group-hover/result:opacity-100 transition-opacity"
                            ></div>
                            <div
                                class="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tighter tabular-nums break-all text-white drop-shadow-xl relative z-10"
                            >
                                {convertedAmount.toLocaleString('es-ES', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                                <span
                                    class="text-brand-400 text-2xl sm:text-3xl ml-2 tracking-normal"
                                    >{toCurrency}</span
                                >
                            </div>
                        </div>

                        <div
                            class="flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] sm:text-xs"
                        >
                            <span
                                class="bg-slate-900/60 px-3 py-1.5 rounded-full text-slate-300 font-mono border border-slate-700/50 flex items-center gap-1.5 shadow-inner"
                            >
                                <span class="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"
                                ></span>
                                1 {fromCurrency} = {rate.toFixed(4)}
                                {toCurrency}
                            </span>
                            <span
                                class="text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1"
                            >
                                <RefreshCw class="w-3 h-3" />
                                {lastUpdated}
                            </span>
                        </div>
                    </div>
                {/if}
            </div>
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
</ProGate>
