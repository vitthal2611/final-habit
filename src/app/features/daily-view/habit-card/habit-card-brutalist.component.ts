import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitState } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-brutalist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color">
      
      <div class="header-block">
        <div class="identity-tag">
          <span class="tag-text">{{ habit.identity.toUpperCase() }}</span>
        </div>
        <div class="status-block" [class.completed]="state === 'done'">
          {{ state === 'done' ? 'DONE' : 'TODO' }}
        </div>
      </div>

      <div class="content-block">
        <h2 class="habit-title">{{ habit.name.toUpperCase() }}</h2>
        <div class="context-bar">
          <span class="context-item">{{ habit.trigger.when.toUpperCase() }}</span>
          <span class="separator">|</span>
          <span class="context-item">{{ habit.trigger.where.toUpperCase() }}</span>
        </div>
      </div>

      <div class="action-block" *ngIf="state === 'pending'">
        <button class="brutal-button" (click)="onComplete()">
          <span class="button-bg"></span>
          <span class="button-text">EXECUTE</span>
        </button>
      </div>

      <div class="success-block" *ngIf="state === 'done'">
        <div class="success-bar"></div>
        <div class="success-content">
          <div class="reward-text">{{ habit.reward.toUpperCase() }}</div>
          <div class="identity-text">{{ habit.identity.toUpperCase() }} STATUS: ACTIVE</div>
        </div>
      </div>

      <div class="metrics-block">
        <div class="metric-unit">
          <div class="metric-header">STREAK</div>
          <div class="metric-value">{{ metrics.streak }}</div>
        </div>
        <div class="metric-unit">
          <div class="metric-header">TOTAL</div>
          <div class="metric-value">{{ metrics.totalDays }}</div>
        </div>
        <div class="metric-unit">
          <div class="metric-header">RATE</div>
          <div class="metric-value">{{ metrics.consistency }}%</div>
        </div>
      </div>

      <div class="progress-block">
        <div class="progress-header">
          <span>WEEKLY PROGRESS</span>
          <span class="progress-ratio">{{ weeklyConsistency.completed }}/7</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar" [style.width.%]="(weeklyConsistency.completed / 7) * 100"></div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .habit-card {
      background: #fff;
      border: 4px solid #000;
      padding: 0;
      font-family: 'Courier New', monospace;
      box-shadow: 8px 8px 0 #000;
      transition: transform 0.1s ease;
    }

    .habit-card:active {
      transform: translate(2px, 2px);
      box-shadow: 6px 6px 0 #000;
    }

    .header-block {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #000;
      color: #fff;
    }

    .identity-tag {
      background: var(--habit-color);
      color: #000;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1px;
    }

    .tag-text {
      display: block;
    }

    .status-block {
      background: #fff;
      color: #000;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1px;
      border: 2px solid #000;
    }

    .status-block.completed {
      background: var(--habit-color);
      color: #000;
    }

    .content-block {
      padding: 20px 16px;
      border-bottom: 2px solid #000;
    }

    .habit-title {
      font-size: 18px;
      font-weight: 900;
      color: #000;
      margin: 0 0 12px 0;
      line-height: 1.2;
      letter-spacing: 1px;
    }

    .context-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 700;
      color: #666;
    }

    .context-item {
      letter-spacing: 0.5px;
    }

    .separator {
      font-weight: 900;
      color: #000;
    }

    .action-block {
      padding: 16px;
      border-bottom: 2px solid #000;
    }

    .brutal-button {
      width: 100%;
      padding: 0;
      border: 3px solid #000;
      background: #fff;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.1s ease;
    }

    .brutal-button:active {
      transform: translate(1px, 1px);
    }

    .button-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--habit-color);
      transform: translateX(-100%);
      transition: transform 0.2s ease;
    }

    .brutal-button:hover .button-bg {
      transform: translateX(0);
    }

    .button-text {
      position: relative;
      z-index: 1;
      display: block;
      padding: 16px;
      font-size: 14px;
      font-weight: 900;
      color: #000;
      letter-spacing: 2px;
    }

    .success-block {
      padding: 16px;
      border-bottom: 2px solid #000;
      position: relative;
    }

    .success-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: var(--habit-color);
    }

    .success-content {
      padding-top: 8px;
    }

    .reward-text {
      font-size: 13px;
      font-weight: 900;
      color: #000;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }

    .identity-text {
      font-size: 10px;
      font-weight: 700;
      color: #666;
      letter-spacing: 1px;
    }

    .metrics-block {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border-bottom: 2px solid #000;
    }

    .metric-unit {
      padding: 16px;
      text-align: center;
      border-right: 2px solid #000;
    }

    .metric-unit:last-child {
      border-right: none;
    }

    .metric-header {
      font-size: 9px;
      font-weight: 900;
      color: #666;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }

    .metric-value {
      font-size: 20px;
      font-weight: 900;
      color: var(--habit-color);
      letter-spacing: 1px;
    }

    .progress-block {
      padding: 16px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 10px;
      font-weight: 900;
      color: #000;
      letter-spacing: 1px;
    }

    .progress-ratio {
      background: #000;
      color: #fff;
      padding: 2px 8px;
    }

    .progress-container {
      height: 16px;
      background: #f0f0f0;
      border: 2px solid #000;
      position: relative;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      background: var(--habit-color);
      transition: width 0.3s ease;
      position: relative;
    }

    .progress-bar::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 2px;
      height: 100%;
      background: #000;
    }

    @media (max-width: 768px) {
      .habit-card {
        border-width: 3px;
        box-shadow: 6px 6px 0 #000;
      }

      .habit-card:active {
        transform: translate(1px, 1px);
        box-shadow: 5px 5px 0 #000;
      }

      .header-block {
        padding: 12px;
      }

      .content-block {
        padding: 16px 12px;
      }

      .habit-title {
        font-size: 16px;
      }

      .metric-unit {
        padding: 12px 8px;
      }

      .metric-value {
        font-size: 18px;
      }
    }
  `]
})
export class HabitCardBrutalistComponent {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() metrics = { streak: 0, totalDays: 0, consistency: 0 };
  
  @Output() complete = new EventEmitter<void>();

  onComplete() {
    this.complete.emit();
  }
}