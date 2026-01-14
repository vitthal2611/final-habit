import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitState } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-neon-glow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color">
      <div class="neon-border"></div>
      
      <div class="card-header">
        <div class="identity-chip">
          <span class="chip-glow"></span>
          <span class="identity-text">{{ habit.identity }}</span>
        </div>
        <div class="status-orb" [class.active]="state === 'done'"></div>
      </div>

      <div class="habit-info">
        <h3 class="habit-title">{{ habit.name }}</h3>
        <p class="habit-context">{{ habit.trigger.when }} • {{ habit.trigger.where }}</p>
      </div>

      <div class="action-zone" *ngIf="state === 'pending'">
        <button class="neon-button" (click)="onComplete()">
          <span class="button-glow"></span>
          <span class="button-text">ACTIVATE</span>
        </button>
      </div>

      <div class="success-zone" *ngIf="state === 'done'">
        <div class="success-pulse"></div>
        <div class="success-content">
          <div class="reward-text">{{ habit.reward }}</div>
          <div class="identity-confirm">{{ habit.identity }} ACTIVATED</div>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-cell">
          <div class="metric-glow"></div>
          <div class="metric-number">{{ metrics.streak }}</div>
          <div class="metric-label">STREAK</div>
        </div>
        <div class="metric-cell">
          <div class="metric-glow"></div>
          <div class="metric-number">{{ metrics.totalDays }}</div>
          <div class="metric-label">TOTAL</div>
        </div>
        <div class="metric-cell">
          <div class="metric-glow"></div>
          <div class="metric-number">{{ metrics.consistency }}%</div>
          <div class="metric-label">RATE</div>
        </div>
      </div>

      <div class="progress-track">
        <div class="progress-glow" [style.width.%]="(weeklyConsistency.completed / 7) * 100"></div>
        <div class="progress-text">{{ weeklyConsistency.completed }}/7 CYCLES</div>
      </div>
    </div>
  `,
  styles: [`
    .habit-card {
      background: #0a0a0a;
      border-radius: 16px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 30px rgba(var(--habit-color), 0.3);
    }

    .neon-border {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 2px solid var(--habit-color);
      border-radius: 16px;
      box-shadow: 0 0 20px rgba(var(--habit-color), 0.5), inset 0 0 20px rgba(var(--habit-color), 0.1);
      animation: pulse-border 2s infinite;
    }

    @keyframes pulse-border {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      position: relative;
      z-index: 2;
    }

    .identity-chip {
      position: relative;
      padding: 8px 16px;
      background: rgba(var(--habit-color), 0.1);
      border: 1px solid var(--habit-color);
      border-radius: 20px;
      overflow: hidden;
    }

    .chip-glow {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(var(--habit-color), 0.3), transparent);
      animation: scan 3s infinite;
    }

    @keyframes scan {
      0% { left: -100%; }
      100% { left: 100%; }
    }

    .identity-text {
      font-size: 11px;
      font-weight: 700;
      color: var(--habit-color);
      text-transform: uppercase;
      letter-spacing: 2px;
      position: relative;
      z-index: 1;
    }

    .status-orb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #333;
      border: 2px solid #555;
      transition: all 0.3s;
    }

    .status-orb.active {
      background: var(--habit-color);
      border-color: var(--habit-color);
      box-shadow: 0 0 15px rgba(var(--habit-color), 0.8);
    }

    .habit-info {
      margin-bottom: 24px;
      position: relative;
      z-index: 2;
    }

    .habit-title {
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      margin: 0 0 8px 0;
      text-shadow: 0 0 10px rgba(var(--habit-color), 0.5);
    }

    .habit-context {
      font-size: 13px;
      color: #888;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .action-zone {
      margin-bottom: 24px;
      position: relative;
      z-index: 2;
    }

    .neon-button {
      width: 100%;
      padding: 16px;
      background: transparent;
      border: 2px solid var(--habit-color);
      border-radius: 8px;
      color: var(--habit-color);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s;
    }

    .neon-button:hover {
      background: rgba(var(--habit-color), 0.1);
      box-shadow: 0 0 25px rgba(var(--habit-color), 0.6);
    }

    .button-glow {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(var(--habit-color), 0.4), transparent);
      transition: left 0.6s;
    }

    .neon-button:hover .button-glow {
      left: 100%;
    }

    .button-text {
      position: relative;
      z-index: 1;
    }

    .success-zone {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: rgba(var(--habit-color), 0.1);
      border: 1px solid var(--habit-color);
      border-radius: 12px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }

    .success-pulse {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(var(--habit-color), 0.1);
      animation: success-pulse 2s infinite;
    }

    @keyframes success-pulse {
      0%, 100% { opacity: 0.1; }
      50% { opacity: 0.3; }
    }

    .success-content {
      position: relative;
      z-index: 1;
    }

    .reward-text {
      font-size: 14px;
      font-weight: 600;
      color: var(--habit-color);
      margin-bottom: 4px;
    }

    .identity-confirm {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
      position: relative;
      z-index: 2;
    }

    .metric-cell {
      text-align: center;
      padding: 16px 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid #333;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    }

    .metric-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--habit-color);
      box-shadow: 0 0 10px rgba(var(--habit-color), 0.8);
    }

    .metric-number {
      font-size: 18px;
      font-weight: 700;
      color: var(--habit-color);
      margin-bottom: 4px;
      text-shadow: 0 0 8px rgba(var(--habit-color), 0.5);
    }

    .metric-label {
      font-size: 9px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .progress-track {
      position: relative;
      height: 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .progress-glow {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: linear-gradient(90deg, var(--habit-color), rgba(var(--habit-color), 0.6));
      border-radius: 20px;
      box-shadow: 0 0 15px rgba(var(--habit-color), 0.6);
      transition: width 0.8s ease;
    }

    .progress-text {
      font-size: 11px;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 1px;
      position: relative;
      z-index: 1;
      text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
    }
  `]
})
export class HabitCardNeonGlowComponent {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() metrics = { streak: 0, totalDays: 0, consistency: 0 };
  
  @Output() complete = new EventEmitter<void>();

  onComplete() {
    this.complete.emit();
  }
}