import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = 'tester@ruben.fitness';
  password = '';
  showPassword = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Toggle password visibility
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handle Google Sign In
   */
  onGoogleSignIn(): void {
    this.loading = true;
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        // OAuth redirects, so we don't navigate here
        // The callback component will handle navigation
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Google sign-in error:', err);
        alert('Google Sign In failed. Please try again.');
      }
    });
  }

  /**
   * Handle Apple Sign In
   */
  onAppleSignIn(): void {
    this.loading = true;
    this.authService.loginWithApple().subscribe({
      next: () => {
        // OAuth redirects, so we don't navigate here
        // The callback component will handle navigation
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Apple sign-in error:', err);
        alert('Apple Sign In failed. Please try again.');
      }
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (!this.email || !this.password) {
      alert('Please enter email and password');
      return;
    }

    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (user) => {
        this.loading = false;
        // Redirect directly to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error:', err);
        
        // Show specific error message
        let errorMessage = 'Credenciales inválidas. Por favor intenta de nuevo.';
        if (err.message) {
          errorMessage = err.message;
        }
        alert(errorMessage);
      }
    });
  }
}
