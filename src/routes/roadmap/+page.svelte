<script lang="ts">
    interface RoadmapItem {
        title: string;
        description: string;
        status: "done" | "in-progress" | "planned";
        date: string;
        category: "music" | "visual" | "tech" | "community";
    }

    const roadmapItems: RoadmapItem[] = [
        // Q1 2026
        {
            title: "Sistema de Tableros Personalizables",
            description:
                "Elige entre tableros de madera clásica, mármol, neón, cristal y más.",
            status: "in-progress",
            date: "Enero 2026",
            category: "visual",
        },
        {
            title: "Fondos Animados Premium",
            description:
                "Efectos de lluvia, nieve, partículas y nebulosas animadas de fondo.",
            status: "in-progress",
            date: "Enero 2026",
            category: "visual",
        },
        {
            title: "Audio HD (320kbps)",
            description: "Calidad de audio profesional para suscriptores Pro.",
            status: "planned",
            date: "Febrero 2026",
            category: "tech",
        },
        {
            title: "5 Nuevos Álbumes",
            description:
                "Expansión de la colección: Lo-Fi, Synthwave, Jazz, Ambiente Natural.",
            status: "planned",
            date: "Febrero-Marzo 2026",
            category: "music",
        },

        // Q2 2026
        {
            title: "Editor de Temas Visuales",
            description: "Crea tus propias combinaciones de colores y fondos.",
            status: "planned",
            date: "Abril 2026",
            category: "visual",
        },
        {
            title: "Progressive Web App (PWA)",
            description:
                "Instala ChillChess como app en tu escritorio o móvil.",
            status: "planned",
            date: "Mayo 2026",
            category: "tech",
        },
        {
            title: "Descargas Offline",
            description: "Descarga álbumes para escuchar sin conexión (Pro).",
            status: "planned",
            date: "Junio 2026",
            category: "tech",
        },

        // Q3-Q4 2026
        {
            title: "Radio 24/7 Chillhop",
            description: "Stream continuo de música chill seleccionada.",
            status: "planned",
            date: "Julio 2026",
            category: "music",
        },
        {
            title: "Ecualizador Personalizado",
            description: "Ajusta graves, medios y agudos a tu gusto.",
            status: "planned",
            date: "Agosto 2026",
            category: "tech",
        },
        {
            title: "Comunidad & Discord Integrado",
            description:
                "Comparte tus ambientes favoritos y conecta con otros usuarios.",
            status: "planned",
            date: "Septiembre 2026",
            category: "community",
        },
        {
            title: "Álbum Colaborativo Indie",
            description:
                "Colaboración con artistas independientes para un álbum exclusivo.",
            status: "planned",
            date: "Noviembre 2026",
            category: "music",
        },
        {
            title: "Estadísticas de Escucha",
            description:
                "Descubre tus álbumes más reproducidos y horas de concentración.",
            status: "planned",
            date: "Diciembre 2026",
            category: "tech",
        },
    ];

    function getStatusColor(status: RoadmapItem["status"]) {
        if (status === "done")
            return "bg-green-500/20 text-green-300 border-green-500/30";
        if (status === "in-progress")
            return "bg-blue-500/20 text-blue-300 border-blue-500/30";
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }

    function getStatusLabel(status: RoadmapItem["status"]) {
        if (status === "done") return "✓ Completado";
        if (status === "in-progress") return "🔄 En Desarrollo";
        return "📦 Próximamente";
    }

    function getCategoryIcon(category: RoadmapItem["category"]) {
        if (category === "music") return "🎵";
        if (category === "visual") return "🎨";
        if (category === "tech") return "⚡";
        return "👥";
    }
</script>

<svelte:head>
    <title>Roadmap 2026 | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-[#0B1120] text-slate-200 font-poppins py-12 px-4">
    <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
            <a
                href="/"
                class="text-blue-400 hover:text-blue-300 text-sm mb-8 inline-block transition-colors"
            >
                ← Volver al inicio
            </a>
            <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 mt-4">
                Hoja de Ruta 2026
            </h1>
            <p class="text-lg text-slate-400 max-w-2xl mx-auto">
                Transparencia total. Estas son las funciones que estamos
                construyendo para hacer de ChillChess la mejor plataforma de
                concentración musical.
            </p>
        </div>

        <!-- Timeline -->
        <div class="relative">
            <!-- Vertical Line -->
            <div
                class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent"
            ></div>

            <div class="space-y-12">
                {#each roadmapItems as item}
                    <div class="relative pl-20 group">
                        <!-- Timeline Dot -->
                        <div
                            class="absolute left-6 top-2 w-5 h-5 rounded-full border-4 border-[#0B1120]
                                    {item.status === 'done'
                                ? 'bg-green-500'
                                : item.status === 'in-progress'
                                  ? 'bg-blue-500'
                                  : 'bg-slate-500'}
                                    group-hover:scale-125 transition-transform"
                        ></div>

                        <!-- Card -->
                        <div
                            class="bg-[#141b2d]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5
                                    hover:border-white/10 transition-all hover:shadow-xl hover:shadow-blue-900/10
                                    hover:-translate-y-1"
                        >
                            <div
                                class="flex flex-wrap items-start justify-between gap-4 mb-3"
                            >
                                <div class="flex items-center gap-3">
                                    <span class="text-2xl"
                                        >{getCategoryIcon(item.category)}</span
                                    >
                                    <h3 class="text-xl font-bold text-white">
                                        {item.title}
                                    </h3>
                                </div>
                                <span
                                    class="px-3 py-1 rounded-full text-xs font-bold border {getStatusColor(
                                        item.status,
                                    )}"
                                >
                                    {getStatusLabel(item.status)}
                                </span>
                            </div>

                            <p class="text-slate-400 mb-4 leading-relaxed">
                                {item.description}
                            </p>

                            <div
                                class="flex items-center gap-2 text-xs text-slate-500"
                            >
                                <svg
                                    class="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span class="font-medium">{item.date}</span>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Footer Note -->
        <div
            class="mt-16 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
        >
            <div class="flex items-start gap-4">
                <span class="text-2xl">💡</span>
                <div>
                    <h4 class="font-bold text-white mb-2">¿Tienes ideas?</h4>
                    <p class="text-sm text-slate-300 leading-relaxed">
                        Esta roadmap es flexible. Si tienes sugerencias de
                        funciones o álbumes que te gustaría ver, los usuarios <span
                            class="text-blue-400 font-semibold"
                            >Pro pueden votar</span
                        > en nuestro Discord.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
