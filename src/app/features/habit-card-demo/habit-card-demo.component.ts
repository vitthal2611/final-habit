import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitCardDesign1Component } from '../daily-view/habit-card/habit-card-design1.component';
import { HabitCardDesign2Component } from '../daily-view/habit-card/habit-card-design2.component';
import { HabitCardDesign3Component } from '../daily-view/habit-card/habit-card-design3.component';
import { HabitCardNeonGlowComponent } from '../daily-view/habit-card/habit-card-neon-glow.component';
import { HabitCardNeumorphismComponent } from '../daily-view/habit-card/habit-card-neumorphism.component';
import { HabitCardBrutalistComponent } from '../daily-view/habit-card/habit-card-brutalist.component';
import { HabitCardMinimalistComponent } from '../daily-view/habit-card/habit-card-minimalist.component';
import { HabitCardRetroGamingComponent } from '../daily-view/habit-card/habit-card-retro-gaming.component';
import { HabitCardNatureOrganicComponent } from '../daily-view/habit-card/habit-card-nature-organic.component';
import { Habit } from '../../core/models/habit.model';

@Component({
  selector: 'app-habit-card-demo',
  standalone: true,
  imports: [
    CommonModule,
    HabitCardDesign1Component,
    HabitCardDesign2Component,
    HabitCardDesign3Component,
    HabitCardNeonGlowComponent,
    HabitCardNeumorphismComponent,
    HabitCardBrutalistComponent,
    HabitCardMinimalistComponent,
    HabitCardRetroGamingComponent,
    HabitCardNatureOrganicComponent
  ],
  template: `
    <div class="demo-container">
      <div class="demo-header">
        <h1>Habit Card Designs</h1>
        <p>Choose your preferred design style</p>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-nav">
        <button 
          *ngFor="let tab of tabs; let i = index"
          class="tab-button"
          [class.active]="activeTab() === i"
          (click)="activeTab.set(i)">
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Design 1: Glass Morphism -->
        <div class="tab-panel" [class.active]="activeTab() === 0">
          <div class="design-info">
            <h3>Glass Morphism Design</h3>
            <p>Modern translucent design with blur effects and subtle animations</p>
          </div>
          <div class="card-showcase">
            <app-habit-card-design1
              [habit]="sampleHabit"
              [state]="pendingState"
              [weeklyConsistency]="weeklyConsistency1"
              [metrics]="{ streak: 12, totalDays: 45, consistency: 78 }"
              (complete)="onComplete()">
            </app-habit-card-design1>
            
            <app-habit-card-design1
              [habit]="completedHabit"
              [state]="doneState"
              [weeklyConsistency]="weeklyConsistency2"
              [metrics]="{ streak: 8, totalDays: 32, consistency: 85 }"
              (complete)="onComplete()">
            </app-habit-card-design1>
          </div>
        </div>

        <!-- Design 2: Bold Gradient -->
        <div class="tab-panel" [class.active]="activeTab() === 1">
          <div class="design-info">
            <h3>Bold Gradient Design</h3>
            <p>Vibrant gradient header with interactive elements and decorative touches</p>
          </div>
          <div class="card-showcase">
            <app-habit-card-design2
              [habit]="sampleHabit"
              [state]="pendingState"
              [weeklyConsistency]="weeklyConsistency1"
              [metrics]="{ streak: 12, totalDays: 45, consistency: 78 }"
              (complete)="onComplete()">
            </app-habit-card-design2>
            
            <app-habit-card-design2
              [habit]="completedHabit"
              [state]="doneState"
              [weeklyConsistency]="weeklyConsistency2"
              [metrics]="{ streak: 8, totalDays: 32, consistency: 85 }"
              (complete)="onComplete()">
            </app-habit-card-design2>
          </div>
        </div>

        <!-- Design 3: iOS Clean -->
        <div class="tab-panel" [class.active]="activeTab() === 2">
          <div class="design-info">
            <h3>iOS-Inspired Clean Design</h3>
            <p>Clean, minimal design with smart iconography and grid-based progress</p>
          </div>
          <div class="card-showcase">
            <app-habit-card-design3
              [habit]="sampleHabit"
              [currentDate]="currentDate"
              [state]="pendingState"
              [weeklyConsistency]="weeklyConsistency1"
              [metrics]="metrics1"
              (complete)="onComplete()">
            </app-habit-card-design3>
            
            <app-habit-card-design3
              [habit]="completedHabit"
              [currentDate]="currentDate"
              [state]="doneState"
              [weeklyConsistency]="weeklyConsistency2"
              [metrics]="metrics2"
              (complete)="onComplete()">
            </app-habit-card-design3>
          </div>
        </div>

        <!-- Design 4: Neon Glow -->
        <div class="tab-panel" [class.active]="activeTab() === 3">
          <div class="design-info">
            <h3>Neon Glow Design</h3>
            <p>Futuristic cyberpunk style with glowing neon effects and dark theme</p>
          </div>
          <div class="card-showcase">
            <app-habit-card-neon-glow
              [habit]="sampleHabit"
              [state]="pendingState"
              [weeklyConsistency]="weeklyConsistency1"
              [metrics]="{ streak: 12, totalDays: 45, consistency: 78 }"
              (complete)="onComplete()">
            </app-habit-card-neon-glow>
            
            <app-habit-card-neon-glow
              [habit]="completedHabit"
              [state]="doneState"
              [weeklyConsistency]="weeklyConsistency2"
              [metrics]="{ streak: 8, totalDays: 32, consistency: 85 }"
              (complete)="onComplete()">
            </app-habit-card-neon-glow>
          </div>
        </div>

        <!-- Design 5: Neumorphism -->
        <div class="tab-panel" [class.active]="activeTab() === 4">
          <div class="design-info">
            <h3>Neumorphism Design</h3>
            <p>Soft, tactile 3D design with subtle shadows and highlights</p>
          </div>
          <div class="card-showcase">
            <app-habit-card-neumorphism
              [habit]="sampleHabit"
              [state]="pendingState"
              [weeklyConsistency]="weeklyConsistency1"
              [metrics]="{ streak: 12, totalDays: 45, consistency: 78 }"
              (complete)="onComplete()">
            </app-habit-card-neumorphism>
            
            <app-habit-card-neumorphism
              [habit]="completedHabit"
              [state]="doneState"
              [weeklyConsistency]="weeklyConsistency2"
              [metrics]="{ streak: 8, totalDays: 32, consistency: 85 }"
              (complete)="onComplete()">
            </app-habit-card-neumorphism>
          </div>
        </div>

        <!-- Design 6: Brutalist -->
        <div class="tab-panel" [class.active]="activeTab() === 5">
          <div class="design-info">
            <h3>Brutalist Design</h3>
            <p>Bold, raw geometric style with strong typography and sharp edges</p>
          </div>
          <div class="card-showcase">
            <app-habit-card-brutalist
              [habit]="sampleHabit"
              [state]="pendingState"
              [weeklyConsistency]="weeklyConsistency1"
              [metrics]="{ streak: 12, totalDays: 45, consistency: 78 }"
              (complete)="onComplete()">
            </app-habit-card-brutalist>
            
            <app-habit-card-brutalist
              [habit]="completedHabit"
              [state]="doneState"
              [weeklyConsistency]="weeklyConsistency2"
              [metrics]="{ streak: 8, totalDays: 32, consistency: 85 }"
              (complete)="onComplete()">
            </app-habit-card-brutalist>
          </div>
        </div>

        <!-- Design 7: Minimalist -->
        <div class="tab-panel" [class.active]="activeTab() === 6">
          <div class="design-info">
            <h3>Minimalist Design</h3>
            <p>Ultra-clean typography-focused design with maximum white space</p>
          </div>
          <div class="card-showcase">
            <app-habit-card-minimalist
              [habit]="sampleHabit"
              [state]="pendingState"
              [weeklyConsistency]="weeklyConsistency1"
              [metrics]="{ streak: 12, totalDays: 45, consistency: 78 }"
              (complete)="onComplete()">
            </app-habit-card-minimalist>
            
            <app-habit-card-minimalist
              [habit]="completedHabit"
              [state]="doneState"
              [weeklyConsistency]="weeklyConsistency2"
              [metrics]="{ streak: 8, totalDays: 32, consistency: 85 }"
              (complete)="onComplete()">
            </app-habit-card-minimalist>
          </div>
        </div>

        <!-- Design 8: Retro Gaming -->
        <div class="tab-panel" [class.active]="activeTab() === 7">
          <div class="design-info">
            <h3>Retro Gaming Design</h3>
            <p>8-bit pixel art style with gaming terminology and retro aesthetics</p>
          </div>
          <div class="card-showcase">
            <app-habit-card-retro-gaming
              [habit]="sampleHabit"
              [state]="pendingState"
              [weeklyConsistency]="weeklyConsistency1"
              [metrics]="{ streak: 12, totalDays: 45, consistency: 78 }"
              (complete)="onComplete()">
            </app-habit-card-retro-gaming>
            
            <app-habit-card-retro-gaming
              [habit]="completedHabit"
              [state]="doneState"
              [weeklyConsistency]="weeklyConsistency2"
              [metrics]="{ streak: 8, totalDays: 32, consistency: 85 }"
              (complete)="onComplete()">
            </app-habit-card-retro-gaming>
          </div>
        </div>

        <!-- Design 9: Nature Organic -->
        <div class="tab-panel" [class.active]="activeTab() === 8">
          <div class="design-info">
            <h3>Nature Organic Design</h3>
            <p>Earthy, natural flowing style with plant metaphors and organic shapes</p>
          </div>
          <div class="card-showcase">
            <app-habit-card-nature-organic
              [habit]="sampleHabit"
              [state]="pendingState"
              [weeklyConsistency]="weeklyConsistency1"
              [metrics]="{ streak: 12, totalDays: 45, consistency: 78 }"
              (complete)="onComplete()">
            </app-habit-card-nature-organic>
            
            <app-habit-card-nature-organic
              [habit]="completedHabit"
              [state]="doneState"
              [weeklyConsistency]="weeklyConsistency2"
              [metrics]="{ streak: 8, totalDays: 32, consistency: 85 }"
              (complete)="onComplete()">
            </app-habit-card-nature-organic>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .demo-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .demo-header h1 {
      font-size: 32px;
      font-weight: 800;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .demo-header p {
      font-size: 16px;
      color: #64748b;
      margin: 0;
    }

    .tab-nav {
      display: flex;
      background: white;
      border-radius: 12px;
      padding: 4px;
      margin-bottom: 32px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tab-button {
      flex: 1;
      padding: 12px 16px;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-button.active {
      background: #6366f1;
      color: white;
      box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
    }

    .tab-button:hover:not(.active) {
      background: #f1f5f9;
      color: #475569;
    }

    .tab-content {
      position: relative;
    }

    .tab-panel {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .tab-panel.active {
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .design-info {
      text-align: center;
      margin-bottom: 32px;
      padding: 24px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .design-info h3 {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
    }

    .design-info p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }

    .card-showcase {
      display: grid;
      gap: 24px;
      grid-template-columns: 1fr;
    }

    @media (min-width: 768px) {
      .demo-container {
        padding: 40px;
      }

      .demo-header h1 {
        font-size: 40px;
      }

      .demo-header p {
        font-size: 18px;
      }

      .tab-button {
        padding: 16px 24px;
        font-size: 16px;
      }

      .card-showcase {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class HabitCardDemoComponent {
  activeTab = signal(0);
  
  currentDate = new Date();
  pendingState = 'pending' as const;
  doneState = 'done' as const;
  
  weeklyConsistency1 = { completed: 4, total: 7 };
  weeklyConsistency2 = { completed: 6, total: 7 };
  
  metrics1 = { streak: 12, totalDays: 45, consistency: 78, skipCount: 8, totalLoggedDays: 53 };
  metrics2 = { streak: 8, totalDays: 32, consistency: 85, skipCount: 5, totalLoggedDays: 37 };

  tabs = [
    { name: 'Glass Morphism', id: 'design1' },
    { name: 'Bold Gradient', id: 'design2' },
    { name: 'iOS Clean', id: 'design3' },
    { name: 'Neon Glow', id: 'neon-glow' },
    { name: 'Neumorphism', id: 'neumorphism' },
    { name: 'Brutalist', id: 'brutalist' },
    { name: 'Minimalist', id: 'minimalist' },
    { name: 'Retro Gaming', id: 'retro-gaming' },
    { name: 'Nature Organic', id: 'nature-organic' }
  ];

  sampleHabit: Habit = {
    id: '1',
    name: 'Read for 20 minutes',
    identity: 'Reader',
    trigger: {
      when: 'After breakfast',
      where: 'Living room couch'
    },
    time: '08:30',
    cue: 'Book on coffee table',
    reward: 'Feel accomplished and knowledgeable',
    twoMinuteRule: 'Just read one paragraph',
    frequency: 'daily',
    color: '#6366f1',
    createdAt: new Date()
  };

  completedHabit: Habit = {
    id: '2',
    name: 'Morning meditation',
    identity: 'Mindful person',
    trigger: {
      when: 'Right after waking up',
      where: 'Bedroom'
    },
    time: '06:00',
    cue: 'Meditation app notification',
    reward: 'Feel calm and centered',
    twoMinuteRule: 'Just sit for 2 minutes',
    frequency: 'daily',
    color: '#10b981',
    createdAt: new Date()
  };

  onComplete() {
    console.log('Habit completed!');
  }
}