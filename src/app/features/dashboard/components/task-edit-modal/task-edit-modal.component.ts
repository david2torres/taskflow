import { Component, ChangeDetectionStrategy, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../../../shared/models/interface/task.interface';

@Component({
    selector: 'app-task-edit-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './task-edit-modal.component.html',
    styleUrl: './task-edit-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskEditModalComponent {
    private readonly fb = inject(FormBuilder);

    @Input({ required: true }) task!: Task | null;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<{ id: number; title: string }>();

    readonly form = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(3)]],
    });

    ngOnChanges(): void {
        if (this.task) this.form.patchValue({ title: this.task.title });
    }

    onBackdrop(): void { this.close.emit(); }
    onClose(): void { this.close.emit(); }

    onSave(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        if (this.task) {
            this.save.emit({ id: this.task?.id, title: this.form.getRawValue().title! });
        }
    }
}
