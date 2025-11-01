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
    // Google OAuth needs to be configured in Supabase first
    alert('Google Sign In will be available after configuring OAuth in Supabase. Please follow the guide in GOOGLE_OAUTH_SETUP.md');
    // Uncomment when Google OAuth is configured:
    // this.loading = true;
    // this.authService.loginWithGoogle().subscribe({
    //   next: () => {
    //     this.loading = false;
    //     this.router.navigate(['/dashboard']);
    //   },
    //   error: (err) => {
    //     this.loading = false;
    //     console.error('Google sign-in error:', err);
    //     alert('Google Sign In failed. Please try again.');
    //   }
    // });
  }

  /**
   * Handle Apple Sign In (placeholder)
   */
  onAppleSignIn(): void {
    alert('Apple Sign In will be available soon!');
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
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error:', err);
        
        // Show specific error message from backend
        let errorMessage = 'Credenciales inválidas. Por favor intenta de nuevo.';
        if (err.error?.detail) {
          errorMessage = err.error.detail;
        }
        alert(errorMessage);
      }
    });
  }
}
