<script lang="ts">
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { userStore } from '$lib/auth/userStore';
    import { toast } from '$lib/stores/notificationStore';

    let activeTab: 'music' | 'streak' | 'room' = 'music';

    // Music Config
    let showLogo = true;
    let showArt = true;
    let opacity = 0.9;

    // Streak Config
    let streakLabel = 'Días en Directo';
    // let streakUpdateInterval = 5;

    // Room Config
    let inputRoomId = '';
    let showRoomCode = true;

    $: baseUrl = browser ? window.location.origin : '';
    $: uidParam = $userStore.user?.uid ? `&uid=${$userStore.user.uid}` : '';

    $: widgetUrl = (() => {
        if (activeTab === 'music') {
            return `${baseUrl}/widget?theme=dark&size=large&showLogo=${showLogo}&showArt=${showArt}&opacity=${opacity}${uidParam}`;
        } else if (activeTab === 'room') {
            return `${baseUrl}/widget/room?id=${inputRoomId}&code=${showRoomCode}&theme=dark`;
        } else {
            return `${baseUrl}/widget/streak?label=${encodeURIComponent(streakLabel)}${uidParam}`;
        }
    })();

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
                'room'
                    ? 'border-primary-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'}"
                on:click={() => (activeTab = 'room')}
            >
                👥 Widget Sala
            </button>
            <button
                class="px-4 py-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap {activeTab ===
                'streak'
                    ? 'border-orange-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'}"
                on:click={() => (activeTab = 'streak')}
            >
                🔥 Widget Días Stream
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
                        <div class="space-y-3">
                            <label class="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    bind:checked={showLogo}
                                    class="w-5 h-5 accent-primary-500"
                                />
                                <span class="text-sm">Mostrar logo "ChillChess.app"</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    bind:checked={showArt}
                                    class="w-5 h-5 accent-primary-500"
                                />
                                <span class="text-sm">Mostrar Portada del Álbum</span>
                            </label>
                        </div>
                    {:else if activeTab === 'room'}
                        <div class="mb-6">
                            <p class="text-sm text-slate-400 mb-4">
                                Muestra qué se escucha en tu Sala y los participantes.
                            </p>
                            <div class="space-y-4">
                                <div>
                                    <label
                                        for="room-id"
                                        class="block text-xs uppercase text-slate-500 mb-1 font-bold"
                                        >ID de la Sala</label
                                    >
                                    <input
                                        id="room-id"
                                        type="text"
                                        bind:value={inputRoomId}
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary-500 outline-none transition-colors placeholder:text-slate-600"
                                        placeholder="Pega aquí el ID de tu sala..."
                                    />
                                    <p class="text-[10px] text-slate-500 mt-1">
                                        Lo encontrarás en la URL de tu sala: /rooms/[ID]
                                    </p>
                                </div>
                                <label class="flex items-center gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        bind:checked={showRoomCode}
                                        class="w-5 h-5 accent-primary-500"
                                    />
                                    <span class="text-sm">Mostrar Nombre de Sala</span>
                                </label>
                            </div>
                        </div>
                    {:else}
                        <!-- Streak Config -->
                        <div class="mb-6">
                            <p class="text-sm text-slate-400 mb-4">
                                Muestra cuántos días has hecho directo (actividad en app).
                            </p>
                            <div class="space-y-4">
                                <div>
                                    <label
                                        for="streak-label"
                                        class="block text-xs uppercase text-slate-500 mb-1 font-bold"
                                        >Texto de etiqueta</label
                                    >
                                    <input
                                        id="streak-label"
                                        type="text"
                                        bind:value={streakLabel}
                                        class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500 outline-none transition-colors placeholder:text-slate-600"
                                        placeholder="Ej: Días Online"
                                    />
                                </div>
                            </div>
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
                            aria-label="URL del Widget generado"
                        />
                    </div>
                    <button
                        on:click={copyToClipboard}
                        class="w-full py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-bold transition-colors"
                    >
                        📋 Copiar URL {activeTab === 'music'
                            ? '(Música)'
                            : activeTab === 'room'
                              ? '(Sala)'
                              : '(Racha)'}
                    </button>

                    {#if $userStore.loading}
                        <p
                            class="text-xs text-slate-400 mt-2 text-center animate-pulse flex items-center justify-center gap-2"
                        >
                            <span>🔄</span> Verificando sesión...
                        </p>
                    {:else if !$userStore.user && activeTab !== 'room'}
                        <div
                            class="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center"
                        >
                            <p class="text-xs text-red-400 font-bold mb-1">
                                ⚠️ No detectamos tu sesión
                            </p>
                            <p class="text-xs text-slate-400 mb-2">
                                Para sincronizar, necesitas estar logueado (Excepto widget sala).
                            </p>
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
                        <li>2. En OBS: Añade una fuente → <strong>Browser Source</strong></li>
                        <li>3. Pega la URL en el campo "URL".</li>
                        {#if activeTab === 'music' || activeTab === 'room'}
                            <li>
                                4. Tamaño recomendado: <strong>450px ancho x 120px alto</strong>.
                            </li>
                        {:else}
                            <li>
                                4. Tamaño recomendado: <strong>300px ancho x 100px alto</strong>.
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

                        {#if $userStore.user || activeTab === 'room'}
                            <div class="relative z-10 pl-6">
                                <iframe
                                    src={widgetUrl}
                                    class="border-0 rounded-xl shadow-2xl overflow-hidden"
                                    style="width: {activeTab === 'music' || activeTab === 'room'
                                        ? '460px'
                                        : '300px'}; height: {activeTab === 'music' ||
                                    activeTab === 'room'
                                        ? '140px'
                                        : '100px'};"
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
                                    Los widgets necesitan tu ID de usuario.
                                </p>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
