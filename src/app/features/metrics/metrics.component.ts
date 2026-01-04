import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../core/services/habit.service';
import { CardComponent } from '../../shared/ui/card.component';

type MetricLevel = 'monthly' | 'quarterly' | 'yearly';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="metrics-view">
      <header>
        <h1>Your Progress</h1>
        <p class="subtitle">Systems over goals</p>
      </header>

      <div class="tabs">
        <button 
          *ngFor="let level of levels"
          [class.active]="activeLevel() === level"
          (click)="activeLevel.set(level)">
          {{ level | titlecase }}
        </button>
      </div>

      <div class="metrics-content">
        
        <!-- Monthly Metrics -->
        <div *ngIf="activeLevel() === 'monthly'">
          <app-card *ngFor="let habit of habits()">
            <h3>{{ habit.name }}</h3>
            <div class="metric-row">
              <span class="label">Consistency</span>
              <span class="value">{{ getMonthlyConsistency(habit.id) }}%</span>
            </div>
            <div class="metric-row">
              <span class="label">Active days</span>
              <span class="value">{{ getActiveDays(habit.id) }}</span>
            </div>
            <div class="metric-row">
              <span class="label">Trend</span>
              <span class="value trend">{{ getTrend(habit.id) }}</span>
            </div>
          </app-card>
        </div>

        <!-- Quarterly Metrics -->
        <div *ngIf="activeLevel() === 'quarterly'">
          <app-card>
            <h3>3-Month Overview</h3>
            <div class="metric-row">
              <span class="label">Habits maintained</span>
              <span class="value">{{ habits().length }}</span>
            </div>
            <div class="metric-row">
              <span class="label">Average consistency</span>
              <span class="value">{{ getQuarterlyAverage() }}%</span>
            </div>
            <p class="insight">
              You're building sustainable systems. Keep showing up.
            </p>
          </app-card>
        </div>

        <!-- Yearly Metrics -->
        <div *ngIf="activeLevel() === 'yearly'">
          <app-card>
            <h3>Year in Review</h3>
            <div class="metric-row">
              <span class="label">Total days showed up</span>
              <span class="value">{{ getYearlyTotal() }}</span>
            </div>
            <div class="metric-row">
              <span class="label">Strongest habit</span>
              <span class="value">{{ getStrongestHabit() }}</span>
            </div>
            <p class="narrative">
              This year, you became someone who shows up consistently.
              Every action reinforced your identity.
            </p>
          </app-card>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .metrics-view {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      margin-bottom: 24px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .tabs button {
      padding: 12px 20px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: #6b7280;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tabs button.active {
      color: #6366f1;
      border-bottom-color: #6366f1;
    }

    .metrics-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 16px 0;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .metric-row:last-of-type {
      border-bottom: none;
    }

    .label {
      font-size: 14px;
      color: #6b7280;
    }

    .value {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .trend {
      text-transform: capitalize;
    }

    .insight,
    .narrative {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f3f4f6;
      font-size: 14px;
      color: #6b7280;
      font-style: italic;
      line-height: 1.6;
    }
  `]
})
export class MetricsComponent {
  activeLevel = signal<MetricLevel>('monthly');
  levels: MetricLevel[] = ['monthly', 'quarterly', 'yearly'];
  
  habits = computed(() => this.habitService.allHabits());

  constructor(private habitService: HabitService) {}

  getMonthlyConsistency(habitId: string): number {
    const logs = this.habitService.allLogs().filter(l => l.habitId === habitId && l.completed);
    const daysInMonth = 30;
    return Math.round((logs.length / daysInMonth) * 100);
  }

  getActiveDays(habitId: string): number {
    return this.habitService.allLogs().filter(l => l.habitId === habitId && l.completed).length;
  }

  getTrend(habitId: string): string {
    return 'stable';
  }

  getQuarterlyAverage(): number {
    const habits = this.habits();
    if (habits.length === 0) return 0;
    const total = habits.reduce((sum, h) => sum + this.getMonthlyConsistency(h.id), 0);
    return Math.round(total / habits.length);
  }

  getYearlyTotal(): number {
    return this.habitService.allLogs().filter(l => l.completed).length;
  }

  getStrongestHabit(): string {
    const habits = this.habits();
    if (habits.length === 0) return 'None yet';
    
    let strongest = habits[0];
    let maxConsistency = this.getMonthlyConsistency(habits[0].id);
    
    habits.forEach(h => {
      const consistency = this.getMonthlyConsistency(h.id);
      if (consistency > maxConsistency) {
        maxConsistency = consistency;
        strongest = h;
      }
    });
    
    return strongest.name;
  }
}
