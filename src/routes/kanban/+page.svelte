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
        title: 'Tablero Kanban',
        description: 'Organiza tus tareas visualmente con drag & drop.',
        category: 'Productividad',
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
            class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] mix-blend-screen"
        ></div>
        <div
            class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[120px] mix-blend-screen"
        ></div>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 md:gap-6 h-full relative z-10">
        {#each columns as col, colIdx}
            {@const colTasks = getTasksForColumn($kanbanStore, col.id)}
            <div
                class="flex-1 bg-black/40 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 border border-white/10 shadow-sm flex flex-col min-h-[200px] lg:min-h-[300px] relative overflow-hidden"
                on:dragover|preventDefault
                on:drop={() => handleDrop(col.id)}
                role="list"
                aria-label="Columna {col.label}"
            >
                <!-- Subtle Highlight -->
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                ></div>

                <!-- Column Header -->
                <div class="flex items-center justify-between mb-4 sm:mb-5 relative z-10">
                    <div class="flex items-center gap-3">
                        <div class="relative flex items-center justify-center">
                            <div class="absolute inset-0 {col.dot} blur-md opacity-50"></div>
                            <div
                                class="w-3 h-3 rounded-full {col.dot} shadow-[0_0_10px_currentColor] relative z-10"
                            ></div>
                        </div>
                        <h3
                            class="font-bold text-sm sm:text-base text-white tracking-wider flex items-center gap-2 drop-shadow-sm"
                        >
                            {col.label}
                            <span
                                class="text-xs font-bold text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-inner"
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
                        class="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20 hover:shadow-lg active:scale-95 group"
                        title="Añadir a {col.label}"
                    >
                        <Plus class="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <!-- Tasks -->
                <div
                    class="flex-1 space-y-3 overflow-y-auto pr-1 pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                >
                    {#each colTasks as task (task.id)}
                        <div
                            animate:flip={{ duration: 250 }}
                            draggable={!isTouchDevice && editingTaskId !== task.id}
                            on:dragstart={() => handleDragStart(task.id, task.status)}
                            class="bg-white/5 backdrop-blur-3xl border border-white/10 p-4 rounded-2xl {isTouchDevice
                                ? ''
                                : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5'} hover:border-white/30 hover:shadow-lg hover:bg-white/10 transition-all duration-300 group flex flex-col gap-3 relative overflow-hidden"
                            role="listitem"
                        >
                            <div
                                class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            ></div>

                            <div class="flex items-start gap-3 relative z-10">
                                {#if !isTouchDevice && editingTaskId !== task.id}
                                    <div
                                        class="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    >
                                        <GripVertical
                                            class="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors"
                                        />
                                    </div>
                                {/if}

                                {#if editingTaskId === task.id}
                                    <!-- Inline edit mode -->
                                    <div class="flex-1 flex items-center gap-2">
                                        <input
                                            type="text"
                                            bind:value={editingTitle}
                                            on:keydown={(e) => {
                                                if (e.key === 'Enter') submitEdit();
                                                if (e.key === 'Escape') cancelEdit();
                                            }}
                                            class="flex-1 bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40 shadow-inner"
                                            use:focusOnMount
                                        />
                                        <div class="flex flex-col gap-1">
                                            <button
                                                on:click={submitEdit}
                                                class="bg-white/10 text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors border border-white/20"
                                                title="Guardar"
                                            >
                                                <Check class="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                on:click={cancelEdit}
                                                class="bg-black/20 text-slate-400 hover:bg-black/40 hover:text-slate-200 rounded-lg p-1.5 transition-colors border border-white/10"
                                                title="Cancelar"
                                            >
                                                <X class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                {:else}
                                    <span
                                        class="text-sm sm:text-base text-slate-200 flex-1 font-medium leading-relaxed group-hover:text-white transition-colors"
                                        >{task.title}</span
                                    >

                                    <div
                                        class="flex opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-lg"
                                    >
                                        <button
                                            on:click={() => startEdit(task)}
                                            class="text-slate-400 hover:text-white hover:bg-white/10 p-2 transition-colors border-r border-white/10"
                                            title="Editar"
                                        >
                                            <Pencil class="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            on:click={() => deleteTaskWithUndo(task)}
                                            class="text-slate-400 hover:text-red-400 hover:bg-white/10 p-2 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                {/if}
                            </div>

                            <!-- Mobile move buttons -->
                            {#if isTouchDevice && editingTaskId !== task.id}
                                <div
                                    class="flex items-center gap-2 pt-2 border-t border-white/10 relative z-10 w-full mt-1"
                                >
                                    <button
                                        on:click={() =>
                                            moveTaskDirection(task.id, task.status, 'left')}
                                        disabled={colIdx === 0}
                                        class="flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all border border-transparent
                                        {colIdx === 0
                                            ? 'text-slate-600 opacity-50 cursor-not-allowed'
                                            : 'text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 active:scale-95 bg-black/20 backdrop-blur-sm shadow-sm'}"
                                    >
                                        <ChevronLeft class="w-3.5 h-3.5" />
                                        <span class="truncate max-w-[80px]"
                                            >{colIdx > 0 ? columns[colIdx - 1].label : ''}</span
                                        >
                                    </button>

                                    <button
                                        on:click={() =>
                                            moveTaskDirection(task.id, task.status, 'right')}
                                        disabled={colIdx === columns.length - 1}
                                        class="flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all border border-transparent
                                        {colIdx === columns.length - 1
                                            ? 'text-slate-600 opacity-50 cursor-not-allowed'
                                            : 'text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 active:scale-95 bg-black/20 backdrop-blur-sm shadow-sm'}"
                                    >
                                        <span class="truncate max-w-[80px]"
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
                            class="h-24 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl text-slate-400 text-sm font-medium"
                        >
                            Arrastra tareas aquí
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>

    <!-- Undo snackbar -->
    {#if undoTask}
        <div
            class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-4 shadow-2xl"
            transition:fly={{ y: 20, duration: 250 }}
        >
            <div class="flex items-center gap-3">
                <div class="p-2 bg-red-500/20 text-red-400 rounded-lg">
                    <Trash2 class="w-4 h-4" />
                </div>
                <span class="text-sm text-slate-200 font-medium">Tarea eliminada</span>
            </div>
            <div class="w-px h-6 bg-white/10"></div>
            <button
                on:click={undoDelete}
                class="flex items-center gap-2 text-white hover:text-slate-200 font-bold text-sm transition-colors hover:bg-white/10 px-3 py-1.5 rounded-xl border border-transparent hover:border-white/20"
            >
                <Undo2 class="w-4 h-4" />
                Deshacer
            </button>
        </div>
    {/if}

    <!-- Add Task Modal -->
    {#if showAddModal}
        <div
            class="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
            transition:fade={{ duration: 200 }}
            on:click|self={() => (showAddModal = false)}
            role="button"
            tabindex="-1"
            on:keydown={(e) => e.key === 'Escape' && (showAddModal = false)}
        >
            <div
                class="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 sm:p-8 w-full sm:max-w-md shadow-2xl safe-bottom relative overflow-hidden"
                transition:fly={{ y: 20, duration: 300, opacity: 0 }}
            >
                <div
                    class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                ></div>

                <div class="flex items-center justify-between mb-8 relative z-10">
                    <div class="flex items-center gap-3">
                        <div
                            class="p-2.5 bg-white/10 text-white rounded-xl border border-white/20 shadow-inner backdrop-blur-md"
                        >
                            <Plus class="w-5 h-5" />
                        </div>
                        <h3 class="text-xl font-light text-white tracking-wide">Nueva Tarea</h3>
                    </div>
                    <button
                        on:click={() => (showAddModal = false)}
                        class="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all border border-transparent hover:border-white/20"
                        title="Cerrar"
                    >
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <form on:submit|preventDefault={addTask} class="space-y-6 relative z-10">
                    <div class="space-y-2">
                        <label
                            for="task-title"
                            class="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                        >
                            Título de la tarea
                        </label>
                        <div class="relative group">
                            <input
                                id="task-title"
                                type="text"
                                bind:value={newTaskTitle}
                                placeholder="Ej: Revisar propuesta cliente"
                                class="relative w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30 shadow-inner transition-all"
                                use:focusOnMount
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label
                            for="task-column"
                            class="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1"
                        >
                            Estado Inicial
                        </label>
                        <div class="relative">
                            <select
                                id="task-column"
                                bind:value={newTaskColumn}
                                class="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 shadow-inner appearance-none transition-all cursor-pointer"
                            >
                                {#each columns as col}
                                    <option value={col.id} class="bg-black">{col.label}</option>
                                {/each}
                            </select>
                            <div
                                class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400"
                            >
                                <ChevronRight class="w-4 h-4 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        class="w-full relative overflow-hidden group bg-white/10 disabled:bg-black/40 disabled:text-slate-500 hover:bg-white/20 text-white font-medium py-4 rounded-xl transition-all shadow-sm active:scale-[0.98] mt-4 border border-white/20 disabled:border-white/5 backdrop-blur-md"
                    >
                        {#if newTaskTitle.trim()}
                            <div
                                class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                            ></div>
                        {/if}
                        <span
                            class="relative z-10 flex items-center justify-center gap-2 tracking-wide"
                        >
                            <Plus class="w-5 h-5" /> Añadir Tarea
                        </span>
                    </button>
                </form>
            </div>
        </div>
    {/if}
</ProGate>
