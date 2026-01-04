import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitState } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-modern',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [style.--color]="habit.color">
      
      <div class="badge">
        <span class="icon">✨</span>
        <span>{{ habit.identity }}</span>
        <span class="vote-count">{{ getVoteCount() }} votes</span>
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

      <button class="btn" *ngIf="state === 'pending'" (click)="complete.emit()">
        <span class="btn-icon">✓</span>
        <span>Vote</span>
      </button>

      <div class="never-miss-twice" *ngIf="state === 'pending' && missedYesterday()">
        <div class="warning-title">⚠️ Never Miss Twice</div>
        <div class="warning-text">Missing once is an accident. Missing twice is the start of a new habit. Get back on track quickly.</div>
      </div>

      <div class="done" *ngIf="state === 'done'">
        <span class="check">✓</span>
        <div>
          <div class="done-text">{{ habit.reward }}</div>
          <div class="done-sub">You are {{ habit.identity }}</div>
        </div>
      </div>

      <div class="missed" *ngIf="state === 'missed'">
        <span>Not today</span>
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

    </div>
  `,
  styles: [`
    .card {
      background: #fff;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      border-left: 4px solid var(--color);
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
      margin-bottom: 20px;
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

    .missed {
      padding: 14px;
      text-align: center;
      background: #f9fafb;
      border-radius: 12px;
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 20px;
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
  `]
})
export class HabitCardModernComponent {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() habitService: any;
  
  @Output() complete = new EventEmitter<void>();

  getVoteCount(): number {
    if (!this.habitService) return 0;
    return this.habitService.allLogs()
      .filter((l: any) => l.habitId === this.habit.id && l.completed)
      .length;
  }

  missedYesterday(): boolean {
    if (!this.habitService) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    return this.habitService.getHabitState(this.habit.id, dateStr) === 'missed';
  }
}
