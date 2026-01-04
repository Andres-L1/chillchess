<script lang="ts">
    import { fade, scale } from 'svelte/transition';

    export let show = false;
    export let isEditing = false;
    export let formData: any = {};
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
            class="bg-[#0F172A] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden"
            in:scale={{ start: 0.95 }}
        >
            <!-- Decor -->
            <div
                class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400"
            ></div>

            <div class="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 class="text-xl font-bold text-white tracking-tight">
                    {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
                </h2>
                <button
                    on:click={onClose}
                    class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    >✕</button
                >
            </div>
            <div class="p-6 space-y-6">
                <!-- svelte-ignore a11y-autofocus -->
                <input
                    bind:value={formData.title}
                    placeholder="Ej: Terminar reporte..."
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-500 transition-all shadow-inner"
                    autoFocus
                    aria-label="Título de la tarea"
                />

                <div class="space-y-2">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
                        >Vencimiento</span
                    >
                    <div class="flex flex-wrap gap-2 text-sm">
                        {#each ['Hoy', 'Mañana', 'Esta semana'] as date}
                            <button
                                on:click={() => (formData.dueDate = date)}
                                class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border flex-1 text-center font-medium {formData.dueDate ===
                                date
                                    ? 'border-blue-500 text-blue-500 bg-blue-500/10'
                                    : 'border-transparent text-slate-400'} transition-all"
                                >{date}</button
                            >
                        {/each}
                    </div>
                </div>

                <div class="space-y-2">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block"
                        >Prioridad</span
                    >
                    <div class="flex items-center gap-4">
                        {#each [{ id: 'low', c: 'bg-blue-500', label: 'Baja' }, { id: 'medium', c: 'bg-yellow-500', label: 'Media' }, { id: 'high', c: 'bg-red-500', label: 'Alta' }] as p}
                            <button
                                on:click={() => (formData.priority = p.id)}
                                class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:bg-white/5 transition-all {formData.priority ===
                                p.id
                                    ? 'bg-white/5 border-white/10 ring-1 ring-white/20'
                                    : 'opacity-60 hover:opacity-100'}"
                                aria-label="Prioridad {p.label}"
                            >
                                <div class="w-3 h-3 rounded-full {p.c}"></div>
                                <span
                                    class="text-sm font-medium {formData.priority === p.id
                                        ? 'text-white'
                                        : 'text-slate-400'}">{p.label}</span
                                >
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
            <div class="p-6 border-t border-white/5 flex justify-between bg-black/20">
                {#if isEditing}
                    <button
                        on:click={onDelete}
                        class="text-red-400 text-sm hover:underline font-medium decoration-red-400/30"
                        >Eliminar</button
                    >
                {:else}
                    <div></div>
                {/if}
                <div class="flex gap-3">
                    <button
                        on:click={onClose}
                        class="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                        >Cancelar</button
                    >
                    <button
                        on:click={onSave}
                        class="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >Guardar</button
                    >
                </div>
            </div>
        </div>
    </div>
{/if}
