import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, retry, throwError, timer } from 'rxjs';
import { JsonPlaceholderTodo, Task } from '../../../shared/models/interface/task.interface';
import { TaskPriority } from '../../../shared/models/types/task.type';


@Injectable({ providedIn: 'root' })
export class TaskService {
    private readonly baseUrl = 'https://jsonplaceholder.typicode.com';

    constructor(private http: HttpClient) { }

    getTasks(): Observable<Task[]> {
        return this.http.get<JsonPlaceholderTodo[]>(`${this.baseUrl}/todos`).pipe(
            retry({
                count: 3,
                delay: (_err, retryCount) => {
                    const ms = 300 * Math.pow(2, retryCount - 1);
                    return timer(ms);
                },
            }),
            map((todos) => todos.map((t) => this.enrichTask(t))),
            catchError((err) => throwError(() => err))
        );
    }

    private enrichTask(todo: JsonPlaceholderTodo): Task {
        return {
            id: todo.id,
            title: todo.title,
            completed: todo.completed,
            userId: todo.userId,
            priority: this.pickPriority(todo.id),
            dueDate: this.makeDueDate(todo.id),
        };
    }

    private pickPriority(seed: number): TaskPriority {
        const r = seed % 3;
        return r === 0 ? 'low' : r === 1 ? 'medium' : 'high';
    }

    private makeDueDate(seed: number): string {
        const now = new Date();
        const daysToAdd = seed % 30;
        const due = new Date(now);
        due.setDate(now.getDate() + daysToAdd);
        due.setHours(0, 0, 0, 0);
        return due.toISOString();
    }
}
