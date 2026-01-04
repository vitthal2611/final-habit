import { Injectable } from '@angular/core';
import { Habit, HabitLog } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly HABITS_KEY = 'atomic_habits';
  private readonly LOGS_KEY = 'atomic_logs';

  getHabits(): Habit[] {
    const data = localStorage.getItem(this.HABITS_KEY);
    if (data) return JSON.parse(data);
    
    // Sample habits for testing
    const sampleHabits: Habit[] = [
      {
        id: '1',
        name: 'Drink a glass of water',
        identity: 'a healthy person',
        trigger: { when: 'After I wake up', where: 'In the kitchen' },
        time: '07:00',
        cue: 'Water bottle on counter',
        reward: 'Refreshed and energized',
        frequency: 'daily',
        color: '#10b981',
        createdAt: new Date(),
        difficulty: 'tiny'
      },
      {
        id: '2',
        name: 'Read 10 pages',
        identity: 'a reader',
        trigger: { when: 'Before bed', where: 'In my bedroom' },
        time: '21:30',
        cue: 'Book on nightstand',
        reward: 'Calm and inspired',
        frequency: 'daily',
        color: '#6366f1',
        createdAt: new Date(),
        milestone: {
          target: 24,
          unit: 'books',
          period: 'year'
        },
        difficulty: 'easy',
        contract: {
          commitment: 'I will read 10 pages every night at 9:30 PM',
          consequence: 'Break the chain',
          accountabilityPartner: 'My reading buddy'
        }
      },
      {
        id: '3',
        name: 'Write 3 sentences in journal',
        identity: 'a reflective person',
        trigger: { when: 'After I drink water', where: 'At my desk' },
        time: '07:15',
        cue: 'Journal next to coffee mug',
        reward: 'Clear and focused',
        frequency: 'daily',
        color: '#f59e0b',
        createdAt: new Date(),
        difficulty: 'tiny',
        stackedAfter: '1'
      },
      {
        id: '4',
        name: 'Walk for 10 minutes',
        identity: 'an active person',
        trigger: { when: 'After lunch', where: 'Around the block' },
        time: '13:00',
        cue: 'Walking shoes by front door',
        reward: 'Energized and refreshed',
        frequency: 'daily',
        color: '#ec4899',
        createdAt: new Date(),
        difficulty: 'easy'
      },
      {
        id: '5',
        name: 'List 3 things I am grateful for',
        identity: 'a grateful person',
        trigger: { when: 'Before I turn off the lights', where: 'In bed' },
        time: '22:00',
        cue: 'Phone on nightstand',
        reward: 'Peaceful and content',
        frequency: 'daily',
        color: '#8b5cf6',
        createdAt: new Date(),
        difficulty: 'tiny'
      },
      {
        id: '6',
        name: 'Take 5 deep breaths',
        identity: 'a mindful person',
        trigger: { when: 'After I drink water', where: 'On my yoga mat' },
        time: '07:10',
        cue: 'Yoga mat rolled out in corner',
        reward: 'Centered and calm',
        frequency: 'daily',
        color: '#06b6d4',
        createdAt: new Date(),
        difficulty: 'tiny',
        stackedAfter: '1'
      }
    ];
    
    this.saveHabits(sampleHabits);
    return sampleHabits;
  }

  saveHabits(habits: Habit[]): void {
    localStorage.setItem(this.HABITS_KEY, JSON.stringify(habits));
  }

  getLogs(): HabitLog[] {
    const data = localStorage.getItem(this.LOGS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveLogs(logs: HabitLog[]): void {
    localStorage.setItem(this.LOGS_KEY, JSON.stringify(logs));
  }
}
