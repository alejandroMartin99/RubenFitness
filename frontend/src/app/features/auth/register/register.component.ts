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
    // Google OAuth needs to be configured in Supabase first
    alert('Google Sign Up will be available after configuring OAuth in Supabase. Please follow the guide in GOOGLE_OAUTH_SETUP.md');
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
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);
        
        // Show specific error message
        let errorMessage = 'Error al registrar. Por favor intenta de nuevo.';
        if (err.error?.detail) {
          errorMessage = err.error.detail;
        }
        alert(errorMessage);
      }
    });
  }
}
