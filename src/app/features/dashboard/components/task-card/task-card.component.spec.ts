import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCardComponent } from './task-card.component';
import { By } from '@angular/platform-browser';
import { Task } from '../../../../shared/models/interface/task.interface';

describe('TaskCardComponent', () => {
    let fixture: ComponentFixture<TaskCardComponent>;
    let component: TaskCardComponent;

    const task: Task = {
        id: 1,
        userId: 1,
        title: 'Test task',
        completed: false,
        priority: 'high',
        dueDate: new Date().toISOString(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TaskCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TaskCardComponent);
        component = fixture.componentInstance;
        component.task = task;
        fixture.detectChanges();
    });

    it('should render the task title', () => {
        const h3 = fixture.debugElement.query(By.css('h3')).nativeElement as HTMLElement;
        expect(h3.textContent).toContain('Test task');
    });

    it('should emit toggle when checkbox changes', () => {
        spyOn(component.toggle, 'emit');
        const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement as HTMLInputElement;
        checkbox.click();
        expect(component.toggle.emit).toHaveBeenCalledWith(1);
    });
});
