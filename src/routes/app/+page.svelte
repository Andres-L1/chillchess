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

    // Modals & State
    let showHabitModal = false;
    let showTaskModal = false;
    let editingHabit: any = null; // If null, creating. If set, editing.
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

    // --- HABIT LOGIC ---
    function openHabitModal(habit: any = null) {
        if (habit) {
            editingHabit = habit;
            formDataHabit = { ...habit }; // Populate form
        } else {
            editingHabit = null; // Create mode
            formDataHabit = { ...defaultHabit };
        }
        showHabitModal = true;
    }

    async function saveHabit() {
        if (!formDataHabit.title.trim() || !$userStore.user) return;
        try {
            if (editingHabit) {
                // UPDATE
                await updateDoc(doc(db, 'habits', editingHabit.id), {
                    title: formDataHabit.title,
                    frequency: formDataHabit.frequency,
                    color: formDataHabit.color,
                    notes: formDataHabit.notes,
                });
                toast.success('Hábito actualizado');
            } else {
                // CREATE
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
            toast.error('Error al guardar hábito');
        }
    }

    async function deleteHabit() {
        if (!editingHabit) return;
        if (!confirm('¿Seguro que quieres eliminar este hábito?')) return;
        try {
            await deleteDoc(doc(db, 'habits', editingHabit.id));
            toast.success('Hábito eliminado');
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
            toast.success('¡Bien hecho!');
        } catch (e) {
            habit.streak -= 1;
            toast.error('Error al actualizar');
        }
    }

    // --- TASK LOGIC ---
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
                await updateDoc(doc(db, 'tasks', editingTask.id), {
                    title: formDataTask.title,
                    dueDate: formDataTask.dueDate,
                    priority: formDataTask.priority,
                    notes: formDataTask.notes,
                });
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
            toast.error('Error al guardar tarea');
        }
    }

    async function deleteTask() {
        if (!editingTask) return;
        if (!confirm('¿Seguro que quieres eliminar esta tarea?')) return;
        try {
            await deleteDoc(doc(db, 'tasks', editingTask.id));
            toast.success('Tarea eliminada');
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
            await updateDoc(doc(db, 'tasks', task.id), {
                completed: task.completed,
            });
            if (task.completed) toast.success('Tarea completada');
            loadData();
        } catch (e) {
            console.error(e);
            task.completed = !task.completed;
        }
    }
</script>

<div
    class="min-h-screen bg-[#0B1120] text-white font-poppins selection:bg-orange-500/30 p-6 md:p-12 pb-32"
