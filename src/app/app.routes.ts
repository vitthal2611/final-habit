import { Routes } from '@angular/router';
import { WeeklyDashboardComponent } from './features/weekly-dashboard/weekly-dashboard.component';
import { LoginComponent } from './features/login/login.component';
import { inject } from '@angular/core';
import { FirebaseService } from './core/services/firebase.service';
import { Router } from '@angular/router';

const authGuard = () => {
  const firebase = inject(FirebaseService);
  const router = inject(Router);
  
  return new Promise<boolean>((resolve) => {
    const checkAuth = () => {
      if (!firebase.authLoading()) {
        if (firebase.currentUser()) {
          resolve(true);
        } else {
          router.navigate(['/login']);
          resolve(false);
        }
      } else {
        setTimeout(checkAuth, 50);
      }
    };
    checkAuth();
  });
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: WeeklyDashboardComponent, canActivate: [authGuard] }
];
