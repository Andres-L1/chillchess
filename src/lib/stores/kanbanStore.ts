import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { KanbanTask } from '$lib/types/kanban';

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

    function save(tasks: KanbanTask[]) {
        if (browser) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        }
        set(tasks);
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
