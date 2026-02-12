import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BarData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar-chart">
      <div *ngFor="let item of data" class="bar-item">
        <div class="bar-label">{{ item.label }}</div>
        <div class="bar-container">
          <div class="bar-fill" 
               [style.width.%]="item.value"
               [style.background]="item.color">
          </div>
          <span class="bar-value">{{ item.value }}%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bar-chart {
      background: rgba(255, 255, 255, 0.98);
      border-radius: 16px;
      padding: 1rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .bar-item {
      margin-bottom: 0.75rem;
    }

    .bar-item:last-child {
      margin-bottom: 0;
    }

    .bar-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .bar-container {
      position: relative;
      height: 28px;
      background: #f3f4f6;
      border-radius: 8px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      transition: width 0.5s ease;
      border-radius: 8px;
    }

    .bar-value {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      font-weight: 700;
      color: #1f2937;
    }
  `]
})
export class BarChartComponent {
  @Input() data: BarData[] = [];
}
