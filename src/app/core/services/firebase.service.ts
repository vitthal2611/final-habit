import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get } from 'firebase/database';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Habit, HabitLog } from '../models/habit.model';

const firebaseConfig = {
  apiKey: "AIzaSyCcGMIKGZlWqvOUM1-mjFHIIT-WvKktl_0",
  authDomain: "habit-tracker-86281.firebaseapp.com",
  databaseURL: "https://habit-tracker-86281.firebaseio.com/",
  projectId: "habit-tracker-86281",
  storageBucket: "habit-tracker-86281.firebasestorage.app",
  messagingSenderId: "325420672462",
  appId: "1:325420672462:web:8df0ee22fe8b496356779f"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  currentUser = signal<User | null>(null);
  authLoading = signal<boolean>(true);

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser.set(user);
      this.authLoading.set(false);
    });
  }

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
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
    const habitsRef = ref(database, this.getUserPath('habits'));
    const snapshot = await get(habitsRef);
    return snapshot.exists() ? snapshot.val() : [];
  }

  async getLogs(): Promise<HabitLog[]> {
    const logsRef = ref(database, this.getUserPath('logs'));
    const snapshot = await get(logsRef);
    return snapshot.exists() ? snapshot.val() : [];
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
