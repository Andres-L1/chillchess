<script lang="ts">
    interface Patch {
        version: string;
        date: string;
        title: string;
        changes: string[];
        type: 'major' | 'minor' | 'hotfix';
    }

    const patches: Patch[] = [
        {
            version: 'v0.9.6',
            date: '06 Ene 2026',
            title: 'Web Maintenance Update',
            type: 'minor',
            changes: [
                '🛠️ Mejoras de Estabilidad: Correcciones generales en la plataforma web para una experiencia más fluida.',
                '🔧 Optimización de Sistema: Ajustes internos de mantenimiento y limpieza de datos.',
            ],
        },
        {
            version: 'v0.9.5',
            date: '04 Ene 2026',
            title: 'The Productivity Update',
            type: 'major',
            changes: [
                '📊 Tracker de Hábitos (Beta): Nueva herramienta integrada para seguir tus rutinas. (Free: 2 hábitos, Pro: Ilimitados).',
                '⏱️ Playlist Duration: Visualiza el tiempo total de las discografías en los perfiles de artista.',
                '🎨 Categorías Personalizadas: Los artistas ahora pueden definir sus propios géneros musicales al subir álbumes.',
                '🐛 Corrección Error 500: Solucionado el problema de carga (SSR) en perfiles de artista.',
                '📱 Mobile Menu: Acceso directo al Tracker habilitado para dispositivos móviles.',
            ],
        },
        {
            version: 'v0.6',
            date: '03 Ene 2026',
            title: 'The Artist Profile Update',
            type: 'major',
            changes: [
                '🎨 Perfiles Públicos de Artista: Rediseño completo con estética premium y banners inmersivos.',
                '🔄 Integración R2: Sistema híbrido de carga (Cloudflare R2 + Firebase) para optimizar costes y rendimiento.',
                '📱 Reproductor Móvil: Ajustes "Safe Area" para evitar cortes en iPhone y visualización mejorada.',
                '🔗 Rutas Inteligentes: Priorización automática de perfiles verificados y slugs personalizados.',
                '🎵 Tracks Toggle: Opción para expandir/contraer la lista completa de canciones en el perfil.',
                '✨ Correcciones Visuales: Botones con gradientes "Glow" y mejor consistencia UI.',
            ],
        },
        {
            version: 'v0.9',
            date: '02 Ene 2026',
            title: 'The Focus Update',
            type: 'major',
            changes: [
                '🧘 Modo Enfoque 2.0: Rediseño minimalista del temporizador con tema naranja y controles limpios.',
                '💿 Álbumes Dinámicos: Solucionado el problema de carga de álbumes nuevos desde la base de datos.',
                '🔐 Recuperación de Cuenta: Añadida opción de "Olvidé mi contraseña" en el login.',
                '⏱️ Duración de Playlist: Ahora se muestra el tiempo total de las canciones en el perfil del artista.',
                '📱 Mejoras Móviles: Ajustes en el reproductor inferior para evitar cortes en pantallas pequeñas.',
                '🐛 Correcciones: Validación de reportes de bugs y selección aleatoria real (Shuffle) arreglada.',
            ],
        },
        {
            version: 'v0.8',
            date: '31 Dic 2025',
            title: 'The Foundation Update',
            type: 'major',
            changes: [
                '🛠️ Arquitectura Core: Reescritura completa de los cimientos técnicos para estabilidad a largo plazo.',
                '👑 Admin Panel 2.5: Glassmorphism real, menú responsivo y soporte total para gestión móvil.',
                '⚡ Rendimiento: Optimización masiva en la carga de estadísticas y navegación.',
                '🐛 Bug Fixes: Selectores mejorados, accesibilidad por teclado y eliminación de scroll horizontal.',
                '🛡️ Tooling Pro: Integración de Sentry, Logger avanzado y validación de tipos.',
            ],
        },
        {
            version: 'v0.7',
            date: '30 Dic 2025',
            title: 'The Founder Update',
            type: 'major',
            changes: [
                '💎 Soporte para Fundadores: Reconocimiento especial para perfiles Fundadores y Verificados en la asignación de música.',
                '📱 Creator Studio Móvil: Nueva experiencia de subida de música simplificada con modal flotante optimizado para smarphones.',
                '🔊 Reproductor Clásico: Restaurado el control de volumen vertical y la estética naranja icónica de la marca.',
                '🧹 Admin R2 Tools: Nuevas herramientas de mantenimiento para limpiar archivos temporales y optimizar el almacenamiento.',
                '🐛 Correcciones en selectores de artistas y lógica de verificación.',
            ],
        },
        {
            version: 'v0.6',
            date: '30 Dic 2025',
            title: 'Community & Streaming Features',
            type: 'major',
            changes: [
                '📺 Widget para OBS: Widget personalizable con animaciones premium, barra de progreso y logo dinámico. Perfecto para streams.',
                '🎧 Sonidos Ambientales: Nueva capa de audio con lluvia, fuego, café, océano y bosque que se mezcla con tu música.',
                '🎵 Salas de Escucha Compartida: Crea salas para escuchar música sincronizada en tiempo real con amigos.',
                '🎨 Selector de Música Inline: Los hosts pueden seleccionar álbumes directamente desde la sala.',
                '🔐 Firestore Rules: Seguridad completa para las salas compartidas.',
                '🎯 Widget OBS ahora en el menú de usuario para facilitar acceso.',
            ],
        },
        {
            version: 'v0.5',
            date: '29 Dic 2025',
            title: 'Admin & Mobile Excellence',
            type: 'major',
            changes: [
                '👑 Admin Panel 2.0: Reconstrucción total del sistema de administración.',
                '📱 Gestión Móvil Total: Los administradores ahora pueden gestionar usuarios y música desde cualquier lugar.',
                '🎵 Librería Musical Dinámica: Control total sobre los álbumes (ver, escuchar preview, eliminar).',
                '⚡ Verificación Sync: Sincronización automática de badges entre perfil de usuario y de artista.',
                '🐞 Mobile Fixes: Mejoras críticas en las tablas de administración y UX móvil.',
            ],
        },
        {
            version: 'v0.4',
            date: '29 Dic 2025',
            title: 'The Premium Vibe Update',
            type: 'major',
            changes: [
                '✨ Vibe Studio 2.1: Personaliza tu espacio con nuevos Relojes (Neon, Retro, Analógico) y Fondos Dinámicos.',
                "🎶 Colección Premium: Rediseño visual completo con 'Hero Mode', buscador instantáneo y tarjetas inmersivas.",
                '📀 Artist Hub: Nuevo sistema de carga de música masiva (Drag & Drop) para artistas.',
                '✅ Verificación Instantánea: Los artistas reciben su badge automáticamente al aprobarse su música.',
                '🏅 Nueva Insignia Dorada: Rediseño de lujo para perfiles verificados.',
                '🔧 Backend Cleanup: Sistema automático de limpieza de archivos basura.',
            ],
        },

        {
            version: 'v0.3',
            date: '28 Dic 2025',
            title: 'Sistema de Favoritos',
            type: 'minor',
            changes: [
                '❤️ Añadido sistema de favoritos: guarda tus canciones preferidas.',
                "🎵 Nueva página 'Mis Favoritos' para reproducir tu música amada.",
                '💖 Botón de corazón en el reproductor (desktop y móvil).',
                '📱 Mejoras de responsividad en navegación móvil.',
                '🔧 Optimización del reproductor en pantallas pequeñas.',
            ],
        },
        {
            version: 'v0.2',
            date: '24 Dic 2025',
            title: 'Navegación Mejorada',
            type: 'minor',
            changes: [
                '🧭 Reorganización del menú principal (más limpio y directo).',
                '👤 Nuevo dropdown de usuario con acceso rápido al perfil.',
                '📜 Añadida página de Roadmap para transparencia.',
                '🎨 Mejoras visuales en la página de Colección.',
            ],
        },
        {
            version: 'v0.1',
            date: '21 Dic 2025',
            title: 'Lanzamiento Beta',
            type: 'major',
            changes: [
                '🎵 Reproductor de audio funcional con música lo-fi y ambient.',
                '🔐 Sistema de autenticación Firebase (email/contraseña).',
                '💳 Página de planes (Free/Pro).',
                '🎨 Fondos dinámicos básicos.',
                '📱 Diseño responsive para móvil y desktop.',
                '💡 Sistema de propuestas para usuarios Pro (votar y proponer features).',
            ],
        },
    ];

    function getTypeColor(type: Patch['type']) {
        if (type === 'major')
            return 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 border-primary-400';
        if (type === 'minor') return 'bg-primary-500/20 text-primary-300 border-primary-500/30';
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
</script>

<svelte:head>
    <title>Notas del Parche | ChillChess</title>
</svelte:head>

<div class="min-h-screen bg-midnight-900 text-white font-poppins pt-32 pb-20 px-4">
    <!-- Header -->
    <div class="max-w-4xl mx-auto mb-16">
        <div class="flex items-center gap-4 mb-4">
            <a href="/" class="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
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
                    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div class="flex items-center gap-3">
                            <span
                                class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border {getTypeColor(
                                    patch.type
                                )}"
                            >
                                {patch.version}
                            </span>
                            <span class="text-slate-500 text-sm">{patch.date}</span>
                        </div>
                    </div>

                    <h2
                        class="text-2xl font-bold text-slate-100 mb-4 group-hover:text-primary-400 transition-colors"
                    >
                        {patch.title}
                    </h2>

                    <ul class="space-y-3">
                        {#each patch.changes as change}
                            <li class="flex items-start gap-3 text-slate-300 leading-relaxed">
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
