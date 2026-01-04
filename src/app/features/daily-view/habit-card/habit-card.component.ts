import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Habit, HabitState } from '../../../core/models/habit.model';
import { CardComponent } from '../../../shared/ui/card.component';
import { ButtonComponent } from '../../../shared/ui/button.component';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color">
      
      <!-- Header Section -->
      <div class="card-header">
        <div class="identity-badge">
          <span class="identity-text">{{ habit.identity }}</span>
        </div>
      </div>

      <!-- Habit Name -->
      <h2 class="habit-name">{{ habit.name }}</h2>
      
      <!-- Trigger -->
      <p class="trigger-text">{{ habit.trigger.when }} · {{ habit.trigger.where }}</p>

      <!-- Cue Hint -->
      <div class="cue-hint" *ngIf="habit.cue">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        {{ habit.cue }}
      </div>

      <!-- Primary Action -->
      <button class="primary-action" *ngIf="state === 'pending'" (click)="onComplete()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        I showed up today
      </button>

      <div class="completed-state" *ngIf="state === 'done'">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <div>
          <div class="completed-text">{{ habit.reward }}</div>
          <div class="completed-sub">You are {{ habit.identity }}</div>
        </div>
      </div>

      <div class="neutral-state" *ngIf="state === 'missed'">
        <span>Not today</span>
      </div>

      <!-- Weekly Progress -->
      <div class="weekly-progress">
        <div class="progress-header">
          <span class="progress-label">This week</span>
          <span class="progress-count">{{ weeklyConsistency.completed }}/7</span>
        </div>
        <div class="progress-dots">
          <div *ngFor="let day of last7Days()" 
               class="dot" 
               [class.filled]="day.completed"
               [class.today]="day.isToday"
               [style.background]="day.completed ? habit.color : 'transparent'">
          </div>
        </div>
      </div>

      <!-- Week Visual -->
      <div class="week-visual" *ngIf="showAdvanced()">
        <div class="week-header">
          <span>Last 7 Days</span>
          <span class="week-score" [class.perfect]="isPerfectWeek()">{{ isPerfectWeek() ? '🔥 Perfect!' : '' }}</span>
        </div>
        <div class="week-dots">
          <div *ngFor="let day of last7Days()" class="day-item">
            <div class="day-label">{{ day.date.charAt(0) }}</div>
            <div 
              class="day-circle"
              [class.completed]="day.completed"
              [class.today]="day.isToday"
              [style.background]="day.completed ? habit.color : 'transparent'">
              <svg *ngIf="day.completed" width="12" height="12" viewBox="0 0 24 24" fill="white">
                <polyline points="20 6 9 17 4 12" stroke="white" stroke-width="3" fill="none"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Expandable Details -->
      <button class="expand-toggle" (click)="showAdvanced.set(!showAdvanced())" type="button" *ngIf="getTotalVotes() > 0">
        <span>{{ showAdvanced() ? 'Less' : 'More' }}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.rotated]="showAdvanced()">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <!-- Advanced Details -->
      <div class="advanced-panel" *ngIf="showAdvanced()">
        
        <!-- Milestone Progress -->
        <div class="milestone-section" *ngIf="habit.milestone">
          <div class="section-header">
            <span>🎯 Milestone Progress</span>
            <button class="icon-btn" (click)="showMilestoneInput.set(!showMilestoneInput())" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <div class="milestone-info">{{ getMilestoneProgress(habit.id, habit.milestone) }}</div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="getMilestonePercentage(habit.id, habit.milestone)"></div>
          </div>
          <div class="milestone-input" *ngIf="showMilestoneInput()">
            <input type="number" [(ngModel)]="milestoneCount" placeholder="Count" min="1">
            <button class="btn-save" (click)="saveMilestone()" type="button">Add</button>
          </div>
        </div>

        <!-- Goldilocks Zone -->
        <div class="zone-section" *ngIf="getConsistencyRate() > 0">
          <div class="zone-status" [class.optimal]="isInGoldilocksZone()">
            <span class="zone-icon">{{ isInGoldilocksZone() ? '⚡' : '💡' }}</span>
            <span>{{ isInGoldilocksZone() ? 'Optimal Challenge Level' : 'Adjust Difficulty' }}</span>
          </div>
        </div>

        <!-- Contract -->
        <div class="contract-section" *ngIf="habit.contract">
          <div class="section-header">📜 Commitment</div>
          <div class="contract-text">{{ habit.contract.commitment }}</div>
          <div class="contract-partner" *ngIf="habit.contract.accountabilityPartner">
            👥 {{ habit.contract.accountabilityPartner }}
          </div>
        </div>

        <!-- Reflection -->
        <div class="reflection-section">
          <button class="section-toggle" (click)="showReflection.set(!showReflection())" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {{ showReflection() ? 'Hide Reflection' : 'Add Reflection' }}
          </button>
          <textarea 
            *ngIf="showReflection()"
            [(ngModel)]="note"
            (blur)="onNoteChange()"
            placeholder="How did it feel? What did you learn?"
            rows="3"></textarea>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .habit-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border-left: 4px solid var(--habit-color);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .habit-card:active {
      transform: scale(0.98);
    }

    .card-header {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f3f4f6;
    }

    .identity-badge {
      display: inline-block;
      padding: 6px 14px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
      border-radius: 20px;
    }

    .identity-text {
      font-size: 12px;
      font-weight: 600;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .habit-name {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }

    .trigger-text {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 16px 0;
    }

    .cue-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #fef3c7;
      border-radius: 12px;
      font-size: 13px;
      color: #92400e;
      margin-bottom: 20px;
    }

    .cue-hint svg {
      flex-shrink: 0;
    }

    .primary-action {
      width: 100%;
      padding: 16px;
      background: var(--habit-color);
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 20px;
    }

    .primary-action:active {
      transform: translateY(1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .completed-state {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      border-radius: 14px;
      margin-bottom: 20px;
    }

    .completed-state svg {
      color: #059669;
      flex-shrink: 0;
    }

    .completed-text {
      font-size: 15px;
      font-weight: 600;
      color: #065f46;
      margin-bottom: 2px;
    }

    .completed-sub {
      font-size: 13px;
      color: #047857;
    }

    .neutral-state {
      padding: 14px;
      text-align: center;
      background: #f9fafb;
      border-radius: 12px;
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 20px;
    }

    .weekly-progress {
      padding: 16px;
      background: #fafafa;
      border-radius: 14px;
      margin-bottom: 16px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .progress-label {
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
    }

    .progress-count {
      font-size: 16px;
      font-weight: 700;
      color: var(--habit-color);
    }

    .progress-dots {
      display: flex;
      gap: 8px;
      justify-content: space-between;
    }

    .dot {
      flex: 1;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      transition: all 0.3s;
    }

    .dot.filled {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .dot.today {
      height: 10px;
      border: 2px solid #6366f1;
    }

    .expand-toggle {
      width: 100%;
      padding: 12px;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #6b7280;
      cursor: pointer;
    }

    .expand-toggle svg {
      transition: transform 0.3s;
    }

    .expand-toggle svg.rotated {
      transform: rotate(180deg);
    }

    .advanced-panel {
      padding: 16px 0 0 0;
      border-top: 1px solid #f3f4f6;
      margin-top: 12px;
    }

    .week-visual {
      padding: 16px;
      background: #fafafa;
      border-radius: 12px;
      margin-bottom: 12px;
    }

    .week-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }

    .week-score {
      color: #f59e0b;
      font-size: 12px;
    }

    .week-score.perfect {
      color: #10b981;
    }

    .week-dots {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    }

    .day-item {
      text-align: center;
    }

    .day-label {
      font-size: 10px;
      color: #9ca3af;
      font-weight: 600;
      margin-bottom: 6px;
      text-transform: uppercase;
    }

    .day-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid #e5e7eb;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .day-circle.completed {
      border-color: var(--habit-color);
    }

    .day-circle.today {
      border-width: 3px;
      border-color: #6366f1;
    }

    .milestone-section,
    .zone-section,
    .contract-section,
    .reflection-section {
      margin-bottom: 12px;
      padding: 14px;
      background: #fafafa;
      border-radius: 12px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
    }

    .icon-btn {
      width: 26px;
      height: 26px;
      border-radius: 6px;
      border: none;
      background: var(--habit-color);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .milestone-info {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    .progress-bar {
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--habit-color);
      transition: width 0.3s;
    }

    .milestone-input {
      display: flex;
      gap: 8px;
      margin-top: 10px;
    }

    .milestone-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
    }

    .btn-save {
      padding: 8px 16px;
      background: var(--habit-color);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .zone-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: #fef3c7;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #92400e;
    }

    .zone-status.optimal {
      background: #d1fae5;
      color: #065f46;
    }

    .zone-icon {
      font-size: 16px;
    }

    .contract-text {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 6px;
    }

    .contract-partner {
      font-size: 12px;
      color: #991b1b;
      font-weight: 500;
    }

    .section-toggle {
      width: 100%;
      padding: 10px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
    }

    textarea {
      width: 100%;
      margin-top: 10px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
    }

    @media (max-width: 640px) {
      .habit-card {
        padding: 20px;
        border-radius: 16px;
      }

      .habit-name {
        font-size: 20px;
      }

      .primary-action {
        padding: 14px;
        font-size: 15px;
      }
    }
  `]
})
export class HabitCardComponent implements OnInit {
  @Input() habit!: Habit;
  @Input() state: HabitState = 'pending';
  @Input() weeklyConsistency = { completed: 0, total: 7 };
  @Input() existingNote = '';
  @Input() habitService: any;
  
  @Output() complete = new EventEmitter<void>();
  @Output() noteChange = new EventEmitter<string>();
  @Output() milestoneAdd = new EventEmitter<number>();

  showReflection = signal(false);
  showMilestoneInput = signal(false);
  showAdvanced = signal(false);
  note = '';
  milestoneCount = 1;

  ngOnInit() {
    this.note = this.existingNote;
    if (this.existingNote) {
      this.showReflection.set(true);
    }
  }

  onComplete() {
    this.complete.emit();
  }

  onNoteChange() {
    this.noteChange.emit(this.note);
  }

  getMilestoneProgress(habitId: string, milestone: any): string {
    if (!this.habitService) return '';
    const count = this.habitService.allLogs()
      .filter((l: any) => l.habitId === habitId && l.completed && l.milestoneCount)
      .reduce((sum: number, l: any) => sum + (l.milestoneCount || 0), 0);
    return `${count} / ${milestone.target} ${milestone.unit} this ${milestone.period}`;
  }

  getMilestonePercentage(habitId: string, milestone: any): number {
    if (!this.habitService) return 0;
    const count = this.habitService.allLogs()
      .filter((l: any) => l.habitId === habitId && l.completed && l.milestoneCount)
      .reduce((sum: number, l: any) => sum + (l.milestoneCount || 0), 0);
    return Math.min((count / milestone.target) * 100, 100);
  }

  saveMilestone() {
    if (this.milestoneCount > 0) {
      this.milestoneAdd.emit(this.milestoneCount);
      this.milestoneCount = 1;
      this.showMilestoneInput.set(false);
    }
  }

  getStackedHabitName(habitId: string): string {
    if (!this.habitService) return '';
    const habit = this.habitService.allHabits().find((h: any) => h.id === habitId);
    return habit ? habit.name : '';
  }

  getDifficultyLabel(difficulty?: string): string {
    if (difficulty === 'tiny') return '⚡ 2 min';
    if (difficulty === 'easy') return '✨ 5-10 min';
    if (difficulty === 'moderate') return '💪 15+ min';
    return '⚡ 2 min';
  }

  getTotalVotes(): number {
    if (!this.habitService) return 0;
    return this.habitService.allLogs()
      .filter((l: any) => l.habitId === this.habit.id && l.completed)
      .length;
  }

  missedYesterday(): boolean {
    if (!this.habitService) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    return this.habitService.getHabitState(this.habit.id, dateStr) === 'missed';
  }

  last7Days(): Array<{date: string, completed: boolean, isToday: boolean}> {
    if (!this.habitService) return [];
    const days = [];
    const today = new Date().toISOString().split('T')[0];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: this.habitService.getHabitState(this.habit.id, dateStr) === 'done',
        isToday: dateStr === today
      });
    }
    return days;
  }

  getCurrentStreak(): number {
    if (!this.habitService) return 0;
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (this.habitService.getHabitState(this.habit.id, dateStr) === 'done') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  isPerfectWeek(): boolean {
    return this.weeklyConsistency.completed === 7;
  }

  onTinyComplete() {
    this.complete.emit();
  }

  getConsistencyRate(): number {
    if (!this.habitService || this.getTotalVotes() === 0) return 0;
    const daysSinceCreation = Math.max(1, Math.floor(
      (new Date().getTime() - new Date(this.habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ));
    return Math.round((this.getTotalVotes() / daysSinceCreation) * 100);
  }

  isInGoldilocksZone(): boolean {
    const rate = this.getConsistencyRate();
    return rate >= 50 && rate <= 85;
  }
}
