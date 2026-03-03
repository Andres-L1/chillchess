export type TagColor = 'slate' | 'red' | 'orange' | 'amber' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';

export interface KanbanTag {
    id: string;
    text: string;
    color: TagColor;
}

export interface KanbanTask {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    tags: KanbanTag[];
    createdAt: number;
    updatedAt: number;
}
