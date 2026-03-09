<script lang="ts">
    import { pageHeader } from '$lib/stores/ui';
    import { kanbanStore } from '$lib/stores/kanbanStore';
    import type { KanbanTask } from '$lib/types/kanban';
    import {
        Plus,
        Trash2,
        X,
        GripVertical,
        ChevronLeft,
        ChevronRight,
        Pencil,
        Check,
        Undo2,
    } from 'lucide-svelte';
    import { flip } from 'svelte/animate';
    import { fly, fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import ProGate from '$lib/components/ui/ProGate.svelte';

    function focusOnMount(node: HTMLElement) {
        node.focus();
    }

    pageHeader.set({
        title: 'TABLERO KANBAN',
        description: 'Gestión visual de tareas con precisión quirúrgica.',
        category: 'PRODUCTIVIDAD',
    });

    let showAddModal = false;
    let newTaskTitle = '';
    let newTaskColumn: KanbanTask['status'] = 'todo';
    let draggedTask: { id: string; status: KanbanTask['status'] } | null = null;
    let isTouchDevice = false;

    // Task editing
    let editingTaskId: string | null = null;
    let editingTitle = '';

    // Undo delete
    let undoTask: KanbanTask | null = null;
    let undoTimer: ReturnType<typeof setTimeout> | null = null;

    onMount(() => {
        isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    });

    const columns: { id: KanbanTask['status']; label: string; dot: string }[] = [
        { id: 'todo', label: 'POR HACER', dot: 'bg-amber-400' },
        { id: 'in-progress', label: 'EN CURSO', dot: 'bg-neat-accent' },
        { id: 'done', label: 'FINALIZADO', dot: 'bg-emerald-400' },
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

    // ---- Editing ----
    function startEdit(task: KanbanTask) {
        editingTaskId = task.id;
        editingTitle = task.title;
    }

    function submitEdit() {
        if (!editingTaskId) return;
        const trimmed = editingTitle.trim();
        if (trimmed) {
            kanbanStore.updateTask(editingTaskId, { title: trimmed });
        }
        editingTaskId = null;
    }

    function cancelEdit() {
        editingTaskId = null;
    }

    // ---- Undo delete ----
    function deleteTaskWithUndo(task: KanbanTask) {
        if (undoTimer) clearTimeout(undoTimer);
        undoTask = task;
        kanbanStore.deleteTask(task.id);
        undoTimer = setTimeout(() => {
            undoTask = null;
        }, 5000);
    }

    function undoDelete() {
        if (!undoTask) return;
        if (undoTimer) clearTimeout(undoTimer);
        kanbanStore.addTask({
            ...undoTask,
            id: undoTask.id,
        });
        undoTask = null;
    }
</script>

<svelte:head>
    <title>Tablero Kanban | ChillChess</title>
    <meta
        name="description"
        content="Organiza tus proyectos visualmente con un tablero Kanban. Arrastra y suelta tareas entre columnas."
    />
</svelte:head>

<ProGate>
    <!-- Background glows -->
    <div class="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div
            class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-neat-accent/5 rounded-full blur-[120px] mix-blend-screen"
        ></div>
        <div
            class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[120px] mix-blend-screen"
        ></div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 md:gap-8 h-full relative z-10">
        {#each columns as col, colIdx}
            {@const colTasks = getTasksForColumn($kanbanStore, col.id)}
            <div
                class="flex-1 bg-white dark:bg-slate-900 border-4 border-black p-6 lg:p-8 flex flex-col min-h-[300px] lg:min-h-[500px] shadow-neo relative overflow-hidden group/column"
                on:dragover|preventDefault
                on:drop={() => handleDrop(col.id)}
                role="list"
                aria-label="Columna {col.label}"
            >
                <!-- Column Header -->
                <div class="flex items-center justify-between mb-8 relative z-10">
                    <div class="flex items-center gap-4">
                        <div
                            class="w-4 h-4 rounded-none border-2 border-black {col.id === 'done'
                                ? 'bg-[#C5E1A5]'
                                : col.id === 'todo'
                                  ? 'bg-[#FFCC80]'
                                  : 'bg-[#B39DDB]'} shadow-neo-sm"
                        ></div>
                        <h3
                            class="font-black text-sm text-black dark:text-white uppercase tracking-[0.2em] flex items-center gap-2"
                        >
                            {col.label}
                            <span
                                class="text-[10px] font-black text-white bg-black border-2 border-black px-3 py-1"
                            >
                                {colTasks.length}
                            </span>
                        </h3>
                    </div>
                    <button
                        on:click={() => {
                            newTaskColumn = col.id;
                            showAddModal = true;
                        }}
                        class="p-2.5 text-black dark:text-white bg-white dark:bg-slate-800 border-2 border-black shadow-neo-sm hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                        <Plus class="w-5 h-5" />
                    </button>
                </div>

                <!-- Tasks -->
                <div class="flex-1 space-y-4 overflow-y-auto pr-1 pb-4 custom-scrollbar">
                    {#each colTasks as task (task.id)}
                        <div
                            animate:flip={{ duration: 250 }}
                            draggable={!isTouchDevice && editingTaskId !== task.id}
                            on:dragstart={() => handleDragStart(task.id, task.status)}
                            class="bg-white dark:bg-slate-800 border-4 border-black p-6 {isTouchDevice
                                ? ''
                                : 'cursor-grab active:cursor-grabbing hover:-translate-y-1'} shadow-neo-sm hover:shadow-neo transition-all group flex flex-col gap-4 relative"
                            role="listitem"
                        >
                            <div class="flex items-start gap-4 relative z-10">
                                {#if !isTouchDevice && editingTaskId !== task.id}
                                    <div
                                        class="mt-1 text-black dark:text-white opacity-40 group-hover:opacity-100 transition-opacity"
                                    >
                                        <GripVertical class="w-4 h-4" />
                                    </div>
                                {/if}

                                {#if editingTaskId === task.id}
                                    <!-- Inline edit mode -->
                                    <div class="flex-1 flex items-center gap-3">
                                        <input
                                            type="text"
                                            bind:value={editingTitle}
                                            on:keydown={(e) => {
                                                if (e.key === 'Enter') submitEdit();
                                                if (e.key === 'Escape') cancelEdit();
                                            }}
                                            class="flex-1 bg-slate-50 dark:bg-slate-700 border-2 border-black px-4 py-2.5 text-sm text-black dark:text-white font-black uppercase focus:outline-none focus:bg-white transition-all shadow-neo-sm"
                                            use:focusOnMount
                                        />
                                        <div class="flex items-center gap-1.5">
                                            <button
                                                on:click={submitEdit}
                                                class="bg-primary text-white border-2 border-black p-2 transition-all shadow-neo-sm hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                            >
                                                <Check class="w-4 h-4" />
                                            </button>
                                            <button
                                                on:click={cancelEdit}
                                                class="bg-white dark:bg-slate-700 text-black dark:text-white border-2 border-black p-2 transition-all shadow-neo-sm hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                                            >
                                                <X class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                {:else}
                                    <span
                                        class="text-base text-black dark:text-white flex-1 font-black uppercase leading-tight tracking-tight group-hover:text-primary transition-colors italic"
                                        >{task.title} /</span
                                    >

                                    <div
                                        class="flex opacity-0 group-hover:opacity-100 transition-all border-2 border-black bg-white dark:bg-slate-900 shadow-neo-sm"
                                    >
                                        <button
                                            on:click={() => startEdit(task)}
                                            class="p-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-r-2 border-black"
                                        >
                                            <Pencil class="w-4 h-4" />
                                        </button>
                                        <button
                                            on:click={() => deleteTaskWithUndo(task)}
                                            class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                {/if}
                            </div>

                            <!-- Mobile move buttons -->
                            {#if isTouchDevice && editingTaskId !== task.id}
                                <div
                                    class="flex items-center gap-3 pt-4 border-t-2 border-black relative z-10 w-full"
                                >
                                    <button
                                        on:click={() =>
                                            moveTaskDirection(task.id, task.status, 'left')}
                                        disabled={colIdx === 0}
                                        class="flex-1 flex items-center justify-center gap-2 py-3 px-2 border-2 border-black text-[10px] font-black uppercase tracking-widest transition-all
                                        {colIdx === 0
                                            ? 'bg-slate-100 text-slate-400 border-slate-300'
                                            : 'bg-white text-black shadow-neo-sm hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'}"
                                    >
                                        <ChevronLeft class="w-3.5 h-3.5" />
                                        <span>{colIdx > 0 ? columns[colIdx - 1].label : ''}</span>
                                    </button>

                                    <button
                                        on:click={() =>
                                            moveTaskDirection(task.id, task.status, 'right')}
                                        disabled={colIdx === columns.length - 1}
                                        class="flex-1 flex items-center justify-center gap-2 py-3 px-2 border-2 border-black text-[10px] font-black uppercase tracking-widest transition-all
                                        {colIdx === columns.length - 1
                                            ? 'bg-slate-100 text-slate-400 border-slate-300'
                                            : 'bg-white text-black shadow-neo-sm hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'}"
                                    >
                                        <span
                                            >{colIdx < columns.length - 1
                                                ? columns[colIdx + 1].label
                                                : ''}</span
                                        >
                                        <ChevronRight class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            {/if}
                        </div>
                    {/each}

                    <!-- Empty State Placeholder -->
                    {#if colTasks.length === 0}
                        <div
                            class="h-32 flex items-center justify-center border-4 border-dashed border-black/10 dark:border-white/10 text-black/20 dark:text-white/20 text-xs font-black uppercase tracking-[0.2em]"
                        >
                            SIN TAREAS
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>

    <!-- Undo snackbar -->
    {#if undoTask}
        <div
            class="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 bg-white dark:bg-slate-900 border-4 border-black px-8 py-5 shadow-neo"
            transition:fly={{ y: 20, duration: 250 }}
        >
            <div class="flex items-center gap-4">
                <div class="p-2.5 bg-red-600 text-white border-2 border-black shadow-neo-sm">
                    <Trash2 class="w-5 h-5" />
                </div>
                <span class="text-sm text-black dark:text-white font-black uppercase tracking-tight"
                    >ELIMINADA</span
                >
            </div>
            <div class="w-1 h-8 bg-black"></div>
            <button
                on:click={undoDelete}
                class="flex items-center gap-2 text-primary hover:scale-105 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
            >
                <Undo2 class="w-5 h-5" />
                DESHACER
            </button>
        </div>
    {/if}

    <!-- Add Task Modal -->
    {#if showAddModal}
        <div
            class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-6"
            transition:fade={{ duration: 200 }}
            on:click|self={() => (showAddModal = false)}
            role="button"
            tabindex="-1"
            on:keydown={(e) => e.key === 'Escape' && (showAddModal = false)}
        >
            <div
                class="bg-white dark:bg-slate-900 border-4 border-black p-10 sm:p-12 w-full sm:max-w-lg shadow-neo safe-bottom relative overflow-hidden"
                transition:fly={{ y: 40, duration: 300 }}
            >
                <div class="flex items-center justify-between mb-12 relative z-10">
                    <h3
                        class="text-3xl font-black text-black dark:text-white uppercase tracking-tighter italic"
                    >
                        NUEVA TAREA
                    </h3>
                    <button
                        on:click={() => (showAddModal = false)}
                        class="text-black dark:text-white border-2 border-black p-2 bg-white dark:bg-slate-800 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <form on:submit|preventDefault={addTask} class="space-y-10 relative z-10">
                    <div class="space-y-4">
                        <label
                            for="task-title"
                            class="block text-[10px] font-black text-black dark:text-white uppercase tracking-[0.3em] ml-1"
                        >
                            ¿QUÉ TIENES PENDIENTE?
                        </label>
                        <input
                            id="task-title"
                            type="text"
                            bind:value={newTaskTitle}
                            placeholder="EJ: DISEÑAR LOGOTIPO..."
                            class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-5 text-lg text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white transition-all font-black tracking-tight uppercase shadow-neo-sm focus:shadow-neo"
                            use:focusOnMount
                        />
                    </div>

                    <div class="space-y-4">
                        <label
                            for="task-column"
                            class="block text-[10px] font-black text-black dark:text-white uppercase tracking-[0.3em] ml-1"
                        >
                            ESTADO ACTUAL
                        </label>
                        <div class="relative">
                            <select
                                id="task-column"
                                bind:value={newTaskColumn}
                                class="w-full bg-slate-50 dark:bg-slate-800 border-4 border-black px-6 py-5 text-lg text-black dark:text-white focus:outline-none appearance-none transition-all cursor-pointer font-black tracking-tight shadow-neo-sm active:shadow-none"
                            >
                                {#each columns as col}
                                    <option value={col.id} class="bg-white dark:bg-slate-900"
                                        >{col.label}</option
                                    >
                                {/each}
                            </select>
                            <div
                                class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-black dark:text-white"
                            >
                                <ChevronRight class="w-5 h-5 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        class="w-full py-6 bg-primary text-white border-4 border-black font-black uppercase tracking-widest text-lg shadow-neo hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:translate-0 disabled:shadow-none"
                    >
                        CREAR TAREA
                    </button>
                </form>
            </div>
        </div>
    {/if}
</ProGate>
