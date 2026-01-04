import { Routes } from '@angular/router';
import { DailyViewComponent } from './features/daily-view/daily-view.component';
import { HabitCreationComponent } from './features/habit-creation/habit-creation.component';
import { MetricsComponent } from './features/metrics/metrics.component';
import { ReviewComponent } from './features/reviews/review.component';
import { IdentityDashboardComponent } from './features/identity-dashboard/identity-dashboard.component';
import { CalendarComponent } from './features/calendar/calendar.component';
import { TipsComponent } from './features/tips/tips.component';
import { EnvironmentComponent } from './features/environment/environment.component';
import { ReportComponent } from './features/reports/report.component';
import { WeeklyReflectionComponent } from './features/weekly-reflection/weekly-reflection.component';
import { LoginComponent } from './features/login/login.component';
import { inject } from '@angular/core';
import { FirebaseService } from './core/services/firebase.service';
import { Router } from '@angular/router';

const authGuard = () => {
  const firebase = inject(FirebaseService);
  const router = inject(Router);
  if (!firebase.currentUser()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DailyViewComponent, canActivate: [authGuard] },
  { path: 'create', component: HabitCreationComponent, canActivate: [authGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [authGuard] },
  { path: 'metrics', component: MetricsComponent, canActivate: [authGuard] },
  { path: 'review', component: ReviewComponent, canActivate: [authGuard] },
  { path: 'identity', component: IdentityDashboardComponent, canActivate: [authGuard] },
  { path: 'tips', component: TipsComponent, canActivate: [authGuard] },
  { path: 'environment', component: EnvironmentComponent, canActivate: [authGuard] },
  { path: 'report', component: ReportComponent, canActivate: [authGuard] },
  { path: 'reflection', component: WeeklyReflectionComponent, canActivate: [authGuard] }
];
