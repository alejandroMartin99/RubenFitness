import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = 'demo@ruben.fitness';
  password = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.email && this.password) {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => console.error('Login error:', err)
      });
    }
  }

  onGoogleSignIn(): void {
    console.log('Google sign-in clicked');
    // Integración futura: OAuth Google
  }

  onAppleSignIn(): void {
    console.log('Apple sign-in clicked');
    // Integración futura: Sign in with Apple
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}


