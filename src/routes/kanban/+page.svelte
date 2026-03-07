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
                class="flex-1 glass-card !bg-black/20 !rounded-[2.5rem] p-6 lg:p-8 flex flex-col min-h-[300px] lg:min-h-[500px] relative overflow-hidden group/column"
                on:dragover|preventDefault
                on:drop={() => handleDrop(col.id)}
                role="list"
                aria-label="Columna {col.label}"
            >
                <!-- Subtle Column Glow -->
                <div
                    class="absolute inset-0 bg-white/[0.02] opacity-0 group-hover/column:opacity-100 transition-opacity duration-700 pointer-events-none"
                ></div>

                <!-- Column Header -->
                <div class="flex items-center justify-between mb-8 relative z-10">
                    <div class="flex items-center gap-4">
                        <div class="relative flex items-center justify-center">
                            <div
                                class="absolute inset-0 {col.dot === 'bg-emerald-400'
                                    ? 'bg-neat-accent'
                                    : col.dot} blur-lg opacity-40"
                            ></div>
                            <div
                                class="w-3.5 h-3.5 rounded-full {col.dot === 'bg-emerald-400'
                                    ? 'bg-neat-accent'
                                    : col.dot} shadow-[0_0_15px_currentColor] relative z-10"
                            ></div>
                        </div>
                        <h3
                            class="font-black text-xs sm:text-sm text-white uppercase tracking-[0.3em] flex items-center gap-2"
                        >
                            {col.label}
                            <span
                                class="text-[10px] font-black text-slate-500 bg-white/5 border border-white/5 px-3 py-1 rounded-full backdrop-blur-3xl"
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
                        class="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5 active:scale-95 group"
                    >
                        <Plus class="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <!-- Tasks -->
                <div class="flex-1 space-y-4 overflow-y-auto pr-1 pb-4 custom-scrollbar">
                    {#each colTasks as task (task.id)}
                        <div
                            animate:flip={{ duration: 250 }}
                            draggable={!isTouchDevice && editingTaskId !== task.id}
                            on:dragstart={() => handleDragStart(task.id, task.status)}
                            class="glass-card !bg-white/5 !rounded-[1.8rem] p-6 {isTouchDevice
                                ? ''
                                : 'cursor-grab active:cursor-grabbing hover:-translate-y-1'} hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 group flex flex-col gap-4 relative overflow-hidden"
                            role="listitem"
                        >
                            <div class="flex items-start gap-4 relative z-10">
                                {#if !isTouchDevice && editingTaskId !== task.id}
                                    <div
                                        class="mt-1 opacity-20 group-hover:opacity-100 transition-opacity duration-300"
                                    >
                                        <GripVertical class="w-4 h-4 text-slate-500" />
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
                                            class="flex-1 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neat-accent/50 transition-all"
                                            use:focusOnMount
                                        />
                                        <div class="flex items-center gap-1.5">
                                            <button
                                                on:click={submitEdit}
                                                class="bg-neat-accent text-black hover:bg-white rounded-xl p-2 transition-all shadow-lg shadow-neat-accent/20"
                                            >
                                                <Check class="w-4 h-4" />
                                            </button>
                                            <button
                                                on:click={cancelEdit}
                                                class="bg-white/5 text-slate-400 hover:text-white rounded-xl p-2 transition-all border border-white/5"
                                            >
                                                <X class="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                {:else}
                                    <span
                                        class="text-base text-white flex-1 font-bold leading-tight tracking-tight group-hover:text-neat-accent transition-colors"
                                        >{task.title}</span
                                    >

                                    <div
                                        class="flex opacity-0 group-hover:opacity-100 transition-all duration-500 glass-card !rounded-xl !p-1 border-white/5 overflow-hidden"
                                    >
                                        <button
                                            on:click={() => startEdit(task)}
                                            class="text-slate-500 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-all"
                                        >
                                            <Pencil class="w-4 h-4" />
                                        </button>
                                        <button
                                            on:click={() => deleteTaskWithUndo(task)}
                                            class="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                                        >
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                {/if}
                            </div>

                            <!-- Mobile move buttons -->
                            {#if isTouchDevice && editingTaskId !== task.id}
                                <div
                                    class="flex items-center gap-3 pt-4 border-t border-white/5 relative z-10 w-full"
                                >
                                    <button
                                        on:click={() =>
                                            moveTaskDirection(task.id, task.status, 'left')}
                                        disabled={colIdx === 0}
                                        class="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                        {colIdx === 0
                                            ? 'text-slate-800 opacity-20'
                                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 border border-white/5'}"
                                    >
                                        <ChevronLeft class="w-3.5 h-3.5" />
                                        <span>{colIdx > 0 ? columns[colIdx - 1].label : ''}</span>
                                    </button>

                                    <button
                                        on:click={() =>
                                            moveTaskDirection(task.id, task.status, 'right')}
                                        disabled={colIdx === columns.length - 1}
                                        class="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                        {colIdx === columns.length - 1
                                            ? 'text-slate-800 opacity-20'
                                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 border border-white/5'}"
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
                            class="h-32 flex items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] text-slate-700 text-xs font-black uppercase tracking-[0.2em]"
                        >
                            Drop tasks here
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>

    <!-- Undo snackbar -->
    {#if undoTask}
        <div
            class="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 glass-card !rounded-2xl px-8 py-5 shadow-2xl border-white/10"
            transition:fly={{ y: 20, duration: 250 }}
        >
            <div class="flex items-center gap-4">
                <div class="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                    <Trash2 class="w-5 h-5" />
                </div>
                <span class="text-sm text-white font-bold tracking-tight uppercase"
                    >Task Deleted</span
                >
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <button
                on:click={undoDelete}
                class="flex items-center gap-2 text-neat-accent hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all"
            >
                <Undo2 class="w-5 h-5" />
                Undo
            </button>
        </div>
    {/if}

    <!-- Add Task Modal -->
    {#if showAddModal}
        <div
            class="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-end sm:items-center justify-center p-6"
            transition:fade={{ duration: 200 }}
            on:click|self={() => (showAddModal = false)}
            role="button"
            tabindex="-1"
            on:keydown={(e) => e.key === 'Escape' && (showAddModal = false)}
        >
            <div
                class="glass-card !bg-black/60 !rounded-[3rem] p-10 sm:p-12 w-full sm:max-w-lg shadow-2xl safe-bottom relative overflow-hidden"
                transition:fly={{ y: 40, duration: 400, opacity: 0, easing: (t) => t * (2 - t) }}
            >
                <div class="flex items-center justify-between mb-12 relative z-10">
                    <div class="flex items-center gap-4">
                        <div
                            class="p-4 bg-white/5 text-white rounded-[1.5rem] border border-white/10 shadow-inner backdrop-blur-3xl"
                        >
                            <Plus class="w-6 h-6" />
                        </div>
                        <h3 class="text-3xl font-black text-white uppercase tracking-tighter">
                            New Task
                        </h3>
                    </div>
                    <button
                        on:click={() => (showAddModal = false)}
                        class="text-slate-500 hover:text-white hover:bg-white/5 p-3 rounded-2xl transition-all border border-transparent hover:border-white/5"
                    >
                        <X class="w-6 h-6" />
                    </button>
                </div>

                <form on:submit|preventDefault={addTask} class="space-y-10 relative z-10">
                    <div class="space-y-4">
                        <label
                            for="task-title"
                            class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1"
                        >
                            What needs to be done?
                        </label>
                        <input
                            id="task-title"
                            type="text"
                            bind:value={newTaskTitle}
                            placeholder="Type something..."
                            class="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl px-6 py-5 text-lg text-white placeholder:text-slate-700 focus:outline-none focus:border-neat-accent/30 transition-all font-bold tracking-tight"
                            use:focusOnMount
                        />
                    </div>

                    <div class="space-y-4">
                        <label
                            for="task-column"
                            class="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1"
                        >
                            Current Status
                        </label>
                        <div class="relative">
                            <select
                                id="task-column"
                                bind:value={newTaskColumn}
                                class="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl px-6 py-5 text-lg text-white focus:outline-none focus:border-neat-accent/30 appearance-none transition-all cursor-pointer font-bold tracking-tight"
                            >
                                {#each columns as col}
                                    <option value={col.id} class="bg-[#0B0E14]">{col.label}</option>
                                {/each}
                            </select>
                            <div
                                class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-slate-600"
                            >
                                <ChevronRight class="w-5 h-5 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!newTaskTitle.trim()}
                        class="neat-button-primary w-full py-6 group"
                    >
                        <span class="relative z-10 flex items-center justify-center gap-3">
                            <Plus class="w-6 h-6" /> CREATE TASK
                        </span>
                    </button>
                </form>
            </div>
        </div>
    {/if}
</ProGate>
