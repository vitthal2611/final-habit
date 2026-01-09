import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="show" (click)="onCancel()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="title">{{ title }}</div>
        <div class="message">{{ message }}</div>
        <div class="actions">
          <button class="btn cancel" (click)="onCancel()">Cancel</button>
          <button class="btn confirm" (click)="onConfirm()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal {
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin: 20px;
      max-width: 320px;
      width: 100%;
    }
    .title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .message {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 20px;
    }
    .actions {
      display: flex;
      gap: 12px;
    }
    .btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      min-height: 44px;
    }
    .cancel {
      background: #f3f4f6;
      color: #374151;
    }
    .confirm {
      background: #ef4444;
      color: white;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() show = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}