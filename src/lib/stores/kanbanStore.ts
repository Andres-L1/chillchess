import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { KanbanTask } from '$lib/types/kanban';
import { authStore } from '$lib/stores/authStore';
import { db } from '$lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'chillchess_kanban_tasks';

const defaultTasks: KanbanTask[] = [
    {
        id: '1',
        title: 'Explorar Herramientas',
        description: 'Prueba todas las funcionalidades de ChillChess como la Calculadora o este Tablero Kanban.',
        status: 'todo',
        tags: [{ id: 't1', text: 'Onboarding', color: 'blue' }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    {
        id: '2',
        title: 'Añadir mi primera tarea',
        description: 'Haz clic en el botón superior para crear una nueva tarjeta.',
        status: 'in-progress',
        tags: [{ id: 't2', text: 'Tip', color: 'amber' }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
    }
];

function createKanbanStore() {
    let initialTasks = defaultTasks;

    if (browser) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                initialTasks = JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing stored kanban tasks', e);
            }
        }
    }

    const { subscribe, set, update } = writable<KanbanTask[]>(initialTasks);

    let currentUid: string | null = null;
    let unsubscribeSnapshot: (() => void) | null = null;
    let isRemoteUpdate = false;

    if (browser) {
        authStore.subscribe(state => {
            const uid = state.user?.uid || null;
            if (uid !== currentUid) {
                currentUid = uid;
                if (unsubscribeSnapshot) {
                    unsubscribeSnapshot();
                    unsubscribeSnapshot = null;
                }

                if (uid) {
                    const kanbanRef = doc(db, 'users', uid, 'kanban', 'data');
                    unsubscribeSnapshot = onSnapshot(kanbanRef, (snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.data();
                            if (data && data.tasks) {
                                isRemoteUpdate = true;
                                set(data.tasks);
                                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.tasks));
                                setTimeout(() => isRemoteUpdate = false, 0);
                            }
                        }
                    });
                }
            }
        });
    }

    async function save(tasks: KanbanTask[]) {
        if (isRemoteUpdate) return;

        if (browser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        }
        set(tasks);

        const uid = currentUid || get(authStore).user?.uid;
        if (uid) {
            try {
                const kanbanRef = doc(db, 'users', uid, 'kanban', 'data');
                await setDoc(kanbanRef, { tasks }, { merge: true });
            } catch (error) {
                console.error('Error saving kanban to Firebase:', error);
            }
        }
    }

    return {
        subscribe,
        // id is optional to support both new tasks and undo-restore
        addTask: (task: { title: string; status: KanbanTask['status']; tags: KanbanTask['tags']; id?: string; description?: string }) => update(tasks => {
            const newTask: KanbanTask = {
                ...task,
                id: task.id ?? crypto.randomUUID(),
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            const newTasks = [...tasks, newTask];
            save(newTasks);
            return newTasks;
        }),
        updateTask: (id: string, updates: Partial<KanbanTask>) => update(tasks => {
            const newTasks = tasks.map(t =>
                t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
            );
            save(newTasks);
            return newTasks;
        }),
        deleteTask: (id: string) => update(tasks => {
            const newTasks = tasks.filter(t => t.id !== id);
            save(newTasks);
            return newTasks;
        }),
        moveTask: (id: string, newStatus: KanbanTask['status']) => update(tasks => {
            const newTasks = tasks.map(t =>
                t.id === id ? { ...t, status: newStatus, updatedAt: Date.now() } : t
            );
            save(newTasks);
            return newTasks;
        }),
        reorderTasks: (newTasks: KanbanTask[]) => {
            save(newTasks);
        }
    };
}

export const kanbanStore = createKanbanStore();
