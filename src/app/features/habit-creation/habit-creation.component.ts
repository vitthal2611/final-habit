import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HabitService } from '../../core/services/habit.service';
import { Habit } from '../../core/models/habit.model';
import { ButtonComponent } from '../../shared/ui/button.component';
import { CardComponent } from '../../shared/ui/card.component';

@Component({
  selector: 'app-habit-creation',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent],
  template: `
    <div class="creation-flow">
      <header>
        <h1>Create a New Habit</h1>
        <p class="subtitle">Small actions, big identity shifts</p>
      </header>

      <app-card>
        <form (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label>What will you do?</label>
            <input 
              type="text" 
              [(ngModel)]="form.name" 
              name="name"
              placeholder="e.g., Drink a glass of water"
              required>
          </div>

          <div class="form-group">
            <label>Who does this make you?</label>
            <input 
              type="text" 
              [(ngModel)]="form.identity" 
              name="identity"
              list="identityList"
              placeholder="e.g., a healthy person"
              required>
            <datalist id="identityList">
              <option *ngFor="let identity of uniqueIdentities()" [value]="identity">
            </datalist>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>When?</label>
              <input 
                type="text" 
                [(ngModel)]="form.when" 
                name="when"
                list="whenList"
                placeholder="e.g., After I wake up"
                required>
              <datalist id="whenList">
                <option *ngFor="let trigger of uniqueTriggers()" [value]="trigger">
              </datalist>
            </div>

            <div class="form-group">
              <label>Time</label>
              <input 
                type="time" 
                [(ngModel)]="form.time" 
                name="time"
                required>
            </div>
          </div>

          <div class="form-group">
            <label>Where?</label>
            <input 
              type="text" 
              [(ngModel)]="form.where" 
              name="where"
              placeholder="In the kitchen"
              required>
          </div>

          <div class="form-group">
            <label>What's your cue?</label>
            <input 
              type="text" 
              [(ngModel)]="form.cue" 
              name="cue"
              placeholder="Water bottle on counter"
              required>
          </div>

          <div class="form-group">
            <label>2-Minute Rule (optional)</label>
            <input 
              type="text" 
              [(ngModel)]="form.twoMinuteRule" 
              name="twoMinuteRule"
              placeholder="e.g., Just put on my running shoes">
            <p class="hint">Start with the smallest version of your habit</p>
          </div>

          <div class="form-group">
            <label>Frequency</label>
            <select [(ngModel)]="form.frequency" name="frequency">
              <option value="daily">Every day</option>
              <option value="custom">Custom days</option>
            </select>
          </div>

          <div class="form-group" *ngIf="form.frequency === 'custom'">
            <label>Select days</label>
            <div class="days-selector">
              <label *ngFor="let day of days; let i = index" class="day-checkbox">
                <input 
                  type="checkbox" 
                  [checked]="selectedDays().includes(i)"
                  (change)="toggleDay(i)">
                {{ day }}
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Choose a color</label>
            <div class="color-picker">
              <button 
                type="button"
                *ngFor="let color of colors"
                class="color-option"
                [class.selected]="form.color === color"
                [style.background]="color"
                (click)="form.color = color">
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>How hard is this habit?</label>
            <select [(ngModel)]="form.difficulty" name="difficulty">
              <option value="tiny">Tiny (2 min or less)</option>
              <option value="easy">Easy (5-10 min)</option>
              <option value="moderate">Moderate (15+ min)</option>
            </select>
            <p class="hint">Start tiny. You can always do more.</p>
          </div>

          <div class="actions">
            <app-button type="submit" variant="primary">
              Create Habit
            </app-button>
          </div>
        </form>
      </app-card>
    </div>
  `,
  styles: [`
    .creation-flow {
      max-width: 600px;
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

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
    }

    input[type="text"],
    input[type="time"],
    select {
      width: 100%;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 15px;
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: #6366f1;
    }

    .days-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .day-checkbox {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      cursor: pointer;
    }

    .color-picker {
      display: flex;
      gap: 12px;
    }

    .color-option {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid transparent;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .color-option:hover {
      transform: scale(1.1);
    }

    .color-option.selected {
      border-color: #111827;
    }

    .actions {
      margin-top: 32px;
    }

    .milestone-section {
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .milestone-section > label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .milestone-section input[type="checkbox"] {
      width: auto;
    }

    .milestone-inputs {
      margin-top: 16px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 6px;
    }

    .hint {
      font-size: 12px;
      color: #9ca3af;
      margin: 4px 0 0 0;
      font-style: italic;
    }

    .contract-section {
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .contract-section > label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .contract-section input[type="checkbox"] {
      width: auto;
    }

    .contract-inputs {
      margin-top: 16px;
      padding: 16px;
      background: #fef2f2;
      border-radius: 6px;
      border-left: 3px solid #ef4444;
    }
  `]
})
export class HabitCreationComponent {
  form = {
    name: '',
    identity: '',
    when: '',
    time: '',
    where: '',
    cue: '',
    twoMinuteRule: '',
    frequency: 'daily',
    color: '#6366f1',
    difficulty: 'tiny',
    contractCommitment: '',
    accountabilityPartner: ''
  };

  days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  selectedDays = signal<number[]>([]);
  
  uniqueTriggers = computed(() => {
    const triggers = this.habitService.allHabits().map(h => h.trigger.when);
    return [...new Set(triggers)].filter(t => t);
  });

  uniqueIdentities = computed(() => {
    const identities = this.habitService.allHabits().map(h => h.identity);
    return [...new Set(identities)].filter(i => i);
  });
  
  colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  constructor(
    private habitService: HabitService,
    private router: Router
  ) {}

  toggleDay(day: number) {
    const current = this.selectedDays();
    if (current.includes(day)) {
      this.selectedDays.set(current.filter(d => d !== day));
    } else {
      this.selectedDays.set([...current, day].sort());
    }
  }

  onSubmit() {
    const habit: Habit = {
      id: self.crypto.randomUUID(),
      name: this.form.name,
      identity: this.form.identity,
      trigger: {
        when: this.form.when,
        where: this.form.where
      },
      time: this.form.time,
      cue: this.form.cue,
      reward: '',
      twoMinuteRule: this.form.twoMinuteRule || undefined,
      frequency: this.form.frequency === 'daily' ? 'daily' : this.selectedDays(),
      color: this.form.color,
      createdAt: new Date(),
      difficulty: this.form.difficulty as 'tiny' | 'easy' | 'moderate'
    };

    this.habitService.addHabit(habit);
    this.router.navigate(['/']);
  }
}
