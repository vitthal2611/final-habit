import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../core/services/habit.service';
import { CardComponent } from '../../shared/ui/card.component';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="calendar-view">
      <header>
        <h1>Check-in Calendar</h1>
        <p class="subtitle">Log past habits or bulk check-in</p>
      </header>

      <app-card>
        <div class="date-selector">
          <label>Select Date</label>
          <input 
            type="date" 
            [(ngModel)]="selectedDate"
            [max]="today"
            (change)="onDateChange()">
        </div>

        <div class="bulk-actions">
          <app-button (click)="checkInAll()" variant="primary">
            ✓ Check-in All for {{ formatDisplayDate() }}
          </app-button>
        </div>
      </app-card>

      <div class="habits-list">
        <app-card *ngFor="let habit of habits()">
          <div class="habit-item">
            <div class="habit-info">
              <div class="habit-color" [style.background]="habit.color"></div>
              <div>
                <h3>{{ habit.name }}</h3>
                <p class="identity">{{ habit.identity }}</p>
              </div>
            </div>
            
            <div class="habit-actions">
              <button 
                class="status-btn"
                [class.done]="getStatus(habit.id) === 'done'"
                [class.missed]="getStatus(habit.id) === 'missed'"
                (click)="toggleStatus(habit.id)">
                {{ getStatusLabel(habit.id) }}
              </button>
            </div>
          </div>
        </app-card>
      </div>

      <div class="week-view">
        <h2>This Week Overview</h2>
        <div class="week-grid">
          <div *ngFor="let day of weekDays()" class="day-column">
            <div class="day-header">
              <div class="day-name">{{ day.name }}</div>
              <div class="day-date">{{ day.date }}</div>
            </div>
            <div class="day-habits">
              <div 
                *ngFor="let habit of habits()"
                class="habit-dot"
                [class.completed]="isDayCompleted(habit.id, day.dateStr)"
                [style.background]="isDayCompleted(habit.id, day.dateStr) ? habit.color : '#e5e7eb'"
                [title]="habit.name">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-view {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      margin-bottom: 24px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .date-selector {
      margin-bottom: 16px;
    }

    .date-selector label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }

    input[type="date"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 15px;
    }

    .bulk-actions {
      margin-top: 16px;
    }

    .habits-list {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .habit-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .habit-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .habit-color {
      width: 4px;
      height: 40px;
      border-radius: 2px;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .identity {
      font-size: 13px;
      color: #6b7280;
      font-style: italic;
      margin: 0;
    }

    .status-btn {
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      color: #6b7280;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .status-btn.done {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }

    .status-btn.missed {
      background: #f3f4f6;
      color: #9ca3af;
      border-color: #e5e7eb;
    }

    .week-view {
      margin-top: 32px;
    }

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 16px 0;
    }

    .week-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }

    .day-column {
      background: white;
      border-radius: 8px;
      padding: 12px 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .day-header {
      text-align: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f3f4f6;
    }

    .day-name {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
    }

    .day-date {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
    }

    .day-habits {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .habit-dot {
      height: 24px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .habit-dot.completed {
      opacity: 1;
    }

    @media (max-width: 640px) {
      .week-grid {
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
      }

      .day-column {
        padding: 8px 4px;
      }

      .habit-dot {
        height: 16px;
      }
    }
  `]
})
export class CalendarComponent {
  selectedDate = this.formatDate(new Date());
  today = this.formatDate(new Date());
  
  habits = computed(() => this.habitService.allHabits());

  constructor(private habitService: HabitService) {}

  weekDays = computed(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        dateStr: this.formatDate(date)
      });
    }
    
    return days;
  });

  onDateChange() {
    // Trigger UI update
  }

  getStatus(habitId: string): string {
    return this.habitService.getHabitState(habitId, this.selectedDate);
  }

  getStatusLabel(habitId: string): string {
    const status = this.getStatus(habitId);
    if (status === 'done') return '✓ Done';
    if (status === 'missed') return 'Skipped';
    return 'Pending';
  }

  toggleStatus(habitId: string) {
    const current = this.getStatus(habitId);
    
    if (current === 'pending') {
      this.habitService.logHabit(habitId, this.selectedDate, true);
    } else if (current === 'done') {
      this.habitService.logHabit(habitId, this.selectedDate, false);
    } else {
      this.habitService.logHabit(habitId, this.selectedDate, true);
    }
  }

  checkInAll() {
    this.habits().forEach(habit => {
      this.habitService.logHabit(habit.id, this.selectedDate, true);
    });
  }

  isDayCompleted(habitId: string, dateStr: string): boolean {
    return this.habitService.getHabitState(habitId, dateStr) === 'done';
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatDisplayDate(): string {
    const date = new Date(this.selectedDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
