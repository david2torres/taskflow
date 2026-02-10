import { SortBy, StatusFilter, TaskPriority } from "../types/task.type";

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

export interface TaskFilterState {
    status: StatusFilter;
    sortBy: SortBy;
    search: string;
}