import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HabitService } from '../../core/services/habit.service';
import { HabitCardDesign3Component } from './habit-card/habit-card-design3.component';

@Component({
  selector: 'app-daily-view-demo',
  standalone: true,
  imports: [CommonModule, HabitCardDesign3Component],
  template: `
    <div class="daily-view">
      <header class="header">
        <div class="date-section">
          <button class="nav-btn" (click)="previousDay()" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="date-content">
            <h1>{{ getDateLabel() }}</h1>
            <p class="date-subtitle">{{ today() | date:'EEEE, MMMM d' }}</p>
          </div>
          <button class="nav-btn" (click)="nextDay()" [disabled]="isToday()" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </header>

      <div class="habits-container">
        <div class="habits-grid">
          <app-habit-card-design3
            *ngFor="let habit of todayHabits()"
            [habit]="habit"
            [currentDate]="today()"
            [state]="getHabitState(habit.id)"
            [weeklyConsistency]="getWeeklyConsistency(habit.id)"
            [metrics]="getHabitMetrics(habit.id)"
            (complete)="onComplete(habit.id)"
            (skip)="onSkip(habit.id)"
            (undo)="onUndo(habit.id)"
            (edit)="onEdit(habit.id)"
            (delete)="onDelete(habit.id)">
          </app-habit-card-design3>
        </div>

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
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f8fafc;
      min-height: 100vh;
    }

    .header {
      margin-bottom: 32px;
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      border: 1px solid #f1f5f9;
    }

    .date-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .date-content {
      text-align: center;
      flex: 1;
    }

    .nav-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      background: #f8fafc;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      border: 1px solid #e2e8f0;
    }

    .nav-btn:hover:not(:disabled) {
      background: #f1f5f9;
      color: #475569;
    }

    .nav-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 4px 0;
      letter-spacing: -0.5px;
    }

    .date-subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      font-weight: 400;
    }

    .habits-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .habits-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 16px;
      border: 1px solid #f1f5f9;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    .empty-state h2 {
      font-size: 20px;
      font-weight: 600;
      color: #334155;
      margin: 0 0 8px 0;
    }

    .empty-text {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .create-btn {
      padding: 12px 24px;
      background: #0f172a;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .create-btn:hover {
      background: #1e293b;
    }

    @media (min-width: 640px) {
      .habits-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
    }

    @media (min-width: 1024px) {
      .daily-view {
        padding: 32px;
      }

      .header {
        padding: 24px;
      }

      h1 {
        font-size: 28px;
      }

      .date-subtitle {
        font-size: 15px;
      }
    }
  `]
})
export class DailyViewDemoComponent {
  today = signal(new Date());
  
  todayHabits = computed(() => {
    const dayOfWeek = this.today().getDay();
    const dateStr = this.formatDate(this.today());
    return this.habitService.allHabits()
      .filter(habit => {
        const isScheduledToday = habit.frequency === 'daily' || 
          (Array.isArray(habit.frequency) && habit.frequency.includes(dayOfWeek));
        const startDate = habit.startDate || new Date(this.today().getFullYear(), 0, 1).toISOString().split('T')[0];
        const isAfterStart = dateStr >= startDate;
        return isScheduledToday && isAfterStart;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  });

  constructor(public habitService: HabitService, private router: Router) {}

  previousDay() {
    const newDate = new Date(this.today());
    newDate.setDate(newDate.getDate() - 1);
    this.today.set(newDate);
  }

  nextDay() {
    if (!this.isToday()) {
      const newDate = new Date(this.today());
      newDate.setDate(newDate.getDate() + 1);
      this.today.set(newDate);
    }
  }

  isToday(): boolean {
    const now = new Date();
    return this.formatDate(this.today()) === this.formatDate(now);
  }

  getDateLabel(): string {
    if (this.isToday()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (this.formatDate(this.today()) === this.formatDate(yesterday)) return 'Yesterday';
    return this.today().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  createHabit() {
    this.router.navigate(['/create']);
  }

  getHabitState(habitId: string) {
    return this.habitService.getHabitState(habitId, this.formatDate(this.today()));
  }

  getWeeklyConsistency(habitId: string) {
    return this.habitService.getWeeklyConsistency(habitId, this.today());
  }

  getHabitMetrics(habitId: string) {
    const logs = this.habitService.allLogs().filter(l => l.habitId === habitId);
    const completedLogs = logs.filter(l => l.completed);
    const skippedLogs = logs.filter(l => !l.completed);
    const streak = this.calculateStreak(habitId);
    const totalDays = completedLogs.length;
    const skipCount = skippedLogs.length;
    const totalLoggedDays = totalDays + skipCount;
    const consistency = totalLoggedDays > 0 ? Math.round((totalDays / totalLoggedDays) * 100) : 0;
    
    return { streak, totalDays, consistency, skipCount, totalLoggedDays };
  }

  private calculateStreak(habitId: string): number {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      
      if (this.habitService.getHabitState(habitId, dateStr) === 'done') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  onComplete(habitId: string) {
    this.habitService.logHabit(habitId, this.formatDate(this.today()), true);
  }

  onSkip(habitId: string) {
    this.habitService.logHabit(habitId, this.formatDate(this.today()), false, 'Skipped today');
  }

  onUndo(habitId: string) {
    this.habitService.removeLog(habitId, this.formatDate(this.today()));
  }

  onEdit(habitId: string) {
    this.router.navigate(['/create'], { queryParams: { id: habitId } });
  }

  onDelete(habitId: string) {
    this.habitService.deleteHabit(habitId);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}