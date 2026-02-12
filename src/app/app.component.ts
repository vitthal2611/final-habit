import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './core/services/firebase.service';
import { InstallButtonComponent } from './shared/components/install-button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, InstallButtonComponent],
  template: `
    <div class="app">
      <div *ngIf="firebase.authLoading()" class="loading-screen">
        <div class="spinner-large"></div>
        <p>Loading...</p>
      </div>

      <nav class="nav" *ngIf="firebase.currentUser() && !firebase.authLoading()">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          Dashboard
        </a>
        <button class="logout-btn" (click)="signOut()">
          Logout
        </button>
      </nav>



      <main class="main" *ngIf="!firebase.authLoading()">
        <router-outlet></router-outlet>
      </main>

      <app-install-button></app-install-button>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(139, 92, 246, 0.2);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .nav a {
      text-decoration: none;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .logout-btn {
      padding: 8px 16px;
      background: transparent;
      color: #8b5cf6;
      border: 2px solid #8b5cf6;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: #8b5cf6;
      color: #fff;
    }



    .main {
      padding-bottom: 40px;
    }

    @media (min-width: 768px) {
      .nav {
        padding: 20px 32px;
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
