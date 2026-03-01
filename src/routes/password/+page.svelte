<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { addToast } from '$lib/stores/toasts';
    import { ShieldCheck, Copy, RefreshCw, Layers, Hash, Sparkles } from 'lucide-svelte';

    pageHeader.set({
        title: 'Generador Contraseñas',
        description: 'Crea contraseñas seguras y a prueba de hackers localmente.',
        category: 'Seguridad',
    });

    let length = 16;
    let useUpper = true;
    let useLower = true;
    let useNumbers = true;
    let useSymbols = true;

    let generatedPassword = '';

    // Entropy calculation
    $: poolSize =
        (useUpper ? 26 : 0) + (useLower ? 26 : 0) + (useNumbers ? 10 : 0) + (useSymbols ? 32 : 0);
    $: entropy = Math.round(length * Math.log2(poolSize || 1));

    $: strength =
        entropy < 40
            ? { label: 'Débil', color: 'bg-red-500', text: 'text-red-500' }
            : entropy < 60
              ? { label: 'Buena', color: 'bg-yellow-500', text: 'text-yellow-500' }
              : entropy < 80
                ? { label: 'Fuerte', color: 'bg-green-500', text: 'text-green-500' }
                : { label: 'Excelente', color: 'bg-brand-500', text: 'text-brand-500' };

    function generate() {
        if (!useUpper && !useLower && !useNumbers && !useSymbols) {
            useLower = true;
        }

        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*.?-=_+[]{}()|';

        let pool = '';
        let requiredChars = [];

        if (useUpper) {
            pool += upper;
            requiredChars.push(upper[Math.floor(Math.random() * upper.length)]);
        }
        if (useLower) {
            pool += lower;
            requiredChars.push(lower[Math.floor(Math.random() * lower.length)]);
        }
        if (useNumbers) {
            pool += numbers;
            requiredChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
        }
        if (useSymbols) {
            pool += symbols;
            requiredChars.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }

        let pwd = requiredChars.join('');
        for (let i = requiredChars.length; i < length; i++) {
            pwd += pool[Math.floor(Math.random() * pool.length)];
        }

        // Shuffle
        pwd = pwd
            .split('')
            .sort(() => 0.5 - Math.random())
            .join('');
        generatedPassword = pwd;
    }

    function copyToClipboard() {
        if (!generatedPassword) return;
        navigator.clipboard.writeText(generatedPassword);
        addToast('Contraseña copiada', 'success');
    }

    // Initial generation
    $: if (!generatedPassword) {
        generate();
    }
</script>

<svelte:head>
    <title>Generador Contraseñas | MultiTool</title>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-6">
    <div
        class="relative bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
    >
        <div
            class="absolute -right-20 -top-20 w-64 h-64 {strength.color} rounded-full blur-3xl opacity-10 pointer-events-none transition-colors duration-500"
        ></div>

        <div class="relative z-10">
            <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                Contraseña Generada
            </h3>

            <div class="flex items-center gap-3">
                <div
                    class="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 break-all font-mono text-2xl md:text-3xl font-medium tracking-tight text-slate-800 shadow-inner flex items-center justify-center min-h-[100px] text-center"
                >
                    {generatedPassword}
                </div>

                <div class="flex flex-col gap-2 shrink-0">
                    <button
                        on:click={copyToClipboard}
                        class="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white p-4 rounded-xl transition-all shadow-md flex items-center justify-center group"
                        title="Copiar"
                    >
                        <Copy class="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        on:click={generate}
                        class="bg-slate-800 hover:bg-slate-900 active:scale-95 text-white p-4 rounded-xl transition-all shadow-md flex items-center justify-center group"
                        title="Regenerar"
                    >
                        <RefreshCw
                            class="w-6 h-6 group-hover:rotate-180 transition-transform duration-500"
                        />
                    </button>
                </div>
            </div>

            <div class="mt-4 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <ShieldCheck class="w-5 h-5 {strength.text} transition-colors duration-500" />
                    <span
                        class="text-sm font-bold {strength.text} transition-colors duration-500 uppercase tracking-wide"
                        >{strength.label}</span
                    >
                    <span class="text-xs text-slate-400">({entropy} bits de entropía)</span>
                </div>
                <div class="flex gap-1 h-1 w-32 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        class="h-full {strength.color} transition-all duration-500"
                        style="width: {Math.min(100, (entropy / 100) * 100)}%"
                    ></div>
                </div>
            </div>
        </div>
    </div>

    <div class="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3
            class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2"
        >
            <Layers class="w-4 h-4 text-brand-500" /> Configuración
        </h3>

        <div>
            <div class="flex justify-between items-center mb-4">
                <label for="passwordLength" class="font-bold tracking-wide text-slate-700 text-sm"
                    >Longitud de contraseña</label
                >
                <span
                    class="bg-brand-50 text-brand-700 font-bold px-3 py-1 rounded-lg border border-brand-100 font-mono text-lg"
                    >{length}</span
                >
            </div>

            <input
                id="passwordLength"
                type="range"
                min="8"
                max="64"
                bind:value={length}
                on:input={generate}
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div class="flex justify-between text-xs font-bold text-slate-400 mt-2">
                <span>8</span>
                <span>32</span>
                <span>64</span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <label
                for="useUpper"
                class="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 hover:border-brand-200 transition-all group {useUpper
                    ? 'bg-brand-50/30 border-brand-200'
                    : ''}"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors {useUpper
                            ? 'bg-brand-100 text-brand-600'
                            : ''}"
                    >
                        A
                    </div>
                    <span class="text-sm font-bold text-slate-700">Mayúsculas (A-Z)</span>
                </div>
                <input
                    id="useUpper"
                    type="checkbox"
                    bind:checked={useUpper}
                    on:change={generate}
                    class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
            </label>

            <label
                for="useLower"
                class="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 hover:border-brand-200 transition-all group {useLower
                    ? 'bg-brand-50/30 border-brand-200'
                    : ''}"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors {useLower
                            ? 'bg-brand-100 text-brand-600'
                            : ''}"
                    >
                        a
                    </div>
                    <span class="text-sm font-bold text-slate-700">Minúsculas (a-z)</span>
                </div>
                <input
                    id="useLower"
                    type="checkbox"
                    bind:checked={useLower}
                    on:change={generate}
                    class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
            </label>

            <label
                for="useNumbers"
                class="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 hover:border-brand-200 transition-all group {useNumbers
                    ? 'bg-brand-50/30 border-brand-200'
                    : ''}"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors {useNumbers
                            ? 'bg-brand-100 text-brand-600'
                            : ''}"
                    >
                        <Hash class="w-4 h-4" />
                    </div>
                    <span class="text-sm font-bold text-slate-700">Números (0-9)</span>
                </div>
                <input
                    id="useNumbers"
                    type="checkbox"
                    bind:checked={useNumbers}
                    on:change={generate}
                    class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
            </label>

            <label
                for="useSymbols"
                class="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 hover:border-brand-200 transition-all group {useSymbols
                    ? 'bg-brand-50/30 border-brand-200'
                    : ''}"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xl group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors {useSymbols
                            ? 'bg-brand-100 text-brand-600'
                            : ''}"
                    >
                        <Sparkles class="w-4 h-4" />
                    </div>
                    <span class="text-sm font-bold text-slate-700">Símbolos (!@#$%)</span>
                </div>
                <input
                    id="useSymbols"
                    type="checkbox"
                    bind:checked={useSymbols}
                    on:change={generate}
                    class="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
            </label>
        </div>
    </div>
</div>
