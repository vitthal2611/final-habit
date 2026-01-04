import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './core/services/firebase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app">
      <div *ngIf="firebase.authLoading()" class="loading-screen">
        <div class="spinner-large"></div>
        <p>Loading...</p>
      </div>

      <nav class="nav" *ngIf="firebase.currentUser() && !firebase.authLoading()">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          Today
        </a>
        <a routerLink="/calendar" routerLinkActive="active">
          Calendar
        </a>
        <a routerLink="/report" routerLinkActive="active">
          Report
        </a>
        <a routerLink="/reflection" routerLinkActive="active">
          Reflection
        </a>
        <a routerLink="/identity" routerLinkActive="active">
          Identity
        </a>
        <a routerLink="/tips" routerLinkActive="active">
          💡 Tips
        </a>
        <a routerLink="/create" routerLinkActive="active" class="create-btn">
          + New
        </a>
        <button class="logout-btn" (click)="signOut()">
          Logout
        </button>
      </nav>

      <main class="main" *ngIf="!firebase.authLoading()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      background: #f9fafb;
    }

    .loading-screen {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-screen p {
      color: #6b7280;
      font-size: 16px;
    }

    .nav {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 16px 20px;
      display: flex;
      gap: 24px;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav a {
      text-decoration: none;
      color: #6b7280;
      font-size: 15px;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .nav a:hover {
      color: #111827;
      background: #f3f4f6;
    }

    .nav a.active {
      color: #6366f1;
      background: #eef2ff;
    }

    .create-btn {
      margin-left: auto;
      background: #6366f1 !important;
      color: white !important;
    }

    .create-btn:hover {
      background: #4f46e5 !important;
    }

    .logout-btn {
      margin-left: auto;
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }

    .logout-btn:hover {
      background: #dc2626;
    }

    .main {
      padding-bottom: 40px;
    }

    @media (max-width: 640px) {
      .nav {
        gap: 12px;
        overflow-x: auto;
      }

      .nav a {
        font-size: 14px;
        white-space: nowrap;
      }
    }
  `]
})
export class AppComponent {
  constructor(
    public firebase: FirebaseService,
    private router: Router
  ) {}

  async signOut() {
    await this.firebase.signOut();
    this.router.navigate(['/login']);
  }
}
