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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.email && this.password) {
      this.authService.register({
        email: this.email,
        password: this.password,
        fullName: this.fullName || undefined,
        age: this.age || undefined
      }).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => console.error('Registration error:', err)
      });
    }
  }
}


