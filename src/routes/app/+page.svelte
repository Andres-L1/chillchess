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
    import { fade, slide } from 'svelte/transition';
    import BackIcon from '$lib/components/icons/BackIcon.svelte';

    let habits: any[] = [];
    let tasks: any[] = [];
    let loading = true;

    // Forms
    let showHabitForm = false;
    let showTaskForm = false;
    let newHabitTitle = '';
    let newTaskTitle = '';

    // Mock XP Removed

    async function loadData() {
        if (!$userStore.user) return;
        loading = true;
        try {
            // Load Habits
            const qHabits = query(
                collection(db, 'habits'),
                where('userId', '==', $userStore.user.uid),
                orderBy('createdAt', 'desc')
            );
            const habitsSnap = await getDocs(qHabits);
            habits = habitsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            // Load Tasks
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
        if (!newHabitTitle.trim() || !$userStore.user) return;
        try {
            await addDoc(collection(db, 'habits'), {
                userId: $userStore.user.uid,
                title: newHabitTitle,
                streak: 0,
                createdAt: serverTimestamp(),
            });
            toast.success('Hábito creado');
            newHabitTitle = '';
            showHabitForm = false;
            loadData();
        } catch (e) {
            toast.error('Error al crear hábito');
        }
    }

    async function incrementHabit(habit: any) {
        // Optimistic UI
        habit.streak = (habit.streak || 0) + 1;
        habits = habits;
        try {
            await updateDoc(doc(db, 'habits', habit.id), {
                streak: increment(1),
                lastCompleted: serverTimestamp(),
            });
            toast.success('¡Bien hecho!');
        } catch (e) {
            habit.streak -= 1; // Revert
            toast.error('Error al actualizar');
        }
    }

    async function createTask() {
        if (!newTaskTitle.trim() || !$userStore.user) return;
        try {
            await addDoc(collection(db, 'tasks'), {
                userId: $userStore.user.uid,
                title: newTaskTitle,
                completed: false,
                createdAt: serverTimestamp(),
            });
            toast.success('Tarea añadida');
            newTaskTitle = '';
            showTaskForm = false;
            loadData();
        } catch (e) {
            toast.error('Error al crear tarea');
        }
    }

    async function toggleTask(task: any) {
        // Toggle UI immediately for responsiveness
        task.completed = !task.completed;
        tasks = tasks; // Trigger reactivity

        try {
            await updateDoc(doc(db, 'tasks', task.id), {
                completed: task.completed,
            });
            if (task.completed) toast.success('Tarea completada');
            loadData(); // Reload to sync generic
        } catch (e) {
            console.error(e);
            task.completed = !task.completed; // Revert
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
        <!-- Create Habit Card -->
        <div
            class="bg-[#0F172A] border border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all group"
        >
            {#if !showHabitForm}
                <button
                    on:click={() => (showHabitForm = true)}
                    class="w-full p-6 flex items-center justify-between text-left"
                >
                    <div class="flex items-center gap-4">
                        <div
                            class="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500"
                        >
                            <!-- Repeat Icon -->
                            <svg
                                class="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                /></svg
                            >
                        </div>
                        <span class="font-medium text-lg">Crea un hábito</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <div
                            class="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                            Añadir hábito
                        </div>
                    </div>
                </button>
            {:else}
                <div class="p-6 bg-orange-500/5 animate-fade-in">
                    <form on:submit|preventDefault={createHabit} class="flex gap-4">
                        <!-- svelte-ignore a11y-autofocus -->
                        <input
                            bind:value={newHabitTitle}
                            placeholder="Ej: Meditar 10 minutos..."
                            class="flex-1 bg-transparent border-b border-orange-500/30 py-2 text-lg focus:outline-none focus:border-orange-500 placeholder:text-slate-600"
                            autoFocus
                        />
                        <button
                            type="submit"
                            class="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold"
                            >Guardar</button
                        >
                        <button
                            type="button"
                            on:click={() => (showHabitForm = false)}
                            class="text-slate-500 hover:text-white">Cancelar</button
                        >
                    </form>
                </div>
            {/if}
        </div>

        <!-- Create Task Card -->
        <div
            class="bg-[#0F172A] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group"
        >
            {#if !showTaskForm}
                <button
                    on:click={() => (showTaskForm = true)}
                    class="w-full p-6 flex items-center justify-between text-left"
                >
                    <div class="flex items-center gap-4">
                        <div
                            class="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"
                        >
                            <!-- Check Icon -->
                            <svg
                                class="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                /></svg
                            >
                        </div>
                        <span class="font-medium text-lg">Crea una tarea</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <div
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                            Agregar tarea
                        </div>
                    </div>
                </button>
            {:else}
                <div class="p-6 bg-blue-500/5 animate-fade-in">
                    <form on:submit|preventDefault={createTask} class="flex gap-4">
                        <!-- svelte-ignore a11y-autofocus -->
                        <input
                            bind:value={newTaskTitle}
                            placeholder="Ej: Enviar reporte mensual..."
                            class="flex-1 bg-transparent border-b border-blue-500/30 py-2 text-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                            autoFocus
                        />
                        <button
                            type="submit"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold"
                            >Guardar</button
                        >
                        <button
                            type="button"
                            on:click={() => (showTaskForm = false)}
                            class="text-slate-500 hover:text-white">Cancelar</button
                        >
                    </form>
                </div>
            {/if}
        </div>

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
                                class="w-full text-left p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-4 group hover:bg-white/5 transition-all {task.completed
                                    ? 'opacity-50'
                                    : ''}"
                            >
                                <div
                                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors {task.completed
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
                                <span
                                    class="font-medium {task.completed
                                        ? 'line-through text-slate-500'
                                        : 'text-slate-200'}">{task.title}</span
                                >
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Locked Content Stub -->
        <div
            class="mt-8 p-4 rounded-xl border border-dashed border-white/10 flex items-center justify-center gap-3 text-slate-500 text-sm opacity-60"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                /></svg
            >
            <span>El nivel 2 desbloquea la comunidad</span>
        </div>
    </main>
</div>
