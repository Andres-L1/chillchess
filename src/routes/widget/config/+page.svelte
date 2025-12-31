<script lang="ts">
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { userStore } from '$lib/auth/userStore';
    import { toast } from '$lib/stores/notificationStore';

    let activeTab: 'music' | 'focus' = 'music';

    let showLogo = true;
    let opacity = 0.9;

    $: baseUrl = browser ? window.location.origin : '';
    $: uidParam = $userStore.user?.uid ? `&uid=${$userStore.user.uid}` : '';

    $: widgetUrl =
        activeTab === 'music'
            ? `${baseUrl}/widget?theme=dark&size=large&showLogo=${showLogo}&opacity=${opacity}${uidParam}`
            : `${baseUrl}/widget/focus?uid=${$userStore.user?.uid || ''}`;

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(widgetUrl);
            toast.success('URL copiada al portapapeles');
        } catch (err) {
            toast.error('Error al copiar. Por favor copia manualmente.');
        }
    }
</script>

<svelte:head>
    <title>Widget Hub - Configuración | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-[#0B1120] text-white font-poppins px-4 py-8 md:p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <button
                on:click={() => goto('/')}
                class="text-slate-400 hover:text-white mb-4 flex items-center gap-2 text-sm"
            >
                ← Volver al Inicio
            </button>
            <h1 class="text-3xl md:text-4xl font-bold mb-2">Widget Hub 🛠️</h1>
            <p class="text-slate-400 text-sm md:text-base">
                Herramientas profesionales para tu stream. 100% gratis y sincronizadas.
            </p>
        </div>

        <!-- Tabs -->
        <div class="flex gap-4 mb-8 border-b border-white/10 pb-1 overflow-x-auto">
            <button
                class="px-4 py-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap {activeTab ===
                'music'
                    ? 'border-primary-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'}"
                on:click={() => (activeTab = 'music')}
            >
                🎵 Widget Música
            </button>
            <button
                class="px-4 py-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap {activeTab ===
                'focus'
                    ? 'border-green-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'}"
                on:click={() => (activeTab = 'focus')}
            >
                🍅 Widget Foco
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Configuration Panel -->
            <div class="space-y-6">
                <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <h2 class="text-xl font-bold mb-4">⚙️ Personalización</h2>

                    {#if activeTab === 'music'}
                        <div class="mb-6">
                            <p class="text-sm text-slate-400 mb-4">
                                Configurado óptimamente para mostrar track y visualizador.
                            </p>
                        </div>

                        <!-- Opacity -->
                        <div class="mb-4">
                            <label for="opacity-slider" class="block text-sm font-medium mb-2"
                                >Opacidad: {(opacity * 100).toFixed(0)}%</label
                            >
                            <input
                                id="opacity-slider"
                                type="range"
                                min="0.3"
                                max="1"
                                step="0.1"
                                bind:value={opacity}
                                class="w-full accent-primary-500"
                            />
                        </div>

                        <!-- Show Logo -->
                        <div class="mb-4">
                            <label class="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    bind:checked={showLogo}
                                    class="w-5 h-5 accent-primary-500"
                                />
                                <span class="text-sm">Mostrar logo "ChillChess.app"</span>
                            </label>
                        </div>
                    {:else}
                        <!-- Focus Config -->
                        <div class="mb-6">
                            <p class="text-sm text-slate-400 mb-4">
                                Este widget muestra tu temporizador de foco en tiempo real. No
                                requiere configuración visual extra.
                            </p>
                            <p class="text-xs text-slate-500">
                                Tip: Para cambiar entre modo FOCUS y BREAK, usa los controles en la
                                app. El widget se actualizará solo.
                            </p>
                        </div>
                    {/if}
                </div>

                <!-- URL Output -->
                <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                    <h2 class="text-xl font-bold mb-4">📋 URL del Widget</h2>
                    <div class="bg-black/40 rounded-lg mb-4 overflow-hidden border border-white/10">
                        <input
                            type="text"
                            readonly
                            value={widgetUrl}
                            class="w-full bg-transparent p-4 text-xs text-green-400 font-mono outline-none cursor-text"
                            on:click={(e) => e.currentTarget.select()}
                        />
                    </div>
                    <button
                        on:click={copyToClipboard}
                        class="w-full py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-bold transition-colors"
                    >
                        📋 Copiar URL {activeTab === 'music' ? '(Música)' : '(Foco)'}
                    </button>

                    {#if $userStore.loading}
                        <p
                            class="text-xs text-slate-400 mt-2 text-center animate-pulse flex items-center justify-center gap-2"
                        >
                            <span>🔄</span> Verificando sesión...
                        </p>
                    {:else if !$userStore.user}
                        <div
                            class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center"
                        >
                            <p class="text-xs text-red-400 font-bold mb-1">
                                ⚠️ No detectamos tu sesión
                            </p>
                            <p class="text-xs text-slate-400 mb-2">
                                Para sincronizar, necesitas estar logueado.
                            </p>
                            <button
                                on:click={() => goto('/login')}
                                class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition-colors"
                            >
                                Iniciar Sesión →
                            </button>
                        </div>
                    {/if}
                </div>

                <!-- Instructions -->
                <div class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                    <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>Cómo usar en OBS</span>
                    </h3>
                    <ol class="text-sm space-y-2 text-slate-300">
                        <li>1. Copia la URL de arriba.</li>
                        <li>
                            2. En OBS: Añade una fuente → <strong>Browser Source</strong>
                        </li>
                        <li>3. Pega la URL en el campo "URL".</li>
                        {#if activeTab === 'music'}
                            <li>
                                4. Tamaño recomendado: <strong>450px ancho x 120px alto</strong>.
                            </li>
                        {:else}
                            <li>
                                4. Tamaño recomendado: <strong>260px ancho x 120px alto</strong>.
                            </li>
                        {/if}
                    </ol>
                </div>
            </div>

            <!-- Preview -->
            <div>
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl sticky top-8"
                >
                    <h2 class="text-xl font-bold mb-4">👁️ Vista Previa</h2>
                    <div
                        class="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-8 flex items-center justify-center min-h-[300px] relative overflow-hidden group"
                    >
                        <!-- Background generic for contrast -->
                        <div
                            class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070')] bg-cover bg-center opacity-20 blur-sm group-hover:opacity-30 transition-opacity"
                        ></div>

                        {#if $userStore.user}
                            <div class="relative z-10">
                                <iframe
                                    src={widgetUrl}
                                    class="border-0 rounded-xl shadow-2xl overflow-hidden"
                                    style="width: {activeTab === 'music'
                                        ? '460px'
                                        : '260px'}; height: {activeTab === 'music'
                                        ? '140px'
                                        : '120px'};"
                                    title="Widget Preview"
                                ></iframe>
                            </div>
                        {:else}
                            <div
                                class="relative z-10 text-center p-4 bg-black/60 rounded-xl backdrop-blur-md border border-white/10"
                            >
                                <p class="text-white font-bold">
                                    Inicia sesión para ver la preview real
                                </p>
                                <p class="text-xs text-slate-400 mt-2">
                                    Los widgets necesitan tu ID de usuario para saber qué mostrar.
                                </p>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
