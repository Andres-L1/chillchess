<script lang="ts">
    import { CookieIcon, ShieldCheck, ArrowLeft } from 'lucide-svelte';
    import { goto } from '$app/navigation';
</script>

<svelte:head>
    <title>Política de Cookies | ChillChess</title>
    <meta
        name="description"
        content="Política de Cookies de ChillChess. Conoce cómo utilizamos cookies y tecnologías similares para garantizar el correcto funcionamiento de la plataforma."
    />
</svelte:head>

<div
    class="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-brand-500/30 selection:text-brand-200 pb-20"
>
    <!-- Navbar Minimalista -->
    <nav
        class="fixed top-0 inset-x-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 shadow-lg"
    >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <button
                    on:click={() => goto('/landing')}
                    class="flex items-center gap-2 text-slate-400 hover:text-brand-400 transition-colors font-medium group"
                >
                    <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Volver al inicio
                </button>
                <div class="flex items-center gap-2">
                    <div
                        class="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20"
                    >
                        <CookieIcon class="w-5 h-5 text-white" />
                    </div>
                    <span class="font-bold text-xl tracking-tight text-white">ChillChess</span>
                </div>
            </div>
        </div>
    </nav>

    <!-- Header Section -->
    <header class="pt-32 pb-16 px-4 relative overflow-hidden">
        <div class="absolute inset-0 bg-brand-900/20 -z-10"></div>
        <div class="max-w-3xl mx-auto text-center relative z-10">
            <div
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-6 shadow-sm"
            >
                <ShieldCheck class="w-4 h-4" />
                Transparencia total
            </div>
            <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                Política de Cookies
            </h1>
            <p class="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                En ChillChess utilizamos cookies y tecnologías similares para garantizar el correcto
                funcionamiento de la plataforma y mejorar continuamente tu experiencia de usuario.
            </p>
        </div>
    </header>

    <!-- Content Section -->
    <main class="max-w-3xl mx-auto px-4">
        <div
            class="bg-slate-900/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-700/50 prose prose-invert prose-brand max-w-none"
        >
            <h2>1. ¿Qué son las cookies?</h2>
            <p>
                Una cookie es un pequeño fragmento de texto que los sitios web que visitas envían a
                tu navegador. Ayudan a que el sitio web recuerde información sobre tu visita, como
                tu estado de sesión, configuraciones preferidas y otros datos técnicos. Esto puede
                facilitar significativamente tu próxima visita y hacer que el sitio te resulte más
                útil.
            </p>

            <h2>2. ¿Cómo utilizamos las cookies?</h2>
            <p>
                Nuestra plataforma "ChillChess" se basa principalmente en la funcionalidad pura en tu
                lado local. Sin embargo, requerimos almacenamiento persistente para ciertas
                características:
            </p>
            <ul>
                <li>
                    <strong>Autenticación y Seguridad:</strong> Utilizamos cookies estrictamente necesarias
                    a través de Firebase Authentication para mantener tu sesión activa de forma segura
                    una vez que inicias sesión y confirmas tu identidad (o el estado de tu suscripción
                    pro). Sin ellas, la aplicación no podría saber quién eres página a página.
                </li>
                <li>
                    <strong>Preferencias del sistema:</strong> Utilizamos <code>localStorage</code> (una
                    tecnología similar a las cookies) para recordar pequeñas decisiones en tu navegador.
                    Por ejemplo, guardar temporalmente datos que estás editando en el Generador de Facturas,
                    o si has aceptado nuestro mensaje de cookies.
                </li>
                <li>
                    <strong>Pasarela de Pago (Stripe):</strong> Stripe interactúa con nuestra web estableciendo
                    sus propias cookies estrictamente necesarias para procesar tu pago de forma segura
                    y evitar el fraude.
                </li>
            </ul>

            <h2>3. Tipos de cookies que usamos explícitamente</h2>
            <div
                class="not-prose mt-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden table-responsive"
            >
                <table class="w-full text-left text-sm min-w-[480px]">
                    <thead
                        class="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700/50"
                    >
                        <tr>
                            <th class="p-4 py-3">Tipo / Nombre</th>
                            <th class="p-4 py-3">Propósito</th>
                            <th class="p-4 py-3">Duración</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700/50 text-slate-400">
                        <tr>
                            <td class="p-4 font-medium text-slate-300">Firebase Auth</td>
                            <td class="p-4">Autenticación de sesión y control de acceso.</td>
                            <td class="p-4">Persistente (hasta cierre de sesión)</td>
                        </tr>
                        <tr>
                            <td class="p-4 font-medium text-slate-300"
                                ><code class="text-brand-400">chillchess_cookies_accepted</code></td
                            >
                            <td class="p-4">Recuerda si cerraste el banner de cookies.</td>
                            <td class="p-4">Persistente</td>
                        </tr>
                        <tr>
                            <td class="p-4 font-medium text-slate-300">Stripe</td>
                            <td class="p-4"
                                >Antifraude y procesamiento de pagos al suscribirse por 1€.</td
                            >
                            <td class="p-4">Depende de Stripe (Sesión/Persistente)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 class="mt-12">4. ¿Cómo controlar o eliminar las cookies?</h2>
            <p>
                Tienes todo el derecho a decidir si aceptas o rechazas las cookies. Aunque hemos
                implementado un banner inicial para recabar tu consentimiento, también puedes
                configurar o modificar los controles de tu navegador en cualquier momento para
                aceptar o rechazar todas.
            </p>
            <p>
                Dado que la configuración de cada navegador es diferente, te recomendamos consultar
                el menú de "Ayuda" del tuyo (Chrome, Safari, Firefox, Edge, etc.) para saber cómo
                modificar tus preferencias. Ten en cuenta que, si rechazas las funciones técnicas de
                inicio de sesión de Firebase, la aplicación <strong>no funcionará</strong> ya que no
                podremos verificar si has pagado la suscripción de 1€.
            </p>

            <h2>5. Cambios en esta política</h2>
            <p>
                Podemos actualizar esta Política de Cookies periódicamente para reflejar, por
                ejemplo, cambios en las cookies que utilizamos o por otros motivos operativos,
                legales o reglamentarios.
            </p>

            <div
                class="mt-12 p-6 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-brand-200 relative"
            >
                <div
                    class="absolute -top-3 -left-3 bg-brand-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold"
                >
                    i
                </div>
                <h4 class="font-bold text-lg mb-2 text-brand-300">¿Más preguntas?</h4>
                <p class="m-0 opacity-90">
                    Si tienes alguna duda fundamental tras leer esta política, siempre puedes
                    comunicarte con el creador/administrador (Andrés) para obtener asistencia
                    directa sobre el uso de tus datos.
                </p>
            </div>
        </div>
    </main>
</div>
