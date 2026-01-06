import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HabitService } from '../../core/services/habit.service';
import { HabitCardModernComponent } from './habit-card/habit-card-modern.component';

@Component({
  selector: 'app-daily-view',
  standalone: true,
  imports: [CommonModule, HabitCardModernComponent],
  template: `
    <div class="daily-view">
      <header class="header">
        <h1>Today</h1>
        <p class="date">{{ today() | date:'EEEE, MMMM d' }}</p>
      </header>

      <div class="loading" *ngIf="!habitService.isLoaded()">
        <div class="spinner"></div>
        <p>Loading habits...</p>
      </div>

      <div class="habits-list" *ngIf="habitService.isLoaded()">
        <app-habit-card-modern
          *ngFor="let habit of todayHabits()"
          [habit]="habit"
          [state]="getHabitState(habit.id)"
          [weeklyConsistency]="getWeeklyConsistency(habit.id)"
          [habitService]="habitService"
          (complete)="onComplete(habit.id)"
          (edit)="onEdit($event)"
          (delete)="onDelete($event)">
        </app-habit-card-modern>

        <div *ngIf="todayHabits().length === 0" class="empty-state">
          <div class="empty-icon">✨</div>
          <h2>Start Your Journey</h2>
          <p class="empty-text">No habits for today. Build better habits, one day at a time.</p>
          <button class="create-btn" (click)="createHabit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Your First Habit
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .daily-view {
      max-width: 600px;
      margin: 0 auto;
      padding: 16px;
    }

    .header {
      margin-bottom: 24px;
      padding: 8px 0;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .date {
      font-size: 15px;
      color: #6b7280;
      margin: 0;
    }

    .habits-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .empty-icon {
      font-size: 56px;
      margin-bottom: 20px;
    }

    .empty-state h2 {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .empty-text {
      font-size: 15px;
      color: #6b7280;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .create-btn {
      padding: 14px 24px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
      -webkit-tap-highlight-color: transparent;
    }

    .create-btn:active {
      transform: scale(0.95);
    }

    .create-btn:hover {
      background: #4f46e5;
      box-shadow: 0 6px 16px rgba(99,102,241,0.4);
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading p {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (min-width: 768px) {
      .daily-view {
        padding: 24px;
      }

      .header {
        margin-bottom: 32px;
      }

      h1 {
        font-size: 32px;
      }

      .date {
        font-size: 16px;
      }

      .habits-list {
        gap: 16px;
      }

      .empty-state {
        padding: 80px 20px;
        border-radius: 20px;
      }

      .empty-icon {
        font-size: 64px;
        margin-bottom: 24px;
      }

      .empty-state h2 {
        font-size: 24px;
        margin: 0 0 12px 0;
      }

      .empty-text {
        font-size: 16px;
        margin: 0 0 32px 0;
      }

      .create-btn {
        padding: 14px 28px;
        font-size: 16px;
      }
    }
  `]
})
export class DailyViewComponent {
  today = signal(new Date());
  
  todayHabits = computed(() => {
    const dayOfWeek = this.today().getDay();
    const dateStr = this.formatDate(this.today());
    return this.habitService.allHabits().filter(habit => {
      const isScheduledToday = habit.frequency === 'daily' || 
        (Array.isArray(habit.frequency) && habit.frequency.includes(dayOfWeek));
      const state = this.habitService.getHabitState(habit.id, dateStr);
      return isScheduledToday && state !== 'done';
    });
  });

  constructor(public habitService: HabitService, private router: Router) {}

  createHabit() {
    this.router.navigate(['/create']);
  }

  getHabitState(habitId: string) {
    return this.habitService.getHabitState(habitId, this.formatDate(this.today()));
  }

  getWeeklyConsistency(habitId: string) {
    return this.habitService.getWeeklyConsistency(habitId, this.today());
  }

  getNote(habitId: string): string {
    const log = this.habitService.allLogs().find(
      l => l.habitId === habitId && l.date === this.formatDate(this.today())
    );
    return log?.note || '';
  }

  onComplete(habitId: string) {
    this.habitService.logHabit(habitId, this.formatDate(this.today()), true);
  }

  onEdit(habitId: string) {
    this.router.navigate(['/create'], { queryParams: { id: habitId } });
  }

  onDelete(habitId: string) {
    this.habitService.deleteHabit(habitId);
  }

  onNoteChange(habitId: string, note: string) {
    const currentState = this.getHabitState(habitId);
    this.habitService.logHabit(
      habitId, 
      this.formatDate(this.today()), 
      currentState === 'done',
      note
    );
  }

  onMilestoneAdd(habitId: string, count: number) {
    const dateStr = this.formatDate(this.today());
    const log = this.habitService.allLogs().find(
      l => l.habitId === habitId && l.date === dateStr
    );
    
    this.habitService.logHabit(
      habitId,
      dateStr,
      true,
      log?.note,
      count
    );
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
