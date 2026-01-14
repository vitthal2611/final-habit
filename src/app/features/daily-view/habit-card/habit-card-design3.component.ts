import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitState } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-design3',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color">
      
      <!-- Identity Header -->
      <div class="identity-header">
        <div class="identity-statement">{{ habit.identity }}</div>
        <div class="habit-actions">
          <button class="action-icon" (click)="onEdit()" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-icon" (click)="onDelete()" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Implementation Statement -->
      <div class="implementation-statement">
        <div class="statement-row">
          <span class="label">After I</span>
          <span class="value">{{ habit.trigger.when }}</span>
        </div>
        <div class="statement-row">
          <span class="label">I will</span>
          <span class="value">{{ habit.name }}</span>
        </div>
        <div class="context-row">
          <div class="context-item">
            <span class="context-icon">🕐</span>
            <span class="context-text">{{ habit.time }}</span>
          </div>
          <div class="context-item">
            <span class="context-icon">📍</span>
            <span class="context-text">{{ habit.trigger.where }}</span>
          </div>
        </div>
        <div class="cue-section" *ngIf="habit.cue">
          <span class="cue-icon">💡</span>
          <span class="cue-text">{{ habit.cue }}</span>
        </div>
        <div class="two-minute-section" *ngIf="habit.twoMinuteRule">
          <span class="two-minute-icon">⚡</span>
          <span class="two-minute-text">{{ habit.twoMinuteRule }}</span>
        </div>
      </div>

      <!-- Action Section -->
      <div class="action-section">
        <!-- Pending State -->
        <div class="action-buttons" *ngIf="state === 'pending'">
          <button class="complete-button" (click)="onComplete()">
            <div class="button-inner">
              <div class="button-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <span class="button-text">Mark Complete</span>
            </div>
          </button>
          <button class="skip-button" (click)="onSkip()">
            <span>Skip Today</span>
          </button>
        </div>

        <!-- Completed State -->
        <div *ngIf="state === 'done'" class="completed-message">
          <div class="completed-icon">🎉</div>
          <div class="completed-text">
            <div class="reward-text">{{ habit.reward }}</div>
            <div class="identity-text">You are {{ habit.identity }}</div>
          </div>
          <button class="undo-button" (click)="onUndo()" title="Undo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7v6h6"></path>
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
            </svg>
          </button>
        </div>

        <!-- Missed State -->
        <div *ngIf="state === 'missed'" class="missed-message">
          <div class="missed-icon">💭</div>
          <div class="missed-text">Tomorrow is a new opportunity</div>
          <button class="undo-button" (click)="onUndo()" title="Undo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7v6h6"></path>
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">This Week</span>
          <span class="progress-value">{{ weeklyConsistency.completed }}/7</span>
        </div>
        
        <div class="progress-grid">
          <div *ngFor="let day of getWeekDays(); let i = index" 
               class="day-cell"
               [class.completed]="i < weeklyConsistency.completed"
               [class.today]="isToday(i)"
               [style.background]="i < weeklyConsistency.completed ? habit.color : 'transparent'">
            <span class="day-label">{{ day }}</span>
          </div>
        </div>

        <div class="streak-info" *ngIf="weeklyConsistency.completed > 0">
          <div class="streak-icon">🔥</div>
          <span class="streak-text">{{ getStreakText() }}</span>
        </div>

        <!-- Metrics Row -->
        <div class="metrics-row">
          <div class="metric-box">
            <div class="metric-number">{{ metrics.streak }}</div>
            <div class="metric-text">Streak</div>
          </div>
          <div class="metric-box">
            <div class="metric-number">{{ metrics.totalDays }}</div>
            <div class="metric-text">Done</div>
          </div>
          <div class="metric-box">
            <div class="metric-number">{{ metrics.skipCount }}</div>
            <div class="metric-text">Skips</div>
          </div>
          <div class="metric-box">
            <div class="metric-number">{{ metrics.totalLoggedDays }}</div>
            <div class="metric-text">Total</div>
          </div>
          <div class="metric-box">
            <div class="metric-number">{{ metrics.consistency }}%</div>
            <div class="metric-text">Rate</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .identity-header {
      margin: -20px -20px 20px -20px;
      padding: 16px 20px;
      background: var(--habit-color);
      border-radius: 18px 18px 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .identity-statement {
      font-size: 15px;
      font-weight: 600;
      color: white;
      line-height: 1.4;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      flex: 1;
    }

    .habit-card {
      background: white;
      border-radius: 18px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #f1f5f9;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .habit-card:active {
      transform: scale(0.99);
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.12);
    }

    .habit-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .action-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .action-icon:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skip-button {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border: 2px solid #f59e0b;
      border-radius: 10px;
      color: #92400e;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .skip-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      transition: left 0.3s ease;
      z-index: 1;
    }

    .skip-button:hover::before {
      left: 0;
    }

    .skip-button span {
      position: relative;
      z-index: 2;
      transition: color 0.3s ease;
    }

    .skip-button:hover span {
      color: white;
    }

    .skip-button:active {
      transform: scale(0.98);
    }

    .undo-button {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .undo-button:hover {
      background: #f8fafc;
      color: #475569;
    }

    .implementation-statement {
      margin-bottom: 20px;
      padding: 16px;
      background: white;
      border-radius: 12px;
      border: 2px solid #f1f5f9;
    }

    .statement-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 10px;
    }

    .statement-row:last-of-type {
      margin-bottom: 12px;
    }

    .statement-row .label {
      font-size: 12px;
      font-weight: 700;
      color: var(--habit-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 70px;
      flex-shrink: 0;
    }

    .statement-row .value {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.4;
      flex: 1;
    }

    .context-row {
      display: flex;
      gap: 16px;
      padding: 10px 0;
      border-top: 1px solid #f1f5f9;
      margin-bottom: 8px;
    }

    .context-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .context-icon {
      font-size: 14px;
    }

    .context-text {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }

    .cue-section,
    .two-minute-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }

    .cue-section:first-of-type {
      margin-top: 12px;
    }

    .two-minute-section {
      border-top: none;
      margin-top: 8px;
      padding-top: 0;
    }

    .cue-icon,
    .two-minute-icon {
      font-size: 16px;
    }

    .cue-text,
    .two-minute-text {
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
      font-style: italic;
    }

    .action-section {
      margin-bottom: 20px;
    }

    .complete-button {
      width: 100%;
      padding: 0;
      border: none;
      background: white;
      border: 2px solid var(--habit-color);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
      position: relative;
    }

    .complete-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: var(--habit-color);
      transition: left 0.3s ease;
      z-index: 1;
    }

    .complete-button:hover::before {
      left: 0;
    }

    .button-inner {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px;
      color: var(--habit-color);
      transition: color 0.3s ease;
    }

    .complete-button:hover .button-inner {
      color: white;
    }

    .button-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .button-text {
      font-size: 16px;
      font-weight: 600;
    }

    .completed-message,
    .missed-message {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border-radius: 14px;
    }

    .completed-message {
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border: 1px solid #a7f3d0;
    }

    .missed-message {
      background: linear-gradient(135deg, #fefce8, #fef3c7);
      border: 1px solid #fde68a;
    }

    .completed-icon,
    .missed-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .completed-text,
    .missed-text {
      flex: 1;
    }

    .reward-text {
      font-size: 15px;
      font-weight: 600;
      color: #065f46;
      margin-bottom: 4px;
    }

    .identity-text {
      font-size: 13px;
      color: #047857;
    }

    .missed-text {
      font-size: 14px;
      color: #92400e;
      font-weight: 500;
    }

    .progress-section {
      background: #fafbfc;
      border-radius: 12px;
      padding: 16px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .progress-label {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
    }

    .progress-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--habit-color);
    }

    .progress-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }

    .day-cell {
      aspect-ratio: 1;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
    }

    .day-cell.completed {
      border-color: var(--habit-color);
      transform: scale(1.05);
    }

    .day-cell.today {
      border-color: #6366f1;
      border-width: 3px;
    }

    .day-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    .day-cell.completed .day-label {
      color: white;
    }

    .streak-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      background: rgba(var(--habit-color), 0.1);
      border-radius: 8px;
    }

    .streak-icon {
      font-size: 16px;
    }

    .streak-text {
      font-size: 13px;
      font-weight: 600;
      color: var(--habit-color);
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-top: 12px;
    }

    .metric-box {
      text-align: center;
      padding: 10px 6px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .metric-number {
      font-size: 16px;
      font-weight: 700;
      color: var(--habit-color);
      margin-bottom: 2px;
    }

    .metric-text {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }

    @media (max-width: 768px) {
      .identity-header {
        padding: 14px 16px;
      }

      .identity-statement {
        font-size: 14px;
      }

      .action-icon {
        width: 28px;
        height: 28px;
      }

      .implementation-statement {
        padding: 14px;
      }

      .statement-text {
        font-size: 14px;
      }

      .button-inner {
        padding: 14px;
      }

      .button-text {
        font-size: 15px;
      }

      .progress-grid {
        gap: 6px;
      }

      .day-label {
        font-size: 10px;
      }
    }
  `]
})
export class HabitCardDesign3Component {
  @Input() habit!: Habit;
  @Input() currentDate!: Date;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() metrics = { streak: 0, totalDays: 0, consistency: 0, skipCount: 0, totalLoggedDays: 0 };
  
  @Output() complete = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onComplete() {
    this.complete.emit();
  }

  onSkip() {
    this.skip.emit();
  }

  onUndo() {
    this.undo.emit();
  }

  onEdit() {
    this.edit.emit();
  }

  onDelete() {
    this.delete.emit();
  }

  getHabitIcon(): string {
    // Simple icon mapping based on habit name or identity
    const name = this.habit.name.toLowerCase();
    if (name.includes('read')) return '📚';
    if (name.includes('exercise') || name.includes('workout')) return '💪';
    if (name.includes('meditat')) return '🧘';
    if (name.includes('water') || name.includes('drink')) return '💧';
    if (name.includes('sleep')) return '😴';
    if (name.includes('write')) return '✍️';
    if (name.includes('walk')) return '🚶';
    return '⭐';
  }

  getWeekDays(): string[] {
    return ['M', 'T', 'W', 'R', 'F', 'S', 'U'];
  }

  isToday(dayIndex: number): boolean {
    if (!this.currentDate) return false;
    const today = this.currentDate.getDay(); // 0=Sunday, 1=Monday, 2=Tuesday, etc.
    const mondayBasedIndex = (today + 6) % 7; // Convert to Monday=0 based
    return dayIndex === mondayBasedIndex;
  }

  getStreakText(): string {
    const completed = this.weeklyConsistency.completed;
    if (completed === 7) return 'Perfect week!';
    if (completed >= 5) return 'Great consistency!';
    if (completed >= 3) return 'Building momentum';
    return 'Keep going!';
  }
}