import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="callback-container">
      <mat-spinner></mat-spinner>
      <p>Completing authentication...</p>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 1rem;
      background: #000;
      color: #fff;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.handleAuthCallback();
  }

  private async handleAuthCallback(): Promise<void> {
    try {
      // Wait for Supabase to process the OAuth callback
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the session from Supabase
      const { data: { session }, error: sessionError } = await this.supabaseService.getClient().auth.getSession();

      if (sessionError || !session?.user) {
        console.error('Session error:', sessionError);
        this.router.navigate(['/auth/login']);
        return;
      }

      const userId = session.user.id;
      const accessToken = session.access_token;

      // Load user profile through AuthService (it will handle creation if needed)
      // We need to manually trigger the load since the auth state change might not fire immediately
      const { data: profile, error: profileError } = await this.supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      let userRole = 'user';
      if (profile) {
        userRole = profile.role || (profile.email === 'admin@ruben.fitness' ? 'admin' : 'user');
      } else if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const email = session.user.email || '';
        userRole = email === 'admin@ruben.fitness' ? 'admin' : 'user';
        
        const { error: createError } = await this.supabaseService.getClient()
          .from('users')
          .insert({
            id: userId,
            email: email,
            full_name: session.user.user_metadata?.['full_name'] || session.user.user_metadata?.['name'] || '',
            role: userRole,
            fitness_level: 'beginner'
          });

        if (createError) {
          console.error('Error creating user profile:', createError);
        }
      }

      // Store token
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }

      // Wait a bit for everything to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      // Redirect based on role
      const target = userRole === 'admin' ? '/coach' : '/dashboard';
      this.router.navigate([target]);
    } catch (error) {
      console.error('Auth callback error:', error);
      this.router.navigate(['/auth/login']);
    }
  }
}
