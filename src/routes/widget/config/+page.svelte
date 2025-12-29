<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    let theme: "dark" | "light" = "dark";
    let size: "compact" | "medium" | "large" = "medium";
    let showLogo = true;
    let opacity = 0.9;

    $: widgetUrl = browser
        ? `${window.location.origin}/widget?theme=${theme}&size=${size}&showLogo=${showLogo}&opacity=${opacity}`
        : "";

    function copyToClipboard() {
        navigator.clipboard.writeText(widgetUrl);
        alert("✅ URL copiada al portapapeles!");
    }
</script>

<svelte:head>
    <title>Widget OBS - Configuración | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-[#0B1120] text-white font-poppins px-4 py-8 md:p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <button
                on:click={() => goto("/")}
                class="text-slate-400 hover:text-white mb-4 flex items-center gap-2 text-sm"
            >
                ← Volver al inicio
            </button>
            <h1 class="text-3xl md:text-4xl font-bold mb-2">
                Widget para OBS/Streamlabs
            </h1>
            <p class="text-slate-400 text-sm md:text-base">
                Muestra lo que estás escuchando en tu stream. 100% gratis.
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Configuration Panel -->
            <div class="space-y-6">
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <h2 class="text-xl font-bold mb-4">⚙️ Personalización</h2>

                    <!-- Theme -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2"
                            >Tema</label
                        >
                        <div class="flex gap-3">
                            <button
                                on:click={() => (theme = "dark")}
                                class="flex-1 py-2 px-4 rounded-lg {theme ===
                                'dark'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white/10 text-slate-300'} transition-colors"
                            >
                                🌙 Oscuro
                            </button>
                            <button
                                on:click={() => (theme = "light")}
                                class="flex-1 py-2 px-4 rounded-lg {theme ===
                                'light'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white/10 text-slate-300'} transition-colors"
                            >
                                ☀️ Claro
                            </button>
                        </div>
                    </div>

                    <!-- Size -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2"
                            >Tamaño</label
                        >
                        <div class="flex gap-3">
                            <button
                                on:click={() => (size = "compact")}
                                class="flex-1 py-2 px-4 rounded-lg text-sm {size ===
                                'compact'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white/10 text-slate-300'} transition-colors"
                            >
                                Compacto
                            </button>
                            <button
                                on:click={() => (size = "medium")}
                                class="flex-1 py-2 px-4 rounded-lg text-sm {size ===
                                'medium'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white/10 text-slate-300'} transition-colors"
                            >
                                Mediano
                            </button>
                            <button
                                on:click={() => (size = "large")}
                                class="flex-1 py-2 px-4 rounded-lg text-sm {size ===
                                'large'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white/10 text-slate-300'} transition-colors"
                            >
                                Grande
                            </button>
                        </div>
                    </div>

                    <!-- Opacity -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2"
                            >Opacidad: {(opacity * 100).toFixed(0)}%</label
                        >
                        <input
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
                        <label
                            class="flex items-center gap-3 cursor-pointer select-none"
                        >
                            <input
                                type="checkbox"
                                bind:checked={showLogo}
                                class="w-5 h-5 accent-primary-500"
                            />
                            <span class="text-sm"
                                >Mostrar logo "ChillChess.app"</span
                            >
                        </label>
                        <p class="text-xs text-slate-400 mt-1 ml-8">
                            Nos ayuda a crecer 💙
                        </p>
                    </div>
                </div>

                <!-- URL Output -->
                <div
                    class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
                >
                    <h2 class="text-xl font-bold mb-4">📋 URL del Widget</h2>
                    <div
                        class="bg-black/40 p-4 rounded-lg mb-4 overflow-x-auto"
                    >
                        <code class="text-xs text-green-400 break-all"
                            >{widgetUrl}</code
                        >
                    </div>
                    <button
                        on:click={copyToClipboard}
                        class="w-full py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-bold transition-colors"
                    >
                        📋 Copiar URL
                    </button>
                </div>

                <!-- Instructions -->
                <div
                    class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6"
                >
                    <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>Cómo usar en OBS</span>
                    </h3>
                    <ol class="text-sm space-y-2 text-slate-300">
                        <li>1. Copia la URL de arriba.</li>
                        <li>
                            2. En OBS: Añade una fuente → <strong
                                >Browser Source</strong
                            >
                        </li>
                        <li>3. Pega la URL en el campo "URL".</li>
                        <li>
                            4. Ajusta el tamaño (ancho: 400-500px, alto: 120px).
                        </li>
                        <li>5. ¡Listo! Se actualizará automáticamente.</li>
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
                        class="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-8 flex items-center justify-center min-h-[300px]"
                    >
                        <iframe
                            src={widgetUrl}
                            class="w-full h-[120px] border-0 rounded-xl"
                            title="Widget Preview"
                        ></iframe>
                    </div>
                    <p class="text-xs text-slate-400 mt-4 text-center">
                        El widget se actualizará cuando cambies de canción en
                        ChillChess.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
