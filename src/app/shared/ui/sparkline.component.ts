import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" class="sparkline">
      <polyline [attr.points]="linePoints" [style.stroke]="color"/>
    </svg>
  `,
  styles: [`
    .sparkline {
      width: 100%;
      height: 100%;
    }
    polyline {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `]
})
export class SparklineComponent {
  @Input() data: number[] = [];
  @Input() color = '#8b5cf6';
  
  width = 100;
  height = 30;

  get linePoints() {
    if (!this.data.length) return '';
    const step = this.width / (this.data.length - 1 || 1);
    return this.data.map((val, i) => 
      `${i * step},${this.height - (val / 100) * this.height}`
    ).join(' ');
  }
}
