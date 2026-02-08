import { Injectable, computed, effect, signal } from '@angular/core';
import { Task } from '../../../shared/models/interface/task.interface';
import { LoadStatus } from '../../../shared/models/types/task.type';



@Injectable({ providedIn: 'root' })
export class TaskStore {
    private readonly _tasks = signal<Task[]>([]);
    private readonly _status = signal<LoadStatus>('idle');
    private readonly _error = signal<string>('');

    readonly tasks = computed(() => this._tasks());
    readonly status = computed(() => this._status());
    readonly error = computed(() => this._error());

    readonly total = computed(() => this._tasks().length);

    setLoading(): void {
        this._status.set('loading');
        this._error.set('');
    }

    setError(message: string): void {
        this._status.set('error');
        this._error.set(message);
    }

    setTasks(tasks: Task[]): void {
        this._tasks.set(tasks);
        this._status.set('success');
        this._error.set('');
    }

    toggleCompleted(taskId: number): void {
        this._tasks.update(list =>
            list.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
        );
    }

    updateTitle(taskId: number, title: string): void {
        this._tasks.update(list =>
            list.map(t => (t.id === taskId ? { ...t, title } : t))
        );
    }

    delete(taskId: number): void {
        this._tasks.update(list => list.filter(t => t.id !== taskId));
    }
}
