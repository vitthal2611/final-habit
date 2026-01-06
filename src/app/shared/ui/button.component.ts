import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="'btn ' + variant"
      [disabled]="disabled"
      [type]="type">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 48px;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    .primary {
      background: #6366f1;
      color: white;
    }

    .primary:active:not(:disabled) {
      transform: scale(0.97);
      background: #4f46e5;
    }

    .secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .secondary:active:not(:disabled) {
      transform: scale(0.97);
      background: #e5e7eb;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (min-width: 768px) {
      .btn {
        font-size: 16px;
        min-height: auto;
      }

      .primary:hover:not(:disabled) {
        background: #4f46e5;
      }

      .secondary:hover:not(:disabled) {
        background: #e5e7eb;
      }
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';
}
