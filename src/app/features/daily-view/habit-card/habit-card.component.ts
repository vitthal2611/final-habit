import { Component, Input, Output, EventEmitter, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Habit, HabitState } from '../../../core/models/habit.model';
import { CardComponent } from '../../../shared/ui/card.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { ConfirmModalComponent } from '../../../shared/ui/confirm-modal.component';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, ConfirmModalComponent],
  template: `
    <div class="habit-card" [style.--habit-color]="habit.color" [class.completed]="state === 'done'">
      
      <!-- Header -->
      <div class="card-header">
        <span class="identity-badge">{{ habit.identity }}</span>
        <button class="menu-btn" (click)="showMenu.set(!showMenu())" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
        <div class="menu-dropdown" *ngIf="showMenu()">
          <button (click)="onEdit(); showMenu.set(false)" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button (click)="onDelete(); showMenu.set(false)" type="button" class="delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      </div>

      <!-- Habit Name -->
      <h2 class="habit-name">{{ habit.name }}</h2>
      
      <!-- Context Line -->
      <p class="context-line">
        <span>{{ habit.trigger.when }} · {{ habit.trigger.where }}</span>
        <span *ngIf="habit.cue" class="cue">💡 {{ habit.cue }}</span>
      </p>

      <!-- Action Button -->
      <button class="primary-action" *ngIf="state === 'pending'" (click)="handleAction()" type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>I showed up today</span>
        <input *ngIf="habit.milestone && !progressLogged()" 
               type="number" 
               [(ngModel)]="todayProgress" 
               (click)="$event.stopPropagation()"
               placeholder="0" 
               min="0" 
               class="inline-progress">
        <span *ngIf="habit.milestone && !progressLogged()" class="unit">{{ habit.milestone.unit }}</span>
      </button>

      <div class="completed-state" *ngIf="state === 'done'">
        <div class="celebration">
          <div class="confetti">✨</div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="check-icon">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <div class="confetti">🎉</div>
        </div>
        <div class="identity-statement">
          <div class="statement">
            <div class="line-1">I am</div>
            <div class="line-2">{{ habit.identity }}</div>
            <div class="line-1">I will</div>
            <div class="line-2">{{ habit.reward }}</div>
          </div>
        </div>
        <div class="progress" *ngIf="getTodayProgress() > 0 && habit.milestone">
          <span class="badge">+{{ getTodayProgress() }} {{ habit.milestone.unit }}</span>
        </div>
      </div>

      <div class="neutral-state" *ngIf="state === 'missed'">Not today</div>

      <!-- Weekly Progress -->
      <div class="weekly-progress">
        <span class="label">{{ weeklyConsistency.completed }}/7 this week</span>
        <div class="dots">
          <div *ngFor="let day of last7Days()" 
               class="dot" 
               [class.filled]="day.completed"
               [class.today]="day.isToday"
               [style.background]="day.completed ? habit.color : 'transparent'"
               [title]="day.date">
          </div>
        </div>
      </div>

      <!-- Details Toggle -->
      <button class="details-toggle" (click)="showAdvanced.set(!showAdvanced())" type="button">
        <span>{{ showAdvanced() ? 'Less details' : 'More details' }}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.rotated]="showAdvanced()">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <!-- Details Panel -->
      <div class="details-panel" *ngIf="showAdvanced()">
        
        <!-- Milestone -->
        <div class="detail-item" *ngIf="habit.milestone">
          <div class="detail-row">
            <span class="icon">🎯</span>
            <div class="detail-content">
              <span class="detail-label">{{ getMilestoneProgress(habit.id, habit.milestone) }}</span>
              <div class="progress-bar">
                <div class="fill" [style.width.%]="getMilestonePercentage(habit.id, habit.milestone)" [style.background]="habit.color"></div>
              </div>
            </div>
            <button class="add-btn" (click)="showMilestoneInput.set(!showMilestoneInput())" type="button">+</button>
          </div>
          <div class="input-row" *ngIf="showMilestoneInput()">
            <input type="number" [(ngModel)]="milestoneCount" placeholder="0" min="1">
            <button (click)="saveMilestone()" type="button">Add</button>
          </div>
        </div>

        <!-- Zone Status -->
        <div class="detail-item" *ngIf="getConsistencyRate() > 0">
          <span class="icon">{{ isInGoldilocksZone() ? '⚡' : '💡' }}</span>
          <span class="detail-label">{{ isInGoldilocksZone() ? 'Optimal challenge level' : 'Adjust difficulty' }}</span>
        </div>

        <!-- Contract -->
        <div class="detail-item" *ngIf="habit.contract">
          <span class="icon">📜</span>
          <div class="detail-content">
            <span class="detail-label">{{ habit.contract.commitment }}</span>
            <span class="detail-sub" *ngIf="habit.contract.accountabilityPartner">👥 {{ habit.contract.accountabilityPartner }}</span>
          </div>
        </div>

        <!-- Reflection -->
        <div class="detail-item reflection">
          <button class="reflection-toggle" (click)="showReflection.set(!showReflection())" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {{ showReflection() ? 'Hide note' : 'Add note' }}
          </button>
          <textarea 
            *ngIf="showReflection()"
            [(ngModel)]="note"
            (blur)="onNoteChange()"
            placeholder="How did it feel?"
            rows="3"></textarea>
        </div>
      </div>

      <app-confirm-modal
        [show]="showDeleteModal"
        title="Delete Habit"
        message="Delete habit? This cannot be undone."
        (confirm)="confirmDelete()"
        (cancel)="showDeleteModal = false" />

    </div>
  `,
  styles: [`
    .habit-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border-left: 4px solid var(--habit-color);
      transition: all 0.2s;
      position: relative;
    }

    .habit-card.completed {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left-color: #10b981;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .identity-badge {
      font-size: 11px;
      font-weight: 600;
      color: #6366f1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      background: #f5f3ff;
      border-radius: 12px;
    }

    .menu-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: #9ca3af;
      cursor: pointer;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .menu-btn:active {
      background: #f3f4f6;
    }

    .menu-dropdown {
      position: absolute;
      top: 40px;
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10;
      min-width: 140px;
      overflow: hidden;
    }

    .menu-dropdown button {
      width: 100%;
      padding: 12px 16px;
      border: none;
      background: white;
      text-align: left;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #374151;
    }

    .menu-dropdown button:active {
      background: #f9fafb;
    }

    .menu-dropdown button.delete {
      color: #ef4444;
    }

    .habit-name {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
      line-height: 1.3;
    }

    .context-line {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 16px 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .context-line .cue {
      font-size: 12px;
      color: #92400e;
    }

    .primary-action {
      width: 100%;
      padding: 16px;
      background: var(--habit-color);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      margin-bottom: 16px;
      min-height: 52px;
    }

    .primary-action:active {
      transform: scale(0.98);
    }

    .primary-action .inline-progress {
      width: 60px;
      padding: 6px 10px;
      border: 2px solid white;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 16px;
      font-weight: 700;
      text-align: center;
    }

    .primary-action .unit {
      font-size: 13px;
      opacity: 0.9;
    }

    .completed-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: white;
      border-radius: 16px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .celebration {
      display: flex;
      align-items: center;
      gap: 12px;
      animation: celebrate 0.6s ease-out;
    }

    @keyframes celebrate {
      0% { transform: scale(0.8); opacity: 0; }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }

    .confetti {
      font-size: 24px;
      animation: bounce 1s ease-in-out infinite;
    }

    .confetti:first-child {
      animation-delay: 0.1s;
    }

    .confetti:last-child {
      animation-delay: 0.2s;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .check-icon {
      color: #10b981;
      filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3));
    }

    .identity-statement {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      width: 100%;
    }

    .statement {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .statement .line-1 {
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .statement .line-2 {
      font-size: 18px;
      font-weight: 700;
      color: #065f46;
      line-height: 1.3;
      margin-bottom: 12px;
    }

    .statement .line-2:last-child {
      color: #047857;
      font-style: italic;
      margin-bottom: 0;
    }

    .completed-state .progress {
      display: flex;
      justify-content: center;
    }

    .completed-state .badge {
      padding: 8px 16px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    .neutral-state {
      padding: 14px;
      text-align: center;
      background: #f9fafb;
      border-radius: 12px;
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 16px;
    }

    .weekly-progress {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    .weekly-progress .label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      white-space: nowrap;
    }

    .weekly-progress .dots {
      display: flex;
      gap: 6px;
      flex: 1;
    }

    .dot {
      flex: 1;
      height: 12px;
      background: #e5e7eb;
      border-radius: 6px;
      transition: all 0.3s;
      min-width: 12px;
    }

    .dot.filled {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .dot.today {
      border: 2px solid #6366f1;
      height: 14px;
    }

    .details-toggle {
      width: 100%;
      padding: 10px;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
      cursor: pointer;
      min-height: 44px;
    }

    .details-toggle svg {
      transition: transform 0.3s;
    }

    .details-toggle svg.rotated {
      transform: rotate(180deg);
    }

    .details-panel {
      padding: 12px 0 0 0;
      border-top: 1px solid #f3f4f6;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: #fafafa;
      border-radius: 10px;
      font-size: 13px;
    }

    .detail-item .icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }

    .detail-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .detail-label {
      font-size: 13px;
      color: #374151;
      font-weight: 500;
    }

    .detail-sub {
      font-size: 11px;
      color: #6b7280;
    }

    .add-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: var(--habit-color);
      color: white;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      flex-shrink: 0;
    }

    .input-row {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      padding-left: 28px;
    }

    .input-row input {
      flex: 1;
      padding: 10px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
    }

    .input-row button {
      padding: 10px 16px;
      background: var(--habit-color);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .progress-bar {
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar .fill {
      height: 100%;
      transition: width 0.3s;
    }

    .detail-item.reflection {
      flex-direction: column;
      align-items: stretch;
    }

    .reflection-toggle {
      width: 100%;
      padding: 10px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      min-height: 44px;
    }

    .detail-item.reflection textarea {
      width: 100%;
      margin-top: 8px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
    }

    @media (min-width: 768px) {
      .habit-card {
        padding: 24px;
        border-radius: 20px;
      }

      .habit-name {
        font-size: 22px;
      }

      .context-line {
        font-size: 14px;
      }

      .primary-action {
        padding: 18px;
        font-size: 17px;
      }

      .weekly-progress .label {
        font-size: 13px;
      }

      .dot {
        height: 14px;
      }

      .dot.today {
        height: 16px;
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
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  showReflection = signal(false);
  showMilestoneInput = signal(false);
  showAdvanced = signal(false);
  showProgressInput = signal(false);
  progressLogged = signal(false);
  showMenu = signal(false);
  showDeleteModal = false;
  note = '';
  milestoneCount = 1;
  todayProgress = 0;

  // Cache logs for performance
  private logsCache = computed(() => this.habitService?.allLogs() || []);
  private habitLogs = computed(() => 
    this.logsCache().filter((l: any) => l.habitId === this.habit.id)
  );

  ngOnInit() {
    this.note = this.existingNote;
    if (this.existingNote) {
      this.showReflection.set(true);
    }
    if (this.getTodayProgress() > 0) {
      this.progressLogged.set(true);
    }
  }

  handleAction() {
    if (this.habit.milestone && !this.progressLogged() && this.todayProgress > 0) {
      this.logProgress();
    }
    this.complete.emit();
  }

  logProgress() {
    if (this.todayProgress > 0) {
      const dateStr = new Date().toISOString().split('T')[0];
      const log = this.habitService.allLogs()
        .find((l: any) => l.habitId === this.habit.id && l.date === dateStr);
      
      this.habitService.logHabit(
        this.habit.id,
        dateStr,
        false,
        log?.note,
        this.todayProgress
      );
      this.progressLogged.set(true);
    }
  }

  getTodayProgress(): number {
    if (!this.habitService) return 0;
    const today = new Date().toISOString().split('T')[0];
    const log = this.habitService.allLogs()
      .find((l: any) => l.habitId === this.habit.id && l.date === today);
    return log?.milestoneCount || 0;
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
    return this.habitLogs().filter((l: any) => l.completed).length;
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

  onEdit() {
    this.edit.emit(this.habit.id);
  }

  onDelete() {
    this.showDeleteModal = true;
  }

  confirmDelete() {
    this.showDeleteModal = false;
    this.delete.emit(this.habit.id);
  }
}
