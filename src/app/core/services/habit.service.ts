import { Injectable, signal } from '@angular/core';
import { Habit, HabitLog, HabitState } from '../models/habit.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private habits = signal<Habit[]>([]);
  private logs = signal<HabitLog[]>([]);
  private loaded = signal<boolean>(false);

  readonly allHabits = this.habits.asReadonly();
  readonly allLogs = this.logs.asReadonly();
  readonly isLoaded = this.loaded.asReadonly();

  constructor(private firebase: FirebaseService) {
    this.loadInitialData();
  }

  private async loadInitialData() {
    try {
      const [habits, logs] = await Promise.all([
        this.firebase.getHabits(),
        this.firebase.getLogs()
      ]);
      
      // Set default startDate for existing habits without one
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const updatedHabits = habits.map(h => ({
        ...h,
        startDate: h.startDate || yearStart
      }));
      
      this.habits.set(updatedHabits);
      this.logs.set(logs);
      this.loaded.set(true);
      
      // Save updated habits if any were modified
      if (habits.some(h => !h.startDate)) {
        this.firebase.saveHabits(updatedHabits);
      }
      
      // Setup real-time listeners after initial load
      this.firebase.onHabitsChange((habits) => this.habits.set(habits));
      this.firebase.onLogsChange((logs) => this.logs.set(logs));
    } catch (error) {
      console.error('Failed to load habits:', error);
      this.loaded.set(true);
    }
  }

  addHabit(habit: Habit): void {
    const updated = [...this.habits(), habit];
    this.habits.set(updated);
    this.firebase.saveHabits(updated);
  }

  updateHabit(habit: Habit): void {
    const updated = this.habits().map(h => h.id === habit.id ? habit : h);
    this.habits.set(updated);
    this.firebase.saveHabits(updated);
  }

  deleteHabit(habitId: string): void {
    const updated = this.habits().filter(h => h.id !== habitId);
    this.habits.set(updated);
    this.firebase.saveHabits(updated);
    // Also delete associated logs
    const updatedLogs = this.logs().filter(l => l.habitId !== habitId);
    this.logs.set(updatedLogs);
    this.firebase.saveLogs(updatedLogs);
  }

  getHabitById(id: string): Habit | undefined {
    return this.habits().find(h => h.id === id);
  }

  logHabit(habitId: string, date: string, completed: boolean, note?: string, milestoneCount?: number, progressValue?: number): void {
    const logs = this.logs().filter(l => !(l.habitId === habitId && l.date === date));
    const updated = [...logs, { habitId, date, completed, note, milestoneCount, progressValue }];
    this.logs.set(updated);
    this.firebase.saveLogs(updated);
  }

  removeLog(habitId: string, date: string): void {
    const updated = this.logs().filter(l => !(l.habitId === habitId && l.date === date));
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
