import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    // Handle OAuth callback from Supabase
    this.handleAuthCallback();
  }

  private async handleAuthCallback(): Promise<void> {
    try {
      // Get the URL hash fragments (Supabase OAuth returns data in hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        alert(`Authentication failed: ${error}`);
        this.router.navigate(['/auth/login']);
        return;
      }

      // Wait a bit for Supabase to process the session
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the session from Supabase
      const { data: { session }, error: sessionError } = await this.supabaseService.getClient().auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        this.router.navigate(['/auth/login']);
        return;
      }

      if (session?.user) {
        // Load user profile to check if setup is needed
        const userId = session.user.id;
        
        // Check if user profile exists
        const { data: profile, error: profileError } = await this.supabaseService.getClient()
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        // If profile doesn't exist, create a basic one
        if (profileError && profileError.code === 'PGRST116') {
          const { error: createError } = await this.supabaseService.getClient()
            .from('users')
            .insert({
              id: userId,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.['full_name'] || session.user.user_metadata?.['name'],
              role: 'user',
              fitness_level: 'beginner'
            });

          if (createError) {
            console.error('Error creating user profile:', createError);
          }
        }

        // Small delay to ensure everything is processed
        await new Promise(resolve => setTimeout(resolve, 300));

        // Redirect directly to dashboard
        this.router.navigate(['/dashboard']);
      } else {
        // No session, redirect to login
        this.router.navigate(['/auth/login']);
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      this.router.navigate(['/auth/login']);
    }
  }
}

