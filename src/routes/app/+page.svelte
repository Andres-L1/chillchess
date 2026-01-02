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
    } from 'firebase/firestore';
    import { toast } from '$lib/stores/notificationStore';
    import { fade, scale } from 'svelte/transition';
    import BackIcon from '$lib/components/icons/BackIcon.svelte';

    let habits: any[] = [];
    let tasks: any[] = [];
    let loading = true;

    // Modals
    let showHabitModal = false;
    let showTaskModal = false;

    // Habit Form Data
    let newHabit = {
        title: '',
        frequency: 'daily',
        color: 'orange',
        notes: '',
    };

    // Task Form Data
    let newTask = {
        title: '',
        dueDate: 'today',
        priority: 'none',
        notes: '',
    };

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

    async function createHabit() {
        if (!newHabit.title.trim() || !$userStore.user) return;
        try {
            await addDoc(collection(db, 'habits'), {
                userId: $userStore.user.uid,
                title: newHabit.title,
                frequency: newHabit.frequency,
                color: newHabit.color,
                notes: newHabit.notes,
                streak: 0,
                createdAt: serverTimestamp(),
            });
            toast.success('Hábito creado');
            newHabit = { title: '', frequency: 'daily', color: 'orange', notes: '' };
            showHabitModal = false;
            loadData();
        } catch (e) {
            toast.error('Error al crear hábito');
        }
    }

    // Increment Habit Logic
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

    async function createTask() {
        if (!newTask.title.trim() || !$userStore.user) return;
        try {
            await addDoc(collection(db, 'tasks'), {
                userId: $userStore.user.uid,
                title: newTask.title,
                dueDate: newTask.dueDate,
                priority: newTask.priority,
                notes: newTask.notes,
                completed: false,
                createdAt: serverTimestamp(),
            });
            toast.success('Tarea añadida');
            newTask = { title: '', dueDate: 'today', priority: 'none', notes: '' };
            showTaskModal = false;
            loadData();
        } catch (e) {
            toast.error('Error al crear tarea');
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
            <h1 class="text-3xl md:text-4xl font-bold">Crea un hábito o una tarea.</h1>
        </div>

        <p class="text-slate-400 text-lg mb-8 leading-relaxed">
            <strong class="text-orange-400">Hábitos:</strong> Cosas que quieres repetir (Ej: "Leer
            10 páginas").<br />
            <strong class="text-blue-400">Tareas:</strong> Cosas únicas por hacer (Ej: "Cancelar suscripción").
        </p>
    </header>

    <main class="max-w-4xl mx-auto space-y-6">
        <!-- New Habit Button (Card Style) -->
        <button
            on:click={() => (showHabitModal = true)}
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
            on:click={() => (showTaskModal = true)}
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
                            <button
                                on:click={() => incrementHabit(habit)}
                                class="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:border-orange-500/30 transition-all hover:bg-white/5"
                            >
                                <span class="font-medium text-slate-200">{habit.title}</span>
                                <div
                                    class="flex items-center gap-2 text-xs text-slate-400 font-bold bg-white/5 px-3 py-1.5 rounded group-hover:bg-orange-500 group-hover:text-white transition-colors"
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
                                            d="M5 13l4 4L19 7"
                                        /></svg
                                    >
                                    <span>{habit.streak || 0}</span>
                                </div>
                            </button>
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
                            <button
                                on:click={() => toggleTask(task)}
                                class="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:bg-white/5 transition-all {task.completed
                                    ? 'opacity-50'
                                    : ''}"
                            >
                                <div class="flex items-center gap-4">
                                    <div
                                        class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors {task.completed
                                            ? 'border-blue-500 bg-blue-500 text-white'
                                            : 'border-slate-600 group-hover:border-blue-400'}"
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
                                    </div>
                                    <div class="flex flex-col">
                                        <span
                                            class="font-medium {task.completed
                                                ? 'line-through text-slate-500'
                                                : 'text-slate-200'}">{task.title}</span
                                        >
                                        {#if task.dueDate}
                                            <span class="text-[10px] text-slate-500 uppercase"
                                                >{task.dueDate === 'today'
                                                    ? 'Hoy'
                                                    : task.dueDate}</span
                                            >
                                        {/if}
                                    </div>
                                </div>
                                {#if task.priority && task.priority !== 'none'}
                                    <div
                                        class="w-2 h-2 rounded-full
                                        {task.priority === 'high'
                                            ? 'bg-red-500'
                                            : task.priority === 'medium'
                                              ? 'bg-yellow-500'
                                              : 'bg-blue-500'}"
                                    ></div>
                                {/if}
                            </button>
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
                    <h2 class="text-xl font-bold">Nuevo hábito</h2>
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
                            bind:value={newHabit.title}
                            placeholder="ej. Ejercicio 30min, Leer..."
                            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-slate-600"
                            autoFocus
                        />
                    </div>

                    <!-- Frequency -->
                    <div class="flex flex-wrap gap-2 text-sm">
                        {#each ['A diario', 'Días laborables', 'Fines de semana', 'Costumbre'] as type}
                            <button
                                on:click={() => (newHabit.frequency = type)}
                                class="px-3 py-1.5 rounded-lg border transition-colors {newHabit.frequency ===
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
                        bind:value={newHabit.notes}
                        placeholder="Notas (opcional)"
                        rows="2"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 resize-none transition-colors"
                    ></textarea>

                    <!-- Color Picker -->
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-slate-500 uppercase">Color</span>
                        {#each COLORS as color}
                            <button
                                on:click={() => (newHabit.color = color)}
                                class="w-6 h-6 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-2 ring-offset-[#0F172A] {newHabit.color ===
                                color
                                    ? 'ring-white'
                                    : 'ring-transparent'}"
                                style="background-color: var(--color-{color}-500, {color});"
                            ></button>
                        {/each}
                    </div>
                </div>
                <!-- Actions -->
                <div class="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
                    <button
                        on:click={() => (showHabitModal = false)}
                        class="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium"
                        >Cancelar</button
                    >
                    <button
                        on:click={createHabit}
                        class="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-900 hover:bg-white transition-colors font-bold shadow-lg shadow-white/10"
                        >Crear</button
                    >
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
                    <h2 class="text-xl font-bold">Nueva tarea</h2>
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
                            bind:value={newTask.title}
                            placeholder="p. ej. Reservar dentista..."
                            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                            autoFocus
                        />
                    </div>

                    <!-- Date -->
                    <div class="flex flex-wrap gap-2 text-sm">
                        {#each ['Hoy', 'Mañana', 'Esta semana', 'Sin fecha'] as date}
                            <button
                                on:click={() => (newTask.dueDate = date)}
                                class="px-3 py-1.5 rounded-lg border transition-colors {newTask.dueDate ===
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
                                on:click={() => (newTask.priority = p.id)}
                                class="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all {newTask.priority ===
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
                        bind:value={newTask.notes}
                        placeholder="Notas (opcional)"
                        rows="2"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none transition-colors"
                    ></textarea>
                </div>
                <!-- Actions -->
                <div class="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
                    <button
                        on:click={() => (showTaskModal = false)}
                        class="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium"
                        >Cancelar</button
                    >
                    <button
                        on:click={createTask}
                        class="px-5 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-400 transition-colors font-bold shadow-lg shadow-blue-500/20"
                        >Agregar</button
                    >
                </div>
            </div>
        </div>
    {/if}
</div>
