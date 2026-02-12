import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../core/services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="logo">✨</div>
        <h1>Atomic Habits Tracker</h1>
        <p class="subtitle">Build better habits, one day at a time</p>
        
        <form (ngSubmit)="isSignUp ? signUp() : signIn()">
          <input 
            type="email" 
            [(ngModel)]="email" 
            name="email"
            placeholder="Email" 
            required
            [disabled]="loading"
          >
          <input 
            type="password" 
            [(ngModel)]="password" 
            name="password"
            placeholder="Password" 
            required
            [disabled]="loading"
          >
          
          <button type="submit" [disabled]="loading || !email || !password">
            <span *ngIf="loading" class="spinner"></span>
            {{ loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In') }}
          </button>
        </form>
        
        <button class="toggle-btn" (click)="isSignUp = !isSignUp" [disabled]="loading">
          {{ isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up' }}
        </button>
        
        <p *ngIf="error" class="error">{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      padding: 40px 24px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 400px;
      width: 100%;
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
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .subtitle {
      font-size: 15px;
      color: #6b7280;
      margin: 0 0 32px 0;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    input {
      width: 100%;
      padding: 14px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 15px;
      transition: border-color 0.2s;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    button[type="submit"] {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 52px;
    }

    button[type="submit"]:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .toggle-btn {
      width: 100%;
      padding: 12px;
      background: transparent;
      border: none;
      color: #667eea;
      font-size: 14px;
      cursor: pointer;
      text-decoration: underline;
    }

    .toggle-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
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
  email = '';
  password = '';
  isSignUp = false;
  loading = this.firebase.authLoading();
  error = '';

  constructor(
    public firebase: FirebaseService,
    private router: Router
  ) {
    effect(() => {
      const user = this.firebase.currentUser();
      const isLoading = this.firebase.authLoading();
      
      this.loading = isLoading;
      
      if (!isLoading && user) {
        this.router.navigate(['/']);
      }
    });

    effect(() => {
      const error = this.firebase.authError();
      if (error) {
        this.error = error;
        this.loading = false;
      }
    });
  }

  async signIn() {
    this.error = '';
    try {
      await this.firebase.signIn(this.email, this.password);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }

  async signUp() {
    this.error = '';
    try {
      await this.firebase.signUp(this.email, this.password);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  }
}
