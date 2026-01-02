<script lang="ts">
    interface RoadmapItem {
        title: string;
        description: string;
        status: 'done' | 'in-progress' | 'planned';
        date: string;
        category: 'music' | 'visual' | 'tech' | 'community';
    }

    const roadmapItems: RoadmapItem[] = [
        // --- COMPLETADO (Enero 2026) ---
        {
            title: 'Modo Enfoque Minimalista',
            description:
                'Rediseño total de la experiencia de concentración con temporizador "Orange Vibe", controles intuitivos y eliminación de distracciones.',
            status: 'done',
            date: 'Enero 2026',
            category: 'visual',
        },
        {
            title: 'Infraestructura de Álbumes Dinámicos',
            description:
                'Sistema híbrido de carga de música que combina caché local y Firestore para una reproducción instantánea de nuevos lanzamientos.',
            status: 'done',
            date: 'Enero 2026',
            category: 'tech',
        },
        {
            title: 'Seguridad & Recuperación',
            description:
                'Implementación completa del flujo de "Olvidé mi contraseña" y validación robusta de reportes de errores.',
            status: 'done',
            date: 'Enero 2026',
            category: 'tech',
        },

        // --- COMPLETADO (Diciembre 2025) ---
        {
            title: 'Integración de Fundadores',
            description:
                'Sistema inteligente para asignar lanzamientos musicales a perfiles Fundadores y Verificados.',
            status: 'done',
            date: 'Diciembre 2025',
            category: 'community',
        },
        {
            title: 'Colección Premium',
            description:
                "Rediseño total de la galería musical con 'Hero Mode', filtrado instantáneo y tarjetas inmersivas.",
            status: 'done',
            date: 'Diciembre 2025',
            category: 'visual',
        },
        {
            title: 'Vibe Studio 2.1',
            description:
                'Personalización total del entorno: Relojes (Neon, Retro, Analógico) y Fondos Dinámicos reactivos.',
            status: 'done',
            date: 'Diciembre 2025',
            category: 'visual',
        },
        {
            title: 'Hub de Artistas Automatizado',
            description:
                'Nuevo flujo de envío de música con carga masiva (drag & drop) y verificación automática.',
            status: 'done',
            date: 'Diciembre 2025',
            category: 'tech',
        },
        {
            title: 'Sistema de Favoritos',
            description:
                "Guarda tus canciones preferidas y accede a ellas fácilmente desde 'Mis Favoritos'.",
            status: 'done',
            date: 'Diciembre 2025',
            category: 'music',
        },
        {
            title: 'Widget para Streaming',
            description:
                'Widget personalizable con gradientes animados, barra de progreso y equalizer para OBS.',
            status: 'done',
            date: 'Diciembre 2025',
            category: 'tech',
        },
        {
            title: 'Sonidos Ambientales',
            description:
                'Capa adicional de audio con sonidos de lluvia, fuego, café y bosque mezclables.',
            status: 'done',
            date: 'Diciembre 2025',
            category: 'music',
        },
        {
            title: 'Salas Compartidas',
            description:
                'Salas públicas o privadas para escuchar música sincronizada en tiempo real con amigos.',
            status: 'done',
            date: 'Diciembre 2025',
            category: 'community',
        },
        {
            title: 'Admin Panel & Foundation',
            description:
                'Reconstrucción total de la administración con Glassmorphism y arquitectura escalable.',
            status: 'done',
            date: 'Diciembre 2025',
            category: 'tech',
        },

        // --- EN PROGRESO ---
        {
            title: 'Expansión Musical',
            description: 'Incorporación de nuevos álbumes de lo-fi, jazz y ambient exclusivos.',
            status: 'in-progress',
            date: 'Q1 2026',
            category: 'music',
        },
        {
            title: 'Mejoras del Reproductor',
            description: 'Añadir modo repetición inteligente, crossfade y controles de velocidad.',
            status: 'in-progress',
            date: 'Q1 2026',
            category: 'tech',
        },

        // --- PLANIFICADO ---
        {
            title: 'Playlists Personalizadas',
            description:
                'Crea y comparte tus propias listas de reproducción combinando diferentes álbumes.',
            status: 'planned',
            date: 'Febrero 2026',
            category: 'music',
        },
        {
            title: 'Perfil de Usuario Pro',
            description: 'Estadísticas detalladas de escucha, historial y medallas por logros.',
            status: 'planned',
            date: 'Marzo 2026',
            category: 'tech',
        },
        {
            title: 'Modo Offline (App Nativa)',
            description:
                'Desarrollo de aplicación móvil nativa (iOS/Android) con descargas offline.',
            status: 'planned',
            date: 'Mediados 2026',
            category: 'tech',
        },

        // --- EL OBJETIVO FINAL ---
        {
            title: 'Lanzamiento v1.0 (Gold)',
            description:
                'El hito final. Estabilidad total, cero bugs críticos y una experiencia 100% pulida. El ChillChess definitivo.',
            status: 'planned',
            date: 'Finales 2026',
            category: 'community',
        },
    ];

    function getStatusColor(status: RoadmapItem['status']) {
        if (status === 'done') return 'bg-green-500/20 text-green-300 border-green-500/30';
        if (status === 'in-progress')
            return 'bg-primary-500/20 text-primary-300 border-primary-500/30';
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }

    function getStatusLabel(status: RoadmapItem['status']) {
        if (status === 'done') return '✓ Completado';
        if (status === 'in-progress') return '🔄 En Desarrollo';
        return '📦 Próximamente';
    }

    import MusicIcon from '$lib/components/icons/MusicIcon.svelte';
    import ArtIcon from '$lib/components/icons/ArtIcon.svelte';
    import BoltIcon from '$lib/components/icons/BoltIcon.svelte';
    import UsersIcon from '$lib/components/icons/UsersIcon.svelte';
    import BulbIcon from '$lib/components/icons/BulbIcon.svelte';
