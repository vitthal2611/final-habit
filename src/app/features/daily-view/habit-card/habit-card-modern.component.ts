import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Habit, HabitState } from '../../../core/models/habit.model';
import { ConfirmModalComponent } from '../../../shared/ui/confirm-modal.component';

@Component({
  selector: 'app-habit-card-modern',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  template: `
    <div class="card" [style.--color]="habit.color">
      
      <div class="header">
        <div class="badge">
          <span class="icon">✨</span>
          <span>{{ habit.identity }}</span>
          <span class="vote-count">{{ getVoteCount() }} votes</span>
        </div>
        <div class="actions">
          <button class="action-btn" (click)="onEdit()" type="button" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete" (click)="onDelete()" type="button" title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <div class="label">When</div>
          <div class="text">{{ habit.trigger.when }}</div>
        </div>
        <div class="box">
          <div class="label">I will</div>
          <div class="text">{{ habit.name }}</div>
        </div>
        <div class="box">
          <div class="label">At</div>
          <div class="text">{{ habit.time }}</div>
        </div>
        <div class="box">
          <div class="label">Where</div>
          <div class="text">{{ habit.trigger.where }}</div>
        </div>
      </div>

      <div class="two-minute" *ngIf="habit.twoMinuteRule">
        <span class="icon">⚡</span>
        <span>{{ habit.twoMinuteRule }}</span>
      </div>

      <div class="cue" *ngIf="habit.cue">
        <span class="icon">💡</span>
        <span>{{ habit.cue }}</span>
      </div>

      <div class="progress-input" *ngIf="habit.dailyProgress?.required && state === 'pending'">
        <label class="progress-label">Today's progress {{ habit.dailyProgress.target ? '(' + habit.dailyProgress.target + ' ' + habit.dailyProgress.measure + ')' : '' }}</label>
        <div class="input-group">
          <input 
            type="text" 
            [(ngModel)]="progressValue" 
            class="progress-field"
            [placeholder]="habit.dailyProgress.target?.toString() || '0'">
          <span class="measure">{{ habit.dailyProgress.measure }}</span>
        </div>
      </div>

      <button class="btn" *ngIf="state === 'pending'" (click)="onVote()">
        <span class="btn-icon">✓</span>
        <span>Vote</span>
      </button>

      <div class="never-miss-twice" *ngIf="state === 'pending' && missedYesterday()">
        <div class="warning-title">⚠️ Never Miss Twice</div>
        <div class="warning-text">Missing once is an accident. Missing twice is the start of a new habit. Get back on track quickly.</div>
      </div>

      <div class="done" *ngIf="state === 'done'">
        <span class="check">✓</span>
        <div class="done-content">
          <div class="done-text">{{ habit.reward }}</div>
          <div class="done-sub">You are {{ habit.identity }}</div>
          <div class="progress-display" *ngIf="habit.dailyProgress?.required && getProgressValue() > 0">
            {{ getProgressValue() }} {{ habit.dailyProgress.measure }}
          </div>
          <div class="cumulative" *ngIf="habit.dailyProgress?.required && getCumulativeProgress() > 0">
            Till date: {{ getCumulativeProgress() }} {{ habit.dailyProgress.measure }}
          </div>
        </div>
        <button class="undo-btn" (click)="undo.emit()" type="button" title="Undo vote">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="progress">
        <div class="progress-top">
          <span>This week</span>
          <span class="count">{{ weeklyConsistency.completed }}/7</span>
        </div>
        <div class="bar">
          <div class="fill" [style.width.%]="(weeklyConsistency.completed / 7) * 100"></div>
        </div>
      </div>

      <div class="popup-overlay" *ngIf="showCumulativePopup">
        <div class="popup-content">
          <div class="popup-icon">🎉</div>
          <div class="popup-title">Amazing Progress!</div>
          <div class="popup-stats">
            <div class="stat-label">Total Achievement</div>
            <div class="stat-value">{{ getCumulativeProgress() + progressValue }} {{ habit.dailyProgress!.measure }}</div>
          </div>
          <div class="popup-footer">Keep going, you're doing great!</div>
        </div>
      </div>

      <app-confirm-modal
        [show]="showDeleteModal"
        title="Delete Habit"
        message="Delete habit? This cannot be undone."
        (confirm)="confirmDelete()"
        (cancel)="showDeleteModal = false" />

    </div>
  `,
  styles: [`
    .card {
      background: #fff;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      border-left: 4px solid var(--color);
      position: relative;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .actions {
      display: flex;
      gap: 6px;
    }

    .action-btn {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      border: none;
      background: #f3f4f6;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    .action-btn:active {
      transform: scale(0.9);
      background: #e5e7eb;
    }

    .action-btn.delete {
      color: #ef4444;
    }

    .action-btn.delete:active {
      background: #fee2e2;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1));
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .vote-count {
      margin-left: 4px;
      padding: 2px 8px;
      background: #6366f1;
      color: white;
      border-radius: 10px;
      font-size: 11px;
    }

    .icon {
      font-size: 16px;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .box {
      padding: 16px;
      background: #f9fafb;
      border-radius: 12px;
      border: 1px solid #f3f4f6;
    }

    .label {
      font-size: 10px;
      font-weight: 700;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .text {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
      line-height: 1.4;
    }

    .btn {
      width: 100%;
      padding: 16px;
      background: var(--color);
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-bottom: 20px;
      transition: transform 0.2s;
    }

    .progress-input {
      margin-bottom: 20px;
    }

    .progress-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #f9fafb;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
    }

    .progress-field {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      outline: none;
      -webkit-appearance: none;
      -moz-appearance: textfield;
    }

    .measure {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
    }

    .progress-display {
      margin-top: 4px;
      font-size: 13px;
      font-weight: 600;
      color: #047857;
    }

    .cumulative {
      margin-top: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #6366f1;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn-icon {
      font-size: 20px;
      font-weight: bold;
    }

    .done {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      border-radius: 14px;
      margin-bottom: 20px;
      position: relative;
    }

    .done-content {
      flex: 1;
    }

    .undo-btn {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      border: none;
      background: rgba(255,255,255,0.5);
      color: #065f46;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    .undo-btn:active {
      transform: scale(0.9);
      background: rgba(255,255,255,0.8);
    }

    .check {
      width: 32px;
      height: 32px;
      background: #059669;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    }

    .done-text {
      font-size: 15px;
      font-weight: 600;
      color: #065f46;
    }

    .done-sub {
      font-size: 13px;
      color: #047857;
    }



    .progress {
      padding: 16px;
      background: #fafafa;
      border-radius: 14px;
    }

    .progress-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
    }

    .count {
      font-size: 16px;
      font-weight: 700;
      color: var(--color);
    }

    .bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .fill {
      height: 100%;
      background: var(--color);
      transition: width 0.3s;
    }

    .two-minute {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 13px;
      font-weight: 600;
      color: #92400e;
    }

    .cue {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 13px;
      font-weight: 600;
      color: #1e40af;
    }

    .never-miss-twice {
      padding: 16px;
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border-radius: 12px;
      border-left: 4px solid #ef4444;
      margin-bottom: 20px;
    }

    .warning-title {
      font-size: 14px;
      font-weight: 700;
      color: #991b1b;
      margin-bottom: 6px;
    }

    .warning-text {
      font-size: 12px;
      color: #7f1d1d;
      line-height: 1.5;
    }

    @media (min-width: 768px) {
      .action-btn:hover {
        background: #e5e7eb;
      }

      .action-btn.delete:hover {
        background: #fee2e2;
      }
    }

    .popup-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      border-radius: 20px;
      animation: fadeIn 0.2s ease-in-out;
    }

    .popup-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 32px;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
      text-align: center;
      min-width: 300px;
      max-width: 400px;
      animation: scaleIn 0.3s ease-in-out;
      color: white;
    }

    .popup-icon {
      font-size: 64px;
      margin-bottom: 16px;
      animation: bounce 0.6s ease-in-out;
    }

    .popup-title {
      font-size: 24px;
      font-weight: 700;
      color: white;
      margin-bottom: 24px;
    }

    .popup-stats {
      background: rgba(255, 255, 255, 0.2);
      padding: 20px;
      border-radius: 16px;
      margin-bottom: 16px;
      backdrop-filter: blur(10px);
    }

    .stat-label {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      color: white;
    }

    .popup-footer {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `]
})
export class HabitCardModernComponent {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() habitService: any;
  
