import { Injectable, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  updateAvailable = signal(false);
  
  constructor(private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      this.checkForUpdates();
    }
  }

  private checkForUpdates(): void {
    // Check for updates every 6 hours
    setInterval(() => {
      this.swUpdate.checkForUpdate();
    }, 6 * 60 * 60 * 1000);

    // Listen for available updates
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.updateAvailable.set(true);
      });
  }

  async applyUpdate(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      await this.swUpdate.activateUpdate();
      document.location.reload();
    }
  }

  dismissUpdate(): void {
    this.updateAvailable.set(false);
  }
}