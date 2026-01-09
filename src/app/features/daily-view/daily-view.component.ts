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
      <div class="toast" *ngIf="showToast()">
        <div class="toast-content">
          <span class="toast-icon">🎉</span>
          <span class="toast-text">{{ toastMessage() }}</span>
        </div>
      </div>

      <header class="header">
        <div class="date-nav">
          <button class="nav-btn" (click)="previousDay()" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="date-info">
            <h1>{{ getDateLabel() }}</h1>
            <p class="date">{{ today() | date:'EEEE, MMMM d' }}</p>
          </div>
          <button class="nav-btn" (click)="nextDay()" [disabled]="isToday()" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div class="view-toggle">
          <button class="toggle-btn" [class.active]="groupByIdentity()" (click)="groupByIdentity.set(!groupByIdentity())">
            Group by Identity
          </button>
        </div>
      </header>

      <div class="loading" *ngIf="!habitService.isLoaded()">
        <div class="spinner"></div>
        <p>Loading habits...</p>
      </div>

      <div class="habits-list" *ngIf="habitService.isLoaded()">
        <div *ngIf="groupByIdentity(); else normalView">
          <div *ngFor="let group of habitsByIdentity()" class="identity-group">
            <h3 class="identity-title">{{ group.identity }}</h3>
            <app-habit-card-modern
              *ngFor="let habit of group.habits"
              [habit]="habit"
              [state]="getHabitState(habit.id)"
              [weeklyConsistency]="getWeeklyConsistency(habit.id)"
              [habitService]="habitService"
              (complete)="onComplete(habit.id)"
              (progressUpdate)="onProgressUpdate(habit.id, $event)"
              (undo)="onUndo(habit.id)"
              (milestoneAdd)="onMilestoneAdd(habit.id, $event)"
              (edit)="onEdit($event)"
              (delete)="onDelete($event)">
            </app-habit-card-modern>
          </div>
        </div>
        
        <ng-template #normalView>
          <app-habit-card-modern
            *ngFor="let habit of todayHabits()"
            [habit]="habit"
            [state]="getHabitState(habit.id)"
            [weeklyConsistency]="getWeeklyConsistency(habit.id)"
            [habitService]="habitService"
            (complete)="onComplete(habit.id)"
            (progressUpdate)="onProgressUpdate(habit.id, $event)"
            (undo)="onUndo(habit.id)"
            (milestoneAdd)="onMilestoneAdd(habit.id, $event)"
            (edit)="onEdit($event)"
            (delete)="onDelete($event)">
          </app-habit-card-modern>
        </ng-template>

        <div *ngIf="completedHabits().length > 0" class="completed-section">
          <h3 class="completed-title">Completed ({{ completedHabits().length }})</h3>
          <app-habit-card-modern
            *ngFor="let habit of completedHabits()"
            [habit]="habit"
            [state]="getHabitState(habit.id)"
            [weeklyConsistency]="getWeeklyConsistency(habit.id)"
            [habitService]="habitService"
            (complete)="onComplete(habit.id)"
            (progressUpdate)="onProgressUpdate(habit.id, $event)"
            (undo)="onUndo(habit.id)"
            (milestoneAdd)="onMilestoneAdd(habit.id, $event)"
            (edit)="onEdit($event)"
            (delete)="onDelete($event)">
          </app-habit-card-modern>
        </div>

        <div *ngIf="todayHabits().length === 0 && completedHabits().length === 0" class="empty-state">
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

    .date-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .date-info {
      flex: 1;
      text-align: center;
    }

    .nav-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: none;
      background: white;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    .nav-btn:active:not(:disabled) {
      transform: scale(0.9);
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
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
      gap: 24px;
    }

    .identity-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .identity-title {
      font-size: 16px;
      font-weight: 700;
      color: #6366f1;
      margin: 0;
      padding: 8px 0;
      border-bottom: 2px solid #e5e7eb;
      text-transform: capitalize;
    }

    .view-toggle {
      margin-top: 16px;
      text-align: center;
    }

    .toggle-btn {
      padding: 8px 16px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toggle-btn.active {
      background: #6366f1;
      color: white;
      border-color: #6366f1;
    }

    .completed-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .completed-title {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 12px 0;
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

      .nav-btn:hover:not(:disabled) {
        background: #f3f4f6;
        color: #111827;
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

      .completed-section {
        margin-top: 32px;
        padding-top: 32px;
      }

      .completed-title {
        font-size: 15px;
        margin: 0 0 16px 0;
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

    .toast {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      animation: slideDown 0.3s ease-out;
    }

    .toast-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 600;
    }

    .toast-icon {
      font-size: 24px;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `]
})
export class DailyViewComponent {
  today = signal(new Date());
  showToast = signal(false);
  toastMessage = signal('');
  groupByIdentity = signal(false);
  
  todayHabits = computed(() => {
    const dayOfWeek = this.today().getDay();
    const dateStr = this.formatDate(this.today());
    return this.habitService.allHabits()
      .filter(habit => {
        const isScheduledToday = habit.frequency === 'daily' || 
          (Array.isArray(habit.frequency) && habit.frequency.includes(dayOfWeek));
        const state = this.habitService.getHabitState(habit.id, dateStr);
        const startDate = habit.startDate || new Date(this.today().getFullYear(), 0, 1).toISOString().split('T')[0];
        const isAfterStart = dateStr >= startDate;
        return isScheduledToday && state !== 'done' && isAfterStart;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  });

  habitsByIdentity = computed(() => {
    const habits = this.todayHabits();
    const grouped = habits.reduce((acc, habit) => {
      const identity = habit.identity || 'Other';
      if (!acc[identity]) acc[identity] = [];
      acc[identity].push(habit);
      return acc;
    }, {} as Record<string, typeof habits>);
    return Object.entries(grouped).map(([identity, habits]) => ({ identity, habits }));
  });

  completedHabits = computed(() => {
    const dayOfWeek = this.today().getDay();
    const dateStr = this.formatDate(this.today());
    return this.habitService.allHabits()
      .filter(habit => {
        const isScheduledToday = habit.frequency === 'daily' || 
          (Array.isArray(habit.frequency) && habit.frequency.includes(dayOfWeek));
        const state = this.habitService.getHabitState(habit.id, dateStr);
        const startDate = habit.startDate || new Date(this.today().getFullYear(), 0, 1).toISOString().split('T')[0];
        const isAfterStart = dateStr >= startDate;
        return isScheduledToday && state === 'done' && isAfterStart;
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

  getNote(habitId: string): string {
    const log = this.habitService.allLogs().find(
      l => l.habitId === habitId && l.date === this.formatDate(this.today())
    );
    return log?.note || '';
  }

  onComplete(habitId: string) {
    this.habitService.logHabit(habitId, this.formatDate(this.today()), true);
  }

  onProgressUpdate(habitId: string, progressValue: number) {
    const log = this.habitService.allLogs().find(
      (l: any) => l.habitId === habitId && l.date === this.formatDate(this.today())
    );
    const habit = this.habitService.getHabitById(habitId);
    const cumulative = this.habitService.allLogs()
      .filter((l: any) => l.habitId === habitId && l.progressValue)
      .reduce((sum: number, l: any) => sum + (l.progressValue || 0), 0);
    const newTotal = cumulative + progressValue;
    
    this.habitService.logHabit(
      habitId, 
      this.formatDate(this.today()), 
      true, 
      log?.note,
      log?.milestoneCount,
      progressValue
    );
    
    if (habit?.dailyProgress) {
      this.toastMessage.set(`Amazing! Total: ${newTotal} ${habit.dailyProgress.measure}`);
      this.showToast.set(true);
      setTimeout(() => this.showToast.set(false), 3000);
    }
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