  @Output() complete = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() progressUpdate = new EventEmitter<number>();

  progressValue: number = 0;
  showCumulativePopup = false;
  showDeleteModal = false;

  // Cache logs for performance
  private logsCache = computed(() => this.habitService?.allLogs() || []);
  private habitLogs = computed(() => 
    this.logsCache().filter((l: any) => l.habitId === this.habit.id)
  );

  onVote() {
    if (this.habit.dailyProgress?.required) {
      this.progressUpdate.emit(this.progressValue);
      this.showCumulativePopup = true;
      setTimeout(() => {
        this.showCumulativePopup = false;
      }, 2500);
      setTimeout(() => {
        this.complete.emit();
      }, 2600);
    } else {
      this.complete.emit();
    }
  }

  getCumulativeProgress(): number {
    if (!this.habitService || !this.habit.dailyProgress?.required) return 0;
    return this.habitLogs()
      .filter((l: any) => l.progressValue)
      .reduce((sum: number, l: any) => sum + (l.progressValue || 0), 0);
  }

  getProgressValue(): number {
    if (!this.habitService) return 0;
    const today = new Date().toISOString().split('T')[0];
    const log = this.habitLogs().find((l: any) => l.date === today);
    return log?.progressValue || 0;
  }

  getVoteCount(): number {
    if (!this.habitService) return 0;
    return this.habitLogs().filter((l: any) => l.completed).length;
  }

  missedYesterday(): boolean {
    if (!this.habitService) return false;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    return this.habitService.getHabitState(this.habit.id, yesterday) === 'missed';
  }

  onEdit() {
    this.edit.emit(this.habit.id);
  }

  onDelete() {
    this.showDeleteModal = true;
  }

  confirmDelete() {
    this.showDeleteModal = false;
    this.delete.emit(this.habit.id);
  }
}
