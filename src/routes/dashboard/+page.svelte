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
        title: 'PANEL DE CONTROL',
        description: 'Gestiona tus herramientas y proyectos desde un solo lugar.',
        category: 'SISTEMA',
    });

    $: pendingTasks = $kanbanStore.filter((t) => t.status === 'todo').length;
    $: inProgressTasks = $kanbanStore.filter((t) => t.status === 'in-progress').length;
    $: completedTasks = $kanbanStore.filter((t) => t.status === 'done').length;
    $: totalTasks = $kanbanStore.length;

    // Greeting
    $: userName =
        $authStore.user?.displayName || $authStore.user?.email?.split('@')[0] || 'Usuario';

    // Simple visual math for ring
    $: progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
</script>

<svelte:head>
    <title>Panel de Control | ChillChess</title>
</svelte:head>

<ProGate>
    <div class="max-w-7xl mx-auto space-y-16 py-10 md:py-16">
        <!-- Welcome Section -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-12">
            <div class="flex items-center gap-10 text-center md:text-left flex-col md:flex-row">
                <div
                    class="w-32 h-32 bg-white dark:bg-slate-800 border-4 border-black shadow-neo flex items-center justify-center p-1 transform rotate-3 hover:rotate-0 transition-transform"
                >
                    <div
                        class="w-full h-full bg-slate-200 dark:bg-slate-700 border-2 border-black flex items-center justify-center overflow-hidden"
                    >
                        {#if $authStore.user?.photoURL}
                            <img
                                src={$authStore.user.photoURL}
                                alt="Avatar"
                                class="w-full h-full object-cover"
                            />
                        {:else}
                            <User class="w-12 h-12 text-black dark:text-white" />
                        {/if}
                    </div>
                </div>
                <div>
                    <h2
                        class="text-5xl md:text-8xl font-black text-black dark:text-white tracking-tighter leading-none mb-4 uppercase italic"
                        style="text-shadow: 4px 4px 0px rgba(0,123,255,0.3);"
                    >
                        HOLA, <span class="text-primary">{userName}</span>
                    </h2>
                    <p
                        class="text-slate-600 dark:text-slate-400 font-black text-lg md:text-xl tracking-tighter uppercase max-w-2xl italic"
                    >
                        TU PANEL ESTÁ LISTO / <span class="text-black dark:text-white"
                            >EFICIENCIA AL MÁXIMO.</span
                        >
                    </p>
                </div>
            </div>

            <!-- Mini progress ring as a Neo-Brutalist Card -->
            {#if totalTasks > 0}
                <div
                    class="bg-white dark:bg-slate-900 border-4 border-black p-8 flex items-center gap-8 shadow-neo transform -rotate-1"
                >
                    <div
                        class="relative w-24 h-24 flex items-center justify-center text-2xl font-black text-black dark:text-white border-4 border-black rounded-full bg-slate-50 dark:bg-slate-800"
                    >
                        <svg
                            class="absolute inset-0 w-full h-full -rotate-90 p-1"
                            viewBox="0 0 36 36"
                        >
                            <path
                                class="text-slate-200 dark:text-slate-700"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                            />
                            <path
                                class="text-primary"
                                stroke-dasharray="{progressPercentage}, 100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                                stroke-linecap="square"
                            />
                        </svg>
                        <span class="relative z-10">{progressPercentage}%</span>
                    </div>
                    <div>
                        <p
                            class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1"
                        >
                            PROGRESO TOTAL
                        </p>
                        <p class="text-3xl font-black text-black dark:text-white tracking-tighter">
                            {completedTasks} / {totalTasks}
                        </p>
                        <p
                            class="text-[10px] font-black text-primary uppercase tracking-widest mt-1"
                        >
                            TAREAS COMPLETADAS
                        </p>
                    </div>
                </div>
            {/if}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <!-- Quick Actions -->
            <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <a
                    href="/kanban"
                    class="bg-[#E1F5FE] dark:bg-slate-900 border-4 border-black p-10 shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group flex flex-col justify-between min-h-[260px]"
                >
                    <div class="flex justify-between items-start">
                        <div
                            class="w-16 h-16 bg-[#B39DDB] border-4 border-black flex items-center justify-center shadow-neo-sm group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform"
                        >
                            <LayoutList class="w-8 h-8 text-black" />
                        </div>
                        <div
                            class="w-12 h-12 border-2 border-black flex items-center justify-center bg-slate-50 dark:bg-slate-800"
                        >
                            <ArrowRight
                                class="w-6 h-6 text-black dark:text-white group-hover:translate-x-1 transition-transform"
                            />
                        </div>
                    </div>
                    <div>
                        <h3
                            class="text-3xl font-black text-black dark:text-white mb-2 uppercase tracking-tighter"
                        >
                            TABLERO KANBAN
                        </h3>
                        <p class="text-[11px] font-black tracking-widest text-slate-500 uppercase">
                            {#if pendingTasks === 0 && inProgressTasks === 0}
                                Sin tareas pendientes
                            {:else}
                                {pendingTasks} pendientes · {inProgressTasks} en curso
                            {/if}
                        </p>
                    </div>
                </a>

                <a
                    href="/freelance"
                    class="bg-[#F1F8E9] dark:bg-slate-900 border-4 border-black p-10 shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group flex flex-col justify-between min-h-[260px]"
                >
                    <div class="flex justify-between items-start">
                        <div
                            class="w-16 h-16 bg-primary border-4 border-black flex items-center justify-center shadow-neo-sm group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform"
                        >
                            <Briefcase class="w-8 h-8 text-white" />
                        </div>
                        <div
                            class="w-12 h-12 border-2 border-black flex items-center justify-center bg-slate-50 dark:bg-slate-800"
                        >
                            <ArrowRight
                                class="w-6 h-6 text-black dark:text-white group-hover:translate-x-1 transition-transform"
                            />
                        </div>
                    </div>
                    <div>
                        <h3
                            class="text-3xl font-black text-black dark:text-white mb-2 uppercase tracking-tighter"
                        >
                            TARIFA FREELANCE
                        </h3>
                        <p class="text-[11px] font-black tracking-widest text-slate-500 uppercase">
                            OPTIMIZA TUS INGRESOS PROFESIONALES.
                        </p>
                    </div>
                </a>

                <a
                    href="/invoice"
                    class="bg-primary dark:bg-blue-700 border-4 border-black p-10 shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group flex flex-col justify-between min-h-[280px] sm:col-span-2 relative overflow-hidden"
                >
                    <div
                        class="absolute -top-12 -right-12 w-64 h-64 bg-black/10 rounded-full border-4 border-black/20"
                    ></div>

                    <div class="flex justify-between items-start relative z-10">
                        <div
                            class="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-neo-sm group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform"
                        >
                            <FileText class="w-8 h-8 text-black" />
                        </div>
                        <div
                            class="text-[10px] font-black tracking-widest uppercase px-6 py-2 bg-black text-white border-2 border-black"
                        >
                            MÁS UTILIZADO
                        </div>
                    </div>
                    <div class="relative z-10 text-white">
                        <h3
                            class="text-5xl md:text-7xl font-black mb-2 uppercase tracking-tighter leading-none italic"
                        >
                            FACTURAS PRO
                        </h3>
                        <p class="text-white/80 font-black text-xl tracking-tighter uppercase">
                            PRESENTACIÓN IMPECABLE EN SEGUNDOS.
                        </p>
                    </div>
                </a>
            </div>

            <!-- Right Sidebar / Activity -->
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-10 flex flex-col h-full min-h-[450px] shadow-neo"
            >
                <div class="flex items-center gap-4 mb-12">
                    <div class="w-3 h-8 bg-black dark:bg-white border-2 border-black"></div>
                    <h3
                        class="text-xs font-black text-black dark:text-white uppercase tracking-[0.3em]"
                    >
                        ESTADO DE TAREAS
                    </h3>
                </div>

                <div class="flex-1 flex flex-col gap-10">
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="neo-sticker bg-white dark:bg-slate-800 -rotate-2">
                                    <CircleDashed class="w-6 h-6 text-amber-500" />
                                </div>
                                <span
                                    class="text-[10px] font-black text-slate-500 uppercase tracking-widest"
                                    >POR HACER</span
                                >
                            </div>
                            <span
                                class="text-3xl font-black text-black dark:text-white tracking-tighter"
                                >{pendingTasks}</span
                            >
                        </div>
                        <div
                            class="w-full bg-slate-100 dark:bg-slate-800 border-[3px] border-black p-0"
                        >
                            <div
                                class="bg-amber-500 h-5 border-r-[3px] border-black transition-all duration-500"
                                style="width: {totalTasks > 0
                                    ? (pendingTasks / totalTasks) * 100
                                    : 0}%"
                            ></div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="neo-sticker bg-white dark:bg-slate-800 rotate-2">
                                    <div
                                        class="w-6 h-6 border-[3px] border-black border-t-purple-500 rounded-full animate-spin"
                                    ></div>
                                </div>
                                <span
                                    class="text-[10px] font-black text-slate-500 uppercase tracking-widest"
                                    >EN CURSO</span
                                >
                            </div>
                            <span
                                class="text-3xl font-black text-black dark:text-white tracking-tighter"
                                >{inProgressTasks}</span
                            >
                        </div>
                        <div
                            class="w-full bg-slate-100 dark:bg-slate-800 border-[3px] border-black p-0"
                        >
                            <div
                                class="bg-purple-500 h-5 border-r-[3px] border-black transition-all duration-500"
                                style="width: {totalTasks > 0
                                    ? (inProgressTasks / totalTasks) * 100
                                    : 0}%"
                            ></div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="neo-sticker bg-white dark:bg-slate-800 -rotate-1">
                                    <CheckCircle2 class="w-6 h-6 text-green-500" />
                                </div>
                                <span
                                    class="text-[10px] font-black text-slate-500 uppercase tracking-widest"
                                    >COMPLETADAS</span
                                >
                            </div>
                            <span
                                class="text-3xl font-black text-black dark:text-white tracking-tighter"
                                >{completedTasks}</span
                            >
                        </div>
                        <div
                            class="w-full bg-slate-100 dark:bg-slate-800 border-[3px] border-black p-0"
                        >
                            <div
                                class="bg-primary h-5 border-r-[3px] border-black transition-all duration-500"
                                style="width: {progressPercentage}%"
                            ></div>
                        </div>
                    </div>
                </div>

                <a
                    href="/kanban"
                    class="mt-12 w-full py-5 px-6 bg-black text-white text-xs font-black uppercase tracking-widest text-center border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all"
                >
                    GESTIONAR PROYECTOS
                </a>
            </div>
        </div>
    </div>
</ProGate>
