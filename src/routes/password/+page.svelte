<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { addToast } from '$lib/stores/toasts';
    import { Copy, RefreshCw, ShieldCheck, Eye, EyeOff } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';

    pageHeader.set({
        title: 'GENERADOR DE CLAVES SEGURAS',
        description:
            'Crea contraseñas imposibles de descifrar. Entropía máxima, seguridad absoluta.',
        category: 'SEGURIDAD',
    });

    let length = 20;
    let uppercase = true;
    let lowercase = true;
    let numbers = true;
    let symbols = true;
    let password = '';
    let showPassword = true;

    const CHARSETS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    };

    function generate() {
        let chars = '';
        if (uppercase) chars += CHARSETS.uppercase;
        if (lowercase) chars += CHARSETS.lowercase;
        if (numbers) chars += CHARSETS.numbers;
        if (symbols) chars += CHARSETS.symbols;

        if (!chars) {
            addToast('Selecciona al menos un tipo de carácter', 'error');
            return;
        }

        // Use crypto.getRandomValues for cryptographic security
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        password = Array.from(array, (x) => chars[x % chars.length]).join('');
    }

    function copyPassword() {
        if (!password) return;
        navigator.clipboard.writeText(password).then(() => {
            addToast('Contraseña copiada', 'success');
        });
    }

    // Auto-generate on mount and param changes
    $: if (length && (uppercase || lowercase || numbers || symbols)) {
        generate();
    }

    // Strength calculation
    $: poolSize =
        (uppercase ? 26 : 0) + (lowercase ? 26 : 0) + (numbers ? 10 : 0) + (symbols ? 26 : 0);
    $: entropy = poolSize > 0 ? Math.floor(length * Math.log2(poolSize)) : 0;
    $: strength =
        entropy >= 100
            ? 'Excelente'
            : entropy >= 60
              ? 'Fuerte'
              : entropy >= 40
                ? 'Moderada'
                : 'Débil';
    $: strengthColor =
        entropy >= 100
            ? 'text-emerald-400'
            : entropy >= 60
              ? 'text-blue-400'
              : entropy >= 40
                ? 'text-amber-400'
                : 'text-red-400';
    $: strengthBg =
        entropy >= 100
            ? 'bg-emerald-400'
            : entropy >= 60
              ? 'bg-blue-400'
              : entropy >= 40
                ? 'bg-amber-400'
                : 'bg-red-400';
    $: strengthPercent = Math.min(100, (entropy / 128) * 100);
</script>

<svelte:head>
    <title>Generador de Contraseñas | ChillChess</title>
    <meta
        name="description"
        content="Genera contraseñas seguras y robustas con alta entropía. Personaliza longitud y tipos de caracteres."
    />
</svelte:head>

