import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo">✨</div>
        <h1>Atomic Habits Tracker</h1>
        <p class="subtitle">Build better habits, one day at a time</p>
        
        <button class="google-btn" (click)="signIn()" [disabled]="loading">
          <svg *ngIf="!loading" width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          <span *ngIf="loading" class="spinner"></span>
          {{ loading ? 'Signing in...' : 'Sign in with Google' }}
        </button>
        
        <p *ngIf="error" class="error">{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 48px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 400px;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .logo {
      font-size: 48px;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 16px;
      color: #6b7280;
      margin: 0 0 32px 0;
    }

    .google-btn {
      width: 100%;
      padding: 14px 24px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .google-btn:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #d1d5db;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .google-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error {
      margin-top: 16px;
      padding: 12px;
      background: #fee;
      color: #c00;
      border-radius: 8px;
      font-size: 14px;
    }
  `]
})
export class LoginComponent {
  loading = false;
  error = '';

  constructor(
    private firebase: FirebaseService,
    private router: Router
  ) {}

  async signIn() {
    this.loading = true;
    this.error = '';
    try {
      await this.firebase.signInWithGoogle();
      this.router.navigate(['/']);
    } catch (error: any) {
      this.error = error.message || 'Failed to sign in. Please try again.';
      this.loading = false;
    }
  }
}
