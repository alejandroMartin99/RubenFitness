/**
 * User Only Guard
 * Prevents admin users from accessing user-only routes
 */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserOnlyGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // If admin, redirect to coach panel
    if (this.authService.isAdmin()) {
      this.router.navigate(['/coach']);
      return false;
    }
    
    return true;
  }
}

