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
      
      // Add test data if no habits exist
      const finalHabits = updatedHabits.length === 0 ? this.getTestHabits() : updatedHabits;
      const finalLogs = updatedHabits.length === 0 ? this.getTestLogs() : logs;
      
      this.habits.set(finalHabits);
      this.logs.set(finalLogs);
      this.loaded.set(true);
      
      // Save updated habits and logs if any were modified
      if (habits.some(h => !h.startDate) || updatedHabits.length === 0) {
        this.firebase.saveHabits(finalHabits);
        this.firebase.saveLogs(finalLogs);
      }
      
      // Setup real-time listeners after initial load
      this.firebase.onHabitsChange((habits) => this.habits.set(habits));
      this.firebase.onLogsChange((logs) => this.logs.set(logs));
    } catch (error) {
      console.error('Failed to load habits:', error);
      this.loaded.set(true);
    }
  }

  private getTestHabits(): Habit[] {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return [
      { id: '1', name: 'Morning meditation', identity: 'a mindful person', trigger: { when: 'After I wake up', where: 'bedroom' }, time: '06:00', cue: 'Meditation cushion by bed', reward: 'Feel calm and centered', frequency: 'daily', color: '#8b5cf6', createdAt: new Date(weekAgo), startDate: weekAgo, twoMinuteRule: 'Just sit for 2 minutes', difficulty: 'tiny' },
      { id: '2', name: 'Drink water', identity: 'a healthy person', trigger: { when: 'After I brush teeth', where: 'bathroom' }, time: '06:30', cue: 'Water bottle on counter', reward: 'Feel energized', frequency: 'daily', color: '#3b82f6', createdAt: new Date(weekAgo), startDate: weekAgo, twoMinuteRule: 'Drink one glass', difficulty: 'tiny', stackedAfter: '1' },
      { id: '3', name: 'Read 10 pages', identity: 'a reader', trigger: { when: 'After breakfast', where: 'living room' }, time: '08:00', cue: 'Book on coffee table', reward: 'Learn something new', frequency: 'daily', color: '#10b981', createdAt: new Date(weekAgo), startDate: weekAgo, twoMinuteRule: 'Read 1 page', difficulty: 'easy', milestone: { target: 12, unit: 'books', period: 'year' } },
      { id: '4', name: 'Gym workout', identity: 'an athlete', trigger: { when: 'After work', where: 'gym' }, time: '18:00', cue: 'Gym bag by door', reward: 'Feel strong', frequency: [0,2,4], color: '#ef4444', createdAt: new Date(weekAgo), startDate: weekAgo, twoMinuteRule: 'Do 5 pushups', difficulty: 'moderate', contract: { commitment: 'Work out 3x per week', consequence: 'Donate $20 to charity' } },
      { id: '5', name: 'Journal', identity: 'a reflective person', trigger: { when: 'Before bed', where: 'bedroom' }, time: '21:00', cue: 'Journal on nightstand', reward: 'Process my day', frequency: 'daily', color: '#f59e0b', createdAt: new Date(weekAgo), startDate: weekAgo, twoMinuteRule: 'Write one sentence', difficulty: 'easy', dailyProgress: { required: true, measure: 'pages', target: 1 } },
      { id: '6', name: 'Practice guitar', identity: 'a musician', trigger: { when: 'After dinner', where: 'music room' }, time: '19:30', cue: 'Guitar on stand', reward: 'Express creativity', frequency: [1,3,5], color: '#ec4899', createdAt: new Date(weekAgo), startDate: weekAgo, twoMinuteRule: 'Play one chord', difficulty: 'moderate', milestone: { target: 50, unit: 'songs', period: 'year' } },
      { id: '7', name: 'Morning run', identity: 'a runner', trigger: { when: 'After waking up', where: 'park' }, time: '06:15', cue: 'Running shoes by bed', reward: 'Feel energized', frequency: [0,1,2,3,4], color: '#14b8a6', createdAt: new Date(weekAgo), startDate: weekAgo, twoMinuteRule: 'Walk for 2 minutes', difficulty: 'moderate', dailyProgress: { required: true, measure: 'km', target: 5 }, milestone: { target: 500, unit: 'km', period: 'year' } },
      { id: '8', name: 'Learn Spanish', identity: 'a polyglot', trigger: { when: 'During lunch', where: 'office' }, time: '12:30', cue: 'Duolingo app', reward: 'Expand my mind', frequency: 'daily', color: '#f97316', createdAt: new Date(weekAgo), startDate: weekAgo, twoMinuteRule: 'One lesson', difficulty: 'easy', contract: { commitment: 'Complete daily lesson', consequence: 'Skip coffee', accountabilityPartner: 'Sarah' } },
      { id: '9', name: 'Hiking', identity: 'an adventurer', trigger: { when: 'Weekend morning', where: 'mountains' }, time: '08:00', cue: 'Hiking boots', reward: 'Connect with nature', frequency: [5,6], color: '#06b6d4', createdAt: new Date(weekAgo), startDate: weekAgo, twoMinuteRule: 'Walk outside', difficulty: 'moderate', milestone: { target: 24, unit: 'trails', period: 'year' } },
      { id: '10', name: 'Meal prep', identity: 'a healthy eater', trigger: { when: 'Sunday afternoon', where: 'kitchen' }, time: '14:00', cue: 'Meal containers', reward: 'Eat well all week', frequency: [6], color: '#6366f1', createdAt: new Date(weekAgo), startDate: weekAgo, twoMinuteRule: 'Chop one vegetable', difficulty: 'easy', dailyProgress: { required: false, measure: 'meals' } }
    ];
  }

  private getTestLogs(): HabitLog[] {
    const logs: HabitLog[] = [];
    const today = new Date();
    
    // Generate logs for past 7 days with varying completion rates
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      // Completion patterns matching frequency schedules
      const habits = this.getTestHabits();
      
      habits.forEach((habit, habitIndex) => {
        // Check if habit is scheduled for this day
        let isScheduled = false;
        if (habit.frequency === 'daily') {
          isScheduled = true;
        } else if (Array.isArray(habit.frequency)) {
          isScheduled = habit.frequency.includes(mondayBasedDay);
        }
        
        // Only log if scheduled
        if (isScheduled) {
          // Different completion patterns
          const patterns = [
            [1,1,1,1,1,1,1], // Perfect
            [1,1,1,1,1,0,1], // Almost perfect
            [1,0,1,1,0,1,1], // Good
            [1,1,0,1,0,1,0], // Moderate (Mon/Wed/Fri)
            [1,0,1,0,1,0,1], // Inconsistent
            [1,1,1,0,0,1,1], // Improving (Tue/Thu/Sat)
            [1,1,1,1,1,1,0], // Recent miss
            [1,1,1,1,1,1,1], // Perfect
            [1,1,1,1,1,1,1], // Perfect (Sunday only)
            [1,1,0,0,1,1,1]  // Mixed (Weekdays)
          ];
          
          const completed = patterns[habitIndex][i] === 1;
          const log: HabitLog = { habitId: habit.id, date: dateStr, completed };
          
          // Add milestone/progress data for specific habits
          if (completed) {
            if (habit.id === '3') log.milestoneCount = 10; // pages read
            if (habit.id === '5') log.progressValue = 1; // journal pages
            if (habit.id === '7') log.progressValue = Math.floor(Math.random() * 3) + 3; // 3-5 km
          }
          
          logs.push(log);
        }
      });
    }
    
    return logs;
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

  isHabitScheduledForDate(habit: Habit, date: Date): boolean {
    if (habit.frequency === 'daily') return true;
    const dayOfWeek = date.getDay();
    const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return Array.isArray(habit.frequency) && habit.frequency.includes(mondayBasedDay);
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
