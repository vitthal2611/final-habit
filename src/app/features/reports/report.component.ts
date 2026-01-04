import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../core/services/habit.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="report">
      <header>
        <h1>Habit Report</h1>
        <p class="subtitle">Day-wise votes for all habits</p>
      </header>

      <div class="filters">
        <select [(ngModel)]="filterType" (change)="updateReport()">
          <option value="30days">Last 30 Days</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
        
        <div *ngIf="filterType === 'custom'" class="date-inputs">
          <input type="date" [(ngModel)]="startDate" (change)="updateReport()">
          <input type="date" [(ngModel)]="endDate" (change)="updateReport()">
        </div>
      </div>

      <div class="report-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th *ngFor="let habit of habits()">{{ habit.name }}</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let day of reportDays()">
              <td class="date-cell">{{ day.date | date:'MMM d, y' }}</td>
              <td *ngFor="let habit of habits()" class="vote-cell">
                <span class="vote" [class.voted]="hasVote(habit.id, day.dateStr)">
                  {{ hasVote(habit.id, day.dateStr) ? '✓' : '-' }}
                </span>
              </td>
              <td class="total-cell">{{ getDayTotal(day.dateStr) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td *ngFor="let habit of habits()" class="total-cell">
                <strong>{{ getHabitTotal(habit.id) }}</strong>
              </td>
              <td class="total-cell">
                <strong>{{ getGrandTotal() }}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .report {
      max-width: 1200px;
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

    .filters {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      align-items: center;
    }

    .filters select,
    .date-inputs input {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
    }

    .date-inputs {
      display: flex;
      gap: 8px;
    }

    .report-table {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      border-bottom: 2px solid #e5e7eb;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
    }

    .date-cell {
      font-weight: 600;
      color: #374151;
    }

    .vote-cell {
      text-align: center;
    }

    .vote {
      display: inline-block;
      width: 24px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      border-radius: 4px;
      color: #9ca3af;
    }

    .vote.voted {
      background: #10b981;
      color: white;
      font-weight: bold;
    }

    .total-cell {
      text-align: center;
      font-weight: 600;
      color: #6366f1;
    }

    tfoot td {
      border-top: 2px solid #e5e7eb;
      border-bottom: none;
      padding-top: 16px;
    }
  `]
})
export class ReportComponent {
  habits = computed(() => {
    return this.habitService.allHabits().sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
  });
  filterType = 'month';
  startDate = '';
  endDate = '';
  reportDays = signal<Array<{date: Date, dateStr: string}>>([]);
  
  constructor(private habitService: HabitService) {
    this.updateReport();
  }

  updateReport() {
    const days = [];
    let start: Date;
    let end = new Date();

    if (this.filterType === '30days') {
      start = new Date();
      start.setDate(start.getDate() - 29);
    } else if (this.filterType === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (this.filterType === 'year') {
      start = new Date(end.getFullYear(), 0, 1);
    } else if (this.filterType === 'custom' && this.startDate && this.endDate) {
      start = new Date(this.startDate);
      end = new Date(this.endDate);
    } else {
      start = new Date();
      start.setDate(start.getDate() - 29);
    }

    const current = new Date(start);
    while (current <= end) {
      days.push({
        date: new Date(current),
        dateStr: current.toISOString().split('T')[0]
      });
      current.setDate(current.getDate() + 1);
    }
    
    this.reportDays.set(days.reverse());
  }

  hasVote(habitId: string, date: string): boolean {
    return this.habitService.getHabitState(habitId, date) === 'done';
  }

  getDayTotal(date: string): number {
    return this.habits().filter(h => this.hasVote(h.id, date)).length;
  }

  getHabitTotal(habitId: string): number {
    return this.habitService.allLogs()
      .filter(l => l.habitId === habitId && l.completed)
      .length;
  }

  getGrandTotal(): number {
    return this.habitService.allLogs()
      .filter(l => l.completed)
      .length;
  }
}
