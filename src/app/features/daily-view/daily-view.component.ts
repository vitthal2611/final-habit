import { Component, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HabitService } from '../../core/services/habit.service';
import { DataExportService } from '../../core/services/data-export.service';
import { HabitCardDesign3Component } from './habit-card/habit-card-design3.component';
import { DateUtils } from '../../core/utils/date.utils';

@Component({
  selector: 'app-daily-view',
  standalone: true,
  imports: [CommonModule, HabitCardDesign3Component],
  template: `
    <div class="daily-view">
      <div class="toast" *ngIf="showToast()">
        <div class="toast-content">
          <span class="toast-icon">🎉</span>
          <span class="toast-text">{{ toastMessage() }}</span>
        </div>
      </div>

      <header class="header">
        <div class="date-section">
          <button class="nav-btn" (click)="previousDay()" type="button" title="Previous day (←)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="date-content">
            <h1>{{ getDateLabel() }}</h1>
            <p class="date-subtitle">{{ today() | date:'EEEE, MMMM d' }}</p>
          </div>
          <button class="nav-btn" (click)="nextDay()" [disabled]="isToday()" type="button" title="Next day (→)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div class="stats-row" *ngIf="todayHabits().length > 0">
          <div class="progress-ring-container">
            <svg class="progress-ring" width="60" height="60">
              <circle class="progress-ring-bg" cx="30" cy="30" r="24" />
              <circle class="progress-ring-fill" cx="30" cy="30" r="24" 
                [style.stroke-dashoffset]="150.8 - (150.8 * progressPercentage() / 100)" />
            </svg>
            <div class="progress-text">{{ completedTodayHabits().length }}/{{ todayHabits().length }}</div>
          </div>
          
          <div class="stats-badges">
            <div class="stat-badge" *ngIf="weeklyMomentum() > 0">
              <span class="badge-icon">🔥</span>
              <span class="badge-text">{{ weeklyMomentum() }} day{{ weeklyMomentum() > 1 ? 's' : '' }} showing up</span>
            </div>
            <div class="stat-badge" *ngIf="longestStreak() > 3">
              <span class="badge-icon">⭐</span>
              <span class="badge-text">{{ longestStreak() }} day best streak</span>
            </div>
            <div class="stat-badge best-day" *ngIf="bestDayThisWeek()">
              <span class="badge-icon">🏆</span>
              <span class="badge-text">Best day this week!</span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="action-btn secondary" [class.active]="groupByIdentity()" (click)="groupByIdentity.set(!groupByIdentity())" title="Group by identity (Ctrl+G)">
            Group
          </button>
          <button class="action-btn primary" (click)="exportData()" title="Export data (Ctrl+E)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>
      </header>

      <div class="loading" *ngIf="!habitService.isLoaded() || isProcessing()">
        <div class="spinner"></div>
        <p>{{ isProcessing() ? 'Processing...' : 'Loading habits...' }}</p>
      </div>

      <div class="habits-container" *ngIf="habitService.isLoaded()">
        <div class="all-done-state" *ngIf="todayHabits().length > 0 && completedTodayHabits().length === todayHabits().length">
          <div class="celebration-icon">🎉</div>
          <h2>All done for today!</h2>
          <p>You showed up for every habit. That's who you are.</p>
        </div>

        <div *ngIf="groupByIdentity(); else timeView">
          <div *ngFor="let group of habitsByIdentity()" class="identity-section">
            <div class="identity-header">
              <div class="identity-dot" [style.background]="getIdentityColor(group.identity)"></div>
              <h3 class="identity-name">{{ group.identity }}</h3>
              <span class="habit-count">{{ group.habits.length }}</span>
            </div>
            <div class="habits-grid">
              <app-habit-card-design3
                *ngFor="let habit of group.habits"
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
          </div>
        </div>
        
        <ng-template #timeView>
          <div class="time-section" *ngIf="habitsByTimeOfDay().morning.length > 0">
            <div class="time-header">
              <span class="time-icon">🌅</span>
              <h3 class="time-label">Morning</h3>
            </div>
            <div class="habits-grid">
              <app-habit-card-design3
                *ngFor="let habit of habitsByTimeOfDay().morning"
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
          </div>

          <div class="time-section" *ngIf="habitsByTimeOfDay().afternoon.length > 0">
            <div class="time-header">
              <span class="time-icon">☀️</span>
              <h3 class="time-label">Afternoon</h3>
            </div>
            <div class="habits-grid">
              <app-habit-card-design3
                *ngFor="let habit of habitsByTimeOfDay().afternoon"
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
          </div>

          <div class="time-section" *ngIf="habitsByTimeOfDay().evening.length > 0">
            <div class="time-header">
              <span class="time-icon">🌙</span>
              <h3 class="time-label">Evening</h3>
            </div>
            <div class="habits-grid">
              <app-habit-card-design3
                *ngFor="let habit of habitsByTimeOfDay().evening"
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
          </div>

          <div class="completed-toggle" *ngIf="completedTodayHabits().length > 0">
            <button class="toggle-btn" (click)="showCompleted.set(!showCompleted())">
              <span>{{ showCompleted() ? 'Hide' : 'Show' }} completed ({{ completedTodayHabits().length }})</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                [style.transform]="showCompleted() ? 'rotate(180deg)' : 'rotate(0deg)'">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </ng-template>

        <div *ngIf="todayHabits().length === 0" class="empty-state">
          <div class="empty-icon">✨</div>
          <h2>Start Your Journey</h2>
          <p class="empty-text">No habits for today. Build better habits, one day at a time.</p>
          <button class="create-btn" (click)="createHabit()" title="Create habit (Ctrl+N)">
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
      background: #fafbfc;
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
      margin-bottom: 16px;
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

    .header-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .action-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .action-btn.secondary {
      background: white;
      color: #64748b;
    }

    .action-btn.secondary.active {
      background: #f1f5f9;
      color: #475569;
      border-color: #cbd5e1;
    }

    .action-btn.primary {
      background: #0f172a;
      color: white;
      border-color: #0f172a;
    }

    .action-btn.primary:hover {
      background: #1e293b;
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

    .habits-grid.completed {
      opacity: 0.8;
    }

    .identity-section {
      margin-bottom: 32px;
    }

    .identity-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .identity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .identity-name {
      font-size: 16px;
      font-weight: 600;
      color: #334155;
      margin: 0;
      flex: 1;
    }

    .habit-count {
      font-size: 12px;
      color: #94a3b8;
      background: #f8fafc;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 500;
    }

    .completed-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #64748b;
      margin: 0;
    }

    .completion-badge {
      background: #10b981;
      color: white;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
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

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      gap: 16px;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid #f1f5f9;
      border-top-color: #64748b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading p {
      color: #64748b;
      font-size: 14px;
      margin: 0;
    }

    @media (min-width: 640px) {
      .habits-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
    }

    @media (max-width: 640px) {
      .stats-row {
        justify-content: center;
      }

      .progress-ring-container {
        order: -1;
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 12px;
      }

      .stats-badges {
        width: 100%;
        justify-content: center;
      }

      .header-actions {
        flex-wrap: wrap;
      }

      .action-btn {
        flex: 1;
        min-width: 120px;
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

    .toast {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      animation: slideDown 0.3s ease-out;
    }

    .toast-content {
      background: #0f172a;
      color: white;
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 500;
    }

    .toast-icon {
      font-size: 18px;
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

    .stats-row {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px 0;
      border-top: 1px solid #f1f5f9;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .progress-ring-container {
      position: relative;
      flex-shrink: 0;
    }

    .progress-ring {
      transform: rotate(-90deg);
    }

    .progress-ring-bg {
      fill: none;
      stroke: #f1f5f9;
      stroke-width: 4;
    }

    .progress-ring-fill {
      fill: none;
      stroke: #10b981;
      stroke-width: 4;
      stroke-linecap: round;
      stroke-dasharray: 150.8;
      transition: stroke-dashoffset 0.5s ease;
    }

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }

    .stats-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      flex: 1;
    }

    .stat-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .stat-badge.best-day {
      background: #fef3c7;
      border-color: #fbbf24;
    }

    .badge-icon {
      font-size: 14px;
    }

    .badge-text {
      font-size: 12px;
      font-weight: 500;
      color: #475569;
    }

    .time-section {
      margin-bottom: 32px;
    }

    .time-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f1f5f9;
    }

    .time-icon {
      font-size: 20px;
    }

    .time-label {
      font-size: 16px;
      font-weight: 600;
      color: #334155;
      margin: 0;
    }

    .completed-toggle {
      text-align: center;
      margin-top: 24px;
    }

    .toggle-btn {
      padding: 10px 20px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .toggle-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .toggle-btn svg {
      transition: transform 0.2s;
    }

    .all-done-state {
      text-align: center;
      padding: 40px 20px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 16px;
      margin-bottom: 24px;
      border: 2px solid #fbbf24;
    }

    .celebration-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .all-done-state h2 {
      font-size: 22px;
      font-weight: 700;
      color: #78350f;
      margin: 0 0 8px 0;
    }

    .all-done-state p {
      font-size: 14px;
      color: #92400e;
      margin: 0;
      font-weight: 500;
    }
  `]
})
export class DailyViewComponent {
  today = signal(new Date());
  showToast = signal(false);
  toastMessage = signal('');
  groupByIdentity = signal(false);
  showCompleted = signal(false);
  isProcessing = signal(false);

