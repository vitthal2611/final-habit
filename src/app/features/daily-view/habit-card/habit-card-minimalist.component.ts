import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitState } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-minimalist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color">
      
      <div class="card-header">
        <div class="identity-dot" [style.background]="habit.color"></div>
        <span class="identity-label">{{ habit.identity }}</span>
        <div class="status-indicator" [class.done]="state === 'done'"></div>
      </div>

      <div class="habit-section">
        <h3 class="habit-name">{{ habit.name }}</h3>
        <p class="habit-context">{{ habit.trigger.when }}, {{ habit.trigger.where }}</p>
      </div>

      <div class="action-section" *ngIf="state === 'pending'">
        <button class="minimal-button" (click)="onComplete()">
          <span class="button-line"></span>
          <span class="button-text">Complete</span>
        </button>
      </div>

      <div class="completion-section" *ngIf="state === 'done'">
        <div class="completion-mark">✓</div>
        <div class="completion-text">
          <div class="reward">{{ habit.reward }}</div>
          <div class="identity">{{ habit.identity }}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="metrics-section">
        <div class="metric">
          <span class="metric-number">{{ metrics.streak }}</span>
          <span class="metric-unit">day streak</span>
        </div>
        <div class="metric">
          <span class="metric-number">{{ metrics.totalDays }}</span>
          <span class="metric-unit">total days</span>
        </div>
        <div class="metric">
          <span class="metric-number">{{ metrics.consistency }}%</span>
          <span class="metric-unit">consistency</span>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-label">This week</span>
          <span class="progress-count">{{ weeklyConsistency.completed }}/7</span>
        </div>
        <div class="progress-line">
          <div class="progress-active" [style.width.%]="(weeklyConsistency.completed / 7) * 100"></div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .habit-card {
      background: #fff;
      border: 1px solid #f0f0f0;
      border-radius: 2px;
      padding: 32px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      transition: border-color 0.2s ease;
    }

    .habit-card:hover {
      border-color: #e0e0e0;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .identity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .identity-label {
      font-size: 13px;
      color: #666;
      font-weight: 400;
      flex: 1;
    }

    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #e0e0e0;
      transition: background 0.2s ease;
    }

    .status-indicator.done {
      background: var(--habit-color);
    }

    .habit-section {
      margin-bottom: 32px;
    }

    .habit-name {
      font-size: 24px;
      font-weight: 300;
      color: #000;
      margin: 0 0 8px 0;
      line-height: 1.3;
      letter-spacing: -0.5px;
    }

    .habit-context {
      font-size: 15px;
      color: #999;
      margin: 0;
      font-weight: 300;
    }

    .action-section {
      margin-bottom: 32px;
    }

    .minimal-button {
      width: 100%;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .button-line {
      display: block;
      width: 100%;
      height: 1px;
      background: #e0e0e0;
      margin-bottom: 16px;
      transition: background 0.2s ease;
    }

    .minimal-button:hover .button-line {
      background: var(--habit-color);
    }

    .button-text {
      display: block;
      font-size: 16px;
      color: #666;
      font-weight: 300;
      text-align: center;
      padding: 16px 0;
      transition: color 0.2s ease;
    }

    .minimal-button:hover .button-text {
      color: var(--habit-color);
    }

    .completion-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
      padding: 24px 0;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
    }

    .completion-mark {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--habit-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 300;
    }

    .completion-text {
      flex: 1;
    }

    .reward {
      font-size: 16px;
      color: #000;
      font-weight: 300;
      margin-bottom: 4px;
    }

    .identity {
      font-size: 13px;
      color: #999;
      font-weight: 300;
    }

    .divider {
      height: 1px;
      background: #f0f0f0;
      margin: 32px 0;
    }

    .metrics-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 32px;
    }

    .metric {
      text-align: center;
    }

    .metric-number {
      display: block;
      font-size: 28px;
      font-weight: 200;
      color: var(--habit-color);
      margin-bottom: 4px;
      letter-spacing: -1px;
    }

    .metric-unit {
      font-size: 12px;
      color: #999;
      font-weight: 300;
      text-transform: lowercase;
    }

    .progress-section {
      margin-bottom: 0;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .progress-label {
      font-size: 13px;
      color: #999;
      font-weight: 300;
    }

    .progress-count {
      font-size: 13px;
      color: #666;
      font-weight: 300;
    }

    .progress-line {
      height: 1px;
      background: #f0f0f0;
      position: relative;
      overflow: hidden;
    }

    .progress-active {
      height: 100%;
      background: var(--habit-color);
      transition: width 0.6s ease;
    }

    @media (max-width: 768px) {
      .habit-card {
        padding: 24px;
      }

      .habit-name {
        font-size: 20px;
      }

      .metrics-section {
        gap: 16px;
      }

      .metric-number {
        font-size: 24px;
      }

      .completion-section {
        padding: 16px 0;
      }
    }
  `]
})
export class HabitCardMinimalistComponent {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() metrics = { streak: 0, totalDays: 0, consistency: 0 };
  
  @Output() complete = new EventEmitter<void>();

  onComplete() {
    this.complete.emit();
  }
}