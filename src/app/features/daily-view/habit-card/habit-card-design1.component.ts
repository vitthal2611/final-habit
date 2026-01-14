import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitState } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-design1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color">
      <!-- Identity Badge -->
      <div class="identity-section">
        <div class="identity-badge">
          <span class="identity-icon">✨</span>
          <span class="identity-text">{{ habit.identity }}</span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-section">
        <h2 class="habit-name">{{ habit.name }}</h2>
        <p class="habit-trigger">{{ habit.trigger.when }} • {{ habit.trigger.where }}</p>
      </div>

      <!-- Action Button -->
      <div class="action-section" *ngIf="state === 'pending'">
        <button class="action-btn" (click)="onComplete()">
          <div class="btn-content">
            <div class="check-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span>I showed up today</span>
          </div>
        </button>
      </div>

      <!-- Completed State -->
      <div class="completed-section" *ngIf="state === 'done'">
        <div class="success-icon">🎉</div>
        <div class="success-text">
          <div class="reward">{{ habit.reward }}</div>
          <div class="identity-reinforcement">You are {{ habit.identity }}</div>
        </div>
      </div>

      <!-- Weekly Progress -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Weekly Progress</span>
          <span class="progress-count">{{ weeklyConsistency.completed }}/7</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="(weeklyConsistency.completed / 7) * 100"></div>
        </div>
      </div>

      <!-- Metrics Section -->
      <div class="metrics-section">
        <div class="metric-item">
          <div class="metric-value">{{ metrics.streak }}</div>
          <div class="metric-label">Day Streak</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">{{ metrics.totalDays }}</div>
          <div class="metric-label">Total Days</div>
        </div>
        <div class="metric-item">
          <div class="metric-value">{{ metrics.consistency }}%</div>
          <div class="metric-label">Consistency</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .habit-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 24px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .habit-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--habit-color), rgba(var(--habit-color), 0.6));
      border-radius: 24px 24px 0 0;
    }

    .identity-section {
      margin-bottom: 20px;
    }

    .identity-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(var(--habit-color), 0.1);
      border: 1px solid rgba(var(--habit-color), 0.2);
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    .identity-icon {
      font-size: 14px;
    }

    .identity-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--habit-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .content-section {
      margin-bottom: 24px;
    }

    .habit-name {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }

    .habit-trigger {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
      opacity: 0.8;
    }

    .action-section {
      margin-bottom: 20px;
    }

    .action-btn {
      width: 100%;
      padding: 0;
      background: linear-gradient(135deg, var(--habit-color), rgba(var(--habit-color), 0.8));
      border: none;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(var(--habit-color), 0.3);
      overflow: hidden;
      position: relative;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .action-btn:hover::before {
      left: 100%;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px;
      color: white;
      font-size: 16px;
      font-weight: 600;
      position: relative;
      z-index: 1;
    }

    .check-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .completed-section {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border-radius: 16px;
      margin-bottom: 20px;
      border: 1px solid #a7f3d0;
    }

    .success-icon {
      font-size: 24px;
      animation: bounce 0.6s ease-in-out;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }

    .success-text {
      flex: 1;
    }

    .reward {
      font-size: 15px;
      font-weight: 600;
      color: #065f46;
      margin-bottom: 4px;
    }

    .identity-reinforcement {
      font-size: 13px;
      color: #047857;
      opacity: 0.8;
    }

    .progress-section {
      padding: 16px;
      background: rgba(249, 250, 251, 0.8);
      border-radius: 12px;
      backdrop-filter: blur(10px);
      margin-bottom: 16px;
    }

    .metrics-section {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: rgba(249, 250, 251, 0.8);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .metric-item {
      flex: 1;
      text-align: center;
      padding: 12px 8px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 8px;
      backdrop-filter: blur(5px);
    }

    .metric-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--habit-color);
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .progress-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .progress-count {
      font-size: 16px;
      font-weight: 700;
      color: var(--habit-color);
    }

    .progress-bar {
      height: 8px;
      background: rgba(229, 231, 235, 0.6);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--habit-color), rgba(var(--habit-color), 0.7));
      border-radius: 4px;
      transition: width 0.6s ease;
      position: relative;
    }

    .progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    @media (max-width: 768px) {
      .habit-card {
        padding: 20px;
        border-radius: 20px;
      }

      .habit-name {
        font-size: 18px;
      }

      .btn-content {
        padding: 14px;
        font-size: 15px;
      }
    }
  `]
})
export class HabitCardDesign1Component {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() metrics = { streak: 0, totalDays: 0, consistency: 0 };
  
  @Output() complete = new EventEmitter<void>();

  onComplete() {
    this.complete.emit();
  }
}