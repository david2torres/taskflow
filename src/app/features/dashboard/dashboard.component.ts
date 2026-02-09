import { Component, ChangeDetectionStrategy, DestroyRef, computed, effect, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, Subject, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskFiltersComponent } from './components/task-filters/task-filters.component';
import { TaskCardComponent } from './components/task-card/task-card.component';
import { TaskEditModalComponent } from './components/task-edit-modal/task-edit-modal.component';
import { TaskStore } from '../../core/applications/store/task.store';
import { AuthService } from '../../core/infrastructure/auth/auth.service';
import { TaskService } from '../../core/infrastructure/services/task.service';
import { Task } from '../../shared/models/interface/task.interface';
import { SortBy, StatusFilter } from '../../shared/models/types/task.type';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, TaskFiltersComponent, TaskCardComponent, TaskEditModalComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnDestroy {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);

    private readonly taskService = inject(TaskService);
    private readonly store = inject(TaskStore);
    private readonly auth = inject(AuthService);


    readonly status = signal<StatusFilter>('all');
    readonly sortBy = signal<SortBy>('dueDate');
    readonly search = signal<string>('');
    readonly page = signal<number>(1);
    readonly pageSize = 10;
    readonly editId = signal<number | null>(null);
    readonly darkMode = signal<boolean>(false);
    private readonly searchInput$ = new Subject<string>();
    readonly tasks = this.store.tasks;
    readonly loading = computed(() => this.store.status() === 'loading');
    readonly error = computed(() => this.store.error());
    private cancel$ = new Subject<void>();

    readonly filteredSorted = computed(() => {
        const tasks = this.tasks();
        const status = this.status();
        const sortBy = this.sortBy();
        const q = this.search().trim().toLowerCase();

        let out = tasks;

        if (status === 'completed') out = out.filter(t => t.completed);
        if (status === 'pending') out = out.filter(t => !t.completed);
        if (q) out = out.filter(t => (t.title || '').toLowerCase().includes(q));

        out = [...out].sort((a, b) => {
            if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
            const ad = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const bd = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            return ad - bd;
        });

        return out;
    });

    readonly totalPages = computed(() => {
        const total = this.filteredSorted().length;
        return Math.max(1, Math.ceil(total / this.pageSize));
    });

    readonly pagedTasks = computed(() => {
        const p = this.page();
        const list = this.filteredSorted();
        const start = (p - 1) * this.pageSize;
        return list.slice(start, start + this.pageSize);
    });

    readonly editTask = computed<Task | null>(() => {
        const id = this.editId();
        if (!id) return null;
        return this.tasks().find(t => t.id === id) ?? null;
    });

    private abortController: AbortController | null = null;

    constructor() {
        this.route.queryParamMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((qpm) => {
                this.status.set((qpm.get('status') as StatusFilter) || 'all');
                this.sortBy.set((qpm.get('sort') as SortBy) || 'dueDate');
                this.search.set(qpm.get('q') || '');
                this.page.set(Math.max(1, Number(qpm.get('page') || 1)));

                const editId = qpm.get('editId');
                this.editId.set(editId ? Number(editId) : null);
            });

        this.searchInput$
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((value) => {
                this.patchQueryParams({ q: value, page: 1 });
            });
        this.loadTasks();
        effect(() => {
            const totalPages = this.totalPages();
            const current = this.page();
            if (current > totalPages) this.patchQueryParams({ page: totalPages });
        });

        const saved = localStorage.getItem('taskflow_dark') === '1';
        this.setDarkMode(saved);
    }
    ngOnDestroy(): void {
        this.cancel$.next();
        this.cancel$.complete();
    }

    loadTasks(): void {
        this.cancel$.next();

        this.store.setLoading();

        this.taskService
            .getTasks()
            .pipe(takeUntil(this.cancel$))
            .subscribe({
                next: (tasks) => this.store.setTasks(tasks),
                error: () =>
                    this.store.setError('Failed to load tasks (after retries).'),
            });
    }

    onFiltersChange(e: { status: StatusFilter; sortBy: SortBy; search: string }): void {
        this.patchQueryParams({
            status: e.status,
            sort: e.sortBy,
            page: 1,
        });
        this.searchInput$.next(e.search);
    }

    prev(): void {
        const p = this.page();
        this.patchQueryParams({ page: Math.max(1, p - 1) });
    }

    next(): void {
        const p = this.page();
        const max = this.totalPages();
        this.patchQueryParams({ page: Math.min(max, p + 1) });
    }

    onToggle(taskId: number): void {
        this.store.toggleCompleted(taskId);
    }

    onDelete(taskId: number): void {
        this.store.delete(taskId);
    }

    openEdit(taskId: number): void {
        this.patchQueryParams({ editId: taskId });
    }

    closeEdit(): void {
        this.patchQueryParams({ editId: null });
    }

    saveEdit(payload: { id: number; title: string }): void {
        this.store.updateTitle(payload.id, payload.title);
        this.closeEdit();
    }

    logout(): void {
        this.abortController?.abort();
        this.auth.logout();
    }

    setDarkMode(on: boolean): void {
        this.darkMode.set(on);
        document.documentElement.dataset['theme'] = on ? 'dark' : 'light';
        localStorage.setItem('taskflow_dark', on ? '1' : '0');
    }

    onDarkModeToggle(on: boolean): void {
        this.setDarkMode(on);
    }

    trackById(_i: number, t: Task): number {
        return t.id;
    }

    private patchQueryParams(patch: Record<string, any>): void {
        const cleaned: Record<string, any> = {};
        for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === undefined || v === '') cleaned[k] = null;
            else cleaned[k] = v;
        }

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: cleaned,
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }
}
