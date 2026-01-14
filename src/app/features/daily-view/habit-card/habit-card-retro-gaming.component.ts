import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitState } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-retro-gaming',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color">
      
      <div class="game-header">
        <div class="player-info">
          <span class="player-label">PLAYER:</span>
          <span class="player-name">{{ habit.identity.toUpperCase() }}</span>
        </div>
        <div class="health-bar">
          <div class="health-fill" [style.width.%]="(weeklyConsistency.completed / 7) * 100"></div>
        </div>
      </div>

      <div class="quest-info">
        <div class="quest-title">QUEST: {{ habit.name.toUpperCase() }}</div>
        <div class="quest-details">
          <span class="location">📍 {{ habit.trigger.where.toUpperCase() }}</span>
          <span class="time">⏰ {{ habit.trigger.when.toUpperCase() }}</span>
        </div>
      </div>

      <div class="action-zone" *ngIf="state === 'pending'">
        <button class="pixel-button" (click)="onComplete()">
          <div class="button-pixels">
            <span class="pixel-text">▶ START QUEST</span>
          </div>
        </button>
      </div>

      <div class="victory-zone" *ngIf="state === 'done'">
        <div class="victory-banner">
          <div class="victory-text">🏆 QUEST COMPLETE! 🏆</div>
          <div class="reward-text">REWARD: {{ habit.reward.toUpperCase() }}</div>
          <div class="xp-gain">+100 {{ habit.identity.toUpperCase() }} XP</div>
        </div>
      </div>

      <div class="stats-display">
        <div class="stat-box">
          <div class="stat-icon">🔥</div>
          <div class="stat-value">{{ metrics.streak }}</div>
          <div class="stat-label">STREAK</div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">📊</div>
          <div class="stat-value">{{ metrics.totalDays }}</div>
          <div class="stat-label">TOTAL</div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">{{ metrics.consistency }}%</div>
          <div class="stat-label">SCORE</div>
        </div>
      </div>

      <div class="progress-display">
        <div class="progress-title">WEEKLY PROGRESS</div>
        <div class="progress-pixels">
          <div *ngFor="let day of getWeekDays(); let i = index" 
               class="progress-pixel"
               [class.active]="i < weeklyConsistency.completed">
            {{ day }}
          </div>
        </div>
        <div class="progress-score">{{ weeklyConsistency.completed }}/7 DAYS</div>
      </div>

    </div>
  `,
  styles: [`
    .habit-card {
      background: #2a2a2a;
      border: 4px solid #4a4a4a;
      border-radius: 0;
      padding: 16px;
      font-family: 'Courier New', monospace;
      color: #00ff00;
      box-shadow: 
        inset 2px 2px 0 #6a6a6a,
        inset -2px -2px 0 #1a1a1a;
      position: relative;
    }

    .habit-card::before {
      content: '';
      position: absolute;
      top: 4px;
      left: 4px;
      right: 4px;
      bottom: 4px;
      border: 1px solid #00ff00;
      pointer-events: none;
    }

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding: 8px;
      background: #1a1a1a;
      border: 2px solid #4a4a4a;
    }

    .player-info {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .player-label {
      font-size: 10px;
      color: #888;
    }

    .player-name {
      font-size: 10px;
      font-weight: bold;
      color: var(--habit-color);
    }

    .health-bar {
      width: 80px;
      height: 8px;
      background: #333;
      border: 1px solid #666;
      position: relative;
    }

    .health-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff0000, #ffff00, #00ff00);
      transition: width 0.5s ease;
    }

    .quest-info {
      margin-bottom: 16px;
      padding: 12px;
      background: #1a1a1a;
      border: 2px solid #4a4a4a;
    }

    .quest-title {
      font-size: 12px;
      font-weight: bold;
      color: #ffff00;
      margin-bottom: 8px;
      text-shadow: 1px 1px 0 #000;
    }

    .quest-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 10px;
      color: #ccc;
    }

    .location,
    .time {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-zone {
      margin-bottom: 16px;
    }

    .pixel-button {
      width: 100%;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
    }

    .button-pixels {
      padding: 12px;
      background: var(--habit-color);
      color: #000;
      border: 3px solid;
      border-color: #fff #333 #333 #fff;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      transition: all 0.1s ease;
    }

    .pixel-button:active .button-pixels {
      border-color: #333 #fff #fff #333;
      transform: translate(1px, 1px);
    }

    .pixel-text {
      text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
    }

    .victory-zone {
      margin-bottom: 16px;
      padding: 16px;
      background: #1a1a1a;
      border: 2px solid #ffff00;
      text-align: center;
      animation: victory-flash 1s ease-in-out;
    }

    @keyframes victory-flash {
      0%, 100% { background: #1a1a1a; }
      50% { background: #2a2a00; }
    }

    .victory-text {
      font-size: 12px;
      color: #ffff00;
      font-weight: bold;
      margin-bottom: 8px;
      animation: blink 0.5s infinite;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.5; }
    }

    .reward-text {
      font-size: 10px;
      color: #00ff00;
      margin-bottom: 4px;
    }

    .xp-gain {
      font-size: 10px;
      color: #ff00ff;
      font-weight: bold;
    }

    .stats-display {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }

    .stat-box {
      padding: 12px 8px;
      background: #1a1a1a;
      border: 2px solid #4a4a4a;
      text-align: center;
    }

    .stat-icon {
      font-size: 16px;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 14px;
      font-weight: bold;
      color: var(--habit-color);
      margin-bottom: 2px;
    }

    .stat-label {
      font-size: 8px;
      color: #888;
    }

    .progress-display {
      padding: 12px;
      background: #1a1a1a;
      border: 2px solid #4a4a4a;
    }

    .progress-title {
      font-size: 10px;
      color: #888;
      text-align: center;
      margin-bottom: 8px;
    }

    .progress-pixels {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 8px;
    }

    .progress-pixel {
      aspect-ratio: 1;
      background: #333;
      border: 1px solid #666;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: #666;
      transition: all 0.3s ease;
    }

    .progress-pixel.active {
      background: var(--habit-color);
      color: #000;
      border-color: var(--habit-color);
      box-shadow: 0 0 4px rgba(var(--habit-color), 0.8);
    }

    .progress-score {
      font-size: 10px;
      color: #00ff00;
      text-align: center;
      font-weight: bold;
    }

    @media (max-width: 768px) {
      .habit-card {
        padding: 12px;
      }

      .quest-title {
        font-size: 11px;
      }

      .stats-display {
        gap: 6px;
      }

      .stat-box {
        padding: 8px 4px;
      }

      .stat-value {
        font-size: 12px;
      }
    }
  `]
})
export class HabitCardRetroGamingComponent {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() metrics = { streak: 0, totalDays: 0, consistency: 0 };
  
  @Output() complete = new EventEmitter<void>();

  onComplete() {
    this.complete.emit();
  }

  getWeekDays(): string[] {
    return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }
}