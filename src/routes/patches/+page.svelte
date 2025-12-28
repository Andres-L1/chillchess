<script lang="ts">
    interface Patch {
        version: string;
        date: string;
        title: string;
        changes: string[];
        type: "major" | "minor" | "hotfix";
    }

    const patches: Patch[] = [
        {
            version: "v2.0 (Beta)",
            date: "28 Dic 2025",
            title: "El Renacimiento: Focus & Vibes",
            type: "major",
            changes: [
                "✨ Nueva Identidad: Rediseño completo enfocado en la calma y la música.",
                "🎨 Vibe Studio: Nuevo panel para personalizar fondos y atmósferas (Exclusivo PRO).",
                "💸 Precios Simplificados: Nuevo plan anual único de 19.99€.",
                "🧹 Limpieza: Eliminadas funciones complejas de ajedrez para maximizar el rendimiento.",
                "📱 UI Móvil: Navegación y reproductor optimizados para pantallas pequeñas.",
            ],
        },
        {
            version: "v1.5",
            date: "20 Dic 2025",
            title: "Optimización del Núcleo",
            type: "minor",
            changes: [
                "🚀 Carga más rápida de la biblioteca musical.",
                "🐛 Corregidos errores en el reproductor de audio.",
                "🔒 Mejoras en el sistema de autenticación.",
            ],
        },
    ];

    function getTypeColor(type: Patch["type"]) {
        if (type === "major")
            return "bg-primary-500 text-white shadow-lg shadow-primary-500/30 border-primary-400";
        if (type === "minor")
            return "bg-blue-500/20 text-blue-300 border-blue-500/30";
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
</script>

<svelte:head>
    <title>Notas del Parche | ChillChess</title>
</svelte:head>

<div
    class="min-h-screen bg-midnight-900 text-white font-poppins pt-32 pb-20 px-4"
>
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-16">
        <div class="flex items-center gap-4 mb-4">
            <a
                href="/"
                class="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
                ←
            </a>
            <h1 class="text-3xl md:text-5xl font-bold tracking-tight">
                Notas del <span class="text-primary-500">Parche</span>
            </h1>
        </div>
        <p class="text-slate-400 text-lg max-w-2xl ml-12">
            Descubre las últimas mejoras y evoluciones de la plataforma.
        </p>
    </div>

    <!-- Timeline -->
    <div class="max-w-3xl mx-auto space-y-12 relative">
        <!-- Vertical Line -->
        <div
            class="absolute left-4 md:left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500/50 via-white/10 to-transparent"
        ></div>

        {#each patches as patch}
            <div class="relative pl-12 md:pl-16 group">
                <!-- Dot -->
                <div
                    class="absolute left-[11px] md:-left-[5px] top-6 w-3 h-3 rounded-full bg-midnight-900 border-2 border-primary-500 z-10 group-hover:scale-125 transition-transform"
                ></div>

                <div
                    class="bg-midnight-800/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 hover:border-white/10 hover:bg-midnight-800 transition-all"
                >
                    <div
                        class="flex flex-wrap items-center justify-between gap-4 mb-6"
                    >
                        <div class="flex items-center gap-3">
                            <span
                                class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border {getTypeColor(
                                    patch.type,
                                )}"
                            >
                                {patch.version}
                            </span>
                            <span class="text-slate-500 text-sm"
                                >{patch.date}</span
                            >
                        </div>
                    </div>

                    <h2
                        class="text-2xl font-bold text-white mb-4 group-hover:text-primary-400 transition-colors"
                    >
                        {patch.title}
                    </h2>

                    <ul class="space-y-3">
                        {#each patch.changes as change}
                            <li
                                class="flex items-start gap-3 text-slate-300 leading-relaxed"
                            >
                                <span class="text-primary-500 mt-1">•</span>
                                <span>{change}</span>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        {/each}
    </div>
</div>
