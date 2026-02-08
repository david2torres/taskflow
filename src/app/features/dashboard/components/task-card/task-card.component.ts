import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../../../shared/models/interface/task.interface';

@Component({
    selector: 'app-task-card',
    standalone: true,
    imports: [CommonModule, DatePipe],
    templateUrl: './task-card.component.html',
    styleUrl: './task-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
    @Input({ required: true }) task!: Task;

    @Output() toggle = new EventEmitter<number>();
    @Output() delete = new EventEmitter<number>();
    @Output() edit = new EventEmitter<number>();

    onToggle(): void { this.toggle.emit(this.task.id); }
    onDelete(): void { this.delete.emit(this.task.id); }
    onEdit(): void { this.edit.emit(this.task.id); }

    get priorityClass(): string {
        return this.task.priority ? `p-${this.task.priority}` : 'p-low';
    }
}
