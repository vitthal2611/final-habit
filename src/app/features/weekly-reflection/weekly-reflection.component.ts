import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../core/services/habit.service';
import { FirebaseService } from '../../core/services/firebase.service';

@Component({
  selector: 'app-weekly-reflection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reflection">
      <header>
        <h1>Weekly Reflection</h1>
        <p class="subtitle">Review your habits from the past week</p>
      </header>

      <div class="week-summary">
        <div class="stat-card">
          <div class="stat-value">{{ totalVotes() }}</div>
          <div class="stat-label">Total Votes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ consistencyRate() }}%</div>
          <div class="stat-label">Consistency</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ bestStreak() }}</div>
          <div class="stat-label">Best Streak</div>
        </div>
      </div>

      <div class="habits-review">
        <h2>Habit Performance</h2>
        <div *ngFor="let habit of habits()" class="habit-review-card">
          <div class="habit-header">
            <div class="habit-name">{{ habit.name }}</div>
            <div class="habit-score">{{ getHabitWeeklyVotes(habit.id) }}/7</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="(getHabitWeeklyVotes(habit.id) / 7) * 100" [style.background]="habit.color"></div>
          </div>
          <div class="habit-identity">{{ habit.identity }}</div>
        </div>
      </div>

      <div class="reflection-questions">
        <h2>Reflection Questions</h2>
        
        <div *ngFor="let habit of habits()" class="habit-reflection">
          <h3>{{ habit.name }}</h3>
          
          <div class="question-card">
            <label>What helped you show up this week?</label>
            <textarea [(ngModel)]="reflections[habit.id].whatHelped" rows="2" placeholder="Write your thoughts..."></textarea>
          </div>

          <div class="question-card">
            <label>What obstacles did you face?</label>
            <textarea [(ngModel)]="reflections[habit.id].obstacles" rows="2" placeholder="Write your thoughts..."></textarea>
          </div>

          <div class="question-card">
            <label>What will you adjust next week?</label>
            <textarea [(ngModel)]="reflections[habit.id].adjustments" rows="2" placeholder="Write your thoughts..."></textarea>
          </div>
        </div>

        <button class="save-btn" (click)="saveReflection()">Save Reflection</button>
      </div>
    </div>
  `,
  styles: [`
    .reflection {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      margin-bottom: 32px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px 0;
    }

    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 16px 0;
    }

    .subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    .week-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #6b7280;
    }

    .habits-review {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin-bottom: 32px;
    }

    .habit-review-card {
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .habit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .habit-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .habit-score {
      font-size: 18px;
      font-weight: 700;
      color: #6366f1;
    }

    .progress-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s;
    }

    .habit-identity {
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
    }

    .reflection-questions {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .habit-reflection {
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid #e5e7eb;
    }

    .habit-reflection:last-of-type {
      border-bottom: none;
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 16px 0;
    }

    .question-card {
      margin-bottom: 24px;
    }

    label {
      display: block;
      font-size: 15px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      box-sizing: border-box;
    }

    textarea:focus {
      outline: none;
      border-color: #6366f1;
    }

    .save-btn {
      width: 100%;
      padding: 14px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }

    .save-btn:hover {
      background: #4f46e5;
    }

    @media (max-width: 640px) {
      .week-summary {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WeeklyReflectionComponent {
  habits = computed(() => this.habitService.allHabits());
  reflections: { [habitId: string]: { whatHelped: string; obstacles: string; adjustments: string } } = {};

  constructor(private habitService: HabitService, private firebase: FirebaseService) {
    this.habits().forEach(habit => {
      this.reflections[habit.id] = { whatHelped: '', obstacles: '', adjustments: '' };
    });
  }

  totalVotes(): number {
    return this.habits().reduce((sum, habit) => {
      return sum + this.getHabitWeeklyVotes(habit.id);
    }, 0);
  }

  consistencyRate(): number {
    const total = this.habits().length * 7;
    if (total === 0) return 0;
    return Math.round((this.totalVotes() / total) * 100);
  }

  bestStreak(): number {
    let maxStreak = 0;
    this.habits().forEach(habit => {
      const streak = this.getHabitWeeklyVotes(habit.id);
      if (streak > maxStreak) maxStreak = streak;
    });
    return maxStreak;
  }

  getHabitWeeklyVotes(habitId: string): number {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (this.habitService.getHabitState(habitId, dateStr) === 'done') {
        count++;
      }
    }
    return count;
  }

  saveReflection() {
    const date = new Date().toISOString().split('T')[0];
    this.firebase.saveReflection(date, this.reflections);
    alert('Reflection saved!');
    // Clear reflections
    this.habits().forEach(habit => {
      this.reflections[habit.id] = { whatHelped: '', obstacles: '', adjustments: '' };
    });
  }
}
