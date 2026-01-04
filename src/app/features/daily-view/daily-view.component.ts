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

      <div class="habits-list">
        <app-habit-card-modern
          *ngFor="let habit of todayHabits()"
          [habit]="habit"
          [state]="getHabitState(habit.id)"
          [weeklyConsistency]="getWeeklyConsistency(habit.id)"
          [habitService]="habitService"
          (complete)="onComplete(habit.id)">
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
      padding: 20px;
    }

    .header {
      margin-bottom: 32px;
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .date {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }

    .habits-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }

    .empty-state h2 {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 12px 0;
    }

    .empty-text {
      font-size: 16px;
      color: #6b7280;
      margin: 0 0 32px 0;
    }

    .create-btn {
      padding: 14px 28px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }

    .create-btn:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99,102,241,0.4);
    }
  `]
})
export class DailyViewComponent {
  today = signal(new Date());
  
  todayHabits = computed(() => {
    const dayOfWeek = this.today().getDay();
    return this.habitService.allHabits().filter(habit => {
      if (habit.frequency === 'daily') return true;
      return Array.isArray(habit.frequency) && habit.frequency.includes(dayOfWeek);
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
