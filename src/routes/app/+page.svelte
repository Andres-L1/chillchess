<script lang="ts">
    import { onMount } from 'svelte';
    import { userStore } from '$lib/auth/userStore';
    import { db } from '$lib/firebase';
    import {
        collection,
        query,
        where,
        getDocs,
        addDoc,
        serverTimestamp,
        updateDoc,
        doc,
        deleteDoc,
        deleteField,
    } from 'firebase/firestore';
    import { toast } from '$lib/stores/notificationStore';
    import { trackActivity } from '$lib/utils/activity';
    import BackIcon from '$lib/components/icons/BackIcon.svelte';
    import {
        registerServiceWorker,
        requestNotificationPermission,
        scheduleHabitNotification,
        cancelHabitNotification,
        showTestNotification,
    } from '$lib/notifications';

    import type { Habit } from '$lib/types/habit';
    import { HabitType, DayType } from '$lib/types/habit';
    import { calculateCurrentStreak, calculateTopStreak } from '$lib/utils/habitStats';

    // Components
    import GreetingHeader from './components/GreetingHeader.svelte';
    import HabitsWidget from './components/HabitsWidget.svelte';
    import HabitModal from './components/HabitModal.svelte';
    import OnboardingTour from './components/OnboardingTour.svelte';

    let habits: Habit[] = [];
    let loading = true;
    let activeFilter = 'all';

    $: filteredHabits = habits.filter((h) => {
        if (activeFilter === 'all') return true;
        return h.timeOfDay === activeFilter || h.timeOfDay === 'Cualquiera' || !h.timeOfDay;
    });

    // Stats
    $: activeHabitsCount = habits.filter((h) => !h.archived).length;
    $: totalStreak = habits.reduce((acc, h) => acc + (h.currentStreak || 0), 0);

    // Modals
    let showHabitModal = false;
    let editingHabit: Habit | null = null;
    let showDeleteConfirm = false;

    // Onboarding Tour
    let showTour = false;
    const TOUR_COMPLETED_KEY = 'chillchess-app-tour-completed';

    // Defaults
    const defaultHabit: Partial<Habit> = {
        title: '',
        habitType: HabitType.BOOLEAN,
        twoDayRule: true,
        archived: false,
        advanced: false,
        notification: false,
        showSanction: false,
        events: {},
        currentStreak: 0,
        topStreak: 0,
        position: 0,
        timeOfDay: 'Cualquiera',
        frequency: 'A diario',
        color: 'orange',
    };

    let formDataHabit: Partial<Habit> = { ...defaultHabit };

    async function loadData() {
        if (!$userStore.user) return;
        loading = true;
        try {
            const qHabits = query(
                collection(db, 'habits'),
                where('userId', '==', $userStore.user.uid)
            );
            const habitsSnap = await getDocs(qHabits);
            habits = habitsSnap.docs
                .map((doc) => {
                    const data = doc.data();
                    const habit: Habit = {
                        id: doc.id,
                        userId: data.userId,
                        title: data.title,
                        habitType: data.habitType || HabitType.BOOLEAN,
                        twoDayRule: data.twoDayRule ?? true,
                        archived: data.archived || false,
                        advanced: data.advanced || false,
                        notification: data.notification || false,
                        showSanction: data.showSanction || false,
                        events: data.events || {},
                        currentStreak: 0,
                        topStreak: 0,
                        position: data.position || 0,
                        createdAt: data.createdAt,
                        timeOfDay: data.timeOfDay,
                        frequency: data.frequency,
                        color: data.color,
                        targetValue: data.targetValue,
                        partialValue: data.partialValue,
                        unit: data.unit,
                        cue: data.cue,
                        routine: data.routine,
                        reward: data.reward,
                        sanction: data.sanction,
                        accountant: data.accountant,
                        notTime: data.notTime,
                    };

                    habit.currentStreak = calculateCurrentStreak(habit);
                    habit.topStreak = calculateTopStreak(habit);

                    return habit;
                })
                .sort((a, b) => a.position - b.position);
        } catch (e) {
            console.error('Error loading data', e);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        if ($userStore.user) {
            loadData();
            trackActivity($userStore.user.uid);

            // Registrar Service Worker para notificaciones locales
            registerServiceWorker().then(() => {
                console.log('Service Worker ready for local notifications');
            });

            // Check if user has completed tour
            const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
            if (!tourCompleted) {
                setTimeout(() => {
                    showTour = true;
                }, 500);
            }
        }
    });

    function completeTour() {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        showTour = false;
    }

    import { userSubscription } from '$lib/subscription/userSubscription';
    import PaywallModal from '$lib/components/PaywallModal.svelte';

    let showPaywall = false;
    $: isPro = ['pro', 'premium', 'lifetime'].includes($userSubscription.tier);

    function openHabitModal(habit: Habit | null) {
        if (!habit && !isPro && activeHabitsCount >= 2) {
            showPaywall = true;
            return;
        }

        editingHabit = habit;
        if (habit) {
            formDataHabit = { ...habit };
        } else {
            formDataHabit = {
                ...defaultHabit,
                position: habits.length,
            };
        }
        showHabitModal = true;
    }

    async function saveHabit() {
        if (!formDataHabit.title?.trim() || !$userStore.user) return;

        try {
            const habitData = {
                ...formDataHabit,
                userId: $userStore.user.uid,
            };

            let habitId = editingHabit?.id;

            if (editingHabit) {
                await updateDoc(doc(db, 'habits', editingHabit.id), habitData);
                toast.success('Hábito actualizado');
            } else {
                const docRef = await addDoc(collection(db, 'habits'), {
                    ...habitData,
                    createdAt: serverTimestamp(),
                });
                habitId = docRef.id;
                toast.success('Hábito creado');
                trackActivity($userStore.user.uid);
            }

            showHabitModal = false;
            loadData();

            // Programar notificación local si está activada
            if (formDataHabit.notification && formDataHabit.notTime && habitId) {
                const success = await scheduleHabitNotification(
                    habitId,
                    formDataHabit.title,
                    formDataHabit.notTime
                );

                if (success) {
                    toast.success('Recordatorio programado');
                } else {
                    toast.error('No se pudo programar el recordatorio');
                }
            } else if (!formDataHabit.notification && habitId) {
                // Cancelar notificación si se desactivó
                await cancelHabitNotification(habitId);
            }
        } catch (e) {
            console.error(e);
            toast.error('Error al guardar');
        }
    }

    function requestDelete() {
        if (!editingHabit) return;
        showDeleteConfirm = true;
    }

    async function confirmDelete() {
        if (!editingHabit) return;
        try {
            await deleteDoc(doc(db, 'habits', editingHabit.id));
            toast.success('Hábito eliminado');
            showDeleteConfirm = false;
            showHabitModal = false;
            loadData();
        } catch (e) {
            toast.error('Error al eliminar');
        }
    }

    async function toggleHabitDay(habit: Habit, dateStr: string, currentType: DayType) {
        const cycle = [DayType.CLEAR, DayType.CHECK, DayType.FAIL, DayType.SKIP];
        const currentIndex = cycle.indexOf(currentType);
        const nextType = cycle[(currentIndex + 1) % cycle.length];

        let actualNextType = nextType;
        let eventValue: number | undefined = undefined;

        if (habit.habitType === HabitType.NUMERIC && currentType === DayType.CLEAR) {
            actualNextType = DayType.PROGRESS;
            eventValue = habit.partialValue || 1;
        }

        const newEvents = { ...habit.events };

        if (actualNextType === DayType.CLEAR) {
            delete newEvents[dateStr];
        } else {
            const newEvent: any = {
                date: dateStr,
                type: actualNextType,
            };
            if (eventValue !== undefined) {
                newEvent.value = eventValue;
            }
            newEvents[dateStr] = newEvent;
        }

        habit.events = newEvents;
        habit.currentStreak = calculateCurrentStreak(habit);
        habit.topStreak = calculateTopStreak(habit);
        habits = habits;

        try {
            if (actualNextType === DayType.CLEAR) {
                await updateDoc(doc(db, 'habits', habit.id), {
                    [`events.${dateStr}`]: deleteField(),
                    currentStreak: habit.currentStreak,
                    topStreak: habit.topStreak,
                });
            } else {
                await updateDoc(doc(db, 'habits', habit.id), {
                    [`events.${dateStr}`]: newEvents[dateStr],
                    currentStreak: habit.currentStreak,
                    topStreak: habit.topStreak,
                });

                if (actualNextType === DayType.CHECK) {
                    toast.success('¡Completado! 🔥');
                } else if (actualNextType === DayType.FAIL) {
                    toast.info('Marcado como fallido');
                } else if (actualNextType === DayType.SKIP) {
                    toast.info('Saltado (no afecta racha)');
                }

                if ($userStore.user) trackActivity($userStore.user.uid);
            }
        } catch (e) {
            console.error(e);
            loadData();
            toast.error('Error al actualizar');
        }
    }

    // Solicitar permisos de notificaciones y mostrar test
    async function enableNotifications() {
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
            await showTestNotification();
            toast.success('¡Notificaciones activadas!');
        } else {
            toast.error('Permiso de notificaciones denegado');
        }
    }
