import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get } from 'firebase/database';
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Habit, HabitLog } from '../models/habit.model';
import { environment } from '../../../environments/environment';

const app = initializeApp(environment.firebase);
const database = getDatabase(app);
const auth = getAuth(app);

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  currentUser = signal<User | null>(null);
  authLoading = signal<boolean>(true);

  constructor() {
    // Suppress Firebase Auth UI errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const msg = args[0]?.toString() || '';
      if (msg.includes('MDL') || msg.includes('handler.js') || msg.includes('Cross-Origin')) return;
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const msg = args[0]?.toString() || '';
      if (msg.includes('Cross-Origin') || msg.includes('window.closed')) return;
      originalWarn.apply(console, args);
    };
    
    // Check for redirect result first
    getRedirectResult(auth).catch((error) => {
      if (error.code !== 'auth/popup-blocked') {
        console.error('Redirect result error:', error);
      }
    });
    
    onAuthStateChanged(auth, (user) => {
      this.currentUser.set(user);
      this.authLoading.set(false);
    });
  }

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Fallback to redirect if popup is blocked
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
      } else {
        throw error;
      }
    }
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  private getUserPath(path: string): string {
    const uid = this.currentUser()?.uid;
    if (!uid) throw new Error('User not authenticated');
    return `users/${uid}/${path}`;
  }

  saveHabits(habits: Habit[]): void {
    const habitsRef = ref(database, this.getUserPath('habits'));
    const cleanHabits = JSON.parse(JSON.stringify(habits));
    set(habitsRef, cleanHabits);
  }

  saveLogs(logs: HabitLog[]): void {
    const logsRef = ref(database, this.getUserPath('logs'));
    const cleanLogs = logs.map(log => ({
      habitId: log.habitId,
      date: log.date,
      completed: log.completed,
      ...(log.note && { note: log.note }),
      ...(log.milestoneCount && { milestoneCount: log.milestoneCount })
    }));
    set(logsRef, cleanLogs);
  }

  async getHabits(): Promise<Habit[]> {
    if (!this.currentUser()) return [];
    try {
      const startTime = performance.now();
      const habitsRef = ref(database, this.getUserPath('habits'));
      const snapshot = await get(habitsRef);
      const endTime = performance.now();
      
      if (endTime - startTime > 1000) {
        console.warn(`Slow habits fetch: ${Math.round(endTime - startTime)}ms`);
      }
      
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  }

  async getLogs(): Promise<HabitLog[]> {
    if (!this.currentUser()) return [];
    try {
      const startTime = performance.now();
      const logsRef = ref(database, this.getUserPath('logs'));
      const snapshot = await get(logsRef);
      const endTime = performance.now();
      
      if (endTime - startTime > 1000) {
        console.warn(`Slow logs fetch: ${Math.round(endTime - startTime)}ms`);
      }
      
      return snapshot.exists() ? snapshot.val() : [];
    } catch (error) {
      console.error('Error loading logs:', error);
      return [];
    }
  }

  onHabitsChange(callback: (habits: Habit[]) => void): void {
    if (!this.currentUser()) return;
    const habitsRef = ref(database, this.getUserPath('habits'));
    onValue(habitsRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : []);
    });
  }

  onLogsChange(callback: (logs: HabitLog[]) => void): void {
    if (!this.currentUser()) return;
    const logsRef = ref(database, this.getUserPath('logs'));
    onValue(logsRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : []);
    });
  }

  saveReflection(date: string, reflection: any): void {
    const reflectionRef = ref(database, this.getUserPath(`reflections/${date}`));
    set(reflectionRef, reflection);
  }

  async getReflections(): Promise<any[]> {
    const reflectionsRef = ref(database, this.getUserPath('reflections'));
    const snapshot = await get(reflectionsRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(date => ({ date, ...data[date] }));
  }
}
