<script lang="ts">
    import { onMount } from 'svelte';
    import { userStore } from '$lib/auth/userStore';
    import { db } from '$lib/firebase';
    import {
        collection,
        query,
        where,
        orderBy,
        limit,
        getDocs,
        addDoc,
        serverTimestamp,
        updateDoc,
        doc,
        increment,
        deleteDoc,
    } from 'firebase/firestore';
    import { toast } from '$lib/stores/notificationStore';
    import { fade, scale } from 'svelte/transition';
    import BackIcon from '$lib/components/icons/BackIcon.svelte';

    let habits: any[] = [];
    let tasks: any[] = [];
    let loading = true;

    // Stats
    $: activeHabitsCount = habits.length;
    $: pendingTasksCount = tasks.filter((t) => !t.completed).length;
    $: totalStreak = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
    $: completedTasksCount = tasks.filter((t) => t.completed).length;

    // Modals & State
    let showHabitModal = false;
    let showTaskModal = false;
    let editingHabit: any = null;
    let editingTask: any = null;

    // Form Defaults
    const defaultHabit = { title: '', frequency: 'A diario', color: 'orange', notes: '' };
    const defaultTask = { title: '', dueDate: 'Hoy', priority: 'none', notes: '' };

    let formDataHabit = { ...defaultHabit };
    let formDataTask = { ...defaultTask };

    const COLORS = ['orange', 'red', 'green', 'blue', 'purple', 'pink', 'cyan'];

    async function loadData() {
        if (!$userStore.user) return;
        loading = true;
        try {
            const qHabits = query(
                collection(db, 'habits'),
                where('userId', '==', $userStore.user.uid),
                orderBy('createdAt', 'desc')
            );
            const habitsSnap = await getDocs(qHabits);
            habits = habitsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            const qTasks = query(
                collection(db, 'tasks'),
                where('userId', '==', $userStore.user.uid),
                orderBy('createdAt', 'desc')
            );
            const tasksSnap = await getDocs(qTasks);
            tasks = tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error('Error loading data', e);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        if ($userStore.user) loadData();
    });

    // --- LOGIC (Habits/Tasks) Same as before ---
    function openHabitModal(habit: any = null) {
        if (habit) {
            editingHabit = habit;
            formDataHabit = { ...habit };
        } else {
            editingHabit = null;
            formDataHabit = { ...defaultHabit };
        }
        showHabitModal = true;
    }

    async function saveHabit() {
        if (!formDataHabit.title.trim() || !$userStore.user) return;
        try {
            if (editingHabit) {
                await updateDoc(doc(db, 'habits', editingHabit.id), { ...formDataHabit });
                toast.success('Hábito actualizado');
            } else {
                await addDoc(collection(db, 'habits'), {
                    userId: $userStore.user.uid,
                    ...formDataHabit,
                    streak: 0,
                    createdAt: serverTimestamp(),
                });
                toast.success('Hábito creado');
            }
            showHabitModal = false;
            loadData();
        } catch (e) {
            toast.error('Error al guardar');
        }
    }

    async function deleteHabit() {
        if (!editingHabit || !confirm('¿Eliminar este hábito?')) return;
        try {
            await deleteDoc(doc(db, 'habits', editingHabit.id));
            toast.success('Eliminado');
            showHabitModal = false;
            loadData();
        } catch (e) {
            toast.error('Error al eliminar');
        }
    }

    async function incrementHabit(habit: any) {
        habit.streak = (habit.streak || 0) + 1;
        habits = habits;
        try {
            await updateDoc(doc(db, 'habits', habit.id), {
                streak: increment(1),
                lastCompleted: serverTimestamp(),
            });
            toast.success('¡Bien hecho! +1 Racha');
        } catch (e) {
            habit.streak -= 1;
            toast.error('Error');
        }
    }

    function openTaskModal(task: any = null) {
        if (task) {
            editingTask = task;
            formDataTask = { ...task };
        } else {
            editingTask = null;
            formDataTask = { ...defaultTask };
        }
        showTaskModal = true;
    }

    async function saveTask() {
        if (!formDataTask.title.trim() || !$userStore.user) return;
        try {
            if (editingTask) {
                await updateDoc(doc(db, 'tasks', editingTask.id), { ...formDataTask });
                toast.success('Tarea actualizada');
            } else {
                await addDoc(collection(db, 'tasks'), {
                    userId: $userStore.user.uid,
                    ...formDataTask,
                    completed: false,
                    createdAt: serverTimestamp(),
                });
                toast.success('Tarea añadida');
            }
            showTaskModal = false;
            loadData();
        } catch (e) {
            toast.error('Error al guardar');
        }
    }

    async function deleteTask() {
        if (!editingTask || !confirm('¿Eliminar esta tarea?')) return;
        try {
            await deleteDoc(doc(db, 'tasks', editingTask.id));
            toast.success('Eliminada');
            showTaskModal = false;
            loadData();
        } catch (e) {
            toast.error('Error al eliminar');
        }
    }

    async function toggleTask(task: any) {
        task.completed = !task.completed;
        tasks = tasks;
        try {
            await updateDoc(doc(db, 'tasks', task.id), { completed: task.completed });
        } catch (e) {
            task.completed = !task.completed;
        }
    }
