import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TrendDataPoint {
  label: string;
  value: number;
}

export interface HabitTrend {
  habitName: string;
  color: string;
  data: TrendDataPoint[];
}

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="legend" *ngIf="habitTrends.length">
        <div *ngFor="let trend of habitTrends" class="legend-item">
          <span class="legend-dot" [style.background]="trend.color"></span>
          <span class="legend-text">{{ trend.habitName }}</span>
        </div>
      </div>
      <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="chart">
        <!-- Grid lines -->
        <line *ngFor="let y of gridLines" 
              [attr.x1]="padding" 
              [attr.y1]="y" 
              [attr.x2]="width - padding" 
              [attr.y2]="y" 
              class="grid-line"/>
        
        <!-- Multiple habit lines -->
        <g *ngFor="let trend of habitTrends">
          <polyline [attr.points]="getLinePoints(trend.data)" 
                    class="trend-line" 
                    [style.stroke]="trend.color"/>
          <circle *ngFor="let point of getPoints(trend.data)" 
                  [attr.cx]="point.x" 
                  [attr.cy]="point.y" 
                  r="3" 
                  class="data-point"
                  [style.fill]="trend.color"/>
        </g>
        
        <!-- Labels -->
        <text *ngFor="let label of labels" 
              [attr.x]="label.x" 
              [attr.y]="height - 5" 
              class="label">{{ label.text }}</text>
      </svg>
    </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 16px;
      padding: 1rem;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .legend-text {
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 600;
    }

    .chart {
      width: 100%;
      height: auto;
    }

    .grid-line {
      stroke: #e5e7eb;
      stroke-width: 1;
    }

    .trend-line {
      fill: none;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.9;
    }

    .data-point {
      stroke: #fff;
      stroke-width: 2;
    }

    .label {
      fill: #6b7280;
      font-size: 10px;
      text-anchor: middle;
      font-weight: 600;
    }
  `]
})
export class TrendChartComponent {
  @Input() habitTrends: HabitTrend[] = [];
  
  width = 400;
  height = 200;
  padding = 40;

  get chartHeight() { return this.height - this.padding * 2; }
  get chartWidth() { return this.width - this.padding * 2; }

  get gridLines() {
    return [0, 0.25, 0.5, 0.75, 1].map(ratio => 
      this.padding + this.chartHeight * ratio
    );
  }

  getPoints(data: TrendDataPoint[]) {
    if (!data.length) return [];
    const step = this.chartWidth / (data.length - 1 || 1);
    
    return data.map((d, i) => ({
      x: this.padding + i * step,
      y: this.padding + this.chartHeight - (d.value / 100) * this.chartHeight
    }));
  }

  getLinePoints(data: TrendDataPoint[]) {
    return this.getPoints(data).map(p => `${p.x},${p.y}`).join(' ');
  }

  get labels() {
    if (!this.habitTrends.length || !this.habitTrends[0].data.length) return [];
    const data = this.habitTrends[0].data;
    const step = this.chartWidth / (data.length - 1 || 1);
    return data.map((d, i) => ({
      x: this.padding + i * step,
      text: d.label
    }));
  }
}
