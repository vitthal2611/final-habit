import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitState } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-neumorphism',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color">
      <div class="card-surface">
        
        <div class="identity-bubble">
          <span class="identity-icon">{{ getIdentityIcon() }}</span>
          <span class="identity-text">{{ habit.identity }}</span>
        </div>

        <div class="habit-content">
          <h3 class="habit-name">{{ habit.name }}</h3>
          <p class="habit-details">{{ habit.trigger.when }} • {{ habit.trigger.where }}</p>
        </div>

        <div class="action-area" *ngIf="state === 'pending'">
          <button class="neuro-button" (click)="onComplete()">
            <div class="button-surface">
              <span class="check-symbol">✓</span>
              <span>Complete</span>
            </div>
          </button>
        </div>

        <div class="completed-area" *ngIf="state === 'done'">
          <div class="success-bubble">
            <div class="success-icon">🌟</div>
            <div class="success-info">
              <div class="reward">{{ habit.reward }}</div>
              <div class="identity-boost">You are {{ habit.identity }}</div>
            </div>
          </div>
        </div>

        <div class="stats-panel">
          <div class="stat-bubble">
            <div class="stat-value">{{ metrics.streak }}</div>
            <div class="stat-name">Streak</div>
          </div>
          <div class="stat-bubble">
            <div class="stat-value">{{ metrics.totalDays }}</div>
            <div class="stat-name">Days</div>
          </div>
          <div class="stat-bubble">
            <div class="stat-value">{{ metrics.consistency }}%</div>
            <div class="stat-name">Rate</div>
          </div>
        </div>

        <div class="progress-panel">
          <div class="progress-label">Weekly: {{ weeklyConsistency.completed }}/7</div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="(weeklyConsistency.completed / 7) * 100"></div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .habit-card {
      background: #e6e7ee;
      border-radius: 24px;
      padding: 4px;
    }

    .card-surface {
      background: #e6e7ee;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 
        12px 12px 24px #d1d2d9,
        -12px -12px 24px #fbfcff;
    }

    .identity-bubble {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #e6e7ee;
      border-radius: 16px;
      margin-bottom: 20px;
      box-shadow: 
        inset 4px 4px 8px #d1d2d9,
        inset -4px -4px 8px #fbfcff;
    }

    .identity-icon {
      font-size: 16px;
    }

    .identity-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--habit-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .habit-content {
      margin-bottom: 24px;
    }

    .habit-name {
      font-size: 20px;
      font-weight: 700;
      color: #4a5568;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }

    .habit-details {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }

    .action-area {
      margin-bottom: 24px;
    }

    .neuro-button {
      width: 100%;
      padding: 4px;
      background: #e6e7ee;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      box-shadow: 
        8px 8px 16px #d1d2d9,
        -8px -8px 16px #fbfcff;
      transition: all 0.2s ease;
    }

    .neuro-button:active {
      box-shadow: 
        inset 4px 4px 8px #d1d2d9,
        inset -4px -4px 8px #fbfcff;
    }

    .button-surface {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(145deg, #f0f1f8, #dcdde4);
      border-radius: 12px;
      color: var(--habit-color);
      font-size: 16px;
      font-weight: 600;
    }

    .check-symbol {
      width: 24px;
      height: 24px;
      background: var(--habit-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 
        2px 2px 4px rgba(0,0,0,0.1),
        -1px -1px 2px rgba(255,255,255,0.8);
    }

    .completed-area {
      margin-bottom: 24px;
    }

    .success-bubble {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #e6e7ee;
      border-radius: 16px;
      box-shadow: 
        inset 6px 6px 12px #d1d2d9,
        inset -6px -6px 12px #fbfcff;
    }

    .success-icon {
      font-size: 24px;
      width: 48px;
      height: 48px;
      background: linear-gradient(145deg, #f0f1f8, #dcdde4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        4px 4px 8px #d1d2d9,
        -4px -4px 8px #fbfcff;
    }

    .success-info {
      flex: 1;
    }

    .reward {
      font-size: 15px;
      font-weight: 600;
      color: var(--habit-color);
      margin-bottom: 4px;
    }

    .identity-boost {
      font-size: 13px;
      color: #718096;
    }

    .stats-panel {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-bubble {
      text-align: center;
      padding: 16px 12px;
      background: #e6e7ee;
      border-radius: 16px;
      box-shadow: 
        6px 6px 12px #d1d2d9,
        -6px -6px 12px #fbfcff;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--habit-color);
      margin-bottom: 4px;
    }

    .stat-name {
      font-size: 11px;
      font-weight: 600;
      color: #718096;
      text-transform: uppercase;
    }

    .progress-panel {
      padding: 16px;
      background: #e6e7ee;
      border-radius: 16px;
      box-shadow: 
        inset 4px 4px 8px #d1d2d9,
        inset -4px -4px 8px #fbfcff;
    }

    .progress-label {
      font-size: 12px;
      font-weight: 600;
      color: #718096;
      margin-bottom: 12px;
      text-align: center;
    }

    .progress-track {
      height: 12px;
      background: #d1d2d9;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 
        inset 2px 2px 4px #c1c2c9,
        inset -2px -2px 4px #e1e2e9;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--habit-color), rgba(var(--habit-color), 0.8));
      border-radius: 6px;
      transition: width 0.6s ease;
      box-shadow: 
        1px 1px 2px rgba(0,0,0,0.1);
    }

    @media (max-width: 768px) {
      .card-surface {
        padding: 20px;
      }

      .stats-panel {
        gap: 12px;
      }

      .stat-bubble {
        padding: 12px 8px;
      }
    }
  `]
})
export class HabitCardNeumorphismComponent {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() metrics = { streak: 0, totalDays: 0, consistency: 0 };
  
  @Output() complete = new EventEmitter<void>();

  onComplete() {
    this.complete.emit();
  }

  getIdentityIcon(): string {
    const identity = this.habit.identity.toLowerCase();
    if (identity.includes('reader')) return '📚';
    if (identity.includes('athlete')) return '💪';
    if (identity.includes('mindful')) return '🧘';
    if (identity.includes('healthy')) return '🌱';
    if (identity.includes('creative')) return '🎨';
    return '⭐';
  }
}