</script>

<div
    class="min-h-screen bg-[#0B1120] text-slate-200 font-poppins selection:bg-orange-500/30 p-4 md:p-8"
>
    <header class="max-w-7xl mx-auto">
        <a
            href="/"
            class="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors text-xs font-bold uppercase tracking-wider"
        >
            <BackIcon size="sm" />
            <span>Volver</span>
        </a>

        <GreetingHeader />
    </header>

    <main class="max-w-4xl mx-auto pb-24 relative">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between mb-2" data-tour="stats">
                <h1
                    class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500"
                >
                    Mis Hábitos
                </h1>

                <!-- Botón de notificaciones -->
                <button
                    data-tour="notification-btn"
                    on:click={enableNotifications}
                    class="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                    title="Activar recordatorios"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                    Recordatorios
                </button>
            </div>

            <div class="flex items-center gap-2 overflow-x-auto pb-2 noscroll">
                <button
                    on:click={() => (activeFilter = 'all')}
                    class="px-5 py-2 rounded-full font-semibold text-sm transition-all {activeFilter ===
                    'all'
                        ? 'bg-white text-black scale-105'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'}"
                >
                    Todo
                </button>
                <button
                    on:click={() => (activeFilter = 'Mañana')}
                    class="px-5 py-2 rounded-full font-semibold text-sm transition-all {activeFilter ===
                    'Mañana'
                        ? 'bg-white text-black scale-105'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'}"
                >
                    Mañana
                </button>
                <button
                    on:click={() => (activeFilter = 'Tarde')}
                    class="px-5 py-2 rounded-full font-semibold text-sm transition-all {activeFilter ===
                    'Tarde'
                        ? 'bg-white text-black scale-105'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'}"
                >
                    Tarde
                </button>
                <button
                    on:click={() => (activeFilter = 'Noche')}
                    class="px-5 py-2 rounded-full font-semibold text-sm transition-all {activeFilter ===
                    'Noche'
                        ? 'bg-white text-black scale-105'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'}"
                >
                    Noche
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div data-tour="habits-list">
            <HabitsWidget
                habits={filteredHabits}
                onOpenModal={openHabitModal}
                onToggleDay={toggleHabitDay}
            />
        </div>
    </main>

    <!-- FAB -->
    <button
        data-tour="new-habit"
        on:click={() => openHabitModal(null)}
        class="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-full shadow-lg shadow-orange-500/20 flex items-center justify-center text-black transition-transform hover:scale-105 active:scale-95 z-50"
    >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M12 4v16m8-8H4"
            />
        </svg>
    </button>

    <!-- Modal -->
    <HabitModal
        bind:show={showHabitModal}
        isEditing={!!editingHabit}
        bind:formData={formDataHabit}
        onClose={() => (showHabitModal = false)}
        onSave={saveHabit}
        onDelete={requestDelete}
    />

    <!-- Delete Confirmation Modal -->
    {#if showDeleteConfirm}
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <!-- Backdrop -->
            <button
                class="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-sm border-0 cursor-default"
                on:click={() => (showDeleteConfirm = false)}
                aria-label="Cerrar confirmación"
            />

            <div
                class="relative bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
            >
                <div class="flex items-center gap-4 mb-6">
                    <div
                        class="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center"
                    >
                        <svg
                            class="w-6 h-6 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 id="delete-modal-title" class="text-xl font-bold text-white">
                            ¿Eliminar hábito?
                        </h3>
                        <p class="text-sm text-slate-400 mt-1">Esta acción no se puede deshacer</p>
                    </div>
                </div>

                <p class="text-slate-300 mb-6">
                    Se eliminará <span class="font-semibold text-orange-400"
                        >"{editingHabit?.title}"</span
                    > y todo su historial de progreso.
                </p>

                <div class="flex gap-3">
                    <button
                        on:click={() => (showDeleteConfirm = false)}
                        class="flex-1 px-4 py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        on:click={confirmDelete}
                        class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/20"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <PaywallModal
        bind:show={showPaywall}
        title="Límite de Hábitos Pro"
        message="Has alcanzado el límite de 2 hábitos activos. Suscríbete a PRO para desbloquear hábitos ilimitados."
    />

    <!-- Onboarding Tour -->
    {#if showTour}
        <OnboardingTour on:complete={completeTour} />
    {/if}
</div>
