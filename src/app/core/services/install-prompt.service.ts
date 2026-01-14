import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InstallPromptService {
  private deferredPrompt: any = null;
  canInstall = signal(false);
  isInstalled = signal(false);

  constructor() {
    this.checkIfInstalled();
    this.setupInstallPrompt();
  }

  private checkIfInstalled(): void {
    // Check if app is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    this.isInstalled.set(isStandalone || isIOSStandalone);
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      this.canInstall.set(false);
      this.deferredPrompt = null;
    });
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      this.canInstall.set(false);
      this.deferredPrompt = null;
      return true;
    }
    
    return false;
  }

  getIOSInstallInstructions(): string {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      return 'To install this app on your iOS device, tap the Share button and then "Add to Home Screen".';
    }
    return '';
  }
}