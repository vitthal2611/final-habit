import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../core/services/habit.service';
import { CardComponent } from '../../shared/ui/card.component';
import { ButtonComponent } from '../../shared/ui/button.component';

@Component({
  selector: 'app-environment',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="environment-view">
      <header>
        <h1>Environment Design</h1>
        <p class="subtitle">Make good habits obvious, bad habits invisible</p>
      </header>

      <app-card>
        <h3>🎯 Implementation Intentions</h3>
        <p>Your habits with clear triggers:</p>
        <div class="intention-list">
          <div *ngFor="let habit of habits()" class="intention-item">
            <div class="intention-text">
              <strong>I will {{ habit.name }}</strong><br>
              at <span class="highlight">{{ habit.time }}</span><br>
              in <span class="highlight">{{ habit.trigger.where }}</span><br>
              {{ habit.trigger.when }}
            </div>
            <div class="cue-badge">Cue: {{ habit.cue }}</div>
          </div>
        </div>
      </app-card>

      <app-card>
        <h3>✨ Temptation Bundling</h3>
        <p>Pair habits you need with habits you want:</p>
        <div class="bundle-creator">
          <input 
            type="text" 
            [(ngModel)]="needHabit"
            placeholder="Habit I need to do..."
            class="bundle-input">
          <span class="bundle-with">+</span>
          <input 
            type="text" 
            [(ngModel)]="wantHabit"
            placeholder="Habit I want to do..."
            class="bundle-input">
          <app-button (click)="saveBundle()" variant="primary">Save</app-button>
        </div>
        <div class="bundles-list">
          <div *ngFor="let bundle of bundles()" class="bundle-item">
            {{ bundle.need }} + {{ bundle.want }}
          </div>
        </div>
      </app-card>

      <app-card>
        <h3>🚀 Reduce Friction</h3>
        <p>Checklist to make habits easier:</p>
        <div class="friction-list">
          <label class="friction-item">
            <input type="checkbox">
            Prep environment the night before
          </label>
          <label class="friction-item">
            <input type="checkbox">
            Place visual cues in obvious locations
          </label>
          <label class="friction-item">
            <input type="checkbox">
            Remove obstacles from your path
          </label>
          <label class="friction-item">
            <input type="checkbox">
            Make bad habits difficult to access
          </label>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .environment-view {
      max-width: 700px;
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

    app-card {
      display: block;
      margin-bottom: 20px;
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 12px 0;
    }

    p {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 16px 0;
    }

    .intention-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .intention-item {
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 3px solid #6366f1;
    }

    .intention-text {
      font-size: 14px;
      line-height: 1.6;
      color: #374151;
      margin-bottom: 8px;
    }

    .highlight {
      color: #6366f1;
      font-weight: 600;
    }

    .cue-badge {
      display: inline-block;
      font-size: 12px;
      padding: 4px 8px;
      background: #eef2ff;
      color: #4f46e5;
      border-radius: 4px;
    }

    .bundle-creator {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .bundle-input {
      flex: 1;
      min-width: 150px;
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
    }

    .bundle-with {
      font-size: 18px;
      font-weight: 600;
      color: #6b7280;
    }

    .bundles-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bundle-item {
      padding: 10px;
      background: #fef3c7;
      border-radius: 6px;
      font-size: 14px;
      color: #92400e;
    }

    .friction-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .friction-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #374151;
      cursor: pointer;
    }

    .friction-item input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  `]
})
export class EnvironmentComponent {
  habits = () => this.habitService.allHabits();
  needHabit = '';
  wantHabit = '';
  bundles = signal<Array<{need: string, want: string}>>([]);

  constructor(private habitService: HabitService) {}

  saveBundle() {
    if (this.needHabit && this.wantHabit) {
      this.bundles.set([...this.bundles(), { need: this.needHabit, want: this.wantHabit }]);
      this.needHabit = '';
      this.wantHabit = '';
    }
  }
}
