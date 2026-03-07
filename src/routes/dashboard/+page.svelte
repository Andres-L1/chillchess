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
            class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neat-accent/5 rounded-full blur-[120px] mix-blend-screen"
        ></div>
        <div
            class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] mix-blend-screen"
        ></div>
    </div>

    <div class="max-w-6xl mx-auto space-y-12">
        <!-- Welcome Section -->
        <div
            class="glass-card p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative"
        >
            <div class="flex items-center gap-8 text-center md:text-left flex-col md:flex-row">
                <div
                    class="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 p-1 shadow-2xl relative group"
                >
                    <div
                        class="absolute inset-0 bg-neat-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    ></div>
                    <div
                        class="w-full h-full bg-[#0B0E14] rounded-[1.8rem] flex items-center justify-center relative z-10 overflow-hidden border border-white/5"
                    >
                        {#if $authStore.user?.photoURL}
                            <img
                                src={$authStore.user.photoURL}
                                alt="Avatar"
                                class="w-full h-full object-cover"
                            />
                        {:else}
                            <User class="w-10 h-10 text-slate-500" />
                        {/if}
                    </div>
                </div>
                <div>
                    <h2
                        class="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4 uppercase"
                    >
                        HELLO, <span class="hero-text-gradient">{userName}</span>
                    </h2>
                    <p class="text-slate-500 font-bold text-xl tracking-tight">
                        Your workspace is ready. What are we building today?
                    </p>
                </div>
            </div>

            <!-- Mini progress ring -->
            {#if totalTasks > 0}
                <div
                    class="bg-white/5 border border-white/5 rounded-[2rem] p-8 flex items-center gap-6 backdrop-blur-3xl shadow-2xl"
                >
                    <div
                        class="relative w-20 h-20 flex items-center justify-center text-xl font-black text-white"
                    >
                        <svg class="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                            <path
                                class="text-white/5"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                            />
                            <path
                                class="text-neat-accent"
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
                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                            PROGRESS
                        </p>
                        <p class="text-xl font-black text-white tracking-tight">
                            {completedTasks} / {totalTasks}
                            <span class="text-slate-500 text-sm">DONE</span>
                        </p>
                    </div>
                </div>
            {/if}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <!-- Quick Actions -->
            <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <a
                    href="/kanban"
                    class="glass-card !rounded-[2.5rem] p-10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group flex flex-col justify-between min-h-[220px]"
                >
                    <div class="flex justify-between items-start">
                        <div
                            class="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-black transition-all duration-500"
                        >
                            <LayoutList class="w-7 h-7" />
                        </div>
                        <ArrowRight
                            class="w-6 h-6 text-slate-700 group-hover:text-white transition-all group-hover:translate-x-1"
                        />
                    </div>
                    <div>
                        <h3
                            class="text-2xl font-black text-white mb-2 uppercase tracking-tighter group-hover:text-indigo-400 transition-colors"
                        >
                            Kanban Board
                        </h3>
                        <p class="text-slate-500 font-bold tracking-tight">
                            {#if pendingTasks === 0 && inProgressTasks === 0}
                                No pending tasks.
                            {:else}
                                {pendingTasks} pending, {inProgressTasks} in progress.
                            {/if}
                        </p>
                    </div>
                </a>

                <a
                    href="/freelance"
                    class="glass-card !rounded-[2.5rem] p-10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group flex flex-col justify-between min-h-[220px]"
                >
                    <div class="flex justify-between items-start">
                        <div
                            class="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-neat-accent group-hover:bg-neat-accent group-hover:text-black transition-all duration-500"
                        >
                            <Briefcase class="w-7 h-7" />
                        </div>
                        <ArrowRight
                            class="w-6 h-6 text-slate-700 group-hover:text-white transition-all group-hover:translate-x-1"
                        />
                    </div>
                    <div>
                        <h3
                            class="text-2xl font-black text-white mb-2 uppercase tracking-tighter group-hover:text-neat-accent transition-colors"
                        >
                            Hourly Rate
                        </h3>
                        <p class="text-slate-500 font-bold tracking-tight">
                            Recalculate your freelance rates accurately.
                        </p>
                    </div>
                </a>

                <a
                    href="/invoice"
                    class="glass-card !rounded-[2.5rem] p-10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 group flex flex-col justify-between min-h-[220px] sm:col-span-2 relative overflow-hidden"
                >
                    <div
                        class="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] group-hover:bg-emerald-500/10 transition-colors"
                    ></div>

                    <div class="flex justify-between items-start relative z-10">
                        <div
                            class="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500"
                        >
                            <FileText class="w-7 h-7" />
                        </div>
                        <div
                            class="text-[10px] font-black tracking-[0.3em] uppercase px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20"
                        >
                            MOST POPULAR
                        </div>
                    </div>
                    <div class="relative z-10">
                        <h3
                            class="text-4xl font-black text-white mb-2 uppercase tracking-tighter group-hover:text-emerald-400 transition-colors leading-none"
                        >
                            Invoice Generator
                        </h3>
                        <p class="text-slate-500 font-bold text-lg tracking-tight">
                            Professional invoices in seconds.
                        </p>
                    </div>
                </a>
            </div>

            <!-- Right Sidebar / Activity -->
            <div class="glass-card !rounded-[2.5rem] p-10 flex flex-col h-full min-h-[400px]">
                <div class="flex items-center gap-3 mb-10">
                    <div class="w-1.5 h-6 bg-neat-accent rounded-full"></div>
                    <h3 class="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">
                        TASK STATUS
                    </h3>
                </div>

                <div class="flex-1 flex flex-col gap-8">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <CircleDashed class="w-5 h-5 text-amber-500" />
                                <span
                                    class="text-sm font-black text-slate-400 uppercase tracking-widest"
                                    >To Do</span
                                >
                            </div>
                            <span class="text-xl font-black text-white tracking-tighter"
                                >{pendingTasks}</span
                            >
                        </div>
                        <div
                            class="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5"
                        >
                            <div
                                class="bg-amber-500 h-full rounded-full"
                                style="width: {totalTasks > 0
                                    ? (pendingTasks / totalTasks) * 100
                                    : 0}%"
                            ></div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"
                                ></div>
                                <span
                                    class="text-sm font-black text-slate-400 uppercase tracking-widest"
                                    >In Progress</span
                                >
                            </div>
                            <span class="text-xl font-black text-white tracking-tighter"
                                >{inProgressTasks}</span
                            >
                        </div>
                        <div
                            class="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5"
                        >
                            <div
                                class="bg-indigo-500 h-full rounded-full"
                                style="width: {totalTasks > 0
                                    ? (inProgressTasks / totalTasks) * 100
                                    : 0}%"
                            ></div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <CheckCircle2 class="w-5 h-5 text-neat-accent" />
                                <span
                                    class="text-sm font-black text-slate-400 uppercase tracking-widest"
                                    >Completed</span
                                >
                            </div>
                            <span class="text-xl font-black text-white tracking-tighter"
                                >{completedTasks}</span
                            >
                        </div>
                        <div
                            class="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5"
                        >
                            <div
                                class="bg-neat-accent h-full rounded-full shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                                style="width: {progressPercentage}%"
                            ></div>
                        </div>
                    </div>
                </div>

                <a
                    href="/kanban"
                    class="mt-12 w-full py-5 px-6 bg-white/5 hover:bg-white text-white hover:text-black text-xs font-black uppercase tracking-[0.2em] text-center rounded-2xl transition-all border border-white/10 shadow-xl active:scale-95"
                >
                    GO TO BOARD
                </a>
            </div>
        </div>
    </div>
</ProGate>
