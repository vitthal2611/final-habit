import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../core/services/habit.service';

interface WeeklyHabit {
  id: string;
  time: string;
  identity: string;
  trigger: string;
  action: string;
  twoMinuteVersion: string;
  cue: string;
  reward: string;
  days: boolean[];
  streak: number;
  consistency: number;
  createdDate: string;
  frequency: 'daily' | number[];
}

@Component({
  selector: 'app-weekly-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard">
      <!-- Performance Header -->
      <div class="performance-header">
        <div class="view-selector">
          <button class="view-btn" [class.active]="viewMode() === 'week'" (click)="viewMode.set('week')">Week</button>
          <button class="view-btn" [class.active]="viewMode() === 'month'" (click)="viewMode.set('month')">Month</button>
          <button class="view-btn" [class.active]="viewMode() === 'year'" (click)="viewMode.set('year')">Year</button>
        </div>
        <div class="score-value">{{ currentScore() }}<span class="score-unit">%</span></div>
        <div class="score-label">{{ scoreLabel() }}</div>
        <div class="week-nav" *ngIf="viewMode() === 'week'">
          <button (click)="previousWeek()" class="nav-btn">←</button>
          <div class="week-info">{{ weekRange() }}</div>
          <button (click)="nextWeek()" class="nav-btn">→</button>
        </div>
        <div class="week-nav" *ngIf="viewMode() === 'month'">
          <button (click)="previousMonth()" class="nav-btn">←</button>
          <div class="week-info">{{ monthLabel() }}</div>
          <button (click)="nextMonth()" class="nav-btn" [disabled]="isCurrentMonth()">→</button>
        </div>
        <div class="week-nav" *ngIf="viewMode() === 'year'">
          <button (click)="previousYear()" class="nav-btn">←</button>
          <div class="week-info">{{ currentYear() }}</div>
          <button (click)="nextYear()" class="nav-btn" [disabled]="isCurrentYear()">→</button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">COMPLETED</div>
          <div class="kpi-value">{{ totalCompleted() }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">HABITS</div>
          <div class="kpi-value">{{ habits().length }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">{{ streakLabel() }}</div>
          <div class="kpi-value">{{ avgStreak() }}<span class="kpi-unit">d</span></div>
        </div>
      </div>

      <!-- Insights Panel -->
      <div class="insights-panel" *ngIf="showInsights()">
        <div class="insight-card alert" *ngIf="plateauAlert()">
          <div class="insight-icon">⚠️</div>
          <div class="insight-content">
            <div class="insight-title">Plateau Alert</div>
            <div class="insight-text">{{ plateauAlert() }}</div>
          </div>
        </div>

        <div class="insight-card" *ngIf="optimalTime()">
          <div class="insight-icon">⏰</div>
          <div class="insight-content">
            <div class="insight-title">Best Time</div>
            <div class="insight-text">{{ optimalTime() }}</div>
          </div>
        </div>

        <div class="insight-card" *ngIf="habitPairing()">
          <div class="insight-icon">🔗</div>
          <div class="insight-content">
            <div class="insight-title">Habit Pairing</div>
            <div class="insight-text">{{ habitPairing() }}</div>
          </div>
        </div>

        <div class="insight-card success">
          <div class="insight-icon">📈</div>
          <div class="insight-content">
            <div class="insight-title">1 Year Projection</div>
            <div class="insight-text">{{ compoundEffect() }}</div>
          </div>
        </div>

        <div class="insight-card" *ngIf="streakLeaders()">
          <div class="insight-icon">🏆</div>
          <div class="insight-content">
            <div class="insight-title">Streak Leaders</div>
            <div class="insight-text">{{ streakLeaders() }}</div>
          </div>
        </div>

        <div class="insight-card" *ngIf="weekdayPerformance()">
          <div class="insight-icon">📅</div>
          <div class="insight-content">
            <div class="insight-title">Best Day</div>
            <div class="insight-text">{{ weekdayPerformance() }}</div>
          </div>
        </div>

        <div class="insight-card" *ngIf="timeBlockAnalysis()">
          <div class="insight-icon">⏱️</div>
          <div class="insight-content">
            <div class="insight-title">Time Performance</div>
            <div class="insight-text">{{ timeBlockAnalysis() }}</div>
          </div>
        </div>

        <div class="insight-card" *ngIf="identityStrength()">
          <div class="insight-icon">⭐</div>
          <div class="insight-content">
            <div class="insight-title">Strongest Identity</div>
            <div class="insight-text">{{ identityStrength() }}</div>
          </div>
        </div>

        <div class="insight-card" *ngIf="recoveryPattern()">
          <div class="insight-icon">🔄</div>
          <div class="insight-content">
            <div class="insight-title">Recovery Rate</div>
            <div class="insight-text">{{ recoveryPattern() }}</div>
          </div>
        </div>
      </div>

      <button class="insights-toggle" (click)="toggleInsights()">
        {{ showInsights() ? '▼' : '▶' }} Insights
      </button>

      <!-- Habit Cards -->
      <div class="habit-list">
        <div class="habit-card" 
             *ngFor="let habit of habits(); let i = index"
             [class.completed-today]="habit.days[getTodayIndex()]"
             [class.expanded]="expandedHabit() === i">
          
          <!-- Compact Header -->
          <div class="card-header">
            <div class="header-left">
              <span class="time-badge" *ngIf="habit.time">{{ habit.time }}</span>
              <span class="frequency-badge">{{ getFrequencyLabel(habit) }}</span>
              <span class="identity-badge" *ngIf="habit.identity">✨ {{ habit.identity }}</span>
            </div>
            <button (click)="deleteHabit(i)" class="btn-menu">×</button>
          </div>

          <!-- Main Action (Editable) -->
          <div class="action-section" (click)="toggleExpand(i)">
            <input [(ngModel)]="habit.action" 
                   class="input-action-main" 
                   placeholder="What will you do?" 
                   (blur)="updateHabit(i)"
                   (click)="$event.stopPropagation()" />
            <div class="trigger-text" *ngIf="habit.trigger">After {{ habit.trigger }}</div>
          </div>

          <!-- Week Grid -->
          <div class="days-grid-compact" *ngIf="viewMode() === 'week'">
            <button *ngFor="let day of [0,1,2,3,4,5,6]; let j = index"
                    class="day-btn-compact"
                    [class.done]="habit.days[j]"
                    [class.today]="j === getTodayIndex()"
                    [class.future]="isFutureDay(j)"
                    [class.before-created]="isBeforeCreated(habit, j)"
                    [class.not-scheduled]="!isScheduledDay(habit, j)"
                    [disabled]="isFutureDay(j) || isBeforeCreated(habit, j) || !isScheduledDay(habit, j)"
                    (click)="toggleDay(i, j)">
              <div class="day-label-compact">{{ ['M','T','W','T','F','S','S'][j] }}</div>
              <div class="day-check">{{ !isScheduledDay(habit, j) ? '—' : (habit.days[j] ? '✓' : '') }}</div>
            </button>
          </div>

          <!-- Month/Year Summary -->
          <div class="period-summary" *ngIf="viewMode() !== 'week'">
            <div class="summary-stat">
              <span class="summary-label">Completed:</span>
              <span class="summary-value">{{ habit.completedCount }} / {{ habit.totalCount }}</span>
            </div>
          </div>

          <!-- Stats Bar -->
          <div class="stats-bar">
            <span class="stat-item">🔥 {{ calculateStreak(habit) }}d</span>
            <span class="stat-item">{{ habit.consistency }}% {{ viewMode() === 'week' ? 'this week' : (viewMode() === 'month' ? 'this month' : 'this year') }}</span>
            <button class="expand-btn" (click)="toggleExpand(i)">
              {{ expandedHabit() === i ? '▲' : '▼' }} Details
            </button>
          </div>

          <!-- Expanded Details -->
          <div class="details-section" *ngIf="expandedHabit() === i">
            <div class="detail-row">
              <label>⏰ Time</label>
              <input [(ngModel)]="habit.time" type="time" (blur)="updateHabit(i)" />
            </div>
            <div class="detail-row">
              <label>✨ Identity</label>
              <input [(ngModel)]="habit.identity" placeholder="I am a person who..." (blur)="updateHabit(i)" />
            </div>
            <div class="detail-row">
              <label>🔗 Trigger</label>
              <input [(ngModel)]="habit.trigger" placeholder="After I..." (blur)="updateHabit(i)" />
            </div>
            <div class="detail-row">
              <label>👁️ Cue</label>
              <input [(ngModel)]="habit.cue" placeholder="Visual reminder" (blur)="updateHabit(i)" />
            </div>
            <div class="detail-row">
              <label>⚡ 2-Min Version</label>
              <input [(ngModel)]="habit.twoMinuteVersion" placeholder="Smallest version" (blur)="updateHabit(i)" />
            </div>
            <div class="detail-row">
              <label>🎁 Reward</label>
              <input [(ngModel)]="habit.reward" placeholder="Then I will..." (blur)="updateHabit(i)" />
            </div>
            <div class="detail-row frequency-row">
              <label>📅 Frequency</label>
              <div class="frequency-options">
                <button class="freq-option" [class.active]="habit.frequency === 'daily'" (click)="setFrequency(i, 'daily'); $event.stopPropagation()">
                  <span class="freq-icon">🌟</span>
                  <span class="freq-label">Every Day</span>
                </button>
                <button class="freq-option" [class.active]="isWeekdaysOnly(habit)" (click)="setFrequency(i, 'weekdays'); $event.stopPropagation()">
                  <span class="freq-icon">💼</span>
                  <span class="freq-label">Weekdays</span>
                </button>
                <button class="freq-option" [class.active]="isWeekendsOnly(habit)" (click)="setFrequency(i, 'weekends'); $event.stopPropagation()">
                  <span class="freq-icon">🏖️</span>
                  <span class="freq-label">Weekends</span>
                </button>
                <button class="freq-option" [class.active]="isCustomFrequency(habit)" (click)="setFrequency(i, 'custom'); $event.stopPropagation()">
                  <span class="freq-icon">⚙️</span>
                  <span class="freq-label">Custom</span>
                </button>
              </div>
              <div class="days-selector" *ngIf="habit.frequency !== 'daily' && !isWeekdaysOnly(habit) && !isWeekendsOnly(habit)">
                <button *ngFor="let day of [0,1,2,3,4,5,6]; let j = index"
                        class="day-select-btn"
                        [class.selected]="isFrequencyDaySelected(habit, j)"
                        (click)="toggleFrequencyDay(i, j); $event.stopPropagation()">
                  <div class="day-name">{{ ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][j] }}</div>
                  <div class="day-letter">{{ ['M','T','W','T','F','S','S'][j] }}</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button (click)="addHabit()" class="btn-add">+ NEW HABIT</button>
    </div>
  `,
  styles: [`
    .view-selector {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .view-btn {
      background: #f3f4f6;
      border: 2px solid #e5e7eb;
      color: #6b7280;
      padding: 0.5rem 1.25rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn.active {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      border-color: #8b5cf6;
      color: #fff;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }

    .view-btn:active {
      transform: scale(0.95);
    }

    .period-info {
      font-size: 0.95rem;
      color: #4b5563;
      text-align: center;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    * { box-sizing: border-box; }
    
    .dashboard {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 1rem;
      padding-bottom: 5rem;
    }

    .performance-header {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2rem 1.5rem;
      margin-bottom: 1.5rem;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .score-value {
      font-size: 4rem;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      text-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
    }

    .score-unit {
      font-size: 2rem;
      color: #8b5cf6;
      font-weight: 700;
    }

    .score-label {
      font-size: 0.75rem;
      letter-spacing: 0.25em;
      color: #6b7280;
      margin: 0.75rem 0 1.25rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .week-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .week-info {
      font-size: 0.95rem;
      color: #4b5563;
      min-width: 160px;
      text-align: center;
      font-weight: 600;
    }

    .nav-btn {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      border: none;
      color: #fff;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      font-size: 1.5rem;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-btn:active {
      transform: scale(0.92);
      box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .kpi-card {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 1.25rem 1rem;
      text-align: center;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .kpi-card:active {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
    }

    .kpi-label {
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      color: #6b7280;
      margin-bottom: 0.5rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: 800;
      color: #1f2937;
      line-height: 1;
    }

    .kpi-unit {
      font-size: 1rem;
      color: #8b5cf6;
      font-weight: 600;
    }

    .habit-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .habit-card {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 1.25rem;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-left: 4px solid transparent;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .habit-card.completed-today {
      border-left-color: #10b981;
      background: linear-gradient(135deg, rgba(240, 253, 244, 0.5) 0%, rgba(255, 255, 255, 0.98) 100%);
    }

    .habit-card.expanded {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      gap: 0.5rem;
    }

    .header-left {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      flex: 1;
    }

    .time-badge {
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      color: #1f2937;
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .identity-badge {
      background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
      color: #6366f1;
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .frequency-badge {
      background: rgba(254, 243, 199, 0.9);
      color: #d97706;
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 600;
      border: 1px solid rgba(251, 191, 36, 0.4);
    }

    .btn-menu {
      background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
      border: none;
      color: #ef4444;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: all 0.2s;
      font-weight: 700;
      flex-shrink: 0;
    }

    .btn-menu:active {
      transform: scale(0.9);
    }

    .action-section {
      margin-bottom: 1rem;
      cursor: pointer;
    }

    .period-summary {
      padding: 1rem 0;
      border-top: 1px solid #f3f4f6;
      border-bottom: 1px solid #f3f4f6;
      margin-bottom: 0.75rem;
    }

    .summary-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.95rem;
    }

    .summary-label {
      color: #6b7280;
      font-weight: 600;
    }

    .summary-value {
      color: #1f2937;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .input-action-main {
      background: transparent;
      border: none;
      color: #1f2937;
      font-size: 1.125rem;
      font-weight: 700;
      width: 100%;
      padding: 0;
      margin-bottom: 0.25rem;
      cursor: text;
    }

    .input-action-main:focus {
      outline: none;
    }

    .input-action-main::placeholder {
      color: #9ca3af;
    }

    .trigger-text {
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .days-grid-compact {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.3rem;
      padding: 1rem 0;
      border-top: 1px solid #f3f4f6;
      border-bottom: 1px solid #f3f4f6;
      margin-bottom: 0.75rem;
    }

    .day-btn-compact {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border: 2px solid #e5e7eb;
      color: #d1d5db;
      padding: 0.4rem 0.15rem;
      border-radius: 10px;
      text-align: center;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      min-height: 50px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.1rem;
    }

    .day-label-compact {
      font-size: 0.65rem;
      color: #9ca3af;
      font-weight: 700;
      text-transform: uppercase;
    }

    .day-check {
      font-size: 1.25rem;
      line-height: 1;
    }

    .day-btn-compact.done {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-color: #10b981;
      color: #fff;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      transform: scale(1.02);
    }

    .day-btn-compact.done .day-label-compact {
      color: rgba(255, 255, 255, 0.9);
    }

    .day-btn-compact.today {
      border-color: #8b5cf6;
      border-width: 2px;
    }

    .day-btn-compact.today .day-label-compact {
      color: #8b5cf6;
      font-weight: 800;
    }

    .day-btn-compact.future,
    .day-btn-compact.before-created,
    .day-btn-compact.not-scheduled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .day-btn-compact:active:not(:disabled):not(.future):not(.before-created) {
      transform: scale(0.95);
    }

    .day-btn-compact:disabled {
      pointer-events: none;
    }

    .stats-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: #6b7280;
      font-weight: 600;
      gap: 0.5rem;
    }

    .stat-item {
      white-space: nowrap;
    }

    .expand-btn {
      background: transparent;
      border: none;
      color: #8b5cf6;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
      white-space: nowrap;
      margin-left: auto;
    }

    .expand-btn:active {
      background: #f3f4f6;
    }

    .details-section {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f3f4f6;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .detail-row label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #6b7280;
      min-width: 90px;
      flex-shrink: 0;
    }

    .detail-row input {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      color: #1f2937;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.5rem 0.75rem;
      flex: 1;
      transition: all 0.2s;
    }

    .detail-row input:focus {
      outline: none;
      border-color: #8b5cf6;
      background: #fff;
    }

    .frequency-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .frequency-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      width: 100%;
    }

    .freq-option {
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      color: #6b7280;
      padding: 0.75rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      min-height: 70px;
    }

    .freq-option:active {
      transform: scale(0.97);
    }

    .freq-option.active {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      border-color: #8b5cf6;
      color: #fff;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }

    .freq-icon {
      font-size: 1.5rem;
      line-height: 1;
    }

    .freq-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
    }

    .days-selector {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.35rem;
      width: 100%;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }

    .day-select-btn {
      background: #fff;
      border: 2px solid #e5e7eb;
      color: #6b7280;
      padding: 0.4rem 0.2rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.1rem;
      min-height: 56px;
    }

    .day-select-btn:active {
      transform: scale(0.95);
    }

    .day-select-btn.selected {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-color: #10b981;
      color: #fff;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    .day-name {
      font-size: 0.6rem;
      font-weight: 600;
      text-transform: uppercase;
      opacity: 0.8;
      line-height: 1;
    }

    .day-letter {
      font-size: 0.95rem;
      font-weight: 700;
      line-height: 1;
    }

    .btn-add {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: #fff;
      border: none;
      border-radius: 16px;
      padding: 1.25rem;
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      width: 100%;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-transform: uppercase;
    }

    .btn-add:active {
      transform: scale(0.97);
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    }

    .insights-toggle {
      background: rgba(255, 255, 255, 0.95);
      border: none;
      color: #6b7280;
      padding: 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      width: 100%;
      cursor: pointer;
      margin-bottom: 1rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .insights-panel {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .insight-card {
      background: rgba(255, 255, 255, 0.98);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      gap: 0.75rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #8b5cf6;
    }

    .insight-card.alert {
      border-left-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    }

    .insight-card.success {
      border-left-color: #10b981;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }

    .insight-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .insight-content {
      flex: 1;
    }

    .insight-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .insight-text {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.4;
    }

    @media (min-width: 768px) {
      .dashboard {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2.5rem;
      }

      .performance-header {
        padding: 3rem 2rem;
        border-radius: 24px;
      }

      .score-value {
        font-size: 6rem;
      }

      .score-unit {
        font-size: 2.5rem;
      }

      .score-label {
        font-size: 0.85rem;
      }

      .week-info {
        font-size: 1.1rem;
      }

      .nav-btn {
        width: 52px;
        height: 52px;
        font-size: 1.75rem;
      }

      .nav-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
      }

      .kpi-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
      }

      .kpi-card {
        padding: 2rem 1.5rem;
        border-radius: 20px;
      }

      .kpi-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 50px rgba(0, 0, 0, 0.2);
      }

      .kpi-label {
        font-size: 0.8rem;
      }

      .kpi-value {
        font-size: 3rem;
      }

      .habit-card {
        padding: 1.5rem;
        border-radius: 24px;
      }

      .habit-card:hover {
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
      }

      .input-action-main {
        font-size: 1.25rem;
      }

      .time-badge {
        font-size: 0.8rem;
        padding: 0.4rem 0.75rem;
      }

      .identity-badge {
        font-size: 0.75rem;
        padding: 0.4rem 0.75rem;
      }

      .btn-menu {
        width: 36px;
        height: 36px;
      }

      .btn-menu:hover {
        transform: scale(1.05);
      }

      .days-grid-compact {
        gap: 0.5rem;
      }

      .day-btn-compact {
        min-height: 58px;
        padding: 0.6rem 0.35rem;
      }

      .day-btn-compact:hover:not(:disabled):not(.future):not(.before-created) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .day-label-compact {
        font-size: 0.7rem;
      }

      .day-check {
        font-size: 1.4rem;
      }

      .stats-bar {
        font-size: 0.85rem;
      }

      .expand-btn:hover {
        background: #f3f4f6;
      }

      .btn-add {
        padding: 1.5rem;
        font-size: 0.95rem;
        border-radius: 20px;
      }

      .btn-add:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(139, 92, 246, 0.5);
      }

      .detail-row label {
        min-width: 110px;
        font-size: 0.8rem;
      }

      .detail-row input {
        font-size: 0.9rem;
        padding: 0.6rem 0.85rem;
      }
    }
  `]
})
export class WeeklyDashboardComponent {
  private habitService = inject(HabitService);
  currentWeekStart = signal(this.getMonday(new Date()));
  currentMonth = signal(new Date());
  currentYear = signal(new Date().getFullYear());
  showInsights = signal(false);
  expandedHabit = signal<number | null>(null);
  viewMode = signal<'week' | 'month' | 'year'>('week');
  
  currentScore = computed(() => {
    const mode = this.viewMode();
    if (mode === 'week') return this.avgConsistency();
    if (mode === 'month') return this.monthlyScore();
    return this.yearlyScore();
  });

  scoreLabel = computed(() => {
    const mode = this.viewMode();
    if (mode === 'week') return 'WEEK SCORE';
    if (mode === 'month') return 'MONTH SCORE';
    return 'YEAR SCORE';
  });

  streakLabel = computed(() => {
    const mode = this.viewMode();
    return mode === 'year' ? 'AVG STREAK' : 'STREAK';
  });

  periodLabel = computed(() => {
    const mode = this.viewMode();
    if (mode === 'month') {
      return this.currentMonth().toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    return this.currentYear().toString();
  });

  monthLabel = computed(() => {
    return this.currentMonth().toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  totalCompleted = computed(() => {
    const mode = this.viewMode();
    if (mode === 'week') return this.totalMinutes();
    if (mode === 'month') return this.monthlyCompleted();
    return this.yearlyCompleted();
  });

  monthlyScore = computed(() => {
    const habits = this.habitService.allHabits();
    const logs = this.habitService.allLogs();
    const month = this.currentMonth();
    const now = new Date();
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const endDate = monthEnd > now ? now : monthEnd;
    
    let totalScheduled = 0;
    let totalCompleted = 0;
    
    habits.forEach(habit => {
      for (let d = new Date(monthStart); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (this.habitService.isHabitScheduledForDate(habit, new Date(d))) {
          totalScheduled++;
          const dateStr = d.toISOString().split('T')[0];
          const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
          if (log?.completed) totalCompleted++;
        }
      }
    });
    
    return totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  });

  monthlyCompleted = computed(() => {
    const logs = this.habitService.allLogs();
    const month = this.currentMonth();
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
    return logs.filter(l => l.completed && l.date >= monthStart && l.date <= monthEnd).length;
  });

  yearlyScore = computed(() => {
    const habits = this.habitService.allHabits();
    const logs = this.habitService.allLogs();
    const year = this.currentYear();
    const now = new Date();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    const endDate = yearEnd > now ? now : yearEnd;
    
    let totalScheduled = 0;
    let totalCompleted = 0;
    
    habits.forEach(habit => {
      const habitStart = habit.startDate ? new Date(habit.startDate) : habit.createdAt;
      const startDate = habitStart > yearStart ? habitStart : yearStart;
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (this.habitService.isHabitScheduledForDate(habit, new Date(d))) {
          totalScheduled++;
          const dateStr = d.toISOString().split('T')[0];
          const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
          if (log?.completed) totalCompleted++;
        }
      }
    });
    
    return totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  });

  yearlyCompleted = computed(() => {
    const logs = this.habitService.allLogs();
    const year = this.currentYear();
    const yearStart = new Date(year, 0, 1).toISOString().split('T')[0];
    const yearEnd = new Date(year, 11, 31).toISOString().split('T')[0];
    return logs.filter(l => l.completed && l.date >= yearStart && l.date <= yearEnd).length;
  });

  habits = computed(() => {
    const allHabits = this.habitService.allHabits();
    const weekStart = this.currentWeekStart();
    const mode = this.viewMode();
    
    const mappedHabits = allHabits.map(habit => {
      let days: boolean[];
      let completedDays = 0;
      let totalDays = 0;
      
      if (mode === 'week') {
        // Weekly view - show 7 days
        days = [0,1,2,3,4,5,6].map(dayIndex => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + dayIndex);
          const dateStr = date.toISOString().split('T')[0];
          return this.habitService.getHabitState(habit.id, dateStr) === 'done';
        });
        
        for (let i = 0; i < 7; i++) {
          if (this.isFutureDay(i)) continue;
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          if (this.habitService.isHabitScheduledForDate(habit, date)) {
            totalDays++;
            if (days[i]) completedDays++;
          }
        }
      } else if (mode === 'month') {
        // Monthly view - show current month days
        const month = this.currentMonth();
        const now = new Date();
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const endDate = monthEnd > now ? now : monthEnd;
        const daysInPeriod = Math.floor((endDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        days = [];
        for (let i = 0; i < daysInPeriod; i++) {
          const date = new Date(monthStart);
          date.setDate(i + 1);
          const dateStr = date.toISOString().split('T')[0];
          const isDone = this.habitService.getHabitState(habit.id, dateStr) === 'done';
          days.push(isDone);
          
          if (this.habitService.isHabitScheduledForDate(habit, date)) {
            totalDays++;
            if (isDone) completedDays++;
          }
        }
      } else {
        // Yearly view - show year summary
        const year = this.currentYear();
        const now = new Date();
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);
        const endDate = yearEnd > now ? now : yearEnd;
        const habitStart = habit.startDate ? new Date(habit.startDate) : habit.createdAt;
        const startDate = habitStart > yearStart ? habitStart : yearStart;
        
        days = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const isDone = this.habitService.getHabitState(habit.id, dateStr) === 'done';
          
          if (this.habitService.isHabitScheduledForDate(habit, new Date(d))) {
            totalDays++;
            if (isDone) completedDays++;
          }
        }
      }
      
      const consistency = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
      
      return {
        id: habit.id,
        time: habit.time || '',
        identity: habit.identity || '',
        trigger: habit.trigger?.when || '',
        action: habit.name,
        twoMinuteVersion: habit.twoMinuteRule || '',
        cue: habit.cue || '',
        reward: habit.reward || '',
        days,
        streak: this.calculateTrueStreak(habit.id),
        consistency,
        createdDate: habit.createdAt ? new Date(habit.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        frequency: habit.frequency,
        completedCount: completedDays,
        totalCount: totalDays
      };
    });
    
    // Sort by time
    return mappedHabits.sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  });

  weekDays = computed(() => {
    const start = this.currentWeekStart();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        date: `${date.getDate()}/${date.getMonth() + 1}`
      };
    });
  });

  weekRange = computed(() => {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getDate()} ${start.toLocaleString('default', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short' })}`;
  });

  totalMinutes = computed(() => {
    return this.habits().reduce((sum, habit) => 
      sum + habit.days.filter(d => d).length, 0
    );
  });

  avgConsistency = computed(() => {
    const habits = this.habits();
    if (habits.length === 0) return 0;
    const total = habits.reduce((sum, h) => sum + (h.consistency || 0), 0);
    return Math.round(total / habits.length);
  });

  avgStreak = computed(() => {
    const habits = this.habits();
    if (habits.length === 0) return 0;
    const total = habits.reduce((sum, h) => sum + this.calculateStreak(h), 0);
    return Math.round(total / habits.length);
  });

  plateauAlert = computed(() => {
    const habits = this.habits();
    const lowHabits = habits.filter(h => h.consistency > 0 && h.consistency < 80);
    if (lowHabits.length === 0) return '';
    return `${lowHabits.length} habit${lowHabits.length > 1 ? 's' : ''} below 80% - Never miss twice!`;
  });

  optimalTime = computed(() => {
    const habits = this.habits();
    if (habits.length === 0) return '';
    
    const timeSlots: { [key: string]: number } = {};
    habits.forEach(h => {
      if (h.time && h.consistency > 0) {
        const hour = h.time.split(':')[0];
        timeSlots[hour] = (timeSlots[hour] || 0) + h.consistency;
      }
    });
    
    const bestHour = Object.entries(timeSlots).sort((a, b) => b[1] - a[1])[0];
    if (!bestHour) return '';
    return `You're most consistent at ${bestHour[0]}:00 - Schedule important habits then`;
  });

  habitPairing = computed(() => {
    const habits = this.habits();
    const highPerformers = habits.filter(h => h.consistency >= 80).slice(0, 2);
    const lowPerformers = habits.filter(h => h.consistency < 80 && h.consistency > 0).slice(0, 1);
    
    if (highPerformers.length > 0 && lowPerformers.length > 0) {
      return `Stack "${lowPerformers[0].action}" after "${highPerformers[0].action}" for better results`;
    }
    return '';
  });

  streakLeaders = computed(() => {
    const habits = this.habits();
    const streaks = habits.map(h => ({
      name: h.action,
      streak: this.calculateStreak(h)
    })).sort((a, b) => b.streak - a.streak).slice(0, 3);
    
    if (streaks.length === 0 || streaks[0].streak === 0) return '';
    return `🔥 Top 3: ${streaks.map(s => `${s.name} (${s.streak}d)`).join(', ')}`;
  });

  weekdayPerformance = computed(() => {
    const habits = this.habits();
    const weekStart = this.currentWeekStart();
    const dayScores: number[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
      if (date > new Date()) break;
      const dateStr = date.toISOString().split('T')[0];
      const completed = habits.filter(h => 
        this.habitService.getHabitState(h.id, dateStr) === 'done'
      ).length;
      dayScores.push(habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0);
    }
    
    if (dayScores.length === 0) return '';
    const maxScore = Math.max(...dayScores);
    const bestDay = dayScores.indexOf(maxScore);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return `You're strongest on ${days[bestDay]} (${maxScore}%)`;
  });

  timeBlockAnalysis = computed(() => {
    const habits = this.habits();
    let morningTotal = 0, morningCompleted = 0;
    let eveningTotal = 0, eveningCompleted = 0;
    
    habits.forEach(h => {
      if (!h.time) return;
      const hour = parseInt(h.time.split(':')[0]);
      const isMorning = hour >= 5 && hour < 12;
      
      if (isMorning) {
        morningTotal++;
        if (h.consistency > 0) morningCompleted += h.consistency;
      } else {
        eveningTotal++;
        if (h.consistency > 0) eveningCompleted += h.consistency;
      }
    });
    
    if (morningTotal === 0 && eveningTotal === 0) return '';
    const morningAvg = morningTotal > 0 ? Math.round(morningCompleted / morningTotal) : 0;
    const eveningAvg = eveningTotal > 0 ? Math.round(eveningCompleted / eveningTotal) : 0;
    return `Morning habits: ${morningAvg}%, Evening habits: ${eveningAvg}%`;
  });

  identityStrength = computed(() => {
    const habits = this.habits();
    const identityScores: { [key: string]: { total: number; consistency: number } } = {};
    
    habits.forEach(h => {
      if (!h.identity) return;
      if (!identityScores[h.identity]) {
        identityScores[h.identity] = { total: 0, consistency: 0 };
      }
      identityScores[h.identity].total++;
      identityScores[h.identity].consistency += h.consistency;
    });
    
    const identities = Object.entries(identityScores)
      .map(([name, data]) => ({
        name,
        avg: Math.round(data.consistency / data.total)
      }))
      .sort((a, b) => b.avg - a.avg);
    
    if (identities.length === 0) return '';
    return `You're living "${identities[0].name}" identity most (${identities[0].avg}%)`;
  });

  recoveryPattern = computed(() => {
    const habits = this.habits();
    let missedThenCompleted = 0;
    let totalMisses = 0;
    
    habits.forEach(h => {
      for (let i = 1; i < 7; i++) {
        if (!h.days[i - 1] && h.days[i]) {
          missedThenCompleted++;
        }
        if (!h.days[i - 1]) totalMisses++;
      }
    });
    
    if (totalMisses === 0) return '';
    const recoveryRate = Math.round((missedThenCompleted / totalMisses) * 100);
    return `You bounce back after misses ${recoveryRate}% of the time`;
  });

  compoundEffect = computed(() => {
    const current = this.avgConsistency();
    if (current === 0) return 'Start today - 1% daily improvement = 37x better in 1 year';
    const projected = Math.min(100, Math.round(current * Math.pow(1.01, 365)));
    return `At 1% daily improvement: ${current}% → ${projected}% in 1 year (${projected - current}% gain)`;
  });

  getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  previousWeek() {
    const current = this.currentWeekStart();
    this.currentWeekStart.set(new Date(current.getTime() - 7 * 24 * 60 * 60 * 1000));
  }

  nextWeek() {
    const current = this.currentWeekStart();
    this.currentWeekStart.set(new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000));
  }

  previousMonth() {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth() {
    const current = this.currentMonth();
    const next = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    if (next <= new Date()) {
      this.currentMonth.set(next);
    }
  }

  previousYear() {
    this.currentYear.set(this.currentYear() - 1);
  }

  nextYear() {
    if (this.currentYear() < new Date().getFullYear()) {
      this.currentYear.set(this.currentYear() + 1);
    }
  }

  isCurrentMonth(): boolean {
    const current = this.currentMonth();
    const now = new Date();
    return current.getFullYear() === now.getFullYear() && current.getMonth() === now.getMonth();
  }

  isCurrentYear(): boolean {
    return this.currentYear() === new Date().getFullYear();
  }

  toggleInsights() {
    this.showInsights.set(!this.showInsights());
  }

  toggleExpand(index: number) {
    this.expandedHabit.set(this.expandedHabit() === index ? null : index);
  }

  getTodayIndex(): number {
    const today = new Date();
    const weekStart = this.currentWeekStart();
    const diff = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff < 7 ? diff : -1;
  }

  addHabit() {
    const today = new Date().toISOString().split('T')[0];
    const newHabit = {
      id: Date.now().toString(),
      name: '',
      identity: '',
      trigger: { when: '', where: '' },
      time: '',
      cue: '',
      reward: '',
      frequency: 'daily' as const,
      color: '#6366f1',
      createdAt: new Date(),
      startDate: today
    };
    this.habitService.addHabit(newHabit);
  }

  calculateStreak(habit: WeeklyHabit): number {
    return habit.streak;
  }

  calculateTrueStreak(habitId: string): number {
    const habit = this.habitService.getHabitById(habitId);
    if (!habit) return 0;
    
    const logs = this.habitService.allLogs();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const maxDays = 100;
    
    for (let i = 0; i < maxDays; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Skip if not scheduled for this day
      if (!this.habitService.isHabitScheduledForDate(habit, date)) {
        continue;
      }
      
      const log = logs.find(l => l.habitId === habitId && l.date === dateStr);
      if (log?.completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  deleteHabit(index: number) {
    const habits = this.habits();
    if (index < 0 || index >= habits.length) return;
    const habit = habits[index];
    if (habit?.id) {
      this.habitService.deleteHabit(habit.id);
    }
  }

  updateHabit(index: number) {
    const habits = this.habits();
    if (index < 0 || index >= habits.length) return;
    const weeklyHabit = habits[index];
    if (!weeklyHabit?.id) return;
    
    const originalHabit = this.habitService.getHabitById(weeklyHabit.id);
    if (!originalHabit) return;
    
    const updatedHabit = {
      ...originalHabit,
      name: weeklyHabit.action,
      identity: weeklyHabit.identity,
      time: weeklyHabit.time,
      trigger: { ...originalHabit.trigger, when: weeklyHabit.trigger },
      twoMinuteRule: weeklyHabit.twoMinuteVersion,
      cue: weeklyHabit.cue,
      reward: weeklyHabit.reward,
      frequency: weeklyHabit.frequency
    };
    
    this.habitService.updateHabit(updatedHabit);
  }

  toggleDay(habitIndex: number, dayIndex: number) {
    const habits = this.habits();
    if (habitIndex < 0 || habitIndex >= habits.length) return;
    const habit = habits[habitIndex];
    if (!habit?.id || this.isFutureDay(dayIndex) || this.isBeforeCreated(habit, dayIndex)) return;
    
    const weekStart = this.currentWeekStart();
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    const dateStr = date.toISOString().split('T')[0];
    
    const currentState = this.habitService.getHabitState(habit.id, dateStr);
    this.habitService.logHabit(habit.id, dateStr, currentState !== 'done');
  }

  isFutureDay(dayIndex: number): boolean {
    const weekStart = this.currentWeekStart();
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate > today;
  }

  isBeforeCreated(habit: WeeklyHabit, dayIndex: number): boolean {
    const weekStart = this.currentWeekStart();
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    const createdDate = new Date(habit.createdDate);
    dayDate.setHours(0, 0, 0, 0);
    createdDate.setHours(0, 0, 0, 0);
    return dayDate < createdDate;
  }

  isScheduledDay(habit: WeeklyHabit, dayIndex: number): boolean {
    const originalHabit = this.habitService.getHabitById(habit.id);
    if (!originalHabit) return true;
    const weekStart = this.currentWeekStart();
    const date = new Date(weekStart.getTime() + dayIndex * 24 * 60 * 60 * 1000);
    return this.habitService.isHabitScheduledForDate(originalHabit, date);
  }

  getFrequencyLabel(habit: WeeklyHabit): string {
    const originalHabit = this.habitService.getHabitById(habit.id);
    if (!originalHabit) return 'Daily';
    if (originalHabit.frequency === 'daily') return 'Daily';
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return originalHabit.frequency.map(d => days[d]).join(',');
  }

  setFrequency(index: number, type: 'daily' | 'weekdays' | 'weekends' | 'custom') {
    const habits = this.habits();
    if (index < 0 || index >= habits.length) return;
    const weeklyHabit = habits[index];
    if (!weeklyHabit?.id) return;
    
    const originalHabit = this.habitService.getHabitById(weeklyHabit.id);
    if (!originalHabit) return;
    
    let frequency: 'daily' | number[];
    
    switch(type) {
      case 'daily':
        frequency = 'daily';
        break;
      case 'weekdays':
        frequency = [0,1,2,3,4];
        break;
      case 'weekends':
        frequency = [5,6];
        break;
      case 'custom':
        // For custom, use a pattern that won't match weekdays/weekends
        // Start with Mon/Wed/Fri as a clear custom pattern
        frequency = [0,2,4];
        break;
    }
    
    const updatedHabit = {
      ...originalHabit,
      frequency
    };
    
    this.habitService.updateHabit(updatedHabit);
  }

  toggleFrequencyDay(index: number, dayIndex: number) {
    const habits = this.habits();
    if (index < 0 || index >= habits.length) return;
    const weeklyHabit = habits[index];
    if (!weeklyHabit?.id) return;
    
    const originalHabit = this.habitService.getHabitById(weeklyHabit.id);
    if (!originalHabit || originalHabit.frequency === 'daily') return;
    
    const currentDays = [...originalHabit.frequency];
    const dayIdx = currentDays.indexOf(dayIndex);
    
    if (dayIdx > -1) {
      currentDays.splice(dayIdx, 1);
    } else {
      currentDays.push(dayIndex);
      currentDays.sort((a, b) => a - b);
    }
    
    if (currentDays.length === 0) return;
    
    const updatedHabit = {
      ...originalHabit,
      frequency: currentDays
    };
    
    this.habitService.updateHabit(updatedHabit);
  }

  isFrequencyDaySelected(habit: WeeklyHabit, dayIndex: number): boolean {
    if (habit.frequency === 'daily') return true;
    return habit.frequency.includes(dayIndex);
  }

  isWeekdaysOnly(habit: WeeklyHabit): boolean {
    if (habit.frequency === 'daily') return false;
    return habit.frequency.length === 5 && 
           habit.frequency.every(d => [0,1,2,3,4].includes(d));
  }

  isWeekendsOnly(habit: WeeklyHabit): boolean {
    if (habit.frequency === 'daily') return false;
    return habit.frequency.length === 2 && 
           habit.frequency.every(d => [5,6].includes(d));
  }

  isCustomFrequency(habit: WeeklyHabit): boolean {
    return habit.frequency !== 'daily' && 
           !this.isWeekdaysOnly(habit) && 
           !this.isWeekendsOnly(habit);
  }
}
