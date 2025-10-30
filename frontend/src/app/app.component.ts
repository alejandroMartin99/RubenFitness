/**
 * Main Application Component
 * Root component that contains the application shell
 */

import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Rubén Fitness';
  
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


