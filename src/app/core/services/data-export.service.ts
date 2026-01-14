import { Injectable } from '@angular/core';
import { HabitService } from './habit.service';

@Injectable({
  providedIn: 'root'
})
export class DataExportService {

  constructor(private habitService: HabitService) {}

  exportAllData() {
    const data = {
      habits: this.habitService.allHabits(),
      logs: this.habitService.allLogs(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `habits-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}