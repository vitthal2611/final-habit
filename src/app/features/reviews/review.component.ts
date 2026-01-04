import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../core/services/habit.service';
import { CardComponent } from '../../shared/ui/card.component';

type ReviewPeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <div class="review-view">
      <header>
        <h1>Reflection</h1>
        <p class="subtitle">Learn from your journey</p>
      </header>

      <div class="tabs">
        <button 
          *ngFor="let period of periods"
          [class.active]="activePeriod() === period"
          (click)="activePeriod.set(period)">
          {{ period | titlecase }}
        </button>
      </div>

      <div class="review-content">
        
        <!-- Weekly Review -->
        <div *ngIf="activePeriod() === 'weekly'">
          <app-card>
            <h3>This Week</h3>
            <div class="habit-summary" *ngFor="let habit of habits()">
              <span class="habit-name">{{ habit.name }}</span>
              <span class="progress">{{ getWeeklyProgress(habit.id) }} / 7</span>
            </div>
            
            <div class="reflection-prompt">
              <label>What helped you show up this week?</label>
              <textarea 
                [(ngModel)]="weeklyReflection"
                placeholder="Your thoughts..."
                rows="4"></textarea>
            </div>
          </app-card>
        </div>

        <!-- Monthly Review -->
        <div *ngIf="activePeriod() === 'monthly'">
          <app-card>
            <h3>This Month</h3>
            <p class="insight">
              You showed up {{ getMonthlyTotal() }} times this month.
            </p>
            
            <div class="reflection-prompt">
              <label>What can you simplify next month?</label>
              <textarea 
                [(ngModel)]="monthlyReflection"
                placeholder="Your thoughts..."
                rows="4"></textarea>
            </div>
          </app-card>
        </div>

        <!-- Quarterly Review -->
        <div *ngIf="activePeriod() === 'quarterly'">
          <app-card>
            <h3>Past 3 Months</h3>
            <p class="insight">
              You've been building your identity through consistent action.
            </p>
            
            <div class="reflection-prompt">
              <label>Which identity did you live into the most?</label>
              <textarea 
                [(ngModel)]="quarterlyReflection"
                placeholder="Your thoughts..."
                rows="4"></textarea>
            </div>
          </app-card>
        </div>

        <!-- Yearly Review -->
        <div *ngIf="activePeriod() === 'yearly'">
          <app-card>
            <h3>This Year</h3>
            <p class="narrative">
              This year, you showed up {{ getYearlyTotal() }} times.
              You proved to yourself that you are someone who follows through.
              Every small action reinforced your identity.
            </p>
            
            <div class="reflection-prompt">
              <label>How have you grown this year?</label>
              <textarea 
                [(ngModel)]="yearlyReflection"
                placeholder="Your thoughts..."
                rows="6"></textarea>
            </div>
          </app-card>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .review-view {
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
      padding: 12px 16px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }

    .tabs button.active {
      color: #6366f1;
      border-bottom-color: #6366f1;
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 16px 0;
    }

    .habit-summary {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .habit-name {
      font-size: 15px;
      color: #374151;
    }

    .progress {
      font-size: 15px;
      font-weight: 600;
      color: #111827;
    }

    .insight,
    .narrative {
      font-size: 15px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .reflection-prompt {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #f3f4f6;
    }

    .reflection-prompt label {
      display: block;
      font-size: 15px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
    }

    textarea:focus {
      outline: none;
      border-color: #6366f1;
    }
  `]
})
export class ReviewComponent {
  activePeriod = signal<ReviewPeriod>('weekly');
  periods: ReviewPeriod[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

  weeklyReflection = '';
  monthlyReflection = '';
  quarterlyReflection = '';
  yearlyReflection = '';

  habits = () => this.habitService.allHabits();

  constructor(private habitService: HabitService) {}

  getWeeklyProgress(habitId: string): number {
    const today = new Date();
    const { completed } = this.habitService.getWeeklyConsistency(habitId, today);
    return completed;
  }

  getMonthlyTotal(): number {
    return this.habitService.allLogs().filter(l => l.completed).length;
  }

  getYearlyTotal(): number {
    return this.habitService.allLogs().filter(l => l.completed).length;
  }
}
