<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { addToast } from '$lib/stores/toasts';
    import { Copy, RefreshCw, ShieldCheck, Eye, EyeOff } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';

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
    <title>Generador de Contraseñas | ChillChess</title>
    <meta
        name="description"
        content="Genera contraseñas seguras y robustas con alta entropía. Personaliza longitud y tipos de caracteres."
    />
</svelte:head>

<ProGate>
    <div class="relative max-w-2xl mx-auto space-y-6">
        <!-- Ambient Background Glows -->
        <div
            class="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none"
        ></div>
        <div
            class="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-500/5 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none"
        ></div>

        <!-- Main Container -->
        <div
            class="bg-black/40 backdrop-blur-2xl border border-white/10 shadow-sm rounded-3xl p-6 sm:p-8 relative overflow-hidden space-y-8"
        >
            <!-- Subtle Top Highlight -->
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            ></div>

            <!-- Password Display -->
            <div class="space-y-4">
                <div class="flex items-center gap-3 relative">
                    <div
                        class="absolute -inset-1 bg-gradient-to-r from-white/10 to-transparent rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"
                    ></div>

                    <div
                        class="relative flex-1 bg-black/40 border border-white/20 rounded-2xl px-4 py-4 sm:py-5 font-mono text-lg sm:text-xl text-white overflow-x-auto whitespace-nowrap select-all shadow-inner font-light tracking-wider"
                    >
                        {#if showPassword}
                            {password || 'Haz click en generar'}
                        {:else}
                            {'•'.repeat(password.length || 20)}
                        {/if}
                    </div>

                    <div class="relative flex flex-col gap-2">
                        <button
                            on:click={copyPassword}
                            class="p-3 sm:p-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 shadow-lg border border-white/20 flex items-center justify-center group"
                            title="Copiar contraseña"
                        >
                            <Copy class="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>

                        <button
                            on:click={() => (showPassword = !showPassword)}
                            class="p-3 sm:p-4 rounded-xl bg-black/20 hover:bg-black/40 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95 shadow-lg flex items-center justify-center group"
                            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {#if showPassword}
                                <EyeOff
                                    class="w-5 h-5 group-hover:scale-110 transition-transform"
                                />
                            {:else}
                                <Eye class="w-5 h-5 group-hover:scale-110 transition-transform" />
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Strength Bar -->
                <div class="space-y-3 pt-2">
                    <div class="flex justify-between items-center">
                        <span
                            class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"
                        >
                            <ShieldCheck class="w-4 h-4 {strengthColor}" /> Fortaleza
                        </span>
                        <span
                            class="text-sm font-bold {strengthColor} bg-black/40 px-3 py-1 rounded-full border border-white/10"
                        >
                            {strength}
                            <span class="opacity-60 font-mono text-xs ml-1">({entropy} bits)</span>
                        </span>
                    </div>
                    <div
                        class="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10 shadow-inner relative"
                    >
                        <div
                            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] animate-[shimmer_2s_infinite]"
                        ></div>
                        <div
                            class="h-full rounded-full transition-all duration-700 ease-out {strengthBg} relative shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                            style="width: {strengthPercent}%"
                        >
                            <div class="absolute inset-0 bg-white/20"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"
            ></div>

            <!-- Options -->
            <div class="space-y-6">
                <!-- Length -->
                <div
                    class="space-y-4 bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/10"
                >
                    <label
                        for="pw-length"
                        class="flex justify-between items-center text-sm font-bold text-slate-300"
                    >
                        <span>Longitud</span>
                        <div class="flex items-center gap-2">
                            <span
                                class="bg-white/10 px-3 py-1 rounded-lg font-mono text-white border border-white/20 shadow-inner"
                                >{length}</span
                            >
                            <span class="text-xs text-slate-500">caracteres</span>
                        </div>
                    </label>
                    <div class="relative pt-2 pb-1">
                        <input
                            id="pw-length"
                            type="range"
                            min="8"
                            max="64"
                            bind:value={length}
                            class="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-white shadow-inner border border-white/10"
                        />
                    </div>
                    <div class="flex justify-between text-xs font-mono text-slate-500">
                        <span>8</span>
                        <span>32</span>
                        <span>64</span>
                    </div>
                </div>

                <!-- Character Types -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {#each [{ label: 'Mayúsculas', value: uppercase, toggle: () => (uppercase = !uppercase), preview: 'A-Z', icon: 'Aa' }, { label: 'Minúsculas', value: lowercase, toggle: () => (lowercase = !lowercase), preview: 'a-z', icon: 'aa' }, { label: 'Números', value: numbers, toggle: () => (numbers = !numbers), preview: '0-9', icon: '12' }, { label: 'Símbolos', value: symbols, toggle: () => (symbols = !symbols), preview: '!@#', icon: '@#' }] as opt}
                        <button
                            on:click={opt.toggle}
                            class="relative p-4 rounded-2xl border font-bold text-sm transition-all duration-300 overflow-hidden group {opt.value
                                ? 'bg-white/10 border-white/30 text-white shadow-sm'
                                : 'bg-black/20 border-white/5 text-slate-500 hover:bg-black/40 hover:border-white/10'}"
                        >
                            <!-- Active Glow -->
                            {#if opt.value}
                                <div
                                    class="absolute inset-0 bg-white/5 opacity-50 group-hover:opacity-100 transition-opacity"
                                ></div>
                            {/if}

                            <div class="relative flex items-center justify-between z-10">
                                <div class="flex items-center gap-3">
                                    <span
                                        class="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs {opt.value
                                            ? 'bg-white/20 text-white'
                                            : 'bg-black/40 text-slate-500'}"
                                    >
                                        {opt.icon}
                                    </span>
                                    <span>{opt.label}</span>
                                </div>

                                <div class="flex items-center gap-3">
                                    <span class="text-xs font-mono opacity-50 tracking-widest"
                                        >{opt.preview}</span
                                    >
                                    <!-- Custom Checkbox/Toggle -->
                                    <div
                                        class="w-5 h-5 rounded border flex items-center justify-center transition-colors {opt.value
                                            ? 'bg-white border-white text-black'
                                            : 'bg-black/40 border-white/20 text-transparent'}"
                                    >
                                        <svg
                                            class="w-3 h-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            stroke-width="3"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>

                <!-- Regenerate Button -->
                <button
                    on:click={generate}
                    class="w-full relative overflow-hidden group bg-white/5 hover:bg-white/10 border border-white/20 text-white font-medium py-4 rounded-2xl transition-all shadow-sm active:scale-[0.98] mt-4 backdrop-blur-md"
                >
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                    ></div>
                    <div class="relative flex items-center justify-center gap-3 z-10">
                        <RefreshCw
                            class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
                        />
                        <span class="tracking-wide">Generar Nueva Contraseña</span>
                    </div>
                </button>
            </div>
        </div>
    </div>
</ProGate>
