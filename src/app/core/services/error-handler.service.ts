import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    // Ignore Firebase Auth UI and extension errors
    const msg = error?.message || error?.toString() || '';
    if (msg.includes('MDL') || 
        msg.includes('handler.js') || 
        msg.includes('spoofer.js') ||
        msg.includes('cross-origin') ||
        msg.includes('Cross-Origin-Opener-Policy') ||
        msg.includes('window.closed')) {
      return;
    }
    
    // Log to console in development
    console.error('Global error:', error);
    
    // In production, you would send to error tracking service
    // Example: Sentry, LogRocket, etc.
    
    // Show user-friendly message
    if (error.message) {
      // You can show a toast/snackbar here
      console.warn('An error occurred. Please try again.');
    }
  }
}
