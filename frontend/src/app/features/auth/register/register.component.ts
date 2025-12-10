import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email = '';
  password = '';
  fullName = '';
  age: number | null = null;
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
   * Handle Google Sign Up
   */
  onGoogleSignUp(): void {
    this.loading = true;
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        // OAuth redirects, so we don't navigate here
        // The callback component will handle navigation
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Google sign-up error:', err);
        alert('Google Sign Up failed. Please try again.');
      }
    });
  }

  /**
   * Handle Apple Sign Up
   */
  onAppleSignUp(): void {
    this.loading = true;
    this.authService.loginWithApple().subscribe({
      next: () => {
        // OAuth redirects, so we don't navigate here
        // The callback component will handle navigation
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Apple sign-up error:', err);
        alert('Apple Sign Up failed. Please try again.');
      }
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (!this.email || !this.password) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    this.loading = true;

    this.authService.register({
      email: this.email,
      password: this.password,
      fullName: this.fullName || undefined,
      age: this.age || undefined
    }).subscribe({
      next: (user) => {
        this.loading = false;
        // Redirect directly to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        
        // Show specific error message
        let errorMessage = 'Error al registrar. Por favor intenta de nuevo.';
        if (err.message) {
          errorMessage = err.message;
        }
        alert(errorMessage);
      }
    });
  }
}
