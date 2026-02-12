import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WeeklyHabit {
  time: string;
  trigger: string;
  action: string;
  days: boolean[];
  streak: number;
  consistency: number;
  createdDate: string;
}

@Component({
  selector: 'app-weekly-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard">
      <!-- Performance Header -->
      <div class="performance-header">
        <div class="score-value">{{ avgConsistency() }}<span class="score-unit">%</span></div>
        <div class="score-label">WEEK SCORE</div>
        <div class="week-nav">
          <button (click)="previousWeek()" class="nav-btn">←</button>
          <div class="week-info">{{ weekRange() }}</div>
          <button (click)="nextWeek()" class="nav-btn">→</button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">COMPLETED</div>
          <div class="kpi-value">{{ totalMinutes() }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">HABITS</div>
          <div class="kpi-value">{{ habits().length }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">STREAK</div>
          <div class="kpi-value">{{ avgStreak() }}<span class="kpi-unit">d</span></div>
        </div>
      </div>

      <!-- Habit Cards -->
      <div class="habit-list">
        <div class="habit-card" *ngFor="let habit of habits(); let i = index">
          <div class="habit-header">
            <input [(ngModel)]="habit.time" class="input-time" placeholder="Time" type="time" />
            <button (click)="deleteHabit(i)" class="btn-delete">×</button>
          </div>
          <input [(ngModel)]="habit.trigger" class="input-trigger" placeholder="Trigger" />
          <input [(ngModel)]="habit.action" class="input-action" placeholder="Habit" />
          
          <div class="days-grid">
            <div *ngFor="let day of [0,1,2,3,4,5,6]; let j = index" class="day-cell">
              <div class="day-label">{{ weekDays()[j].label }}</div>
              <button
                class="day-btn"
                [class.done]="habit.days[j]"
                [class.future]="isFutureDay(j)"
                [class.before-created]="isBeforeCreated(habit, j)"
                [disabled]="isFutureDay(j) || isBeforeCreated(habit, j)"
                (click)="toggleDay(i, j)"
              >
                {{ habit.days[j] ? '✓' : '' }}
              </button>
            </div>
          </div>
          
          <div class="habit-stats">
            <div class="stat">{{ calculateStreak(habit) }}d streak</div>
            <div class="stat">{{ habit.consistency }}% done</div>
          </div>
        </div>
      </div>

      <button (click)="addHabit()" class="btn-add">+ NEW HABIT</button>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    
    .dashboard {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 1rem;
      padding-bottom: 5rem;
    }

    .performance-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .score-value {
      font-size: 3.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }

    .score-unit {
      font-size: 1.5rem;
      color: #8b5cf6;
    }

    .score-label {
      font-size: 0.625rem;
      letter-spacing: 0.2em;
      color: #6b7280;
      margin: 0.5rem 0 1rem;
    }

    .week-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .week-info {
      font-size: 0.875rem;
      color: #4b5563;
      min-width: 140px;
      text-align: center;
      font-weight: 500;
    }

    .nav-btn {
      background: #8b5cf6;
      border: none;
      color: #fff;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      font-size: 1.25rem;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
    }

    .nav-btn:active {
      transform: scale(0.95);
      background: #7c3aed;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .kpi-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .kpi-label {
      font-size: 0.625rem;
      letter-spacing: 0.1em;
      color: #6b7280;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }

    .kpi-unit {
      font-size: 0.875rem;
      color: #8b5cf6;
    }

    .habit-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .habit-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 1rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .habit-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .input-time {
      background: transparent;
      border: none;
      border-bottom: 2px solid #e5e7eb;
      color: #8b5cf6;
      padding: 0.25rem 0;
      font-size: 0.75rem;
      font-weight: 600;
      width: 80px;
    }

    .input-trigger {
      background: transparent;
      border: none;
      color: #1f2937;
      font-size: 1.125rem;
      font-weight: 700;
      width: 100%;
      margin-bottom: 0.5rem;
      padding: 0;
    }

    .input-action {
      background: transparent;
      border: none;
      color: #4b5563;
      font-size: 1rem;
      font-weight: 600;
      width: 100%;
      margin-bottom: 1rem;
      padding: 0;
    }

    .input-time:focus,
    .input-trigger:focus,
    .input-action:focus {
      outline: none;
      border-color: #8b5cf6;
    }

    .btn-delete {
      background: transparent;
      border: 2px solid #fecaca;
      color: #ef4444;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .btn-delete:active {
      background: #fee2e2;
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
      margin-bottom: 1rem;
    }

    .day-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .day-label {
      font-size: 0.625rem;
      color: #6b7280;
      text-align: center;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    .day-btn {
      background: #f3f4f6;
      border: 2px solid #e5e7eb;
      color: #d1d5db;
      padding: 0.75rem 0.25rem;
      border-radius: 8px;
      text-align: center;
      font-size: 1.25rem;
      width: 100%;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      min-height: 44px;
      transition: all 0.2s;
    }

    .day-btn.done {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-color: #10b981;
      color: #fff;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    .day-btn.future {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .day-btn.before-created {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .day-btn:active {
      transform: scale(0.95);
    }

    .day-btn:disabled {
      pointer-events: none;
    }

    .habit-stats {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 500;
    }

    .btn-add {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      width: 100%;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
    }

    .btn-add:active {
      transform: scale(0.98);
    }

    @media (min-width: 768px) {
      .dashboard {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .performance-header {
        padding: 2rem;
      }

      .score-value {
        font-size: 5rem;
      }

      .kpi-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }

      .kpi-card {
        padding: 1.5rem;
      }

      .kpi-value {
        font-size: 2.5rem;
      }

      .habit-card {
        padding: 1.5rem;
      }

      .input-trigger {
        font-size: 1.25rem;
      }

      .input-action {
        font-size: 1.125rem;
      }

      .day-btn {
        padding: 1rem 0.5rem;
        font-size: 1.5rem;
      }
    }
  `]
})
export class WeeklyDashboardComponent {
  currentWeekStart = signal(this.getMonday(new Date()));
  
  habits = signal<WeeklyHabit[]>([
    { time: '05:40', trigger: 'After toilet', action: 'I will move for 20 min', days: [true,true,true,false,false,false,false], streak: 10, consistency: 100, createdDate: '2024-01-01' },
    { time: '06:00', trigger: 'After Move', action: 'I will meditate for 20 min', days: [true,true,true,false,false,false,false], streak: 10, consistency: 100, createdDate: '2024-01-01' },
    { time: '06:20', trigger: 'After Meditation', action: 'I will read book for 20 min', days: [true,true,true,false,false,false,false], streak: 10, consistency: 100, createdDate: '2024-01-01' },
    { time: '06:45', trigger: 'After Reading', action: 'I will watch AI Playlist for 45 min', days: [true,true,true,false,false,false,false], streak: 10, consistency: 100, createdDate: '2024-01-01' },
    { time: '07:30', trigger: 'After AI Playlist', action: 'I will make a note of learning', days: [true,true,true,false,false,false,false], streak: 10, consistency: 100, createdDate: '2024-01-01' },
    { time: '07:40', trigger: 'After notes', action: 'I will have morning tea with wife', days: [true,true,true,false,false,false,false], streak: 10, consistency: 100, createdDate: '2024-01-01' },
    { time: '07:50', trigger: 'After tea', action: 'I will take out trash', days: [true,true,true,false,false,false,false], streak: 10, consistency: 100, createdDate: '2024-01-01' },
    { time: '07:55', trigger: 'After putting trash', action: 'I will arrange a dish plate', days: [true,true,true,false,false,false,false], streak: 10, consistency: 100, createdDate: '2024-01-01' },
    { time: '08:00', trigger: 'After arranging dish plate', action: 'I will make a bed', days: [true,true,true,false,false,false,false], streak: 10, consistency: 100, createdDate: '2024-01-01' },
    { time: '08:05', trigger: 'After making bed', action: 'I will put hot water in bucket', days: [true,true,true,false,false,false,false], streak: 10, consistency: 100, createdDate: '2024-01-01' }
  ]);

  weekDays = computed(() => {
    const start = this.currentWeekStart();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        date: `${date.getDate()}/${date.getMonth() + 1}`
      };
    });
  });

  weekRange = computed(() => {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.getDate()} ${start.toLocaleString('default', { month: 'short' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'short' })}`;
  });

  totalMinutes = computed(() => {
    return this.habits().reduce((sum, habit) => 
      sum + habit.days.filter(d => d).length, 0
    );
  });

  avgConsistency = computed(() => {
    const habits = this.habits();
    if (habits.length === 0) return 0;
    const total = habits.reduce((sum, h) => sum + (h.consistency || 0), 0);
    return Math.round(total / habits.length);
  });

  avgStreak = computed(() => {
    const habits = this.habits();
    if (habits.length === 0) return 0;
    const total = habits.reduce((sum, h) => sum + this.calculateStreak(h), 0);
    return Math.round(total / habits.length);
  });

  getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  previousWeek() {
    const current = this.currentWeekStart();
    current.setDate(current.getDate() - 7);
    this.currentWeekStart.set(new Date(current));
  }

  nextWeek() {
    const current = this.currentWeekStart();
    current.setDate(current.getDate() + 7);
    this.currentWeekStart.set(new Date(current));
  }

  addHabit() {
    const today = new Date().toISOString().split('T')[0];
    this.habits.update(habits => [...habits, {
      time: '',
      trigger: '',
      action: '',
      days: [false,false,false,false,false,false,false],
      streak: 0,
      consistency: 0,
      createdDate: today
    }]);
  }

  calculateStreak(habit: WeeklyHabit): number {
    const createdDate = new Date(habit.createdDate);
    createdDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate days since creation (capped at current week view)
    const daysSinceCreation = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysSinceCreation);
  }

  deleteHabit(index: number) {
    this.habits.update(habits => habits.filter((_, i) => i !== index));
  }

  toggleDay(habitIndex: number, dayIndex: number) {
    const habit = this.habits()[habitIndex];
    if (this.isFutureDay(dayIndex) || this.isBeforeCreated(habit, dayIndex)) return;
    
    this.habits.update(habits => {
      const habit = habits[habitIndex];
      habit.days[dayIndex] = !habit.days[dayIndex];
      const completedDays = habit.days.filter((d, i) => d && !this.isFutureDay(i)).length;
      const totalDays = habit.days.filter((_, i) => !this.isFutureDay(i)).length;
      habit.consistency = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
      return [...habits];
    });
  }

  isFutureDay(dayIndex: number): boolean {
    const weekStart = this.currentWeekStart();
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dayDate.setHours(0, 0, 0, 0);
    return dayDate > today;
  }

  isBeforeCreated(habit: WeeklyHabit, dayIndex: number): boolean {
    const weekStart = this.currentWeekStart();
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayIndex);
    const createdDate = new Date(habit.createdDate);
    dayDate.setHours(0, 0, 0, 0);
    createdDate.setHours(0, 0, 0, 0);
    return dayDate < createdDate;
  }
}