</script>

<svelte:head>
    <title>Roadmap 2025-2026 | ChillChess</title>
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
            <h1 class="text-4xl md:text-5xl font-bold text-slate-100 mb-4 mt-4">
                Hoja de Ruta 2025-2026
            </h1>
            <p class="text-lg text-slate-400 max-w-2xl mx-auto">
                Lo que hemos construido y hacia dónde vamos. Sin promesas vacías, solo progreso
                real.
            </p>
        </div>

        <!-- Timeline -->
        <div class="relative">
            <!-- Vertical Line -->
            <div
                class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-400 via-primary-600 to-transparent"
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
                                  ? 'bg-primary-500'
                                  : 'bg-slate-500'}
                                    group-hover:scale-125 transition-transform"
                        ></div>

                        <!-- Card -->
                        <div
                            class="bg-[#141b2d]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/5
                                    hover:border-white/10 transition-all hover:shadow-xl hover:shadow-blue-900/10
                                    hover:-translate-y-1"
                        >
                            <div class="flex flex-wrap items-start justify-between gap-4 mb-3">
                                <div class="flex items-center gap-3">
                                    {#if item.category === 'music'}
                                        <MusicIcon size="lg" gradient={true} />
                                    {:else if item.category === 'visual'}
                                        <ArtIcon size="lg" gradient={true} />
                                    {:else if item.category === 'tech'}
                                        <BoltIcon size="lg" gradient={true} />
                                    {:else}
                                        <UsersIcon size="lg" gradient={true} />
                                    {/if}
                                    <h3 class="text-xl font-bold text-slate-100">
                                        {item.title}
                                    </h3>
                                </div>
                                <span
                                    class="px-3 py-1 rounded-full text-xs font-bold border {getStatusColor(
                                        item.status
                                    )}"
                                >
                                    {getStatusLabel(item.status)}
                                </span>
                            </div>

                            <p class="text-slate-400 mb-4 leading-relaxed">
                                {item.description}
                            </p>

                            <div class="flex items-center gap-2 text-xs text-slate-500">
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
        <div class="mt-16 p-6 bg-primary-500/10 border border-primary-500/20 rounded-2xl">
            <div class="flex items-start gap-4">
                <div class="mt-1">
                    <BulbIcon size="lg" gradient={true} />
                </div>
                <div>
                    <h4 class="font-bold text-white mb-2">¿Tienes ideas?</h4>
                    <p class="text-sm text-slate-300 leading-relaxed">
                        Los usuarios <span class="text-blue-400 font-semibold"
                            >Pro pueden proponer nuevas features</span
                        >
                        y votar las de otros miembros en nuestro
                        <a
                            href="https://discord.gg/G7SrFtJHnr"
                            target="_blank"
                            class="text-blue-400 hover:text-blue-300 underline">Discord</a
                        >.
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
