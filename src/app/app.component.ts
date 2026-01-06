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

      <button class="quick-habit-btn" *ngIf="firebase.currentUser() && !firebase.authLoading()" routerLink="/create">
        +
      </button>

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
      padding: 12px 16px;
      display: flex;
      gap: 8px;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .nav::-webkit-scrollbar {
      display: none;
    }

    .nav a {
      text-decoration: none;
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }

    .nav a:active {
      transform: scale(0.95);
    }

    .nav a:hover {
      color: #111827;
      background: #f3f4f6;
    }

    .nav a.active {
      color: #6366f1;
      background: #eef2ff;
      font-weight: 600;
    }

    .create-btn {
      margin-left: auto;
      background: #6366f1 !important;
      color: white !important;
      font-weight: 600 !important;
    }

    .create-btn:hover {
      background: #4f46e5 !important;
    }

    .logout-btn {
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }

    .logout-btn:active {
      transform: scale(0.95);
    }

    .logout-btn:hover {
      background: #dc2626;
    }

    .quick-habit-btn {
      position: fixed;
      bottom: 20px;
      bottom: calc(20px + env(safe-area-inset-bottom));
      right: 20px;
      width: 56px;
      height: 56px;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 28px;
      font-weight: 300;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      transition: all 0.2s;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: transparent;
    }

    .quick-habit-btn:active {
      transform: scale(0.9);
    }

    .quick-habit-btn:hover {
      background: #4f46e5;
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
    }

    .main {
      padding-bottom: 80px;
      padding-bottom: calc(80px + env(safe-area-inset-bottom));
    }

    @media (min-width: 768px) {
      .nav {
        padding: 16px 24px;
        gap: 16px;
      }

      .nav a {
        font-size: 15px;
        padding: 8px 16px;
      }

      .create-btn {
        margin-left: auto;
      }

      .logout-btn {
        margin-left: 0;
      }

      .quick-habit-btn {
        bottom: 24px;
        right: 24px;
      }

      .main {
        padding-bottom: 40px;
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
