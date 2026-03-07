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
    <div class="max-w-3xl mx-auto space-y-8">
        <!-- Main Converter Card -->
        <div class="relative space-y-8">
            <!-- Ambient Background Glows -->
            <div
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] bg-neat-accent/10 -z-10 mix-blend-screen pointer-events-none"
            ></div>

            <div class="glass-card p-8 sm:p-10 space-y-10">
                <!-- Amount -->
                <div class="space-y-4">
                    <label
                        for="amount"
                        class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1"
                        >Cantidad a convertir</label
                    >
                    <div class="relative group">
                        <input
                            id="amount"
                            type="number"
                            bind:value={amount}
                            min="0"
                            class="w-full bg-black/20 border border-white/5 rounded-3xl px-6 py-6 text-4xl font-black text-white focus:outline-none focus:border-neat-accent/30 transition-all font-mono text-center placeholder:text-slate-800"
                        />
                    </div>
                </div>

                <!-- Currency Selectors -->
                <div class="space-y-6">
                    <!-- From -->
                    <div class="space-y-4">
                        <span
                            class="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1"
                        >
                            <span
                                class="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            ></span> Origen
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
                                    class="p-3 rounded-2xl border text-[10px] font-black transition-all duration-300 flex flex-col items-center gap-2 active:scale-95 {fromCurrency ===
                                    cur
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}"
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
                            class="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-90 shadow-2xl group backdrop-blur-xl"
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
                            class="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1"
                        >
                            <span
                                class="w-1.5 h-1.5 rounded-full bg-neat-accent shadow-[0_0_8px_rgba(0,229,255,0.5)]"
                            ></span> Destino
                        </span>
                        <div
                            class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
                            role="group"
                            aria-label="Seleccionar moneda de destino"
                        >
                            {#each POPULAR_CURRENCIES as cur}
                                <button
                                    on:click={() => (toCurrency = cur)}
                                    class="p-3 rounded-2xl border text-[10px] font-black transition-all duration-300 flex flex-col items-center gap-2 active:scale-95 {toCurrency ===
                                    cur
                                        ? 'bg-neat-accent/10 border-neat-accent/30 text-neat-accent'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}"
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
            <div class="glass-card p-10 flex flex-col items-center text-center overflow-hidden">
                <div
                    class="absolute inset-0 bg-gradient-to-br from-neat-accent/5 to-indigo-500/5 pointer-events-none"
                ></div>

                {#if loading}
                    <div class="flex flex-col items-center justify-center py-6 relative z-10">
                        <Loader2 class="w-10 h-10 animate-spin text-neat-accent mb-4" />
                        <p
                            class="text-[10px] font-black text-neat-accent uppercase tracking-[0.3em] animate-pulse"
                        >
                            Obteniendo Tasas...
                        </p>
                    </div>
                {:else}
                    <div class="relative z-10 w-full space-y-8">
                        <p class="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">
                            Resultado de la conversión
                        </p>

                        <div class="flex flex-col gap-2">
                            <div
                                class="text-5xl sm:text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl"
                            >
                                {convertedAmount.toLocaleString('es-ES', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                                <span
                                    class="text-neat-accent text-2xl sm:text-3xl ml-2 uppercase font-black"
                                    >{toCurrency}</span
                                >
                            </div>
                            <p class="text-slate-400 text-sm font-medium">
                                {amount}
                                {fromCurrency} = {convertedAmount.toFixed(2)}
                                {toCurrency}
                            </p>
                        </div>

                        <div
                            class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-white/5"
                        >
                            <div
                                class="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3"
                            >
                                <div
                                    class="w-1.5 h-1.5 rounded-full bg-neat-accent animate-pulse"
                                ></div>
                                <span
                                    class="text-[10px] font-black text-slate-300 uppercase tracking-widest"
                                >
                                    1 {fromCurrency} = {rate.toFixed(4)}
                                    {toCurrency}
                                </span>
                            </div>
                            <span
                                class="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"
                            >
                                <RefreshCw class="w-3 h-3" />
                                Actualizado: {lastUpdated}
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
                class="flex items-center gap-3 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest group"
            >
                <RefreshCw
                    class="w-4 h-4 transition-transform group-hover:rotate-180 duration-700 {loading
                        ? 'animate-spin'
                        : ''}"
                />
                Actualizar tasas en vivo
            </button>
        </div>
    </div>
</ProGate>
