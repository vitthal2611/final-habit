import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
        <h1>{{ editMode() ? 'Edit Habit' : 'Create a New Habit' }}</h1>
        <p class="subtitle">Small actions, big identity shifts</p>
      </header>

      <app-card>
        <form (ngSubmit)="onSubmit()">
          
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
            <label>What will you do?</label>
            <input 
              type="text" 
              [(ngModel)]="form.name" 
              name="name"
              placeholder="e.g., Drink a glass of water"
              required>
          </div>

          <div class="form-group">
            <label>Time</label>
            <input 
              type="time" 
              [(ngModel)]="form.time" 
              name="time"
              required>
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

          <div class="form-group">
            <label>Environment design</label>
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
              {{ editMode() ? 'Update Habit' : 'Create Habit' }}
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
      padding: 16px;
    }

    header {
      margin-bottom: 20px;
    }

    h1 {
      font-size: 24px;
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
      margin-bottom: 18px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 18px;
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
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      min-height: 48px;
      -webkit-appearance: none;
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .days-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .day-checkbox {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      cursor: pointer;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 8px;
      -webkit-tap-highlight-color: transparent;
    }

    .day-checkbox input {
      width: 18px;
      height: 18px;
      min-height: auto;
    }

    .color-picker {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .color-option {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 3px solid transparent;
      cursor: pointer;
      transition: transform 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    .color-option:active {
      transform: scale(0.9);
    }

    .color-option.selected {
      border-color: #111827;
      transform: scale(1.1);
    }

    .actions {
      margin-top: 24px;
    }

    .milestone-section {
      padding-top: 18px;
      border-top: 1px solid #e5e7eb;
    }

    .milestone-section > label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      min-height: 44px;
    }

    .milestone-section input[type="checkbox"] {
      width: 20px;
      height: 20px;
      min-height: auto;
    }

    .milestone-inputs {
      margin-top: 16px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
    }

    .hint {
      font-size: 12px;
      color: #9ca3af;
      margin: 4px 0 0 0;
      font-style: italic;
    }

    .contract-section {
      padding-top: 18px;
      border-top: 1px solid #e5e7eb;
    }

    .contract-section > label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      min-height: 44px;
    }

    .contract-section input[type="checkbox"] {
      width: 20px;
      height: 20px;
      min-height: auto;
    }

    .contract-inputs {
      margin-top: 16px;
      padding: 16px;
      background: #fef2f2;
      border-radius: 8px;
      border-left: 3px solid #ef4444;
    }

    @media (min-width: 768px) {
      .creation-flow {
        padding: 24px;
      }

      header {
        margin-bottom: 24px;
      }

      h1 {
        font-size: 28px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-row {
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      input[type="text"],
      input[type="time"],
      select {
        padding: 10px;
        font-size: 15px;
        min-height: auto;
      }

      .color-option {
        width: 40px;
        height: 40px;
      }

      .actions {
        margin-top: 32px;
      }

      .milestone-section {
        padding-top: 20px;
      }

      .contract-section {
        padding-top: 20px;
      }
    }
  `]
})
export class HabitCreationComponent implements OnInit {
  editMode = signal(false);
  habitId = signal<string | null>(null);
  
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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      const habit = this.habitService.getHabitById(id);
      if (habit) {
        this.editMode.set(true);
        this.habitId.set(id);
        this.loadHabitData(habit);
      }
    }
  }

  loadHabitData(habit: Habit) {
    this.form.name = habit.name;
    this.form.identity = habit.identity;
    this.form.when = habit.trigger.when;
    this.form.time = habit.time;
    this.form.where = habit.trigger.where;
    this.form.cue = habit.cue;
    this.form.twoMinuteRule = habit.twoMinuteRule || '';
    this.form.color = habit.color;
    this.form.difficulty = habit.difficulty || 'tiny';
    
    if (Array.isArray(habit.frequency)) {
      this.form.frequency = 'custom';
      this.selectedDays.set(habit.frequency);
    } else {
      this.form.frequency = 'daily';
    }
  }

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
      id: this.editMode() ? this.habitId()! : self.crypto.randomUUID(),
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
      createdAt: this.editMode() ? this.habitService.getHabitById(this.habitId()!)!.createdAt : new Date(),
      difficulty: this.form.difficulty as 'tiny' | 'easy' | 'moderate'
    };

    if (this.editMode()) {
      this.habitService.updateHabit(habit);
    } else {
      this.habitService.addHabit(habit);
    }
    
    this.router.navigate(['/']);
  }
}
