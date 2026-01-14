import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, HabitState } from '../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-nature-organic',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color">
      
      <div class="nature-background">
        <div class="leaf leaf-1">🍃</div>
        <div class="leaf leaf-2">🌿</div>
        <div class="leaf leaf-3">🍀</div>
      </div>

      <div class="card-content">
        
        <div class="identity-seed">
          <div class="seed-icon">🌱</div>
          <span class="identity-text">Growing {{ habit.identity }}</span>
        </div>

        <div class="habit-bloom">
          <h3 class="habit-name">{{ habit.name }}</h3>
          <p class="habit-environment">
            <span class="time-flower">🌸 {{ habit.trigger.when }}</span>
            <span class="place-tree">🌳 {{ habit.trigger.where }}</span>
          </p>
        </div>

        <div class="action-garden" *ngIf="state === 'pending'">
          <button class="organic-button" (click)="onComplete()">
            <div class="button-soil"></div>
            <div class="button-content">
              <span class="plant-icon">🌱</span>
              <span class="button-text">Nurture Today</span>
            </div>
          </button>
        </div>

        <div class="harvest-celebration" *ngIf="state === 'done'">
          <div class="celebration-garden">
            <div class="harvest-icon">🌻</div>
            <div class="harvest-text">
              <div class="reward-bloom">{{ habit.reward }}</div>
              <div class="growth-message">Your {{ habit.identity }} nature is flourishing</div>
            </div>
          </div>
        </div>

        <div class="growth-metrics">
          <div class="metric-plant">
            <div class="plant-pot">🪴</div>
            <div class="metric-value">{{ metrics.streak }}</div>
            <div class="metric-label">Day Growth</div>
          </div>
          <div class="metric-plant">
            <div class="plant-pot">🌾</div>
            <div class="metric-value">{{ metrics.totalDays }}</div>
            <div class="metric-label">Total Seasons</div>
          </div>
          <div class="metric-plant">
            <div class="plant-pot">🌺</div>
            <div class="metric-value">{{ metrics.consistency }}%</div>
            <div class="metric-label">Bloom Rate</div>
          </div>
        </div>

        <div class="weekly-garden">
          <div class="garden-header">
            <span class="garden-title">This Week's Garden</span>
            <span class="bloom-count">{{ weeklyConsistency.completed }}/7 blooms</span>
          </div>
          <div class="garden-bed">
            <div *ngFor="let day of getGardenDays(); let i = index" 
                 class="garden-plot"
                 [class.bloomed]="i < weeklyConsistency.completed">
              <span class="plot-content">{{ i < weeklyConsistency.completed ? '🌸' : '🌱' }}</span>
            </div>
          </div>
          <div class="soil-line"></div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .habit-card {
      background: linear-gradient(135deg, #f7f9f3 0%, #e8f5e8 100%);
      border-radius: 24px;
      padding: 24px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(76, 175, 80, 0.15);
      border: 2px solid rgba(139, 195, 74, 0.2);
    }

    .nature-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .leaf {
      position: absolute;
      font-size: 20px;
      opacity: 0.1;
      animation: float 6s ease-in-out infinite;
    }

    .leaf-1 {
      top: 10%;
      right: 10%;
      animation-delay: 0s;
    }

    .leaf-2 {
      top: 60%;
      left: 5%;
      animation-delay: 2s;
    }

    .leaf-3 {
      bottom: 20%;
      right: 20%;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(5deg); }
    }

    .card-content {
      position: relative;
      z-index: 1;
    }

    .identity-seed {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 20px;
      margin-bottom: 20px;
      border: 1px solid rgba(139, 195, 74, 0.3);
      backdrop-filter: blur(10px);
    }

    .seed-icon {
      font-size: 16px;
      animation: grow 2s ease-in-out infinite;
    }

    @keyframes grow {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .identity-text {
      font-size: 13px;
      font-weight: 600;
      color: #558b2f;
      font-style: italic;
    }

    .habit-bloom {
      margin-bottom: 24px;
    }

    .habit-name {
      font-size: 22px;
      font-weight: 700;
      color: #2e7d32;
      margin: 0 0 12px 0;
      line-height: 1.3;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    }

    .habit-environment {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 0;
    }

    .time-flower,
    .place-tree {
      font-size: 14px;
      color: #689f38;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-garden {
      margin-bottom: 24px;
    }

    .organic-button {
      width: 100%;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      position: relative;
      border-radius: 20px;
      overflow: hidden;
    }

    .button-soil {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #8bc34a, #689f38);
      border-radius: 20px;
      transition: transform 0.3s ease;
    }

    .organic-button:hover .button-soil {
      transform: scale(1.02);
    }

    .button-content {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 18px;
      color: white;
      font-size: 16px;
      font-weight: 600;
    }

    .plant-icon {
      font-size: 20px;
      animation: sway 2s ease-in-out infinite;
    }

    @keyframes sway {
      0%, 100% { transform: rotate(-2deg); }
      50% { transform: rotate(2deg); }
    }

    .button-text {
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .harvest-celebration {
      margin-bottom: 24px;
    }

    .celebration-garden {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, rgba(255, 235, 59, 0.2), rgba(255, 193, 7, 0.2));
      border-radius: 20px;
      border: 2px solid rgba(255, 193, 7, 0.3);
    }

    .harvest-icon {
      font-size: 32px;
      animation: bloom 1s ease-in-out;
    }

    @keyframes bloom {
      0% { transform: scale(0.5) rotate(-10deg); }
      100% { transform: scale(1) rotate(0deg); }
    }

    .harvest-text {
      flex: 1;
    }

    .reward-bloom {
      font-size: 16px;
      font-weight: 600;
      color: #f57f17;
      margin-bottom: 4px;
    }

    .growth-message {
      font-size: 13px;
      color: #689f38;
      font-style: italic;
    }

    .growth-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-plant {
      text-align: center;
      padding: 16px 12px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 16px;
      border: 1px solid rgba(139, 195, 74, 0.2);
      backdrop-filter: blur(5px);
    }

    .plant-pot {
      font-size: 24px;
      margin-bottom: 8px;
      display: block;
    }

    .metric-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--habit-color);
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 11px;
      font-weight: 600;
      color: #689f38;
      text-transform: lowercase;
    }

    .weekly-garden {
      padding: 20px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 20px;
      border: 1px solid rgba(139, 195, 74, 0.2);
      backdrop-filter: blur(10px);
    }

    .garden-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .garden-title {
      font-size: 14px;
      font-weight: 600;
      color: #558b2f;
    }

    .bloom-count {
      font-size: 13px;
      color: #689f38;
      font-weight: 500;
    }

    .garden-bed {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }

    .garden-plot {
      aspect-ratio: 1;
      background: rgba(121, 85, 72, 0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(121, 85, 72, 0.3);
      transition: all 0.3s ease;
    }

    .garden-plot.bloomed {
      background: rgba(255, 235, 59, 0.3);
      border-color: rgba(255, 193, 7, 0.5);
      transform: scale(1.05);
    }

    .plot-content {
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .soil-line {
      height: 4px;
      background: linear-gradient(90deg, #795548, #8d6e63, #795548);
      border-radius: 2px;
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .habit-card {
        padding: 20px;
      }

      .habit-name {
        font-size: 20px;
      }

      .growth-metrics {
        gap: 12px;
      }

      .metric-plant {
        padding: 12px 8px;
      }

      .plant-pot {
        font-size: 20px;
      }

      .metric-value {
        font-size: 18px;
      }
    }
  `]
})
export class HabitCardNatureOrganicComponent {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() metrics = { streak: 0, totalDays: 0, consistency: 0 };
  
  @Output() complete = new EventEmitter<void>();

  onComplete() {
    this.complete.emit();
  }

  getGardenDays(): number[] {
    return Array(7).fill(0).map((_, i) => i);
  }
}