<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { HabitType } from '$lib/types/habit';
    import type { Habit } from '$lib/types/habit';

    export let show = false;
    export let isEditing = false;
    export let formData: Partial<Habit>;
    export let onClose: () => void;
    export let onSave: () => void;
    export let onDelete: () => void;
</script>

{#if show}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        transition:fade
    >
        <div
            class="bg-[#0F172A] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            in:scale={{ start: 0.95 }}
        >
            <!-- Header -->
            <div class="sticky top-0 bg-[#0F172A]/95 backdrop-blur-md z-10 border-b border-white/5">
                <div
                    class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400"
                ></div>
                <div class="p-6 flex justify-between items-center">
                    <h2 class="text-xl font-bold text-white tracking-tight">
                        {isEditing ? 'Editar Hábito' : 'Nuevo Hábito'}
                    </h2>
                    <button
                        on:click={onClose}
                        class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div class="p-6 space-y-6">
                <!-- Título -->
                <div>
                    <label
                        for="habit-title"
                        class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2"
                        >Título *</label
                    >
                    <!-- svelte-ignore a11y-autofocus -->
                    <input
                        id="habit-title"
                        bind:value={formData.title}
                        placeholder="Ej: Leer 10 minutos al día"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white placeholder-slate-500 transition-all"
                        autofocus
                    />
                </div>

                <!-- Tipo de hábito -->
                <div class="space-y-2" role="group" aria-labelledby="habit-type-label">
                    <span
                        id="habit-type-label"
                        class="text-xs font-bold text-slate-400 uppercase tracking-wider block"
                        >Tipo</span
                    >
                    <div class="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            on:click={() => (formData.habitType = HabitType.BOOLEAN)}
                            class="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border text-center transition-all
                                {formData.habitType === HabitType.BOOLEAN
                                ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                                : 'border-white/10 text-slate-400'}"
                        >
                            <div class="text-2xl mb-1">✓</div>
                            <div class="text-sm font-medium">Sí/No</div>
                        </button>
                        <button
                            type="button"
                            on:click={() => (formData.habitType = HabitType.NUMERIC)}
                            class="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border text-center transition-all
                                {formData.habitType === HabitType.NUMERIC
                                ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                                : 'border-white/10 text-slate-400'}"
                        >
                            <div class="text-2xl mb-1">🎯</div>
                            <div class="text-sm font-medium">Numérico</div>
                        </button>
                    </div>
                </div>

                <!-- Configuración numérica (si es numeric) -->
                {#if formData.habitType === HabitType.NUMERIC}
                    <div
                        class="grid grid-cols-3 gap-3 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20"
                    >
                        <div>
                            <label
                                for="habit-target"
                                class="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-2"
                                >Meta</label
                            >
                            <input
                                id="habit-target"
                                type="number"
                                bind:value={formData.targetValue}
                                placeholder="8"
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label
                                for="habit-increment"
                                class="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-2"
                                >Incremento</label
                            >
                            <input
                                id="habit-increment"
                                type="number"
                                bind:value={formData.partialValue}
                                placeholder="1"
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <div>
                            <label
                                for="habit-unit"
                                class="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-2"
                                >Unidad</label
                            >
                            <input
                                id="habit-unit"
                                type="text"
                                bind:value={formData.unit}
                                placeholder="vasos"
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>
                    </div>
                {/if}

                <!-- Two-Day Rule -->
                <div
                    class="flex items-center justify-between p-4 bg-blue-500/5 rounded-xl border border-blue-500/20"
                >
                    <div class="flex-1">
                        <div class="font-bold text-blue-400">Regla de 2 Días</div>
                        <div class="text-xs text-slate-400 mt-1">
                            Permite fallar 1 día sin romper la racha (pero no 2 seguidos)
                        </div>
                    </div>
                    <label class="relative inline-block w-12 h-6">
                        <input
                            type="checkbox"
                            bind:checked={formData.twoDayRule}
                            class="sr-only peer"
                        />
                        <div
                            class="w-full h-full bg-white/10 peer-checked:bg-blue-500 rounded-full peer transition-all cursor-pointer"
                        ></div>
                        <div
                            class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-6 transition-transform"
                        ></div>
                    </label>
                </div>

                <!-- Momento del día -->
                <div class="space-y-2" role="group" aria-labelledby="time-label">
                    <span
                        id="time-label"
                        class="text-xs font-bold text-slate-400 uppercase tracking-wider block"
                        >Momento del día</span
                    >
                    <div class="flex gap-2">
                        {#each ['Cualquiera', 'Mañana', 'Tarde', 'Noche'] as time}
                            <button
                                type="button"
                                on:click={() => (formData.timeOfDay = time)}
                                class="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border text-sm font-medium transition-all
                                    {formData.timeOfDay === time
                                    ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                                    : 'border-white/10 text-slate-400'}"
                            >
                                {time}
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Frecuencia -->
                <div class="space-y-2" role="group" aria-labelledby="freq-label">
                    <span
                        id="freq-label"
                        class="text-xs font-bold text-slate-400 uppercase tracking-wider block"
                        >Frecuencia</span
                    >
                    <div class="flex gap-2">
                        {#each ['A diario', 'L-V', 'Finde'] as freq}
                            <button
                                type="button"
                                on:click={() => (formData.frequency = freq)}
                                class="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border text-sm font-medium transition-all
                                    {formData.frequency === freq
                                    ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                                    : 'border-white/10 text-slate-400'}"
                            >
                                {freq}
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Recordatorios -->
                <div class="space-y-3 p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-bold text-purple-400">Recordatorio Diario</div>
                            <div class="text-xs text-slate-400 mt-1">
                                Recibe una notificación para no olvidarte
                            </div>
                        </div>
                        <label class="relative inline-block w-12 h-6">
                            <input
                                type="checkbox"
                                bind:checked={formData.notification}
                                class="sr-only peer"
                            />
                            <div
                                class="w-full h-full bg-white/10 peer-checked:bg-purple-500 rounded-full peer transition-all cursor-pointer"
                            ></div>
                            <div
                                class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-6 transition-transform"
                            ></div>
                        </label>
                    </div>

                    {#if formData.notification}
                        <div>
                            <label
                                for="habit-time"
                                class="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-2"
                                >Hora del recordatorio</label
                            >
                            <input
                                id="habit-time"
                                type="time"
                                bind:value={formData.notTime}
                                class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    {/if}
                </div>

                <!-- Color -->
                <div class="space-y-2" role="radiogroup" aria-labelledby="color-label">
                    <span
                        id="color-label"
                        class="text-xs font-bold text-slate-400 uppercase tracking-wider block"
                        >Color</span
                    >
                    <div class="flex gap-3">
                        {#each ['orange', 'red', 'green', 'blue', 'purple', 'pink', 'cyan', 'amber'] as color}
                            <button
                                type="button"
                                on:click={() => (formData.color = color)}
                                class="w-9 h-9 rounded-full border-2 transition-all hover:scale-110
                                    {formData.color === color
                                    ? 'border-white scale-110'
                                    : 'border-transparent opacity-50 hover:opacity-100'}"
                                style="background-color: var(--color-{color}-500, {color});"
                            />
                        {/each}
                    </div>
                </div>

                <!-- Opciones avanzadas (toggle) -->
                <div class="border-t border-white/5 pt-4">
                    <button
                        type="button"
                        on:click={() => (formData.advanced = !formData.advanced)}
                        class="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <svg
                            class="w-4 h-4 transition-transform {formData.advanced
                                ? 'rotate-90'
                                : ''}"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                        Opciones avanzadas (Habit Loop)
                    </button>

                    {#if formData.advanced}
                        <div class="mt-4 space-y-4 pl-6">
                            <div>
                                <label
                                    for="habit-cue"
                                    class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2"
                                    >Señal (Cue)</label
                                >
                                <input
                                    id="habit-cue"
                                    type="text"
                                    bind:value={formData.cue}
                                    placeholder="¿Qué te recordará hacerlo?"
                                    class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label
                                    for="habit-routine"
                                    class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2"
                                    >Rutina (Routine)</label
                                >
                                <input
                                    id="habit-routine"
                                    type="text"
                                    bind:value={formData.routine}
                                    placeholder="¿Qué acción específica harás?"
                                    class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label
                                    for="habit-reward"
                                    class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2"
                                    >Recompensa (Reward)</label
                                >
                                <input
                                    id="habit-reward"
                                    type="text"
                                    bind:value={formData.reward}
                                    placeholder="¿Qué beneficio obtendrás?"
                                    class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                                />
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Footer -->
            <div
                class="sticky bottom-0 p-6 border-t border-white/5 bg-[#0F172A]/95 backdrop-blur-md flex justify-between"
            >
                {#if isEditing}
                    <button
                        on:click={onDelete}
                        class="text-red-400 text-sm hover:underline font-medium"
                    >
                        Eliminar hábito
                    </button>
                {:else}
                    <div></div>
                {/if}
                <div class="flex gap-3">
                    <button
                        on:click={onClose}
                        class="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        on:click={onSave}
                        class="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                    >
                        {isEditing ? 'Actualizar' : 'Crear hábito'}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}
