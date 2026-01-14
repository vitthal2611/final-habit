import { Component, signal, computed, OnInit, effect } from '@angular/core';
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
        <button class="back-btn" (click)="goBack()" *ngIf="currentStep() > 1">
          ← Back
        </button>
        <div class="progress-dots">
          <span *ngFor="let step of [1,2,3,4]" 
                [class.active]="currentStep() >= step"
                [class.current]="currentStep() === step"></span>
        </div>
      </header>

      <app-card>
        <!-- Step 1: Identity -->
        <form *ngIf="currentStep() === 1" (ngSubmit)="nextStep()">
          <div class="step-content">
            <h1>Who are you becoming?</h1>
            <p class="subtitle">Every action is a vote for the person you want to be</p>

            <div class="form-group">
              <label>I am a...</label>
              <input 
                type="text" 
                [(ngModel)]="form.identity" 
                name="identity"
                list="identityList"
                placeholder="person who moves daily"
                required
                autofocus>
              <datalist id="identityList">
                <option *ngFor="let identity of uniqueIdentities()" [value]="identity">
              </datalist>
            </div>

            <div class="examples">
              <p class="examples-label">Examples:</p>
              <button type="button" class="example-chip" (click)="form.identity = 'person who prioritizes health'">person who prioritizes health</button>
              <button type="button" class="example-chip" (click)="form.identity = 'reader'">reader</button>
              <button type="button" class="example-chip" (click)="form.identity = 'early riser'">early riser</button>
              <button type="button" class="example-chip" (click)="form.identity = 'organized person'">organized person</button>
            </div>

            <div class="actions">
              <app-button type="submit" variant="primary" [disabled]="!form.identity">
                Continue
              </app-button>
            </div>
          </div>
        </form>

        <!-- Step 2: Action + Trigger -->
        <form *ngIf="currentStep() === 2" (ngSubmit)="nextStep()">
          <div class="step-content">
            <h1>What's one small action?</h1>
            <p class="subtitle">Start tiny. You can always do more.</p>

            <div class="form-group">
              <label>After I...</label>
              <input 
                type="text" 
                [(ngModel)]="form.when" 
                name="when"
                list="whenList"
                placeholder="wake up"
                required>
              <datalist id="whenList">
                <option *ngFor="let trigger of uniqueTriggers()" [value]="trigger">
              </datalist>
            </div>

            <div class="form-group">
              <label>I will...</label>
              <input 
                type="text" 
                [(ngModel)]="form.name" 
                name="name"
                placeholder="do 2 pushups"
                required>
            </div>

            <div class="form-group">
              <label>In/At...</label>
              <input 
                type="text" 
                [(ngModel)]="form.where" 
                name="where"
                placeholder="my bedroom"
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
              <label>2-Minute Version</label>
              <input 
                type="text" 
                [(ngModel)]="form.twoMinuteRule" 
                name="twoMinuteRule"
                placeholder="Just get on the floor"
                required>
              <p class="hint">The smallest version to get started</p>
            </div>

            <div class="trigger-preview" *ngIf="form.when && form.name && form.where">
              <p class="preview-label">Your trigger:</p>
              <p class="preview-text">After I <strong>{{form.when}}</strong>, I will <strong>{{form.name}}</strong> in <strong>{{form.where}}</strong></p>
            </div>

            <div class="actions">
              <app-button type="submit" variant="primary" 
                [disabled]="!form.when || !form.name || !form.where || !form.time || !form.twoMinuteRule">
                Continue
              </app-button>
            </div>
          </div>
        </form>

        <!-- Step 3: Cue + Reward -->
        <form *ngIf="currentStep() === 3" (ngSubmit)="nextStep()">
          <div class="step-content">
            <h1>Make it obvious & satisfying</h1>
            <p class="subtitle">Design your environment and celebrate the feeling</p>

            <div class="form-group">
              <label>What will remind you?</label>
              <input 
                type="text" 
                [(ngModel)]="form.cue" 
                name="cue"
                placeholder="Workout mat by the bed"
                required>
              <p class="hint">A visual cue in your environment</p>
            </div>

            <div class="form-group">
              <label>How will you feel after?</label>
              <input 
                type="text" 
                [(ngModel)]="form.reward" 
                name="reward"
                placeholder="Energized and proud"
                required>
              <p class="hint">The immediate emotional reward</p>
            </div>

            <div class="actions">
              <app-button type="submit" variant="primary" 
                [disabled]="!form.cue || !form.reward">
                Continue
              </app-button>
            </div>
          </div>
        </form>

        <!-- Step 4: Frequency + Color -->
        <form *ngIf="currentStep() === 4" (ngSubmit)="onSubmit()">
          <div class="step-content">
            <h1>Final touches</h1>
            <p class="subtitle">When and how often?</p>

            <div class="form-group">
              <label>Frequency</label>
              <select [(ngModel)]="form.frequency" name="frequency">
                <option value="daily">Every day</option>
                <option value="custom">Custom days</option>
              </select>
            </div>

            <div class="form-group" *ngIf="form.frequency === 'custom'">
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

            <div class="habit-preview">
              <div class="preview-card" [style.border-left-color]="form.color">
                <p class="preview-identity">{{ form.identity }}</p>
                <h3 class="preview-name">{{ form.name }}</h3>
                <p class="preview-trigger">After {{ form.when }} • {{ form.where }}</p>
              </div>
            </div>

            <div class="actions">
              <app-button type="submit" variant="primary">
                {{ editMode() ? 'Update Habit' : 'Create Habit' }}
              </app-button>
            </div>
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
      background: #f2f2f7;
      min-height: 100vh;
    }

    header {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .back-btn {
      position: absolute;
      left: 0;
      background: none;
      border: none;
      font-size: 17px;
      color: #007aff;
      cursor: pointer;
      padding: 8px;
      -webkit-tap-highlight-color: transparent;
    }

    .progress-dots {
      display: flex;
      gap: 8px;
    }

    .progress-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d1d1d6;
      transition: all 0.3s;
    }

    .progress-dots span.active {
      background: #007aff;
    }

    .progress-dots span.current {
      width: 24px;
      border-radius: 4px;
    }

    .step-content {
      text-align: center;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1d1d1f;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 17px;
      color: #86868b;
      margin: 0 0 32px 0;
      font-weight: 400;
    }

    .examples {
      margin: 24px 0;
      text-align: left;
    }

    .examples-label {
      font-size: 15px;
      color: #86868b;
      margin: 0 0 12px 0;
    }

    .example-chip {
      display: inline-block;
      padding: 8px 16px;
      margin: 4px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      font-size: 15px;
      color: #1d1d1f;
      cursor: pointer;
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    .example-chip:hover {
      background: #f2f2f7;
      border-color: #007aff;
    }

    .trigger-preview,
    .habit-preview {
      margin: 24px 0;
      padding: 20px;
      background: #f2f2f7;
      border-radius: 12px;
      text-align: left;
    }

    .preview-label {
      font-size: 13px;
      color: #86868b;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .preview-text {
      font-size: 17px;
      color: #1d1d1f;
      margin: 0;
      line-height: 1.5;
    }

    .preview-card {
      background: white;
      padding: 16px;
      border-radius: 12px;
      border-left: 4px solid;
      text-align: left;
    }

    .preview-identity {
      font-size: 13px;
      color: #86868b;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .preview-name {
      font-size: 20px;
      font-weight: 600;
      color: #1d1d1f;
      margin: 0 0 8px 0;
    }

    .preview-trigger {
      font-size: 15px;
      color: #86868b;
      margin: 0;
    }

    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }

    label {
      display: block;
      font-size: 17px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 8px;
    }

    input[type="text"],
    input[type="time"],
    select {
      width: 100%;
      padding: 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 17px;
      background: white;
      transition: border-color 0.2s;
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: #007aff;
    }

    .days-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .day-checkbox {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      height: 44px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 8px;
      background: #f2f2f7;
      color: #1d1d1f;
      transition: all 0.2s;
      -webkit-tap-highlight-color: transparent;
    }

    .day-checkbox input {
      display: none;
    }

    .day-checkbox:has(input:checked) {
      background: #007aff;
      color: white;
    }

    .color-picker {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .color-option {
      width: 44px;
      height: 44px;
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
      border-color: #1d1d1f;
      transform: scale(1.1);
    }

    .actions {
      margin-top: 32px;
      text-align: center;
    }

    .hint {
      font-size: 15px;
      color: #86868b;
      margin: 8px 0 0 0;
      font-weight: 400;
    }

    @media (min-width: 768px) {
      .creation-flow {
        padding: 24px;
      }
    }
  `]
})
export class HabitCreationComponent implements OnInit {
  currentStep = signal(1);
  editMode = signal(false);
  habitId = signal<string | null>(null);
  
  form = {
    name: '',
    identity: '',
    reward: '',
    when: '',
    time: '',
    where: '',
    cue: '',
    twoMinuteRule: '',
    frequency: 'daily',
    color: '#6366f1',
    difficulty: 'tiny',
    contractCommitment: '',
    accountabilityPartner: '',
    milestoneUnit: ''
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
  ) {
    effect(() => {
      if (this.currentStep() === 1 && !this.form.color) {
        this.form.color = this.colors[Math.floor(Math.random() * this.colors.length)];
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      const habit = this.habitService.getHabitById(id);
      if (habit) {
        this.editMode.set(true);
        this.habitId.set(id);
        this.currentStep.set(4);
        this.loadHabitData(habit);
      }
    }
  }

  loadHabitData(habit: Habit) {
    this.form.name = habit.name;
    this.form.identity = habit.identity;
    this.form.reward = habit.reward;
    this.form.when = habit.trigger.when;
    this.form.time = habit.time;
    this.form.where = habit.trigger.where;
    this.form.cue = habit.cue;
    this.form.twoMinuteRule = habit.twoMinuteRule || '';
    this.form.color = habit.color;
    this.form.difficulty = habit.difficulty || 'tiny';
    
    if (habit.milestone) {
      this.form.milestoneUnit = habit.milestone.unit;
    }
    
    if (Array.isArray(habit.frequency)) {
      this.form.frequency = 'custom';
      this.selectedDays.set(habit.frequency);
    } else {
      this.form.frequency = 'daily';
    }
  }

  nextStep() {
    this.currentStep.update(s => s + 1);
  }

  goBack() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    } else {
      this.router.navigate(['/']);
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
    const today = new Date().toISOString().split('T')[0];
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
      reward: this.form.reward,
      twoMinuteRule: this.form.twoMinuteRule || undefined,
      frequency: this.form.frequency === 'daily' ? 'daily' : this.selectedDays(),
      color: this.form.color,
      createdAt: this.editMode() ? this.habitService.getHabitById(this.habitId()!)!.createdAt : new Date(),
      startDate: this.editMode() ? this.habitService.getHabitById(this.habitId()!)!.startDate : today,
      difficulty: this.form.difficulty as 'tiny' | 'easy' | 'moderate',
      milestone: this.form.milestoneUnit ? {
        target: 1000,
        unit: this.form.milestoneUnit,
        period: 'year'
      } : undefined
    };

    if (this.editMode()) {
      this.habitService.updateHabit(habit);
    } else {
      this.habitService.addHabit(habit);
    }
    
    this.router.navigate(['/']);
  }
}