<ProGate>
    <div class="relative max-w-2xl mx-auto flex flex-col gap-8 py-10 px-4">
        <!-- Main Container -->
        <div
            class="bg-white dark:bg-slate-900 border-4 border-black p-8 sm:p-12 space-y-10 shadow-neo relative"
        >
            <!-- Password Display Section -->
            <div class="space-y-6">
                <div class="flex items-center justify-between mb-2">
                    <h3
                        class="text-xs font-black text-black dark:text-white uppercase tracking-widest"
                    >
                        CONTRASEÑA GENERADA
                    </h3>
                    <div class="flex items-center gap-2">
                        <span
                            class="text-xs font-black text-white uppercase tracking-widest px-3 py-1.5 border-2 border-black {strengthBg}"
                        >
                            {strength}
                        </span>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-stretch gap-4">
                    <div
                        class="flex-1 bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-6 font-mono text-2xl text-black dark:text-white overflow-x-auto whitespace-nowrap select-all tracking-wider min-h-[80px] flex items-center"
                    >
                        {#if showPassword}
                            {password || 'Generando...'}
                        {:else}
                            {'•'.repeat(password.length || 20)}
                        {/if}
                    </div>

                    <div class="flex sm:flex-col gap-3">
                        <button
                            on:click={copyPassword}
                            class="flex-1 sm:flex-none p-5 bg-primary text-white border-4 border-black hover:bg-black transition-colors shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center group"
                            title="Copiar contraseña"
                        >
                            <Copy class="w-6 h-6 group-hover:rotate-6 transition-transform" />
                        </button>

                        <button
                            on:click={() => (showPassword = !showPassword)}
                            class="flex-1 sm:flex-none p-5 bg-white dark:bg-slate-800 border-4 border-black text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center group"
                            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {#if showPassword}
                                <EyeOff class="w-6 h-6" />
                            {:else}
                                <Eye class="w-6 h-6" />
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Strength Progress -->
                <div class="space-y-3">
                    <div
                        class="h-6 bg-slate-200 dark:bg-slate-800 border-4 border-black overflow-hidden"
                    >
                        <div
                            class="h-full transition-all duration-700 ease-out {strengthBg} border-r-4 border-black"
                            style="width: {strengthPercent}%"
                        ></div>
                    </div>
                    <div
                        class="flex justify-between text-[10px] font-black text-black dark:text-white uppercase tracking-widest"
                    >
                        <span>SEGURIDAD: {strengthPercent.toFixed(0)}%</span>
                        <span>{entropy} BITS DE ENTROPÍA</span>
                    </div>
                </div>
            </div>

            <div class="h-1 w-full bg-black"></div>

            <!-- Configuration Section -->
            <div class="space-y-10">
                <!-- Length Slider -->
                <div class="space-y-6">
                    <div class="flex justify-between items-end">
                        <label for="pw-length" class="space-y-1">
                            <span
                                class="block text-sm font-black text-black dark:text-white uppercase"
                                >LONGITUD DE LA CLAVE</span
                            >
                            <span class="block text-xs text-slate-500 font-bold uppercase"
                                >RECOMENDADO: 16+ CARACTERES</span
                            >
                        </label>
                        <span
                            class="bg-primary text-white px-4 py-1 text-2xl font-black tabular-nums border-4 border-black shadow-neo-sm"
                        >
                            {length}
                        </span>
                    </div>
                    <div class="relative h-8 flex items-center">
                        <input
                            id="pw-length"
                            type="range"
                            min="8"
                            max="64"
                            bind:value={length}
                            class="w-full h-4 bg-slate-200 dark:bg-slate-700 border-2 border-black appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>

                <!-- Toggle Options -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {#each [{ label: 'MAYÚSCULAS', value: uppercase, toggle: () => (uppercase = !uppercase), preview: 'ABC', icon: 'AA' }, { label: 'MINÚSCULAS', value: lowercase, toggle: () => (lowercase = !lowercase), preview: 'abc', icon: 'aa' }, { label: 'NÚMEROS', value: numbers, toggle: () => (numbers = !numbers), preview: '123', icon: '12' }, { label: 'SÍMBOLOS', value: symbols, toggle: () => (symbols = !symbols), preview: '!@#', icon: '@#' }] as opt}
                        <button
                            on:click={opt.toggle}
                            class="p-5 border-4 border-black transition-all flex items-center justify-between group {opt.value
                                ? 'bg-primary text-white shadow-neo-sm translate-x-[-2px] translate-y-[-2px]'
                                : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700'}"
                        >
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-xs {opt.value
                                        ? 'bg-white text-black'
                                        : 'bg-black text-white'}"
                                >
                                    {opt.icon}
                                </div>
                                <div class="text-left">
                                    <p class="text-xs font-black uppercase tracking-widest">
                                        {opt.label}
                                    </p>
                                    <p class="text-[10px] font-mono opacity-60 uppercase">
                                        {opt.preview}
                                    </p>
                                </div>
                            </div>

                            <div
                                class="w-6 h-6 border-2 border-black flex items-center justify-center {opt.value
                                    ? 'bg-white text-black'
                                    : 'bg-slate-200'}"
                            >
                                {#if opt.value}
                                    <svg
                                        class="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        stroke-width="5"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                {/if}
                            </div>
                        </button>
                    {/each}
                </div>

                <!-- Regeneration Button -->
                <div class="pt-4">
                    <button
                        on:click={generate}
                        class="w-full bg-black text-white py-5 flex items-center justify-center gap-3 border-4 border-black hover:bg-primary transition-colors shadow-neo active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                    >
                        <RefreshCw
                            class="w-5 h-5 group-hover:rotate-180 transition-transform duration-700"
                        />
                        <span class="text-lg font-black uppercase tracking-widest"
                            >GENERAR NUEVA CLAVE</span
                        >
                    </button>
                </div>
            </div>
        </div>

        <!-- Security Tip -->
        <div class="bg-primary/10 border-4 border-black p-6 shadow-neo-sm">
            <div class="flex gap-4 items-start">
                <div
                    class="p-3 bg-white dark:bg-slate-900 border-2 border-black text-black dark:text-white"
                >
                    <ShieldCheck class="w-5 h-5" />
                </div>
                <div>
                    <h4
                        class="text-xs font-black text-black dark:text-white uppercase tracking-widest mb-1"
                    >
                        PRIVACIDAD ABSOLUTA
                    </h4>
                    <p
                        class="text-[10px] text-black dark:text-white font-bold uppercase leading-relaxed"
                    >
                        TUS CLAVES SE GENERAN LOCALMENTE USANDO <span
                            class="bg-primary text-white px-1">CRIPTOGRAFÍA WEB</span
                        >. NADA SALE DE TU DISPOSITIVO.
                    </p>
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

    /* Track height for Firefox */
    input[type='range']::-moz-range-track {
        height: 1rem;
        background: #e2e8f0;
        border: 2px solid black;
    }
</style>
