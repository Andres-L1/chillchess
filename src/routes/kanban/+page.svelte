<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { kanbanStore } from '$lib/stores/kanbanStore';
    import type { KanbanTask } from '$lib/types/kanban';
    import { Plus, Trash2, X, GripVertical, ChevronLeft, ChevronRight } from 'lucide-svelte';
    import { flip } from 'svelte/animate';
    import { fly, fade } from 'svelte/transition';
    import { onMount } from 'svelte';

    pageHeader.set({
        title: 'Tablero Kanban',
        description: 'Organiza tus tareas visualmente con drag & drop.',
        category: 'Productividad',
    });

    let showAddModal = false;
    let newTaskTitle = '';
    let newTaskColumn: KanbanTask['status'] = 'todo';
    let draggedTask: { id: string; status: KanbanTask['status'] } | null = null;
    let isTouchDevice = false;

    onMount(() => {
        isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    });

    const columns: { id: KanbanTask['status']; label: string; dot: string }[] = [
        { id: 'todo', label: 'Pendiente', dot: 'bg-amber-400' },
        { id: 'in-progress', label: 'En Progreso', dot: 'bg-blue-400' },
        { id: 'done', label: 'Completado', dot: 'bg-emerald-400' },
    ];

    function addTask() {
        if (!newTaskTitle.trim()) return;
        kanbanStore.addTask({
            title: newTaskTitle.trim(),
            status: newTaskColumn,
            tags: [],
        });
        newTaskTitle = '';
        showAddModal = false;
    }

    function handleDragStart(taskId: string, status: KanbanTask['status']) {
        draggedTask = { id: taskId, status };
    }

    function handleDrop(targetColumn: KanbanTask['status']) {
        if (draggedTask && draggedTask.status !== targetColumn) {
            kanbanStore.moveTask(draggedTask.id, targetColumn);
        }
        draggedTask = null;
    }

    function getTasksForColumn(tasks: KanbanTask[], columnId: KanbanTask['status']): KanbanTask[] {
        return tasks.filter((t) => t.status === columnId);
    }

    // Mobile: move task to adjacent column
    function moveTaskDirection(
        taskId: string,
        currentStatus: KanbanTask['status'],
        direction: 'left' | 'right'
    ) {
        const colIndex = columns.findIndex((c) => c.id === currentStatus);
        const targetIndex = direction === 'left' ? colIndex - 1 : colIndex + 1;
        if (targetIndex >= 0 && targetIndex < columns.length) {
            kanbanStore.moveTask(taskId, columns[targetIndex].id);
        }
    }
</script>

<svelte:head>
    <title>Tablero Kanban | MultiTool</title>
    <meta
        name="description"
        content="Organiza tus proyectos visualmente con un tablero Kanban. Arrastra y suelta tareas entre columnas."
    />
</svelte:head>

<div class="flex flex-col lg:flex-row gap-4 md:gap-6 h-full">
    {#each columns as col, colIdx}
        {@const colTasks = getTasksForColumn($kanbanStore, col.id)}
        <div
            class="flex-1 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-slate-700/40 flex flex-col min-h-[200px] lg:min-h-[300px]"
            on:dragover|preventDefault
            on:drop={() => handleDrop(col.id)}
            role="list"
            aria-label="Columna {col.label}"
        >
            <!-- Column Header -->
            <div class="flex items-center justify-between mb-3 sm:mb-4">
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full {col.dot}"></div>
                    <h3 class="font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                        {col.label}
                    </h3>
                    <span
                        class="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full"
                    >
                        {colTasks.length}
                    </span>
                </div>
                <button
                    on:click={() => {
                        newTaskColumn = col.id;
                        showAddModal = true;
                    }}
                    class="p-1.5 text-slate-500 hover:text-brand-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                    <Plus class="w-4 h-4" />
                </button>
            </div>

            <!-- Tasks -->
            <div class="flex-1 space-y-2 overflow-y-auto">
                {#each colTasks as task (task.id)}
                    <div
                        animate:flip={{ duration: 200 }}
                        draggable={!isTouchDevice}
                        on:dragstart={() => handleDragStart(task.id, task.status)}
                        class="bg-slate-800/60 border border-slate-700/40 p-3 sm:p-3.5 rounded-xl {isTouchDevice
                            ? ''
                            : 'cursor-grab active:cursor-grabbing'} hover:border-slate-600 transition-all group flex flex-col gap-2"
                        role="listitem"
                    >
                        <div class="flex items-start gap-2">
                            {#if !isTouchDevice}
                                <GripVertical
                                    class="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0 group-hover:text-slate-400"
                                />
                            {/if}
                            <span class="text-sm text-slate-300 flex-1 font-medium"
                                >{task.title}</span
                            >
                            <button
                                on:click={() => kanbanStore.deleteTask(task.id)}
                                class="text-slate-600 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all flex-shrink-0 p-1"
                            >
                                <Trash2 class="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <!-- Mobile move buttons -->
                        {#if isTouchDevice}
                            <div class="flex items-center gap-2 pt-1 border-t border-slate-700/30">
                                <button
                                    on:click={() => moveTaskDirection(task.id, task.status, 'left')}
                                    disabled={colIdx === 0}
                                    class="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                                        {colIdx === 0
                                        ? 'text-slate-700 cursor-not-allowed'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50 active:scale-95'}"
                                >
                                    <ChevronLeft class="w-3.5 h-3.5" />
                                    {colIdx > 0 ? columns[colIdx - 1].label : ''}
                                </button>
                                <div class="w-px h-4 bg-slate-700/50"></div>
                                <button
                                    on:click={() =>
                                        moveTaskDirection(task.id, task.status, 'right')}
                                    disabled={colIdx === columns.length - 1}
                                    class="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                                        {colIdx === columns.length - 1
                                        ? 'text-slate-700 cursor-not-allowed'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50 active:scale-95'}"
                                >
                                    {colIdx < columns.length - 1 ? columns[colIdx + 1].label : ''}
                                    <ChevronRight class="w-3.5 h-3.5" />
                                </button>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>

<!-- Add Task Modal -->
{#if showAddModal}
    <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        transition:fade={{ duration: 200 }}
        on:click|self={() => (showAddModal = false)}
        role="button"
        tabindex="-1"
        on:keydown={(e) => e.key === 'Escape' && (showAddModal = false)}
    >
        <div
            class="bg-slate-900 border border-slate-700/50 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl safe-bottom"
            transition:fly={{ y: 20, duration: 300 }}
        >
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-white">Nueva Tarea</h3>
                <button
                    on:click={() => (showAddModal = false)}
                    class="text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                    <X class="w-5 h-5" />
                </button>
            </div>

            <form on:submit|preventDefault={addTask} class="space-y-4">
                <div>
                    <label
                        for="task-title"
                        class="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider"
                    >
                        Título de la tarea
                    </label>
                    <input
                        id="task-title"
                        type="text"
                        bind:value={newTaskTitle}
                        placeholder="Ej: Revisar propuesta cliente"
                        class="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                </div>

                <div>
                    <label
                        for="task-column"
                        class="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider"
                    >
                        Columna
                    </label>
                    <select
                        id="task-column"
                        bind:value={newTaskColumn}
                        class="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    >
                        {#each columns as col}
                            <option value={col.id}>{col.label}</option>
                        {/each}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    class="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                >
                    Añadir Tarea
                </button>
            </form>
        </div>
    </div>
{/if}
