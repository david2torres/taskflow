import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskFilterState } from '../../../../shared/models/interface/task.interface';
import { StatusFilter, SortBy } from '../../../../shared/models/types/task.type';

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
