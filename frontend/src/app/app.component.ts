/**
 * Main Application Component
 * Root component that contains the application shell
 */

import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

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
    private router: Router
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
}


