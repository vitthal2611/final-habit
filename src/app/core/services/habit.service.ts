import { Injectable, signal } from '@angular/core';
import { Habit, HabitLog, HabitState } from '../models/habit.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private habits = signal<Habit[]>([]);
  private logs = signal<HabitLog[]>([]);

  readonly allHabits = this.habits.asReadonly();
  readonly allLogs = this.logs.asReadonly();

  constructor(private firebase: FirebaseService) {
    this.firebase.onHabitsChange((habits) => this.habits.set(habits));
    this.firebase.onLogsChange((logs) => this.logs.set(logs));
  }

  addHabit(habit: Habit): void {
    const updated = [...this.habits(), habit];
    this.habits.set(updated);
    this.firebase.saveHabits(updated);
  }

  logHabit(habitId: string, date: string, completed: boolean, note?: string, milestoneCount?: number): void {
    const logs = this.logs().filter(l => !(l.habitId === habitId && l.date === date));
    const updated = [...logs, { habitId, date, completed, note, milestoneCount }];
    this.logs.set(updated);
    this.firebase.saveLogs(updated);
  }

  getHabitState(habitId: string, date: string): HabitState {
    const log = this.logs().find(l => l.habitId === habitId && l.date === date);
    if (!log) return 'pending';
    return log.completed ? 'done' : 'missed';
  }

  getWeeklyConsistency(habitId: string, endDate: Date): { completed: number; total: number } {
    let completed = 0;
    let total = 0;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      const log = this.logs().find(l => l.habitId === habitId && l.date === dateStr);
      if (log?.completed) completed++;
      total++;
    }
    
    return { completed, total };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