>
    <!-- Header -->
    <header class="max-w-4xl mx-auto mb-12">
        <a
            href="/"
            class="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-colors text-sm font-medium uppercase tracking-wider"
        >
            <BackIcon size="sm" />
            <span>Volver</span>
        </a>

        <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-red-600"></div>
            <h1 class="text-3xl md:text-4xl font-bold">Dashboard</h1>
        </div>

        <p class="text-slate-400 text-lg mb-8 leading-relaxed">
            Gestiona tus objetivos diarios y mantén el foco.
        </p>
    </header>

    <main class="max-w-4xl mx-auto space-y-6">
        <!-- New Habit Button (Card Style) -->
        <button
            on:click={() => openHabitModal(null)}
            class="w-full bg-[#0F172A] border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-orange-500/50 transition-all text-left"
        >
            <div class="flex items-center gap-4">
                <div
                    class="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v16m8-8H4"
                        /></svg
                    >
                </div>
                <span class="font-medium text-lg">Nuevo hábito</span>
            </div>
            <span class="text-slate-500 text-sm group-hover:text-orange-400"
                >Rutinas diarias...</span
            >
        </button>

        <!-- New Task Button (Card Style) -->
        <button
            on:click={() => openTaskModal(null)}
            class="w-full bg-[#0F172A] border border-white/5 rounded-2xl p-6 flex items-center justify-between group hover:border-blue-500/50 transition-all text-left"
        >
            <div class="flex items-center gap-4">
                <div
                    class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v16m8-8H4"
                        /></svg
                    >
                </div>
                <span class="font-medium text-lg">Nueva tarea</span>
            </div>
            <span class="text-slate-500 text-sm group-hover:text-blue-400"
                >Acciones puntuales...</span
            >
        </button>

        <!-- LISTS -->
        <div class="pt-8 grid md:grid-cols-2 gap-8">
            <!-- Habits List -->
            <div>
                <h3
                    class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
                >
                    <span class="w-2 h-2 rounded-full bg-orange-500"></span> Tus Hábitos
                </h3>
                {#if habits.length === 0}
                    <div class="text-slate-600 italic text-sm">No tienes hábitos activos.</div>
                {:else}
                    <div class="space-y-3">
                        {#each habits as habit}
                            <div
                                class="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:border-orange-500/30 transition-all hover:bg-white/5 relative"
                            >
                                <!-- Click Area for Details -->
                                <button
                                    on:click={() => openHabitModal(habit)}
                                    class="flex-1 text-left font-medium text-slate-200 hover:text-white transition-colors truncate mr-4"
                                >
                                    {habit.title}
                                </button>

                                <!-- Streak Action -->
                                <button
                                    on:click|stopPropagation={() => incrementHabit(habit)}
                                    class="flex items-center gap-2 text-xs text-slate-400 font-bold bg-white/5 px-3 py-1.5 rounded hover:bg-orange-500 hover:text-white transition-colors z-10"
                                    title="Incrementar Racha"
                                >
                                    <svg
                                        class="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="3"
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        /></svg
                                    >
                                    <span>{habit.streak || 0}</span>
                                </button>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Tasks List -->
            <div>
                <h3
                    class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"
                >
                    <span class="w-2 h-2 rounded-full bg-blue-500"></span> Tus Tareas
                </h3>
                {#if tasks.length === 0}
                    <div class="text-slate-600 italic text-sm">No tienes tareas pendientes.</div>
                {:else}
                    <div class="space-y-3">
                        {#each tasks as task}
                            <div
                                class="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:bg-white/5 transition-all {task.completed
                                    ? 'opacity-50'
                                    : ''}"
                            >
                                <div class="flex items-center gap-4 flex-1 min-w-0">
                                    <!-- Checkbox Action -->
                                    <button
                                        on:click|stopPropagation={() => toggleTask(task)}
                                        class="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors {task.completed
                                            ? 'border-blue-500 bg-blue-500 text-white'
                                            : 'border-slate-600 hover:border-blue-400'}"
                                    >
                                        {#if task.completed}
                                            <svg
                                                class="w-3 h-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                ><path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="3"
                                                    d="M5 13l4 4L19 7"
                                                /></svg
                                            >
                                        {/if}
                                    </button>

                                    <!-- Detail Click -->
                                    <button
                                        on:click={() => openTaskModal(task)}
                                        class="flex flex-col text-left overflow-hidden"
                                    >
                                        <span
                                            class="font-medium truncate {task.completed
                                                ? 'line-through text-slate-500'
                                                : 'text-slate-200 group-hover:text-white'}"
                                            >{task.title}</span
                                        >
                                        {#if task.dueDate && task.dueDate !== 'Sin fecha'}
                                            <span class="text-[10px] text-slate-500 uppercase"
                                                >{task.dueDate === 'Today'
                                                    ? 'Hoy'
                                                    : task.dueDate}</span
                                            >
                                        {/if}
                                    </button>
                                </div>
                                {#if task.priority && task.priority !== 'none'}
                                    <div
                                        class="w-2 h-2 rounded-full ml-3 flex-shrink-0
                                        {task.priority === 'high'
                                            ? 'bg-red-500'
                                            : task.priority === 'medium'
                                              ? 'bg-yellow-500'
                                              : 'bg-blue-500'}"
                                    ></div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </main>

    <!-- HABIT MODAL -->
    {#if showHabitModal}
        <div
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            transition:fade
        >
            <div
                class="bg-[#0F172A] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                in:scale={{ start: 0.95 }}
            >
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 class="text-xl font-bold">
                        {editingHabit ? 'Editar hábito' : 'Nuevo hábito'}
                    </h2>
                    <button
                        on:click={() => (showHabitModal = false)}
                        class="text-slate-400 hover:text-white">✕</button
                    >
                </div>
                <div class="p-6 space-y-6">
                    <!-- Input -->
                    <div class="relative">
                        <!-- svelte-ignore a11y-autofocus -->
                        <input
                            bind:value={formDataHabit.title}
                            placeholder="ej. Ejercicio 30min, Leer..."
                            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600"
                            autoFocus
                        />
                    </div>

                    <!-- Frequency -->
                    <div class="flex flex-wrap gap-2 text-sm">
                        {#each ['A diario', 'Días laborables', 'Fines de semana', 'Costumbre'] as type}
                            <button
                                on:click={() => (formDataHabit.frequency = type)}
                                class="px-3 py-1.5 rounded-lg border transition-colors {formDataHabit.frequency ===
                                type
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'border-white/10 text-slate-400 hover:text-white'}"
                            >
                                {type}
                            </button>
                        {/each}
                    </div>

                    <!-- Notes -->
                    <textarea
                        bind:value={formDataHabit.notes}
                        placeholder="Notas (opcional)"
                        rows="2"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 resize-none transition-colors"
                    ></textarea>

                    <!-- Color Picker -->
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-slate-500 uppercase">Color</span>
                        {#each COLORS as color}
                            <button
                                on:click={() => (formDataHabit.color = color)}
                                class="w-6 h-6 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-2 ring-offset-[#0F172A] {formDataHabit.color ===
                                color
                                    ? 'ring-white'
                                    : 'ring-transparent'}"
                                style="background-color: var(--color-{color}-500, {color});"
                            ></button>
                        {/each}
                    </div>
                </div>
                <!-- Actions -->
                <div class="p-6 border-t border-white/5 flex justify-between gap-3 bg-black/20">
                    {#if editingHabit}
                        <button
                            on:click={deleteHabit}
                            class="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                            Eliminar
                        </button>
                    {:else}
                        <div></div>
                        <!-- Spacer -->
                    {/if}
                    <div class="flex gap-3">
                        <button
                            on:click={() => (showHabitModal = false)}
                            class="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium"
                            >Cancelar</button
                        >
                        <button
                            on:click={saveHabit}
                            class="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-900 hover:bg-white transition-colors font-bold shadow-lg shadow-white/10"
                        >
                            {editingHabit ? 'Guardar' : 'Crear'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- TASK MODAL -->
    {#if showTaskModal}
        <div
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            transition:fade
        >
            <div
                class="bg-[#0F172A] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                in:scale={{ start: 0.95 }}
            >
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 class="text-xl font-bold">
                        {editingTask ? 'Editar tarea' : 'Nueva tarea'}
                    </h2>
                    <button
                        on:click={() => (showTaskModal = false)}
                        class="text-slate-400 hover:text-white">✕</button
                    >
                </div>
                <div class="p-6 space-y-6">
                    <!-- Input -->
                    <div class="relative">
                        <!-- svelte-ignore a11y-autofocus -->
                        <input
                            bind:value={formDataTask.title}
                            placeholder="p. ej. Reservar dentista..."
                            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                            autoFocus
                        />
                    </div>

                    <!-- Date -->
                    <div class="flex flex-wrap gap-2 text-sm">
                        {#each ['Hoy', 'Mañana', 'Esta semana', 'Sin fecha'] as date}
                            <button
                                on:click={() => (formDataTask.dueDate = date)}
                                class="px-3 py-1.5 rounded-lg border transition-colors {formDataTask.dueDate ===
                                date
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'border-white/10 text-slate-400 hover:text-white'}"
                            >
                                {date}
                            </button>
                        {/each}
                    </div>

                    <!-- Priority -->
                    <div class="flex items-center gap-4">
                        <span class="text-xs font-bold text-slate-500 uppercase">Prioridad</span>
                        {#each [{ id: 'none', label: 'Ninguna', color: 'bg-slate-500' }, { id: 'low', label: 'Baja', color: 'bg-blue-500' }, { id: 'medium', label: 'Media', color: 'bg-yellow-500' }, { id: 'high', label: 'Alta', color: 'bg-red-500' }] as p}
                            <button
                                on:click={() => (formDataTask.priority = p.id)}
                                class="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all {formDataTask.priority ===
                                p.id
                                    ? 'border-white bg-white/5'
                                    : 'border-transparent opacity-60 hover:opacity-100'}"
                            >
                                <div class="w-2 h-2 rounded-full {p.color}"></div>
                                <span class="text-xs">{p.label}</span>
                            </button>
                        {/each}
                    </div>

                    <!-- Notes -->
                    <textarea
                        bind:value={formDataTask.notes}
                        placeholder="Notas (opcional)"
                        rows="2"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors"
                    ></textarea>
                </div>
                <!-- Actions -->
                <div class="p-6 border-t border-white/5 flex justify-between gap-3 bg-black/20">
                    {#if editingTask}
                        <button
                            on:click={deleteTask}
                            class="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                            Eliminar
                        </button>
                    {:else}
                        <div></div>
                    {/if}
                    <div class="flex gap-3">
                        <button
                            on:click={() => (showTaskModal = false)}
                            class="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium"
                            >Cancelar</button
                        >
                        <button
                            on:click={saveTask}
                            class="px-5 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-400 transition-colors font-bold shadow-lg shadow-blue-500/20"
                        >
                            {editingTask ? 'Guardar' : 'Agregar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
