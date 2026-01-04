import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/ui/card.component';

@Component({
  selector: 'app-tips',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="tips-view">
      <header>
        <h1>Atomic Habits Principles</h1>
        <p class="subtitle">Build better habits with proven strategies</p>
      </header>

      <app-card *ngFor="let tip of tips">
        <div class="tip">
          <div class="tip-icon">{{ tip.icon }}</div>
          <div class="tip-content">
            <h3>{{ tip.title }}</h3>
            <p>{{ tip.description }}</p>
            <div class="tip-example">
              <strong>Example:</strong> {{ tip.example }}
            </div>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: [`
    .tips-view {
      max-width: 700px;
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

    app-card {
      display: block;
      margin-bottom: 16px;
    }

    .tip {
      display: flex;
      gap: 16px;
    }

    .tip-icon {
      font-size: 32px;
      flex-shrink: 0;
    }

    .tip-content h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .tip-content p {
      font-size: 15px;
      color: #4b5563;
      line-height: 1.6;
      margin: 0 0 12px 0;
    }

    .tip-example {
      font-size: 14px;
      color: #6b7280;
      background: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #6366f1;
    }

    .tip-example strong {
      color: #374151;
    }
  `]
})
export class TipsComponent {
  tips = [
    {
      icon: '⚡',
      title: 'The 2-Minute Rule',
      description: 'When starting a new habit, it should take less than 2 minutes. Make it so easy you can\'t say no.',
      example: 'Instead of "Read 30 pages," start with "Read 1 page." You can always do more, but the goal is to show up.'
    },
    {
      icon: '🔗',
      title: 'Habit Stacking',
      description: 'Link your new habit to an existing one. Use the formula: "After I [current habit], I will [new habit]."',
      example: 'After I pour my morning coffee, I will write one sentence in my journal.'
    },
    {
      icon: '👤',
      title: 'Identity-Based Habits',
      description: 'Focus on who you want to become, not what you want to achieve. Every action is a vote for your identity.',
      example: 'Don\'t say "I want to run a marathon." Say "I am a runner" and act accordingly.'
    },
    {
      icon: '🎯',
      title: 'Make It Obvious',
      description: 'Design your environment to make good habits obvious. Use visual cues and implementation intentions.',
      example: 'Put your workout clothes next to your bed so you see them first thing in the morning.'
    },
    {
      icon: '✨',
      title: 'Make It Attractive',
      description: 'Pair habits you need to do with habits you want to do. Bundle temptation with action.',
      example: 'Only listen to your favorite podcast while exercising.'
    },
    {
      icon: '🚀',
      title: 'Make It Easy',
      description: 'Reduce friction for good habits. Increase friction for bad habits. Optimize your environment.',
      example: 'Prep your gym bag the night before. Put your phone in another room to avoid distractions.'
    },
    {
      icon: '🎁',
      title: 'Make It Satisfying',
      description: 'What is immediately rewarded is repeated. Give yourself an immediate reward after completing a habit.',
      example: 'After meditating, check off your habit and say "I showed up today." Feel the satisfaction.'
    },
    {
      icon: '📊',
      title: 'Never Miss Twice',
      description: 'Missing once is an accident. Missing twice is the start of a new habit. Get back on track quickly.',
      example: 'If you miss your morning workout, do a 5-minute walk at lunch. Keep the identity alive.'
    }
  ];
}
