import { Routes } from '@angular/router';
import { WeeklyDashboardComponent } from './features/weekly-dashboard/weekly-dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { inject } from '@angular/core';
import { FirebaseService } from './core/services/firebase.service';
import { Router } from '@angular/router';

const authGuard = async () => {
  const firebase = inject(FirebaseService);
  const router = inject(Router);
  
  while (firebase.authLoading()) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  if (!firebase.currentUser()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: WeeklyDashboardComponent, canActivate: [authGuard] }
];
