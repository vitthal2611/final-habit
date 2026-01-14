import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallPromptService } from '../../core/services/install-prompt.service';
import { UpdateService } from '../../core/services/update.service';

@Component({
  selector: 'app-install-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="install-container">
      <!-- Install Button -->
      <button 
        *ngIf="installService.canInstall() && !installService.isInstalled()"
        (click)="install()"
        class="install-btn">
        📱 Install App
      </button>

      <!-- iOS Instructions -->
      <div *ngIf="iosInstructions" class="ios-instructions">
        <p>{{ iosInstructions }}</p>
      </div>

      <!-- Update Available -->
      <button 
        *ngIf="updateService.updateAvailable()"
        (click)="applyUpdate()"
        class="update-btn">
        🔄 Update Available
      </button>
    </div>
  `,
  styles: [`
    .install-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .install-btn, .update-btn {
      background: #6366f1;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      transition: all 0.2s ease;
      margin-bottom: 10px;
      display: block;
      width: 100%;
    }

    .install-btn:hover, .update-btn:hover {
      background: #5855eb;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }

    .update-btn {
      background: #10b981;
    }

    .update-btn:hover {
      background: #059669;
    }

    .ios-instructions {
      background: #f3f4f6;
      padding: 12px;
      border-radius: 8px;
      font-size: 12px;
      color: #374151;
      margin-top: 10px;
      max-width: 250px;
    }

    @media (display-mode: standalone) {
      .install-container {
        display: none;
      }
    }
  `]
})
export class InstallButtonComponent {
  installService = inject(InstallPromptService);
  updateService = inject(UpdateService);
  
  iosInstructions = this.installService.getIOSInstallInstructions();

  async install() {
    await this.installService.promptInstall();
  }

  async applyUpdate() {
    await this.updateService.applyUpdate();
  }
}