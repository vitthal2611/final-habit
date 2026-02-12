import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, User, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { Habit, HabitLog } from '../models/habit.model';
import { environment } from '../../../environments/environment';

const app = initializeApp(environment.firebase);
const database = getDatabase(app);
const auth = getAuth(app);
auth.useDeviceLanguage();

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  currentUser = signal<User | null>(null);
  authLoading = signal<boolean>(true);
  authError = signal<string>('');

  constructor() {
    this.initAuth();
  }

  private async initAuth() {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (error: any) {
      console.error('[Auth] Init error:', error);
    }
    
    onAuthStateChanged(auth, (user) => {
      this.currentUser.set(user);
      this.authLoading.set(false);
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    this.authLoading.set(true);
    this.authError.set('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      this.authLoading.set(false);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        this.authError.set('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        this.authError.set('Invalid email format');
      } else {
        this.authError.set('Sign in failed');
      }
      throw error;
    }
  }

  async signUp(email: string, password: string): Promise<void> {
    this.authLoading.set(true);
    this.authError.set('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      this.authLoading.set(false);
      if (error.code === 'auth/email-already-in-use') {
        this.authError.set('Email already in use');
      } else if (error.code === 'auth/weak-password') {
        this.authError.set('Password too weak');
      } else if (error.code === 'auth/invalid-email') {
        this.authError.set('Invalid email format');
      } else {
        this.authError.set('Sign up failed');
      }
      throw error;
    }
  }



  clearAuthError(): void {
    this.authError.set('');
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
    try {
      const habitsRef = ref(database, this.getUserPath('habits'));
      const cleanHabits = JSON.parse(JSON.stringify(habits));
      set(habitsRef, cleanHabits).catch(error => {
        console.error('Error saving habits:', error);
      });
    } catch (error) {
      console.error('Error preparing habits for save:', error);
    }
  }

  saveLogs(logs: HabitLog[]): void {
    try {
      const logsRef = ref(database, this.getUserPath('logs'));
      const cleanLogs = logs.map(log => ({
        habitId: log.habitId,
        date: log.date,
        completed: log.completed,
        ...(log.note && { note: log.note }),
        ...(log.milestoneCount && { milestoneCount: log.milestoneCount }),
        ...(log.progressValue && { progressValue: log.progressValue })
      }));
      set(logsRef, cleanLogs).catch(error => {
        console.error('Error saving logs:', error);
      });
    } catch (error) {
      console.error('Error preparing logs for save:', error);
    }
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
    try {
      const habitsRef = ref(database, this.getUserPath('habits'));
      onValue(habitsRef, (snapshot) => {
        callback(snapshot.exists() ? snapshot.val() : []);
      }, (error) => {
        console.error('Error listening to habits changes:', error);
      });
    } catch (error) {
      console.error('Error setting up habits listener:', error);
    }
  }

  onLogsChange(callback: (logs: HabitLog[]) => void): void {
    if (!this.currentUser()) return;
    try {
      const logsRef = ref(database, this.getUserPath('logs'));
      onValue(logsRef, (snapshot) => {
        callback(snapshot.exists() ? snapshot.val() : []);
      }, (error) => {
        console.error('Error listening to logs changes:', error);
      });
    } catch (error) {
      console.error('Error setting up logs listener:', error);
    }
  }

  saveReflection(date: string, reflection: any): void {
    try {
      const reflectionRef = ref(database, this.getUserPath(`reflections/${date}`));
      set(reflectionRef, reflection).catch(error => {
        console.error('Error saving reflection:', error);
      });
    } catch (error) {
      console.error('Error preparing reflection for save:', error);
    }
  }

  async getReflections(): Promise<any[]> {
    if (!this.currentUser()) return [];
    try {
      const reflectionsRef = ref(database, this.getUserPath('reflections'));
      const snapshot = await get(reflectionsRef);
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.keys(data).map(date => ({ date, ...data[date] }));
    } catch (error) {
      console.error('Error loading reflections:', error);
      return [];
    }
  }
}
