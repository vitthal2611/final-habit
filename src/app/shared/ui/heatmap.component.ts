import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HeatmapDay {
  date: string;
  value: number;
  label: string;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="heatmap">
      <div class="heatmap-grid">
        <div *ngFor="let day of days" 
             class="heatmap-cell"
             [class.level-0]="day.value === 0"
             [class.level-1]="day.value > 0 && day.value <= 25"
             [class.level-2]="day.value > 25 && day.value <= 50"
             [class.level-3]="day.value > 50 && day.value <= 75"
             [class.level-4]="day.value > 75"
             [title]="day.label + ': ' + day.value + '%'">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .heatmap {
      background: rgba(255, 255, 255, 0.98);
      border-radius: 16px;
      padding: 1rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .heatmap-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .heatmap-cell {
      aspect-ratio: 1;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .level-0 { background: #f3f4f6; }
    .level-1 { background: #ddd6fe; }
    .level-2 { background: #c4b5fd; }
    .level-3 { background: #a78bfa; }
    .level-4 { background: #8b5cf6; }

    .heatmap-cell:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class HeatmapComponent {
  @Input() days: HeatmapDay[] = [];
}
