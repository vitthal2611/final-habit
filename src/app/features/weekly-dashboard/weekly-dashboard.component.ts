import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface WeeklyHabit {
  time: string;
  trigger: string;
  action: string;
  days: number[];
  streak: number;
  consistency: number;
}

@Component({
  selector: 'app-weekly-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard">
      <header class="header">
        <h1>Life Habit Tracker</h1>
        <div class="week-selector">
          <button (click)="previousWeek()" class="nav-btn">←</button>
          <span class="week-range">Week: {{ weekRange() }}</span>
          <button (click)="nextWeek()" class="nav-btn">→</button>
        </div>
      </header>

      <div class="table-container">
        <table class="habit-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Trigger</th>
              <th>Action</th>
              <th *ngFor="let day of weekDays()">{{ day.label }}<br><small>{{ day.date }}</small></th>
              <th>Streak</th>
              <th>Consistency</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let habit of habits(); let i = index">
              <td>
                <input [(ngModel)]="habit.time" class="input-time" />
              </td>
              <td>
                <input [(ngModel)]="habit.trigger" class="input-text" />
              </td>
              <td>
                <input [(ngModel)]="habit.action" class="input-text" />
              </td>
              <td *ngFor="let day of [0,1,2,3,4,5,6]; let j = index" class="day-cell">
                <input 
                  type="number" 
                  [(ngModel)]="habit.days[j]" 
                  class="input-minutes"
                  (change)="updateMetrics(i)"
                  min="0"
                  max="1440"
                />
              </td>
              <td class="streak-cell">
                <span class="streak-badge">{{ habit.streak }}</span>
              </td>
              <td class="consistency-cell">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="habit.consistency"></div>
                  <span class="progress-text">{{ habit.consistency }}%</span>
                </div>
              </td>
              <td>
                <button (click)="deleteHabit(i)" class="btn-delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button (click)="addHabit()" class="btn-add">+ Add Habit</button>

      <div class="summary">
        <div class="summary-card">
          <h3>Total Minutes</h3>
          <p class="summary-value">{{ totalMinutes() }}</p>
        </div>
        <div class="summary-card">
          <h3>Avg Consistency</h3>
          <p class="summary-value">{{ avgConsistency() }}%</p>
        </div>
        <div class="summary-card">
          <h3>Active Habits</h3>
          <p class="summary-value">{{ habits().length }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1600px;
      margin: 0 auto;
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .header {
      background: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .header h1 {
      margin: 0 0 16px 0;
      font-size: 28px;
      color: #1a1a1a;
      font-weight: 700;
    }

    .week-selector {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .week-range {
      font-size: 16px;
      font-weight: 600;
      color: #495057;
    }

    .nav-btn {
      background: #6366f1;
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.2s;
    }

    .nav-btn:hover {
      background: #4f46e5;
      transform: scale(1.05);
    }

    .table-container {
      background: white;
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin-bottom: 20px;
    }

    .habit-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 1200px;
    }

    .habit-table th {
      background: #6366f1;
      color: white;
      padding: 16px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-right: 1px solid rgba(255,255,255,0.1);
    }

    .habit-table th small {
      font-size: 11px;
      opacity: 0.9;
      font-weight: 400;
    }

    .habit-table td {
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
      border-right: 1px solid #e9ecef;
    }

    .habit-table tr:hover {
      background: #f8f9fa;
    }

    .input-time {
      width: 80px;
      padding: 8px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      font-size: 14px;
    }

    .input-text {
      width: 100%;
      min-width: 180px;
      padding: 8px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      font-size: 14px;
    }

    .input-minutes {
      width: 60px;
      padding: 8px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      text-align: center;
      font-size: 14px;
      font-weight: 600;
    }

    .day-cell {
      text-align: center;
      background: #f8f9fa;
    }

    .input-minutes:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .streak-cell {
      text-align: center;
    }

    .streak-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 14px;
    }

    .consistency-cell {
      min-width: 140px;
    }

    .progress-bar {
      position: relative;
      height: 32px;
      background: #e9ecef;
      border-radius: 16px;
      overflow: hidden;
    }

    .progress-fill {
      position: absolute;
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      transition: width 0.3s ease;
    }

    .progress-text {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-weight: 700;
      font-size: 13px;
      color: #1a1a1a;
      z-index: 1;
    }

    .btn-delete {
      background: #ef4444;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-delete:hover {
      background: #dc2626;
      transform: scale(1.05);
    }

    .btn-add {
      background: #6366f1;
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 24px;
      transition: all 0.2s;
    }

    .btn-add:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .summary-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      text-align: center;
    }

    .summary-card h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .summary-value {
      margin: 0;
      font-size: 36px;
      font-weight: 700;
      color: #6366f1;
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: 12px;
      }

      .header {
        padding: 16px;
      }

      .header h1 {
        font-size: 22px;
      }

      .habit-table th {
        padding: 12px 8px;
        font-size: 11px;
      }

      .input-minutes {
        width: 50px;
        padding: 6px;
      }
    }
  `]
})
export class WeeklyDashboardComponent {
  currentWeekStart = signal(this.getMonday(new Date()));
  
  habits = signal<WeeklyHabit[]>([
    { time: '5:40 AM', trigger: 'After toilet', action: 'I will move for 20 min', days: [20,20,20,20,20,20,20], streak: 10, consistency: 100 },
    { time: '6:00 AM', trigger: 'After Move', action: 'I will meditate for 20 min', days: [20,20,20,20,20,20,20], streak: 10, consistency: 100 },
    { time: '6:20 AM', trigger: 'After Meditation', action: 'I will read book for 20 min', days: [20,20,20,20,20,20,20], streak: 10, consistency: 100 },
    { time: '6:45 AM', trigger: 'After Reading', action: 'I will watch AI Playlist for 45 min', days: [45,45,45,45,45,45,45], streak: 10, consistency: 100 },
    { time: '7:30 AM', trigger: 'After AI Playlist', action: 'I will make a note of learning', days: [10,10,10,10,10,10,10], streak: 10, consistency: 100 },
    { time: '7:40 AM', trigger: 'After notes', action: 'I will have morning tea with wife', days: [10,10,10,10,10,10,10], streak: 10, consistency: 100 },
    { time: '7:50 AM', trigger: 'After tea', action: 'I will take out trash', days: [5,5,5,5,5,5,5], streak: 10, consistency: 100 },
    { time: '7:55 AM', trigger: 'After putting trash', action: 'I will arrange a dish plate', days: [5,5,5,5,5,5,5], streak: 10, consistency: 100 },
    { time: '8:00 AM', trigger: 'After arranging dish plate', action: 'I will make a bed', days: [5,5,5,5,5,5,5], streak: 10, consistency: 100 },
    { time: '8:05 AM', trigger: 'After making bed', action: 'I will put hot water in bucket', days: [5,5,5,5,5,5,5], streak: 10, consistency: 100 }
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
      sum + habit.days.reduce((a, b) => a + b, 0), 0
    );
  });

  avgConsistency = computed(() => {
    const habits = this.habits();
    if (habits.length === 0) return 0;
    const total = habits.reduce((sum, h) => sum + h.consistency, 0);
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
    this.habits.update(habits => [...habits, {
      time: '',
      trigger: '',
      action: '',
      days: [0,0,0,0,0,0,0],
      streak: 0,
      consistency: 0
    }]);
  }

  deleteHabit(index: number) {
    this.habits.update(habits => habits.filter((_, i) => i !== index));
  }

  updateMetrics(index: number) {
    this.habits.update(habits => {
      const habit = habits[index];
      const completedDays = habit.days.filter(d => d > 0).length;
      habit.consistency = Math.round((completedDays / 7) * 100);
      return [...habits];
    });
  }
}
