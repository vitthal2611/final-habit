import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../core/services/habit.service';
import { Identity } from '../../core/models/identity.model';
import { CardComponent } from '../../shared/ui/card.component';

@Component({
  selector: 'app-identity-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="identity-view">
      <header>
        <h1>Your Identities</h1>
        <p class="subtitle">You are what you repeatedly do</p>
      </header>

      <div class="identities-list">
        <app-card *ngFor="let identity of identities()">
          <div class="identity-card">
            <h3>{{ identity.name }}</h3>
            
            <div class="stat-row">
              <div class="stat">
                <span class="stat-value">{{ identity.habitCount }}</span>
                <span class="stat-label">habits</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ identity.actionsThisMonth }}</span>
                <span class="stat-label">this month</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ identity.actionsThisYear }}</span>
                <span class="stat-label">this year</span>
              </div>
            </div>

            <p class="identity-message">
              Every action reinforces: "I am {{ identity.name }}"
            </p>
            
            <div class="identity-votes">
              <small>🗳️ {{ identity.actionsThisYear }} votes for this identity</small>
            </div>
          </div>
        </app-card>

        <div *ngIf="identities().length === 0" class="empty-state">
          <p>No identities yet.</p>
          <p class="hint">Create habits to start building your identity.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .identity-view {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      margin-bottom: 32px;
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

    .identities-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .identity-card h3 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 20px 0;
      text-transform: capitalize;
    }

    .stat-row {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #6366f1;
    }

    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .identity-message {
      padding-top: 16px;
      border-top: 1px solid #f3f4f6;
      font-size: 14px;
      color: #6b7280;
      font-style: italic;
      margin: 0;
    }

    .empty-state {
      text-align: center;
      padding: 48px 20px;
      color: #6b7280;
    }

    .empty-state p {
      margin: 8px 0;
    }

    .hint {
      font-size: 14px;
    }

    .identity-votes {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
      text-align: center;
    }

    .identity-votes small {
      font-size: 13px;
      color: #6b7280;
    }
  `]
})
export class IdentityDashboardComponent {
  identities = computed(() => {
    const habits = this.habitService.allHabits();
    const logs = this.habitService.allLogs();
    
    const identityMap = new Map<string, Identity>();
    
    habits.forEach(habit => {
      const identity = habit.identity.toLowerCase();
      
      if (!identityMap.has(identity)) {
        identityMap.set(identity, {
          name: identity,
          habitCount: 0,
          actionsThisMonth: 0,
          actionsThisYear: 0
        });
      }
      
      const identityData = identityMap.get(identity)!;
      identityData.habitCount++;
      
      const habitLogs = logs.filter(l => l.habitId === habit.id && l.completed);
      identityData.actionsThisMonth += habitLogs.length;
      identityData.actionsThisYear += habitLogs.length;
    });
    
    return Array.from(identityMap.values());
  });

  constructor(private habitService: HabitService) {}
}
