import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type StatusFilter = 'all' | 'completed' | 'pending';
export type SortBy = 'title' | 'dueDate';

export interface TaskFilterState {
    status: StatusFilter;
    sortBy: SortBy;
    search: string;
}

@Component({
    selector: 'app-task-filters',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './task-filters.component.html',
    styleUrl: './task-filters.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFiltersComponent {
    @Input() status: StatusFilter = 'all';
    @Input() sortBy: SortBy = 'dueDate';
    @Input() search = '';

    @Output() filtersChange = new EventEmitter<TaskFilterState>();
    @Output() darkModeToggle = new EventEmitter<boolean>();

    darkMode = false;

    emit(): void {
        this.filtersChange.emit({
            status: this.status,
            sortBy: this.sortBy,
            search: this.search,
        });
    }

    toggleDark(): void {
        this.darkMode = !this.darkMode;
        this.darkModeToggle.emit(this.darkMode);
    }
}