  todayHabits = computed(() => {
    const dayOfWeek = this.today().getDay();
    const dateStr = DateUtils.format(this.today());
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

  pendingHabits = computed(() => {
    const dateStr = DateUtils.format(this.today());
    return this.todayHabits().filter(h => this.habitService.getHabitState(h.id, dateStr) === 'pending');
  });

  completedTodayHabits = computed(() => {
    const dateStr = DateUtils.format(this.today());
    return this.todayHabits().filter(h => {
      const state = this.habitService.getHabitState(h.id, dateStr);
      return state === 'done' || state === 'missed';
    });
  });

  habitsByTimeOfDay = computed(() => {
    const habits = this.showCompleted() ? this.todayHabits() : this.pendingHabits();
    const groups = { morning: [] as any[], afternoon: [] as any[], evening: [] as any[] };
    
    habits.forEach(habit => {
      const hour = parseInt(habit.time.split(':')[0]);
      if (hour < 12) groups.morning.push(habit);
      else if (hour < 17) groups.afternoon.push(habit);
      else groups.evening.push(habit);
    });
    
    return groups;
  });

  progressPercentage = computed(() => {
    const total = this.todayHabits().length;
    if (total === 0) return 0;
    return Math.round((this.completedTodayHabits().length / total) * 100);
  });

  weeklyMomentum = computed(() => {
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const date = DateUtils.addDays(this.today(), -i);
      const dateStr = DateUtils.format(date);
      const dayHabits = this.habitService.allLogs().filter(l => l.date === dateStr && l.completed);
      if (dayHabits.length > 0) streak++;
      else break;
    }
    return streak;
  });

  bestDayThisWeek = computed(() => {
    let maxCompleted = 0;
    let bestDate = '';
    
    for (let i = 0; i < 7; i++) {
      const date = DateUtils.addDays(this.today(), -i);
      const dateStr = DateUtils.format(date);
      const completed = this.habitService.allLogs().filter(l => l.date === dateStr && l.completed).length;
      if (completed > maxCompleted) {
        maxCompleted = completed;
        bestDate = dateStr;
      }
    }
    
    return DateUtils.format(this.today()) === bestDate && maxCompleted > 0;
  });

  longestStreak = computed(() => {
    const allDates = [...new Set(this.habitService.allLogs().filter(l => l.completed).map(l => l.date))].sort();
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;
    
    allDates.forEach(dateStr => {
      const date = new Date(dateStr);
      if (prevDate) {
        const diffDays = Math.round((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) currentStreak++;
        else currentStreak = 1;
      } else {
        currentStreak = 1;
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      prevDate = date;
    });
    
    return maxStreak;
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
    const dateStr = DateUtils.format(this.today());
    return this.habitService.allHabits()
      .filter(habit => {
        const isScheduledToday = habit.frequency === 'daily' || 
          (Array.isArray(habit.frequency) && habit.frequency.includes(dayOfWeek));
        const state = this.habitService.getHabitState(habit.id, dateStr);
        const startDate = habit.startDate || new Date(this.today().getFullYear(), 0, 1).toISOString().split('T')[0];
        const isAfterStart = dateStr >= startDate;
        return isScheduledToday && (state === 'done' || state === 'missed') && isAfterStart;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  });

  constructor(public habitService: HabitService, private router: Router, private dataExportService: DataExportService) {}

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'n') {
        event.preventDefault();
        this.createHabit();
      } else if (event.key === 'e') {
        event.preventDefault();
        this.exportData();
      }
    } else if (event.key === 'ArrowLeft') {
      this.previousDay();
    } else if (event.key === 'ArrowRight' && !this.isToday()) {
      this.nextDay();
    }
  }

  previousDay() {
    this.today.set(DateUtils.addDays(this.today(), -1));
  }

  nextDay() {
    if (!this.isToday()) {
      this.today.set(DateUtils.addDays(this.today(), 1));
    }
  }

  isToday(): boolean {
    return DateUtils.isToday(this.today());
  }

  getDateLabel(): string {
    return DateUtils.getDateLabel(this.today());
  }

  createHabit() {
    this.router.navigate(['/create']);
  }

  exportData() {
    this.dataExportService.exportAllData();
    this.showSuccessToast('Data exported successfully');
  }

  getHabitState(habitId: string) {
    return this.habitService.getHabitState(habitId, DateUtils.format(this.today()));
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
      const date = DateUtils.addDays(today, -i);
      const dateStr = DateUtils.format(date);
      
      if (this.habitService.getHabitState(habitId, dateStr) === 'done') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private getDaysSinceCreation(habitId: string): number {
    const habit = this.habitService.getHabitById(habitId);
    if (!habit) return 0;
    
    const createdDate = new Date(habit.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getIdentityColor(identity: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#84cc16'];
    const hash = identity.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  getNote(habitId: string): string {
    const log = this.habitService.allLogs().find(
      l => l.habitId === habitId && l.date === DateUtils.format(this.today())
    );
    return log?.note || '';
  }

  onComplete(habitId: string) {
    if (this.isProcessing()) return;
    this.isProcessing.set(true);
    try {
      this.habitService.logHabit(habitId, DateUtils.format(this.today()), true);
      this.showSuccessToast('Great job! Keep it up! 🎉');
    } finally {
      this.isProcessing.set(false);
    }
  }

  onSkip(habitId: string) {
    if (this.isProcessing()) return;
    this.isProcessing.set(true);
    try {
      this.habitService.logHabit(habitId, DateUtils.format(this.today()), false, 'Skipped today');
    } finally {
      this.isProcessing.set(false);
    }
  }

  onProgressUpdate(habitId: string, progressValue: number) {
    const log = this.habitService.allLogs().find(
      (l: any) => l.habitId === habitId && l.date === DateUtils.format(this.today())
    );
    const habit = this.habitService.getHabitById(habitId);
    const cumulative = this.habitService.allLogs()
      .filter((l: any) => l.habitId === habitId && l.progressValue)
      .reduce((sum: number, l: any) => sum + (l.progressValue || 0), 0);
    const newTotal = cumulative + progressValue;
    
    this.habitService.logHabit(
      habitId, 
      DateUtils.format(this.today()), 
      true, 
      log?.note,
      log?.milestoneCount,
      progressValue
    );
    
    if (habit?.dailyProgress) {
      this.showSuccessToast(`Amazing! Total: ${newTotal} ${habit.dailyProgress.measure}`);
    }
  }

  onUndo(habitId: string) {
    this.habitService.removeLog(habitId, DateUtils.format(this.today()));
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
      DateUtils.format(this.today()), 
      currentState === 'done',
      note
    );
  }

  onMilestoneAdd(habitId: string, count: number) {
    const dateStr = DateUtils.format(this.today());
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

  private showSuccessToast(message: string) {
    this.toastMessage.set(message);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 4000);
  }
}
