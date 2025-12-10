/**
 * Role Guard
 * Protects routes that require specific user roles
 * Simplified synchronous check
 */

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ 
  providedIn: 'root' 
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // First check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Then check roles
    const requiredRoles: string[] = route.data?.['roles'] || [];
    
    if (requiredRoles.length === 0) {
      // No roles required, just authenticated
      return true;
    }

    if (this.authService.hasRole(requiredRoles)) {
      return true;
    }

    // Not authorized - redirect to dashboard
    this.router.navigate(['/dashboard']);
    return false;
  }
}
