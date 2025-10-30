/**
 * Role Guard
 * Protects routes that require specific user roles
 */

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const roles: string[] = route.data?.['roles'] || [];

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (roles.length === 0 || this.authService.hasRole(roles)) {
      return true;
    }

    // Not authorized - redirect to dashboard
    this.router.navigate(['/dashboard']);
    return false;
  }
}


