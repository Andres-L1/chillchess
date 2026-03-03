<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { addToast } from '$lib/stores/toasts';
    import { Copy, RefreshCw, ShieldCheck, Eye, EyeOff } from 'lucide-svelte';

    pageHeader.set({
        title: 'Claves Seguras',
        description: 'Genera contraseñas robustas con entropía máxima.',
        category: 'Seguridad',
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
    <title>Generador de Contraseñas | MultiTool</title>
    <meta
        name="description"
        content="Genera contraseñas seguras y robustas con alta entropía. Personaliza longitud y tipos de caracteres."
    />
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
    <!-- Password Display -->
    <div
        class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-lg shadow-black/10"
    >
        <div class="flex items-center gap-3">
            <div
                class="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 sm:px-4 py-3 sm:py-4 font-mono text-sm sm:text-lg text-white overflow-x-auto whitespace-nowrap select-all"
            >
                {#if showPassword}
                    {password || 'Haz click en generar'}
                {:else}
                    {'•'.repeat(password.length || 20)}
                {/if}
            </div>
            <button
                on:click={() => (showPassword = !showPassword)}
                class="p-3 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:text-white transition-all"
            >
                {#if showPassword}
                    <EyeOff class="w-5 h-5" />
                {:else}
                    <Eye class="w-5 h-5" />
                {/if}
            </button>
            <button
                on:click={copyPassword}
                class="p-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all active:scale-95 shadow-lg shadow-brand-500/20"
            >
                <Copy class="w-5 h-5" />
            </button>
        </div>

        <!-- Strength Bar -->
        <div class="mt-4 space-y-2">
            <div class="flex justify-between items-center">
                <span
                    class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"
                >
                    <ShieldCheck class="w-3.5 h-3.5" /> Fortaleza
                </span>
                <span class="text-xs font-bold {strengthColor}">{strength} ({entropy} bits)</span>
            </div>
            <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    class="h-full rounded-full transition-all duration-500 {strengthBg}"
                    style="width: {strengthPercent}%"
                ></div>
            </div>
        </div>
    </div>

    <!-- Options -->
    <div
        class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 shadow-lg shadow-black/10 space-y-5"
    >
        <!-- Length -->
        <div>
            <label
                for="pw-length"
                class="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3"
            >
                <span>Longitud</span>
                <span class="bg-slate-700/50 px-2 py-0.5 rounded font-bold text-brand-400"
                    >{length}</span
                >
            </label>
            <input
                id="pw-length"
                type="range"
                min="8"
                max="64"
                bind:value={length}
                class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div class="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>8</span>
                <span>64</span>
            </div>
        </div>

        <!-- Character Types -->
        <div class="grid grid-cols-2 gap-3">
            {#each [{ label: 'Mayúsculas', value: uppercase, toggle: () => (uppercase = !uppercase), preview: 'A-Z' }, { label: 'Minúsculas', value: lowercase, toggle: () => (lowercase = !lowercase), preview: 'a-z' }, { label: 'Números', value: numbers, toggle: () => (numbers = !numbers), preview: '0-9' }, { label: 'Símbolos', value: symbols, toggle: () => (symbols = !symbols), preview: '!@#' }] as opt}
                <button
                    on:click={opt.toggle}
                    class="p-3 rounded-xl border transition-all flex items-center justify-between text-sm font-bold {opt.value
                        ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                        : 'bg-slate-900/30 border-slate-700/50 text-slate-500'}"
                >
                    <span>{opt.label}</span>
                    <span class="text-xs opacity-60 font-mono">{opt.preview}</span>
                </button>
            {/each}
        </div>

        <!-- Regenerate Button -->
        <button
            on:click={generate}
            class="w-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
            <RefreshCw class="w-4 h-4" /> Regenerar
        </button>
    </div>
</div>
