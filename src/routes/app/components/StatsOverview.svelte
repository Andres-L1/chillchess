<script lang="ts">
    export let totalStreak = 0;
    export let activeHabitsCount = 0;
    export let pendingTasksCount = 0;
    export let totalStreamDays = 0;
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <!-- Streak Card -->
    <div
        class="relative overflow-hidden group bg-white/5 border border-white/10 p-5 rounded-2xl md:rounded-3xl hover:bg-white/10 transition-all duration-300"
    >
        <div
            class="absolute -right-4 -top-4 w-20 h-20 bg-orange-500/20 blur-2xl rounded-full group-hover:bg-orange-500/30 transition-all"
        />
        <div class="relative z-10">
            <div class="flex items-center gap-2 mb-1 text-orange-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                    /><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                    /></svg
                >
                <span class="text-xs font-bold uppercase tracking-wider">Racha Total</span>
            </div>
            <span class="text-3xl md:text-4xl font-bold text-white tracking-tight"
                >{totalStreak}</span
            >
        </div>
    </div>

    <!-- Habits Card -->
    <div
        class="relative overflow-hidden group bg-white/5 border border-white/10 p-5 rounded-2xl md:rounded-3xl hover:bg-white/10 transition-all duration-300"
    >
        <div
            class="absolute -right-4 -top-4 w-20 h-20 bg-green-500/20 blur-2xl rounded-full group-hover:bg-green-500/30 transition-all"
        />
        <div class="relative z-10">
            <div class="flex items-center gap-2 mb-1 text-green-400">
                <span class="text-xs font-bold uppercase tracking-wider">Hábitos Activos</span>
            </div>
            <span class="text-3xl md:text-4xl font-bold text-white tracking-tight"
                >{activeHabitsCount}</span
            >
        </div>
    </div>

    <!-- Tasks Card -->
    <div
        class="relative overflow-hidden group bg-white/5 border border-white/10 p-5 rounded-2xl md:rounded-3xl hover:bg-white/10 transition-all duration-300"
    >
        <div
            class="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/30 transition-all"
        />
        <div class="relative z-10">
            <div class="flex items-center gap-2 mb-1 text-blue-400">
                <span class="text-xs font-bold uppercase tracking-wider">Tareas Pendientes</span>
            </div>
            <span class="text-3xl md:text-4xl font-bold text-white tracking-tight"
                >{pendingTasksCount}</span
            >
        </div>
    </div>

    <!-- Stream Days -->
    <div
        class="relative overflow-hidden group bg-white/5 border border-white/10 p-5 rounded-2xl md:rounded-3xl hover:bg-white/10 transition-all duration-300"
    >
        <div
            class="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/20 blur-2xl rounded-full group-hover:bg-purple-500/30 transition-all"
        />
        <div class="relative z-10">
            <div class="flex items-center gap-2 mb-1 text-purple-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                </svg>
                <span class="text-xs font-bold uppercase tracking-wider">Días Stream</span>
            </div>
            <span class="text-3xl md:text-4xl font-bold text-white tracking-tight"
                >{totalStreamDays}</span
            >
        </div>
    </div>
</div>
