/**
 * Home Redirect Guard
 * Redirects users to appropriate home page based on their role
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HomeRedirectGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Redirect based on role
    if (this.authService.isAdmin()) {
      this.router.navigate(['/coach']);
    } else {
      this.router.navigate(['/dashboard']);
    }
    
    return false; // Always return false since we're redirecting
  }
}

