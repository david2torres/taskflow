import { TaskPriority } from "../types/task.type";

export interface Task {
    id: number;
    title: string;
    completed: boolean;
    userId: number;
    priority?: TaskPriority;
    dueDate?: string;
}

export interface JsonPlaceholderTodo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
}