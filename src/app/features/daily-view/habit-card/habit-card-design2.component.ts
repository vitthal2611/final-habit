import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitState } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-design2',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color">
      <!-- Header with gradient background -->
      <div class="card-header">
        <div class="header-content">
          <div class="identity-pill">
            <span class="identity-emoji">🎯</span>
            <span class="identity-text">{{ habit.identity }}</span>
          </div>
          <div class="habit-title">{{ habit.name }}</div>
          <div class="habit-subtitle">{{ habit.trigger.when }} • {{ habit.trigger.where }}</div>
        </div>
        <div class="header-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
      </div>

      <!-- Action Area -->
      <div class="card-body">
        <!-- Pending State -->
        <div class="action-container" *ngIf="state === 'pending'">
          <button class="action-button" (click)="onComplete()">
            <div class="button-bg"></div>
            <div class="button-content">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="16 12 12 8 8 12"></polyline>
                  <line x1="12" y1="16" x2="12" y2="8"></line>
                </svg>
              </div>
              <span class="action-text">Complete Today</span>
            </div>
          </button>
        </div>

        <!-- Completed State -->
        <div class="completed-container" *ngIf="state === 'done'">
          <div class="completed-badge">
            <div class="completed-icon">✓</div>
            <div class="completed-content">
              <div class="completed-title">{{ habit.reward }}</div>
              <div class="completed-subtitle">You are becoming {{ habit.identity }}</div>
            </div>
          </div>
        </div>

        <!-- Progress Section -->
        <div class="progress-container">
          <div class="progress-info">
            <div class="progress-title">Weekly Streak</div>
            <div class="progress-stats">{{ weeklyConsistency.completed }} of 7 days</div>
          </div>
          
          <div class="progress-visual">
            <div class="progress-track">
              <div class="progress-indicator" [style.width.%]="getProgressPercentage()"></div>
            </div>
            <div class="progress-dots">
              <div *ngFor="let day of getDayArray(); let i = index" 
                   class="progress-dot"
                   [class.active]="i < weeklyConsistency.completed"
                   [style.background]="i < weeklyConsistency.completed ? habit.color : '#e5e7eb'">
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🔥</div>
            <div class="metric-value">{{ metrics.streak }}</div>
            <div class="metric-label">Streak</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📅</div>
            <div class="metric-value">{{ metrics.totalDays }}</div>
            <div class="metric-label">Total</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-value">{{ metrics.consistency }}%</div>
            <div class="metric-label">Rate</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .habit-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      position: relative;
    }

    .habit-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
    }

    .card-header {
      background: linear-gradient(135deg, var(--habit-color), rgba(var(--habit-color), 0.8));
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    .header-content {
      position: relative;
      z-index: 2;
    }

    .identity-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      margin-bottom: 16px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .identity-emoji {
      font-size: 14px;
    }

    .identity-text {
      font-size: 11px;
      font-weight: 700;
      color: white;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .habit-title {
      font-size: 22px;
      font-weight: 800;
      color: white;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .habit-subtitle {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .header-decoration {
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
    }

    .circle-1 {
      width: 80px;
      height: 80px;
      top: -20px;
      right: -20px;
    }

    .circle-2 {
      width: 40px;
      height: 40px;
      top: 20px;
      right: 60px;
      background: rgba(255, 255, 255, 0.15);
    }

    .circle-3 {
      width: 20px;
      height: 20px;
      top: 60px;
      right: 20px;
      background: rgba(255, 255, 255, 0.2);
    }

    .card-body {
      padding: 24px;
    }

    .action-container {
      margin-bottom: 24px;
    }

    .action-button {
      width: 100%;
      padding: 0;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .action-button:active {
      transform: scale(0.98);
    }

    .button-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #f8fafc, #e2e8f0);
      border: 2px solid var(--habit-color);
      border-radius: 16px;
      transition: all 0.3s ease;
    }

    .action-button:hover .button-bg {
      background: linear-gradient(135deg, var(--habit-color), rgba(var(--habit-color), 0.9));
    }

    .button-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 18px;
      color: var(--habit-color);
      transition: color 0.3s ease;
    }

    .action-button:hover .button-content {
      color: white;
    }

    .action-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(var(--habit-color), 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .action-button:hover .action-icon {
      background: rgba(255, 255, 255, 0.2);
    }

    .action-text {
      font-size: 16px;
      font-weight: 700;
    }

    .completed-container {
      margin-bottom: 24px;
    }

    .completed-badge {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border-radius: 16px;
      border: 1px solid #a7f3d0;
    }

    .completed-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #10b981;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    }

    .completed-content {
      flex: 1;
    }

    .completed-title {
      font-size: 16px;
      font-weight: 700;
      color: #065f46;
      margin-bottom: 4px;
    }

    .completed-subtitle {
      font-size: 13px;
      color: #047857;
    }

    .progress-container {
      background: #f8fafc;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 16px;
    }

    .metric-card {
      text-align: center;
      padding: 16px 8px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .metric-icon {
      font-size: 20px;
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--habit-color);
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .progress-title {
      font-size: 14px;
      font-weight: 700;
      color: #374151;
    }

    .progress-stats {
      font-size: 14px;
      font-weight: 600;
      color: var(--habit-color);
    }

    .progress-visual {
      space-y: 12px;
    }

    .progress-track {
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .progress-indicator {
      height: 100%;
      background: linear-gradient(90deg, var(--habit-color), rgba(var(--habit-color), 0.8));
      border-radius: 3px;
      transition: width 0.6s ease;
    }

    .progress-dots {
      display: flex;
      gap: 8px;
      justify-content: center;
    }

    .progress-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .progress-dot.active {
      transform: scale(1.2);
      box-shadow: 0 2px 8px rgba(var(--habit-color), 0.4);
    }

    @media (max-width: 768px) {
      .card-header {
        padding: 20px;
      }

      .habit-title {
        font-size: 20px;
      }

      .card-body {
        padding: 20px;
      }

      .button-content {
        padding: 16px;
      }

      .action-text {
        font-size: 15px;
      }
    }
  `]
})
export class HabitCardDesign2Component {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() metrics = { streak: 0, totalDays: 0, consistency: 0 };
  
  @Output() complete = new EventEmitter<void>();

  onComplete() {
    this.complete.emit();
  }

  getProgressPercentage(): number {
    return (this.weeklyConsistency.completed / 7) * 100;
  }

  getDayArray(): number[] {
    return Array(7).fill(0).map((_, i) => i);
  }
}