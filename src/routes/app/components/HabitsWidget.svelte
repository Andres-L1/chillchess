<script lang="ts">
    import type { Habit } from '$lib/types/habit';
    import { DayType } from '$lib/types/habit';
    import { getDayStatus } from '$lib/utils/habitStats';

    export let habits: Habit[] = [];
    export let onOpenModal: (habit: Habit | null) => void;
    export let onToggleDay: (habit: Habit, dateStr: string, currentType: DayType) => void;

    // Generar últimos 7 días
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return {
            dateStr: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString('es-ES', { weekday: 'narrow' }),
            dayNum: d.getDate(),
            isToday: i === 6,
        };
    });

    function getStatusIcon(status: DayType, habit: Habit, dateStr: string) {
        const day = days.find((d) => d.dateStr === dateStr);
        const isToday = day?.isToday || false;

        switch (status) {
            case DayType.CHECK:
                return {
                    icon: '✓',
                    color: 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]',
                    scale: 'scale-100',
                };
            case DayType.FAIL:
                return {
                    icon: '✕',
                    color: 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]',
                    scale: 'scale-100',
                };
            case DayType.SKIP:
                return {
                    icon: '→',
                    color: 'bg-blue-400 text-white shadow-[0_0_15px_rgba(96,165,250,0.4)]',
                    scale: 'scale-100',
                };
            case DayType.PROGRESS:
                const event = habit.events?.[dateStr];
                const progress = event?.value || 0;
                const target = habit.targetValue || 1;
                const percentage = Math.min(100, (progress / target) * 100);
                return {
                    icon: `${Math.round(percentage)}%`,
                    color:
                        percentage >= 100
                            ? 'bg-orange-500 text-black'
                            : 'bg-orange-500/30 text-orange-300',
                    scale: 'scale-100',
                };
            default:
                // CLEAR
                return {
                    icon: '',
                    color: 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20',
                    scale: 'scale-95',
                    ring: isToday ? 'ring-1 ring-orange-500/30 border-orange-500/50' : '',
                };
        }
    }

    function handleDayClick(habit: Habit, dateStr: string) {
        const currentStatus = getDayStatus(habit, dateStr);
        onToggleDay(habit, dateStr, currentStatus);
    }
</script>

<div class="space-y-4">
    <!-- Header Row (Días de la semana) -->
    {#if habits.length > 0}
        <div class="hidden md:flex justify-end px-4 mb-2">
            <div class="flex gap-3 w-fit">
                {#each days as day}
                    <div
                        class="flex flex-col items-center justify-center w-10 text-xs text-slate-500 font-medium"
                    >
                        <span>{day.dayName}</span>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Lista de hábitos -->
    <div class="space-y-3">
        {#if habits.length === 0}
            <div
                class="flex flex-col items-center justify-center h-64 text-slate-600 bg-white/5 rounded-3xl border border-white/5 border-dashed"
            >
                <svg
                    class="w-12 h-12 mb-3 opacity-20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                </svg>
                <p class="text-slate-500 text-sm">No hay hábitos aún.</p>
                <button
                    on:click={() => onOpenModal(null)}
                    class="mt-2 text-orange-400 text-sm font-medium hover:underline"
                >
                    Crear el primero
                </button>
            </div>
        {:else}
            {#each habits as habit}
                <div
                    class="group relative flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 bg-white/5 hover:bg-white/8 border border-white/5 rounded-2xl transition-all"
                >
                    <!-- Info del hábito -->
                    <button
                        on:click={() => onOpenModal(habit)}
                        class="flex items-center gap-4 text-left flex-1 mb-4 md:mb-0"
                    >
                        <!-- Icono/Emoji -->
                        <div
                            class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-transform group-hover:scale-105"
                            style="background-color: var(--color-{habit.color}-500, rgba(249,115,22,0.1)); color: {habit.color ||
                                '#f97316'}"
                        >
                            <div class="opacity-80 scale-110">
                                {#if habit.currentStreak > 0}
                                    🔥
                                {:else}
                                    🌱
                                {/if}
                            </div>
                        </div>

                        <!-- Título y badges -->
                        <div>
                            <div class="flex items-center gap-2">
                                <span
                                    class="font-bold text-slate-200 text-lg group-hover:text-white transition-colors"
                                >
                                    {habit.title}
                                </span>

                                <!-- Racha badge -->
                                {#if habit.currentStreak > 0}
                                    <span
                                        class="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/20"
                                    >
                                        {habit.currentStreak} 🔥
                                    </span>
                                {/if}

                                <!-- Two-Day Rule badge -->
                                {#if habit.twoDayRule}
                                    <span
                                        class="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20"
                                        title="Regla de 2 días: permite 1 fallo sin romper racha"
                                    >
                                        2D
                                    </span>
                                {/if}
                            </div>

                            <div class="flex items-center gap-2 mt-0.5">
                                <span
                                    class="text-xs text-slate-500 font-medium uppercase tracking-wider opacity-60"
                                >
                                    {habit.frequency || 'Diario'}
                                </span>
                                {#if habit.habitType === 'numeric' && habit.targetValue}
                                    <span class="text-xs text-slate-600">•</span>
                                    <span class="text-xs text-slate-500">
                                        Meta: {habit.targetValue}
                                        {habit.unit || ''}
                                    </span>
                                {/if}
                            </div>
                        </div>
                    </button>

                    <!-- Grid semanal -->
                    <div
                        class="flex items-center justify-between md:justify-end gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 noscroll"
                    >
                        {#each days as day}
                            {@const status = getDayStatus(habit, day.dateStr)}
                            {@const styling = getStatusIcon(status, habit, day.dateStr)}

                            <button
                                on:click={() => handleDayClick(habit, day.dateStr)}
                                class="relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold text-sm
                                    {styling.color} {styling.scale} {styling.ring || ''}"
                                title="{day.dateStr} - {status}"
                            >
                                {#if styling.icon}
                                    <span class="text-base">{styling.icon}</span>
                                {:else}
                                    <span
                                        class="text-[10px] md:text-xs text-slate-600 font-medium md:hidden"
                                        >{day.dayName}</span
                                    >
                                {/if}
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>