</script>

<div
    class="min-h-screen bg-[#0B1120] text-slate-200 font-poppins selection:bg-orange-500/30 p-4 md:p-8 pb-32"
>
    <!-- Header -->
    <header class="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div>
            <a
                href="/"
                class="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-2 transition-colors text-xs font-medium uppercase tracking-wider"
            >
                <BackIcon size="sm" />
                <span>Inicio</span>
            </a>
            <h1 class="text-2xl md:text-3xl font-bold text-white">Panel de Control</h1>
            <p class="text-slate-400 text-sm">Organiza tu vida y tu mente.</p>
        </div>
        <!-- Profile/Settings placeholder could go here -->
    </header>

    <main class="max-w-6xl mx-auto space-y-6">
        <!-- STATS ROW -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Streak Card -->
            <div
                class="bg-[#1e293b] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group"
            >
                <div
                    class="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <span class="text-3xl font-bold text-white">{totalStreak}</span>
                <span
                    class="text-xs text-orange-400 font-medium uppercase tracking-wider flex items-center gap-1"
                >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
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
                    Racha Total
                </span>
            </div>

            <!-- Habits Card -->
            <div
                class="bg-[#1e293b] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center"
            >
                <span class="text-3xl font-bold text-green-400">{activeHabitsCount}</span>
                <span class="text-xs text-slate-400 font-medium uppercase tracking-wider"
                    >Hábitos</span
                >
            </div>

            <!-- Tasks Pending -->
            <div
                class="bg-[#1e293b] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center"
            >
                <span class="text-3xl font-bold text-blue-400">{pendingTasksCount}</span>
                <span class="text-xs text-slate-400 font-medium uppercase tracking-wider"
                    >Pendientes</span
                >
            </div>

            <!-- Focus/Finished -->
            <div
                class="bg-[#1e293b] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center"
            >
                <span class="text-3xl font-bold text-purple-400">{completedTasksCount}</span>
                <span class="text-xs text-slate-400 font-medium uppercase tracking-wider"
                    >Completadas</span
                >
            </div>
        </div>

        <!-- MAIN GRID: HABITS & TASKS -->
        <div class="grid md:grid-cols-2 gap-6">
            <!-- HABITS PANEL -->
            <div
                class="bg-[#1e293b] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full min-h-[400px]"
            >
                <div
                    class="p-5 border-b border-white/5 flex justify-between items-center bg-black/10"
                >
                    <h2
                        class="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2"
                    >
                        <span class="w-2 h-2 rounded-full bg-green-500"></span> TUS HÁBITOS
                    </h2>
                    <button
                        on:click={() => openHabitModal(null)}
                        class="text-xs bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1"
                    >
                        + Añadir
                    </button>
                </div>

                <div class="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                    {#if habits.length === 0}
                        <div
                            class="flex flex-col items-center justify-center h-48 text-slate-600 text-center"
                        >
                            <svg
                                class="w-12 h-12 mb-3 opacity-20"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                /></svg
                            >
                            <p class="text-sm">Sin hábitos aún.</p>
                        </div>
                    {:else}
                        {#each habits as habit}
                            <div
                                class="flex items-center justify-between p-3 rounded-xl bg-[#0B1120]/50 border border-white/5 hover:border-green-500/30 transition-all group"
                            >
                                <button
                                    on:click={() => openHabitModal(habit)}
                                    class="flex items-center gap-3 text-left flex-1"
                                >
                                    <div
                                        class="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style="background-color: var(--color-{habit.color}-500, {habit.color ||
                                            'gray'})20; color: {habit.color || 'gray'}"
                                    >
                                        {#if habit.streak > 0}🔥{:else}🌱{/if}
                                    </div>
                                    <span
                                        class="font-medium text-slate-200 group-hover:text-white transition-colors"
                                        >{habit.title}</span
                                    >
                                </button>

                                <button
                                    on:click|stopPropagation={() => incrementHabit(habit)}
                                    class="text-xs font-bold px-3 py-1.5 rounded-md bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-colors ml-3"
                                >
                                    {habit.streak || 0}
                                </button>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- TASKS PANEL -->
            <div
                class="bg-[#1e293b] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full min-h-[400px]"
            >
                <div
                    class="p-5 border-b border-white/5 flex justify-between items-center bg-black/10"
                >
                    <h2
                        class="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2"
                    >
                        <span class="w-2 h-2 rounded-full bg-blue-500"></span> TUS TAREAS
                    </h2>
                    <button
                        on:click={() => openTaskModal(null)}
                        class="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1"
                    >
                        + Añadir
                    </button>
                </div>

                <div class="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                    {#if tasks.length === 0}
                        <div
                            class="flex flex-col items-center justify-center h-48 text-slate-600 text-center"
                        >
                            <svg
                                class="w-12 h-12 mb-3 opacity-20"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                /></svg
                            >
                            <p class="text-sm">Todo limpio.</p>
                        </div>
                    {:else}
                        {#each tasks as task}
                            <div
                                class="flex items-center p-3 rounded-xl bg-[#0B1120]/50 border border-white/5 hover:border-blue-500/30 transition-all group {task.completed
                                    ? 'opacity-40'
                                    : ''}"
                            >
                                <button
                                    on:click|stopPropagation={() => toggleTask(task)}
                                    class="w-5 h-5 rounded border-2 border-slate-600 mr-3 flex items-center justify-center transition-colors hover:border-blue-400 {task.completed
                                        ? 'bg-blue-500 border-blue-500'
                                        : ''}"
                                >
                                    {#if task.completed}<svg
                                            class="w-3 h-3 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            ><path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="3"
                                                d="M5 13l4 4L19 7"
                                            /></svg
                                        >{/if}
                                </button>

                                <button
                                    on:click={() => openTaskModal(task)}
                                    class="flex-1 text-left"
                                >
                                    <span
                                        class="font-medium {task.completed
                                            ? 'line-through'
                                            : 'text-slate-200'}">{task.title}</span
                                    >
                                    {#if task.dueDate && task.dueDate !== 'Sin fecha'}
                                        <span
                                            class="ml-2 text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded"
                                            >{task.dueDate}</span
                                        >
                                    {/if}
                                </button>

                                {#if task.priority === 'high'}
                                    <span
                                        class="text-[10px] font-bold bg-red-500/20 text-red-500 px-2 py-0.5 rounded"
                                        >ALTA</span
                                    >
                                {:else if task.priority === 'medium'}
                                    <span
                                        class="text-[10px] font-bold bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded"
                                        >MED</span
                                    >
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    </main>

    <!-- REUSING MODALS FROM PREVIOUS STEP (Hidden for brevity in this replace, but needed in full file) -->
    <!-- Adding Modals Back In -->
    {#if showHabitModal}
        <div
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            transition:fade
        >
            <div
                class="bg-[#0F172A] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl"
                in:scale={{ start: 0.95 }}
            >
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 class="text-xl font-bold text-white">
                        {editingHabit ? 'Editar Hábito' : 'Nuevo Hábito'}
                    </h2>
                    <button
                        on:click={() => (showHabitModal = false)}
                        class="text-slate-400 hover:text-white">✕</button
                    >
                </div>
                <div class="p-6 space-y-6">
                    <!-- svelte-ignore a11y-autofocus -->
                    <input
                        bind:value={formDataHabit.title}
                        placeholder="Ej: Leer 10 min..."
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-green-500 text-white"
                        autoFocus
                    />
                    <div class="flex flex-wrap gap-2 text-sm">
                        {#each ['A diario', 'L-V', 'Finde'] as type}
                            <button
                                on:click={() => (formDataHabit.frequency = type)}
                                class="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-transparent {formDataHabit.frequency ===
                                type
                                    ? 'border-green-500 text-green-500'
                                    : ''} transition-colors">{type}</button
                            >
                        {/each}
                    </div>
                    <textarea
                        bind:value={formDataHabit.notes}
                        placeholder="Notas..."
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-500 min-h-[80px] text-white"
                    ></textarea>
                </div>
                <div class="p-6 border-t border-white/5 flex justify-between bg-black/20">
                    {#if editingHabit}
                        <button on:click={deleteHabit} class="text-red-400 text-sm hover:underline"
                            >Eliminar</button
                        >
                    {:else}
                        <div></div>
                    {/if}
                    <div class="flex gap-3">
                        <button
                            on:click={() => (showHabitModal = false)}
                            class="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button
                        >
                        <button
                            on:click={saveHabit}
                            class="px-6 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl shadow-lg shadow-green-500/20"
                            >Guardar</button
                        >
                    </div>
                </div>
            </div>
        </div>
    {/if}

    {#if showTaskModal}
        <div
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            transition:fade
        >
            <div
                class="bg-[#0F172A] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl"
                in:scale={{ start: 0.95 }}
            >
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 class="text-xl font-bold text-white">
                        {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                    </h2>
                    <button
                        on:click={() => (showTaskModal = false)}
                        class="text-slate-400 hover:text-white">✕</button
                    >
                </div>
                <div class="p-6 space-y-6">
                    <!-- svelte-ignore a11y-autofocus -->
                    <input
                        bind:value={formDataTask.title}
                        placeholder="Ej: Comprar leche..."
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500 text-white"
                        autoFocus
                    />
                    <div class="flex flex-wrap gap-2 text-sm">
                        {#each ['Hoy', 'Mañana', 'Esta semana'] as date}
                            <button
                                on:click={() => (formDataTask.dueDate = date)}
                                class="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-transparent {formDataTask.dueDate ===
                                date
                                    ? 'border-blue-500 text-blue-500'
                                    : ''} transition-colors">{date}</button
                            >
                        {/each}
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-slate-500">PRIORIDAD</span>
                        {#each [{ id: 'low', c: 'bg-blue-500' }, { id: 'medium', c: 'bg-yellow-500' }, { id: 'high', c: 'bg-red-500' }] as p}
                            <button
                                on:click={() => (formDataTask.priority = p.id)}
                                class="w-6 h-6 rounded-full {p.c} {formDataTask.priority === p.id
                                    ? 'ring-2 ring-white'
                                    : 'opacity-40 hover:opacity-100'} transition-all"
                            ></button>
                        {/each}
                    </div>
                </div>
                <div class="p-6 border-t border-white/5 flex justify-between bg-black/20">
                    {#if editingTask}
                        <button on:click={deleteTask} class="text-red-400 text-sm hover:underline"
                            >Eliminar</button
                        >
                    {:else}
                        <div></div>
                    {/if}
                    <div class="flex gap-3">
                        <button
                            on:click={() => (showTaskModal = false)}
                            class="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button
                        >
                        <button
                            on:click={saveTask}
                            class="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20"
                            >Guardar</button
                        >
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
