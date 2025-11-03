/**
 * Main Application Component
 * Root component that contains the application shell
 */

import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { ProfileService } from './core/services/profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Rubén Fitness';
  @ViewChild('appSidenav') appSidenav!: MatSidenav;
  
  constructor(
    public authService: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  /**
   * Handle user logout
   */
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get profilePhoto(): string | null {
    return this.profileService.getProfile()?.photoUrl || null;
  }
}


