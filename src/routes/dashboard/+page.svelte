<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { kanbanStore } from '$lib/stores/kanbanStore';
    import { authStore } from '$lib/stores/authStore';
    import {
        LayoutList,
        Briefcase,
        FileText,
        ArrowRight,
        User,
        CheckCircle2,
        CircleDashed,
    } from 'lucide-svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';

    pageHeader.set({
        title: 'Panel de Control',
        description: 'Resumen de tus herramientas principales y estado de tus proyectos.',
        category: 'Workspace',
    });

    $: pendingTasks = $kanbanStore.filter((t) => t.status === 'todo').length;
    $: inProgressTasks = $kanbanStore.filter((t) => t.status === 'in-progress').length;
    $: completedTasks = $kanbanStore.filter((t) => t.status === 'done').length;
    $: totalTasks = $kanbanStore.length;

    // Greeting
    $: userName =
        $authStore.user?.displayName || $authStore.user?.email?.split('@')[0] || 'Freelancer';

    // Simple visual math for ring
    $: progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
</script>

<svelte:head>
    <title>Panel de Control | ChillChess</title>
</svelte:head>

<ProGate>
    <!-- Background glows -->
    <div class="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div
            class="absolute top-0 left-1/4 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] mix-blend-screen"
        ></div>
        <div
            class="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[100px] mix-blend-screen"
        ></div>
    </div>

    <div class="max-w-5xl mx-auto space-y-6">
        <!-- Welcome Section -->
        <div
            class="flex flex-col sm:flex-row gap-6 items-center sm:justify-between bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl"
        >
            <div
                class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            ></div>

            <div class="flex items-center gap-4">
                <div
                    class="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 p-[2px]"
                >
                    <div
                        class="w-full h-full bg-black rounded-full flex items-center justify-center"
                    >
                        {#if $authStore.user?.photoURL}
                            <img
                                src={$authStore.user.photoURL}
                                alt="Avatar"
                                class="w-full h-full rounded-full object-cover"
                            />
                        {:else}
                            <User class="w-8 h-8 text-white/80" />
                        {/if}
                    </div>
                </div>
                <div>
                    <h2 class="text-2xl sm:text-3xl font-light text-white tracking-wide">
                        Hola, <span class="font-bold">{userName}</span>
                    </h2>
                    <p class="text-sm text-slate-400 mt-1">
                        Listo para un nuevo día de productividad.
                    </p>
                </div>
            </div>

            <!-- Mini progress ring -->
            {#if totalTasks > 0}
                <div
                    class="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4"
                >
                    <div
                        class="relative w-12 h-12 flex items-center justify-center text-sm font-bold text-white"
                    >
                        <svg class="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <path
                                class="text-white/10"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                            />
                            <path
                                class="text-brand-500"
                                stroke-dasharray="{progressPercentage}, 100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                                stroke-linecap="round"
                            />
                        </svg>
                        {progressPercentage}%
                    </div>
                    <div>
                        <p
                            class="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5"
                        >
                            Completado
                        </p>
                        <p class="text-sm font-medium text-slate-200">
                            {completedTasks} de {totalTasks} tareas
                        </p>
                    </div>
                </div>
            {/if}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Quick Actions -->
            <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                    href="/kanban"
                    class="group bg-gradient-to-br from-indigo-500/10 to-transparent hover:from-indigo-500/20 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 rounded-3xl p-6 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                >
                    <div class="flex justify-between items-start mb-4 relative z-10">
                        <div class="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl shadow-inner">
                            <LayoutList class="w-6 h-6" />
                        </div>
                        <ArrowRight
                            class="w-5 h-5 text-slate-500 group-hover:text-white transition-colors group-hover:translate-x-1"
                        />
                    </div>
                    <div>
                        <h3 class="text-white font-medium text-lg mb-1">Tablero Kanban</h3>
                        <p class="text-sm text-slate-400">
                            {#if pendingTasks === 0 && inProgressTasks === 0}
                                No hay tareas pendientes.
                            {:else}
                                Tienes {pendingTasks} pendientes y {inProgressTasks} en progreso.
                            {/if}
                        </p>
                    </div>
                    <div
                        class="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[50px] mix-blend-screen pointer-events-none transition-opacity group-hover:opacity-100 opacity-0"
                    ></div>
                </a>

                <a
                    href="/freelance"
                    class="group bg-gradient-to-br from-sky-500/10 to-transparent hover:from-sky-500/20 backdrop-blur-xl border border-white/10 hover:border-sky-500/50 rounded-3xl p-6 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                >
                    <div class="flex justify-between items-start mb-4 relative z-10">
                        <div class="p-3 bg-sky-500/20 text-sky-400 rounded-xl shadow-inner">
                            <Briefcase class="w-6 h-6" />
                        </div>
                        <ArrowRight
                            class="w-5 h-5 text-slate-500 group-hover:text-white transition-colors group-hover:translate-x-1"
                        />
                    </div>
                    <div>
                        <h3 class="text-white font-medium text-lg mb-1">Valor Hora</h3>
                        <p class="text-sm text-slate-400">Recalcula tus tarifas de freelance.</p>
                    </div>
                    <div
                        class="absolute bottom-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-[50px] mix-blend-screen pointer-events-none transition-opacity group-hover:opacity-100 opacity-0"
                    ></div>
                </a>

                <a
                    href="/invoice"
                    class="group bg-gradient-to-br from-emerald-500/10 to-transparent hover:from-emerald-500/20 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 rounded-3xl p-6 transition-all relative overflow-hidden flex flex-col justify-between min-h-[160px] sm:col-span-2"
                >
                    <div class="flex justify-between items-start mb-4 relative z-10">
                        <div class="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl shadow-inner">
                            <FileText class="w-6 h-6" />
                        </div>
                        <ArrowRight
                            class="w-5 h-5 text-slate-500 group-hover:text-white transition-colors group-hover:translate-x-1"
                        />
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            <h3 class="text-white font-medium text-lg mb-1">
                                Generador de Facturas
                            </h3>
                            <p class="text-sm text-slate-400">
                                Crea tu próxima factura en minutos.
                            </p>
                        </div>
                        <div
                            class="text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-white/10 text-emerald-400 rounded-full border border-white/5 w-fit"
                        >
                            PRO TIP
                        </div>
                    </div>
                    <div
                        class="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-[60px] mix-blend-screen pointer-events-none transition-opacity group-hover:opacity-100 opacity-0"
                    ></div>
                </a>
            </div>

            <!-- Right Sidebar / Activity -->
            <div
                class="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col h-full min-h-[300px]"
            >
                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                    Estado de Tareas
                </h3>

                <div class="flex-1 flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center gap-2 text-slate-300">
                                <CircleDashed class="w-4 h-4 text-amber-400" />
                                Pendientes
                            </div>
                            <span class="font-bold text-white">{pendingTasks}</span>
                        </div>
                        <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div
                                class="bg-amber-400 h-full"
                                style="width: {totalTasks > 0
                                    ? (pendingTasks / totalTasks) * 100
                                    : 0}%"
                            ></div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center gap-2 text-slate-300">
                                <div
                                    class="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"
                                ></div>
                                En Progreso
                            </div>
                            <span class="font-bold text-white">{inProgressTasks}</span>
                        </div>
                        <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div
                                class="bg-indigo-400 h-full"
                                style="width: {totalTasks > 0
                                    ? (inProgressTasks / totalTasks) * 100
                                    : 0}%"
                            ></div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center gap-2 text-slate-300">
                                <CheckCircle2 class="w-4 h-4 text-emerald-400" />
                                Completadas
                            </div>
                            <span class="font-bold text-white">{completedTasks}</span>
                        </div>
                        <div class="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div
                                class="bg-emerald-400 h-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                style="width: {progressPercentage}%"
                            ></div>
                        </div>
                    </div>
                </div>

                <a
                    href="/kanban"
                    class="mt-6 w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white text-sm font-medium text-center rounded-xl transition-colors border border-white/10"
                >
                    Ver Tablero Completo
                </a>
            </div>
        </div>
    </div>
</ProGate>
